import { describe, expect, it } from 'vitest';
import { berechneTag } from '@/lib/gebetszeiten/berechnung';
import { naechstesGebet, restzeit, zeitpunkt } from '@/lib/gebetszeiten/naechstes';
import type { Tageszeiten } from '@/lib/gebetszeiten/typen';

/**
 * Akzeptanzkriterium K-08 (2) Sommerzeit: Tage um die Umstellung (letzter Sonntag im März und Oktober 2026: 29.03. und 25.10.)
 * liefern Ortszeit Europe/Berlin ohne Stundensprung-Fehler; die Restzeit läuft über die Umstellung korrekt.
 *
 * Maßstab für Mittag, Güneş und Akşam ist eine eigene Sonnenrechnung (Zeitgleichung und Deklination nach Spencer,
 * Sonnenhöhe −0,833° für Auf- und Untergang), in die Berliner Wanduhr umgerechnet per Intl. Dazu die Turkey-Anpassungen
 * aus M-017b (Sonnenaufgang −7, Mittag +5, Sonnenuntergang +7 Minuten). Die Toleranz von 3 Minuten deckt Rundung und
 * Näherungen ab; ein Stundensprung wäre 60 Minuten.
 */

const BREITE = 50.567;
const LAENGE = 8.5;
const GRAD = Math.PI / 180;
const MINUTE = 60_000;
const STUNDE = 3_600_000;
const TOLERANZ_MINUTEN = 3;

const wanduhrFormat = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Berlin', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
/** Berliner Wanduhr „HH:MM“ eines Zeitpunkts. */
const wanduhr = (ms: number) => wanduhrFormat.format(new Date(ms));
const minutenVon = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3));

/** Tag des Jahres (1-basiert) eines Kalendertags. */
function tagImJahr(j: number, m: number, t: number): number {
  return Math.round((Date.UTC(j, m - 1, t) - Date.UTC(j, 0, 1)) / 86_400_000) + 1;
}

/** Zeitgleichung in Minuten (Spencer). */
function zeitgleichung(n: number): number {
  const b = (2 * Math.PI * (n - 1)) / 365;
  return 229.18 * (0.000075 + 0.001868 * Math.cos(b) - 0.032077 * Math.sin(b) - 0.014615 * Math.cos(2 * b) - 0.040849 * Math.sin(2 * b));
}

/** Sonnendeklination in Radiant (Spencer). */
function deklination(n: number): number {
  const b = (2 * Math.PI * (n - 1)) / 365;
  return (
    0.006918 -
    0.399912 * Math.cos(b) +
    0.070257 * Math.sin(b) -
    0.006758 * Math.cos(2 * b) +
    0.000907 * Math.sin(2 * b) -
    0.002697 * Math.cos(3 * b) +
    0.00148 * Math.sin(3 * b)
  );
}

/** Sonnenhöhe in Grad über dem Horizont am Standort Wetzlar für einen UTC-Zeitpunkt. */
function sonnenhoehe(ms: number): number {
  const d = new Date(ms);
  const j = d.getUTCFullYear();
  const m = d.getUTCMonth() + 1;
  const t = d.getUTCDate();
  const n = tagImJahr(j, m, t);
  const minuten = (ms - Date.UTC(j, m - 1, t)) / MINUTE;
  const stundenwinkel = ((minuten + 4 * LAENGE + zeitgleichung(n)) / 60 - 12) * 15 * GRAD;
  const phi = BREITE * GRAD;
  const dek = deklination(n);
  return Math.asin(Math.sin(phi) * Math.sin(dek) + Math.cos(phi) * Math.cos(dek) * Math.cos(stundenwinkel)) / GRAD;
}

