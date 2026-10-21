import 'fake-indexeddb/auto';
import { beforeAll, describe, expect, it } from 'vitest';
import { LektionSchema } from '@/lib/lernapp/aufgaben/schema';
import { TAGESZIEL_STANDARD } from '@/lib/lernapp/ereignisse/typen';
import { ABLEITUNGS_VERSION } from '@/lib/lernapp/ereignisse/ableiten';
import { ABLEITUNGS_VERSION as VERSION_KLEIN } from '@/lib/lernapp/ereignisse/version';
import { leiteNeuAb } from '@/lib/lernapp/lokal/ableitung';
import { haengeAlleAn } from '@/lib/lernapp/lokal/ausgang';
import { aktivesProfil } from '@/lib/lernapp/lokal/profile';
import {
  EINSTELLUNGEN_SCHLUESSEL,
  einstellungenAusEintraegen,
  einstellungsEreignisse,
  einstellungsSpeicher,
  STANDARD_EINSTELLUNGEN,
} from '@/lib/lernapp/oberflaeche/einstellungen';
import { geraet, liesWeiter, merkeWeiter, speicher, STAND_GEAENDERT, vorhandenesProfil } from '@/lib/lernapp/oberflaeche/geraet';
import {
  abschnitte,
  aktuelleUndNaechste,
  einheitDerLektion,
  lektionsPraefix,
  naechsteEinheit,
  naechsteLektion,
  themaVon,
} from '@/lib/lernapp/oberflaeche/kursverzeichnis';
import { ladeStartStand, LEERER_START_STAND } from '@/lib/lernapp/oberflaeche/stand';
import { baueWiederholung, einheitDerKarte, kartenDer } from '@/lib/lernapp/oberflaeche/wiederholung';
import { istPaketKopf, istVerzeichnis } from '@/lib/lernapp/lokal/vorrat';
import { type Paket, PaketSchema, type Verzeichnis, VerzeichnisSchema } from '@/lib/lernapp/paket/typen';
import type { Kartenstand } from '@/lib/lernapp/srs';
import { LEKTION } from './hilfen/lektion';

/**
 * Zusammenführung L1 (Oberfläche × Engine × Pakete): Gerät und Profil, Einstellungen als Ereignisse, Startstand aus den
 * abgeleiteten Speichern, Lernpfad aus dem Kursverzeichnis, Wiederholungsrunde aus Karten und Paketen. IndexedDB über
 * fake-indexeddb; das Fenster ist ein EventTarget mit Gerätespeicher (Node).
 */

class Gerätespeicher {
  private daten = new Map<string, string>();
  getItem = (k: string) => this.daten.get(k) ?? null;
  setItem = (k: string, v: string) => void this.daten.set(k, v);
  removeItem = (k: string) => void this.daten.delete(k);
}
const fenster = Object.assign(new EventTarget(), { localStorage: new Gerätespeicher() });
const ereignisseGesehen: string[] = [];

beforeAll(() => {
  (globalThis as unknown as { window: typeof fenster }).window = fenster;
  for (const name of [EINSTELLUNGEN_SCHLUESSEL, STAND_GEAENDERT]) fenster.addEventListener(name, () => ereignisseGesehen.push(name));
});

const einheit = (schluessel: string, reihenfolge: number, lektionen = 2) => ({
  schluessel,
  stufe: 'a1' as const,
  reihenfolge,
  thema: { de: `[Thema ${reihenfolge}]`, tr: `[Konu ${reihenfolge}]` },
  hash: String(reihenfolge).repeat(64).slice(0, 64),
  bytes: 1000 * reihenfolge,
  lektionen,
  hinweis: true,
  audio: [],
});

const VERZEICHNIS: Verzeichnis = {
  format: 'igmg-lernapp-verzeichnis',
  version: 1,
  kurs: 'tr-aus-de',
  kursId: 'tr',
  zielsprache: 'tr',
  ausgangssprache: 'de',
  stand: 2,
  einheiten: [einheit('tr.a1.e01', 1), einheit('tr.a1.e02', 2), einheit('tr.a1.e03', 3, 1)],
};

const paketVon = (schluessel: string, lektionen: string[]): Paket => ({
  format: 'igmg-lernapp-paket',
  version: 1,
  kurs: 'tr-aus-de',
  zielsprache: 'tr',
  ausgangssprache: 'de',
  einheit: { schluessel, stufe: 'a1', reihenfolge: 1, thema: { de: '[Thema]' } },
  hinweis: false,
  lektionen: lektionen.map((l) => ({ ...LEKTION, schluessel: l })),
  eintraege: {},
  tipps: [],
  audio: [],
  lizenz: 'CC-BY-SA-4.0',
});

