import { describe, expect, it } from 'vitest';
import { bereicheFuer } from '@/components/mein-bereich/eintraege';
import {
  anwesenheitsZaehlung,
  datumText,
  fuelle,
  kanaeleFuer,
  kanalWahl,
  lernwegKursart,
  lernwegStand,
  naechsterFortschritt,
  passwortVorschlag,
  wochenFenster,
  wochentagKurz,
  wochentageText,
  zeitspanne,
} from '@/lib/lernen/ansicht';
import { pruefeBenutzername } from '@/lib/konto/benutzername';
import type { GruppenKontext } from '@/lib/rechte/gruppen';

/** Reine Hilfen der Lernplattform-Oberflächen (Lehrkraft, Eltern, Schüler) und die Navigation mit Funktionsschaltern. */
describe('Datum und Zeit', () => {
  it('Wochenfenster: heute plus sechs Tage, über Monatsgrenzen', () => {
    expect(wochenFenster('2026-10-13')).toEqual({ von: '2026-10-13', bis: '2026-10-19' });
    expect(wochenFenster('2026-12-29')).toEqual({ von: '2026-12-29', bis: '2027-01-04' });
  });

  it('Kalendertage zeitzonenfest in drei Sprachen', () => {
    expect(datumText('2026-10-17', 'de')).toBe('Sa., 17.10.');
    expect(datumText('2026-10-17', 'de', 'lang')).toBe('Samstag, 17. Oktober 2026');
    expect(datumText('2026-10-17', 'en', 'tag')).toContain('Saturday');
    expect(datumText('2026-10-17', 'tr', 'tag')).toContain('Cumartesi');
    expect(wochentagKurz('2026-10-18', 'de')).toBe('So');
  });

  it('Zeitspanne und Wochentage der Serie (ab Montag sortiert)', () => {
    expect(zeitspanne('10:00', '12:00')).toBe('10:00–12:00');
    expect(zeitspanne('10:00', null)).toBe('10:00');
    expect(zeitspanne(null, '12:00')).toBe('');
    expect(wochentageText([0, 6], 'de')).toBe('Sa, So');
    expect(wochentageText([3, 1, 1, 9], 'de')).toBe('Mo, Mi');
  });
});

describe('Lernweg (B-24)', () => {
  const stufen = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
  it('aktuelle Station = erste nicht abgeschlossene Stufe', () => {
    expect(lernwegStand([], {})).toBeNull();
    expect(lernwegStand(stufen, {})).toEqual({ aktuell: 0, erreicht: 0, geschafft: false });
    expect(lernwegStand(stufen, { a: 'abgeschlossen', b: 'sicher' })).toEqual({ aktuell: 1, erreicht: 1, geschafft: false });
    // Lücke: eine spätere Stufe ist abgeschlossen, eine frühere nicht → die frühere ist dran
    expect(lernwegStand(stufen, { a: 'begonnen', b: 'abgeschlossen' })).toEqual({ aktuell: 0, erreicht: 1, geschafft: false });
  });

  it('alle Stufen geschafft → letzte Station, geschafft', () => {
    expect(lernwegStand(stufen, { a: 'abgeschlossen', b: 'abgeschlossen', c: 'abgeschlossen' })).toEqual({
      aktuell: 2,
      erreicht: 3,
      geschafft: true,
    });
  });

  it('Kursart: jüngster Eintrag, bei Gleichstand die frühere im Lehrplan, sonst Elifbe', () => {
    expect(lernwegKursart([])).toBe('elifbe');
    expect(
      lernwegKursart([
        { kursart: 'elifbe', datum: '2026-09-01' },
        { kursart: 'kuran', datum: '2026-10-01' },
      ]),
    ).toBe('kuran');
    expect(
      lernwegKursart([
        { kursart: 'tecvid', datum: '2026-10-01' },
        { kursart: 'kuran', datum: '2026-10-01' },
      ]),
    ).toBe('kuran');
  });

  it('Fortschritt schaltet im Kreis weiter', () => {
    expect(naechsterFortschritt(null)).toBe('begonnen');
    expect(naechsterFortschritt('begonnen')).toBe('sicher');
    expect(naechsterFortschritt('sicher')).toBe('abgeschlossen');
    expect(naechsterFortschritt('abgeschlossen')).toBeNull();
  });

  it('Anwesenheit wird gezählt (keine Quote, keine Rangliste)', () => {
    expect(anwesenheitsZaehlung(['anwesend', 'fehlt', 'anwesend', 'entschuldigt'])).toEqual({
      anwesend: 2,
      verspaetet: 0,
      entschuldigt: 1,
      fehlt: 1,
    });
  });
});

