import 'server-only';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pruefeSuchIndex, SUCHINDEX_DATEI, type SuchIndex } from '@/lib/suche/titelindex';

/**
 * Titel-Index der Suche ohne Laufzeit-Datenbank (Beispielmodus, ADR 0019) laden: die beim Bau geschriebene Datei im
 * Projektstamm (`scripts/suchindex.ts`; auf Vercel über `outputFileTracingIncludes` in der Funktion der Suche). Fehlt
 * sie oder ist sie ungültig, liefert das null – die Seite sagt dann ehrlich, dass die Suche hier noch nicht läuft.
 * Einmal je Prozess und Pfad gelesen (die Datei ändert sich erst mit dem nächsten Bau).
 */
const geladen = new Map<string, Promise<SuchIndex | null>>();

/** Index aus einer bestimmten Datei (Tests geben eine eigene Datei an). */
export function ladeSuchIndexAus(pfad: string): Promise<SuchIndex | null> {
  let index = geladen.get(pfad);
  if (!index) {
    // turbopackIgnore: Der Pfad ist zur Bauzeit nicht bekannt; ohne den Hinweis verfolgte Turbopack das ganze Projekt in
    // die Funktion. Mitgenommen wird genau die Datei über `outputFileTracingIncludes` (next.config.ts).
    index = readFile(/*turbopackIgnore: true*/ pfad, 'utf8')
      .then((text) => pruefeSuchIndex(JSON.parse(text)))
      .catch(() => null);
    geladen.set(pfad, index);
  }
  return index;
}

export function ladeSuchIndex(): Promise<SuchIndex | null> {
  return ladeSuchIndexAus(join(/*turbopackIgnore: true*/ process.cwd(), SUCHINDEX_DATEI));
}
