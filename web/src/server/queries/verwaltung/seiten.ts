import 'server-only';
import { and, asc, desc, eq, inArray, isNotNull, isNull, like, ne, not, sql } from 'drizzle-orm';
import { z as zod } from 'zod';
import type { SeitenSlugs } from '@/lib/cms/slugs';
import { db, schema } from '@/lib/db';
import type { OrganisationKuerzel } from '@/lib/rechte/matrix';
import { gueltigeBloecke, uebersetzungsstand } from '@/lib/validierung/bloecke';

/**
 * Abfragen der Verwaltung „Seiten“ (ADR 0032). Ungecacht (Verwaltung ist dynamisch); Aufrufer prüfen vorher das Recht
 * (`verlangeSeitenRecht('seite.lesen')`). Organisationsbeschränkung als Argument: `null` = alle, `[]` = keine.
 */
const s = schema.seite;
const f = schema.freigabe;

function imBereich(organisationen: readonly OrganisationKuerzel[] | null) {
  if (organisationen === null) return undefined;
  return organisationen.length ? inArray(s.organisation, [...organisationen]) : sql`false`;
}

export type FreigabeStand = {
  art: 'redaktion' | 'religioes';
  status: 'entwurf' | 'zur_pruefung' | 'geprueft';
  am: Date;
  kommentar: string | null;
};

/** Letzter Eintrag im Freigabe-Verlauf je Inhalt (redaktionell oder religiös). */
export async function ladeFreigabeStaende(inhaltTyp: string, ids?: readonly string[]): Promise<Map<string, FreigabeStand>> {
  if (ids && !ids.length) return new Map();
  const zeilen = await db
    .selectDistinctOn([f.inhaltId], { inhaltId: f.inhaltId, art: f.art, status: f.status, am: f.am, kommentar: f.kommentar })
    .from(f)
    .where(and(eq(f.inhaltTyp, inhaltTyp), ids ? inArray(f.inhaltId, [...ids]) : undefined))
    .orderBy(f.inhaltId, desc(f.am), desc(f.id));
  return new Map(zeilen.map((z) => [z.inhaltId, { art: z.art, status: z.status, am: z.am, kommentar: z.kommentar }]));
}

export type AnzeigeStatus = 'entwurf' | 'zur_pruefung' | 'geplant' | 'veroeffentlicht';

export function anzeigeStatus(
  z: { status: 'entwurf' | 'veroeffentlicht'; veroeffentlichenAm: Date | null },
  freigabe: FreigabeStand | undefined,
  jetzt: Date,
): AnzeigeStatus {
  if (z.status === 'veroeffentlicht') return z.veroeffentlichenAm && z.veroeffentlichenAm > jetzt ? 'geplant' : 'veroeffentlicht';
  return freigabe?.status === 'zur_pruefung' ? 'zur_pruefung' : 'entwurf';
}

export type SeitenZeile = {
  id: string;
  titel: string;
  slugDe: string;
  status: 'entwurf' | 'veroeffentlicht';
  anzeige: AnzeigeStatus;
  pruefArt: 'redaktion' | 'religioes' | null;
  veroeffentlichenAm: Date | null;
  organisation: OrganisationKuerzel | null;
  aktualisiertAm: Date;
  imPapierkorbSeit: Date | null;
  istBeispiel: boolean;
  uebersetzung: { tr: number; en: number };
};

export async function ladeSeitenListe(
  papierkorb: boolean,
  organisationen: readonly OrganisationKuerzel[] | null,
  jetzt: Date,
): Promise<SeitenZeile[]> {
  const zeilen = await db
    .select()
    .from(s)
    .where(and(papierkorb ? isNotNull(s.imPapierkorbSeit) : isNull(s.imPapierkorbSeit), imBereich(organisationen)))
    .orderBy(papierkorb ? desc(s.imPapierkorbSeit) : desc(s.aktualisiertAm));
  const staende = await ladeFreigabeStaende(
    'seite',
    zeilen.map((z) => z.id),
  );
  return zeilen.map((z) => {
    const stand = staende.get(z.id);
    return {
      id: z.id,
      titel: z.titel.de,
      slugDe: z.slugDe,
      status: z.status,
      anzeige: anzeigeStatus(z, stand, jetzt),
      pruefArt: stand?.status === 'zur_pruefung' ? stand.art : null,
      veroeffentlichenAm: z.veroeffentlichenAm,
      organisation: z.organisation,
      aktualisiertAm: z.aktualisiertAm,
      imPapierkorbSeit: z.imPapierkorbSeit,
      istBeispiel: z.istBeispiel,
      uebersetzung: uebersetzungsstand(z.titel, z.beschreibung, gueltigeBloecke(z.bloecke)),
    };
  });
}

