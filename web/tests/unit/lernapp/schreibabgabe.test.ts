import { describe, expect, it } from 'vitest';
import { AbgabeAnfrageSchema, PruefAnfrageSchema } from '@/lib/lernapp/schreiben/abgabe';
import { ENTSCHEIDUNG_D_L16, kommentarErlaubt } from '@/lib/lernapp/schreiben/kinderschutz';
import {
  abgabeSchluessel,
  abgelaufen,
  aufgabenOrt,
  einwilligungDeckt,
  istEinstufung,
  lehrkraftLiest,
  lesePruefliste,
  loeschenAbFuer,
  rueckmeldungLeer,
  zerlegeAbgabeSchluessel,
  zustandVon,
} from '@/lib/lernapp/schreiben/regeln';

/**
 * Reine Regeln des Korrekturwegs (L5-03; ADR 0042 Nr. 11; KERN 4.0 §5): Zustände, Frist, wer liest (Wahrheitstafel),
 * Prüfliste und Einstufung der Lehrkraft (ohne Note), Ort der Aufgabe im Kurs, Format der Anfrage. Den Weg über die
 * Datenbank prüft `tests/integration/lernapp-schreiben.test.ts`.
 */
describe('Zustände und Frist', () => {
  it('offen bis zur Rückgabe, danach zurückgegeben', () => {
    expect(zustandVon({ korrigiertAm: null })).toBe('offen');
    expect(zustandVon({ korrigiertAm: new Date('2026-10-20T10:00:00Z') })).toBe('zurueckgegeben');
    expect(zustandVon({ korrigiertAm: '2026-10-20T10:00:00Z' })).toBe('zurueckgegeben');
  });

  it('Löschdatum 12 Kalendermonate nach der Abgabe (UTC); ab dann abgelaufen', () => {
    const am = new Date('2026-10-22T08:30:00Z');
    const ab = loeschenAbFuer(am, 12);
    expect(ab.toISOString()).toBe('2027-10-22T08:30:00.000Z');
    expect(abgelaufen(ab, new Date('2027-10-22T08:29:59Z'))).toBe(false);
    expect(abgelaufen(ab, ab)).toBe(true);
    expect(abgelaufen(ab, new Date('2027-11-01T00:00:00Z'))).toBe(true);
    // Monatsende: wie `loeschen/fristen.ts` (Date rechnet über)
    expect(loeschenAbFuer(new Date('2028-02-29T12:00:00Z'), 12).toISOString()).toBe('2029-03-01T12:00:00.000Z');
  });
});

describe('Wer liest eine Abgabe (Wahrheitstafel)', () => {
  const FELDER = ['lehrkraftDerGruppe', 'abgabeInGruppe', 'laufendesMitglied', 'einwilligung', 'abgelaufen'] as const;
  it('nur wenn alles zugleich gilt: Lehrkraft der Gruppe, Abgabe dort, laufendes Mitglied, Einwilligung, nicht abgelaufen', () => {
    for (let maske = 0; maske < 2 ** FELDER.length; maske++) {
      const l = Object.fromEntries(FELDER.map((f, i) => [f, Boolean(maske & (1 << i))])) as Record<(typeof FELDER)[number], boolean>;
      const soll = l.lehrkraftDerGruppe && l.abgabeInGruppe && l.laufendesMitglied && l.einwilligung && !l.abgelaufen;
      expect(lehrkraftLiest(l), JSON.stringify(l)).toBe(soll);
    }
  });
});

describe('S-L2-Auflagen: Kommentar an Kinder (M-1, D-L16) und Deckung durch die Einwilligung (N-2)', () => {
  it('kein Kommentar zur Abgabe eines Kindes (Lage „eltern“), solange D-L16 nicht eingetragen ist', () => {
    // Die Entscheidung tragen Menschen ein (Kinderschutz, DSB, Bildung) – zusammen mit ihrer Umsetzung
    expect(ENTSCHEIDUNG_D_L16).toBeNull();
    expect(kommentarErlaubt('eltern')).toBe(false);
    expect(kommentarErlaubt('uebergang')).toBe(true);
    expect(kommentarErlaubt('eigene')).toBe(true);
    const beschluss = { am: '2027-01-15', fundstelle: '[Beschluss]' };
    expect(kommentarErlaubt('eltern', { ...beschluss, kommentarAnKinder: false })).toBe(false);
    expect(kommentarErlaubt('eltern', { ...beschluss, kommentarAnKinder: true })).toBe(true);
  });

  it('die Einwilligung deckt nur Abgaben ab ihrem Beginn; ohne geltende Einwilligung keine', () => {
    const abgabe = new Date('2026-10-22T10:00:00Z');
    expect(einwilligungDeckt(new Date('2026-10-01T00:00:00Z'), abgabe)).toBe(true);
    expect(einwilligungDeckt(abgabe, abgabe)).toBe(true);
    // Nach Widerruf neu erteilt: die Zeit davor bleibt ungedeckt
    expect(einwilligungDeckt(new Date('2026-10-23T00:00:00Z'), abgabe)).toBe(false);
    expect(einwilligungDeckt(null, abgabe)).toBe(false);
  });
});

