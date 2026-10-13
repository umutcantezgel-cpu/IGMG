/**
 * Benutzernamen der Kinderkonten (ADR 0026). Reine Funktionen ohne Serverabhängigkeit (auch im Browser nutzbar).
 *
 * Regeln: 4–32 Zeichen, nur Kleinbuchstaben a–z, Ziffern, Punkt und Unterstrich (Teilmenge der Better-Auth-Vorgabe
 * `^[a-zA-Z0-9_.]+$`, sonst lehnt `signUpEmail` ab), Anfang und Ende Buchstabe oder Ziffer, keine zwei Satzzeichen
 * hintereinander. Großbuchstaben werden zu Kleinbuchstaben (Better Auth speichert normalisiert). Ob ein Name frei ist,
 * prüft nur der Server (`benutzernameFrei` in `kinderkonto.ts`) – nie über einen offenen Endpunkt.
 */
export const BENUTZERNAME_MIN = 4;
export const BENUTZERNAME_MAX = 32;

const ERLAUBT = /^[a-z0-9._]+$/;
const RAND = /^[a-z0-9].*[a-z0-9]$|^[a-z0-9]$/;
const DOPPELT = /[._]{2}/;

export type BenutzernameFehler = 'kurz' | 'lang' | 'zeichen';

/** Leerraum entfernen, Kleinbuchstaben. */
export function normalisiereBenutzername(roh: string): string {
  return roh.trim().toLowerCase();
}

/** Prüft einen Benutzernamen nach den Regeln oben; Ergebnis ist der normalisierte Wert. */
export function pruefeBenutzername(roh: string): { ok: true; wert: string } | { ok: false; fehler: BenutzernameFehler } {
  const wert = normalisiereBenutzername(roh);
  if (wert.length < BENUTZERNAME_MIN) return { ok: false, fehler: 'kurz' };
  if (wert.length > BENUTZERNAME_MAX) return { ok: false, fehler: 'lang' };
  if (!ERLAUBT.test(wert) || !RAND.test(wert) || DOPPELT.test(wert)) return { ok: false, fehler: 'zeichen' };
  return { ok: true, wert };
}