/** Eine Seite zum Bearbeiten (auch im Papierkorb), sonst null – auch außerhalb der erlaubten Organisationen. */
export async function ladeSeiteFuerVerwaltung(id: string, organisationen: readonly OrganisationKuerzel[] | null = null) {
  if (!zod.uuid().safeParse(id).success) return null;
  const [z] = await db
    .select()
    .from(s)
    .where(and(eq(s.id, id), imBereich(organisationen)))
    .limit(1);
  return z ?? null;
}

/** Slugs aller übrigen Seiten (Prüfung auf doppelte Adressen). */
export async function ladeAndereSlugs(ohneId?: string): Promise<SeitenSlugs[]> {
  const zeilen = await db
    .select({ de: s.slugDe, tr: s.slugTr, en: s.slugEn })
    .from(s)
    .where(ohneId ? ne(s.id, ohneId) : undefined);
  return zeilen;
}

/**
 * Eine Zeile der Liste „Frühere Fassungen“. `titelDe` und `bausteine` liest die Datenbank aus der Momentaufnahme – nur
 * wenn sie die erwartete Form haben, sonst `null` (alte oder fremde Fassungen lassen die Liste nicht abstürzen, Z-18).
 */
export type RevisionsZeile = {
  id: string;
  erstelltAm: Date;
  von: string | null;
  kommentar: string | null;
  titelDe: string | null;
  bausteine: number | null;
};

export async function ladeRevisionen(inhaltTyp: string, inhaltId: string): Promise<RevisionsZeile[]> {
  const r = schema.revision;
  return db
    .select({
      id: r.id,
      erstelltAm: r.erstelltAm,
      von: schema.user.name,
      kommentar: r.kommentar,
      titelDe: sql<
        string | null
      >`case when jsonb_typeof(${r.inhalt} -> 'titel' -> 'de') = 'string' then ${r.inhalt} -> 'titel' ->> 'de' end`,
      bausteine: sql<
        number | null
      >`case when jsonb_typeof(${r.inhalt} -> 'bloecke') = 'array' then jsonb_array_length(${r.inhalt} -> 'bloecke') end`,
    })
    .from(r)
    .leftJoin(schema.user, eq(schema.user.id, r.erstelltVon))
    .where(and(eq(r.inhaltTyp, inhaltTyp), eq(r.inhaltId, inhaltId)))
    .orderBy(desc(r.erstelltAm), desc(r.id));
}

export async function ladeRevision(id: string) {
  if (!zod.uuid().safeParse(id).success) return null;
  const [z] = await db.select().from(schema.revision).where(eq(schema.revision.id, id)).limit(1);
  return z ?? null;
}

export type SeitenAuswahl = { id: string; titel: string; slugDe: string; status: 'entwurf' | 'veroeffentlicht' };

/** Freie Seiten außerhalb des Papierkorbs (Linkziele in Menüs und Knöpfen). */
export async function ladeSeitenAuswahl(): Promise<SeitenAuswahl[]> {
  const zeilen = await db
    .select({ id: s.id, titel: s.titel, slugDe: s.slugDe, status: s.status })
    .from(s)
    .where(isNull(s.imPapierkorbSeit))
    .orderBy(asc(s.slugDe));
  return zeilen.map((z) => ({ id: z.id, titel: z.titel.de, slugDe: z.slugDe, status: z.status }));
}

export type DateiWahl = { id: string; name: string; groesse: number };

/** Dateien (keine Bilder) aus der Mediathek für den Baustein „Download“, neueste zuerst, höchstens 300. */
export async function ladeDateiAuswahl(): Promise<DateiWahl[]> {
  const m = schema.medium;
  const zeilen = await db
    .select({ id: m.id, alt: m.alt, dateiname: m.dateiname, groesse: m.groesse })
    .from(m)
    .where(and(isNull(m.imPapierkorbSeit), not(like(m.typ, 'image/%'))))
    .orderBy(desc(m.erstelltAm))
    .limit(300);
  return zeilen.map((z) => ({ id: z.id, name: z.dateiname || z.alt.de, groesse: z.groesse }));
}

export type SureWahl = { nr: number; name: string; verseAnzahl: number };

/** Suren für den Baustein „Koranvers“ (Umschrift aus den Tanzil-Metadaten); leer ohne Import. */
export async function ladeSurenAuswahl(): Promise<SureWahl[]> {
  const q = schema.quranSure;
  const zeilen = await db.select({ nr: q.nr, name: q.nameUmschrift, verseAnzahl: q.verseAnzahl }).from(q).orderBy(asc(q.nr));
  return zeilen.map((z) => ({ nr: z.nr, name: z.name ?? '', verseAnzahl: z.verseAnzahl }));
}
