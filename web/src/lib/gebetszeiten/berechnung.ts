import { CalculationMethod, Coordinates, HighLatitudeRule, Madhab, PrayerTimes, Qibla } from 'adhan';
import { GEBETE, STANDARD_EINSTELLUNGEN, type Berechnungseinstellungen, type Tageszeiten } from './typen';

/**
 * Berechnung mit adhan (ADR 0008) – vorläufiger Ersatz, sichtbar „berechnet“ (K-08, G-06).
 * Imsak = Fajr (18° bei „Turkey“, ohne Temkin; MENSCHEN M-017a).
 */
const ZONE = 'Europe/Berlin';
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

function parameter(e: Berechnungseinstellungen) {
  const p = CalculationMethod[e.methode]();
  p.madhab = e.madhab === 'hanafi' ? Madhab.Hanafi : Madhab.Shafi;
  p.highLatitudeRule =
    e.hoheBreite === 'middleofthenight'
      ? HighLatitudeRule.MiddleOfTheNight
      : e.hoheBreite === 'twilightangle'
        ? HighLatitudeRule.TwilightAngle
        : HighLatitudeRule.SeventhOfTheNight;
  p.adjustments.fajr = e.anpassungen.imsak ?? 0;
  p.adjustments.sunrise = e.anpassungen.gunes ?? 0;
  p.adjustments.dhuhr = e.anpassungen.ogle ?? 0;
  p.adjustments.asr = e.anpassungen.ikindi ?? 0;
  p.adjustments.maghrib = e.anpassungen.aksam ?? 0;
  p.adjustments.isha = e.anpassungen.yatsi ?? 0;
  return p;
}

/** Tageszeiten für ein Datum „JJJJ-MM-TT“ (Kalenderdatum in `zone`, Standard Europe/Berlin). */
export function berechneTag(datum: string, e: Berechnungseinstellungen = STANDARD_EINSTELLUNGEN, zone = ZONE): Tageszeiten {
  const [j, m, t] = datum.split('-').map(Number);
  // adhan liest Jahr/Monat/Tag über die lokalen Getter – deshalb lokaler Konstruktor (unabhängig von der Server-Zeitzone)
  const zeiten = new PrayerTimes(new Coordinates(e.breite, e.laenge), new Date(j, m - 1, t, 12), parameter(e));
  const werte: Record<(typeof GEBETE)[number], Date> = {
    imsak: zeiten.fajr,
    gunes: zeiten.sunrise,
    ogle: zeiten.dhuhr,
    ikindi: zeiten.asr,
    aksam: zeiten.maghrib,
    yatsi: zeiten.isha,
  };
  const format = zeitFormat(zone);
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
