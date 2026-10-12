import 'server-only';
import { and, eq, inArray, isNotNull, lt, lte, or, sql } from 'drizzle-orm';
import { protokolliere } from '@/lib/audit';
import { db, schema } from '@/lib/db';
import { loescheMitVarianten } from '@/lib/storage';
import { raeumeDirektEingaengeAuf } from '@/lib/medien/eingang';
import { raeumeAltchaAuf } from '@/lib/validierung/altcha';
import { raeumeRatenAuf } from '@/lib/validierung/ratenbegrenzung';
import { verwendungVon } from '@/server/queries/verwaltung/medien';

/**
 * Löschlauf (C16, G-07, ADR 0005): löscht Eingänge, deren Frist (`loeschen_ab`) erreicht ist – echt, mit
 * Einwilligungen und Notizen (Kaskade) und Mail-Ausgang; je Eingang ein Audit-Eintrag `eingang.frist_geloescht`
 * (nur Art, keine Personendaten). Räumt außerdem versendete Mails nach 30 Tagen, verbrauchte ALTCHA-Lösungen und alte
 * Ratenfenster auf, leert den Papierkorb der Inhalte nach 30 Tagen (K-05) und entfernt Melderdaten geschlossener
 * Tickets nach 180 Tagen (E-037). Aufruf täglich per Cron über
 * `POST /api/wartung/loeschfristen` (BETRIEB.md 4).
 */
export const MAIL_AUFBEWAHRUNG_TAGE = 30;
export const PAPIERKORB_TAGE = 30;

/** Medien im Papierkorb nach 30 Tagen: Datei und Eintrag löschen – nur, wenn nirgends mehr verwendet (ADR 0007). */
async function leereMedienPapierkorb(jetzt: Date): Promise<number> {
  const grenze = new Date(jetzt.getTime() - PAPIERKORB_TAGE * 86_400_000);
  const m = schema.medium;
  const faellig = await db.select({ id: m.id, schluessel: m.schluessel, typ: m.typ }).from(m).where(lt(m.imPapierkorbSeit, grenze));
  let n = 0;
  for (const z of faellig) {
    if ((await verwendungVon(z.id)).length) continue;
    await db.transaction(async (tx) => {
      await tx.delete(m).where(eq(m.id, z.id));
      await protokolliere(
        { benutzerId: null, aktion: 'medium.geloescht', zielTyp: 'medium', zielId: z.id, details: { typ: z.typ, papierkorb: true } },
        tx,
      );
    });
    await loescheMitVarianten(z.schluessel);
    n++;
  }
  return n;
}

export const MELDER_FRIST_TAGE = 180;

/** Meldungen (E-037): Angaben der meldenden Person 180 Tage nach dem Abschluss (gelöst/geschlossen) entfernen; das Ticket bleibt. */
async function entferneMelderdaten(jetzt: Date): Promise<number> {
  const grenze = new Date(jetzt.getTime() - MELDER_FRIST_TAGE * 86_400_000);
  const t = schema.ticket;
  return db.transaction(async (tx) => {
    const geaendert = await tx
      .update(t)
      .set({ melderVerschluesselt: null, schluesselId: null })
      .where(and(inArray(t.status, ['geloest', 'geschlossen']), isNotNull(t.melderVerschluesselt), lt(t.geschlossenAm, grenze)))
      .returning({ id: t.id });
    for (const z of geaendert)
      await protokolliere(
        { benutzerId: null, aktion: 'ticket.geaendert', zielTyp: 'ticket', zielId: z.id, details: { melderGeloescht: true } },
        tx,
      );
    return geaendert.length;
  });
}

/** Papierkorb (K-05): Inhalte, die seit mehr als 30 Tagen darin liegen, endgültig löschen – je Eintrag Audit „System“. */
async function leerePapierkorb(jetzt: Date): Promise<number> {
  const grenze = new Date(jetzt.getTime() - PAPIERKORB_TAGE * 86_400_000);
  const v = schema.veranstaltung;
  const n = schema.nachricht;
  const a = schema.ankuendigung;
  const k = schema.kurs;
  return db.transaction(async (tx) => {
    const geloescht = [
      ...(await tx.delete(v).where(lt(v.imPapierkorbSeit, grenze)).returning({ id: v.id })).map((z) => ({ ...z, typ: 'veranstaltung' })),
      ...(await tx.delete(n).where(lt(n.imPapierkorbSeit, grenze)).returning({ id: n.id })).map((z) => ({ ...z, typ: 'nachricht' })),
      ...(await tx.delete(a).where(lt(a.imPapierkorbSeit, grenze)).returning({ id: a.id })).map((z) => ({ ...z, typ: 'ankuendigung' })),
      ...(await tx.delete(k).where(lt(k.imPapierkorbSeit, grenze)).returning({ id: k.id })).map((z) => ({ ...z, typ: 'kurs' })),
    ];
    for (const z of geloescht)
      await protokolliere(
        { benutzerId: null, aktion: 'inhalt.geloescht', zielTyp: z.typ, zielId: z.id, details: { papierkorb: true } },
        tx,
      );
    return geloescht.length;
  });
}

