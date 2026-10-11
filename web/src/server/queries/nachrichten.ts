import 'server-only';
import { and, desc, eq, isNull, lte, ne } from 'drizzle-orm';
import { cacheLife, cacheTag } from 'next/cache';
import { TAG } from '@/lib/cache/tags';
import { db, schema } from '@/lib/db';
import type { Mehrsprachig, MehrsprachigRich } from '@/lib/db/schema/typen';
import { bildIdsAus, ladeBilder, type BildDaten, type BildKarte } from '@/lib/medien/bild';

export type NachrichtDaten = {
  id: string;
  slug: string;
  titel: Mehrsprachig;
  kurztext: Mehrsprachig | null;
  inhalt: MehrsprachigRich | null;
  kategorie: (typeof schema.nachrichtKategorieEnum.enumValues)[number];
  wichtig: boolean;
  empfohlen: boolean;
  lesezeit: number | null;
  veroeffentlichtAm: string;
  istBeispiel: boolean;
  organisation: 'at' | 'kt' | 'gt' | 'kgt' | null;
  schlagwoerter: Mehrsprachig[];
  /** Titelbild aus der Mediathek (C11b); null = Platzhalter */
  bild: BildDaten | null;
};

/** Detailseite: zusätzlich die Bilder der Bildknoten im Text (alle Sprachen), nach Medien-ID. */
export type NachrichtDetail = NachrichtDaten & { textBilder: BildKarte };

function zuDaten(n: typeof schema.nachricht.$inferSelect, bilder: BildKarte): NachrichtDaten {
  return {
    id: n.id,
    slug: n.slug,
    titel: n.titel,
    kurztext: n.kurztext,
    inhalt: n.inhalt,
    kategorie: n.kategorie,
    wichtig: n.wichtig,
    empfohlen: n.empfohlen,
    lesezeit: n.lesezeit,
    veroeffentlichtAm: (n.veroeffentlichtAm ?? n.erstelltAm).toISOString(),
    istBeispiel: n.istBeispiel,
    organisation: n.organisation,
    schlagwoerter: n.schlagwoerter,
    bild: (n.bildId && bilder[n.bildId]) || null,
  };
}

/** Zeilen → Daten mit Titelbildern (eine Abfrage für alle). Aufrufer setzen `cacheTag(TAG.medien)`. */
async function mitBildern(zeilen: (typeof schema.nachricht.$inferSelect)[]): Promise<NachrichtDaten[]> {
  const bilder = await ladeBilder(zeilen.map((z) => z.bildId));
  return zeilen.map((z) => zuDaten(z, bilder));
}

/**
 * Öffentlich sichtbar: veröffentlicht, nicht im Papierkorb, Veröffentlichungsdatum erreicht – für Listen, Teaser,
 * Detailseite und Slugs gleich (Tor A SP-A-08: geplante Beiträge nicht vorab per Adresse abrufbar).
 */
function sichtbarInListen() {
  return and(
    eq(schema.nachricht.status, 'veroeffentlicht'),
    isNull(schema.nachricht.imPapierkorbSeit),
    lte(schema.nachricht.veroeffentlichtAm, new Date()),
  );
}

/** Veröffentlichte Nachrichten, neueste zuerst. Geplante Beiträge (Datum in der Zukunft) erscheinen erst ab ihrem Datum. */
export async function ladeNachrichten(): Promise<NachrichtDaten[]> {
  'use cache';
  cacheLife('hours');
  cacheTag(TAG.nachrichten, TAG.medien);
  const zeilen = await db.select().from(schema.nachricht).where(sichtbarInListen()).orderBy(desc(schema.nachricht.veroeffentlichtAm));
  return mitBildern(zeilen);
}

export async function ladeNachricht(slug: string): Promise<NachrichtDetail | null> {
  'use cache';
  cacheLife('hours');
  cacheTag(TAG.nachrichten, TAG.medien);
  const [z] = await db
    .select()
    .from(schema.nachricht)
    .where(and(sichtbarInListen(), eq(schema.nachricht.slug, slug)))
    .limit(1);
  if (!z) return null;
  cacheTag(TAG.nachricht(z.id));
  const bilder = await ladeBilder([z.bildId, ...bildIdsAus(z.inhalt)]);
  return { ...zuDaten(z, bilder), textBilder: bilder };
}

/** Slugs für generateStaticParams: dieselbe Auswahl wie ladeNachricht. */
export async function ladeNachrichtenSlugs(): Promise<string[]> {
  'use cache';
  cacheLife('hours');
  cacheTag(TAG.nachrichten);
  const zeilen = await db.select({ slug: schema.nachricht.slug }).from(schema.nachricht).where(sichtbarInListen());
  return zeilen.map((z) => z.slug);
}

/** Weitere sichtbare Beiträge derselben Kategorie, neueste zuerst, ohne den angegebenen Beitrag (Detailseite). */
export async function ladeAehnlicheNachrichten(
  kategorie: NachrichtDaten['kategorie'],
  ohneId: string,
  anzahl = 3,
): Promise<NachrichtDaten[]> {
  'use cache';
  cacheLife('hours');
  cacheTag(TAG.nachrichten, TAG.medien);
  const zeilen = await db
    .select()
    .from(schema.nachricht)
    .where(and(sichtbarInListen(), eq(schema.nachricht.kategorie, kategorie), ne(schema.nachricht.id, ohneId)))
    .orderBy(desc(schema.nachricht.veroeffentlichtAm))
    .limit(anzahl);
  return mitBildern(zeilen);
}
