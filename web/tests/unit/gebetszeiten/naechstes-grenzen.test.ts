import { describe, expect, it } from 'vitest';
import { naechstesGebet, restzeit, zeitpunkt } from '@/lib/gebetszeiten/naechstes';
import type { Tageszeiten } from '@/lib/gebetszeiten/typen';

/**
 * Akzeptanzkriterium K-08 (1) „Nächstes Gebet“ (Blätter S02 DC:197–203, S03 dc:68).
 * Erwartet wird: vor dem Imsak der Imsak; zwischen zwei Gebeten das folgende; genau zur Gebetszeit gilt das Gebet
 * als erreicht und das nächste ist das folgende (S03: „Gebetszeit erreicht: gilt als aktuell“); nach der Yatsı der Imsak
 * des Folgetags. Güneş ist kein Gebet und wird übersprungen (alle drei Aufrufer der Seite setzen ohneGunes = true).
 * Die Zeiten sind feste Beispielwerte; die Erwartungen stehen in diesem Test, nicht im Code.
 */

const tag: Tageszeiten = { imsak: '06:05', gunes: '07:42', ogle: '13:24', ikindi: '16:22', aksam: '18:58', yatsi: '20:28' };
const folgetag: Tageszeiten = { imsak: '06:07', gunes: '07:44', ogle: '13:23', ikindi: '16:20', aksam: '18:56', yatsi: '20:26' };
const heute = { datum: '2026-10-11', zeiten: tag };
const morgen = { datum: '2026-10-12', zeiten: folgetag };

const SEKUNDE = 1_000;
const MINUTE = 60_000;

/** Ortszeit Europe/Berlin am 11.10.2026 (Sommerzeit, weit weg von der Umstellung). */
const um = (hhmm: string) => zeitpunkt('2026-10-11', hhmm);

const minutenVon = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3));
const gebeteOhneGunes = ['imsak', 'ogle', 'ikindi', 'aksam', 'yatsi'] as const;

describe('Nächstes Gebet vor dem Imsak (K-08 1)', () => {
  it('um 03:00 ist der Imsak des Tages das nächste Gebet, Restzeit 3 Std. 5 Min.', () => {
    const n = naechstesGebet(heute, morgen, um('03:00'), true);
    expect(n).toMatchObject({ gebet: 'imsak', morgen: false });
    expect(restzeit(n!.restMs)).toEqual({ stunden: 3, minuten: 5 });
  });

  it('eine Minute vor dem Imsak zeigt eine Minute Restzeit', () => {
    const n = naechstesGebet(heute, morgen, um('06:04'), true);
    expect(n).toMatchObject({ gebet: 'imsak', morgen: false });
    expect(restzeit(n!.restMs)).toEqual({ stunden: 0, minuten: 1 });
  });
});

describe('Nächstes Gebet zwischen zwei Gebeten (K-08 1)', () => {
  it('um 10:00 ist das Mittagsgebet das nächste, Restzeit 3 Std. 24 Min.', () => {
    const n = naechstesGebet(heute, morgen, um('10:00'), true);
    expect(n).toMatchObject({ gebet: 'ogle', morgen: false });
    expect(restzeit(n!.restMs)).toEqual({ stunden: 3, minuten: 24 });
  });

  it('um 17:00 ist das Abendgebet (Akşam) das nächste, das vergangene Ikindi zählt nicht mehr', () => {
    const n = naechstesGebet(heute, morgen, um('17:00'), true);
    expect(n).toMatchObject({ gebet: 'aksam', morgen: false });
    expect(restzeit(n!.restMs)).toEqual({ stunden: 1, minuten: 58 });
  });

  it('zwischen Imsak und Mittagsgebet wird der Sonnenaufgang übersprungen', () => {
    const n = naechstesGebet(heute, morgen, um('06:30'), true);
    expect(n).toMatchObject({ gebet: 'ogle', morgen: false });
    expect(restzeit(n!.restMs)).toEqual({ stunden: 6, minuten: 54 });
  });
});

