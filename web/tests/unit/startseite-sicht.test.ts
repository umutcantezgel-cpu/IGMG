import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { BESCHRIFTUNG_REIHE_REM, beschriftungsBreite, beschriftungsLagen } from '@/components/website/start/bogenwahl';
import { EMPFEHLUNG_FRIST_TAGE, waehleAufmacher } from '@/server/queries/nachrichten';
import { BEISPIEL_NACHRICHTEN } from '../../drizzle/seeds/daten/nachrichten';

/**
 * Startseite nach der Sichtabnahme Z-04 (Befundpaket 2): Aufmacher mit Frist für „empfohlen“ (ST-1) und die
 * Beschriftungen des Tagesbogens auf einer Grundlinie ohne Überlappung (ST-3).
 */

/** Beitrag mit Veröffentlichung „JJJJ-MM-TT“ (10 Uhr Berlin wie in den Seeds, hier als UTC genähert). */
const beitrag = (id: string, datum: string, empfohlen = false) => ({ id, empfohlen, veroeffentlichtAm: `${datum}T08:00:00.000Z` });

describe('waehleAufmacher (ST-1)', () => {
  it('Frist beträgt 30 Tage', () => {
    expect(EMPFEHLUNG_FRIST_TAGE).toBe(30);
  });

  it('ohne frische Empfehlung: der neueste Beitrag', () => {
    const liste = [beitrag('neu', '2026-10-12'), beitrag('alt-empfohlen', '2025-07-20', true), beitrag('aelter', '2025-07-18')];
    expect(waehleAufmacher(liste, '2026-10-14')?.id).toBe('neu');
  });

  it('eine Empfehlung innerhalb der Frist schlägt neuere Beiträge', () => {
    const liste = [beitrag('neu', '2026-10-12'), beitrag('empfohlen', '2026-09-20', true), beitrag('aelter', '2026-09-01')];
    expect(waehleAufmacher(liste, '2026-10-14')?.id).toBe('empfohlen');
  });

  it('Grenze: genau 30 Tage alt zählt noch, 31 Tage nicht mehr', () => {
    const liste = [beitrag('neu', '2026-10-12'), beitrag('empfohlen', '2026-09-14', true)];
    expect(waehleAufmacher(liste, '2026-10-14')?.id).toBe('empfohlen');
    expect(waehleAufmacher(liste, '2026-10-15')?.id).toBe('neu');
  });

  it('leere Liste: kein Aufmacher', () => {
    expect(waehleAufmacher([], '2026-10-14')).toBeUndefined();
  });

  it('mit den Beispieldaten ist der Aufmacher die Meldung vom 12.10.2026', () => {
    // wie ladeNachrichten: neueste zuerst
    const liste = BEISPIEL_NACHRICHTEN.map((n) => ({
      slug: n.slug,
      empfohlen: n.empfohlen,
      veroeffentlichtAm: new Date(`${n.veroeffentlicht}:00Z`).toISOString(),
    })).sort((a, b) => b.veroeffentlichtAm.localeCompare(a.veroeffentlichtAm));
    expect(waehleAufmacher(liste, '2026-10-14')?.slug).toBe('eroeffnung-der-neuen-fatih-moschee');
    expect(BEISPIEL_NACHRICHTEN.find((n) => n.slug === 'neue-gebetszeiten-fuer-den-winter')?.empfohlen).toBe(false);
  });
});

