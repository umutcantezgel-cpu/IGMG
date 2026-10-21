import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import texte from '../../../messages/verwaltung/lernapp.json';
import {
  alternativeZiel,
  aufgabeGehoertZumKurs,
  ergaenzeAlternative,
  MeldungSchema,
  meldungsSchluessel,
  zerlegeMeldungsSchluessel,
} from '@/lib/lernapp/meldung';
import { aufnahmeSchluessel, clipLage, stimmenArt, vertonbar, wirksameStimme } from '@/lib/lernapp/verwaltung/audio';
import { LERNAPP_DATENSAETZE, leseQuelleMd, STIMMEN } from '@/lib/lernapp/verwaltung/quellen';
import { anteil, pruefquote, prozent, standBaum, zaehleStatus } from '@/lib/lernapp/verwaltung/quoten';

/** Reine Helfer der Verwaltung v1 (L3-06): Quoten, Meldungen, Audio-Studio, Quellenregister. */
describe('Quoten der Übersicht', () => {
  it('zählt Stände und rechnet Anteile ohne Division durch null', () => {
    expect(zaehleStatus(['entwurf', 'veroeffentlicht', 'veroeffentlicht', 'unbekannt'])).toEqual({
      entwurf: 1,
      automatisch_geprueft: 0,
      veroeffentlicht: 2,
      gesperrt: 0,
      gesamt: 3,
    });
    expect(anteil(1, 0)).toBe(0);
    expect(anteil(3, 4)).toBe(0.75);
    expect(prozent(199, 200)).toBe(99);
    expect(prozent(200, 200)).toBe(100);
  });

  it('Baum Kurs → Stufe → Einheit mit Summen in fester Reihenfolge', () => {
    const z = (kurs: string, stufe: string, schluessel: string, status: 'entwurf' | 'veroeffentlicht', n: number) => ({
      kurs,
      stufe,
      schluessel,
      status,
      eintraege: { ...zaehleStatus(Array.from({ length: n }, () => status)) },
    });
    const baum = standBaum(
      [
        z('tr', 'a2', 'tr.a2.e01', 'entwurf', 3),
        z('de', 'a1', 'de.a1.e02', 'veroeffentlicht', 2),
        z('tr', 'a1', 'tr.a1.e01', 'veroeffentlicht', 4),
      ],
      ['de', 'tr', 'ar'],
      ['a1', 'a2'],
    );
    expect(baum.map((k) => k.kurs)).toEqual(['de', 'tr']);
    const tr = baum[1]!;
    expect(tr.stufen.map((s) => s.stufe)).toEqual(['a1', 'a2']);
    expect(tr.einheiten).toMatchObject({ gesamt: 2, entwurf: 1, veroeffentlicht: 1 });
    expect(tr.eintraege).toMatchObject({ gesamt: 7, entwurf: 3, veroeffentlicht: 4 });
  });

  it('Prüfquote über Stichproben', () => {
    const q = pruefquote([
      { art: 'zieltext', entscheidung: 'bestanden', groesse: 20, geprueft: 20 },
      { art: 'uebersetzung', entscheidung: 'offen', groesse: 20, geprueft: 5 },
      { art: 'audio', entscheidung: 'nachbessern', groesse: 4, geprueft: 9 },
    ]);
    expect(q).toEqual({ stichproben: 3, offen: 1, bestanden: 1, nachbessern: 1, gezogen: 44, geprueft: 29, quote: 65 });
  });
});

