import { describe, expect, it } from 'vitest';
import { KETTEN_ANFANG, kettenHash, pruefeKette, type ProtokollInhalt } from '@/lib/chat/hashkette';
import { alterAus, bereinigeText, chatName, imFenster, MAX_ZEICHEN, pruefeText, schreibGrund, type SchreibLage } from '@/lib/chat/regeln';

/** Kinderschutz im Chat (S-01…S-18): reine Regeln. */
const lage = (aenderung: Partial<SchreibLage> = {}): SchreibLage => ({
  darfLesen: true,
  darfSchreibenRecht: true,
  istLeitung: false,
  kanalStatus: 'aktiv',
  chatModus: 'offen',
  notfallpause: false,
  erwachsene: 2,
  uhrzeit: '17:30',
  chatVon: '08:00',
  chatBis: '20:00',
  stummBis: null,
  jetzt: new Date('2026-10-13T15:30:00Z'),
  istLernende: true,
  unter16: true,
  einwilligungGruppenchat: true,
  alter: 12,
  mindestalter: 10,
  regelnBestaetigt: true,
  ...aenderung,
});

describe('Chat-Regeln', () => {
  it('S-05: nur Text bis 500 Zeichen, Steuer- und Richtungszeichen entfernt', () => {
    expect(pruefeText('')).toBe('leer');
    expect(pruefeText('a'.repeat(MAX_ZEICHEN))).toBeNull();
    expect(pruefeText('a'.repeat(MAX_ZEICHEN + 1))).toBe('zuLang');
    expect(bereinigeText('  Hallo\u202E\u200B  \n\n\n\nWelt\u0007 ')).toBe('Hallo\n\nWelt');
  });

  it('S-06: Öffnungszeiten, auch über Mitternacht', () => {
    expect(imFenster('08:00', '08:00', '20:00')).toBe(true);
    expect(imFenster('20:00', '08:00', '20:00')).toBe(false);
    expect(imFenster('07:59', '08:00', '20:00')).toBe(false);
    expect(imFenster('23:30', '22:00', '02:00')).toBe(true);
    expect(imFenster('03:00', '22:00', '02:00')).toBe(false);
  });

  it('Alter aus dem 16. Geburtstag', () => {
    expect(alterAus('2030-05-10', '2026-10-13')).toBe(12);
    expect(alterAus('2026-10-13', '2026-10-13')).toBe(16);
    expect(alterAus('2026-10-14', '2026-10-13')).toBe(15);
  });

  it('S-14: Vorname + Initial', () => {
    expect(chatName('Ayşe Kaya')).toBe('Ayşe K.');
    expect(chatName('Mehmet Ali Yılmaz')).toBe('Mehmet Y.');
    expect(chatName('Hoca')).toBe('Hoca');
    expect(chatName('Ömer Ö.')).toBe('Ömer Ö.');
  });

  it('Schreiben erlaubt im Normalfall', () => {
    expect(schreibGrund(lage())).toBe('ok');
  });

  it.each([
    ['keinRecht', { darfSchreibenRecht: false }],
    ['notfallpause', { notfallpause: true }],
    ['kanalAus', { chatModus: 'aus' as const }],
    ['zuWenigeErwachsene', { erwachsene: 1 }],
    ['pausiert', { kanalStatus: 'pausiert' as const }],
    ['nurLehrkraft', { chatModus: 'nur_lehrkraft' as const }],
    ['geschlossen', { uhrzeit: '21:15' }],
    ['stumm', { stummBis: new Date('2026-10-13T16:00:00Z') }],
    ['einwilligungFehlt', { einwilligungGruppenchat: false }],
    ['zuJung', { alter: 9 }],
    ['zuJung', { alter: 11, mindestalter: 12 }],
    ['regelnFehlen', { regelnBestaetigt: false }],
  ] as const)('S-02…S-17: %s', (erwartet, aenderung) => {
    expect(schreibGrund(lage(aenderung))).toBe(erwartet);
  });

  it('Mindestalter nie unter 10, auch wenn die Gruppe weniger einträgt (S-04)', () => {
    expect(schreibGrund(lage({ alter: 9, mindestalter: 6 }))).toBe('zuJung');
  });

  it('Leitung schreibt auch außerhalb der Zeiten und im Lehrkraft-Modus, aber nie in der Notfall-Pause', () => {
    expect(schreibGrund(lage({ istLeitung: true, istLernende: false, uhrzeit: '22:00' }))).toBe('ok');
    expect(schreibGrund(lage({ istLeitung: true, istLernende: false, chatModus: 'nur_lehrkraft' }))).toBe('ok');
    expect(schreibGrund(lage({ istLeitung: true, notfallpause: true }))).toBe('notfallpause');
    expect(schreibGrund(lage({ istLeitung: true, erwachsene: 1 }))).toBe('zuWenigeErwachsene');
  });

  it('Eltern (nicht lernend) brauchen keine Kindeinwilligung', () => {
    expect(schreibGrund(lage({ istLernende: false, einwilligungGruppenchat: false, alter: null }))).toBe('ok');
  });
});

describe('Hash-Kette des Moderationsprotokolls (S-10)', () => {
  const eintrag = (i: number): ProtokollInhalt => ({
    zeitpunkt: `2026-10-13T10:0${i}:00.000Z`,
    kanalId: 'k',
    nachrichtId: i,
    akteurId: 'a',
    aktion: 'entfernt',
    grund: `Grund ${i}`,
  });
  const kette = () => {
    let vorher = KETTEN_ANFANG;
    return [0, 1, 2].map((i) => {
      const e = eintrag(i);
      const hash = kettenHash(vorher, e);
      const z = { ...e, vorgaengerHash: vorher, hash };
      vorher = hash;
      return z;
    });
  };

  it('intakte Kette', () => {
    expect(pruefeKette(kette())).toBeNull();
  });

  it('erkennt Änderung, Lücke und Austausch', () => {
    const geaendert = kette();
    geaendert[1] = { ...geaendert[1], grund: 'anders' };
    expect(pruefeKette(geaendert)).toBe(1);
    const luecke = kette();
    luecke.splice(1, 1);
    expect(pruefeKette(luecke)).toBe(1);
  });
});
