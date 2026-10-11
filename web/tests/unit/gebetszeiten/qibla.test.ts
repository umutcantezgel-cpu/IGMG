import { describe, expect, it } from 'vitest';
import { qiblaRichtung } from '@/lib/gebetszeiten/berechnung';

/**
 * Akzeptanzkriterium K-08 (4) Qibla: für Wetzlar zwischen 127° und 130° (berechnet, M-017c; der Bestandswert 136° entfällt),
 * für Standorte nahe Mekka plausibel. Der Maßstab ist der Anfangskurs des Großkreises zur Kaaba, unabhängig von adhan
 * berechnet. Kaaba-Koordinaten nach Blatt S02 (DC:135: 21,4225° N, 39,8262° E). Angabe in Grad von Nord im Uhrzeigersinn.
 */

const KAABA = { breite: 21.4225, laenge: 39.8262 };
const GRAD = Math.PI / 180;

/** Anfangskurs des Großkreises vom Standort zur Kaaba in Grad, Bereich 0 bis unter 360. */
function grosskreiskurs(breite: number, laenge: number): number {
  const dLam = (KAABA.laenge - laenge) * GRAD;
  const y = Math.sin(dLam) * Math.cos(KAABA.breite * GRAD);
  const x =
    Math.cos(breite * GRAD) * Math.sin(KAABA.breite * GRAD) - Math.sin(breite * GRAD) * Math.cos(KAABA.breite * GRAD) * Math.cos(dLam);
  return (Math.atan2(y, x) / GRAD + 360) % 360;
}

describe('Qibla für Wetzlar (K-08 4, M-017c)', () => {
  it('liegt zwischen 127° und 130°', () => {
    expect(qiblaRichtung()).toBeGreaterThanOrEqual(127);
    expect(qiblaRichtung()).toBeLessThanOrEqual(130);
  });

  it('stimmt mit dem Großkreiskurs für Wetzlar auf 0,05° überein', () => {
    expect(Math.abs(qiblaRichtung() - grosskreiskurs(50.567, 8.5))).toBeLessThanOrEqual(0.05);
  });

  it('weicht vom Bestandswert 136° ab (M-017c)', () => {
    expect(Math.abs(qiblaRichtung() - 136)).toBeGreaterThan(5);
  });
});

describe('Qibla nahe Mekka (K-08 4)', () => {
  it.each([
    ['0,5° nördlich der Kaaba', KAABA.breite + 0.5, KAABA.laenge, 180],
    ['0,5° südlich der Kaaba', KAABA.breite - 0.5, KAABA.laenge, 0],
    ['0,5° östlich der Kaaba', KAABA.breite, KAABA.laenge + 0.5, 270],
    ['0,5° westlich der Kaaba', KAABA.breite, KAABA.laenge - 0.5, 90],
  ])('%s: die Richtung nach Mekka ist plausibel', (_name, breite, laenge, erwartet) => {
    const abweichung = Math.abs(qiblaRichtung(breite, laenge) - erwartet);
    expect(Math.min(abweichung, 360 - abweichung)).toBeLessThanOrEqual(0.5);
  });

  it('genau in Mekka ist die Richtung unbestimmt, der Wert bleibt aber endlich und zwischen 0 und 360', () => {
    const wert = qiblaRichtung(KAABA.breite, KAABA.laenge);
    expect(Number.isFinite(wert)).toBe(true);
    expect(wert).toBeGreaterThanOrEqual(0);
    expect(wert).toBeLessThan(360);
  });
});

describe('Qibla weltweit (K-08 4)', () => {
  it.each([
    ['Jakarta', -6.2, 106.8],
    ['New York', 40.7128, -74.006],
    ['Sydney', -33.8688, 151.2093],
    ['Kapstadt', -33.9249, 18.4241],
  ])('%s stimmt mit dem Großkreiskurs überein (auf eine Nachkommastelle gerundet, ±0,1°)', (_ort, breite, laenge) => {
    expect(Math.abs(qiblaRichtung(breite, laenge) - grosskreiskurs(breite, laenge))).toBeLessThanOrEqual(0.1);
  });

  it('liefert für ein Raster über die Erde nur Werte von 0 bis unter 360 Grad', () => {
    for (const breite of [-60, -30, 0, 30, 60]) {
      for (let laenge = -180; laenge < 180; laenge += 30) {
        const wert = qiblaRichtung(breite, laenge);
        expect(wert >= 0 && wert < 360, `${breite}/${laenge}: ${wert}`).toBe(true);
      }
    }
  });
});
