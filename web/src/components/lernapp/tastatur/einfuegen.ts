/**
 * Zeichen in ein Textfeld einfügen (Sonderzeichenleiste, arabische Bildschirmtastatur): rein, ohne DOM. Die Auswahl im
 * Feld wird ersetzt, die Schreibmarke steht danach hinter dem Zeichen. Löschen nimmt die Auswahl oder den Codepunkt vor
 * der Schreibmarke (arabische Vokalzeichen sind eigene Codepunkte und werden einzeln gelöscht).
 */
export type Feldstand = { wert: string; anfang: number; ende: number };

const begrenze = (n: number, max: number) => Math.max(0, Math.min(max, Number.isFinite(n) ? n : max));

export function einfuegen({ wert, anfang, ende }: Feldstand, zeichen: string, max = Infinity): Feldstand {
  const a = begrenze(Math.min(anfang, ende), wert.length);
  const e = begrenze(Math.max(anfang, ende), wert.length);
  const neu = wert.slice(0, a) + zeichen + wert.slice(e);
  if (neu.length > max) return { wert, anfang: a, ende: e };
  return { wert: neu, anfang: a + zeichen.length, ende: a + zeichen.length };
}

export function loesche({ wert, anfang, ende }: Feldstand): Feldstand {
  const a = begrenze(Math.min(anfang, ende), wert.length);
  const e = begrenze(Math.max(anfang, ende), wert.length);
  if (a !== e) return { wert: wert.slice(0, a) + wert.slice(e), anfang: a, ende: a };
  if (a === 0) return { wert, anfang: 0, ende: 0 };
  // ein Codepunkt (Ersatzpaare zusammen)
  const vorher = wert.charCodeAt(a - 1);
  const schritt = a > 1 && vorher >= 0xdc00 && vorher <= 0xdfff ? 2 : 1;
  return { wert: wert.slice(0, a - schritt) + wert.slice(a), anfang: a - schritt, ende: a - schritt };
}

/** Sonderzeichen der Leiste je Antwortsprache (Arabisch hat die eigene Tastatur). */
export const SONDERZEICHEN: Readonly<Record<'de' | 'tr', readonly string[]>> = {
  de: ['ä', 'ö', 'ü', 'ß'],
  tr: ['ç', 'ğ', 'ı', 'İ', 'ö', 'ş', 'ü'],
};
