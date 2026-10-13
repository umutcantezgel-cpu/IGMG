import { describe, expect, it } from 'vitest';
import { inaktivLoeschDatum, inaktivStufe, inaktivVorfilter, nachweisFrist, plusMonate } from '@/lib/loeschen/fristen';
import { eintragDesTages, leseVersStelle, tagesIndex, tagNummer } from '@/lib/religioes/des-tages';

/**
 * Fristregeln (DSFA D-14, D-16) und die Auswahl „des Tages“ (Kür K-A) als reine Funktionen.
 */
const tag = (iso: string) => new Date(iso);

describe('D-14: Einwilligungsnachweis bis zum Ende der Verjährung', () => {
  it('3 Jahre ab Ende des Jahres der Löschung, Jahreswechsel in Wetzlarer Zeit', () => {
    expect(nachweisFrist(tag('2026-10-13T03:00:00Z')).toISOString()).toBe('2029-12-31T23:00:00.000Z');
    // 31. 12. 2026, 23:30 in Wetzlar ist schon 2026 (UTC 22:30) – Ende 2029
    expect(nachweisFrist(tag('2026-12-31T22:30:00Z')).toISOString()).toBe('2029-12-31T23:00:00.000Z');
    // 1. 1. 2027, 00:30 in Wetzlar (UTC noch 2026) gehört zu 2027 – Ende 2030
    expect(nachweisFrist(tag('2026-12-31T23:30:00Z')).toISOString()).toBe('2030-12-31T23:00:00.000Z');
  });
});

describe('D-16: inaktive Konten (24 Monate, Vorwarnung 30 Tage vorher)', () => {
  const zuletzt = tag('2024-11-01T10:00:00Z');
  const frist = plusMonate(zuletzt, 24);

  it('aktiv bis 30 Tage vor Ablauf, dann Vorwarnung', () => {
    expect(inaktivStufe({ zuletztAktiv: zuletzt, gewarntAm: null }, new Date(frist.getTime() - 31 * 86_400_000))).toBe('aktiv');
    expect(inaktivStufe({ zuletztAktiv: zuletzt, gewarntAm: null }, new Date(frist.getTime() - 30 * 86_400_000))).toBe('warnen');
  });

  it('nach der Vorwarnung: warten bis Ablauf und mindestens 30 Tage, dann löschen', () => {
    const gewarnt = new Date(frist.getTime() - 30 * 86_400_000);
    expect(inaktivStufe({ zuletztAktiv: zuletzt, gewarntAm: gewarnt }, new Date(frist.getTime() - 1))).toBe('warten');
    expect(inaktivStufe({ zuletztAktiv: zuletzt, gewarntAm: gewarnt }, frist)).toBe('loeschen');
    // Spät gewarnt (z. B. Altbestand): volle 30 Tage ab der Vorwarnung
    const spaet = new Date(frist.getTime() + 100 * 86_400_000);
    expect(inaktivLoeschDatum(zuletzt, spaet).getTime()).toBe(spaet.getTime() + 30 * 86_400_000);
    expect(inaktivStufe({ zuletztAktiv: zuletzt, gewarntAm: spaet }, new Date(spaet.getTime() + 29 * 86_400_000))).toBe('warten');
    expect(inaktivStufe({ zuletztAktiv: zuletzt, gewarntAm: spaet }, new Date(spaet.getTime() + 30 * 86_400_000))).toBe('loeschen');
  });

  it('eine Anmeldung nach der Vorwarnung macht sie ungültig', () => {
    const gewarnt = tag('2026-10-01T00:00:00Z');
    expect(inaktivStufe({ zuletztAktiv: tag('2026-10-05T00:00:00Z'), gewarntAm: gewarnt }, tag('2026-12-01T00:00:00Z'))).toBe('aktiv');
  });

  it('Vorfilter der Abfrage schließt kein fälliges Konto aus', () => {
    const jetzt = tag('2026-10-13T03:00:00Z');
    for (const tage of [0, 1, 15, 31, 60]) {
      const z = new Date(plusMonate(jetzt, -24).getTime() + (30 - tage) * 86_400_000);
      if (inaktivStufe({ zuletztAktiv: z, gewarntAm: null }, jetzt) !== 'aktiv')
        expect(z.getTime()).toBeLessThanOrEqual(inaktivVorfilter(jetzt).getTime());
    }
  });
});

describe('Vers und Hadith des Tages (K-A)', () => {
  it('alle Seiten wählen für ein Datum denselben Eintrag, Tag für Tag der Reihe nach', () => {
    const liste = ['a', 'b', 'c'];
    const heute = eintragDesTages(liste, '2026-10-13');
    expect(eintragDesTages(liste, '2026-10-13')).toBe(heute);
    const i = liste.indexOf(heute!);
    expect(eintragDesTages(liste, '2026-10-14')).toBe(liste[(i + 1) % 3]);
    expect(eintragDesTages(liste, '2026-10-15')).toBe(liste[(i + 2) % 3]);
  });

  it('leere Liste → nichts; Index nie negativ', () => {
    expect(eintragDesTages([], '2026-10-13')).toBeNull();
    expect(tagesIndex('1969-12-30', 7)).toBeGreaterThanOrEqual(0);
    expect(tagNummer('2026-10-13') - tagNummer('2026-10-12')).toBe(1);
    expect(tagNummer('kein Datum')).toBe(0);
  });

  it('Stelle für den Vers des Tages: genau ein Vers', () => {
    expect(leseVersStelle('2:255')).toEqual({ sure: 2, vers: 255 });
    expect(leseVersStelle('2:255-256')).toBeNull();
    expect(leseVersStelle('0:1')).toBeNull();
  });
});
