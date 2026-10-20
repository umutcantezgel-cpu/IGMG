// Inhaltsdateien der Lern-App lesen (für lernapp:import und lernapp:pruefen): alle JSON-Dateien unter
// web/inhalte/lernapp/{sprache,uebersetzung}/**, sortiert, Pfad relativ zu web/inhalte/lernapp.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import type { ImportQuelle } from '../../src/lib/lernapp/inhalt/import';

export const INHALT_WURZEL = join(import.meta.dirname, '..', '..', 'inhalte', 'lernapp');

export function inhaltsdateien(wurzel = INHALT_WURZEL): ImportQuelle[] {
  const ergebnis: ImportQuelle[] = [];
  const gehe = (ordner: string) => {
    let eintraege: string[];
    try {
      eintraege = readdirSync(ordner).sort();
    } catch {
      return;
    }
    for (const e of eintraege) {
      const pfad = join(ordner, e);
      if (statSync(pfad).isDirectory()) gehe(pfad);
      else if (e.endsWith('.json')) ergebnis.push({ pfad: relative(wurzel, pfad), text: readFileSync(pfad, 'utf8') });
    }
  };
  for (const teil of ['sprache', 'uebersetzung']) gehe(join(wurzel, teil));
  return ergebnis;
}
