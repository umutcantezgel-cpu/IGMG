import { describe, expect, it } from 'vitest';
import {
  lernappKursArtEnum,
  lernappSpracheEnum,
  lernappStatusEnum,
  lernappStufeEnum,
  lernappUrteilEnum,
  lernappFehlerEnum,
  lernappPruefArtEnum,
} from '@/lib/db/schema';
import { FEHLER, PRUEF_ARTEN, STATUS, URTEILE } from '@/lib/lernapp/freigabe';
import {
  inhaltSprache,
  istKurs,
  istKursSlug,
  istOberflaeche,
  istRichtung,
  istSchluesselVon,
  istStufe,
  KURS_ARTEN,
  KURS_SLUGS,
  KURSE,
  kursArt,
  kursInOberflaeche,
  kursPfade,
  kursVonSlug,
  OBERFLAECHEN,
  pruefeLernappBezug,
  richtung,
  richtungenAus,
  richtungVon,
  RICHTUNGEN,
  SPRACHEN,
  STUFEN,
  stufenVon,
  zerlegeRichtung,
} from '@/lib/lernapp/kurse';

/** Sprachen, Kurse, Richtungen und Stufen (ADR 0037 Nr. 1/7, L3-E04, L3-E11) – und Gleichheit mit den Enums im Schema. */
describe('Kurse und Richtungen der Lern-App', () => {
  it('Oberflächen de/tr/ar; Arabisch von rechts nach links; en ist keine Oberfläche', () => {
    expect(OBERFLAECHEN).toEqual(['de', 'tr', 'ar']);
    expect(OBERFLAECHEN.map(richtung)).toEqual(['ltr', 'ltr', 'rtl']);
    expect(istOberflaeche('en')).toBe(false);
    expect(istOberflaeche('ar')).toBe(true);
    expect(istOberflaeche(undefined)).toBe(false);
  });

  it('sechs Richtungen in allen Kombinationen ungleicher Sprachen', () => {
    expect(RICHTUNGEN).toHaveLength(6);
    const paare = new Set(RICHTUNGEN.map((r) => JSON.stringify(zerlegeRichtung(r))));
    for (const ziel of SPRACHEN)
      for (const ausgang of SPRACHEN) {
        const r = richtungVon(ziel, ausgang);
        if (ziel === ausgang) expect(r).toBeNull();
        else {
          expect(r).toBe(`${ziel}-aus-${ausgang}`);
          expect(paare.has(JSON.stringify({ ziel, ausgang }))).toBe(true);
        }
      }
    expect(richtungenAus('de').sort()).toEqual(['ar-aus-de', 'tr-aus-de']);
    expect(richtungenAus('ar').sort()).toEqual(['de-aus-ar', 'tr-aus-ar']);
    expect(istRichtung('en-aus-de')).toBe(false);
  });

  it('Kurse und Slugs: Richtung → Zielsprache, Wissen und Koran-Arabisch eigenständig', () => {
    expect(KURSE).toEqual(['de', 'tr', 'ar', 'islam', 'koran']);
    expect(KURS_SLUGS).toHaveLength(8);
    expect(kursVonSlug('tr-aus-de')).toBe('tr');
    expect(kursVonSlug('de-aus-ar')).toBe('de');
    expect(kursVonSlug('islam')).toBe('islam');
    expect(kursArt('islam')).toBe('wissen');
    expect(kursArt('koran')).toBe('koran');
    expect(kursArt('ar')).toBe('sprache');
    expect(inhaltSprache('islam')).toBe('de');
    expect(inhaltSprache('koran')).toBe('ar');
    expect(istKurs('tr-aus-de')).toBe(false);
    expect(istKursSlug('tr')).toBe(false);
  });

  it('Koran-Arabisch ist in der arabischen Oberfläche ausgeblendet, Wissen überall; 23 Lernpfade', () => {
    expect(kursInOberflaeche('koran', 'ar')).toBe(false);
    expect(kursInOberflaeche('koran', 'tr')).toBe(true);
    expect(OBERFLAECHEN.every((ui) => kursInOberflaeche('islam', ui))).toBe(true);
    expect(kursPfade()).toHaveLength(23);
  });

  it('Stufen: A1–C1 für Sprachkurse, eigene Stufen für Wissen und Koran-Arabisch', () => {
    expect(stufenVon('tr')).toEqual(['a1', 'a2', 'b1', 'b2', 'c1']);
    expect(stufenVon('islam')).toEqual(['grund', 'aufbau', 'vertiefung']);
    expect(istStufe('ar', 'c1')).toBe(true);
    expect(istStufe('ar', 'c2')).toBe(false);
    expect(istStufe('koran', 'a1')).toBe(false);
  });

  it('Enums im Schema stimmen mit den Werten hier überein', () => {
    expect(lernappSpracheEnum.enumValues).toEqual([...SPRACHEN]);
    expect(lernappKursArtEnum.enumValues).toEqual([...KURS_ARTEN]);
    expect(lernappStufeEnum.enumValues).toEqual([...STUFEN]);
    expect(lernappStatusEnum.enumValues).toEqual([...STATUS]);
    expect(lernappUrteilEnum.enumValues).toEqual([...URTEILE]);
    expect(lernappFehlerEnum.enumValues).toEqual([...FEHLER]);
    expect(lernappPruefArtEnum.enumValues).toEqual([...PRUEF_ARTEN]);
  });

  it('Schlüssel gehören zum Kurs', () => {
    expect(istSchluesselVon('ar', 'ar.a1.e03')).toBe(true);
    expect(istSchluesselVon('ar', 'ar.a1.e03.s0042')).toBe(true);
    expect(istSchluesselVon('ar', 'tr.a1.e03')).toBe(false);
    expect(istSchluesselVon('ar', 'ar')).toBe(false);
    expect(istSchluesselVon('ar', 'AR.a1.e03')).toBe(false);
    expect(istSchluesselVon('ar', 'ar.a1 e03')).toBe(false);
    expect(istSchluesselVon('ar', `ar.${'x'.repeat(200)}`)).toBe(false);
  });
});