describe('beschriftungsLagen (ST-3)', () => {
  const A = 0.14;
  /** n gleich breite Beschriftungen */
  const gleich = (n: number, b = A) => Array.from({ length: n }, () => b);
  /** Abstände benachbarter Lagen */
  const luecken = (l: number[]) => l.slice(1).map((x, i) => x - l[i]);

  it('weit genug auseinander: jede Beschriftung genau unter ihrem Punkt', () => {
    const lagen = [0.1, 0.3, 0.5, 0.7, 0.9];
    beschriftungsLagen(lagen, gleich(5)).forEach((x, i) => expect(x).toBeCloseTo(lagen[i], 10));
  });

  it('zu eng: Gruppe rückt symmetrisch um den Mittelwert auseinander', () => {
    const [a, b] = beschriftungsLagen([0.45, 0.55], gleich(2));
    expect(b - a).toBeCloseTo(A, 10);
    expect((a + b) / 2).toBeCloseTo(0.5, 10);
  });

  it('ungleich breit: der Abstand ist die halbe Summe der beiden Breiten', () => {
    const [a, b] = beschriftungsLagen([0.5, 0.5], [0.1, 0.2]);
    expect(b - a).toBeCloseTo(0.15, 10);
  });

  it('am Rand: keine Beschriftung ragt hinaus', () => {
    const l = beschriftungsLagen([0.05, 0.08], gleich(2));
    expect(l[0]).toBeGreaterThanOrEqual(A / 2 - 1e-9);
    expect(luecken(l)[0]).toBeGreaterThanOrEqual(A - 1e-9);
    const r = beschriftungsLagen([0.92, 0.95], gleich(2));
    expect(r[1]).toBeLessThanOrEqual(1 - A / 2 + 1e-9);
  });

  it('Herbsttag in Wetzlar (Imsak 05:56 … Isha 20:21): Reihenfolge bleibt, keine Überlappung, nichts ragt hinaus', () => {
    // Punkte des Bogens als Anteil (Rand 32 von 640, Zeit linear von Imsak bis Yatsı)
    const minuten = [356, 458, 797, 966, 1125, 1221];
    const lagen = minuten.map((m) => (32 + ((m - 356) / (1221 - 356)) * 576) / 640);
    for (const namen of [
      ['Imsak', 'Aufgang', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'],
      ['İmsak', 'Güneş Doğuşu', 'Öğle', 'İkindi', 'Akşam', 'Yatsı'],
    ]) {
      for (let stern = -1; stern < 6; stern++) {
        const breiten = namen.map((n, i) => beschriftungsBreite(n, i === stern) / BESCHRIFTUNG_REIHE_REM);
        const l = beschriftungsLagen(lagen, breiten);
        expect(l).toHaveLength(6);
        luecken(l).forEach((d, i) => expect(d).toBeGreaterThanOrEqual((breiten[i] + breiten[i + 1]) / 2 - 1e-9));
        expect(l[0] - breiten[0] / 2).toBeGreaterThanOrEqual(-1e-9);
        expect(l[5] + breiten[5] / 2).toBeLessThanOrEqual(1 + 1e-9);
      }
    }
    // Deutsch ohne Stern: Dhuhr liegt frei und bleibt genau unter seinem Punkt
    const de = ['Imsak', 'Aufgang', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((n) => beschriftungsBreite(n, false) / BESCHRIFTUNG_REIHE_REM);
    expect(beschriftungsLagen(lagen, de)[2]).toBeCloseTo(lagen[2], 10);
  });

  it('alle Punkte an derselben Stelle: gleichmäßig verteilt innerhalb der Breite', () => {
    const l = beschriftungsLagen([0.5, 0.5, 0.5, 0.5, 0.5, 0.5], gleich(6));
    luecken(l).forEach((d) => expect(d).toBeCloseTo(A, 10));
    expect((l[0] + l[5]) / 2).toBeCloseTo(0.5, 10);
  });

  it('zusammen breiter als der Platz: gleichmäßig verkleinert, alle passen hinein', () => {
    const l = beschriftungsLagen([0.2, 0.2, 0.2, 0.2], gleich(4, 0.5));
    luecken(l).forEach((d) => expect(d).toBeCloseTo(0.25, 10));
    expect(l[0]).toBeCloseTo(0.125, 10);
    expect(l[3]).toBeCloseTo(0.875, 10);
  });

  it('leer bleibt leer', () => {
    expect(beschriftungsLagen([], [])).toEqual([]);
  });

  it('Platzbedarf: längerer Name braucht mehr, der Achtstern 1,25 rem zusätzlich, mindestens die Zeit', () => {
    expect(beschriftungsBreite('Maghrib', false)).toBeGreaterThan(beschriftungsBreite('Asr', false));
    expect(beschriftungsBreite('Asr', true) - beschriftungsBreite('Asr', false)).toBeCloseTo(1.25, 10);
    expect(beschriftungsBreite('Asr', false)).toBeCloseTo(3.4 + 0.75, 10);
  });
});

describe('Bauweise (statisch)', () => {
  const quelle = (p: string) => readFileSync(join(import.meta.dirname, '..', '..', 'src', p), 'utf8');

  it('Startseite rechnet die Frist mit dem gecachten Datum, nicht mit einer laufenden Uhr', () => {
    const s = quelle('app/[locale]/(website)/page.tsx');
    expect(s).toMatch(/waehleAufmacher\(nachrichten, heute\)/);
    expect(s).toMatch(/heuteBerlin\(\)/);
    expect(s).not.toMatch(/new Date\(\)|Date\.now\(\)/);
  });
});
