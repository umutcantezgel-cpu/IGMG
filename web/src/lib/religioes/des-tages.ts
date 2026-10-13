/**
 * „Vers und Hadith des Tages“ (AUFTRAG 3.10, Kür K-A): Auswahl nach Datum aus den kuratierten, freigegebenen Listen
 * (`quran_vers_auswahl`, `hadith_auswahl`, Liste `des-tages`). Alle Bildschirme und Seiten wählen für dasselbe Datum
 * denselben Eintrag; die Reihenfolge der Liste bestimmt die Folge. Reine Funktionen (Unit-Test `des-tages.test.ts`).
 */
export const DES_TAGES = 'des-tages';
export const VERS_LISTEN = [DES_TAGES] as const;
export type VersListe = (typeof VERS_LISTEN)[number];

const DATUM = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Tage seit dem 1. 1. 1970 für ein Kalenderdatum „JJJJ-MM-TT“ (ohne Zeitzone; ungültig → 0). */
export function tagNummer(datum: string): number {
  const m = DATUM.exec(datum);
  if (!m) return 0;
  return Math.floor(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])) / 86_400_000);
}

/** Index des Eintrags für dieses Datum in einer Liste mit `anzahl` Einträgen; leere Liste → null. */
export function tagesIndex(datum: string, anzahl: number): number | null {
  if (anzahl <= 0) return null;
  return ((tagNummer(datum) % anzahl) + anzahl) % anzahl;
}

/** Eintrag des Tages aus einer Liste (in der gepflegten Reihenfolge); leere Liste → null. */
export function eintragDesTages<T>(liste: readonly T[], datum: string): T | null {
  const i = tagesIndex(datum, liste.length);
  return i === null ? null : liste[i];
}

/** Stelle „Sure:Vers“ (ein einzelner Vers) → Teile; ungültig → null. */
export function leseVersStelle(roh: string): { sure: number; vers: number } | null {
  const m = /^\s*(\d{1,3})\s*:\s*(\d{1,3})\s*$/.exec(roh);
  if (!m) return null;
  const sure = Number(m[1]);
  const vers = Number(m[2]);
  return sure >= 1 && sure <= 114 && vers >= 1 && vers <= 286 ? { sure, vers } : null;
}
