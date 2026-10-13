import 'server-only';
import { randomBytes, randomUUID } from 'node:crypto';
import { and, eq, gt, like } from 'drizzle-orm';
import { protokolliere } from '@/lib/audit';
import { auth } from '@/lib/auth/server';
import { db, schema, type Transaktion } from '@/lib/db';
import { sha256 } from '@/lib/krypto';
import { planeKontoMail } from '@/lib/mail/ausgang';
import { basisUrl } from '@/lib/seo/metadaten';
import { pruefeRate, type Grenze } from '@/lib/validierung/ratenbegrenzung';
import { pfadFuer } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { anzeigenameAus, istKinderAdresse } from './regeln';

/**
 * Selbstregistrierung von Gemeindemitgliedern (ADR 0026, AUFTRAG 2.2) mit E-Mail-Bestätigung.
 *
 * Eigener Bestätigungs-Token statt Better-Auth-`emailVerification`: einmal verwendbar (Better Auth nutzt
 * zustandslose JWT, die bis zum Ablauf mehrfach gelten), nur als SHA-256 gespeichert, und bestätigt wird erst mit einem
 * Klick auf „Bestätigen“ (POST über die Server Action) – Link-Vorschauen von Mailprogrammen lösen nichts aus.
 * Gespeichert in der Better-Auth-Tabelle `verification` unter eigenem Präfix.
 *
 * Keine Kontenaufzählung: Die Action antwortet immer gleich und ruft diese Funktion erst nach der Antwort (`after`) auf.
 * Gibt es die Adresse schon (bestätigt), bekommt sie den Hinweis „Konto vorhanden“; ihr Passwort wird nie geändert.
 *
 * Schutz gegen Vorbelegung fremder Adressen (H-2 der Sicherheitsprüfung S1): Ein **unbestätigtes** Konto ohne Rolle
 * wird bei erneuter Registrierung vollständig ersetzt (Sitzungen, Zugangsdaten, Zwei-Faktor, Passkeys fallen weg), und
 * die Bestätigung verlangt das bei der Registrierung gewählte Passwort – wer nur die Mail hat, schaltet kein fremdes
 * Passwort frei. Bei der Bestätigung enden alle Sitzungen; Zwei-Faktor und Passkeys aus der Zeit davor werden verworfen.
 */
const PRAEFIX = 'konto-bestaetigen:';
const GUELTIG_MS = 48 * 60 * 60 * 1000;
/** Mails an dieselbe Adresse je Tag (Schutz vor Mail-Bombing über das Formular). */
const MAIL_GRENZE: Grenze = { max: 3, fensterSekunden: 86_400 };

export type Registrierung = {
  name: string;
  email: string;
  passwort: string;
  sprache: Locale;
  /** Textversion der Datenschutz-Einwilligung (`textVersion(...)`). */
  einwilligung: string;
};

async function mailErlaubt(email: string): Promise<boolean> {
  return (await pruefeRate('konto-mail', email.trim().toLowerCase(), MAIL_GRENZE)).erlaubt;
}

/** Neuer Bestätigungs-Token (alte desselben Kontos verfallen). Rückgabe: Token im Klartext (nur für den Link). */
async function neuerToken(benutzerId: string, tx: Pick<Transaktion, 'insert' | 'delete'>): Promise<string> {
  const token = randomBytes(32).toString('base64url');
  await tx
    .delete(schema.verification)
    .where(and(like(schema.verification.identifier, `${PRAEFIX}%`), eq(schema.verification.value, benutzerId)));
  await tx.insert(schema.verification).values({
    id: randomUUID(),
    identifier: `${PRAEFIX}${sha256(token)}`,
    value: benutzerId,
    expiresAt: new Date(Date.now() + GUELTIG_MS),
  });
  return token;
}

function bestaetigungsLink(token: string, sprache: Locale): string {
  return `${basisUrl()}${pfadFuer({ pathname: '/konto/bestaetigen', query: { token } }, sprache)}`;
}

