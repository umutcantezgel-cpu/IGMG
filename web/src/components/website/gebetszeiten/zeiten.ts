import { restzeit, zeitpunkt } from '@/lib/gebetszeiten/naechstes';
import type { Sprache } from '@/lib/i18n/inhalt';
import type { GebetszeitenEinstellung } from '@/lib/validierung/einstellungen';
import type { BerechnungsMethode } from './EinstellungenPanel';

/** Zeitzone aller Gebetszeiten (K-08). */
const ZONE = 'Europe/Berlin';
const LOCALE: Record<Sprache, string> = { de: 'de-DE', tr: 'tr-TR', en: 'en-GB' };

/** Platzhalter wie {name} in einem fertig übersetzten Text füllen. */
export function fuelle(vorlage: string, werte: Record<string, string>): string {
  return Object.entries(werte).reduce((text, [schluessel, wert]) => text.split(`{${schluessel}}`).join(wert), vorlage);
}

/** Kalendertag „JJJJ-MM-TT“ als „Di., 23. Jan. 2024“ (Format des Designs, Europe/Berlin). */
export function datumMitJahr(datum: string, sprache: Sprache): string {
  return new Intl.DateTimeFormat(LOCALE[sprache], {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: ZONE,
  }).format(zeitpunkt(datum, '12:00'));
}

/** Monat „JJJJ-MM“ als ausgeschriebener Monatsname mit Jahr, z. B. „Januar 2024“. */
export function monatsname(monat: string, sprache: Sprache): string {
  return new Intl.DateTimeFormat(LOCALE[sprache], { month: 'long', year: 'numeric', timeZone: ZONE }).format(
    zeitpunkt(`${monat}-15`, '12:00'),
  );
}

/** Folgemonat „JJJJ-MM“, rechnet über den Jahreswechsel. */
export function folgemonat(monat: string): string {
  const [jahr, monatNummer] = monat.split('-').map(Number);
  const folge = new Date(Date.UTC(jahr, monatNummer, 1));
  return `${folge.getUTCFullYear()}-${String(folge.getUTCMonth() + 1).padStart(2, '0')}`;
}

/** Kalendertag „JJJJ-MM-TT“ als „01.01“ (Spalte „Datum“ im Design). */
export function tagKurz(datum: string): string {
  return `${datum.slice(8, 10)}.${datum.slice(5, 7)}`;
}

/** Restzeit bis zum nächsten Gebet als Text, z. B. „2 Std. 15 Min.“ oder „15 Min.“ (aufgerundet auf Minuten). */
export function restzeitText(restMs: number, vorlagen: { stunden: string; minuten: string }): string {
  const { stunden, minuten } = restzeit(restMs);
  return stunden > 0
    ? fuelle(vorlagen.stunden, { stunden: String(stunden), minuten: String(minuten) })
    : fuelle(vorlagen.minuten, { minuten: String(minuten) });
}

/** Berechnungsmethode der Einstellung → Auswahl im Tab Einstellungen (nur die fünf Methoden des Designs). */
export const METHODEN_ANZEIGE: Partial<Record<GebetszeitenEinstellung['methode'], BerechnungsMethode>> = {
  Turkey: 'turkey',
  MuslimWorldLeague: 'mwl',
  NorthAmerica: 'isna',
  Egyptian: 'egypt',
  UmmAlQura: 'makkah',
};