/** Erster Durchgang der Sonnenhöhe durch `grad` zwischen `von` und `bis` (Minutenraster, dann Halbierung). */
function durchgang(von: number, bis: number, grad: number, aufsteigend: boolean): number | undefined {
  let vorher = von;
  for (let ms = von + MINUTE; ms <= bis; ms += MINUTE) {
    const davor = sonnenhoehe(vorher) - grad;
    const danach = sonnenhoehe(ms) - grad;
    if (davor < 0 !== danach < 0 && danach > 0 === aufsteigend) {
      let lo = vorher;
      let hi = ms;
      for (let i = 0; i < 30; i++) {
        const mitte = (lo + hi) / 2;
        if (sonnenhoehe(mitte) - grad > 0 === aufsteigend) hi = mitte;
        else lo = mitte;
      }
      return (lo + hi) / 2;
    }
    vorher = ms;
  }
  return undefined;
}

/** Sonnenmittag (Kulmination) als UTC-Zeitpunkt des Kalendertags. */
function mittag(j: number, m: number, t: number): number {
  return Date.UTC(j, m - 1, t) + (720 - 4 * LAENGE - zeitgleichung(tagImJahr(j, m, t))) * MINUTE;
}

/** Erwartete Berliner Ortszeiten aus der eigenen Sonnenrechnung plus Turkey-Anpassungen (M-017b). */
function erwartet(datum: string): { gunes: string; ogle: string; aksam: string } {
  const [j, m, t] = datum.split('-').map(Number);
  const beginn = Date.UTC(j, m - 1, t);
  const aufgang = durchgang(beginn, beginn + 12 * STUNDE, -0.833, true);
  const untergang = durchgang(beginn + 12 * STUNDE, beginn + 24 * STUNDE, -0.833, false);
  if (aufgang === undefined || untergang === undefined) throw new Error(`kein Auf- oder Untergang am ${datum}`);
  return {
    gunes: wanduhr(aufgang - 7 * MINUTE),
    ogle: wanduhr(mittag(j, m, t) + 5 * MINUTE),
    aksam: wanduhr(untergang + 7 * MINUTE),
  };
}

describe('Ortszeit an den Umstellungstagen (K-08 2)', () => {
  it.each(['2026-03-27', '2026-03-28', '2026-03-29', '2026-03-30', '2026-03-31', '2026-10-24', '2026-10-25', '2026-10-26', '2026-10-27'])(
    'am %s liegen Güneş, Öğle und Akşam innerhalb von 3 Min. der Berliner Sonnenrechnung',
    (datum) => {
      const app = berechneTag(datum);
      const soll = erwartet(datum);
      for (const g of ['gunes', 'ogle', 'aksam'] as const) {
        expect(
          Math.abs(minutenVon(app[g]) - minutenVon(soll[g])),
          `${datum} ${g}: App ${app[g]}, Sonnenrechnung ${soll[g]}`,
        ).toBeLessThanOrEqual(TOLERANZ_MINUTEN);
      }
    },
  );
});

describe('Umstellungsmomente als Zeitpunkte (K-08 2)', () => {
  it.each([
    ['2026-03-29', '01:59', '2026-03-29T00:59:00.000Z'],
    ['2026-03-29', '03:00', '2026-03-29T01:00:00.000Z'],
    ['2026-10-25', '01:59', '2026-10-24T23:59:00.000Z'],
    ['2026-10-25', '03:00', '2026-10-25T02:00:00.000Z'],
  ])('%s %s Ortszeit ist %s', (datum, zeit, utc) => {
    expect(zeitpunkt(datum, zeit).toISOString()).toBe(utc);
  });

  it('im Frühling fehlt die Stunde 02:00 bis 02:59: 01:59 und 03:00 liegen nur eine Minute auseinander', () => {
    expect(zeitpunkt('2026-03-29', '03:00').getTime() - zeitpunkt('2026-03-29', '01:59').getTime()).toBe(MINUTE);
  });

  it('im Herbst kommt die Stunde 02:00 bis 02:59 zweimal vor: 01:59 MESZ und 03:00 MEZ liegen 2 Std. 1 Min. auseinander', () => {
    expect(zeitpunkt('2026-10-25', '03:00').getTime() - zeitpunkt('2026-10-25', '01:59').getTime()).toBe(2 * STUNDE + MINUTE);
  });
});

