import 'server-only';
import { and, eq, isNull, ne, sql } from 'drizzle-orm';
import { cacheLife, cacheTag } from 'next/cache';
import { TAG } from '@/lib/cache/tags';
import { db, schema } from '@/lib/db';
import type { Mehrsprachig } from '@/lib/db/schema/typen';
import { naechstesVorkommen, wiederholungsart, type Wiederholungsart } from '@/lib/termine';

/** Daten einer Veranstaltung für Karten und Detailseite (serialisierbar für den Cache, Zeiten als ISO). */
export type VeranstaltungsDaten = {
  id: string;
  slug: string;
  titel: Mehrsprachig;
  kurztext: Mehrsprachig | null;
  beschreibung: { de: unknown; tr?: unknown; en?: unknown } | null;
  kategorie: (typeof schema.veranstaltungKategorieEnum.enumValues)[number];
  organisation: 'at' | 'kt' | 'gt' | 'kgt' | null;
  zielgruppe: Mehrsprachig | null;
  teilnehmerHinweis: Mehrsprachig | null;
  ort: Mehrsprachig | null;
  /** nächstes Vorkommen (oder der einmalige Termin) */
  beginn: string;
  ende: string | null;
  wiederholung: Wiederholungsart;
  regel: string | null;
  ausnahmen: string[];
  ersterBeginn: string;
  anmeldungAktiv: boolean;
  plaetze: number | null;
  kosten: 'kostenlos' | 'kostenpflichtig';
  empfohlen: boolean;
  istBeispiel: boolean;
  vergangen: boolean;
  aktualisiertAm: string;
};

const sichtbar = and(eq(schema.veranstaltung.status, 'veroeffentlicht'), isNull(schema.veranstaltung.imPapierkorbSeit));

function zuDaten(v: typeof schema.veranstaltung.$inferSelect, jetzt: Date): VeranstaltungsDaten {
  const regel = { beginn: v.beginn, ende: v.ende, wiederholung: v.wiederholung, ausnahmen: v.ausnahmen };
  const naechstes = naechstesVorkommen(regel, jetzt);
  const vorkommen = naechstes ?? { beginn: v.beginn, ende: v.ende };
  return {
    id: v.id,
    slug: v.slug,
    titel: v.titel,
    kurztext: v.kurztext,
    beschreibung: v.beschreibung,
    kategorie: v.kategorie,
    organisation: v.organisation,
    zielgruppe: v.zielgruppe,
    teilnehmerHinweis: v.teilnehmerHinweis,
    ort: v.ort,
    beginn: vorkommen.beginn.toISOString(),
    ende: vorkommen.ende ? vorkommen.ende.toISOString() : null,
    wiederholung: wiederholungsart(regel),
    regel: v.wiederholung,
    ausnahmen: v.ausnahmen,
    ersterBeginn: v.beginn.toISOString(),
    anmeldungAktiv: v.anmeldungAktiv,
    plaetze: v.plaetze,
    kosten: v.kosten,
    empfohlen: v.empfohlen,
    istBeispiel: v.istBeispiel,
    vergangen: naechstes === null,
    aktualisiertAm: v.aktualisiertAm.toISOString(),
  };
}

/**
 * Alle sichtbaren Veranstaltungen mit nächstem Vorkommen; kommende zuerst (chronologisch), vergangene danach
 * (neueste zuerst). Stündlich neu (Datumsbezug), sofort nach Änderungen (Tag veranstaltungen). ADR 0004.
 */
export async function ladeVeranstaltungen(): Promise<VeranstaltungsDaten[]> {
  'use cache';
  cacheLife('hours');
  cacheTag(TAG.veranstaltungen);
  const jetzt = new Date();
  const zeilen = await db.select().from(schema.veranstaltung).where(sichtbar);
  const daten = zeilen.map((z) => zuDaten(z, jetzt));
  const kommend = daten.filter((d) => !d.vergangen).sort((a, b) => a.beginn.localeCompare(b.beginn));
  const vergangen = daten.filter((d) => d.vergangen).sort((a, b) => b.beginn.localeCompare(a.beginn));
  return [...kommend, ...vergangen];
}

/** Zusätzliche Felder der Detailseite (Migration 0002). */
export type VeranstaltungsDetail = VeranstaltungsDaten & {
  programm: { zeit: string; text: Mehrsprachig }[];
  hinweise: Mehrsprachig[];
  schlagwoerter: Mehrsprachig[];
  veranstalter: { name: string; funktion?: Mehrsprachig } | null;
  kontakt: { name?: string; telefon?: string; email?: string } | null;
};

/** Eine Veranstaltung über ihren Slug (gecacht je Slug, Tag veranstaltung:<id> und veranstaltungen). */
export async function ladeVeranstaltung(slug: string): Promise<VeranstaltungsDetail | null> {
  'use cache';
  cacheLife('hours');
  cacheTag(TAG.veranstaltungen);
  const [z] = await db
    .select()
    .from(schema.veranstaltung)
    .where(and(sichtbar, eq(schema.veranstaltung.slug, slug)))
    .limit(1);
  if (!z) return null;
  cacheTag(TAG.veranstaltung(z.id));
  return {
    ...zuDaten(z, new Date()),
    programm: z.programm,
    hinweise: z.hinweise,
    schlagwoerter: z.schlagwoerter,
    veranstalter: z.veranstalter ?? null,
    kontakt: z.kontakt ?? null,
  };
}

/**
 * Belegte Plätze einer Veranstaltung: Summe der Personenzahl aller nicht abgelehnten Anmeldungen
 * (ohne Entschlüsseln, Spalte `anzahl`). Die Anmelde-Action ruft `updateTag(TAG.anmeldungenVon(id))`.
 */
export async function ladeAnmeldezahl(veranstaltungId: string): Promise<number> {
  'use cache';
  cacheLife('hours');
  cacheTag(TAG.anmeldungen, TAG.anmeldungenVon(veranstaltungId));
  const [z] = await db
    .select({ summe: sql<number>`coalesce(sum(${schema.eingang.anzahl}), 0)::int` })
    .from(schema.eingang)
    .where(
      and(
        eq(schema.eingang.art, 'veranstaltungsanmeldung'),
        eq(schema.eingang.bezugId, veranstaltungId),
        ne(schema.eingang.status, 'abgelehnt'),
      ),
    );
  return z?.summe ?? 0;
}

/** Slugs für generateStaticParams. */
export async function ladeVeranstaltungsSlugs(): Promise<string[]> {
  'use cache';
  cacheLife('hours');
  cacheTag(TAG.veranstaltungen);
  const zeilen = await db.select({ slug: schema.veranstaltung.slug }).from(schema.veranstaltung).where(sichtbar);
  return zeilen.map((z) => z.slug);
}
