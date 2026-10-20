// Inhaltsdateien der Lern-App lesen, sortiert, Pfad relativ zu web/inhalte/lernapp:
// - inhaltsdateien(): JSON unter {sprache,uebersetzung}/** (lernapp:import)
// - alleInhaltsdateien(): alle JSON außer den erzeugten schemas/ (lernapp:pruefen, L3-02)
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import type { ImportQuelle } from '../../src/lib/lernapp/inhalt/import';

export const INHALT_WURZEL = join(import.meta.dirname, '..', '..', 'inhalte', 'lernapp');

export function inhaltsdateien(wurzel = INHALT_WURZEL, teile: readonly string[] = ['sprache', 'uebersetzung']): ImportQuelle[] {
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
  for (const teil of teile) gehe(join(wurzel, teil));
  return ergebnis;
}

/** Alle JSON-Dateien unter der Wurzel (PLAN §6.1) ohne die erzeugten JSON-Schemas; unbekannte Orte meldet der Prüfer. */
export function alleInhaltsdateien(wurzel = INHALT_WURZEL): ImportQuelle[] {
  let teile: string[];
  try {
    teile = readdirSync(wurzel)
      .filter((e) => e !== 'schemas')
      .sort();
  } catch {
    return [];
  }
  const dateien = teile.filter((e) => !statSync(join(wurzel, e)).isDirectory() && e.endsWith('.json'));
  return [
    ...dateien.map((e) => ({ pfad: e, text: readFileSync(join(wurzel, e), 'utf8') })),
    ...inhaltsdateien(
      wurzel,
      teile.filter((e) => statSync(join(wurzel, e)).isDirectory()),
    ),
  ];
}