export const EINLADUNG_AUFBEWAHRUNG_TAGE = 30;

/**
 * Konten-Nebendaten (Tor B/C N7, G-07): Einladungen (Name, E-Mail) 30 Tage nach Annahme, Widerruf oder Ablauf löschen;
 * abgelaufene Better-Auth-Verifikationen (z. B. Passwort-Links, Token im Klartext) sofort.
 */
async function raeumeKontenAuf(jetzt: Date): Promise<number> {
  const grenze = new Date(jetzt.getTime() - EINLADUNG_AUFBEWAHRUNG_TAGE * 86_400_000);
  const e = schema.einladung;
  const weg = await db
    .delete(e)
    .where(or(lt(e.angenommenAm, grenze), lt(e.widerrufenAm, grenze), lt(e.laeuftAb, grenze)))
    .returning({ id: e.id });
  await db.delete(schema.verification).where(lt(schema.verification.expiresAt, jetzt));
  return weg.length;
}

export async function loescheAbgelaufene(
  jetzt = new Date(),
): Promise<{ eingaenge: number; mails: number; papierkorb: number; melder: number; einladungen: number; betroffeneTermine: string[] }> {
  const faellig = await db
    .select({ id: schema.eingang.id, art: schema.eingang.art, bezugId: schema.eingang.bezugId })
    .from(schema.eingang)
    .where(and(isNotNull(schema.eingang.loeschenAb), lte(schema.eingang.loeschenAb, jetzt)));
  if (faellig.length) {
    const ids = faellig.map((f) => f.id);
    await db.transaction(async (tx) => {
      await tx.delete(schema.mailAusgang).where(inArray(schema.mailAusgang.bezugEingangId, ids));
      await tx.delete(schema.eingang).where(inArray(schema.eingang.id, ids));
      for (const f of faellig)
        await protokolliere(
          { benutzerId: null, aktion: 'eingang.frist_geloescht', zielTyp: 'eingang', zielId: f.id, details: { art: f.art } },
          tx,
        );
    });
  }
  const grenze = new Date(jetzt.getTime() - MAIL_AUFBEWAHRUNG_TAGE * 86_400_000);
  const mails = await db
    .delete(schema.mailAusgang)
    .where(and(isNotNull(schema.mailAusgang.gesendetAm), lt(schema.mailAusgang.gesendetAm, grenze)))
    .returning({ id: schema.mailAusgang.id });
  await Promise.all([raeumeAltchaAuf(), raeumeRatenAuf()]);
  const papierkorb = (await leerePapierkorb(jetzt)) + (await leereMedienPapierkorb(jetzt));
  const melder = await entferneMelderdaten(jetzt);
  const einladungen = await raeumeKontenAuf(jetzt);
  // Nie übernommene Direkt-Uploads großer PDF-Dateien (ADR 0020): nach den fristgebundenen Löschungen und mit
  // Zeitbudget, damit eine Störung des Speichers den Löschlauf nicht aufhält
  await raeumeDirektEingaengeAuf(jetzt).catch(() => 0);
  const betroffeneTermine = [
    ...new Set(faellig.filter((f) => f.art === 'veranstaltungsanmeldung' && f.bezugId).map((f) => f.bezugId as string)),
  ];
  return { eingaenge: faellig.length, mails: mails.length, papierkorb, melder, einladungen, betroffeneTermine };
}

/** Anzahl fälliger Eingänge (Übersicht/Einstellungen), ohne zu löschen. */
export async function zaehleFaellige(jetzt = new Date()): Promise<number> {
  const [z] = await db
    .select({ anzahl: sql<number>`count(*)::int` })
    .from(schema.eingang)
    .where(and(isNotNull(schema.eingang.loeschenAb), lte(schema.eingang.loeschenAb, jetzt)));
  return z?.anzahl ?? 0;
}