describe('Gerät und Profil', () => {
  it('ein Besuch legt nichts an; erst Speichern legt das erste Profil an', async () => {
    expect((await vorhandenesProfil()).profil).toBeNull();
    expect(await ladeStartStand()).toEqual(LEERER_START_STAND);
    expect(await einstellungsSpeicher('de').laden()).toEqual(STANDARD_EINSTELLUNGEN);
    expect((await vorhandenesProfil()).profil).toBeNull();
    const { profil } = await geraet('tr');
    expect(profil).toMatchObject({ oberflaeche: 'tr', name: 'standard' });
    expect((await geraet('de')).profil.id).toBe(profil.id);
    expect(VERSION_KLEIN).toBe(ABLEITUNGS_VERSION);
  });
});

describe('Einstellungen als Ereignisse (ADR 0038, ADR 0043 Nr. 2)', () => {
  it('Standard-Tagesziel gleich dem der Ableitung', () => {
    expect(STANDARD_EINSTELLUNGEN.tagesziel).toEqual(TAGESZIEL_STANDARD);
  });

  it('nur geänderte Felder werden Ereignisse; zurück aus dem abgeleiteten Speicher', () => {
    const neu = { ...STANDARD_EINSTELLUNGEN, ausgang: 'ar' as const, tagesziel: { art: 'kein' as const }, hoeren: false };
    const e = einstellungsEreignisse(STANDARD_EINSTELLUNGEN, neu);
    expect(e).toEqual([
      { art: 'einstellung', daten: { schluessel: 'ausgangssprache', wert: 'ar' } },
      { art: 'tagesziel', daten: { ziel: { art: 'kein' } } },
      { art: 'einstellung', daten: { schluessel: 'hoerenAus', wert: true } },
    ]);
    expect(einstellungsEreignisse(neu, neu)).toEqual([]);
    expect(
      einstellungenAusEintraegen([
        { schluessel: 'ausgangssprache', wert: 'ar' },
        { schluessel: 'tagesziel', wert: { art: 'kein' } },
        { schluessel: 'hoerenAus', wert: true },
        { schluessel: 'ziffern', wert: 'westlich' },
        { schluessel: 'fremd', wert: 1 },
      ]),
    ).toEqual({ ...neu, ziffern: 'westlich' });
    // „wie die Oberfläche“ (null) ist ein gültiger Wert
    expect(einstellungsEreignisse(neu, { ...neu, ausgang: null })).toEqual([
      { art: 'einstellung', daten: { schluessel: 'ausgangssprache', wert: null } },
    ]);
  });

  it('speichern schreibt ins Protokoll; laden liest den letzten Schreiber; Fenster-Ereignisse melden die Änderung', async () => {
    const s = einstellungsSpeicher('de');
    expect(await s.speichern({ ...STANDARD_EINSTELLUNGEN, tagesziel: { art: 'xp', wert: 30 }, ziffern: 'westlich' })).toBe(true);
    expect(await s.laden()).toEqual({ ...STANDARD_EINSTELLUNGEN, tagesziel: { art: 'xp', wert: 30 }, ziffern: 'westlich' });
    expect(await s.speichern({ ...STANDARD_EINSTELLUNGEN, ausgang: 'ar' })).toBe(true);
    expect(await s.laden()).toEqual({ ...STANDARD_EINSTELLUNGEN, ausgang: 'ar' });
    expect(ereignisseGesehen).toEqual(expect.arrayContaining([EINSTELLUNGEN_SCHLUESSEL, STAND_GEAENDERT]));
    const { sp, profil } = await geraet('de');
    const arten = (await sp.alle('ereignisse', [[profil.id], [profil.id, []]])).map((e) => e.art);
    expect(arten.filter((a) => a === 'tagesziel')).toHaveLength(2);
  });

  it('die frühere Speicherform (L1-03) wird einmal übernommen und entfernt', async () => {
    fenster.localStorage.setItem(
      EINSTELLUNGEN_SCHLUESSEL,
      JSON.stringify({ ausgang: 'tr', tagesziel: { art: 'keins' }, ziffern: 'latn', hoeren: true, sprechen: false }),
    );
    expect(await einstellungsSpeicher('de').laden()).toEqual({
      ausgang: 'tr',
      tagesziel: { art: 'kein' },
      ziffern: 'westlich',
      hoeren: true,
      sprechen: false,
    });
    expect(fenster.localStorage.getItem(EINSTELLUNGEN_SCHLUESSEL)).toBeNull();
  });
});

