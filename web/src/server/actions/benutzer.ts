'use server';

import { and, eq, like } from 'drizzle-orm';
import { refresh } from 'next/cache';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { after } from 'next/server';
import { z } from 'zod';
import { protokolliere } from '@/lib/audit';
import { auth } from '@/lib/auth/server';
import { db, schema } from '@/lib/db';
import { datumLang, uhrzeit } from '@/lib/i18n/format';
import { sha256, verschluessele, zufallsToken } from '@/lib/krypto';
import { versendeOffeneMails } from '@/lib/mail/ausgang';
import { mitAdministrationsSchutz } from '@/lib/rechte/administration';
import { KeinRecht, verlangeRecht, type Angemeldet } from '@/lib/rechte/pruefe';
import { basisUrl } from '@/lib/seo/metadaten';
import { clientAdresse } from '@/lib/sicherheit/ip';
import { alsZuweisungen, einladungSchema, passwortSchema, rollenSchema } from '@/lib/validierung/benutzer';
import { pruefeRate } from '@/lib/validierung/ratenbegrenzung';
import { emailBelegt, ladeBenutzer, zaehleAdministration } from '@/server/queries/verwaltung/benutzer';

/**
 * Verwaltung „Benutzer und Rollen“ und „Mein Konto“ (C12, K-06, G-07). Reihenfolge je Action: Recht mit 2FA →
 * Eingabe prüfen → Schutzregeln (nie das eigene Konto aussperren, nie die letzte Administration entfernen – vorab für
 * die Rückmeldung, verbindlich in der Transaktion über `mitAdministrationsSchutz`) → Speichern mit Audit (ohne
 * Personendaten in den Details). Konten entstehen nur per Einladung.
 */
export type BenutzerZustand = {
  fehler?: string;
  feldFehler?: Record<string, string>;
  werte?: Record<string, string | string[]>;
  /** Einladungslink – nur in dieser Antwort, gespeichert wird nur der Hash */
  link?: string;
  ersatzcodes?: string[];
  ok?: boolean;
};

function feldFehler(fehler: z.ZodError): Record<string, string> {
  const f: Record<string, string> = {};
  for (const i of fehler.issues) {
    const feld = String(i.path[0] ?? 'formular');
    f[feld] ??= i.message;
  }
  return f;
}

const listeAus = (fd: FormData, name: string) => fd.getAll(name).map(String);

/** Person einladen: Einladung mit gehashtem Token, Mail über den Mail-Ausgang, Link einmalig für die einladende Person. */
export async function einladen(_vorher: BenutzerZustand, fd: FormData): Promise<BenutzerZustand> {
  const a = await verlangeRecht('benutzer.einladen');
  const roh = {
    email: String(fd.get('email') ?? ''),
    name: String(fd.get('name') ?? ''),
    gueltigTage: fd.get('gueltigTage') ?? undefined,
    rollen: listeAus(fd, 'rollen'),
    organisationen: listeAus(fd, 'organisationen'),
  };
  const werte = {
    email: roh.email,
    name: roh.name,
    gueltigTage: String(roh.gueltigTage ?? ''),
    rollen: roh.rollen,
    organisationen: roh.organisationen,
  };
  const p = einladungSchema.safeParse(roh);
  if (!p.success) return { fehler: 'pruefen', feldFehler: feldFehler(p.error), werte };
  const belegt = await emailBelegt(p.data.email);
  if (belegt) return { fehler: 'pruefen', feldFehler: { email: belegt === 'konto' ? 'emailKonto' : 'emailEingeladen' }, werte };
  const token = zufallsToken();
  const laeuftAb = new Date(Date.now() + p.data.gueltigTage * 24 * 3_600_000);
  const link = `${basisUrl()}/verwaltung/einladung/${token}`;
  const mail = verschluessele({
    an: p.data.email,
    daten: { name: p.data.name, link, gueltigBis: `${datumLang(laeuftAb, 'de')}, ${uhrzeit(laeuftAb, 'de')}` },
  });
  await db.transaction(async (tx) => {
    const [e] = await tx
      .insert(schema.einladung)
      .values({
        email: p.data.email,
        name: p.data.name,
        rollen: alsZuweisungen(p.data).map((z) => (z.organisation ? { rolle: z.rolle, organisation: z.organisation } : { rolle: z.rolle })),
        tokenHash: sha256(token),
        laeuftAb,
        erstelltVon: a.benutzerId,
      })
      .returning({ id: schema.einladung.id });
    await tx
      .insert(schema.mailAusgang)
      .values({ vorlage: 'einladung', sprache: 'de', datenVerschluesselt: mail.daten, schluesselId: mail.schluesselId });
    await protokolliere(
      {
        benutzerId: a.benutzerId,
        aktion: 'einladung.erstellt',
        zielTyp: 'einladung',
        zielId: e.id,
        details: { rollen: alsZuweisungen(p.data).length },
      },
      tx,
    );
  });
  after(() => versendeOffeneMails());
  refresh();
  return { ok: true, link };
}

