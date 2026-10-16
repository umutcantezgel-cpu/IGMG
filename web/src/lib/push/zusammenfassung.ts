import 'server-only';
import { and, eq, isNull } from 'drizzle-orm';
import { protokolliere } from '@/lib/audit';
import { db, schema } from '@/lib/db';
import { verschluessele } from '@/lib/krypto';
import { ladeGruppenKontext } from '@/lib/rechte/gemeinde';
import { aktiveBereiche, zaehleNeues } from './neues';
import { themenAus, ZUSAMMENFASSUNG_THEMEN, zusammenfassungFaellig, type ZusammenfassungThema } from './rueckfall';
import { ZUSAMMENFASSUNG_EMPFAENGER, ZUSAMMENFASSUNG_VORLAGE, zusammenfassungsLage } from './zusammenfassung-mail';

/**
 * Tägliche Mail-Zusammenfassung ohne Inhalte (ADR 0034 Nr. 6, F-38): Auswahl je Konto und Thema in Mein Bereich, Planung
 * in jedem Lauf des Mail-Ausgangs (`/api/wartung/mail-ausgang`: Vercel täglich 02:00 UTC, lokaler Takt alle 5 Minuten).
 * Je Konto höchstens eine Mail je Berliner Tag und nur, wenn seit dem letzten Versand (bzw. seit dem Bestellen) etwas
 * Neues da ist – im lokalen Takt also beim ersten Lauf eines Berliner Tages mit Neuem. Idempotent: Die Reservierung
 * (`letzter_versand`, `seit`) und die Zeile im Mail-Ausgang entstehen in einer Transaktion und nur, wenn die Zeile noch
 * den gelesenen Stand hat – ein zweiter Lauf am selben Tag plant nichts.
 */

/** Themen, die dieses Konto bestellen kann: Ankündigung immer; Chat und Unterricht nur mit Gruppe und Schaltern. */
export async function waehlbareThemen(benutzerId: string): Promise<ZusammenfassungThema[]> {
  const aktiv = await aktiveBereiche(await ladeGruppenKontext(benutzerId));
  return ZUSAMMENFASSUNG_THEMEN.filter((t) => aktiv.has(t));
}

/** Bestellte Themen (leer = nicht bestellt). */
export async function bestellteThemen(benutzerId: string): Promise<ZusammenfassungThema[]> {
  const [z] = await db
    .select({ themen: schema.mailZusammenfassung.themen })
    .from(schema.mailZusammenfassung)
    .where(eq(schema.mailZusammenfassung.benutzerId, benutzerId));
  return z ? themenAus(z.themen) : [];
}

/**
 * Auswahl speichern: leer → abbestellen (Zeile löschen); sonst bestellen bzw. Themen ändern. Beim ersten Bestellen
 * beginnt die Zählung jetzt (nichts Älteres landet in der ersten Mail); ein Themenwechsel behält den Zählbeginn.
 */
export async function speichereZusammenfassungsWahl(
  benutzerId: string,
  themen: readonly ZusammenfassungThema[],
): Promise<'gespeichert' | 'aus'> {
  const z = schema.mailZusammenfassung;
  return db.transaction(async (tx) => {
    if (!themen.length) {
      await tx.delete(z).where(eq(z.benutzerId, benutzerId));
    } else {
      await tx
        .insert(z)
        .values({ benutzerId, themen: [...themen] })
        .onConflictDoUpdate({ target: z.benutzerId, set: { themen: [...themen] } });
    }
    await protokolliere(
      {
        benutzerId,
        aktion: 'konto.zusammenfassung_geaendert',
        zielTyp: 'benutzer',
        zielId: benutzerId,
        details: { themen: themen.join(',') },
      },
      tx,
    );
    return themen.length ? 'gespeichert' : 'aus';
  });
}

export type PlanungsErgebnis = { geprueft: number; geplant: number };

/**
 * Zusammenfassungen des Tages planen (täglicher Cron). Zählt je Konto das Neue seit `seit` in den bestellten und
 * erlaubten Bereichen und legt bei Neuem eine Zeile im Mail-Ausgang an (Empfänger „zusammenfassung:<Konto>“, Daten nur
 * Anzahlen). Kinderkonten, unbestätigte und `.invalid`-Adressen, gesperrte Konten und ausgeschaltete Schalter fallen weg.
 */
export async function planeZusammenfassungen(jetzt = new Date()): Promise<PlanungsErgebnis> {
  const z = schema.mailZusammenfassung;
  const zeilen = await db.select().from(z);
  let geplant = 0;
  for (const zeile of zeilen) {
    const themen = themenAus(zeile.themen);
    if (!themen.length) continue;
    const lage = await zusammenfassungsLage(zeile.benutzerId, jetzt);
    if (!lage.moeglich) continue;
    const zahl = await zaehleNeues(zeile.benutzerId, zeile.seit, themen, { jetzt });
    if (!zusammenfassungFaellig({ themen, zahl, letzterVersand: zeile.letzterVersand, jetzt })) continue;
    const daten = Object.fromEntries(ZUSAMMENFASSUNG_THEMEN.map((t) => [t, String(themen.includes(t) ? zahl[t] : 0)]));
    const paket = verschluessele({ an: `${ZUSAMMENFASSUNG_EMPFAENGER}${zeile.benutzerId}`, daten });
    const neu = await db.transaction(async (tx) => {
      // Nur, wenn die Zeile noch den gelesenen Stand hat (paralleler Lauf, Abbestellen dazwischen): sonst nichts planen.
      // `letzter_versand` schreibt nur dieser Lauf, immer aus einer JS-Zeit (Millisekunden) – der Vergleich ist exakt.
      const reserviert = await tx
        .update(z)
        .set({ seit: jetzt, letzterVersand: jetzt })
        .where(
          and(
            eq(z.benutzerId, zeile.benutzerId),
            zeile.letzterVersand ? eq(z.letzterVersand, zeile.letzterVersand) : isNull(z.letzterVersand),
          ),
        )
        .returning({ benutzerId: z.benutzerId });
      if (!reserviert.length) return false;
      await tx.insert(schema.mailAusgang).values({
        vorlage: ZUSAMMENFASSUNG_VORLAGE,
        sprache: lage.sprache,
        datenVerschluesselt: paket.daten,
        schluesselId: paket.schluesselId,
      });
      return true;
    });
    if (neu) geplant++;
  }
  return { geprueft: zeilen.length, geplant };
}
