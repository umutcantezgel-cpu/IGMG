import 'server-only';
import { and, asc, desc, eq, isNotNull, isNull, ne, sql } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { naechstesVorkommen } from '@/lib/termine';

/**
 * Abfragen der Verwaltung „Veranstaltungen“ (V02). Nicht gecacht – Verwaltungsseiten sind dynamisch (ADR 0016).
 * Aufrufer prüfen vorher `verlangeSeitenRecht('veranstaltung.lesen')`.
 */
const v = schema.veranstaltung;
const e = schema.eingang;

const belegt = db
  .select({ bezugId: e.bezugId, summe: sql<number>`sum(${e.anzahl})::int`.as('summe') })
  .from(e)
  .where(and(eq(e.art, 'veranstaltungsanmeldung'), ne(e.status, 'abgelehnt')))
  .groupBy(e.bezugId)
  .as('belegt');

export type VerwaltungsZeile = {
  id: string;
  slug: string;
  titel: string;
  kategorie: (typeof schema.veranstaltungKategorieEnum.enumValues)[number];
  organisation: 'at' | 'kt' | 'gt' | 'kgt' | null;
  status: 'entwurf' | 'veroeffentlicht';
  beginn: Date;
  ende: Date | null;
  wiederkehrend: boolean;
  vergangen: boolean;
  anmeldungAktiv: boolean;
  plaetze: number | null;
  angemeldet: number;
  imPapierkorbSeit: Date | null;
  istBeispiel: boolean;
};

/** Liste: aktive (ohne Papierkorb) oder Papierkorb; kommende zuerst chronologisch, dann vergangene. */
export async function ladeVerwaltungsListe(papierkorb: boolean, jetzt = new Date()): Promise<VerwaltungsZeile[]> {
  const zeilen = await db
    .select({
      id: v.id,
      slug: v.slug,
      titel: v.titel,
      kategorie: v.kategorie,
      organisation: v.organisation,
      status: v.status,
      beginn: v.beginn,
      ende: v.ende,
      wiederholung: v.wiederholung,
      ausnahmen: v.ausnahmen,
      anmeldungAktiv: v.anmeldungAktiv,
      plaetze: v.plaetze,
      angemeldet: sql<number>`coalesce(${belegt.summe}, 0)`,
      imPapierkorbSeit: v.imPapierkorbSeit,
      istBeispiel: v.istBeispiel,
    })
    .from(v)
    .leftJoin(belegt, eq(belegt.bezugId, v.id))
    .where(papierkorb ? isNotNull(v.imPapierkorbSeit) : isNull(v.imPapierkorbSeit))
    .orderBy(papierkorb ? desc(v.imPapierkorbSeit) : asc(v.beginn));
  const liste = zeilen.map((z) => {
    const n = naechstesVorkommen({ beginn: z.beginn, ende: z.ende, wiederholung: z.wiederholung, ausnahmen: z.ausnahmen }, jetzt);
    return {
      id: z.id,
      slug: z.slug,
      titel: z.titel.de,
      kategorie: z.kategorie,
      organisation: z.organisation,
      status: z.status,
      beginn: n?.beginn ?? z.beginn,
      ende: n ? n.ende : z.ende,
      wiederkehrend: Boolean(z.wiederholung),
      vergangen: n === null,
      anmeldungAktiv: z.anmeldungAktiv,
      plaetze: z.plaetze,
      angemeldet: Number(z.angemeldet),
      imPapierkorbSeit: z.imPapierkorbSeit,
      istBeispiel: z.istBeispiel,
    };
  });
  if (papierkorb) return liste;
  const kommend = liste.filter((z) => !z.vergangen).sort((a, b) => a.beginn.getTime() - b.beginn.getTime());
  const vergangen = liste.filter((z) => z.vergangen).sort((a, b) => b.beginn.getTime() - a.beginn.getTime());
  return [...kommend, ...vergangen];
}

/** Ein Datensatz zum Bearbeiten (auch im Papierkorb), sonst null. */
export async function ladeVeranstaltungFuerVerwaltung(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const [z] = await db.select().from(v).where(eq(v.id, id)).limit(1);
  return z ?? null;
}

/** Zähler für die Seitenleiste: Veranstaltungen ohne Papierkorb. */
export async function zaehleVeranstaltungen(): Promise<number> {
  const [z] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(v)
    .where(isNull(v.imPapierkorbSeit));
  return z?.n ?? 0;
}
