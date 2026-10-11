import 'server-only';
import { and, desc, eq, isNotNull, isNull, like, or, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db, schema } from '@/lib/db';

/**
 * Verwaltung „Medien“ (C11, V11, ADR 0007). Ohne Cache. Verwendung: Bild-Spalten von Veranstaltungen, Neuigkeiten und
 * Kursen sowie Bildknoten (`mediumId`) im Rich-Text der Neuigkeiten – ein genutztes Medium wird nie gelöscht.
 */
const m = schema.medium;

export const medienFilter = z.object({
  ansicht: z.enum(['aktiv', 'papierkorb']).catch('aktiv').default('aktiv'),
  art: z.enum(['bilder', 'pdf']).optional().catch(undefined),
});

export type MediumZeile = typeof m.$inferSelect;

export async function ladeMedien(filter: z.infer<typeof medienFilter>): Promise<MediumZeile[]> {
  return db
    .select()
    .from(m)
    .where(
      and(
        filter.ansicht === 'papierkorb' ? isNotNull(m.imPapierkorbSeit) : isNull(m.imPapierkorbSeit),
        filter.art === 'pdf' ? eq(m.typ, 'application/pdf') : filter.art === 'bilder' ? like(m.typ, 'image/%') : undefined,
      ),
    )
    .orderBy(desc(m.erstelltAm))
    .limit(500);
}

export async function ladeMedium(id: string): Promise<MediumZeile | null> {
  if (!z.uuid().safeParse(id).success) return null;
  const [z0] = await db.select().from(m).where(eq(m.id, id)).limit(1);
  return z0 ?? null;
}

export async function ladeMediumNachSchluessel(schluessel: string): Promise<MediumZeile | null> {
  const [z0] = await db.select().from(m).where(eq(m.schluessel, schluessel)).limit(1);
  return z0 ?? null;
}

export type Verwendung = { art: 'veranstaltung' | 'nachricht' | 'kurs'; id: string; titel: string };

/** Wo wird das Medium genutzt? (Bild-Spalten und Bildknoten im Rich-Text der Neuigkeiten) */
export async function verwendungVon(id: string): Promise<Verwendung[]> {
  const v = schema.veranstaltung;
  const n = schema.nachricht;
  const k = schema.kurs;
  const imText = sql`${n.inhalt}::text like ${`%"mediumId":"${id}"%`}`;
  const [va, na, ku] = await Promise.all([
    db.select({ id: v.id, titel: v.titel }).from(v).where(eq(v.bildId, id)),
    db
      .select({ id: n.id, titel: n.titel })
      .from(n)
      .where(or(eq(n.bildId, id), imText)),
    db.select({ id: k.id, titel: k.titel }).from(k).where(eq(k.bildId, id)),
  ]);
  return [
    ...va.map((z0) => ({ art: 'veranstaltung' as const, id: z0.id, titel: z0.titel.de })),
    ...na.map((z0) => ({ art: 'nachricht' as const, id: z0.id, titel: z0.titel.de })),
    ...ku.map((z0) => ({ art: 'kurs' as const, id: z0.id, titel: z0.titel.de })),
  ];
}