describe('Startstand aus den abgeleiteten Speichern', () => {
  it('heute, begonnen, fällige Karten je Kurs und „Weiter lernen“', async () => {
    const { sp, profil } = await geraet('de');
    const jetzt = new Date();
    await haengeAlleAn(
      sp,
      profil,
      [
        { art: 'bewertung', daten: { karte: 'tr-aus-de:tr.a1.e01.w001', note: 'nochmal', kurs: 'tr-aus-de' } },
        { art: 'bewertung', daten: { karte: 'ar-aus-de:ar.a1.e01.w002', note: 'nochmal', kurs: 'ar-aus-de' } },
        { art: 'lektion', daten: { kurs: 'tr-aus-de', lektion: 'tr-aus-de.a1.e01.l01', art: 'lektion', richtig: 3, gesamt: 4 } },
        { art: 'xp', daten: { menge: 10, grund: 'lektion', bezug: 'tr-aus-de.a1.e01.l01' } },
      ],
      { jetzt: new Date(jetzt.getTime() - 3 * 86_400_000) },
    );
    await haengeAlleAn(sp, profil, [{ art: 'xp', daten: { menge: 10, grund: 'lektion' } }], { jetzt });
    const { lerntagVon } = await import('@/lib/lernapp/ereignisse/serie');
    await leiteNeuAb(sp, profil.id, lerntagVon(jetzt));
    await merkeWeiter(sp, profil.id, { kurs: 'tr-aus-de', lektion: 'tr-aus-de.a1.e01.l02', titel: '[Titel]' });
    const stand = await ladeStartStand(jetzt);
    expect(stand.begonnen).toBe(true);
    expect(stand.heute).toEqual({ xp: 10, lektionen: 0 });
    expect(stand.weiter).toEqual({ kurs: 'tr-aus-de', lektion: 'tr-aus-de.a1.e01.l02', titel: '[Titel]' });
    expect(stand.faellig.sort((a, b) => a.kurs.localeCompare(b.kurs))).toEqual([
      { kurs: 'ar-aus-de', anzahl: 1 },
      { kurs: 'tr-aus-de', anzahl: 1 },
    ]);
    // Wochenband der Serie (B-33): heute gelernt; mit Ruhetagen (`pause`) dazwischen trägt die Serie über die Lücke
    const heute = lerntagVon(jetzt);
    expect(stand.serie?.heute).toBe(heute);
    expect(stand.serie?.woche).toHaveLength(7);
    expect(stand.serie?.woche.find((t) => t.tag === heute)?.art).toBe('gelernt');
    const { addiereTage } = await import('@/lib/lernapp/ereignisse/serie');
    await haengeAlleAn(sp, profil, [{ art: 'pause', daten: { von: addiereTage(heute, -2), bis: addiereTage(heute, -1) } }], { jetzt });
    await leiteNeuAb(sp, profil.id, heute);
    expect((await sp.lies('einstellungen', [profil.id, 'ruhetage']))?.wert).toEqual([addiereTage(heute, -2), addiereTage(heute, -1)]);
    expect((await ladeStartStand(jetzt)).serie?.laenge).toBe(2);
    // „Weiter lernen“ gehört dem Gerät, nicht dem Protokoll: eine Neuableitung lässt es stehen
    await leiteNeuAb(sp, profil.id, lerntagVon(jetzt));
    expect(await liesWeiter(sp, profil.id)).not.toBeNull();
    await merkeWeiter(sp, profil.id, null);
    expect(await liesWeiter(sp, profil.id)).toBeNull();
    expect((await aktivesProfil(await speicher()))?.id).toBe(profil.id);
  });
});

