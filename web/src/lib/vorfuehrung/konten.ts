/**
 * Testzugänge der Vorführung (ADR 0052): vier feste Konten mit einfachem Benutzernamen und einem gemeinsamen Passwort.
 * Beides steht offen auf der Anmeldeseite – der Testzugang schützt nichts, die Vorführung enthält nur Beispieldaten.
 * Die Konten selbst legt der Bau an (`scripts/vorfuehrung-vorbereiten.ts`: Verwaltung; `scripts/beispielkonten.ts`:
 * Eltern, Lehrkraft, Kind). Reine Daten und Funktionen ohne Datenbank (`tests/unit/vorfuehrung.test.ts`).
 */
export const VORFUEHRUNG_PASSWORT = 'igmg2026';

export const VORFUEHRUNG_KONTEN = [
  { schluessel: 'verwaltung', benutzername: 'verwaltung', email: 'verwaltung@beispiel.invalid', ziel: '/verwaltung' },
  { schluessel: 'eltern', benutzername: 'eltern', email: 'eltern@beispiel.invalid', ziel: '/mein-bereich' },
  { schluessel: 'lehrkraft', benutzername: 'lehrkraft', email: 'lehrkraft@beispiel.invalid', ziel: '/mein-bereich' },
  { schluessel: 'kind', benutzername: 'kind', kindername: 'kind.beispiel', ziel: '/mein-bereich' },
] as const;

export type VorfuehrungsKonto = (typeof VORFUEHRUNG_KONTEN)[number];
export type VorfuehrungsSchluessel = VorfuehrungsKonto['schluessel'];

/** Name des Cookies, das den gewählten Testzugang trägt (Wert: der Schlüssel des Kontos). */
export const VORFUEHRUNG_COOKIE = 'igmg-vorfuehrung';

/** Testzugang zu einem Cookie-Wert; unbekannte Werte ergeben `null`. */
export function kontoZuSchluessel(wert: string | undefined | null): VorfuehrungsKonto | null {
  return VORFUEHRUNG_KONTEN.find((k) => k.schluessel === wert) ?? null;
}

/**
 * Prüft Benutzername und Passwort des Testzugangs: Groß- und Kleinschreibung und Leerraum um den Namen sind egal, das
 * Passwort muss genau stimmen. Ergebnis: das Konto oder `null`.
 */
export function pruefeTestzugang(benutzername: unknown, passwort: unknown): VorfuehrungsKonto | null {
  if (typeof benutzername !== 'string' || typeof passwort !== 'string') return null;
  if (passwort !== VORFUEHRUNG_PASSWORT) return null;
  const name = benutzername.trim().toLowerCase();
  return VORFUEHRUNG_KONTEN.find((k) => k.benutzername === name) ?? null;
}
