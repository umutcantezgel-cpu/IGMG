import 'server-only';
import { eq } from 'drizzle-orm';
import { cacheLife, cacheTag } from 'next/cache';
import type { z } from 'zod';
import { TAG } from '@/lib/cache/tags';
import { db, schema } from '@/lib/db';
import { SEITENINHALT, type SeitenBereich } from '@/lib/validierung/seiteninhalte';

export type SeitenInhalt<B extends SeitenBereich> = z.infer<(typeof SEITENINHALT)[B]> & { istBeispiel: boolean };

/** Lädt einen Seiteninhalt (gecacht, Tag seiteninhalt:<bereich>); fehlt er, Standardwerte mit Platzhaltern. */
export async function ladeSeiteninhalt<B extends SeitenBereich>(bereich: B): Promise<SeitenInhalt<B>> {
  'use cache';
  cacheLife('max');
  cacheTag(TAG.seiteninhalt(bereich), 'seiteninhalt');
  const [zeile] = await db.select().from(schema.seiteninhalt).where(eq(schema.seiteninhalt.bereich, bereich)).limit(1);
  const zod = SEITENINHALT[bereich];
  const geprueft = zod.safeParse(zeile?.inhalt ?? {});
  const daten = geprueft.success ? geprueft.data : zod.parse({});
  return { ...daten, istBeispiel: zeile ? zeile.istBeispiel : true } as SeitenInhalt<B>;
}