describe('Meldungen aus der App', () => {
  const gueltig = { kurs: 'tr-aus-de', aufgabe: 'tr.a1.e01.l01.a03', kategorie: 'fehler_zieltext', altcha: 'x' };
  it('Schema: nur Aufgabe, Kategorie, ALTCHA und optional die Antwort (≤ 200 Zeichen)', () => {
    expect(MeldungSchema.safeParse(gueltig).success).toBe(true);
    expect(MeldungSchema.safeParse({ ...gueltig, antwort: 'a'.repeat(200) }).success).toBe(true);
    expect(MeldungSchema.safeParse({ ...gueltig, antwort: 'a'.repeat(201) }).success).toBe(false);
    expect(MeldungSchema.safeParse({ ...gueltig, email: 'x@example.test' }).success).toBe(false);
    expect(MeldungSchema.safeParse({ ...gueltig, kategorie: 'beleidigung' }).success).toBe(false);
    expect(MeldungSchema.safeParse({ ...gueltig, kurs: 'en-aus-de' }).success).toBe(false);
  });

  it('Aufgabe gehört zum Kurs; Schlüssel mit Richtung', () => {
    expect(aufgabeGehoertZumKurs('tr-aus-de', 'tr.a1.e01.l01.a03')).toBe(true);
    expect(aufgabeGehoertZumKurs('tr-aus-de', 'de.a1.e01.l01.a03')).toBe(false);
    expect(aufgabeGehoertZumKurs('islam', 'islam.grund.e01.l01.a01')).toBe(true);
    expect(meldungsSchluessel('tr-aus-de', 'tr.a1.e01.l01.a03')).toBe('tr-aus-de:tr.a1.e01.l01.a03');
    expect(zerlegeMeldungsSchluessel('tr-aus-de:tr.a1.e01.l01.a03')).toEqual({ kurs: 'tr-aus-de', aufgabe: 'tr.a1.e01.l01.a03' });
    expect(zerlegeMeldungsSchluessel('tr-aus-de:ar.a1.e01')).toBeNull();
    expect(zerlegeMeldungsSchluessel('ohne-doppelpunkt')).toBeNull();
  });

  it('Ziel einer Alternative je Vorlage', () => {
    expect(alternativeZiel({ typ: 'wortbank', nach: 'ziel', satz: 'tr.a1.e01.s0001' })).toEqual({ art: 'aufgabe', max: 20, laenge: 600 });
    expect(alternativeZiel({ typ: 'wortbank', nach: 'ausgang', satz: 'tr.a1.e01.s0001' })).toEqual({
      art: 'uebersetzung',
      bezug: 'tr.a1.e01.s0001',
      max: 30,
      laenge: 600,
    });
    expect(alternativeZiel({ typ: 'frei', nach: 'ausgang', ziel: 'tr.a1.e01.w001' })).toMatchObject({
      art: 'uebersetzung',
      bezug: 'tr.a1.e01.w001',
    });
    expect(alternativeZiel({ typ: 'luecke', ziel: 'tr.a1.e01.s0002', wort: 1 })).toEqual({ art: 'aufgabe', max: 10, laenge: 60 });
    expect(alternativeZiel({ typ: 'auswahl', ziel: 'x', ablenker: [] })).toEqual({ art: 'keine' });
  });

  it('Alternativen ohne Dubletten, ohne Hauptlösung, mit Grenzen', () => {
    expect(
      ergaenzeAlternative(['Das Haus ist neu.'], '  Das  Haus ist sehr neu. ', { haupt: 'Das Haus ist neu.', max: 3, laenge: 600 }),
    ).toEqual({
      ok: true,
      liste: ['Das Haus ist neu.', 'Das Haus ist sehr neu.'],
    });
    expect(ergaenzeAlternative([], 'das haus ist neu.', { haupt: 'Das Haus ist neu.', max: 3, laenge: 600 })).toEqual({
      ok: false,
      grund: 'doppelt',
    });
    expect(ergaenzeAlternative(['a'], 'b', { max: 1, laenge: 600 })).toEqual({ ok: false, grund: 'voll' });
    expect(ergaenzeAlternative([], 'abc', { max: 2, laenge: 2 })).toEqual({ ok: false, grund: 'zuLang' });
    expect(ergaenzeAlternative([], '   ', { max: 2, laenge: 2 })).toEqual({ ok: false, grund: 'leer' });
  });
});