describe('Lernpfad aus dem Kursverzeichnis', () => {
  it('Schlüssel: Präfix der Lektionen, Einheit einer Lektion', () => {
    expect(lektionsPraefix(VERZEICHNIS, 'tr.a1.e02')).toBe('tr-aus-de.a1.e02.');
    expect(einheitDerLektion(VERZEICHNIS, 'tr-aus-de.a1.e02.l01')).toBe('tr.a1.e02');
    expect(einheitDerLektion(VERZEICHNIS, 'ar-aus-de.a1.e02.l01')).toBeNull();
    expect(einheitDerLektion({ kurs: 'islam', kursId: 'islam' }, 'islam.grund.e01.l03')).toBe('islam.grund.e01');
    expect(naechsteEinheit(VERZEICHNIS, 'tr.a1.e02')?.schluessel).toBe('tr.a1.e03');
    expect(naechsteEinheit(VERZEICHNIS, 'tr.a1.e03')).toBeNull();
  });

  it('Stationen nach Stufen, geschaffte Lektionen, aktuelle Einheit, automatisch gespeicherte Einheiten', () => {
    const erledigt = new Set(['tr-aus-de.a1.e01.l01', 'tr-aus-de.a1.e01.l02', 'tr-aus-de.a1.e02.l01']);
    const pakete = new Map([['tr.a1.e02', paketVon('tr.a1.e02', ['tr-aus-de.a1.e02.l01', 'tr-aus-de.a1.e02.l02'])]]);
    const [a1] = abschnitte(VERZEICHNIS, erledigt, pakete);
    expect(a1?.stufe).toBe('a1');
    expect(a1?.stationen.map((s) => [s.nummer, s.erledigt, s.aktuell, s.lektionen?.map((l) => l.erledigt) ?? null])).toEqual([
      [1, 2, false, null],
      [2, 1, true, [true, false]],
      [3, 0, false, null],
    ]);
    expect(aktuelleUndNaechste(VERZEICHNIS, erledigt).map((e) => e.schluessel)).toEqual(['tr.a1.e02', 'tr.a1.e03']);
    expect(aktuelleUndNaechste(VERZEICHNIS, new Set()).map((e) => e.schluessel)).toEqual(['tr.a1.e01', 'tr.a1.e02']);
  });

  it('nächste Lektion: in der Einheit, sonst die erste der nächsten Einheit', () => {
    const p1 = paketVon('tr.a1.e01', ['tr-aus-de.a1.e01.l01', 'tr-aus-de.a1.e01.l02']);
    const p2 = paketVon('tr.a1.e02', ['tr-aus-de.a1.e02.l01']);
    expect(naechsteLektion(p1, 'tr-aus-de.a1.e01.l01', p2)?.schluessel).toBe('tr-aus-de.a1.e01.l02');
    expect(naechsteLektion(p1, 'tr-aus-de.a1.e01.l02', p2)?.schluessel).toBe('tr-aus-de.a1.e02.l01');
    expect(naechsteLektion(p1, 'tr-aus-de.a1.e01.l02', null)).toBeNull();
  });

  it('Thema in der Oberflächensprache, sonst Ausgangssprache, sonst Deutsch', () => {
    const e = VERZEICHNIS.einheiten[0]!;
    expect(themaVon(e, 'tr', 'de')).toEqual({ text: '[Konu 1]', sprache: 'tr' });
    expect(themaVon(e, 'ar', 'de')).toEqual({ text: '[Thema 1]', sprache: 'de' });
    expect(themaVon({ thema: {} }, 'ar', null)).toBeNull();
  });
});

describe('Wiederholungsrunde aus Karten und Paketen', () => {
  const stand = (karte: string, stabilitaet: number): Kartenstand => ({
    karte,
    faellig: '2026-10-01T00:00:00.000Z',
    stabilitaet,
    schwierigkeit: 5,
    tageVergangen: 0,
    tageGeplant: 1,
    lernschritt: 0,
    wiederholungen: 1,
    fehler: 0,
    zustand: 'lernen',
    zuletzt: null,
    letzteNote: 'gut',
    parameterversion: 'test',
  });
  // Lektion mit Kartenschlüsseln wie im Paket (`<richtung>:<schlüssel>`)
  const paket = paketVon('tr.a1.e01', ['tr-aus-de.a1.e01.l01']);
  const mitKarten = {
    ...paket,
    lektionen: paket.lektionen.map((l) => ({
      ...l,
      aufgaben: l.aufgaben.map((a) =>
        a.typ === 'paare'
          ? { ...a, paare: a.paare.map((p) => ({ ...p, karte: `tr-aus-de:${p.karte}` })) }
          : { ...a, ...(a.karten ? { karten: a.karten.map((k) => `tr-aus-de:${k}`) } : {}) },
      ),
    })),
  };

  it('Einheit einer Karte; Karten einer Aufgabe', () => {
    expect(einheitDerKarte('tr-aus-de:tr.a1.e01.w001')).toBe('tr.a1.e01');
    expect(einheitDerKarte('ohne-doppelpunkt')).toBeNull();
    expect(kartenDer(mitKarten.lektionen[0]!.aufgaben[2]!)).toEqual([
      'tr-aus-de:tr.a1.l0001',
      'tr-aus-de:tr.a1.l0002',
      'tr-aus-de:tr.a1.l0003',
    ]);
  });

  it('je Karte eine passende Aufgabe nach Stabilität; gültige Lektion der Art wiederholung', () => {
    const lektion = baueWiederholung('tr-aus-de', [stand('tr-aus-de:tr.a1.l0001', 0.5), stand('tr-aus-de:tr.a1.s0001', 4)], [mitKarten]);
    expect(lektion).not.toBeNull();
    expect(lektion?.art).toBe('wiederholung');
    expect(lektion?.schluessel).toBe('tr-aus-de.wiederholung');
    // neu bzw. instabil → erkennen (Auswahl), stabiler → Wortbank
    expect(lektion?.aufgaben.map((a) => a.typ)).toEqual(['auswahl', 'wortbank']);
    expect(LektionSchema.safeParse(lektion).success).toBe(true);
    expect(baueWiederholung('tr-aus-de', [stand('tr-aus-de:gibt.es.nicht', 1)], [mitKarten])).toBeNull();
    expect(baueWiederholung('tr-aus-de', [stand('tr-aus-de:tr.a1.l0001', 1)], [])).toBeNull();
  });
});

