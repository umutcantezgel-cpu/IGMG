import 'server-only';
import { asc, desc, eq } from 'drizzle-orm';
import { protokolliere } from '@/lib/audit';
import { db, schema } from '@/lib/db';
import { ladeHatim, type HatimOeffentlich } from '@/lib/hatim/dienst';
import type { Angemeldet } from '@/lib/rechte/pruefe';

/**
 * Hatim in der Verwaltung (AUFTRAG 3.10) ohne Cache. Aufrufer prüfen vorher `hatim.bearbeiten`.
 * Namen der Übernehmenden liest nur `ladeHatimNamen` – jeder Abruf steht im Audit-Log (ohne Namen).
 */
export type HatimVerwaltung = HatimOeffentlich & { oeffentlich: 'entwurf' | 'veroeffentlicht'; erstelltAm: Date };

export async function ladeHatimVerwaltungsListe(): Promise<HatimVerwaltung[]> {
  const zeilen = await db
    .select({ id: schema.hatim.id, oeffentlich: schema.hatim.oeffentlich, erstelltAm: schema.hatim.erstelltAm })
    .from(schema.hatim)
    .orderBy(desc(schema.hatim.beginn), desc(schema.hatim.erstelltAm));
  const liste = await Promise.all(
    zeilen.map(async (z) => {
      const h = await ladeHatim(z.id, false);
      return h ? { ...h, oeffentlich: z.oeffentlich, erstelltAm: z.erstelltAm } : null;
    }),
  );
  return liste.filter((h): h is HatimVerwaltung => h !== null);
}

export async function ladeHatimFuerVerwaltung(id: string): Promise<HatimVerwaltung | null> {
  const h = await ladeHatim(id, false);
  if (!h) return null;
  const [z] = await db
    .select({ oeffentlich: schema.hatim.oeffentlich, erstelltAm: schema.hatim.erstelltAm })
    .from(schema.hatim)
    .where(eq(schema.hatim.id, id));
  return { ...h, oeffentlich: z.oeffentlich, erstelltAm: z.erstelltAm };
}

export type CuzBelegung = { cuz: number; name: string | null; vergebenAm: Date | null; gelesenAm: Date | null };

/** Wer liest welchen Cüz (nur Verwaltung, mit Audit `hatim.namen_gelesen`). */
export async function ladeHatimNamen(id: string, leser: Pick<Angemeldet, 'benutzerId'>): Promise<CuzBelegung[]> {
  const zeilen = await db
    .select({
      cuz: schema.hatimTeil.cuz,
      name: schema.user.name,
      vergebenAm: schema.hatimTeil.vergebenAm,
      gelesenAm: schema.hatimTeil.gelesenAm,
    })
    .from(schema.hatimTeil)
    .leftJoin(schema.user, eq(schema.user.id, schema.hatimTeil.benutzerId))
    .where(eq(schema.hatimTeil.hatimId, id))
    .orderBy(asc(schema.hatimTeil.cuz));
  await protokolliere({ benutzerId: leser.benutzerId, aktion: 'hatim.namen_gelesen', zielTyp: 'hatim', zielId: id });
  return zeilen.map((z) => ({ ...z, name: z.name ?? null }));
}
