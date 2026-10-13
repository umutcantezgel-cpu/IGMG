/**
 * Stärke-Hinweis für neue Passwörter (Registrierung, Einladung, Passwort ändern). Reine Funktion, läuft im Browser.
 * Verbindlich ist nur die Mindestlänge von 12 Zeichen (Better Auth, `optionen.ts`); die Stufen sind ein Hinweis.
 * Länge zählt am meisten (Passphrasen), Zeichenarten etwas, naheliegende Muster ziehen ab. Kein Wörterbuch im Bündel.
 */
export const PASSWORT_MIN = 12;

export type PasswortStufe = 0 | 1 | 2 | 3;

const MUSTER = [/(.)\1{3,}/, /0123|1234|2345|3456|4567|5678|6789|abcd|qwert|asdf/i, /pass(wort|word)|sifre|igmg|wetzlar|moschee/i];

/** 0 = zu kurz, 1 = schwach, 2 = mittel, 3 = stark. */
export function passwortStaerke(passwort: string): PasswortStufe {
  if (passwort.length < PASSWORT_MIN) return 0;
  let punkte = 0;
  if (passwort.length >= 16) punkte++;
  if (passwort.length >= 20) punkte++;
  const arten = [/\p{Ll}/u, /\p{Lu}/u, /\d/, /[^\p{L}\d]/u].filter((r) => r.test(passwort)).length;
  if (arten >= 3) punkte++;
  if (MUSTER.some((m) => m.test(passwort))) punkte -= 2;
  return punkte <= 0 ? 1 : punkte === 1 ? 2 : 3;
}
