import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { KoranPfadDateiSchema } from '@/lib/lernapp/inhalt/schema';
import { umschrift } from '@/lib/lernapp/koran/umschrift';
import { leseTanzil } from '@/lib/quran/tanzil';
import { woerter } from '@/lib/quran/woerter';

/**
 * Koran-Arabisch-Pfad (L6-05, KERN 4.0 §2.2 Nr. 4 und 6, ADR 0040 Nr. 5): `web/inhalte/lernapp/koran/pfad.json` enthält nur
 * Verweise `Sure:Vers:Wort` auf den gepinnten Tanzil-Text – keine arabische Schrift (auch nicht als Codepunkte), keine
 * Bedeutungen, kein Audio. Jede Stelle trifft ein Wort des Texts. Die Umschrift der Arbeitsliste enthält nie arabische Schrift.
 */

const WEB = join(import.meta.dirname, '../../..');
const roh = readFileSync(join(WEB, 'inhalte/lernapp/koran/pfad.json'), 'utf8');
const pfad = KoranPfadDateiSchema.parse(JSON.parse(roh));
const tanzil = leseTanzil(readFileSync(join(WEB, 'daten/tanzil/quran-uthmani.xml'), 'utf8'));
const wortAn = new Map(tanzil.flatMap((s) => s.verse.flatMap((v) => woerter(v.textAr).map((w) => [`${s.nr}:${v.nr}:${w.pos}`, w.text]))));
const ARABISCH = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/u;

describe('Koran-Pfad: nur Verweise', () => {
  it('ist gültig und hat ≈ 40 Einheiten in den drei eigenen Stufen', () => {
    expect(pfad.einheiten.length).toBeGreaterThanOrEqual(35);
    expect(pfad.einheiten.length).toBeLessThanOrEqual(45);
    expect(new Set(pfad.einheiten.map((e) => e.stufe))).toEqual(new Set(['grund', 'aufbau', 'vertiefung']));
  });

  it('enthält keine arabische Schrift, keine Codepunkte, keine Entitäten', () => {
    expect(ARABISCH.test(roh)).toBe(false);
    expect(roh).not.toMatch(/\\u|&#|%[dD][89a-fA-F]/);
  });

  it('enthält keine Bedeutungen und kein Audio (nur Schlüssel, Stellen, Themen)', () => {
    expect(roh).not.toMatch(/"(bedeutung|bedeutungen|text|audio|wurzel|uebersetzung)"\s*:/);
    for (const e of pfad.einheiten) for (const l of e.lektionen) for (const a of l.aufgaben) expect(a.art, a.schluessel).toBe('bedeutung');
  });

  it('jede Stelle trifft ein Wort des gepinnten Tanzil-Texts; jede Wortform nur einmal im Pfad', () => {
    const formen = new Set<string>();
    for (const e of pfad.einheiten)
      for (const l of e.lektionen)
        for (const stelle of [...l.wortformen, ...l.aufgaben.flatMap((a) => [a.wortform, ...a.ablenker])]) {
          expect(wortAn.has(stelle), stelle).toBe(true);
        }
    for (const e of pfad.einheiten)
      for (const l of e.lektionen)
        for (const stelle of l.wortformen) {
          const text = wortAn.get(stelle)!;
          expect(formen.has(text), stelle).toBe(false);
          formen.add(text);
        }
    expect(formen.size).toBeGreaterThanOrEqual(500);
  });

  it('beginnt mit Sure 1 und den häufigsten Wortformen', () => {
    const [erste, zweite] = pfad.einheiten;
    expect(erste!.lektionen[0]!.wortformen[0]).toBe('1:1:1');
    expect(zweite!.lektionen[0]!.wortformen.every((s) => !s.startsWith('1:'))).toBe(true);
  });
});

describe('Umschrift (Arbeitsliste)', () => {
  it('schreibt Grundformen nach DMG-Art', () => {
    // b-i-s-m-i (Testdaten nur als Codepunkte)
    expect(umschrift('\u0628\u0650\u0633\u0652\u0645\u0650')).toBe('bismi');
    // Artikel mit Mondbuchstaben: Alif wasla, Lam mit Sukun, Ha mit Fatha, Mim mit Sukun, Dal mit Damma
    expect(umschrift('\u0671\u0644\u0652\u062D\u064E\u0645\u0652\u062F\u064F')).toBe('al-ḥamdu');
    // Dehnung durch Alif nach Fatha, Tanwin
    expect(umschrift('\u0643\u064E\u0627\u0646\u064E')).toBe('kāna');
    expect(umschrift('\u0643\u0650\u062A\u064E\u0640\u0670\u0628\u064C')).toBe('kitābun');
  });

  it('enthält für keine Wortform des Texts arabische Schrift', () => {
    const formen = new Set([...wortAn.values()]);
    expect(formen.size).toBeGreaterThan(18_000);
    for (const f of formen) expect(ARABISCH.test(umschrift(f))).toBe(false);
  });
});