export async function einladungWiderrufen(fd: FormData): Promise<void> {
  const a = await verlangeRecht('benutzer.einladen');
  const id = z.uuid().safeParse(fd.get('id'));
  if (!id.success) throw new KeinRecht();
  const [e] = await db
    .update(schema.einladung)
    .set({ widerrufenAm: new Date() })
    .where(eq(schema.einladung.id, id.data))
    .returning({ id: schema.einladung.id });
  if (e) await protokolliere({ benutzerId: a.benutzerId, aktion: 'einladung.widerrufen', zielTyp: 'einladung', zielId: e.id });
  redirect('/verwaltung/benutzer?meldung=widerrufen');
}

/** Ziel-Konto laden und Schutzregeln prüfen (Fehler als Schlüssel, nie das eigene Konto). */
async function zielKonto(fd: FormData, a: Angemeldet) {
  const id = String(fd.get('id') ?? '');
  const konto = await ladeBenutzer(id);
  if (!konto) throw new KeinRecht();
  return { konto, selbst: konto.id === a.benutzerId };
}
const istAdministration = (rollen: { rolle: string }[]) => rollen.some((r) => r.rolle === 'administration');

export async function rollenSpeichern(_vorher: BenutzerZustand, fd: FormData): Promise<BenutzerZustand> {
  const a = await verlangeRecht('benutzer.bearbeiten');
  const { konto, selbst } = await zielKonto(fd, a);
  const roh = { rollen: listeAus(fd, 'rollen'), organisationen: listeAus(fd, 'organisationen') };
  const p = rollenSchema.safeParse(roh);
  if (!p.success) return { fehler: 'pruefen', feldFehler: feldFehler(p.error), werte: roh };
  const neu = alsZuweisungen(p.data);
  if (istAdministration(konto.rollen) && !istAdministration(neu)) {
    if (selbst) return { fehler: 'eigeneAdministration', werte: roh };
    if ((await zaehleAdministration(konto.id)) === 0) return { fehler: 'letzteAdministration', werte: roh };
  }
  const gespeichert = await mitAdministrationsSchutz(async (tx) => {
    await tx.delete(schema.rolleZuweisung).where(eq(schema.rolleZuweisung.benutzerId, konto.id));
    await tx
      .insert(schema.rolleZuweisung)
      .values(neu.map((z) => ({ benutzerId: konto.id, rolle: z.rolle, organisation: z.organisation ?? null, erstelltVon: a.benutzerId })));
    await protokolliere(
      {
        benutzerId: a.benutzerId,
        aktion: 'benutzer.rollen_geaendert',
        zielTyp: 'benutzer',
        zielId: konto.id,
        details: {
          vorher: konto.rollen.map((r) => (r.organisation ? `${r.rolle}:${r.organisation}` : r.rolle)).join(','),
          nachher: neu.map((r) => (r.organisation ? `${r.rolle}:${r.organisation}` : r.rolle)).join(','),
        },
      },
      tx,
    );
  });
  if (!gespeichert) return { fehler: 'letzteAdministration', werte: roh };
  refresh();
  return { ok: true };
}

