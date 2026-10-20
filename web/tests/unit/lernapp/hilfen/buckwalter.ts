/**
 * Arabische Testdaten aus Buckwalter-Umschrift (KERN §3: in Tests nur Codepunkt-Escapes). Die Tabelle enthält nur
 * Escapes; `ar('kitaAbN')` ergibt die arabische Schrift zur Laufzeit. Inhalte: neutrale Alltagswörter.
 *
 * Erweiterung für Satzzeichen: `#` = Komma U+060C, `%` = Fragezeichen U+061F, `@` = Semikolon U+061B.
 */
const TABELLE: Readonly<Record<string, string>> = {
  "'": '\u0621',
  '|': '\u0622',
  '>': '\u0623',
  '&': '\u0624',
  '<': '\u0625',
  '}': '\u0626',
  A: '\u0627',
  b: '\u0628',
  p: '\u0629',
  t: '\u062A',
  v: '\u062B',
  j: '\u062C',
  H: '\u062D',
  x: '\u062E',
  d: '\u062F',
  '*': '\u0630',
  r: '\u0631',
  z: '\u0632',
  s: '\u0633',
  $: '\u0634',
  S: '\u0635',
  D: '\u0636',
  T: '\u0637',
  Z: '\u0638',
  E: '\u0639',
  g: '\u063A',
  _: '\u0640',
  f: '\u0641',
  q: '\u0642',
  k: '\u0643',
  l: '\u0644',
  m: '\u0645',
  n: '\u0646',
  h: '\u0647',
  w: '\u0648',
  Y: '\u0649',
  y: '\u064A',
  F: '\u064B',
  N: '\u064C',
  K: '\u064D',
  a: '\u064E',
  u: '\u064F',
  i: '\u0650',
  '~': '\u0651',
  o: '\u0652',
  '`': '\u0670',
  '{': '\u0671',
  '#': '\u060C',
  '%': '\u061F',
  '@': '\u061B',
};

/** Vokalzeichen der Umschrift (Fathatan bis Sukun, Schadda, Alif khanjariyya). */
export const VOKALZEICHEN = /[FNKaiuo~`]/g;

export const ar = (umschrift: string): string => Array.from(umschrift, (z) => TABELLE[z] ?? z).join('');

/** Umschrift ohne Vokalzeichen (Gerüst). */
export const geruest = (umschrift: string): string => umschrift.replace(VOKALZEICHEN, '');