describe('Prüfliste und Einstufung der Lehrkraft', () => {
  it('nur bekannte Kriterien mit ganzen Stufen 0–3; leere Werte fallen weg', () => {
    expect(lesePruefliste({ aufgabe: '2', zusammenhang: '', wortschatz: 0, grammatik: null })).toEqual({ aufgabe: 2, wortschatz: 0 });
    expect(lesePruefliste({})).toEqual({});
    expect(lesePruefliste({ aufgabe: '4' })).toBeNull();
    expect(lesePruefliste({ aufgabe: '-1' })).toBeNull();
    expect(lesePruefliste({ aufgabe: '1.5' })).toBeNull();
    expect(lesePruefliste({ aufgabe: 'gut' })).toBeNull();
    expect(lesePruefliste({ note: '1' })).toBeNull();
  });

  it('Einstufung ohne Note: drei Worte, keine Zahl', () => {
    for (const e of ['erreicht', 'unterwegs', 'nochmal']) expect(istEinstufung(e)).toBe(true);
    for (const e of ['', '1', 'sehr gut', 'mangelhaft', null, 3]) expect(istEinstufung(e)).toBe(false);
  });

  it('leere Rückmeldung (kein Kommentar, keine Stufe, keine Einstufung) wird nicht zurückgegeben', () => {
    expect(rueckmeldungLeer({ kommentar: '   ', pruefliste: {}, einstufung: null })).toBe(true);
    expect(rueckmeldungLeer({ kommentar: null, pruefliste: {}, einstufung: null })).toBe(true);
    expect(rueckmeldungLeer({ kommentar: 'Gut gemacht.', pruefliste: {}, einstufung: null })).toBe(false);
    expect(rueckmeldungLeer({ kommentar: null, pruefliste: { grammatik: 0 }, einstufung: null })).toBe(false);
    expect(rueckmeldungLeer({ kommentar: null, pruefliste: {}, einstufung: 'nochmal' })).toBe(false);
  });
});

describe('Ort der Aufgabe im Kurs und Schlüssel der Abgabe', () => {
  it('Aufgabe gehört zur Zielsprache der Richtung (Einheit und Lektion aus dem Schlüssel)', () => {
    expect(aufgabenOrt('tr-aus-de', 'tr.b1.e03.l06.a01')).toEqual({ kurs: 'tr-aus-de', einheit: 'tr.b1.e03', lektion: 'tr.b1.e03.l06' });
    expect(aufgabenOrt('ar-aus-tr', 'ar.c1.e14.l02.a07')).toMatchObject({ einheit: 'ar.c1.e14' });
    expect(aufgabenOrt('tr-aus-de', 'de.b1.e03.l06.a01')).toBeNull();
    expect(aufgabenOrt('islam', 'islam.grund.e01.l01.a01')).toBeNull();
    expect(aufgabenOrt('tr-aus-de', 'tr.b1.e03.l06')).toBeNull();
    expect(aufgabenOrt('tr-aus-de', 'tr.b1.e03.l06.a01.x')).toBeNull();
    expect(aufgabenOrt('tr-aus-de', 'tr.B1.e03.l06.a01')).toBeNull();
    expect(aufgabenOrt('tr-aus-de', `tr.b1.e03.l06.${'a'.repeat(120)}`)).toBeNull();
  });

  it('Schlüssel wie die Kartenschlüssel (Richtung:Aufgabe), umkehrbar', () => {
    const s = abgabeSchluessel('de-aus-ar', 'de.b2.e01.l03.a02');
    expect(s).toBe('de-aus-ar:de.b2.e01.l03.a02');
    expect(zerlegeAbgabeSchluessel(s)).toEqual({ kurs: 'de-aus-ar', aufgabe: 'de.b2.e01.l03.a02' });
    expect(zerlegeAbgabeSchluessel('de.b2.e01.l03.a02')).toBeNull();
    expect(zerlegeAbgabeSchluessel('islam:x')).toBeNull();
  });
});

describe('Format der Anfrage (Zod nur auf dem Server)', () => {
  const ok = {
    id: '00000000-0000-4000-8000-000000000001',
    kurs: 'tr-aus-de',
    aufgabe: 'tr.b1.e03.l06.a01',
    gruppe: '00000000-0000-4000-8000-000000000002',
    text: 'Bugün hava güzel.',
    pruefliste: {},
  };
  it('Abgabe: Kennungen als UUID, Text 1–8.000 Zeichen, Prüfliste 0–3, nichts Zusätzliches', () => {
    expect(AbgabeAnfrageSchema.safeParse(ok).success).toBe(true);
    expect(AbgabeAnfrageSchema.safeParse({ ...ok, text: 'x'.repeat(8_001) }).success).toBe(false);
    expect(AbgabeAnfrageSchema.safeParse({ ...ok, gruppe: 'gruppe-1' }).success).toBe(false);
    expect(AbgabeAnfrageSchema.safeParse({ ...ok, pruefliste: { note: 1 } }).success).toBe(false);
    expect(AbgabeAnfrageSchema.safeParse({ ...ok, name: '[Name]' }).success).toBe(false);
  });

  it('Prüfung: Oberfläche de/tr/ar, nur Sprachkurse', () => {
    expect(PruefAnfrageSchema.safeParse({ ui: 'ar', kurs: 'de-aus-ar', aufgabe: 'de.b1.e01.l01.a01' }).success).toBe(true);
    expect(PruefAnfrageSchema.safeParse({ ui: 'en', kurs: 'de-aus-ar', aufgabe: 'x' }).success).toBe(false);
    expect(PruefAnfrageSchema.safeParse({ ui: 'de', kurs: 'koran', aufgabe: 'x' }).success).toBe(false);
  });
});