describe('Zuweisung aus der Lern-App (aufgabe.bezug, L3-E05)', () => {
  it('nimmt Kurs, Einheit und Lektion des Kurses an', () => {
    expect(pruefeLernappBezug({ art: 'lernapp', kurs: 'tr-aus-de' })).toEqual({ art: 'lernapp', kurs: 'tr-aus-de' });
    expect(pruefeLernappBezug({ art: 'lernapp', kurs: 'tr-aus-de', einheit: 'tr.a1.e01' })).toEqual({
      art: 'lernapp',
      kurs: 'tr-aus-de',
      einheit: 'tr.a1.e01',
    });
    expect(pruefeLernappBezug({ art: 'lernapp', kurs: 'islam', einheit: 'islam.grund.e02', lektion: 'islam.grund.e02.l03' })).toEqual({
      art: 'lernapp',
      kurs: 'islam',
      einheit: 'islam.grund.e02',
      lektion: 'islam.grund.e02.l03',
    });
  });

  it('weist fremde Kurse, fremde Einheiten, Lektionen ohne Einheit und Zusatzfelder ab', () => {
    for (const falsch of [
      null,
      'lernapp',
      { art: 'quran', kurs: 'tr-aus-de' },
      { art: 'lernapp', kurs: 'en-aus-de' },
      { art: 'lernapp', kurs: 'tr-aus-de', einheit: 'ar.a1.e01' },
      { art: 'lernapp', kurs: 'tr-aus-de', lektion: 'tr.a1.e01.l01' },
      { art: 'lernapp', kurs: 'tr-aus-de', einheit: 'tr.a1.e01', lektion: 'tr.a1.e02.l01' },
      { art: 'lernapp', kurs: 'tr-aus-de', einheit: 7 },
      { art: 'lernapp', kurs: 'tr-aus-de', titel: 'x' },
    ])
      expect(pruefeLernappBezug(falsch)).toBeNull();
  });
});
