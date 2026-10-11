/**
 * Islamisches Datum (Hidschri) über Intl, Kalender „islamic-umalqura“ (K-08: Ramadan-Hervorhebung in der
 * Monatsansicht). Berechnet, nicht beobachtet: Der Kalender der Diyanet/IGMG kann um einen Tag abweichen (M-066).
 * Reine Funktionen, im Browser und auf dem Server nutzbar.
 */
export type HijriDatum = { tag: number; monat: number; jahr: number };

const zahlen = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', {
  day: 'numeric',
  month: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
});

/** Hidschri-Datum eines Kalendertags „JJJJ-MM-TT“. */
export function hijriDatum(datum: string): HijriDatum {
  const [j, m, t] = datum.split('-').map(Number);
  const teile = Object.fromEntries(zahlen.formatToParts(new Date(Date.UTC(j, m - 1, t, 12))).map((p) => [p.type, p.value]));
  return { tag: Number(teile.day), monat: Number(teile.month), jahr: Number(String(teile.year).replace(/\D/g, '')) };
}

/** Liegt der Tag im Ramadan (9. Monat)? */
export function istRamadan(datum: string): boolean {
  return hijriDatum(datum).monat === 9;
}

/** Hidschri-Datum als Text in der Sprache der Seite, z. B. „28. Rabiʻ II 1448 AH“. */
export function hijriText(datum: string, locale: string): string {
  const [j, m, t] = datum.split('-').map(Number);
  return new Intl.DateTimeFormat(`${locale}-u-ca-islamic-umalqura-nu-latn`, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(j, m - 1, t, 12)));
}
