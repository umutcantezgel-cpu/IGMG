import 'server-only';
import { and, asc, eq, isNotNull, isNull, sql } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import type { Mehrsprachig } from '@/lib/db/schema/typen';

/**
 * Gemeinsame Hatim (AUFTRAG 3.10, B-19): 30 Cüz werden an angemeldete Gemeindemitglieder verteilt. Eine Übernahme ist
 * eindeutig (bedingtes UPDATE, auch bei gleichzeitigen Klicks). Öffentlich erscheinen nur Zahlen und der Ring – nie Namen.
 */
export type CuzStand = 'frei' | 'vergeben' | 'gelesen';
export type HatimOeffentlich = {
  id: string;
  titel: Mehrsprachig;
  anlass: Mehrsprachig | null;
  beginn: string;
  ziel: string | null;
  status: 'offen' | 'abgeschlossen' | 'archiviert';
  teile: CuzStand[];
  vergeben: number;
  gelesen: number;
};

export async function legeHatimAn(
  e: { titel: Mehrsprachig; anlass?: Mehrsprachig | null; beginn: string; ziel?: string | null },
  von: string,
): Promise<string> {
  return db.transaction(async (tx) => {
    const [h] = await tx
      .insert(schema.hatim)
      .values({ titel: e.titel, anlass: e.anlass ?? null, beginn: e.beginn, ziel: e.ziel ?? null, erstelltVon: von })
      .returning({ id: schema.hatim.id });
    await tx.insert(schema.hatimTeil).values(Array.from({ length: 30 }, (_, i) => ({ hatimId: h.id, cuz: i + 1 })));
    return h.id;
  });
}

export async function ladeHatim(id: string, nurVeroeffentlicht = true): Promise<HatimOeffentlich | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const [h] = await db.select().from(schema.hatim).where(eq(schema.hatim.id, id));
  if (!h || (nurVeroeffentlicht && h.oeffentlich !== 'veroeffentlicht')) return null;
  const teile = await db
    .select({ cuz: schema.hatimTeil.cuz, benutzerId: schema.hatimTeil.benutzerId, gelesenAm: schema.hatimTeil.gelesenAm })
    .from(schema.hatimTeil)
    .where(eq(schema.hatimTeil.hatimId, id))
    .orderBy(asc(schema.hatimTeil.cuz));
  const stand = teile.map((t): CuzStand => (t.gelesenAm ? 'gelesen' : t.benutzerId ? 'vergeben' : 'frei'));
  return {
    id: h.id,
    titel: h.titel,
    anlass: h.anlass ?? null,
    beginn: h.beginn,
    ziel: h.ziel,
    status: h.status,
    teile: stand,
    vergeben: stand.filter((s) => s !== 'frei').length,
    gelesen: stand.filter((s) => s === 'gelesen').length,
  };
}

export async function veroeffentlichteHatims(): Promise<HatimOeffentlich[]> {
  const ids = await db
    .select({ id: schema.hatim.id })
    .from(schema.hatim)
    .where(eq(schema.hatim.oeffentlich, 'veroeffentlicht'))
    .orderBy(sql`${schema.hatim.beginn} desc`);
  return (await Promise.all(ids.map((z) => ladeHatim(z.id)))).filter((h): h is HatimOeffentlich => h !== null);
}

export type UebernahmeErgebnis = 'ok' | 'vergeben' | 'geschlossen' | 'grenze';

/** Cüz übernehmen: nur frei, nur offene Hatim, höchstens 3 offene Cüz je Person und Hatim. */
export async function uebernehmeCuz(hatimId: string, cuz: number, benutzerId: string): Promise<UebernahmeErgebnis> {
  if (!Number.isInteger(cuz) || cuz < 1 || cuz > 30) return 'vergeben';
  const [h] = await db
    .select({ status: schema.hatim.status, oeffentlich: schema.hatim.oeffentlich })
    .from(schema.hatim)
    .where(eq(schema.hatim.id, hatimId));
  if (!h || h.status !== 'offen' || h.oeffentlich !== 'veroeffentlicht') return 'geschlossen';
  const offen = await db
    .select({ cuz: schema.hatimTeil.cuz })
    .from(schema.hatimTeil)
    .where(and(eq(schema.hatimTeil.hatimId, hatimId), eq(schema.hatimTeil.benutzerId, benutzerId), isNull(schema.hatimTeil.gelesenAm)));
  if (offen.length >= 3) return 'grenze';
  const r = await db
    .update(schema.hatimTeil)
    .set({ benutzerId, vergebenAm: new Date() })
    .where(and(eq(schema.hatimTeil.hatimId, hatimId), eq(schema.hatimTeil.cuz, cuz), isNull(schema.hatimTeil.benutzerId)))
    .returning({ cuz: schema.hatimTeil.cuz });
  return r.length ? 'ok' : 'vergeben';
}

/** Eigenen Cüz als gelesen markieren; sind alle 30 gelesen, ist die Hatim abgeschlossen. */
export async function markiereGelesen(hatimId: string, cuz: number, benutzerId: string): Promise<boolean> {
  const r = await db
    .update(schema.hatimTeil)
    .set({ gelesenAm: new Date() })
    .where(
      and(
        eq(schema.hatimTeil.hatimId, hatimId),
        eq(schema.hatimTeil.cuz, cuz),
        eq(schema.hatimTeil.benutzerId, benutzerId),
        isNull(schema.hatimTeil.gelesenAm),
      ),
    )
    .returning({ cuz: schema.hatimTeil.cuz });
  if (!r.length) return false;
  const [{ gelesen }] = await db
    .select({ gelesen: sql<number>`count(*)::int` })
    .from(schema.hatimTeil)
    .where(and(eq(schema.hatimTeil.hatimId, hatimId), isNotNull(schema.hatimTeil.gelesenAm)));
  if (gelesen === 30) await db.update(schema.hatim).set({ status: 'abgeschlossen' }).where(eq(schema.hatim.id, hatimId));
  return true;
}

/** Eigenen, noch nicht gelesenen Cüz zurückgeben. */
export async function gebeZurueck(hatimId: string, cuz: number, benutzerId: string): Promise<boolean> {
  const r = await db
    .update(schema.hatimTeil)
    .set({ benutzerId: null, vergebenAm: null })
    .where(
      and(
        eq(schema.hatimTeil.hatimId, hatimId),
        eq(schema.hatimTeil.cuz, cuz),
        eq(schema.hatimTeil.benutzerId, benutzerId),
        isNull(schema.hatimTeil.gelesenAm),
      ),
    )
    .returning({ cuz: schema.hatimTeil.cuz });
  return r.length > 0;
}

/** Eigene Cüz über alle Hatims (Mein Bereich). */
export async function meineCuz(benutzerId: string) {
  return db
    .select({
      hatimId: schema.hatimTeil.hatimId,
      cuz: schema.hatimTeil.cuz,
      gelesenAm: schema.hatimTeil.gelesenAm,
      titel: schema.hatim.titel,
      status: schema.hatim.status,
    })
    .from(schema.hatimTeil)
    .innerJoin(schema.hatim, eq(schema.hatim.id, schema.hatimTeil.hatimId))
    .where(eq(schema.hatimTeil.benutzerId, benutzerId))
    .orderBy(asc(schema.hatimTeil.cuz));
}