describe('Nächstes Gebet genau zur Gebetszeit (Grenze, K-08 1)', () => {
  it('um 13:24:00 gilt das Mittagsgebet als erreicht, das nächste ist Ikindi mit 2 Std. 58 Min.', () => {
    const n = naechstesGebet(heute, morgen, um('13:24'), true);
    expect(n).toMatchObject({ gebet: 'ikindi', morgen: false });
    expect(restzeit(n!.restMs)).toEqual({ stunden: 2, minuten: 58 });
  });

  it('eine Millisekunde vor 13:24 ist das Mittagsgebet noch das nächste, Restzeit 1 Min.', () => {
    const knapp = new Date(um('13:24').getTime() - 1);
    const n = naechstesGebet(heute, morgen, knapp, true);
    expect(n).toMatchObject({ gebet: 'ogle', morgen: false });
    expect(restzeit(n!.restMs)).toEqual({ stunden: 0, minuten: 1 });
  });

  it('um 13:24:30 ist Ikindi das nächste, Restzeit 2 Std. 58 Min. (auf volle Minuten aufgerundet)', () => {
    const n = naechstesGebet(heute, morgen, new Date(um('13:24').getTime() + 30 * SEKUNDE), true);
    expect(n).toMatchObject({ gebet: 'ikindi', morgen: false });
    expect(restzeit(n!.restMs)).toEqual({ stunden: 2, minuten: 58 });
  });
});

describe('Nach der Yatsı kommt der Imsak des Folgetags (K-08 1)', () => {
  it('genau zur Yatsı-Zeit (20:28:00) ist die Yatsı erreicht: nächstes Gebet ist der Imsak des Folgetags, Restzeit 9 Std. 39 Min.', () => {
    const n = naechstesGebet(heute, morgen, um('20:28'), true);
    expect(n).toMatchObject({ gebet: 'imsak', morgen: true });
    expect(restzeit(n!.restMs)).toEqual({ stunden: 9, minuten: 39 });
  });

  it('eine Sekunde nach der Yatsı: Imsak des Folgetags, Restzeit 9 Std. 39 Min. (aufgerundet)', () => {
    const n = naechstesGebet(heute, morgen, new Date(um('20:28').getTime() + SEKUNDE), true);
    expect(n).toMatchObject({ gebet: 'imsak', morgen: true });
    expect(restzeit(n!.restMs)).toEqual({ stunden: 9, minuten: 39 });
  });

  it('um 23:59:59 bleibt der Imsak des Folgetags das nächste, Restzeit 6 Std. 8 Min. (aufgerundet)', () => {
    const n = naechstesGebet(heute, morgen, new Date(um('23:59').getTime() + 59 * SEKUNDE), true);
    expect(n).toMatchObject({ gebet: 'imsak', morgen: true });
    expect(restzeit(n!.restMs)).toEqual({ stunden: 6, minuten: 8 });
  });

  it('eine Millisekunde vor der Yatsı ist die Yatsı noch das nächste Gebet, nicht der Folgetag', () => {
    const n = naechstesGebet(heute, morgen, new Date(um('20:28').getTime() - 1), true);
    expect(n).toMatchObject({ gebet: 'yatsi', morgen: false });
    expect(restzeit(n!.restMs)).toEqual({ stunden: 0, minuten: 1 });
  });

  it('ohne Folgetag gibt es nach der Yatsı kein nächstes Gebet (null)', () => {
    expect(naechstesGebet(heute, null, um('20:28'), true)).toBeNull();
    expect(naechstesGebet(heute, null, um('23:59'), true)).toBeNull();
  });
});

describe('Nächstes Gebet je Minute des Tages (K-08 1, Eigenschaft)', () => {
  it('nennt zu jeder Minute genau das nächste Gebet mit exakter Restzeit, Gebetszeit selbst zählt als erreicht', () => {
    for (let m = 0; m < 24 * 60; m++) {
      const hhmm = `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
      const naechstes = gebeteOhneGunes.find((g) => minutenVon(tag[g]) > m);
      const erwartetesGebet = naechstes ?? 'imsak';
      const verbleibend = naechstes ? minutenVon(tag[naechstes]) - m : minutenVon(folgetag.imsak) + 24 * 60 - m;
      const n = naechstesGebet(heute, morgen, um(hhmm), true);

      expect(n?.gebet, `${hhmm}: nächstes Gebet`).toBe(erwartetesGebet);
      expect(restzeit(n?.restMs ?? Number.NaN), `${hhmm}: Restzeit`).toEqual({
        stunden: Math.floor(verbleibend / 60),
        minuten: verbleibend % 60,
      });
    }
  });

  it('Güneş ist nie das nächste Gebet, wenn es übersprungen wird', () => {
    for (let m = 0; m < 24 * 60; m++) {
      const hhmm = `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
      expect(naechstesGebet(heute, morgen, um(hhmm), true)?.gebet, hhmm).not.toBe('gunes');
    }
  });

  it('Restzeit ist nie negativ und nie ein Gebet in der Vergangenheit (Abstand genau eine Minute bei 13:23)', () => {
    const n = naechstesGebet(heute, morgen, um('13:23'), true);
    expect(n?.restMs).toBe(MINUTE);
    expect(n!.zeitpunkt.getTime()).toBeGreaterThan(um('13:23').getTime());
  });
});
