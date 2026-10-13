import 'server-only';
import { asc, count, eq, inArray } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { KURSARTEN, type Kursart } from '@/lib/lernen/verwaltung';
import type { Mehrsprachig } from '@/lib/db/schema/typen';

/**
 * Lehrplan (H-L03): Stufen je Kursart in ihrer Reihenfolge, mit der Zahl erfasster Fortschritte (nur Zähler, keine
 * Personendaten). Inhalte verfassen Lehrkräfte; Platzhalter bleiben in eckigen Klammern (ADR 0030).
 */
export type StufenZeile = { id: string; reihenfolge: number; titel: Mehrsprachig; beschreibung: Mehrsprachig | null; fortschritte: number };

export async function ladeLehrplan(): Promise<Record<Kursart, StufenZeile[]>> {
  const stufen = await db
    .select()
    .from(schema.lehrplanStufe)
    .orderBy(asc(schema.lehrplanStufe.kursart), asc(schema.lehrplanStufe.reihenfolge));
  const ids = stufen.map((s) => s.id);
  const zaehler = ids.length
    ? await db
        .select({ stufeId: schema.lernfortschritt.stufeId, anzahl: count() })
        .from(schema.lernfortschritt)
        .where(inArray(schema.lernfortschritt.stufeId, ids))
        .groupBy(schema.lernfortschritt.stufeId)
    : [];
  const n = new Map(zaehler.map((z) => [z.stufeId, z.anzahl]));
  const ergebnis = Object.fromEntries(KURSARTEN.map((k) => [k, [] as StufenZeile[]])) as Record<Kursart, StufenZeile[]>;
  for (const s of stufen)
    ergebnis[s.kursart].push({
      id: s.id,
      reihenfolge: s.reihenfolge,
      titel: s.titel,
      beschreibung: s.beschreibung,
      fortschritte: n.get(s.id) ?? 0,
    });
  return ergebnis;
}

export async function ladeStufenDerKursart(kursart: Kursart) {
  return db
    .select({ id: schema.lehrplanStufe.id, reihenfolge: schema.lehrplanStufe.reihenfolge })
    .from(schema.lehrplanStufe)
    .where(eq(schema.lehrplanStufe.kursart, kursart))
    .orderBy(asc(schema.lehrplanStufe.reihenfolge));
}
