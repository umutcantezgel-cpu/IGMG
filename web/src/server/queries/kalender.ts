import 'server-only';
import { and, eq, gte, lte } from 'drizzle-orm';
import { cacheLife, cacheTag } from 'next/cache';
import { TAG } from '@/lib/cache/tags';
import { db, schema } from '@/lib/db';
import type { Mehrsprachig } from '@/lib/db/schema/typen';
import { HOECHSTER_ABSTAND, oeffentlicheTage, type KalenderTag } from '@/lib/kalender/abgleich';
import { besondereTage } from '@/lib/kalender/besondere-tage';
import { tagPlus } from '@/lib/kalender/raster';
import { lokalesDatum, vorkommen } from '@/lib/termine';
import { ladeVeranstaltungen } from './veranstaltungen';

/**
 * Öffentliche Kalender-Abfragen (AUFTRAG 3.10, ADR 0030): Besondere Tage aus der Tabelle nur mit Freigabe „geprueft“,
 * sonst die berechneten Vorschläge als „vorläufig“. Geteilter Cache, täglich neu, sofort nach Änderungen (Tag kalender).
 */
export async function ladeBesondereTage(von: string, bis: string): Promise<KalenderTag[]> {
  'use cache: remote';
  cacheLife('days');
  cacheTag(TAG.kalender);
  const jahre: number[] = [];
  for (let j = Number(von.slice(0, 4)); j <= Number(bis.slice(0, 4)); j++) jahre.push(j);
  const vorschlaege = jahre.flatMap((j) => besondereTage(j));
  // Einträge etwas über den Rand hinaus laden, damit verschobene Tage am Rand ihren Vorschlag finden
  const zeilen = await db
    .select({
      id: schema.besondererTag.id,
      art: schema.besondererTag.art,
      datum: schema.besondererTag.datum,
      titel: schema.besondererTag.titel,
      beschreibung: schema.besondererTag.beschreibung,
    })
    .from(schema.besondererTag)
    .where(
      and(
        eq(schema.besondererTag.freigabe, 'geprueft'),
        gte(schema.besondererTag.datum, tagPlus(`${jahre[0]}-01-01`, -HOECHSTER_ABSTAND)),
        lte(schema.besondererTag.datum, tagPlus(`${jahre.at(-1)}-12-31`, HOECHSTER_ABSTAND)),
      ),
    );
  return oeffentlicheTage(
    vorschlaege,
    zeilen.map((z) => ({ ...z, beschreibung: z.beschreibung ?? null })),
  ).filter((t) => t.datum >= von && t.datum <= bis);
}

export type KalenderTermin = {
  id: string;
  slug: string;
  titel: Mehrsprachig;
  /** Kalendertag (Europe/Berlin) */
  datum: string;
  /** Beginn als ISO-Zeitpunkt */
  beginn: string;
  ganztaegig: boolean;
  istBeispiel: boolean;
};

/**
 * Veranstaltungen im Zeitraum für das Monatsraster: einmalige Termine und monatliche bzw. jährliche Serien je
 * Vorkommen. Wöchentliche und tägliche Serien würden jeden Monat füllen – sie stehen gesammelt unter `regelmaessig`.
 * Gecacht wie die Veranstaltungen (stündlich, Tag veranstaltungen): Die Zeitzonenrechnung gehört nicht ins Prerendern.
 */
export async function ladeKalenderTermine(
  von: string,
  bis: string,
): Promise<{ termine: KalenderTermin[]; regelmaessig: KalenderTermin[] }> {
  'use cache: remote';
  cacheLife('hours');
  cacheTag(TAG.veranstaltungen);
  const liste = await ladeVeranstaltungen();
  const anfang = new Date(`${von}T00:00:00Z`);
  const ende = new Date(`${tagPlus(bis, 1)}T00:00:00Z`);
  const termine: KalenderTermin[] = [];
  const regelmaessig: KalenderTermin[] = [];
  for (const v of liste) {
    const basis = { id: v.id, slug: v.slug, titel: v.titel, ganztaegig: v.ganztaegig, istBeispiel: v.istBeispiel };
    const art = v.wiederholung.art;
    if (art === 'woechentlich' || art === 'taeglich') {
      if (!v.vergangen) regelmaessig.push({ ...basis, datum: lokalesDatum(new Date(v.beginn)), beginn: v.beginn });
      continue;
    }
    const regel = {
      beginn: new Date(v.regel ? v.ersterBeginn : v.beginn),
      ende: v.ende ? new Date(new Date(v.regel ? v.ersterBeginn : v.beginn).getTime() + (Date.parse(v.ende) - Date.parse(v.beginn))) : null,
      wiederholung: v.regel,
      ausnahmen: v.ausnahmen,
    };
    for (const vk of vorkommen(regel, anfang, ende, 40)) {
      const datum = lokalesDatum(vk.beginn);
      if (datum < von || datum > bis) continue;
      termine.push({ ...basis, datum, beginn: vk.beginn.toISOString() });
    }
  }
  termine.sort((a, b) => a.beginn.localeCompare(b.beginn));
  return { termine, regelmaessig };
}
