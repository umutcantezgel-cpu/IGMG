/**
 * Einwilligung rund um den 16. Geburtstag (Art. 8 DSGVO, DSFA D-11): Bis 16 willigen die Eltern ein. Ab dem
 * 16. Geburtstag gilt deren Einwilligung noch 30 Tage weiter (Übergang); danach zählt nur noch die eigene Einwilligung
 * der oder des Jugendlichen. Fehlt sie, pausieren Chat und Push – das Lesen der eigenen Daten bleibt. Ohne bekanntes
 * Datum gilt die vorsichtige Annahme „unter 16“. Rein (ohne Datenbank), damit Unit-Tests es direkt prüfen.
 */
export const EIGENE_EINWILLIGUNG_FRIST_TAGE = 30;

export type EinwilligungsLage = 'eltern' | 'uebergang' | 'eigene';

/** Datum `JJJJ-MM-TT` plus Tage (Kalender, ohne Zeitzone). */
function plusTage(datum: string, tage: number): string {
  const d = new Date(`${datum}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + tage);
  return d.toISOString().slice(0, 10);
}

export function einwilligungsLage(sechzehnAm: string | null, heute: string): EinwilligungsLage {
  if (!sechzehnAm || heute < sechzehnAm) return 'eltern';
  return heute < plusTage(sechzehnAm, EIGENE_EINWILLIGUNG_FRIST_TAGE) ? 'uebergang' : 'eigene';
}

/**
 * Gilt eine der (nicht widerrufenen) Einwilligungen? Vor 16 und im Übergang jede gültige (Eltern oder selbst), danach
 * nur eine, die die Person selbst erteilt hat.
 */
export function einwilligungGilt(
  lage: EinwilligungsLage,
  einwilligungen: readonly { erteiltVon: string | null }[],
  selbst: string | null,
): boolean {
  if (lage !== 'eigene') return einwilligungen.length > 0;
  return selbst !== null && einwilligungen.some((e) => e.erteiltVon === selbst);
}