/** Legt das Konto an (oder schreibt der vorhandenen Adresse) – nach der Antwort der Action aufrufen. */
export async function legeRegistrierungAn(r: Registrierung): Promise<'angelegt' | 'erneut' | 'vorhanden' | 'begrenzt'> {
  const email = r.email.trim().toLowerCase();
  const [vorhanden] = await db
    .select({ id: schema.user.id, emailVerified: schema.user.emailVerified })
    .from(schema.user)
    .where(eq(schema.user.email, email))
    .limit(1);
  if (istKinderAdresse(email)) return 'begrenzt';
  let erneut = false;
  if (vorhanden) {
    if (!(await mailErlaubt(email))) return 'begrenzt';
    if (!vorhanden.emailVerified && (await ohneRollen(vorhanden.id))) {
      // Unbestätigt und ohne Rolle: das alte Konto samt allem, was daran hängt, verwerfen und neu anlegen
      await db.transaction(async (tx) => {
        await tx
          .delete(schema.verification)
          .where(and(like(schema.verification.identifier, `${PRAEFIX}%`), eq(schema.verification.value, vorhanden.id)));
        await tx.delete(schema.user).where(eq(schema.user.id, vorhanden.id));
      });
      erneut = true;
    } else if (!vorhanden.emailVerified) {
      return 'vorhanden';
    }
  }
  if (vorhanden && !erneut) {
    await planeKontoMail({
      an: email,
      vorlage: 'konto-vorhanden',
      sprache: r.sprache,
      daten: { link: `${basisUrl()}${pfadFuer('/passwort-vergessen', r.sprache)}` },
    });
    return 'vorhanden';
  }
  if (!erneut && !(await mailErlaubt(email))) return 'begrenzt';
  // Serverseitig ohne Request: der Registrierungs-Riegel (Hook) greift nur bei HTTP-Aufrufen; kein Auto-Login
  const angelegt = await auth.api.signUpEmail({ body: { email, password: r.passwort, name: r.name.trim() } });
  const benutzerId = angelegt.user.id;
  await db.transaction(async (tx) => {
    await tx
      .insert(schema.kontoProfil)
      .values({ benutzerId, anzeigename: anzeigenameAus(r.name), sprache: r.sprache })
      .onConflictDoNothing();
    await tx.insert(schema.kontoEinwilligung).values({
      benutzerId,
      art: 'konto',
      textVersion: r.einwilligung,
      sprache: r.sprache,
      erteiltVon: benutzerId,
    });
    const token = await neuerToken(benutzerId, tx);
    await planeKontoMail(
      { an: email, vorlage: 'konto-bestaetigen', sprache: r.sprache, daten: { link: bestaetigungsLink(token, r.sprache) } },
      tx,
    );
    await protokolliere({ benutzerId, aktion: 'konto.registriert', zielTyp: 'benutzer', zielId: benutzerId }, tx);
  });
  return erneut ? 'erneut' : 'angelegt';
}

/** Hat das Konto keine Gemeinde- und keine Verwaltungsrolle? (Nur solche unbestätigten Konten dürfen ersetzt werden.) */
async function ohneRollen(benutzerId: string): Promise<boolean> {
  const [g, v] = await Promise.all([
    db.select({ r: schema.gemeindeRolle.rolle }).from(schema.gemeindeRolle).where(eq(schema.gemeindeRolle.benutzerId, benutzerId)).limit(1),
    db
      .select({ r: schema.rolleZuweisung.rolle })
      .from(schema.rolleZuweisung)
      .where(eq(schema.rolleZuweisung.benutzerId, benutzerId))
      .limit(1),
  ]);
  return g.length === 0 && v.length === 0;
}

/** Stimmt das Passwort mit dem bei der Registrierung gewählten überein? */
async function passwortPasst(benutzerId: string, passwort: string): Promise<boolean> {
  const [konto] = await db
    .select({ hash: schema.account.password })
    .from(schema.account)
    .where(and(eq(schema.account.userId, benutzerId), eq(schema.account.providerId, 'credential')))
    .limit(1);
  if (!konto?.hash || !passwort) return false;
  return (await auth.$context).password.verify({ hash: konto.hash, password: passwort });
}

/**
 * Bestätigt die Adresse mit dem Token aus der Mail (einmal verwendbar) und dem bei der Registrierung gewählten
 * Passwort, vergibt die Kontoart `gemeinde`, beendet alle Sitzungen und verwirft Zwei-Faktor und Passkeys von vorher.
 * Rückgabe: Konto-ID, 'passwort' (Passwort falsch, Token bleibt gültig) oder null (unbekannt, abgelaufen, verwendet).
 */
export async function bestaetigeKonto(token: string, passwort: string): Promise<string | 'passwort' | null> {
  if (!/^[A-Za-z0-9_-]{20,100}$/.test(token)) return null;
  const [offen] = await db
    .select({ benutzerId: schema.verification.value })
    .from(schema.verification)
    .where(and(eq(schema.verification.identifier, `${PRAEFIX}${sha256(token)}`), gt(schema.verification.expiresAt, new Date())))
    .limit(1);
  if (!offen) return null;
  if (!(await passwortPasst(offen.benutzerId, passwort))) return 'passwort';
  return db.transaction(async (tx) => {
    const [eintrag] = await tx
      .delete(schema.verification)
      .where(and(eq(schema.verification.identifier, `${PRAEFIX}${sha256(token)}`), gt(schema.verification.expiresAt, new Date())))
      .returning({ benutzerId: schema.verification.value });
    if (!eintrag) return null;
    const [u] = await tx
      .update(schema.user)
      .set({ emailVerified: true })
      .where(eq(schema.user.id, eintrag.benutzerId))
      .returning({ id: schema.user.id, name: schema.user.name });
    if (!u) return null;
    // Was vor der Bestätigung entstand, gilt nicht weiter (Sitzungen, Zwei-Faktor, Passkeys)
    await tx.delete(schema.session).where(eq(schema.session.userId, u.id));
    await tx.delete(schema.twoFactor).where(eq(schema.twoFactor.userId, u.id));
    await tx.delete(schema.passkey).where(eq(schema.passkey.userId, u.id));
    await tx.update(schema.user).set({ twoFactorEnabled: false }).where(eq(schema.user.id, u.id));
    await tx.insert(schema.gemeindeRolle).values({ benutzerId: u.id, rolle: 'gemeinde', erstelltVon: 'selbst' }).onConflictDoNothing();
    await tx
      .insert(schema.kontoProfil)
      .values({ benutzerId: u.id, anzeigename: anzeigenameAus(u.name) })
      .onConflictDoNothing();
    await protokolliere({ benutzerId: u.id, aktion: 'konto.bestaetigt', zielTyp: 'benutzer', zielId: u.id }, tx);
    return u.id;
  });
}
