/**
 * Leser für Übersetzungsdateien im Tanzil-Format „Text mit Versnummern“ (`Sure|Vers|Text`, Kommentare mit `#`).
 * Texte unverändert (ADR 0025, 0030). Prüft Vollständigkeit gegen die Verszahlen je Sure.
 */
export type UebersetzungsVers = { sure: number; vers: number; text: string };

export class UebersetzungsFehler extends Error {}

export function leseUebersetzung(inhalt: string, verseJeSure: ReadonlyMap<number, number>): UebersetzungsVers[] {
  const verse: UebersetzungsVers[] = [];
  for (const zeile of inhalt.split(/\r?\n/)) {
    if (!zeile || zeile.startsWith('#')) continue;
    const m = zeile.match(/^(\d+)\|(\d+)\|(.*)$/);
    if (!m) throw new UebersetzungsFehler(`Zeile nicht im Format Sure|Vers|Text: ${zeile.slice(0, 40)}`);
    verse.push({ sure: Number(m[1]), vers: Number(m[2]), text: m[3] });
  }
  const erwartet = [...verseJeSure.values()].reduce((a, b) => a + b, 0);
  if (verse.length !== erwartet) throw new UebersetzungsFehler(`Erwartet ${erwartet} Verse, gefunden ${verse.length}`);
  const gesehen = new Set<string>();
  for (const v of verse) {
    const max = verseJeSure.get(v.sure);
    if (!max || v.vers < 1 || v.vers > max) throw new UebersetzungsFehler(`Ungültige Stelle ${v.sure}:${v.vers}`);
    const k = `${v.sure}:${v.vers}`;
    if (gesehen.has(k)) throw new UebersetzungsFehler(`Doppelte Stelle ${k}`);
    gesehen.add(k);
  }
  return verse;
}

/** Kopfangaben einer Tanzil-Übersetzungsdatei (Name, Übersetzer, Sprache, ID, Stand). */
export function leseKopf(inhalt: string): Record<string, string> {
  const kopf: Record<string, string> = {};
  for (const m of inhalt.matchAll(/^#\s+([A-Za-z ]+):\s*(.+)$/gm)) kopf[m[1].trim().toLowerCase()] = m[2].trim();
  return kopf;
}
