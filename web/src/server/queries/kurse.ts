import 'server-only';
import { and, asc, eq, isNull } from 'drizzle-orm';
import { cacheLife, cacheTag } from 'next/cache';
import { TAG } from '@/lib/cache/tags';
import { db, schema } from '@/lib/db';
import type { Mehrsprachig } from '@/lib/db/schema/typen';
import { ladeBilder, type BildDaten } from '@/lib/medien/bild';

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
  hinweis: Mehrsprachig | null;
  anmeldeweg: Anmeldeweg;
  /** Bild aus der Mediathek (C11b); null = Platzhalter */
  bild: BildDaten | null;
};

/** Anmeldeweg der Karte aus der Verfügbarkeit des Kurses (V06): Voranmeldung, ohne Anmeldung, geschlossen. */
export function anmeldewegVon(kurs: { verfuegbarkeit: 'voranmeldung' | 'ohne_anmeldung' | 'geschlossen' }): Anmeldeweg {
  return kurs.verfuegbarkeit === 'voranmeldung' ? 'register' : kurs.verfuegbarkeit === 'ohne_anmeldung' ? 'join' : 'closed';
}

/** Veröffentlichte Kurse in Sortierreihenfolge; Entwürfe und Papierkorb (K-05) bleiben aus. Tag kurse (ADR 0004). */
export async function ladeKurse(): Promise<KursDaten[]> {
  'use cache: remote';
  cacheLife('max');
  cacheTag(TAG.kurse, TAG.medien);
  const zeilen = await db
    .select()
    .from(schema.kurs)
    .where(and(eq(schema.kurs.status, 'veroeffentlicht'), isNull(schema.kurs.imPapierkorbSeit)))
    .orderBy(asc(schema.kurs.sortierung), asc(schema.kurs.slug));
  const bilder = await ladeBilder(zeilen.map((z) => z.bildId));
  return zeilen.map((z) => ({
    id: z.id,
    slug: z.slug,
    titel: z.titel,
    beschreibung: z.beschreibung,
    zielgruppe: z.zielgruppe,
    zeiten: z.zeiten,
    inhalte: z.inhalte,
    hinweis: z.hinweis,
    anmeldeweg: anmeldewegVon(z),
    bild: (z.bildId && bilder[z.bildId]) || null,
  }));
}

/** Kurs, für den eine Voranmeldung erlaubt ist (F-44): veröffentlicht, nicht im Papierkorb, Anmeldeweg „Voranmeldung“. */
export type VoranmeldeKurs = { id: string; slug: string; titel: Mehrsprachig };

export async function kurseFuerVoranmeldung(): Promise<VoranmeldeKurs[]> {
  return (await ladeKurse()).filter((k) => k.anmeldeweg === 'register').map((k) => ({ id: k.id, slug: k.slug, titel: k.titel }));
}

/**
 * Kurs-ID zur Kurskennung aus der Voranmeldung (`?kurs=<slug>`, F-44) – nur für erlaubte Kurse, sonst `null` (dann bleibt
 * die Voranmeldung ohne Kurs). Gespeichert wird sie als `eingang.bezug_id`.
 */
export async function kursIdFuerVoranmeldung(slug: unknown): Promise<string | null> {
  if (typeof slug !== 'string' || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) || slug.length > 120) return null;
  return (await kurseFuerVoranmeldung()).find((k) => k.slug === slug)?.id ?? null;
}
