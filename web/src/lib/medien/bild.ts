import 'server-only';
import { and, inArray, isNotNull, isNull, like } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import type { Mehrsprachig } from '@/lib/db/schema/typen';

/**
 * Bilder an Inhalten (C11b, ADR 0007): Neuigkeiten, Veranstaltungen und Kurse verweisen über `bildId`, Rich-Text über
 * Bildknoten `{ type: 'image', attrs: { mediumId } }` auf die Mediathek. Öffentlich erscheinen nur Bilder außerhalb des
 * Papierkorbs; der Alt-Text kommt immer aus der Mediathek (je Sprache, Rückfall Deutsch).
 * Ohne eigenen Cache: Aufrufer sind `'use cache'`-Abfragen, die zusätzlich `TAG.medien` setzen.
 */
export type BildDaten = { id: string; url: string; breite: number; hoehe: number; alt: Mehrsprachig };
export type BildKarte = Record<string, BildDaten>;

const m = schema.medium;

/** Öffentliche Adresse eines Mediums (Route `src/app/medien/[...schluessel]`). */
export const medienUrl = (schluessel: string) => `/medien/${schluessel}`;

/** IDs → Bilddaten; unbekannte, gelöschte, im Papierkorb liegende oder Nicht-Bild-Medien fehlen in der Karte. */
export async function ladeBilder(ids: readonly (string | null | undefined)[]): Promise<BildKarte> {
  const eindeutig = [...new Set(ids.filter((id): id is string => typeof id === 'string' && id.length > 0))];
  if (!eindeutig.length) return {};
  const zeilen = await db
    .select({ id: m.id, schluessel: m.schluessel, breite: m.breite, hoehe: m.hoehe, alt: m.alt })
    .from(m)
    .where(and(inArray(m.id, eindeutig), isNull(m.imPapierkorbSeit), like(m.typ, 'image/%'), isNotNull(m.breite), isNotNull(m.hoehe)));
  const karte: BildKarte = {};
  for (const z of zeilen) karte[z.id] = { id: z.id, url: medienUrl(z.schluessel), breite: z.breite!, hoehe: z.hoehe!, alt: z.alt };
  return karte;
}

/** Medien-IDs aller Bildknoten eines oder mehrerer Tiptap-Dokumente (jede Tiefe, jede Sprache). */
export function bildIdsAus(...dokumente: unknown[]): string[] {
  const ids: string[] = [];
  const besuche = (k: unknown) => {
    if (!k || typeof k !== 'object') return;
    if (Array.isArray(k)) return k.forEach(besuche);
    const knoten = k as { type?: unknown; attrs?: { mediumId?: unknown }; content?: unknown };
    if (knoten.type === 'image' && typeof knoten.attrs?.mediumId === 'string') ids.push(knoten.attrs.mediumId);
    besuche(knoten.content);
  };
  for (const d of dokumente) {
    // Mehrsprachige Felder ({ de, tr, en }) und einzelne Dokumente gleichermaßen
    if (d && typeof d === 'object' && !Array.isArray(d) && !('type' in d)) Object.values(d).forEach(besuche);
    else besuche(d);
  }
  return [...new Set(ids)];
}

/**
 * Prüfung beim Speichern (Verwaltung): Welche der IDs sind KEINE nutzbaren Bilder (unbekannt, Papierkorb, PDF)?
 * Leere Liste = alles gültig. Ungecacht.
 */
export async function ungueltigeBildIds(ids: readonly string[]): Promise<string[]> {
  if (!ids.length) return [];
  const gueltig = await ladeBilder(ids);
  return ids.filter((id) => !gueltig[id]);
}

/**
 * Feldfehler für Speicher-Actions: `bildFelder` sind Felder mit einer Medien-ID (z. B. `bildId`), `textFelder`
 * Rich-Text-Dokumente mit Bildknoten. Fehler `bildUngueltig` am jeweiligen Feld; null = alles nutzbar.
 */
export async function bildFehlerFuer(
  bildFelder: Record<string, string | null | undefined>,
  textFelder: Record<string, unknown> = {},
): Promise<Record<string, string> | null> {
  const alleIds = [
    ...Object.values(bildFelder).filter((v): v is string => typeof v === 'string' && v.length > 0),
    ...Object.values(textFelder).flatMap((d) => bildIdsAus(d)),
  ];
  const ungueltig = new Set(await ungueltigeBildIds([...new Set(alleIds)]));
  if (!ungueltig.size) return null;
  const fehler: Record<string, string> = {};
  for (const [feld, id] of Object.entries(bildFelder)) if (id && ungueltig.has(id)) fehler[feld] = 'bildUngueltig';
  for (const [feld, doc] of Object.entries(textFelder)) if (bildIdsAus(doc).some((id) => ungueltig.has(id))) fehler[feld] = 'bildUngueltig';
  return fehler;
}
