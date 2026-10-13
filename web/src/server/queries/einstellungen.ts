import 'server-only';
import { eq } from 'drizzle-orm';
import { cacheLife, cacheTag } from 'next/cache';
import type { z } from 'zod';
import { TAG } from '@/lib/cache/tags';
import { db, schema } from '@/lib/db';
import { datenbankVerfuegbar } from '@/lib/db/verfuegbar';
import { EINSTELLUNG } from '@/lib/validierung/einstellungen';

type Art = keyof typeof EINSTELLUNG;

/** Liest eine Einstellung; ungültige oder fehlende Werte → Standardwerte des Schemas. Gecacht (ADR 0004). */
export async function ladeEinstellung<A extends Art>(art: A): Promise<z.infer<(typeof EINSTELLUNG)[A]['schema']>> {
  'use cache: remote';
  cacheLife('max');
  cacheTag(TAG.einstellungen);
  // Beispielmodus ohne Datenbank (ADR 0019): nie abstürzen – leer bzw. Standardwerte, die Seite antwortet mit 404
  if (!datenbankVerfuegbar()) return EINSTELLUNG[art].schema.parse({}) as z.infer<(typeof EINSTELLUNG)[A]['schema']>;
  const { schluessel, schema: zod } = EINSTELLUNG[art];
  const [zeile] = await db
    .select({ wert: schema.einstellung.wert })
    .from(schema.einstellung)
    .where(eq(schema.einstellung.schluessel, schluessel))
    .limit(1);
  const ergebnis = zod.safeParse(zeile?.wert ?? {});
  return (ergebnis.success ? ergebnis.data : zod.parse({})) as z.infer<(typeof EINSTELLUNG)[A]['schema']>;
}
