import 'server-only';
import { eq } from 'drizzle-orm';
import { cacheTag } from 'next/cache';
import { pfadFuer } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { TAG } from '@/lib/cache/tags';
import { routingZielFuer, seitenIdAusZiel } from '@/lib/cms/ziele';
import { db, schema } from '@/lib/db';
import { datenbankVerfuegbar } from '@/lib/db/verfuegbar';
import { waehle } from '@/lib/i18n/inhalt';
import { fussMenue, kopfMenue, type MenueSchluessel } from '@/lib/validierung/menue';
import { ladeSeitenAdressen, zeitplanLebensdauer } from './seiten';

/**
 * Menüs aus der Datenbank (ADR 0032) für Kopf und Fuß der Website, je Sprache fertig aufgelöst (Adresse, Text mit
 * Rückfall auf Deutsch). `null` = kein Menü gespeichert → der Bestand aus `navigation.ts` gilt. Einträge auf Seiten, die
 * (noch) nicht öffentlich sind, fallen weg. Gecacht mit `TAG.menue` und `TAG.seiten`.
 */
export type MenueLink = { titel: string; titelLang?: string; beschreibung: string; href: string; ziel: string };
export type MenueGruppeOeffentlich = { titel: string; titelLang?: string; kinder: MenueLink[] };

/** Adresse eines Ziels in einer Sprache; null, wenn es (noch) keine öffentliche Seite gibt. */
export function zielAdresse(ziel: string, sprache: Locale, seiten: Record<string, Record<Locale, string>>): string | null {
  const seitenId = seitenIdAusZiel(ziel);
  if (seitenId) return seiten[seitenId]?.[sprache] ?? null;
  const pfad = routingZielFuer(ziel, 'de');
  return pfad ? pfadFuer(pfad, sprache) : null;
}

async function ladeRoh(schluessel: MenueSchluessel): Promise<unknown | null> {
  // Beispielmodus ohne Datenbank (ADR 0019): nie abstürzen – leer bzw. Standardwerte, die Seite antwortet mit 404
  if (!datenbankVerfuegbar()) return null;
  const [z] = await db
    .select({ eintraege: schema.menue.eintraege })
    .from(schema.menue)
    .where(eq(schema.menue.schluessel, schluessel))
    .limit(1);
  return z ? z.eintraege : null;
}

export async function ladeKopfMenue(sprache: Locale): Promise<MenueGruppeOeffentlich[] | null> {
  'use cache: remote';
  cacheTag(TAG.menue, TAG.seiten);
  await zeitplanLebensdauer(new Date());
  const roh = await ladeRoh('kopf');
  const p = roh === null ? null : kopfMenue.safeParse(roh);
  if (!p?.success) return null;
  const seiten = await ladeSeitenAdressen();
  const gruppen = p.data
    .map((g) => {
      const titel = waehle(g.titel, sprache);
      const kinder = g.kinder.flatMap((k): MenueLink[] => {
        const href = zielAdresse(k.ziel, sprache, seiten);
        if (!href) return [];
        const t = waehle(k.titel, sprache);
        return [
          {
            titel: t.text,
            titelLang: t.rueckfall ? 'de' : undefined,
            beschreibung: waehle(k.beschreibung, sprache).text,
            href,
            ziel: k.ziel,
          },
        ];
      });
      return { titel: titel.text, titelLang: titel.rueckfall ? 'de' : undefined, kinder };
    })
    .filter((g) => g.kinder.length > 0);
  return gruppen.length ? gruppen : null;
}

export async function ladeFussMenue(sprache: Locale): Promise<MenueLink[] | null> {
  'use cache: remote';
  cacheTag(TAG.menue, TAG.seiten);
  await zeitplanLebensdauer(new Date());
  const roh = await ladeRoh('fuss');
  const p = roh === null ? null : fussMenue.safeParse(roh);
  if (!p?.success) return null;
  const seiten = await ladeSeitenAdressen();
  const links = p.data.flatMap((k): MenueLink[] => {
    const href = zielAdresse(k.ziel, sprache, seiten);
    if (!href) return [];
    const t = waehle(k.titel, sprache);
    return [
      { titel: t.text, titelLang: t.rueckfall ? 'de' : undefined, beschreibung: waehle(k.beschreibung, sprache).text, href, ziel: k.ziel },
    ];
  });
  return links.length ? links : null;
}