/** Konto sperren (C12): Sitzungen enden sofort, Anmeldung wird verweigert; nicht das eigene, nicht die letzte Administration. */
export async function kontoSperren(fd: FormData): Promise<void> {
  const a = await verlangeRecht('benutzer.bearbeiten');
  const { konto, selbst } = await zielKonto(fd, a);
  if (selbst) redirect(`/verwaltung/benutzer/${konto.id}?fehler=selbst`);
  if (istAdministration(konto.rollen) && (await zaehleAdministration(konto.id)) === 0)
    redirect(`/verwaltung/benutzer/${konto.id}?fehler=letzteAdministration`);
  const gesperrt = await mitAdministrationsSchutz(async (tx) => {
    await tx.update(schema.user).set({ gesperrtAm: new Date() }).where(eq(schema.user.id, konto.id));
    await tx.delete(schema.session).where(eq(schema.session.userId, konto.id));
    // Offene Passwort-Links verfallen mit der Sperre (Tor B/C N6) – sonst gälten sie nach dem Entsperren weiter
    await tx
      .delete(schema.verification)
      .where(and(like(schema.verification.identifier, 'reset-password:%'), eq(schema.verification.value, konto.id)));
    await protokolliere({ benutzerId: a.benutzerId, aktion: 'benutzer.gesperrt', zielTyp: 'benutzer', zielId: konto.id }, tx);
  });
  if (!gesperrt) redirect(`/verwaltung/benutzer/${konto.id}?fehler=letzteAdministration`);
  redirect(`/verwaltung/benutzer/${konto.id}?meldung=gesperrt`);
}

export async function kontoEntsperren(fd: FormData): Promise<void> {
  const a = await verlangeRecht('benutzer.bearbeiten');
  const { konto } = await zielKonto(fd, a);
  await db.transaction(async (tx) => {
    await tx.update(schema.user).set({ gesperrtAm: null }).where(eq(schema.user.id, konto.id));
    await protokolliere({ benutzerId: a.benutzerId, aktion: 'benutzer.entsperrt', zielTyp: 'benutzer', zielId: konto.id }, tx);
  });
  redirect(`/verwaltung/benutzer/${konto.id}?meldung=entsperrt`);
}

/** Zwei-Faktor zurücksetzen (z. B. Gerät verloren): TOTP und Ersatzcodes weg, alle Sitzungen beendet → Neueinrichtung beim nächsten Anmelden. */
export async function zweiFaktorZuruecksetzen(fd: FormData): Promise<void> {
  const a = await verlangeRecht('benutzer.bearbeiten');
  const { konto, selbst } = await zielKonto(fd, a);
  if (selbst) redirect(`/verwaltung/benutzer/${konto.id}?fehler=selbst`);
  await db.transaction(async (tx) => {
    await tx.delete(schema.twoFactor).where(eq(schema.twoFactor.userId, konto.id));
    await tx.delete(schema.passkey).where(eq(schema.passkey.userId, konto.id));
    await tx.update(schema.user).set({ twoFactorEnabled: false }).where(eq(schema.user.id, konto.id));
    await tx.delete(schema.session).where(eq(schema.session.userId, konto.id));
    await protokolliere(
      { benutzerId: a.benutzerId, aktion: 'benutzer.zwei_faktor_zurueckgesetzt', zielTyp: 'benutzer', zielId: konto.id },
      tx,
    );
  });
  redirect(`/verwaltung/benutzer/${konto.id}?meldung=zweiFaktor`);
}

