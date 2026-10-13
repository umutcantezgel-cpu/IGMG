/**
 * Terminserien der Lerngruppen (AUFTRAG 3.5): reine Funktionen ohne Datenbank. Kalendertage als „JJJJ-MM-TT“;
 * Wochentage 0 = Sonntag … 6 = Samstag (wie `Date.getUTCDay`).
 */
export type Serie = {
  beginn: string | null;
  ende: string | null;
  wochentage: readonly number[];
  uhrzeitVon: string | null;
  uhrzeitBis: string | null;
};
export type TerminVorschlag = { datum: string; beginn: string | null; ende: string | null };

export function tagPlus(datum: string, tage: number): string {
  const d = new Date(`${datum}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + tage);
  return d.toISOString().slice(0, 10);
}

export function wochentag(datum: string): number {
  return new Date(`${datum}T12:00:00Z`).getUTCDay();
}

/** Termine der Serie im Zeitraum [von, bis] (beide eingeschlossen), begrenzt auf Beginn/Ende der Gruppe; höchstens 400. */
export function termineDerSerie(s: Serie, von: string, bis: string): TerminVorschlag[] {
  const start = s.beginn && s.beginn > von ? s.beginn : von;
  const schluss = s.ende && s.ende < bis ? s.ende : bis;
  const tage = new Set(s.wochentage.filter((w) => Number.isInteger(w) && w >= 0 && w <= 6));
  const ergebnis: TerminVorschlag[] = [];
  if (!tage.size || start > schluss) return ergebnis;
  for (let d = start; d <= schluss && ergebnis.length < 400; d = tagPlus(d, 1)) {
    if (tage.has(wochentag(d))) ergebnis.push({ datum: d, beginn: s.uhrzeitVon, ende: s.uhrzeitBis });
  }
  return ergebnis;
}

export type AnwesenheitsStatus = 'anwesend' | 'fehlt' | 'entschuldigt' | 'verspaetet';

/** Vorbelegung der Anwesenheit: erfasster Status, sonst „entschuldigt“ bei Fehlmeldung, sonst „anwesend“. */
export function vorbelegung(erfasst: AnwesenheitsStatus | null, fehlmeldung: boolean): AnwesenheitsStatus {
  return erfasst ?? (fehlmeldung ? 'entschuldigt' : 'anwesend');
}

/** Quote der Anwesenheit (anwesend + verspätet) über erfasste Termine; null ohne Daten. */
export function anwesenheitsQuote(stati: readonly AnwesenheitsStatus[]): number | null {
  if (!stati.length) return null;
  return stati.filter((s) => s === 'anwesend' || s === 'verspaetet').length / stati.length;
}
