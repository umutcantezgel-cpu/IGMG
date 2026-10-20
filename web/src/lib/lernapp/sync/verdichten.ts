import 'server-only';
import { and, eq, gt, inArray, lte, sql } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { plusMonate } from '@/lib/loeschen/fristen';
import { type KartenBasis, type KartenBewertung, type Kartenstand, type Note, spieleKarteNach } from '../srs';

/**
 * Verdichtung im Löschlauf (ADR 0038 Nr. 10, KERN 4.0 §6, Löschkonzept L-39): Bewertungen, deren Zeit `am` älter als
 * 12 Monate ist, werden je Karte in den Kartenstand gefaltet (`lernapp_karte.basis`, `basisBis` = Grenze) und danach
 * gelöscht. Nachgespielt wird künftig nur, was nach der Grenze liegt – auf dem Server (`sync/server.ts`) wie auf dem Gerät
 * (`leiteAb` mit `basen` aus der Sync-Antwort). Weil `zuKarte(ausKarte(c))` die Karte genau wiederherstellt, ändert die
 * Verdichtung keinen Kartenstand.
 *
 * - Nur Bewertungen: Lektionen, XP, Ziele, Pausen und Einstellungen sind wenige und tragen den Lernweg (erledigte
 *   Lektionen, Serie); sie bleiben bis zur Löschung des Lernstands nach 12 Monaten ohne Abgleich.
 * - Bewertungen, die erst nach einer Verdichtung mit einer Zeit vor deren Grenze eintreffen (lange offline), zählen nicht
 *   mehr – auf allen Geräten gleich, weil auch dort nur nach der Grenze nachgespielt wird.
 * - Je Konto eine Transaktion unter derselben Sperre wie der Abgleich; idempotent.
 */
export const VERDICHTEN_NACH_MONATEN = 12;

export type VerdichtungsErgebnis = { konten: number; ereignisse: number; karten: number };

const sperre = (benutzerId: string) => sql`select pg_advisory_xact_lock(hashtext(${`igmg:lernapp-sync:${benutzerId}`}))`;
const kartenAusdruck = sql<string>`${schema.lernappEreignis.daten}->>'karte'`;

/** Verdichtet alle Konten mit Bewertungen vor der Grenze (höchstens `hoechstensKonten` je Lauf; der nächste Lauf macht weiter). */
export async function verdichteLernapp(
  jetzt = new Date(),
  { hoechstensKonten = 500 }: { hoechstensKonten?: number } = {},
): Promise<VerdichtungsErgebnis> {
  const grenze = plusMonate(jetzt, -VERDICHTEN_NACH_MONATEN);
  const konten = await db
    .selectDistinct({ benutzerId: schema.lernappEreignis.benutzerId })
    .from(schema.lernappEreignis)
    .where(and(eq(schema.lernappEreignis.art, 'bewertung'), lte(schema.lernappEreignis.am, grenze)))
    .limit(hoechstensKonten);
  const ergebnis: VerdichtungsErgebnis = { konten: 0, ereignisse: 0, karten: 0 };
  for (const { benutzerId } of konten) {
    const r = await verdichteKonto(benutzerId, grenze);
    ergebnis.konten++;
    ergebnis.ereignisse += r.ereignisse;
    ergebnis.karten += r.karten;
  }
  return ergebnis;
}

/** Ein Konto bis einschließlich `grenze` verdichten. */
export async function verdichteKonto(benutzerId: string, grenze: Date): Promise<{ ereignisse: number; karten: number }> {
  return db.transaction(async (tx) => {
    await tx.execute(sperre(benutzerId));
    const alt = and(
      eq(schema.lernappEreignis.benutzerId, benutzerId),
      eq(schema.lernappEreignis.art, 'bewertung'),
      lte(schema.lernappEreignis.am, grenze),
    );
    const alte = await tx
      .select({
        geraet: schema.lernappEreignis.geraet,
        seq: schema.lernappEreignis.seq,
        am: schema.lernappEreignis.am,
        daten: schema.lernappEreignis.daten,
      })
      .from(schema.lernappEreignis)
      .where(alt);
    if (!alte.length) return { ereignisse: 0, karten: 0 };
    const karten = [...new Set(alte.map((z) => String(z.daten.karte)))].sort();
    const juengere = await tx
      .select({
        geraet: schema.lernappEreignis.geraet,
        seq: schema.lernappEreignis.seq,
        am: schema.lernappEreignis.am,
        daten: schema.lernappEreignis.daten,
      })
      .from(schema.lernappEreignis)
      .where(
        and(
          eq(schema.lernappEreignis.benutzerId, benutzerId),
          eq(schema.lernappEreignis.art, 'bewertung'),
          gt(schema.lernappEreignis.am, grenze),
          inArray(kartenAusdruck, karten),
        ),
      );
    const vorhanden = new Map(
      (
        await tx
          .select({ karte: schema.lernappKarte.karte, basis: schema.lernappKarte.basis, basisBis: schema.lernappKarte.basisBis })
          .from(schema.lernappKarte)
          .where(and(eq(schema.lernappKarte.benutzerId, benutzerId), inArray(schema.lernappKarte.karte, karten)))
      ).map((z) => [
        z.karte,
        z.basis && z.basisBis ? ({ stand: z.basis as Kartenstand, bis: z.basisBis.toISOString() } as KartenBasis) : null,
      ]),
    );
    const bewertung = (z: (typeof alte)[number]): KartenBewertung => ({
      karte: String(z.daten.karte),
      note: z.daten.note as Note,
      am: z.am.toISOString(),
      geraet: z.geraet,
      seq: z.seq,
    });
    const altJe = Map.groupBy(alte.map(bewertung), (b) => b.karte);
    const neuJe = Map.groupBy(juengere.map(bewertung), (b) => b.karte);
    const bis = grenze.toISOString();
    const werte = karten.flatMap((karte) => {
      const stand = spieleKarteNach(karte, altJe.get(karte) ?? [], vorhanden.get(karte));
      if (!stand) return [];
      const basis: KartenBasis = { stand, bis };
      const zustand = spieleKarteNach(karte, neuJe.get(karte) ?? [], basis) ?? stand;
      return [
        {
          benutzerId,
          karte,
          zustand: zustand as unknown as Record<string, unknown>,
          faellig: new Date(zustand.faellig),
          basis: stand as unknown as Record<string, unknown>,
          basisBis: grenze,
        },
      ];
    });
    if (werte.length)
      await tx
        .insert(schema.lernappKarte)
        .values(werte)
        .onConflictDoUpdate({
          target: [schema.lernappKarte.benutzerId, schema.lernappKarte.karte],
          set: {
            zustand: sql.raw('excluded.zustand'),
            faellig: sql.raw('excluded.faellig'),
            basis: sql.raw('excluded.basis'),
            basisBis: sql.raw('excluded.basis_bis'),
            aktualisiertAm: sql`now()`,
          },
        });
    const geloescht = await tx.delete(schema.lernappEreignis).where(alt).returning({ id: schema.lernappEreignis.id });
    return { ereignisse: geloescht.length, karten: werte.length };
  });
}