/** Konto endgültig löschen (K-05, G-07): Konto, Sitzungen, Anmeldedaten, Zwei-Faktor, Passkeys und Rollen (Kaskade). */
export async function kontoLoeschen(fd: FormData): Promise<void> {
  const a = await verlangeRecht('benutzer.bearbeiten');
  const { konto, selbst } = await zielKonto(fd, a);
  if (selbst) redirect(`/verwaltung/benutzer/${konto.id}?fehler=selbst`);
  if (istAdministration(konto.rollen) && (await zaehleAdministration(konto.id)) === 0)
    redirect(`/verwaltung/benutzer/${konto.id}?fehler=letzteAdministration`);
  const geloescht = await mitAdministrationsSchutz(async (tx) => {
    await tx.delete(schema.user).where(eq(schema.user.id, konto.id));
    await protokolliere({ benutzerId: a.benutzerId, aktion: 'benutzer.geloescht', zielTyp: 'benutzer', zielId: konto.id }, tx);
  });
  if (!geloescht) redirect(`/verwaltung/benutzer/${konto.id}?fehler=letzteAdministration`);
  redirect('/verwaltung/benutzer?meldung=geloescht');
}

/** Mein Konto: Passwort ändern (aktuelles Passwort nötig, andere Sitzungen enden). */
export async function passwortAendern(_vorher: BenutzerZustand, fd: FormData): Promise<BenutzerZustand> {
  const a = await verlangeRecht('verwaltung.betreten');
  const p = passwortSchema.safeParse({
    aktuell: fd.get('aktuell') ?? '',
    neu: fd.get('neu') ?? '',
    wiederholung: fd.get('wiederholung') ?? '',
  });
  if (!p.success) return { fehler: 'pruefen', feldFehler: feldFehler(p.error) };
  const h = await headers();
  if (!(await pruefeRate('verwaltung-passwort', `${clientAdresse(h)}:${a.benutzerId}`, { max: 5, fensterSekunden: 600 })).erlaubt)
    return { fehler: 'zuViele' };
  try {
    await auth.api.changePassword({
      body: { currentPassword: p.data.aktuell, newPassword: p.data.neu, revokeOtherSessions: true },
      headers: h,
    });
  } catch {
    return { fehler: 'pruefen', feldFehler: { aktuell: 'passwortFalsch' } };
  }
  await protokolliere({ benutzerId: a.benutzerId, aktion: 'konto.passwort_geaendert' });
  // Better Auth ersetzt dabei die Sitzung (neues Cookie in dieser Antwort): Ein Neurendern mit dem alten Cookie würde zur
  // Anmeldung führen – daher ausdrücklich zur Kontoseite weiterleiten (Meldung über den Suchparameter)
  redirect('/verwaltung/konto?passwort=geaendert');
}

/** Mein Konto: neue Ersatzcodes (alte werden ungültig); nur einmal angezeigt. */
export async function ersatzcodesErzeugen(_vorher: BenutzerZustand, fd: FormData): Promise<BenutzerZustand> {
  const a = await verlangeRecht('verwaltung.betreten');
  const passwort = z.string().min(1).max(128).safeParse(fd.get('passwort'));
  if (!passwort.success) return { fehler: 'pruefen', feldFehler: { passwort: 'pflicht' } };
  const h = await headers();
  if (!(await pruefeRate('verwaltung-ersatzcodes', `${clientAdresse(h)}:${a.benutzerId}`, { max: 5, fensterSekunden: 600 })).erlaubt)
    return { fehler: 'zuViele' };
  try {
    const r = await auth.api.generateBackupCodes({ body: { password: passwort.data }, headers: h });
    await protokolliere({ benutzerId: a.benutzerId, aktion: 'konto.ersatzcodes_erzeugt' });
    return { ok: true, ersatzcodes: r.backupCodes };
  } catch {
    return { fehler: 'pruefen', feldFehler: { passwort: 'passwortFalsch' } };
  }
}
