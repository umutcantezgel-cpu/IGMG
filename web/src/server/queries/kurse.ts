import 'server-only';
import { and, asc, eq, isNull } from 'drizzle-orm';
import { cacheLife, cacheTag } from 'next/cache';
import { TAG } from '@/lib/cache/tags';
import { db, schema } from '@/lib/db';
import type { Mehrsprachig } from '@/lib/db/schema/typen';

/** Anmeldeweg eines Kurses wie im Design (CourseCard: register, join, closed). */
export type Anmeldeweg = 'register' | 'join' | 'closed';

/** Kurs für Karten und Übersicht (serialisierbar für den Cache, Zeiten als Text). */
export type KursDaten = {
  id: string;
  slug: string;
  titel: Mehrsprachig;
  beschreibung: Mehrsprachig | null;
  zielgruppe: Mehrsprachig | null;
  zeiten: Mehrsprachig | null;
  inhalte: Mehrsprachig[];
  anmeldeweg: Anmeldeweg;
};

/**
 * Anmeldeweg aus der Tabelle kurs. Die Tabelle kennt nur `voranmeldungMoeglich`: ja → Voranmeldung (register),
 * nein → keine Anmeldung nötig (join). Der Zustand „geschlossen“ und ein Feld für den Hinweis fehlen im Schema
 * (offene Frage im Bericht A10); bis dahin wird der Hafiz-Kurs als Entwurf gespeichert.
 */
export function anmeldewegVon(kurs: { voranmeldungMoeglich: boolean }): Anmeldeweg {
  return kurs.voranmeldungMoeglich ? 'register' : 'join';
}

/** Veröffentlichte Kurse in Sortierreihenfolge; Entwürfe und Papierkorb (K-05) bleiben aus. Tag kurse (ADR 0004). */
export async function ladeKurse(): Promise<KursDaten[]> {
  'use cache';
  cacheLife('max');
  cacheTag(TAG.kurse);
  const zeilen = await db
    .select()
    .from(schema.kurs)
    .where(and(eq(schema.kurs.status, 'veroeffentlicht'), isNull(schema.kurs.imPapierkorbSeit)))
    .orderBy(asc(schema.kurs.sortierung), asc(schema.kurs.slug));
  return zeilen.map((z) => ({
    id: z.id,
    slug: z.slug,
    titel: z.titel,
    beschreibung: z.beschreibung,
    zielgruppe: z.zielgruppe,
    zeiten: z.zeiten,
    inhalte: z.inhalte,
    anmeldeweg: anmeldewegVon(z),
  }));
}
