import 'server-only';
import { and, asc, eq, gte, lte } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { fehlendeVorschlaege, HOECHSTER_ABSTAND } from '@/lib/kalender/abgleich';
import { besondereTage, type BesondererTagVorschlag } from '@/lib/kalender/besondere-tage';
import { tagPlus } from '@/lib/kalender/raster';

/** Besondere Tage in der Verwaltung (AUFTRAG 3.10, ADR 0030), ohne Cache. Aufrufer prüfen `kalender.bearbeiten`. */
export type BesondererTagZeile = typeof schema.besondererTag.$inferSelect;

/** Einträge eines Jahres, mit Rand (± {@link HOECHSTER_ABSTAND} Tage) für den Abgleich mit den Vorschlägen. */
async function eintraegeUm(jahr: number): Promise<BesondererTagZeile[]> {
  return db
    .select()
    .from(schema.besondererTag)
    .where(
      and(
        gte(schema.besondererTag.datum, tagPlus(`${jahr}-01-01`, -HOECHSTER_ABSTAND)),
        lte(schema.besondererTag.datum, tagPlus(`${jahr}-12-31`, HOECHSTER_ABSTAND)),
      ),
    )
    .orderBy(asc(schema.besondererTag.datum));
}

export async function ladeBesondereTageJahr(jahr: number): Promise<{ eintraege: BesondererTagZeile[]; offen: BesondererTagVorschlag[] }> {
  const alle = await eintraegeUm(jahr);
  return {
    eintraege: alle.filter((z) => z.datum.startsWith(String(jahr))),
    offen: fehlendeVorschlaege(besondereTage(jahr), alle),
  };
}

export async function ladeBesonderenTag(id: string): Promise<BesondererTagZeile | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const [z] = await db.select().from(schema.besondererTag).where(eq(schema.besondererTag.id, id));
  return z ?? null;
}

/** Offene Vorschläge eines Jahres (für die Übernahme in der Action). */
export async function offeneVorschlaege(jahr: number): Promise<BesondererTagVorschlag[]> {
  return fehlendeVorschlaege(besondereTage(jahr), await eintraegeUm(jahr));
}
