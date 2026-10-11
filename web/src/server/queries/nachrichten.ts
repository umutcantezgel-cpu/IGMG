import 'server-only';
import { and, desc, eq, isNull, lte } from 'drizzle-orm';
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
  };
}

/** Veröffentlichte Nachrichten, neueste zuerst. Geplante Beiträge (Datum in der Zukunft) erscheinen erst ab ihrem Datum. */
export async function ladeNachrichten(): Promise<NachrichtDaten[]> {
  'use cache';
  cacheLife('hours');
  cacheTag(TAG.nachrichten);
  const zeilen = await db
    .select()
    .from(schema.nachricht)
    .where(
      and(
        eq(schema.nachricht.status, 'veroeffentlicht'),
        isNull(schema.nachricht.imPapierkorbSeit),
        lte(schema.nachricht.veroeffentlichtAm, new Date()),
      ),
    )
    .orderBy(desc(schema.nachricht.veroeffentlichtAm));
  return zeilen.map(zuDaten);
}

export async function ladeNachricht(slug: string): Promise<NachrichtDaten | null> {
  'use cache';
  cacheLife('hours');
  cacheTag(TAG.nachrichten);
  const [z] = await db
    .select()
    .from(schema.nachricht)
    .where(and(eq(schema.nachricht.status, 'veroeffentlicht'), isNull(schema.nachricht.imPapierkorbSeit), eq(schema.nachricht.slug, slug)))
    .limit(1);
  if (!z) return null;
  cacheTag(TAG.nachricht(z.id));
  return zuDaten(z);
}
