import 'server-only';
import { eq } from 'drizzle-orm';
import { cacheLife, cacheTag } from 'next/cache';
import { TAG } from '@/lib/cache/tags';
import { db, schema } from '@/lib/db';
import { datenbankVerfuegbar } from '@/lib/db/verfuegbar';
import { ordnungAus, STARTSEITE_EINSTELLUNG, standardOrdnung, type StartseitenOrdnung } from '@/lib/startseite/abschnitte';

/**
 * Reihenfolge und Sichtbarkeit der Startseiten-Abschnitte (F-40, MUSTER 2): Einstellung `startseite` aus der Tabelle
 * `einstellung`, gecacht mit eigenem Tag (`TAG.startseite`). Ohne Datenbank (Beispielmodus, ADR 0019), ohne Eintrag oder
 * bei ungültigem Wert gilt die Reihenfolge des Bestands (`ordnungAus`). Liest keine Cookies und keine Header – die
 * Startseite bleibt statisch.
 */
export async function ladeStartseitenOrdnung(): Promise<StartseitenOrdnung> {
  'use cache: remote';
  cacheLife('max');
  cacheTag(TAG.startseite);
  if (!datenbankVerfuegbar()) return standardOrdnung();
  const [zeile] = await db
    .select({ wert: schema.einstellung.wert })
    .from(schema.einstellung)
    .where(eq(schema.einstellung.schluessel, STARTSEITE_EINSTELLUNG))
    .limit(1);
  return ordnungAus(zeile?.wert ?? null);
}
