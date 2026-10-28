import type { Locale } from '@/i18n/routing';
import type { Kennzahl, ZahlArt } from '@/lib/validierung/seiteninhalte/igmg';

/**
 * Kennzahlen des Dachverbands (Plan Marktstart P1, ADR 0046): Ausgabe je Sprache und Übernahme alter Texte. Reine
 * Funktionen ohne Oberfläche, damit Seite, Verwaltung (Browser) und Tests dieselben Regeln nutzen.
 * Die Vorlagen je Art stehen in messages/bereiche/igmg.json unter `igmg.zahlArt` („über {zahl}“, „rund {zahl}“).
 * Türkisch ohne Kasusendung („700+“, „yaklaşık 200.000“): „700’ü aşkın“ hinge von der Vokalharmonie der Zahl ab und
 * lässt sich nicht als feste Vorlage schreiben.
 */

const ZAHL_LOCALE: Record<Locale, string> = { de: 'de-DE', tr: 'tr-TR', en: 'en-GB' };

/** Vorlage je Art, z. B. `(art, zahl) => t(`zahlArt.${art}`, { zahl })`. */
export type ZahlVorlage = (art: ZahlArt, zahl: string) => string;

/** Ganze Zahl mit Tausendertrennung der Sprache (de „2.500“, tr „2.500“, en „2,500“). */
export function zahlText(wert: number, sprache: Locale): string {
  return new Intl.NumberFormat(ZAHL_LOCALE[sprache], { maximumFractionDigits: 0, useGrouping: true }).format(wert);
}

/**
 * Kennzahl als Text der Seitensprache. Alte Texte erscheinen unverändert (auch Platzhalter „[Zahl fehlt: …]“);
 * leerer Text oder `null` heißt „keine Angabe“ (`null`, die Kachel entfällt).
 */
export function formatKennzahl(k: Kennzahl | null | undefined, sprache: Locale, vorlage: ZahlVorlage): string | null {
  if (k === null || k === undefined) return null;
  if (typeof k === 'string') return k.trim() || null;
  return vorlage(k.art, zahlText(k.wert, sprache));
}

/** Stand als Text: Monat JJJJ-MM („Juni 2026“) oder Tag JJJJ-MM-TT („27. Oktober 2026“); sonst `null`. */
export function formatStand(stand: string, sprache: Locale): string | null {
  const treffer = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(stand);
  if (!treffer) return null;
  const [, jahr, monat, tag] = treffer;
  // Mittag UTC hält den Kalendertag in jeder europäischen Zeitzone stabil
  const datum = new Date(Date.UTC(Number(jahr), Number(monat) - 1, tag ? Number(tag) : 1, 12));
  const optionen: Intl.DateTimeFormatOptions = tag
    ? { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }
    : { month: 'long', year: 'numeric', timeZone: 'UTC' };
  return new Intl.DateTimeFormat(ZAHL_LOCALE[sprache], optionen).format(datum);
}

/** Wörter vor der Zahl, die eine Art kennzeichnen (de/tr/en, klein geschrieben). */
const UEBER = /^(über|mehr als|more than|over)\s+/;
const RUND = /^(rund|ca\.?|circa|etwa|knapp|around|about|approximately|nearly|yaklaşık)\s+/;

/**
 * Übernimmt einen alten Text in die neue Form (Verwaltung, Plan P1): „über 700“, „700+“ → über 700; „rund 200.000“,
 * „ca. 20.000“ → rund; „2.500“, „2,500“, „518“ → genau. Alles andere (Platzhalter, freie Texte) bleibt Text – die Seite
 * zeigt es dann unverändert, und die Redaktion entscheidet selbst.
 */
export function kennzahlAusText(text: string): Kennzahl {
  const roh = text.trim();
  let rest = roh.toLocaleLowerCase('de');
  let art: ZahlArt = 'genau';
  if (UEBER.test(rest)) {
    art = 'ueber';
    rest = rest.replace(UEBER, '');
  } else if (RUND.test(rest)) {
    art = 'rund';
    rest = rest.replace(RUND, '');
  }
  if (rest.endsWith('+')) {
    art = 'ueber';
    rest = rest.slice(0, -1).trim();
  }
  // Nur Ziffern mit Tausenderpunkten, -kommas oder schmalen Leerzeichen; Dezimalstellen gibt es bei Kennzahlen nicht
  if (!/^\d{1,3}([.,\u202f\u00a0 ]\d{3})*$|^\d+$/.test(rest)) return roh;
  const wert = Number(rest.replace(/[.,\u202f\u00a0 ]/g, ''));
  return Number.isSafeInteger(wert) ? { wert, art } : roh;
}
