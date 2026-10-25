/**
 * Stand eines Imports (Einstellung `<standSchluessel>`, z. B. `lernapp_import`, `lernapp_testkurs`): SHA je Datei, offene
 * Konflikte und – seit L3-06b – die Schlüssel der Aufgaben, Lemmata und Sätze, die in ihrer Datei fehlen (`entfernt`).
 *
 * `entfernt` führt jeden Eintrag, den der Import als entfernt behandelt, auch wenn er schon vorher gesperrt war (dann sperrt
 * der Import nicht erneut und hinterließe sonst keine Spur). Menschlich geprüfte Einträge sperrt der Import nie; sie stehen
 * nicht darin. „Wieder freigeben“ in der Verwaltung (Meldungen › Gesperrt) bietet diese Einträge nicht an: Sie kommen nur
 * mit der Datei zurück.
 */
export type Konflikt = { tabelle: string; schluessel: string; datei: string; hashDatenbank: string; hashDatei: string };
export type DateiStand = { sha: string; art: 'sprache' | 'uebersetzung'; einheit: string; richtung?: string };
export type ImportStand = { dateien: Record<string, DateiStand>; konflikte: Konflikt[]; am: string; entfernt?: string[] };

/** Präfix der Einstellungen, unter denen Importe ihren Stand ablegen. */
export const STAND_PRAEFIX = 'lernapp_';

/** Stand des Testkurses (`drizzle/seeds/lernapp-test.ts`); vorhanden genau dann, wenn der Testkurs importiert ist. */
export const TESTKURS_STAND = 'lernapp_testkurs';

/** Schlüssel der als entfernt geführten Einträge aus den Werten der Import-Stände (fremde oder alte Formen: leer). */
export function entfernteAusStaenden(werte: readonly unknown[]): Set<string> {
  const ergebnis = new Set<string>();
  for (const w of werte) {
    const liste = (w as Partial<ImportStand> | null)?.entfernt;
    if (Array.isArray(liste)) for (const s of liste) if (typeof s === 'string') ergebnis.add(s);
  }
  return ergebnis;
}

/**
 * Neue Liste `entfernt`: Für die Einheiten in `neu` gilt die frisch ermittelte Liste, für alle anderen bleibt die alte (ihre
 * Dateien waren unverändert). Sortiert und eindeutig.
 */
export function fuehreEntfernte(alt: readonly string[], neu: ReadonlyMap<string, readonly string[]>): string[] {
  const einheiten = [...neu.keys()].map((e) => `${e}.`);
  const bleibt = alt.filter((s) => !einheiten.some((e) => s.startsWith(e)));
  return [...new Set([...bleibt, ...[...neu.values()].flat()])].sort();
}
