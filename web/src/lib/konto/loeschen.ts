import 'server-only';
import { and, eq, inArray, isNotNull, isNull, like, lt, lte, notExists, or, sql } from 'drizzle-orm';
import { protokolliere } from '@/lib/audit';
import { protokolliereModeration } from '@/lib/chat/dienst';
import { db, schema } from '@/lib/db';
import { verschluessele } from '@/lib/krypto';
import { beendeLernappDerEltern, folgenNachBezugsende } from '@/lib/lernapp/schreiben/folgen';
import { UNBESTAETIGT_TAGE } from '@/lib/lernen/verwaltung';
import { KINDER_DOMAIN } from './regeln';

/**
 * Vollständiges Löschen eines Gemeinde-Kontos (Art. 17 DSGVO, H-L05, S-18): Sitzungen, Anmeldedaten, Zwei-Faktor,
 * Passkeys, Profil, Kontoarten, Einwilligungen, Push-Abos, Eltern-Kind- und Leitungsbezüge (Kaskade über `user`),
 * offene Einladungen an die Adresse und Bestätigungs-/Passwort-Links. Chat-Nachrichten bleiben nur als „entfernt“
 * (Chiffrat überschrieben wie beim Entfernen im Chat-Dienst, ein Eintrag im Moderationsprotokoll ohne Inhalte).
 * Der Lerndatensatz eines Kinderkontos bleibt (er gehört zur Aufnahme, nicht zum Konto); nur die Verknüpfung entfällt.
 *
 * Konten mit Verwaltungsrollen löscht nur „Benutzer und Rollen“ (Schutz der letzten Administration) – hier nie.
 */
export type LoeschAnlass = 'verwaltung' | 'frist' | 'unbestaetigt' | 'inaktiv' | 'einwilligung';
export type LoeschErgebnis = { ok: true; nachrichten: number } | { ok: false; fehler: 'nichtGefunden' | 'verwaltungskonto' };

const KONTO_LOESCH_GRUND = 'Konto gelöscht';

export async function loescheGemeindeKonto(
  benutzerId: string,
  o: { akteurId: string | null; anlass: LoeschAnlass },
): Promise<LoeschErgebnis> {
  // Eltern-Kind-Bezüge enden mit dem Elternkonto: Folgen für die Lern-App der Kinder nach dem Speichern (SL2-Rest)
  let lernapp: string[] = [];
  const ergebnis = await db.transaction(async (tx): Promise<LoeschErgebnis> => {
    const [u] = await tx.select({ id: schema.user.id, email: schema.user.email }).from(schema.user).where(eq(schema.user.id, benutzerId));
    if (!u) return { ok: false, fehler: 'nichtGefunden' } as const;
    const [verwaltung] = await tx
      .select({ id: schema.rolleZuweisung.id })
      .from(schema.rolleZuweisung)
      .where(eq(schema.rolleZuweisung.benutzerId, benutzerId))
      .limit(1);
    if (verwaltung) return { ok: false, fehler: 'verwaltungskonto' } as const;

    // Chat: Nachrichten bleiben als Platzhalter, ohne Text (S-09/S-16); Absender entfällt mit dem Konto (set null)
    const leer = verschluessele('');
    const entfernt = await tx
      .update(schema.chatNachricht)
      .set({
        entferntAm: new Date(),
        entferntVon: o.akteurId ?? 'system',
        entferntGrund: KONTO_LOESCH_GRUND,
        textVerschluesselt: leer.daten,
        schluesselId: leer.schluesselId,
      })
      .where(and(eq(schema.chatNachricht.absenderId, benutzerId), isNull(schema.chatNachricht.entferntAm)))
      .returning({ id: schema.chatNachricht.id });
    if (entfernt.length)
      await protokolliereModeration(tx, {
        kanalId: null,
        nachrichtId: null,
        akteurId: o.akteurId,
        aktion: 'entfernt',
        grund: `${KONTO_LOESCH_GRUND} (${entfernt.length})`,
      });

    // Ausdrücklich (auch wenn die Kaskade es täte): Push-Abos, Sitzungen und eigene Einwilligungen sofort weg
    await tx.delete(schema.pushAbo).where(eq(schema.pushAbo.benutzerId, benutzerId));
    await tx.delete(schema.session).where(eq(schema.session.userId, benutzerId));
    // D-14: Einwilligungen für einen Lerndatensatz (etwa die eigene ab 16) bleiben als Nachweis am Datensatz – ohne
    // Kontobezug und als beendet; sie folgen der Frist der Lernenden. Alle übrigen Einwilligungen des Kontos gehen.
    await tx
      .update(schema.kontoEinwilligung)
      .set({ benutzerId: null, widerrufenAm: sql`coalesce(${schema.kontoEinwilligung.widerrufenAm}, now())` })
      .where(and(eq(schema.kontoEinwilligung.benutzerId, benutzerId), isNotNull(schema.kontoEinwilligung.lernendeId)));
    await tx.delete(schema.kontoEinwilligung).where(eq(schema.kontoEinwilligung.benutzerId, benutzerId));
    // Einladungen an die Adresse (Name, E-Mail) und Links (Bestätigung, Passwort) des Kontos
    await tx.delete(schema.einladung).where(sql`lower(${schema.einladung.email}) = ${u.email.toLowerCase()}`);
    // Einwilligung `lernapp`, die dieses Konto als Elternteil für Kinder gegeben hat: endet mit dem Bezug
    lernapp = await beendeLernappDerEltern(tx, benutzerId);
    await tx.delete(schema.verification).where(eq(schema.verification.value, benutzerId));
    // Konto (Kaskade: account, two_factor, passkey, gemeinde_rolle, konto_profil, eltern_kind, gruppen_leitung, chat_*)
    await tx.delete(schema.user).where(eq(schema.user.id, benutzerId));
    await protokolliere(
      {
        benutzerId: o.akteurId,
        aktion: 'gemeindekonto.geloescht',
        zielTyp: 'benutzer',
        zielId: benutzerId,
        details: { anlass: o.anlass, nachrichten: entfernt.length },
      },
      tx,
    );
    return { ok: true, nachrichten: entfernt.length } as const;
  });
  if (ergebnis.ok && lernapp.length) await folgenNachBezugsende(lernapp, o.akteurId);
  return ergebnis;
}

