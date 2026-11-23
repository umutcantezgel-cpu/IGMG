import type { Rolle } from '@/lib/rechte/matrix';

/**
 * Testzugänge der Vorführung (ADR 0052): feste Konten mit einfachem Benutzernamen und einem gemeinsamen Passwort – je
 * Benutzername ein eigener Bereich mit eigenen Rechten. Sechs Rollen der Verwaltung (jede sieht ihre Module, `MATRIX` in
 * `src/lib/rechte/matrix.ts`) und drei Kontoarten in „Mein Bereich“. Benutzernamen und Passwort stehen offen auf der
 * Anmeldeseite – der Testzugang schützt nichts, die Vorführung enthält nur Beispieldaten. Die Konten legt der Bau an
 * (`scripts/vorfuehrung-vorbereiten.ts`: Verwaltung; `scripts/beispielkonten.ts`: Lehrkraft, Eltern, Kind). Reine Daten und
 * Funktionen ohne Datenbank (`tests/unit/vorfuehrung.test.ts`).
 */
export const VORFUEHRUNG_PASSWORT = 'igmg2026';

type VerwaltungsKonto = {
  schluessel: string;
  benutzername: string;
  bereich: 'verwaltung';
  email: string;
  /** Anzeigename des Kontos, z. B. in „Willkommen, …“ */
  name: string;
  rollen: readonly Rolle[];
  ziel: '/verwaltung';
};
type GemeindeKonto = {
  schluessel: string;
  benutzername: string;
  bereich: 'mein-bereich';
  ziel: '/mein-bereich';
} & ({ email: string } | { kindername: string });

export const VORFUEHRUNG_KONTEN = [
  {
    schluessel: 'admin',
    benutzername: 'admin',
    bereich: 'verwaltung',
    email: 'admin@beispiel.invalid',
    name: 'Administration (Test)',
    // Administration darf alles außer den Schutzrollen; mit ihnen zeigt der Zugang jeden Bereich der Verwaltung
    rollen: ['administration', 'leitung', 'religioese_pruefung', 'kinderschutz', 'sprachpruefung'],
    ziel: '/verwaltung',
  },
  {
    schluessel: 'redaktion',
    benutzername: 'redaktion',
    bereich: 'verwaltung',
    email: 'redaktion@beispiel.invalid',
    name: 'Redaktion (Test)',
    rollen: ['redaktion'],
    ziel: '/verwaltung',
  },
  {
    schluessel: 'bildung',
    benutzername: 'bildung',
    bereich: 'verwaltung',
    email: 'bildung@beispiel.invalid',
    name: 'Bildung (Test)',
    rollen: ['bildung'],
    ziel: '/verwaltung',
  },
  {
    schluessel: 'vorstand',
    benutzername: 'vorstand',
    bereich: 'verwaltung',
    email: 'vorstand@beispiel.invalid',
    name: 'Vorstand (Test)',
    rollen: ['leitung'],
    ziel: '/verwaltung',
  },
  {
    schluessel: 'imam',
    benutzername: 'imam',
    bereich: 'verwaltung',
    email: 'imam@beispiel.invalid',
    name: 'Imam (Test)',
    rollen: ['religioese_pruefung'],
    ziel: '/verwaltung',
  },
  {
    schluessel: 'mitglieder',
    benutzername: 'mitglieder',
    bereich: 'verwaltung',
    email: 'mitglieder@beispiel.invalid',
    name: 'Mitgliederverwaltung (Test)',
    rollen: ['mitgliederverwaltung'],
    ziel: '/verwaltung',
  },
  {
    schluessel: 'lehrkraft',
    benutzername: 'lehrkraft',
    bereich: 'mein-bereich',
    email: 'lehrkraft@beispiel.invalid',
    ziel: '/mein-bereich',
  },
  { schluessel: 'eltern', benutzername: 'eltern', bereich: 'mein-bereich', email: 'eltern@beispiel.invalid', ziel: '/mein-bereich' },
  { schluessel: 'kind', benutzername: 'kind', bereich: 'mein-bereich', kindername: 'kind.beispiel', ziel: '/mein-bereich' },
] as const satisfies readonly (VerwaltungsKonto | GemeindeKonto)[];

export type VorfuehrungsKonto = (typeof VORFUEHRUNG_KONTEN)[number];
export type VorfuehrungsSchluessel = VorfuehrungsKonto['schluessel'];

/** Früherer Name des Zugangs mit allen Rechten – gilt weiter, steht aber nicht mehr auf der Seite. */
const ALIASE: Record<string, VorfuehrungsSchluessel> = { verwaltung: 'admin' };

/** Name des Cookies, das den gewählten Testzugang trägt (Wert: der Schlüssel des Kontos). */
export const VORFUEHRUNG_COOKIE = 'igmg-vorfuehrung';

/** Testzugang zu einem Cookie-Wert; unbekannte Werte ergeben `null`. */
export function kontoZuSchluessel(wert: string | undefined | null): VorfuehrungsKonto | null {
  if (!wert) return null;
  const schluessel = ALIASE[wert] ?? wert;
  return VORFUEHRUNG_KONTEN.find((k) => k.schluessel === schluessel) ?? null;
}

/**
 * Prüft Benutzername und Passwort des Testzugangs: Groß- und Kleinschreibung und Leerraum um den Namen sind egal, das
 * Passwort muss genau stimmen. Ergebnis: das Konto oder `null`.
 */
export function pruefeTestzugang(benutzername: unknown, passwort: unknown): VorfuehrungsKonto | null {
  if (typeof benutzername !== 'string' || typeof passwort !== 'string') return null;
  if (passwort !== VORFUEHRUNG_PASSWORT) return null;
  const name = benutzername.trim().toLowerCase();
  return VORFUEHRUNG_KONTEN.find((k) => k.benutzername === (ALIASE[name] ?? name)) ?? null;
}
