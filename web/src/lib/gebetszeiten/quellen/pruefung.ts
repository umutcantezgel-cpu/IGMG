import { berechneTag, naeherungRoh } from '../berechnung';
import { berlinTeile } from '../naechstes';
import { GEBETE, type Berechnungseinstellungen, type Gebet, type Tageszeiten } from '../typen';
import { buchstaben, reihenfolgeOk } from './normalisieren';

/**
 * Plausibilität gelieferter Gebetszeiten (ADR 0048), bevor der Abgleich etwas schreibt. Reine Funktion.
 *
 * Harte Fehler (nichts wird geschrieben): Reihenfolge (Yatsı nach Mitternacht erlaubt), Lücke oder Dublette, Tagessprung
 * über 6 Minuten außer an den Umstellungstagen (letzter Sonntag im März bzw. Oktober: ±60 ± 6 Minuten), Sommerzeitprobe
 * (Öğle muss 0 bis 10 Minuten nach dem berechneten Sonnenhöchststand liegen – erkennt Daten in UTC oder ohne Sommerzeit;
 * IGMG Aachen liegt bei +4,5 bis +5,6) und ein abweichender Ort.
 * Weiche Prüfung: Abweichung von der Näherung über 10 Minuten (Mai bis August 45 Minuten, weil die Sommerregel der IGMG
 * nicht belegt ist) → Status „auffällig“; geschrieben wird dann erst nach Freigabe in der Verwaltung.
 */
export type HarterFehler = {
  datum: string | null;
  fehler: 'reihenfolge' | 'luecke' | 'doppelt' | 'sprung' | 'sommerzeit' | 'stadt' | 'leer';
  gebet?: Gebet;
};
export type Auffaelligkeit = { datum: string; gebet: Gebet; abweichungMin: number };
export type Pruefbericht = { hart: HarterFehler[]; auffaellig: Auffaelligkeit[] };

export type PruefTag = Tageszeiten & { datum: string };

const MAX_SPRUNG_MIN = 6;
const OEGLE_NACH_HOECHSTSTAND_MIN = { von: 0, bis: 10 };
const AUFFAELLIG_MIN = 10;
const AUFFAELLIG_SOMMER_MIN = 45;

/** Ort als Vergleichswert: Stadt-ID („20238“) bleibt, Namen ohne Diakritika und Länderkürzel („Wetzlar (DE)“ → „wetzlar“). */
const kennung = (ort: string) => (/^\d+$/.test(ort.trim()) ? ort.trim() : buchstaben(ort.replace(/\([A-Z]{2}\)/, '')));
const minuten = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));
/** Yatsı nach Mitternacht zählt als Folgetag (+24 h), damit Sprünge und Abweichungen stetig bleiben. */
const minutenVon = (z: Tageszeiten, g: Gebet) =>
  g === 'yatsi' && minuten(z.yatsi) < minuten(z.imsak) ? minuten(z.yatsi) + 1440 : minuten(z[g]);

function naechsterTag(datum: string): string {
  const [j, m, t] = datum.split('-').map(Number);
  return new Date(Date.UTC(j, m - 1, t + 1)).toISOString().slice(0, 10);
}

/** Letzter Sonntag eines Monats (1-basiert) als „JJJJ-MM-TT“. */
function letzterSonntag(jahr: number, monat: number): string {
  const letzter = new Date(Date.UTC(jahr, monat, 0));
  return new Date(Date.UTC(jahr, monat - 1, letzter.getUTCDate() - letzter.getUTCDay())).toISOString().slice(0, 10);
}

/** Erwarteter Sprung der Wanduhr an diesem Tag gegenüber dem Vortag: +60 (Sommerzeit), −60 (Winterzeit), sonst 0. */
export function umstellung(datum: string): number {
  const jahr = Number(datum.slice(0, 4));
  if (datum === letzterSonntag(jahr, 3)) return 60;
  if (datum === letzterSonntag(jahr, 10)) return -60;
  return 0;
}

/** Sonnenhöchststand in Minuten der Berliner Wanduhr (mit Sekundenanteil). */
function hoechststand(datum: string, breite: number, laenge: number): number {
  const w = berlinTeile(new Date(naeherungRoh(datum, breite, laenge).ogle));
  return w.h * 60 + w.min + w.s / 60;
}

export function pruefePlausibilitaet(
  tage: readonly PruefTag[],
  o: {
    /** Einstellungen der Gemeinde: Koordinaten und Näherung für die weiche Prüfung */
    einstellung: Berechnungseinstellungen;
    /** Ort laut Lieferung und erwarteter Ort (Stadt-ID oder Name); weichen sie ab, ist das ein harter Fehler */
    ort?: { geliefert: string | null; erwartet: string };
  },
): Pruefbericht {
  const hart: HarterFehler[] = [];
  const auffaellig: Auffaelligkeit[] = [];
  if (tage.length === 0) return { hart: [{ datum: null, fehler: 'leer' }], auffaellig };
  if (o.ort?.geliefert && kennung(o.ort.geliefert) !== kennung(o.ort.erwartet)) hart.push({ datum: null, fehler: 'stadt' });
  const sortiert = [...tage].sort((a, b) => a.datum.localeCompare(b.datum));
  const naeherung: Berechnungseinstellungen = { ...o.einstellung, rueckfall: 'naeherung' };
  sortiert.forEach((tag, i) => {
    if (!reihenfolgeOk(tag)) hart.push({ datum: tag.datum, fehler: 'reihenfolge' });
    const vor = sortiert[i - 1];
    if (vor) {
      if (vor.datum === tag.datum) hart.push({ datum: tag.datum, fehler: 'doppelt' });
      else if (naechsterTag(vor.datum) !== tag.datum) hart.push({ datum: tag.datum, fehler: 'luecke' });
      else {
        const soll = umstellung(tag.datum);
        for (const g of GEBETE) {
          if (Math.abs(minutenVon(tag, g) - minutenVon(vor, g) - soll) > MAX_SPRUNG_MIN)
            hart.push({ datum: tag.datum, fehler: 'sprung', gebet: g });
        }
      }
    }
    const nachHoechststand = minuten(tag.ogle) - hoechststand(tag.datum, o.einstellung.breite, o.einstellung.laenge);
    if (nachHoechststand < OEGLE_NACH_HOECHSTSTAND_MIN.von - 0.5 || nachHoechststand > OEGLE_NACH_HOECHSTSTAND_MIN.bis + 0.5)
      hart.push({ datum: tag.datum, fehler: 'sommerzeit', gebet: 'ogle' });
    const vergleich = berechneTag(tag.datum, naeherung);
    const monat = Number(tag.datum.slice(5, 7));
    const grenze = monat >= 5 && monat <= 8 ? AUFFAELLIG_SOMMER_MIN : AUFFAELLIG_MIN;
    for (const g of GEBETE) {
      const abweichungMin = minutenVon(tag, g) - minutenVon(vergleich, g);
      if (Math.abs(abweichungMin) > grenze) auffaellig.push({ datum: tag.datum, gebet: g, abweichungMin });
    }
  });
  return { hart, auffaellig };
}
