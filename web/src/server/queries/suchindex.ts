import 'server-only';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pruefeSuchIndex, SUCHINDEX_DATEI, type SuchIndex } from '@/lib/suche/titelindex';

/**
 * Titel-Index der Suche ohne Laufzeit-Datenbank (Beispielmodus, ADR 0019) laden: die beim Bau geschriebene Datei im
 * Projektstamm (`scripts/suchindex.ts`; auf Vercel über `outputFileTracingIncludes` in der Funktion der Suche). Fehlt
 * sie oder ist sie ungültig, liefert das null – die Seite sagt dann ehrlich, dass die Suche hier noch nicht läuft.
 * Einmal je Prozess gelesen (die Datei ändert sich erst mit dem nächsten Bau). `SUCHINDEX_DATEI` in der Umgebung nur für
 * Tests.
 */
const geladen = new Map<string, Promise<SuchIndex | null>>();

export function ladeSuchIndex(): Promise<SuchIndex | null> {
  // turbopackIgnore: Der Pfad ist zur Bauzeit nicht bekannt; ohne den Hinweis verfolgte Turbopack das ganze Projekt in die
  // Funktion. Mitgenommen wird genau die Datei über `outputFileTracingIncludes` (next.config.ts).
  const pfad = process.env.SUCHINDEX_DATEI || join(/*turbopackIgnore: true*/ process.cwd(), SUCHINDEX_DATEI);
  let index = geladen.get(pfad);
  if (!index) {
    index = readFile(/*turbopackIgnore: true*/ pfad, 'utf8')
      .then((text) => pruefeSuchIndex(JSON.parse(text)))
      .catch(() => null);
    geladen.set(pfad, index);
  }
  return index;
}