describe('Audio-Studio', () => {
  const h = 'ab'.repeat(32);
  const s = 'cd'.repeat(32);
  it('Ablage unter Inhalts-Hash, nur gültige Hashes', () => {
    expect(aufnahmeSchluessel('tr', h, s, { endung: 'webm' })).toBe(`lernapp/aufnahmen/tr/${h.slice(0, 16)}-${s.slice(0, 16)}.webm`);
    expect(() => aufnahmeSchluessel('tr', 'x', s, { endung: 'webm' })).toThrow();
    expect(() => aufnahmeSchluessel('tr', h, s, { endung: '../x' })).toThrow();
  });

  it('nie vertonbar: Religionsbezug, Wissen, Koran-Arabisch, gesperrt', () => {
    expect(vertonbar({ kurs: 'tr', religionsbezug: false, status: 'automatisch_geprueft' })).toBe(true);
    expect(vertonbar({ kurs: 'tr', religionsbezug: true, status: 'veroeffentlicht' })).toBe(false);
    expect(vertonbar({ kurs: 'islam', religionsbezug: false, status: 'veroeffentlicht' })).toBe(false);
    expect(vertonbar({ kurs: 'koran', religionsbezug: false, status: 'veroeffentlicht' })).toBe(false);
    expect(vertonbar({ kurs: 'ar', religionsbezug: false, status: 'gesperrt' })).toBe(false);
  });

  it('Lage, Stimmenart und wirksame Stimme wie der Vorrang im Paketbau', () => {
    expect(clipLage({ clips: 0, meldungen: 2, ausspracheBefund: true })).toBe('fehlt');
    expect(clipLage({ clips: 1, meldungen: 1, ausspracheBefund: false })).toBe('auffaellig');
    expect(clipLage({ clips: 1, meldungen: 0, ausspracheBefund: false })).toBe('vorhanden');
    expect(stimmenArt('tts:coqui@abc1234')).toBe('sprachausgabe');
    expect(stimmenArt('mensch:00000000-0000-0000-0000-000000000000')).toBe('mensch');
    const stimmen = ['tts:coqui@abc1234', 'mensch:1', 'test:ton'];
    expect(wirksameStimme(stimmen, null)).toBe('mensch:1');
    expect(wirksameStimme(stimmen, 'mensch')).toBe('mensch:1');
    expect(wirksameStimme(stimmen, 'sprachausgabe')).toBe('tts:coqui@abc1234');
    expect(wirksameStimme(['mensch:1'], 'sprachausgabe')).toBeNull();
  });
});

describe('Quellenregister', () => {
  const daten = join(process.cwd(), 'daten');
  it('liest die QUELLE.md der Lern-App-Datensätze mit Lizenz und SHA-256', () => {
    for (const ordner of ['tatoeba', 'kaikki', 'haeufigkeit', 'lernapp-modelle', 'tanzil'] as const) {
      const q = leseQuelleMd(readFileSync(join(daten, ordner, 'QUELLE.md'), 'utf8'));
      expect(q.titel, ordner).not.toBe('');
      expect(q.lizenzen.length, ordner).toBeGreaterThan(0);
      expect(q.dateien.length, ordner).toBeGreaterThan(0);
      for (const d of q.dateien) expect(d.sha256, `${ordner} ${d.datei}`).toMatch(/^[0-9a-f]{64}$/);
    }
    const modelle = leseQuelleMd(readFileSync(join(daten, 'lernapp-modelle', 'QUELLE.md'), 'utf8'));
    expect(modelle.dateien.find((d) => d.datei === 'onnx/encoder_model_quantized.onnx')).toMatchObject({
      bytes: 23200850,
      sha256: '3e345e977b55620a37c0c2b2af0644e019afdfad562dcf71eb929bb7274285f9',
    });
    expect(leseQuelleMd(readFileSync(join(daten, 'haeufigkeit', 'QUELLE.md'), 'utf8')).namensnennungen.length).toBeGreaterThanOrEqual(2);
  });

  it('kleine Probe mit Angaben- und Dateitabelle', () => {
    const q = leseQuelleMd(
      [
        '# QUELLE: Probe',
        '',
        '| Feld | Angabe |',
        '|---|---|',
        '| Lizenz | CC0 |',
        '| Namensnennung | [Name] |',
        '',
        '## Dateien',
        '',
        '| Datei | Bytes | SHA-256 |',
        '|---|---|---|',
        `| \`a.txt\` | 12 | \`${'e'.repeat(64)}\` |`,
      ].join('\n'),
    );
    expect(q).toEqual({
      titel: 'Probe',
      lizenzen: ['CC0'],
      namensnennungen: ['[Name]'],
      dateien: [{ abschnitt: 'Dateien', datei: 'a.txt', bytes: 12, sha256: 'e'.repeat(64) }],
    });
  });

  it('jeder Datensatz und jede Stimme hat Texte in der Verwaltung', () => {
    const q = texte.lernapp.quellen;
    for (const d of LERNAPP_DATENSAETZE) expect(q.zweck[d.zweck], d.ordner).toBeTruthy();
    for (const s of STIMMEN) {
      const t = q.stimme[s.id];
      expect(t.gewichte && t.daten && t.code && t.befund, s.id).toBeTruthy();
      expect(Boolean((t as { namensnennung?: string }).namensnennung), s.id).toBe(s.namensnennung);
      expect(q.stand[s.stand], s.stand).toBeTruthy();
    }
  });
});
