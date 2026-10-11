import 'server-only';
import { and, gte, lte } from 'drizzle-orm';
import { cacheLife, cacheTag } from 'next/cache';
import { TAG } from '@/lib/cache/tags';
import { db, schema } from '@/lib/db';
import { berechneTag } from '@/lib/gebetszeiten/berechnung';
import { berlinerDatum } from '@/lib/gebetszeiten/naechstes';
import type { GebetszeitTag } from '@/lib/gebetszeiten/typen';
import { ladeEinstellung } from './einstellungen';

export type GebetszeitenFenster = {
  /** Tag, für den der Server gerendert hat (Kalenderdatum Europe/Berlin) – der Browser wählt dann „heute“. */
  referenz: string;
  tage: GebetszeitTag[];
  quelle: 'import' | 'berechnet';
  bestaetigt: boolean;
};

function tagPlus(datum: string, n: number): string {
  const [j, m, t] = datum.split('-').map(Number);
  return new Date(Date.UTC(j, m - 1, t + n)).toISOString().slice(0, 10);
}

/**
 * Gebetszeiten von gestern bis in 45 Tagen (K-08, ADR 0008): aus dem Import, sonst berechnet.
 * Täglich neu (cacheLife 'days'), sofort nach Import/Einstellung (Tag gebetszeiten).
 */
export async function ladeGebetszeitenFenster(): Promise<GebetszeitenFenster> {
  'use cache';
  cacheLife('days');
  cacheTag(TAG.gebetszeiten);
  const einstellung = await ladeEinstellung('gebetszeiten');
  const referenz = berlinerDatum(new Date());
  const von = tagPlus(referenz, -1);
  const bis = tagPlus(referenz, 45);
  const importiert =
    einstellung.aktiveQuelle === 'import'
      ? await db
          .select()
          .from(schema.gebetszeitTag)
          .where(and(gte(schema.gebetszeitTag.datum, von), lte(schema.gebetszeitTag.datum, bis)))
      : [];
  const nachDatum = new Map(importiert.map((z) => [z.datum, z]));
  const tage: GebetszeitTag[] = [];
  for (let i = -1; i <= 45; i++) {
    const datum = tagPlus(referenz, i);
    const z = nachDatum.get(datum);
    if (z) {
      tage.push({
        datum,
        imsak: z.imsak.slice(0, 5),
        gunes: z.gunes.slice(0, 5),
        ogle: z.ogle.slice(0, 5),
        ikindi: z.ikindi.slice(0, 5),
        aksam: z.aksam.slice(0, 5),
        yatsi: z.yatsi.slice(0, 5),
        quelle: 'import',
      });
    } else {
      tage.push({ datum, ...berechneTag(datum, einstellung), quelle: 'berechnet' });
    }
  }
  const quelle = tage.every((t) => t.quelle === 'import') ? 'import' : 'berechnet';
  return { referenz, tage, quelle, bestaetigt: einstellung.bestaetigt };
}
