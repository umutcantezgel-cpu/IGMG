import 'server-only';
import { and, inArray, isNotNull, lt, lte, sql } from 'drizzle-orm';
import { protokolliere } from '@/lib/audit';
import { db, schema } from '@/lib/db';
import { raeumeAltchaAuf } from '@/lib/validierung/altcha';
import { raeumeRatenAuf } from '@/lib/validierung/ratenbegrenzung';

/**
 * Löschlauf (C16, G-07, ADR 0005): löscht Eingänge, deren Frist (`loeschen_ab`) erreicht ist – echt, mit
 * Einwilligungen und Notizen (Kaskade) und Mail-Ausgang; je Eingang ein Audit-Eintrag `eingang.frist_geloescht`
 * (nur Art, keine Personendaten). Räumt außerdem versendete Mails nach 30 Tagen, verbrauchte ALTCHA-Lösungen und alte
 * Ratenfenster auf. Aufruf täglich per Cron über `POST /api/wartung/loeschfristen` (BETRIEB.md 4).
 */
export const MAIL_AUFBEWAHRUNG_TAGE = 30;

export async function loescheAbgelaufene(jetzt = new Date()): Promise<{ eingaenge: number; mails: number; betroffeneTermine: string[] }> {
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
  const betroffeneTermine = [
    ...new Set(faellig.filter((f) => f.art === 'veranstaltungsanmeldung' && f.bezugId).map((f) => f.bezugId as string)),
  ];
  return { eingaenge: faellig.length, mails: mails.length, betroffeneTermine };
}

/** Anzahl fälliger Eingänge (Übersicht/Einstellungen), ohne zu löschen. */
export async function zaehleFaellige(jetzt = new Date()): Promise<number> {
  const [z] = await db
    .select({ anzahl: sql<number>`count(*)::int` })
    .from(schema.eingang)
    .where(and(isNotNull(schema.eingang.loeschenAb), lte(schema.eingang.loeschenAb, jetzt)));
  return z?.anzahl ?? 0;
}
