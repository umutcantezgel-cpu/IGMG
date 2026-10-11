import 'server-only';
import { and, desc, eq, isNotNull, isNull, like, or, sql } from 'drizzle-orm';
import type { AnyPgColumn } from 'drizzle-orm/pg-core';
import { z } from 'zod';
import { db, schema } from '@/lib/db';

/**
 * Verwaltung „Medien“ (C11, V11, ADR 0007). Ohne Cache. Verwendung: Bild-Spalten von Veranstaltungen, Neuigkeiten und
 * Kursen sowie Bildknoten (`mediumId`) im Rich-Text von Neuigkeiten und Veranstaltungen – ein genutztes Medium wird
 * nie gelöscht.
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

/**
 * Bildknoten im Rich-Text (alle Sprachen, jede Tiefe) mit dieser Medien-ID. Strukturell über JSONPath statt Textsuche
 * (Tor B/C SP-C2 B1: `jsonb::text` schreibt `"mediumId": "…"` mit Leerzeichen, ein LIKE ohne fand nie etwas).
 */
const imRichText = (spalte: AnyPgColumn, id: string) =>
  sql`jsonb_path_exists(coalesce(${spalte}, '{}'::jsonb), '$.** ? (@.type == "image" && @.attrs.mediumId == $id)', jsonb_build_object('id', ${id}::text))`;

/** Wo wird das Medium genutzt? (Bild-Spalten und Bildknoten im Rich-Text von Neuigkeiten und Veranstaltungen) */
export async function verwendungVon(id: string): Promise<Verwendung[]> {
  const v = schema.veranstaltung;
  const n = schema.nachricht;
  const k = schema.kurs;
  const [va, na, ku] = await Promise.all([
    db
      .select({ id: v.id, titel: v.titel })
      .from(v)
      .where(or(eq(v.bildId, id), imRichText(v.beschreibung, id))),
    db
      .select({ id: n.id, titel: n.titel })
      .from(n)
      .where(or(eq(n.bildId, id), imRichText(n.inhalt, id))),
    db.select({ id: k.id, titel: k.titel }).from(k).where(eq(k.bildId, id)),
  ]);
  return [
    ...va.map((z0) => ({ art: 'veranstaltung' as const, id: z0.id, titel: z0.titel.de })),
    ...na.map((z0) => ({ art: 'nachricht' as const, id: z0.id, titel: z0.titel.de })),
    ...ku.map((z0) => ({ art: 'kurs' as const, id: z0.id, titel: z0.titel.de })),
  ];
}

/** Eintrag der Bildauswahl (C11b): nur Bilder außerhalb des Papierkorbs, neueste zuerst. */
export type BildWahl = { id: string; url: string; alt: string; breite: number; hoehe: number; dateiname: string | null };

/**
 * Bilder für die Auswahl in Formularen (Titelbild, Bild im Text). Die Formularseite lädt die Liste und gibt sie dem
 * Formular mit – keine eigene Schnittstelle. Höchstens 300 Einträge (älteste fallen weg; Hinweis im Dialog).
 */
export const BILDWAHL_GRENZE = 300;
export async function ladeBildAuswahl(): Promise<BildWahl[]> {
  const zeilen = await db
    .select({ id: m.id, schluessel: m.schluessel, alt: m.alt, breite: m.breite, hoehe: m.hoehe, dateiname: m.dateiname })
    .from(m)
    .where(and(isNull(m.imPapierkorbSeit), like(m.typ, 'image/%'), isNotNull(m.breite), isNotNull(m.hoehe)))
    .orderBy(desc(m.erstelltAm))
    .limit(BILDWAHL_GRENZE);
  return zeilen.map((z) => ({
    id: z.id,
    url: `/medien/${z.schluessel}`,
    alt: z.alt.de,
    breite: z.breite!,
    hoehe: z.hoehe!,
    dateiname: z.dateiname,
  }));
}
