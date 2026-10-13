import 'server-only';
import { and, asc, eq, isNull } from 'drizzle-orm';
import { cacheLife, cacheTag } from 'next/cache';
import { wissenInhalt, type WissenInhalt } from '@/components/website/wissen/inhalt';
import { TAG } from '@/lib/cache/tags';
import { db, schema } from '@/lib/db';
import { datenbankVerfuegbar } from '@/lib/db/verfuegbar';
import type { Mehrsprachig, MehrsprachigRich } from '@/lib/db/schema/typen';

/** Thema für Filter und Themenseiten (serialisierbar für den Cache, Zeitpunkte als ISO-Text). */
export type WissensThema = {
  id: string;
  slug: string;
  titel: Mehrsprachig;
  kurztext: Mehrsprachig | null;
  inhalt: MehrsprachigRich | null;
  sortierung: number;
  istBeispiel: boolean;
  aktualisiertAm: string;
};

/** Sichtbar für Besucher: veröffentlicht und nicht im Papierkorb (MUSTER 2, K-05). */
const sichtbar = and(eq(schema.wissenThema.status, 'veroeffentlicht'), isNull(schema.wissenThema.imPapierkorbSeit));

function zuThema(z: typeof schema.wissenThema.$inferSelect): WissensThema {
  return {
    id: z.id,
    slug: z.slug,
    titel: z.titel,
    kurztext: z.kurztext,
    inhalt: z.inhalt,
    sortierung: z.sortierung,
    istBeispiel: z.istBeispiel,
    aktualisiertAm: z.aktualisiertAm.toISOString(),
  };
}

/** Sichtbare Themen in Sortierreihenfolge (Tabelle wissen_thema, Tag wissen, ADR 0004). */
export async function ladeWissensThemen(): Promise<WissensThema[]> {
  'use cache: remote';
  cacheLife('max');
  cacheTag(TAG.wissen);
  const zeilen = await db
    .select()
    .from(schema.wissenThema)
    .where(sichtbar)
    .orderBy(asc(schema.wissenThema.sortierung), asc(schema.wissenThema.slug));
  return zeilen.map(zuThema);
}

/** Ein sichtbares Thema per Schlüssel (für die Themenseite /islamisches-wissen/[thema]). */
export async function ladeWissensThema(slug: string): Promise<WissensThema | null> {
  'use cache: remote';
  cacheLife('max');
  cacheTag(TAG.wissen);
  // Beispielmodus ohne Datenbank (ADR 0019): nie abstürzen – leer bzw. Standardwerte, die Seite antwortet mit 404
  if (!datenbankVerfuegbar()) return null;
  const [z] = await db
    .select()
    .from(schema.wissenThema)
    .where(and(sichtbar, eq(schema.wissenThema.slug, slug)))
    .limit(1);
  return z ? zuThema(z) : null;
}

/** Schlüssel aller sichtbaren Themen (generateStaticParams der Themenseite, dieselbe Auswahl wie ladeWissensThema). */
export async function ladeWissensSlugs(): Promise<string[]> {
  'use cache: remote';
  cacheLife('max');
  cacheTag(TAG.wissen);
  const zeilen = await db.select({ slug: schema.wissenThema.slug }).from(schema.wissenThema).where(sichtbar);
  return zeilen.map((z) => z.slug);
}

/**
 * Artikel, Videos und Experten aus dem Seiteninhalt „wissen“. Ohne Eintrag oder bei ungültigem Inhalt leere
 * Listen (ladeSeiteninhalt kennt den Bereich nicht, weil die Registry außerhalb dieses Pakets liegt).
 * Tag seiteninhalt:wissen, Lebensdauer wie andere Seiteninhalte (ADR 0004).
 */
export async function ladeWissensInhalt(): Promise<WissenInhalt> {
  'use cache: remote';
  cacheLife('max');
  cacheTag(TAG.seiteninhalt('wissen'), 'seiteninhalt');
  const [zeile] = await db.select().from(schema.seiteninhalt).where(eq(schema.seiteninhalt.bereich, 'wissen')).limit(1);
  const geprueft = wissenInhalt.safeParse(zeile?.inhalt ?? {});
  return geprueft.success ? geprueft.data : wissenInhalt.parse({});
}