describe('Restzeit über die Umstellung (K-08 2)', () => {
  const fruehlingVorabend: Tageszeiten = { imsak: '04:35', gunes: '06:04', ogle: '12:36', ikindi: '16:04', aksam: '18:59', yatsi: '20:29' };
  const fruehlingUmstellung: Tageszeiten = {
    imsak: '05:33',
    gunes: '07:02',
    ogle: '13:36',
    ikindi: '17:05',
    aksam: '20:00',
    yatsi: '21:30',
  };
  const herbstVorabend: Tageszeiten = { imsak: '06:14', gunes: '07:56', ogle: '13:15', ikindi: '15:49', aksam: '18:23', yatsi: '19:59' };
  const herbstUmstellung: Tageszeiten = { imsak: '05:15', gunes: '06:58', ogle: '12:15', ikindi: '14:47', aksam: '17:21', yatsi: '18:58' };

  it('Frühjahr, Abend vor der Umstellung: von 23:30 MEZ bis zum Imsak am 29.03. (MESZ) sind es 5 Std. 3 Min., nicht 6 Std. 3 Min.', () => {
    const n = naechstesGebet(
      { datum: '2026-03-28', zeiten: fruehlingVorabend },
      { datum: '2026-03-29', zeiten: fruehlingUmstellung },
      zeitpunkt('2026-03-28', '23:30'),
      true,
    );
    expect(n).toMatchObject({ gebet: 'imsak', morgen: true });
    expect(restzeit(n!.restMs)).toEqual({ stunden: 5, minuten: 3 });
  });

  it('Herbst, Abend vor der Umstellung: von 23:30 MESZ bis zum Imsak am 25.10. (MEZ) sind es 6 Std. 45 Min., nicht 5 Std. 45 Min.', () => {
    const n = naechstesGebet(
      { datum: '2026-10-24', zeiten: herbstVorabend },
      { datum: '2026-10-25', zeiten: herbstUmstellung },
      zeitpunkt('2026-10-24', '23:30'),
      true,
    );
    expect(n).toMatchObject({ gebet: 'imsak', morgen: true });
    expect(restzeit(n!.restMs)).toEqual({ stunden: 6, minuten: 45 });
  });

  it('Frühjahr am Umstellungstag: von 01:30 MEZ bis zum Imsak (MESZ) sind es 3 Std. 3 Min., nicht 4 Std. 3 Min.', () => {
    const n = naechstesGebet({ datum: '2026-03-29', zeiten: fruehlingUmstellung }, null, zeitpunkt('2026-03-29', '01:30'), true);
    expect(n).toMatchObject({ gebet: 'imsak', morgen: false });
    expect(restzeit(n!.restMs)).toEqual({ stunden: 3, minuten: 3 });
  });

  it('Herbst am Umstellungstag: von 01:30 MESZ bis zum Imsak (MEZ) sind es 4 Std. 45 Min., nicht 3 Std. 45 Min.', () => {
    const n = naechstesGebet({ datum: '2026-10-25', zeiten: herbstUmstellung }, null, zeitpunkt('2026-10-25', '01:30'), true);
    expect(n).toMatchObject({ gebet: 'imsak', morgen: false });
    expect(restzeit(n!.restMs)).toEqual({ stunden: 4, minuten: 45 });
  });

  it('Grenze Frühjahr: eine Minute vor dem Umschalten (01:59 MEZ) bis zum Imsak sind es 2 Std. 34 Min.', () => {
    const n = naechstesGebet({ datum: '2026-03-29', zeiten: fruehlingUmstellung }, null, zeitpunkt('2026-03-29', '01:59'), true);
    expect(n).toMatchObject({ gebet: 'imsak', morgen: false });
    expect(restzeit(n!.restMs)).toEqual({ stunden: 2, minuten: 34 });
  });

  it('Grenze Herbst: eine Minute vor dem Umschalten (01:59 MESZ) bis zum Imsak sind es 4 Std. 16 Min.', () => {
    const n = naechstesGebet({ datum: '2026-10-25', zeiten: herbstUmstellung }, null, zeitpunkt('2026-10-25', '01:59'), true);
    expect(n).toMatchObject({ gebet: 'imsak', morgen: false });
    expect(restzeit(n!.restMs)).toEqual({ stunden: 4, minuten: 16 });
  });
});
