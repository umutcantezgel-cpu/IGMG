import 'server-only';
import { cacheLife, cacheTag } from 'next/cache';
import { TAG } from '@/lib/cache/tags';
import { ladeHatim, veroeffentlichteHatims, type HatimOeffentlich } from '@/lib/hatim/dienst';

/**
 * Öffentliche Hatim-Abfragen (AUFTRAG 3.10, B-19): nur veröffentlichte Hatims, nur Zahlen und Stand je Cüz – nie Namen.
 * Geteilter Cache (ADR 0024) mit Tag `hatim` und je Hatim `hatim:<id>`: Übernahmen in „Mein Bereich“ rufen
 * `inhaltGeaendert(TAG.hatimVon(id))` und erneuern damit Liste und Detail.
 */
export async function ladeHatimListe(): Promise<HatimOeffentlich[]> {
  'use cache: remote';
  cacheLife('hours');
  cacheTag(TAG.hatim);
  const liste = await veroeffentlichteHatims();
  // Archivierte Hatims bleiben veröffentlicht erreichbar, erscheinen aber nicht mehr in der Liste
  const sichtbar = liste.filter((h) => h.status !== 'archiviert');
  for (const h of sichtbar) cacheTag(TAG.hatimVon(h.id));
  return sichtbar;
}

export async function ladeHatimOeffentlich(id: string): Promise<HatimOeffentlich | null> {
  'use cache: remote';
  cacheLife('hours');
  cacheTag(TAG.hatim, TAG.hatimVon(id));
  return ladeHatim(id);
}

/** IDs für generateStaticParams (auch archivierte, damit alte Links weiter funktionieren). */
export async function ladeHatimIds(): Promise<string[]> {
  'use cache: remote';
  cacheLife('hours');
  cacheTag(TAG.hatim);
  return (await veroeffentlichteHatims()).map((h) => h.id);
}
