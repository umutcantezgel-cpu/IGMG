/**
 * Absolute Sitzungsgrenzen je Kontoart (ADR Kontoarten). Better Auth hält Sitzungen höchstens 30 Tage (gleitend);
 * strengere Grenzen gelten ab der Anmeldung (`session.createdAt`) und werden bei jedem Laden geprüft.
 * Reine Funktion ohne Datenbank, vollständig unit-testbar.
 */
const STUNDE = 60 * 60 * 1000;

export const SITZUNG_VERWALTUNG_MS = 8 * STUNDE;
export const SITZUNG_LEHRKRAFT_MS = 12 * STUNDE;
export const SITZUNG_KIND_MS = 12 * STUNDE;
export const SITZUNG_GEMEINDE_MS = 30 * 24 * STUNDE;

export type SitzungsKonto = {
  /** Hat das Konto mindestens eine Verwaltungsrolle? */
  verwaltung: boolean;
  /** Gemeinde-Rollen des Kontos. */
  gemeindeRollen: readonly string[];
  /** Kinderkonto (< 16, Benutzername). */
  istKind: boolean;
};

/** Strengste Grenze, die für das Konto gilt. */
export function sitzungsGrenzeMs(konto: SitzungsKonto): number {
  if (konto.verwaltung) return SITZUNG_VERWALTUNG_MS;
  if (konto.gemeindeRollen.includes('lehrkraft')) return SITZUNG_LEHRKRAFT_MS;
  if (konto.istKind) return SITZUNG_KIND_MS;
  return SITZUNG_GEMEINDE_MS;
}

/** true, wenn die Sitzung (seit `erstelltAm`) die Grenze überschritten hat. */
export function sitzungAbgelaufen(erstelltAm: Date, konto: SitzungsKonto, jetzt: Date = new Date()): boolean {
  return jetzt.getTime() - erstelltAm.getTime() > sitzungsGrenzeMs(konto);
}