/** Ohne Verwaltungsrollen (Bedingung für die automatischen Löschungen). */
const ohneVerwaltungsrolle = () =>
  notExists(
    db.select({ id: schema.rolleZuweisung.id }).from(schema.rolleZuweisung).where(eq(schema.rolleZuweisung.benutzerId, schema.user.id)),
  );

/**
 * Löschanträge nach Ablauf der Frist (Cron `loeschfristen`): Gemeinde-Konten mit `konto_profil.loeschen_ab` in der
 * Vergangenheit. Konten mit Verwaltungsrollen bleiben stehen (Ticket aus dem Antrag, Handarbeit in „Benutzer“).
 */
export async function loescheFaelligeKonten(jetzt = new Date()): Promise<number> {
  const faellig = await db
    .select({ id: schema.kontoProfil.benutzerId })
    .from(schema.kontoProfil)
    .innerJoin(schema.user, eq(schema.user.id, schema.kontoProfil.benutzerId))
    .where(and(isNotNull(schema.kontoProfil.loeschenAb), lte(schema.kontoProfil.loeschenAb, jetzt), ohneVerwaltungsrolle()));
  let n = 0;
  for (const f of faellig) if ((await loescheGemeindeKonto(f.id, { akteurId: null, anlass: 'frist' })).ok) n++;
  return n;
}

/**
 * Unbestätigte Registrierungen nach 7 Tagen löschen (Datensparsamkeit): Adresse nie bestätigt, keine Kontoart, keine
 * Verwaltungsrolle. Kinderkonten (Benutzername, `…@konto.invalid`) sind nie „unbestätigt“ in diesem Sinn und bleiben.
 */
export async function loescheUnbestaetigteKonten(jetzt = new Date()): Promise<number> {
  const grenze = new Date(jetzt.getTime() - UNBESTAETIGT_TAGE * 86_400_000);
  const u = schema.user;
  const kandidaten = await db
    .select({ id: u.id })
    .from(u)
    .where(
      and(
        eq(u.emailVerified, false),
        lt(u.createdAt, grenze),
        isNull(u.username),
        sql`not (${like(u.email, `%@${KINDER_DOMAIN}`)})`,
        ohneVerwaltungsrolle(),
        notExists(db.select({ id: schema.gemeindeRolle.id }).from(schema.gemeindeRolle).where(eq(schema.gemeindeRolle.benutzerId, u.id))),
        notExists(db.select({ id: schema.lernende.id }).from(schema.lernende).where(eq(schema.lernende.benutzerId, u.id))),
      ),
    );
  let n = 0;
  for (const k of kandidaten) if ((await loescheGemeindeKonto(k.id, { akteurId: null, anlass: 'unbestaetigt' })).ok) n++;
  return n;
}

/** Teil des täglichen Löschlaufs (`/api/wartung/loeschfristen`): Löschanträge nach Frist und unbestätigte Registrierungen. */
export async function kontenLoeschlauf(jetzt = new Date()): Promise<{ geloeschteKonten: number; geloeschteUnbestaetigteKonten: number }> {
  const geloeschteKonten = await loescheFaelligeKonten(jetzt);
  const geloeschteUnbestaetigteKonten = await loescheUnbestaetigteKonten(jetzt);
  return { geloeschteKonten, geloeschteUnbestaetigteKonten };
}

/** Sitzungen eines Kontos beenden (S-18) – in der Transaktion des Aufrufers. */
export async function beendeSitzungen(tx: Pick<typeof db, 'delete'>, benutzerIds: readonly string[]): Promise<void> {
  if (!benutzerIds.length) return;
  await tx.delete(schema.session).where(inArray(schema.session.userId, [...benutzerIds]));
  // Offene Passwort-Links verfallen mit der Sperre (wie in „Benutzer und Rollen“, Tor B/C N6)
  await tx
    .delete(schema.verification)
    .where(
      and(like(schema.verification.identifier, 'reset-password:%'), or(...benutzerIds.map((id) => eq(schema.verification.value, id)))),
    );
}
