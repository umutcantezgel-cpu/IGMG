import { hijriDatum, type HijriDatum } from '@/lib/gebetszeiten/hijri';

/**
 * Monatsraster des Gemeindekalenders (AUFTRAG 3.10): Wochen von Montag bis Sonntag, je Tag das gregorianische Datum
 * und der Hidschri-Tag (berechnet, Umm al-Qura, M-066). Reine Funktionen ohne Zeitzone des Prozesses: Jeder Tag ist
 * ein Kalendertag „JJJJ-MM-TT“ (UTC-Mittag als Rechenpunkt).
 */
export type RasterTag = {
  datum: string;
  /** Tag im Monat (1–31) */
  tag: number;
  /** Gehört der Tag zum dargestellten Monat (sonst Rand der ersten/letzten Woche)? */
  imMonat: boolean;
  /** 0 = Montag … 6 = Sonntag */
  wochentag: number;
  hijri: HijriDatum;
};

export type MonatsRaster = {
  /** „JJJJ-MM“ */
  monat: string;
  wochen: RasterTag[][];
  /** Hidschri-Monate, die in diesem Monat vorkommen (in Reihenfolge), mit dem ersten Kalendertag je Monat. */
  hijriMonate: { monat: number; jahr: number; ab: string }[];
};

const MONAT = /^(\d{4})-(0[1-9]|1[0-2])$/;

function utc(datum: string): Date {
  return new Date(`${datum}T12:00:00Z`);
}

export function tagPlus(datum: string, n: number): string {
  const d = utc(datum);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Wochentag mit Montag = 0. */
export function wochentagMontag(datum: string): number {
  return (utc(datum).getUTCDay() + 6) % 7;
}

/** `anzahl` Monate ab `start` („JJJJ-MM“), z. B. folgemonate('2026-11', 3) → 2026-11, 2026-12, 2027-01. */
export function folgemonate(start: string, anzahl: number): string[] {
  const m = MONAT.exec(start);
  if (!m) throw new Error('Ungültiger Monat');
  const jahr = Number(m[1]);
  const monat = Number(m[2]) - 1;
  return Array.from({ length: anzahl }, (_, i) => {
    const j = jahr + Math.floor((monat + i) / 12);
    const mo = ((monat + i) % 12) + 1;
    return `${j}-${String(mo).padStart(2, '0')}`;
  });
}

/** Anzahl der Tage eines Monats „JJJJ-MM“. */
export function tageImMonat(monat: string): number {
  const [j, m] = monat.split('-').map(Number);
  return new Date(Date.UTC(j, m, 0)).getUTCDate();
}

/** Raster eines Monats: volle Wochen (Montag bis Sonntag), 4 bis 6 Zeilen. */
export function monatsRaster(monat: string): MonatsRaster {
  if (!MONAT.test(monat)) throw new Error('Ungültiger Monat');
  const erster = `${monat}-01`;
  const letzter = `${monat}-${String(tageImMonat(monat)).padStart(2, '0')}`;
  const beginn = tagPlus(erster, -wochentagMontag(erster));
  const ende = tagPlus(letzter, 6 - wochentagMontag(letzter));
  const wochen: RasterTag[][] = [];
  const hijriMonate: MonatsRaster['hijriMonate'] = [];
  for (let d = beginn; d <= ende; d = tagPlus(d, 1)) {
    const wochentag = wochentagMontag(d);
    if (wochentag === 0) wochen.push([]);
    const hijri = hijriDatum(d);
    const imMonat = d.startsWith(monat);
    if (imMonat) {
      const letzte = hijriMonate.at(-1);
      if (!letzte || letzte.monat !== hijri.monat || letzte.jahr !== hijri.jahr)
        hijriMonate.push({ monat: hijri.monat, jahr: hijri.jahr, ab: d });
    }
    wochen.at(-1)!.push({ datum: d, tag: Number(d.slice(8, 10)), imMonat, wochentag, hijri });
  }
  return { monat, wochen, hijriMonate };
}

/** Hidschri-Monat (lang) mit Jahr in der Sprache der Seite, z. B. „Rabiʻ II 1448 AH“ (Intl, Kalender umalqura). */
export function hijriMonatText(datum: string, locale: string): string {
  return new Intl.DateTimeFormat(`${locale}-u-ca-islamic-umalqura-nu-latn`, { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
    utc(datum),
  );
}

/** Gregorianischer Monat mit Jahr, z. B. „Oktober 2026“. */
export function monatText(monat: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(utc(`${monat}-01`));
}

/** Kurze Wochentagsnamen ab Montag in der Sprache der Seite (lang für Screenreader, kurz für die Spaltenköpfe). */
export function wochentagNamen(locale: string): { kurz: string; lang: string }[] {
  // 2024-01-01 war ein Montag
  return Array.from({ length: 7 }, (_, i) => {
    const d = utc(tagPlus('2024-01-01', i));
    return {
      kurz: new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' }).format(d),
      lang: new Intl.DateTimeFormat(locale, { weekday: 'long', timeZone: 'UTC' }).format(d),
    };
  });
}