describe('Vorrat ohne Zod (Lernpfad im Budget): gleiche Entscheidung wie die Schemas', () => {
  const e = VERZEICHNIS.einheiten[0]!;
  const abweichungen: unknown[] = [
    VERZEICHNIS,
    { ...VERZEICHNIS, ausgangssprache: null },
    { ...VERZEICHNIS, einheiten: [] },
    { ...VERZEICHNIS, einheiten: [{ ...e, symbol: 'stern', audio: [{ adresse: '/lern-app/audio/tr/a.lpa', bytes: 10 }] }] },
    { ...VERZEICHNIS, fremd: 1 },
    { ...VERZEICHNIS, format: 'igmg-lernapp-paket' },
    { ...VERZEICHNIS, version: 2 },
    { ...VERZEICHNIS, kurs: 'xx' },
    { ...VERZEICHNIS, kursId: 'tr-aus-de' },
    { ...VERZEICHNIS, ausgangssprache: 'en' },
    { ...VERZEICHNIS, stand: -1 },
    { ...VERZEICHNIS, stand: 1.5 },
    { ...VERZEICHNIS, einheiten: [{ ...e, hash: 'A'.repeat(64) }] },
    { ...VERZEICHNIS, einheiten: [{ ...e, stufe: 'z9' }] },
    { ...VERZEICHNIS, einheiten: [{ ...e, bytes: 0 }] },
    { ...VERZEICHNIS, einheiten: [{ ...e, lektionen: 0 }] },
    { ...VERZEICHNIS, einheiten: [{ ...e, thema: { de: 'x', en: 'y' } }] },
    { ...VERZEICHNIS, einheiten: [{ ...e, symbol: 3 }] },
    { ...VERZEICHNIS, einheiten: [{ ...e, extra: true }] },
    { ...VERZEICHNIS, einheiten: [{ ...e, audio: [{ adresse: '/fremd/a.lpa', bytes: 10 }] }] },
    { ...VERZEICHNIS, einheiten: [{ ...e, audio: [{ adresse: '/lern-app/audio/tr/a.lpa', bytes: 0 }] }] },
    { ...VERZEICHNIS, einheiten: [{ ...e, hinweis: 'ja' }] },
    null,
    [],
    'verzeichnis',
  ];

  it.each(abweichungen.map((v, i) => [i, v]))('Verzeichnis %i', (_i, v) => {
    expect(istVerzeichnis(v)).toBe(VerzeichnisSchema.safeParse(v).success);
  });

  it('Paketkopf: jedes gültige Paket hat einen gültigen Kopf; Fehler im Kopf verwirft beide', () => {
    const p = paketVon('tr.a1.e01', ['tr-aus-de.a1.e01.l01']);
    expect(PaketSchema.safeParse(p).success).toBe(true);
    expect(istPaketKopf(p)).toBe(true);
    for (const falsch of [
      { ...p, format: 'igmg-lernapp-verzeichnis' },
      { ...p, kurs: 'tr' },
      { ...p, lektionen: [] },
      { ...p, lizenz: 'CC-BY-4.0' },
      { ...p, einheit: { ...p.einheit, stufe: 'z9' } },
      { ...p, audio: [{ adresse: '/fremd', bytes: 1 }] },
    ]) {
      expect(PaketSchema.safeParse(falsch).success).toBe(false);
      expect(istPaketKopf(falsch)).toBe(false);
    }
  });
});
