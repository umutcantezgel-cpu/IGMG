import type { Sprache } from './kurse';

/**
 * Lateinische Formel-Kandidaten der Formelliste (F-de, F-tr im Leitfaden `religionsbezug.formeln`; KERN 4.0 §2.3, LM-09;
 * Stufe C N2, Gegenprüfung Z-L10). Rein und ohne Daten: Zerlegung und Vergleich sind dieselben wie im Inhaltsprüfer
 * „Religionsbezug“ (`inhalt/pruefer/religionsbezug.ts`, Wörter wie `tabuWoerter`), damit Prüfer, Paketbau
 * (`paket/bauen.ts`: ein Treffer gilt dort als Religionsbezug, auch ohne Kennzeichen) und Eingaben der Verwaltung
 * (`verwaltung/aktion.ts` `waechterBefund`) dieselben Treffer sehen. Die Begriffe kommen nur aus der Liste, hier steht keiner.
 *
 * Arabische Formeln (F-ar) sind nicht dabei: Ihre Namen in Umschrift löst nur der Prüfer über den kaikki-Kernauszug auf
 * (Stand 26.10.2026 für keinen der 17 Einträge wirksam); den harten Teil leistet das Formel-Lexikon des Wächters.
 */

const ZIRKUMFLEX: Record<string, string> = { â: 'a', î: 'i', û: 'u', Â: 'a', Î: 'i', Û: 'u' };

/**
 * Wörter eines lateinischen Texts in der Normalform des Leitfadens: tr NFC, türkisch klein, ohne Zirkumflex, Apostroph vor
 * Endungen entfernt, Bindestrich-Wörter zusätzlich in Teilen; de NFC, klein, ß → ss, Bindestrich-Wörter zusätzlich
 * zusammengezogen und in Teilen.
 */
export function lateinWoerter(text: string, sprache: 'de' | 'tr'): string[] {
  const t = text.normalize('NFC');
  if (sprache === 'tr')
    return t
      .replace(/[âîûÂÎÛ]/g, (z) => ZIRKUMFLEX[z]!)
      .toLocaleLowerCase('tr')
      .replace(/['’]/g, '')
      .split(/[^\p{L}\p{N}-]+/u)
      .flatMap((w) => (w.includes('-') ? [w, ...w.split('-')] : [w]))
      .filter(Boolean);
  return t
    .toLowerCase()
    .replace(/ß/g, 'ss')
    .split(/[^\p{L}\p{N}-]+/u)
    .flatMap((w) => (w.includes('-') ? [w.replace(/-/g, ''), ...w.split('-')] : [w]))
    .filter(Boolean);
}

/** Teile eines Begriffs im Leitfaden: Klammerzusätze weg, Varianten an Komma und Schrägstrich getrennt. */
export const begriffTeile = (s: string): string[] =>
  s
    .replace(/\([^)]*\)/g, ' ')
    .split(/[,/]/)
    .map((x) => x.trim())
    .filter(Boolean);

/** Ein Wort des Texts passt zum Wort des Begriffs: gleich, oder (ab vier Buchstaben) mit Endungen. */
export const passtWort = (token: string, wort: string): boolean => token === wort || (wort.length >= 4 && token.startsWith(wort));

/** Steht die Wortfolge (zusammenhängend) in den Wörtern des Texts? */
export function trifftFolge(tokens: readonly string[], folge: readonly string[]): boolean {
  return folge.length > 0 && tokens.some((_, i) => folge.every((w, j) => tokens[i + j] !== undefined && passtWort(tokens[i + j]!, w)));
}

export type LateinFormel = { id: string; sprache: 'de' | 'tr'; folgen: readonly (readonly string[])[] };

/** Die lateinischen Einträge (F-de, F-tr) einer Formelliste als Wortfolgen; andere Sprachen fallen weg. */
export function lateinFormeln(liste: readonly { id: string; sprache: string; begriff: string }[]): LateinFormel[] {
  return liste.flatMap((f) =>
    f.sprache === 'de' || f.sprache === 'tr'
      ? [{ id: f.id, sprache: f.sprache, folgen: begriffTeile(f.begriff).map((t) => lateinWoerter(t, f.sprache as 'de' | 'tr')) }]
      : [],
  );
}

/** Kennung der ersten lateinischen Formel, die der Text in dieser Sprache enthält, oder null (ar: immer null). */
export function formelTreffer(text: string, sprache: Sprache, formeln: readonly LateinFormel[]): string | null {
  if (sprache !== 'de' && sprache !== 'tr') return null;
  const passend = formeln.filter((f) => f.sprache === sprache);
  if (!passend.length) return null;
  const tokens = lateinWoerter(text, sprache);
  return passend.find((f) => f.folgen.some((folge) => trifftFolge(tokens, folge)))?.id ?? null;
}

/** Alle Zeichenketten in einem Wert (Aufgabendaten, Tiptap-Dokument), in Reihenfolge. */
export function texteIn(wert: unknown): string[] {
  if (typeof wert === 'string') return [wert];
  if (Array.isArray(wert)) return wert.flatMap(texteIn);
  if (wert && typeof wert === 'object') return Object.values(wert).flatMap(texteIn);
  return [];
}
