import 'server-only';
import { and, desc, eq, notInArray } from 'drizzle-orm';
import { db, schema } from '@/lib/db';

/**
 * Revisionen (ADR 0032): Jedes Speichern legt eine Fassung in `revision` ab; je Inhalt bleiben die letzten 30.
 * `inhalt` ist eine vollständige Momentaufnahme der bearbeitbaren Felder (keine Personendaten außer der Konto-ID).
 */
export const REVISIONEN_JE_INHALT = 30;

type Schreiber = Pick<typeof db, 'insert' | 'select' | 'delete'>;

export async function schreibeRevision(
  tx: Schreiber,
  r: { inhaltTyp: string; inhaltId: string; inhalt: unknown; erstelltVon: string | null; kommentar?: string | null },
): Promise<void> {
  const rv = schema.revision;
  await tx.insert(rv).values({
    inhaltTyp: r.inhaltTyp,
    inhaltId: r.inhaltId,
    inhalt: r.inhalt,
    erstelltVon: r.erstelltVon,
    kommentar: r.kommentar ?? null,
  });
  const behalten = await tx
    .select({ id: rv.id })
    .from(rv)
    .where(and(eq(rv.inhaltTyp, r.inhaltTyp), eq(rv.inhaltId, r.inhaltId)))
    .orderBy(desc(rv.erstelltAm), desc(rv.id))
    .limit(REVISIONEN_JE_INHALT);
  await tx.delete(rv).where(
    and(
      eq(rv.inhaltTyp, r.inhaltTyp),
      eq(rv.inhaltId, r.inhaltId),
      notInArray(
        rv.id,
        behalten.map((b) => b.id),
      ),
    ),
  );
}
