import 'server-only';
import { and, desc, eq, isNull, lte, ne } from 'drizzle-orm';
import { cacheLife, cacheTag } from 'next/cache';
import { TAG } from '@/lib/cache/tags';
import { db, schema } from '@/lib/db';
import type { Mehrsprachig, MehrsprachigRich } from '@/lib/db/schema/typen';

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
};

function zuDaten(n: typeof schema.nachricht.$inferSelect): NachrichtDaten {
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
  };
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
  cacheTag(TAG.nachrichten);
  const zeilen = await db.select().from(schema.nachricht).where(sichtbarInListen()).orderBy(desc(schema.nachricht.veroeffentlichtAm));
  return zeilen.map(zuDaten);
}

export async function ladeNachricht(slug: string): Promise<NachrichtDaten | null> {
  'use cache';
  cacheLife('hours');
  cacheTag(TAG.nachrichten);
  const [z] = await db
    .select()
    .from(schema.nachricht)
    .where(and(sichtbarInListen(), eq(schema.nachricht.slug, slug)))
    .limit(1);
  if (!z) return null;
  cacheTag(TAG.nachricht(z.id));
  return zuDaten(z);
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
  cacheTag(TAG.nachrichten);
  const zeilen = await db
    .select()
    .from(schema.nachricht)
    .where(and(sichtbarInListen(), eq(schema.nachricht.kategorie, kategorie), ne(schema.nachricht.id, ohneId)))
    .orderBy(desc(schema.nachricht.veroeffentlichtAm))
    .limit(anzahl);
  return zeilen.map(zuDaten);
}
