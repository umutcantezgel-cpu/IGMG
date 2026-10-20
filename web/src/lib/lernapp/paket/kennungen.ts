/**
 * Kennungen und Adressen der Auslieferung (ADR 0039 Nr. 1/2) ohne Zod: Formate, Lizenz, Adressen von Kursverzeichnis und
 * Einheitenpaket. Die Schemas stehen in `typen.ts` (Server und Spieler); Inseln wie der Lernpfad brauchen nur dies.
 */

export const PAKET_FORMAT = 'igmg-lernapp-paket';
export const VERZEICHNIS_FORMAT = 'igmg-lernapp-verzeichnis';
/** Lizenz der eigenen Lerninhalte (L0-E02). */
export const INHALT_LIZENZ = 'CC-BY-SA-4.0';

/** Adresse eines Einheitenpakets. */
export function paketAdresse(kurs: string, einheit: string, hash: string): string {
  return `/lern-app/pakete/${kurs}/${einheit}/${hash}`;
}

/** Adresse des Kursverzeichnisses. */
export function verzeichnisAdresse(kurs: string): string {
  return `/lern-app/pakete/${kurs}`;
}
