import 'server-only';
import { and, asc, eq, inArray, isNull } from 'drizzle-orm';
import { cacheLife, cacheTag } from 'next/cache';
import { wissenInhalt, type WissenInhalt } from '@/components/website/wissen/inhalt';
import { TAG } from '@/lib/cache/tags';
import { db, schema } from '@/lib/db';
import { datenbankVerfuegbar } from '@/lib/db/verfuegbar';
import type { Mehrsprachig, MehrsprachigRich } from '@/lib/db/schema/typen';
import { funktionAn } from '@/lib/funktionen';
import { istEntwurf, istKiEntwurf, oeffentlicheFreigaben } from '@/lib/wissen/entwurf';

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
  /**
   * Noch nicht religiös geprüft (ADR 0047): nur mit dem Schalter `website_wissen_vorschau` öffentlich und dann überall
   * gekennzeichnet („Entwurf zur Prüfung – noch nicht vom Imam geprüft“), `noindex`, nicht in der Sitemap.
   */
  entwurf: boolean;
  /** Der Stand stammt unverändert aus dem KI-Entwurf (Verfasser-Vermerk, ADR 0047) – der Hinweis sagt das offen. */
  kiEntwurf: boolean;
};

/**
 * Sichtbar für Besucher: veröffentlicht, nicht im Papierkorb (MUSTER 2, K-05) und religiös geprüft (ADR 0030, F-40). Mit
 * dem Schalter `website_wissen_vorschau` zusätzlich Themen „zur Prüfung“ als gekennzeichneter Entwurf (ADR 0047); ein
 * zurückgewiesenes oder nie eingereichtes Thema („entwurf“) bleibt immer verborgen.
 */
function sichtbar(vorschau: boolean) {
  return and(
    eq(schema.wissenThema.status, 'veroeffentlicht'),
    inArray(schema.wissenThema.freigabe, oeffentlicheFreigaben(vorschau)),
    isNull(schema.wissenThema.imPapierkorbSeit),
  );
}

/**
 * Schalter `website_wissen_vorschau` (ADR 0035/0047), gelesen innerhalb der gecachten Funktionen wie in der Lern-App
 * (`lernapp/pakete.ts`): Die Einträge tragen zusätzlich den Tag `einstellungen` – ein Wechsel in der Datenbank lässt sie
 * verfallen; ein Wechsel der Umgebung (`FUNKTION_WEBSITE_WISSEN_VORSCHAU`) wirkt mit der nächsten Bereitstellung.
 */
const vorschauAn = () => funktionAn('website_wissen_vorschau');

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
    entwurf: istEntwurf(z.freigabe),
    kiEntwurf: istEntwurf(z.freigabe) && istKiEntwurf(z.verfasstVon),
  };
}

/** Sichtbare Themen in Sortierreihenfolge (Tabelle wissen_thema, Tags wissen und einstellungen, ADR 0004). */
export async function ladeWissensThemen(): Promise<WissensThema[]> {
  'use cache: remote';
  cacheLife('max');
  cacheTag(TAG.wissen, TAG.einstellungen);
  const vorschau = await vorschauAn();
  const zeilen = await db
    .select()
    .from(schema.wissenThema)
    .where(sichtbar(vorschau))
    .orderBy(asc(schema.wissenThema.sortierung), asc(schema.wissenThema.slug));
  return zeilen.map(zuThema);
}

/** Ein sichtbares Thema per Schlüssel (für die Themenseite /islamisches-wissen/[thema]). */
export async function ladeWissensThema(slug: string): Promise<WissensThema | null> {
  'use cache: remote';
  cacheLife('max');
  cacheTag(TAG.wissen, TAG.einstellungen);
  // Beispielmodus ohne Datenbank (ADR 0019): nie abstürzen – leer bzw. Standardwerte, die Seite antwortet mit 404
  if (!datenbankVerfuegbar()) return null;
  const vorschau = await vorschauAn();
  const [z] = await db
    .select()
    .from(schema.wissenThema)
    .where(and(sichtbar(vorschau), eq(schema.wissenThema.slug, slug)))
    .limit(1);
  return z ? zuThema(z) : null;
}

/** Schlüssel aller sichtbaren Themen (generateStaticParams der Themenseite, dieselbe Auswahl wie ladeWissensThema). */
export async function ladeWissensSlugs(): Promise<string[]> {
  'use cache: remote';
  cacheLife('max');
  cacheTag(TAG.wissen, TAG.einstellungen);
  const vorschau = await vorschauAn();
  const zeilen = await db.select({ slug: schema.wissenThema.slug }).from(schema.wissenThema).where(sichtbar(vorschau));
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
