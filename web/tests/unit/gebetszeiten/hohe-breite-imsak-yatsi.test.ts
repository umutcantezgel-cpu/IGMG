import { describe, expect, it } from 'vitest';
import { berechneTag } from '@/lib/gebetszeiten/berechnung';

/**
 * BEFUND A22-1 (Festlegung ungeklärt): Imsak und Yatsı weichen vom Winkel ab, Mitte der Saison um 16 bis 36 Minuten, am Rand über 100 Minuten.
 *
 * Maßstab: MENSCHEN M-017a („Imsak = Fajr bei 18°, ohne Temkin“), ADR 0008 („Turkey = Fajr 18°, Isha 17°“).
 * Verhalten der App: adhan wendet die Siebtel-der-Nacht-Grenze immer an, also Imsak = max(Fajr 18°, Sonnenaufgang − Nacht/7)
 * und Yatsı = min(Isha 17°, Sonnenuntergang + Nacht/7). ADR 0008 nennt als Anlass nur die Hochsommer-Lücke (Ende Mai bis
 * Mitte Juli), doch die Grenze wirkt auch im März bis Mai und im Juli bis Oktober (Wetzlar 2026: 28.03. Imsak 04:35 statt
 * Winkel ca. 04:19; 15.04. Imsak 05:05
 * statt ca. 04:29; 15.04. Yatsı 21:48 statt ca. 22:14). Die Grenze ist nötig, weil der reine 18°-Winkel am Rand der
 * Hochsommer-Lücke absurd wird (28.05.2026: ca. 01:50). Ob sie dauerhaft gilt, ist eine offene Entscheidung für die Gemeinde.
 *
 * Die Sonnenhöhen kommen aus einer eigenen Rechnung (Spencer, Refraktion −0,833° nur für Auf- und Untergang, nicht für die
 * Winkel), nicht aus adhan. Die Tests mit it.fails sind bekannte Fehlschläge (FIXME A22-1): Sie laufen grün, solange die
 * Abweichung besteht, und werden rot, sobald die Festlegung umgesetzt ist; dann die Markierung entfernen und den Test prüfen.
 * Vitest 5.0.3 kennt kein test.fixme; it.fails ist das Gegenstück mit ausgeführter Prüfung.
 */

const BREITE = 50.567;
const LAENGE = 8.5;
const GRAD = Math.PI / 180;
const MINUTE = 60_000;
const STUNDE = 3_600_000;
const TOLERANZ_MINUTEN = 4;

const wanduhrFormat = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Berlin', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
const wanduhr = (ms: number) => wanduhrFormat.format(new Date(ms));
const minutenVon = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3));

function tagImJahr(j: number, m: number, t: number): number {
  return Math.round((Date.UTC(j, m - 1, t) - Date.UTC(j, 0, 1)) / 86_400_000) + 1;
}

function zeitgleichung(n: number): number {
  const b = (2 * Math.PI * (n - 1)) / 365;
  return 229.18 * (0.000075 + 0.001868 * Math.cos(b) - 0.032077 * Math.sin(b) - 0.014615 * Math.cos(2 * b) - 0.040849 * Math.sin(2 * b));
}

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

/** Winkelzeit in der Berliner Wanduhr: morgens der Durchgang bei `grad` (aufsteigend), abends der absteigende. */
function winkelzeit(datum: string, grad: number, morgens: boolean): string {
  const [j, m, t] = datum.split('-').map(Number);
  const beginn = Date.UTC(j, m - 1, t);
  const durch = morgens
    ? durchgang(beginn - 3 * STUNDE, beginn + 12 * STUNDE, grad, true)
    : durchgang(beginn + 12 * STUNDE, beginn + 27 * STUNDE, grad, false);
  if (durch === undefined) throw new Error(`kein Durchgang bei ${grad}° am ${datum}`);
  return wanduhr(durch);
}

describe('Kontrolle des Maßstabs: Winkelzeiten an den Prüftagen (A22-1)', () => {
  it('Morgendämmerung 18° und Abenddämmerung 17° liegen an den Prüftagen im erwarteten Fenster', () => {
    expect(minutenVon(winkelzeit('2026-03-28', -18, true))).toBeGreaterThanOrEqual(minutenVon('04:00'));
    expect(minutenVon(winkelzeit('2026-03-28', -18, true))).toBeLessThanOrEqual(minutenVon('04:40'));
    expect(minutenVon(winkelzeit('2026-04-15', -18, true))).toBeGreaterThanOrEqual(minutenVon('04:15'));
    expect(minutenVon(winkelzeit('2026-04-15', -18, true))).toBeLessThanOrEqual(minutenVon('04:45'));
    expect(minutenVon(winkelzeit('2026-04-15', -17, false))).toBeGreaterThanOrEqual(minutenVon('22:00'));
    expect(minutenVon(winkelzeit('2026-04-15', -17, false))).toBeLessThanOrEqual(minutenVon('22:30'));
    expect(minutenVon(winkelzeit('2026-10-11', -18, true))).toBeGreaterThanOrEqual(minutenVon('05:40'));
    expect(minutenVon(winkelzeit('2026-10-11', -17, false))).toBeLessThanOrEqual(minutenVon('20:40'));
  });

  it('11.10.2026: Imsak entspricht Fajr 18° und Yatsı Isha 17° (±4 Min.), weil dort die Grenze nicht wirkt', () => {
    const t = berechneTag('2026-10-11');
    expect(Math.abs(minutenVon(t.imsak) - minutenVon(winkelzeit('2026-10-11', -18, true)))).toBeLessThanOrEqual(TOLERANZ_MINUTEN);
    expect(Math.abs(minutenVon(t.yatsi) - minutenVon(winkelzeit('2026-10-11', -17, false)))).toBeLessThanOrEqual(TOLERANZ_MINUTEN);
  });
});

describe('FIXME A22-1: Imsak und Yatsı im Frühling entsprechen den Winkeln (bekannter Fehlschlag)', () => {
  it.fails('FIXME A22-1 · 28.03.2026: Imsak entspricht Fajr 18° (±4 Min.); App 04:35, Winkel ca. 04:19', () => {
    const t = berechneTag('2026-03-28');
    expect(Math.abs(minutenVon(t.imsak) - minutenVon(winkelzeit('2026-03-28', -18, true)))).toBeLessThanOrEqual(TOLERANZ_MINUTEN);
  });

  it.fails('FIXME A22-1 · 15.04.2026: Imsak entspricht Fajr 18° (±4 Min.); App 05:05, Winkel ca. 04:29', () => {
    const t = berechneTag('2026-04-15');
    expect(Math.abs(minutenVon(t.imsak) - minutenVon(winkelzeit('2026-04-15', -18, true)))).toBeLessThanOrEqual(TOLERANZ_MINUTEN);
  });

  it.fails('FIXME A22-1 · 15.04.2026: Yatsı entspricht Isha 17° (±4 Min.); App 21:48, Winkel ca. 22:14', () => {
    const t = berechneTag('2026-04-15');
    expect(Math.abs(minutenVon(t.yatsi) - minutenVon(winkelzeit('2026-04-15', -17, false)))).toBeLessThanOrEqual(TOLERANZ_MINUTEN);
  });
});
