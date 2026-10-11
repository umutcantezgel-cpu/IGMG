import 'server-only';
import { and, desc, eq, inArray, isNotNull, isNull, sql } from 'drizzle-orm';
import { z as zod } from 'zod';
import { db, schema } from '@/lib/db';
import type { OrganisationKuerzel } from '@/lib/rechte/matrix';

/**
 * Abfragen der Verwaltung „Neuigkeiten“ (V03). Nicht gecacht – Verwaltungsseiten sind dynamisch (ADR 0016).
 * Aufrufer prüfen vorher `verlangeSeitenRecht('nachricht.lesen')`. Die Organisationsbeschränkung (K-06) kommt als
 * Argument und wird hier in der Abfrage angewendet: `null` = alle, `[]` = keine.
 */
const n = schema.nachricht;

export type VerwaltungsZeile = {
  id: string;
  slug: string;
  titel: string;
  kategorie: (typeof schema.nachrichtKategorieEnum.enumValues)[number];
  organisation: OrganisationKuerzel | null;
  status: 'entwurf' | 'veroeffentlicht';
  /** Veröffentlichungsdatum, sonst Erstellungsdatum (wie auf der öffentlichen Seite). */
  datum: Date;
  imPapierkorbSeit: Date | null;
  istBeispiel: boolean;
};

function imBereich(organisationen: readonly OrganisationKuerzel[] | null) {
  if (organisationen === null) return undefined;
  return organisationen.length ? inArray(n.organisation, [...organisationen]) : sql`false`;
}

/**
 * Liste: aktive Beiträge (ohne Papierkorb) oder der Papierkorb. Neueste zuerst; im Papierkorb nach Löschdatum.
 * `organisationen` (Organisationsredaktion, K-06): nur Beiträge dieser Organisationen; `null` = alle.
 */
export async function ladeVerwaltungsListe(
  papierkorb: boolean,
  organisationen: readonly OrganisationKuerzel[] | null = null,
): Promise<VerwaltungsZeile[]> {
  const zeilen = await db
    .select({
      id: n.id,
      slug: n.slug,
      titel: n.titel,
      kategorie: n.kategorie,
      organisation: n.organisation,
      status: n.status,
      veroeffentlichtAm: n.veroeffentlichtAm,
      erstelltAm: n.erstelltAm,
      imPapierkorbSeit: n.imPapierkorbSeit,
      istBeispiel: n.istBeispiel,
    })
    .from(n)
    .where(and(papierkorb ? isNotNull(n.imPapierkorbSeit) : isNull(n.imPapierkorbSeit), imBereich(organisationen)))
    .orderBy(papierkorb ? desc(n.imPapierkorbSeit) : desc(sql`coalesce(${n.veroeffentlichtAm}, ${n.erstelltAm})`));
  return zeilen.map((z) => ({
    id: z.id,
    slug: z.slug,
    titel: z.titel.de,
    kategorie: z.kategorie,
    organisation: z.organisation,
    status: z.status,
    datum: z.veroeffentlichtAm ?? z.erstelltAm,
    imPapierkorbSeit: z.imPapierkorbSeit,
    istBeispiel: z.istBeispiel,
  }));
}

/** Ein Beitrag zum Bearbeiten (auch im Papierkorb), sonst `null` – auch wenn er außerhalb `organisationen` liegt. */
export async function ladeNachrichtFuerVerwaltung(id: string, organisationen: readonly OrganisationKuerzel[] | null = null) {
  if (!zod.uuid().safeParse(id).success) return null;
  const [z] = await db
    .select()
    .from(n)
    .where(and(eq(n.id, id), imBereich(organisationen)))
    .limit(1);
  return z ?? null;
}