describe('Kanäle (S-01)', () => {
  const kontext = (k: Partial<GruppenKontext>): GruppenKontext => ({
    benutzerId: 'u',
    leitung: new Map(),
    eigeneLernendeId: null,
    eigeneGruppen: new Set(),
    kinder: new Map(),
    ...k,
  });
  it('Leitung beide, Schüler nur Gruppenkanal, Eltern nur Elternkanal, Fremde keinen', () => {
    expect(kanaeleFuer(kontext({ leitung: new Map([['g', 'aufsicht']]) }), 'g')).toEqual(['gruppe', 'eltern']);
    expect(kanaeleFuer(kontext({ eigeneLernendeId: 'l', eigeneGruppen: new Set(['g']) }), 'g')).toEqual(['gruppe']);
    expect(kanaeleFuer(kontext({ kinder: new Map([['l', new Set(['g'])]]) }), 'g')).toEqual(['eltern']);
    expect(kanaeleFuer(kontext({ kinder: new Map([['l', new Set(['andere'])]]) }), 'g')).toEqual([]);
  });

  it('Kanalwahl aus der Adresse nur innerhalb der erlaubten Kanäle', () => {
    expect(kanalWahl(['gruppe', 'eltern'], 'eltern')).toBe('eltern');
    expect(kanalWahl(['gruppe'], 'eltern')).toBe('gruppe');
    expect(kanalWahl(['eltern'], undefined)).toBe('eltern');
    expect(kanalWahl([], 'gruppe')).toBeNull();
  });
});

describe('Kinderzugang', () => {
  it('Passwortvorschlag: drei Vierergruppen, ≥ 12 Zeichen, ohne verwechselbare Zeichen', () => {
    const zufall = Uint8Array.from({ length: 12 }, (_, i) => i * 37);
    const p = passwortVorschlag(zufall);
    expect(p).toMatch(/^[a-z2-9]{4}-[a-z2-9]{4}-[a-z2-9]{4}$/);
    expect(p).toHaveLength(14);
    expect(p).not.toMatch(/[01ilo]/);
    expect(passwortVorschlag(zufall)).toBe(p);
    expect(() => passwortVorschlag(new Uint8Array(4))).toThrow();
  });

  it('Platzhalter füllen (Inseln ohne next-intl), unbekannte bleiben stehen', () => {
    expect(fuelle('{anwesend} von {gesamt} da', { anwesend: 3, gesamt: 4 })).toBe('3 von 4 da');
    expect(fuelle('für {name}', {})).toBe('für {name}');
  });

  it('Beispiel-Benutzernamen sind gültig', () => {
    expect(pruefeBenutzername('kind2.beispiel')).toEqual({ ok: true, wert: 'kind2.beispiel' });
  });
});

describe('Navigation mit Funktionsschaltern (ADR 0035)', () => {
  const schluessel = (...a: Parameters<typeof bereicheFuer>) => bereicheFuer(...a).map((b) => b.schluessel);

  it('Lernplattform aus: Kinder, Unterricht, Lernweg und Gruppe verschwinden', () => {
    expect(schluessel(['eltern', 'lehrkraft', 'schueler'], false, { aus: ['lernplattform'] })).toEqual([
      'start',
      'lesezeichen',
      'benachrichtigungen',
      'konto',
    ]);
  });

  it('Push aus: keine Benachrichtigungen; Kinder nur mit Freigabe', () => {
    expect(schluessel(['gemeinde'], false, { aus: ['push'] })).toEqual(['start', 'lesezeichen', 'konto']);
    expect(schluessel(['schueler'], true, { gruppe: null })).toEqual(['start', 'lernweg', 'lesezeichen', 'konto']);
    expect(schluessel(['schueler'], true, { gruppe: null, kindPush: true })).toEqual([
      'start',
      'lernweg',
      'lesezeichen',
      'benachrichtigungen',
      'konto',
    ]);
  });

  it('Gruppe: Ziel je Konto, ohne Gruppe kein Eintrag', () => {
    const ziel = { pathname: '/mein-bereich/gruppen/[id]' as const, params: { id: 'g1' } };
    const gruppe = bereicheFuer(['schueler'], true, { gruppe: ziel }).find((b) => b.schluessel === 'gruppe');
    expect(gruppe).toMatchObject({ gebaut: true, ziel });
    expect(bereicheFuer(['eltern'], false).find((b) => b.schluessel === 'kinder')).toMatchObject({
      gebaut: true,
      ziel: '/mein-bereich/kinder',
    });
  });
});
