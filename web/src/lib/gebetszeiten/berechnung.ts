import { CalculationMethod, CalculationParameters, Coordinates, HighLatitudeRule, Madhab, PrayerTimes, Qibla, Rounding } from 'adhan';
import {
  GEBETE,
  STANDARD_EINSTELLUNGEN,
  STANDARD_NAEHERUNG,
  type Berechnungseinstellungen,
  type Gebet,
  type HoheBreite,
  type Naeherung,
  type Tageszeiten,
} from './typen';

/**
 * Berechnung mit adhan (ADR 0008, ADR 0048) – vorläufiger Ersatz, sichtbar „berechnet“ (K-08, G-06). Zwei Wege:
 * - Näherung „IGMG (angenähert)“ (Standard): eigene Winkel, Temkin in Sekunden, eigene Rundung auf die Minute.
 * - Methode: adhan-Methode mit Madhab, Hochbreitenregel und Minuten-Anpassungen; Imsak = Fajr (MENSCHEN M-017a).
 */
const ZONE = 'Europe/Berlin';
const MINUTE_MS = 60_000;
const formate = new Map<string, Intl.DateTimeFormat>();
/** „HH:MM“ in der Zeitzone `zone` (Standard Europe/Berlin; „Mein Ort“ nutzt die Zeitzone des Geräts). */
function zeitFormat(zone: string): Intl.DateTimeFormat {
  let format = formate.get(zone);
  if (!format) {
    format = new Intl.DateTimeFormat('de-DE', { timeZone: zone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
    formate.set(zone, format);
  }
  return format;
}

function hochbreite(regel: HoheBreite) {
  return regel === 'middleofthenight'
    ? HighLatitudeRule.MiddleOfTheNight
    : regel === 'twilightangle'
      ? HighLatitudeRule.TwilightAngle
      : HighLatitudeRule.SeventhOfTheNight;
}

function parameter(e: Berechnungseinstellungen) {
  const p = CalculationMethod[e.methode]();
  p.madhab = e.madhab === 'hanafi' ? Madhab.Hanafi : Madhab.Shafi;
  p.highLatitudeRule = hochbreite(e.hoheBreite);
  p.adjustments.fajr = e.anpassungen.imsak ?? 0;
  p.adjustments.sunrise = e.anpassungen.gunes ?? 0;
  p.adjustments.dhuhr = e.anpassungen.ogle ?? 0;
  p.adjustments.asr = e.anpassungen.ikindi ?? 0;
  p.adjustments.maghrib = e.anpassungen.aksam ?? 0;
  p.adjustments.isha = e.anpassungen.yatsi ?? 0;
  return p;
}

/** Parameter der Näherung: Winkel ohne Methode („Other“), keine Anpassungen, keine Rundung (die folgt nach dem Temkin). */
function naeherungsParameter(n: Naeherung) {
  const p = new CalculationParameters('Other', n.fajrWinkel, n.ishaWinkel);
  p.madhab = Madhab.Shafi;
  p.highLatitudeRule = hochbreite(n.hoheBreite);
  p.rounding = Rounding.None;
  return p;
}

function adhanZeiten(datum: string, breite: number, laenge: number, p: CalculationParameters): Record<Gebet, Date> {
  const [j, m, t] = datum.split('-').map(Number);
  // adhan liest Jahr/Monat/Tag über die lokalen Getter – deshalb lokaler Konstruktor (unabhängig von der Server-Zeitzone)
  const z = new PrayerTimes(new Coordinates(breite, laenge), new Date(j, m - 1, t, 12), p);
  return { imsak: z.fajr, gunes: z.sunrise, ogle: z.dhuhr, ikindi: z.asr, aksam: z.maghrib, yatsi: z.isha };
}

/** Ungerundete Zeitpunkte der Näherung ohne Temkin in Millisekunden (Grundlage der Kalibrierung, `kalibrierung.ts`). */
export function naeherungRoh(datum: string, breite: number, laenge: number, n: Naeherung = STANDARD_NAEHERUNG): Record<Gebet, number> {
  const z = adhanZeiten(datum, breite, laenge, naeherungsParameter(n));
  return Object.fromEntries(GEBETE.map((g) => [g, z[g].getTime()])) as Record<Gebet, number>;
}

/** Temkin anlegen und auf die volle Minute runden (ab der halben Minute aufwärts). */
export function mitTemkin(ms: number, temkinSek: number): Date {
  return new Date(Math.floor((ms + temkinSek * 1000) / MINUTE_MS + 0.5) * MINUTE_MS);
}

/** Tageszeiten für ein Datum „JJJJ-MM-TT“ (Kalenderdatum in `zone`, Standard Europe/Berlin). */
export function berechneTag(datum: string, e: Berechnungseinstellungen = STANDARD_EINSTELLUNGEN, zone = ZONE): Tageszeiten {
  const format = zeitFormat(zone);
  if (e.rueckfall === 'naeherung') {
    const n = e.naeherung ?? STANDARD_NAEHERUNG;
    const roh = naeherungRoh(datum, e.breite, e.laenge, n);
    return Object.fromEntries(GEBETE.map((g) => [g, format.format(mitTemkin(roh[g], n.temkinSek[g]))])) as Tageszeiten;
  }
  const werte = adhanZeiten(datum, e.breite, e.laenge, parameter(e));
  return Object.fromEntries(GEBETE.map((g) => [g, format.format(werte[g])])) as Tageszeiten;
}

/** Alle Tage eines Monats „JJJJ-MM“. */
export function berechneMonat(
  jahrMonat: string,
  e: Berechnungseinstellungen = STANDARD_EINSTELLUNGEN,
): (Tageszeiten & { datum: string })[] {
  const [j, m] = jahrMonat.split('-').map(Number);
  const tage = new Date(Date.UTC(j, m, 0)).getUTCDate();
  return Array.from({ length: tage }, (_, i) => {
    const datum = `${jahrMonat}-${String(i + 1).padStart(2, '0')}`;
    return { datum, ...berechneTag(datum, e) };
  });
}

/** Qibla-Richtung in Grad (von Nord im Uhrzeigersinn), fest berechnet (K-08). */
export function qiblaRichtung(breite = STANDARD_EINSTELLUNGEN.breite, laenge = STANDARD_EINSTELLUNGEN.laenge): number {
  return Math.round(Qibla(new Coordinates(breite, laenge)) * 10) / 10;
}
