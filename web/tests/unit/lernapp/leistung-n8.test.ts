import { createHash } from 'node:crypto';
import { afterEach, describe, expect, it } from 'vitest';
import { LektionSchema } from '@/lib/lernapp/aufgaben/schema';
import { dezimal, formatiere, zahl } from '@/lib/lernapp/format';
import { arbeitsspeicher } from '@/lib/lernapp/lokal/db';
import { ladeLektion, nurLektion } from '@/lib/lernapp/lokal/pakete';
import { nachgeben, speichereOffline } from '@/lib/lernapp/lokal/vorrat';
import { type Abschnitt, aufgeklappteStufe, type Station } from '@/lib/lernapp/oberflaeche/kursverzeichnis';
import { INHALT_LIZENZ, PAKET_FORMAT, paketAdresse } from '@/lib/lernapp/paket/kennungen';
import { PaketSchema, type VerzeichnisEinheit } from '@/lib/lernapp/paket/typen';

/**
 * Stufe C N8 (Z-L07 mit echten Inhalten: Lighthouse-Leistung, INP): Der Spieler prüft nur die gespielte Lektion voll
 * (`ladeLektion`), „offline speichern“ gibt den Hauptfaden zwischen den Schritten frei (`nachgeben`), der Lernpfad klappt
 * nur die Stufe der aktuellen Einheit auf (`aufgeklappteStufe`), und der Formatierer merkt sich seine Intl-Objekte.
 * Testdaten: Platzhalter in eckigen Klammern.
 */

const sha = (s: string) => createHash('sha256').update(s).digest('hex');

const auswahl = (n: number, richtig = 0) => ({
  typ: 'auswahl',
  schluessel: `tr.a1.e01.a00${n}`,
  anweisung: 'waehleUebersetzung',
  vorgabe: { text: ' [Wort] ', sprache: 'de' },
  optionen: [
    { text: '[eins]', sprache: 'tr' },
    { text: '[zwei]', sprache: 'tr' },
  ],
  richtig,
});
const lektion = (n: number, aufgaben: unknown[]) => ({
  schluessel: `tr-aus-de.a1.e01.l0${n}`,
  kurs: 'tr-aus-de',
  art: 'lektion',
  zielsprache: 'tr',
  ausgangssprache: 'de',
  titel: `[Lektion ${n}]`,
  aufgaben,
});
/** Paket mit einer gültigen Lektion l01 und einer ungültigen l02 (richtige Option außerhalb der Optionen). */
const PAKET = {
  format: PAKET_FORMAT,
  version: 1,
  kurs: 'tr-aus-de',
  zielsprache: 'tr',
  ausgangssprache: 'de',
  einheit: { schluessel: 'tr.a1.e01', stufe: 'a1', reihenfolge: 1, thema: { de: '[Thema]' } },
  hinweis: false,
  lektionen: [lektion(1, [auswahl(1)]), lektion(2, [auswahl(2, 5)])],
  eintraege: {},
  tipps: [],
  audio: [],
  lizenz: INHALT_LIZENZ,
};

function bereitstellen(paket: unknown) {
  const text = JSON.stringify(paket);
  const einheit = { schluessel: 'tr.a1.e01', hash: sha(text), bytes: Buffer.byteLength(text) };
  const adresse = paketAdresse('tr-aus-de', einheit.schluessel, einheit.hash);
  const abrufe: string[] = [];
  const abruf = async (a: string) => {
    abrufe.push(a);
    return a === adresse ? new Response(text) : new Response(null, { status: 404 });
  };
  return { einheit, abruf, abrufe };
}

describe('Spieler: nur die gespielte Lektion voll prüfen (ladeLektion)', () => {
  it('liefert die Lektion wie LektionSchema (getrimmt) samt Paketkopf, obwohl eine andere Lektion ungültig ist', async () => {
    expect(PaketSchema.safeParse(PAKET).success).toBe(false);
    const { einheit, abruf } = bereitstellen(PAKET);
    const r = await ladeLektion(arbeitsspeicher(), 'tr-aus-de', einheit, 'tr-aus-de.a1.e01.l01', { abruf, vorrat: null });
    expect(r?.lektion).toEqual(LektionSchema.parse(PAKET.lektionen[0]));
    expect(r?.lektion.aufgaben[0]).toMatchObject({ vorgabe: { text: '[Wort]' } });
    expect(r?.paket.einheit.schluessel).toBe('tr.a1.e01');
    expect(r?.paket.lektionen.map((l) => l.schluessel)).toEqual(['tr-aus-de.a1.e01.l01', 'tr-aus-de.a1.e01.l02']);
  });

  it('ungültige oder fehlende Lektion, kaputter Kopf, falscher Hash: null', async () => {
    const { einheit, abruf } = bereitstellen(PAKET);
    const sp = arbeitsspeicher();
    expect(await ladeLektion(sp, 'tr-aus-de', einheit, 'tr-aus-de.a1.e01.l02', { abruf, vorrat: null })).toBeNull();
    expect(await ladeLektion(sp, 'tr-aus-de', einheit, 'tr-aus-de.a1.e01.l09', { abruf, vorrat: null })).toBeNull();
    const kaputt = bereitstellen({ ...PAKET, lizenz: '[andere]' });
    expect(await ladeLektion(sp, 'tr-aus-de', kaputt.einheit, 'tr-aus-de.a1.e01.l01', { abruf: kaputt.abruf, vorrat: null })).toBeNull();
    const falsch = { ...einheit, hash: sha('[anderer Text]') };
    expect(await ladeLektion(sp, 'tr-aus-de', falsch, 'tr-aus-de.a1.e01.l01', { abruf, vorrat: null })).toBeNull();
  });

  it('nurLektion prüft nur den Kopf und die eine Lektion', () => {
    expect(nurLektion('tr-aus-de.a1.e01.l01')(PAKET)?.lektion.schluessel).toBe('tr-aus-de.a1.e01.l01');
    expect(nurLektion('tr-aus-de.a1.e01.l01')({ ...PAKET, lektionen: [] })).toBeNull();
    expect(nurLektion('tr-aus-de.a1.e01.l01')(null)).toBeNull();
  });
});

describe('offline speichern in Häppchen (nachgeben)', () => {
  const echt = (globalThis as { scheduler?: unknown }).scheduler;
  afterEach(() => {
    (globalThis as { scheduler?: unknown }).scheduler = echt;
  });

  it('ohne scheduler.yield: ein Zeitgeber – zuvor geplante Zeitgeber laufen vorher', async () => {
    (globalThis as { scheduler?: unknown }).scheduler = undefined;
    const reihe: string[] = [];
    setTimeout(() => reihe.push('zeitgeber'), 0);
    await nachgeben();
    reihe.push('danach');
    expect(reihe).toEqual(['zeitgeber', 'danach']);
  });

  it('mit scheduler.yield: dieser wird genutzt', async () => {
    let aufrufe = 0;
    (globalThis as { scheduler?: unknown }).scheduler = { yield: async () => void aufrufe++ };
    await nachgeben();
    expect(aufrufe).toBe(1);
  });

  it('speichereOffline gibt vor jedem Paket und jedem Bündel nach und meldet die Bytes', async () => {
    (globalThis as { scheduler?: unknown }).scheduler = undefined;
    const { einheit, abruf: paketAbruf } = bereitstellen(PAKET);
    const reihe: string[] = [];
    const abruf = async (a: string) => {
      reihe.push(a.startsWith('/lern-app/audio/') ? 'bündel' : 'paket');
      return a.startsWith('/lern-app/audio/') ? new Response(new Uint8Array(10)) : paketAbruf(a);
    };
    const e: VerzeichnisEinheit = {
      ...einheit,
      stufe: 'a1',
      reihenfolge: 1,
      thema: { de: '[Thema]' },
      lektionen: 2,
      hinweis: false,
      audio: [{ adresse: '/lern-app/audio/tr/[buendel].lpa', bytes: 10 }],
    };
    setTimeout(() => reihe.push('zeitgeber'), 0);
    const fortschritt: number[] = [];
    const r = await speichereOffline(arbeitsspeicher(), 'tr-aus-de', [e], {
      abruf,
      vorrat: null,
      fortschritt: (geladen) => fortschritt.push(geladen),
    });
    expect(reihe).toEqual(['zeitgeber', 'paket', 'bündel']);
    expect(fortschritt).toEqual([e.bytes, e.bytes + 10]);
    expect(r).toMatchObject({ einheiten: 1, bytes: e.bytes + 10, fehlgeschlagen: [] });
  });
});

describe('Lernpfad: nur die Stufe der aktuellen Einheit aufgeklappt', () => {
  const station = (aktuell: boolean): Station => ({
    einheit: {} as VerzeichnisEinheit,
    nummer: 1,
    erledigt: 0,
    lektionen: null,
    aktuell,
    tipps: false,
  });
  const liste: Abschnitt[] = [
    { stufe: 'a1', stationen: [station(false), station(false)] },
    { stufe: 'a2', stationen: [station(false), station(true)] },
    { stufe: 'b1', stationen: [station(false)] },
  ];

  it('die Stufe mit „Hier geht es weiter“, sonst die letzte, ohne Stufen keine', () => {
    expect(aufgeklappteStufe(liste)).toBe('a2');
    expect(aufgeklappteStufe(liste.map((a) => ({ ...a, stationen: a.stationen.map(() => station(false)) })))).toBe('b1');
    expect(aufgeklappteStufe([])).toBeNull();
  });
});

describe('Formatierer mit gemerkten Intl-Objekten', () => {
  it('gleiche Ergebnisse wie frische Intl-Objekte, je Sprache und Ziffern getrennt', () => {
    for (let i = 0; i < 3; i++) {
      expect(zahl(1234, 'de')).toBe('1.234');
      expect(zahl(1234, 'ar')).toBe(new Intl.NumberFormat('ar-u-nu-arab').format(1234));
      expect(zahl(1234, 'ar', 'westlich')).toBe('1,234');
      expect(dezimal(1.26, 1, 'de')).toBe('1,3');
      expect(dezimal(1.26, 1, 'ar')).toBe(new Intl.NumberFormat('ar-u-nu-arab', { maximumFractionDigits: 1 }).format(1.26));
      expect(dezimal(1.26, 1, 'tr')).toBe('1,3');
      expect(formatiere('{n, plural, one {# Einheit} other {# Einheiten}}', { n: 1 }, 'de')).toBe('1 Einheit');
      expect(formatiere('{n, plural, one {# Einheit} other {# Einheiten}}', { n: 14 }, 'de')).toBe('14 Einheiten');
    }
  });
});
