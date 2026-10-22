import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { GRUPPEN_KURSE, kursDesEreignisses, summenJeKurs, UNBEKANNT, zaehltFuerGruppe } from '@/lib/lernapp/ereignisse/kurs';
import type { Ereignis, EreignisVon } from '@/lib/lernapp/ereignisse/typen';
import { tageAusKursen } from '@/lib/lernapp/gruppe/regeln';
import { KURS_SLUGS, RICHTUNGEN } from '@/lib/lernapp/kurse';

/**
 * Tagessummen je Kurs (S-L3 M-1, ADR 0043 Fortschreibung Nr. 17, D-L03/D-L04): Kurs je Ereignis, Summen je Tag und Kurs,
 * nur Sprachkurse für Gruppe und Bestenliste, Zusammenfassung für den Stand der Lehrkraft; die Migration 0022 trägt den
 * Bestand mit derselben Kursliste nach.
 */
const G = '0b5f8a52-34c1-4d6e-9a7b-2c3d4e5f6a7b';
let seq = 0;
const kopf = (tag: string) => ({ geraet: G, seq: seq++, am: `${tag}T10:00:00.000Z`, tag });
const lektion = (tag: string, kurs: string, schluessel: string): EreignisVon<'lektion'> => ({
  ...kopf(tag),
  art: 'lektion',
  daten: { kurs, lektion: schluessel, art: 'lektion', richtig: 1, gesamt: 1 },
});
const xp = (tag: string, menge: number, bezug?: string): EreignisVon<'xp'> => ({
  ...kopf(tag),
  art: 'xp',
  daten: { menge, grund: 'lektion', ...(bezug ? { bezug } : {}) },
});

describe('kursDesEreignisses', () => {
  it('Lektion: Kurs-Slug, nur wenn der Lektionsschlüssel dazu passt', () => {
    expect(kursDesEreignisses(lektion('2026-10-19', 'tr-aus-de', 'tr-aus-de.a1.e01.l01'))).toBe('tr-aus-de');
    expect(kursDesEreignisses(lektion('2026-10-19', 'islam', 'islam.grund.e01.l01'))).toBe('islam');
    expect(kursDesEreignisses(lektion('2026-10-19', 'koran', 'koran.grund.e01.l01'))).toBe('koran');
    // Kurs und Schlüssel widersprechen sich oder Kurs unbekannt: zählt nirgends
    expect(kursDesEreignisses(lektion('2026-10-19', 'tr-aus-de', 'islam.grund.e01.l01'))).toBe(UNBEKANNT);
    expect(kursDesEreignisses(lektion('2026-10-19', 'tr', 'tr.a1.e01.l01'))).toBe(UNBEKANNT);
    expect(kursDesEreignisses(lektion('2026-10-19', 'tr-aus-de', 'tr-aus-def.a1'))).toBe(UNBEKANNT);
  });

  it('XP: erster Teil des Bezugs; ohne Bezug oder ohne Punkt unbekannt', () => {
    expect(kursDesEreignisses(xp('2026-10-19', 5, 'ar-aus-tr.a1.e02.l03'))).toBe('ar-aus-tr');
    expect(kursDesEreignisses(xp('2026-10-19', 5, 'de-aus-ar.wiederholung'))).toBe('de-aus-ar');
    expect(kursDesEreignisses(xp('2026-10-19', 5, 'islam.grund.e01.l01'))).toBe('islam');
    expect(kursDesEreignisses(xp('2026-10-19', 5))).toBe(UNBEKANNT);
    expect(kursDesEreignisses(xp('2026-10-19', 5, 'islam'))).toBe(UNBEKANNT);
    expect(kursDesEreignisses(xp('2026-10-19', 5, 'quatsch.a1'))).toBe(UNBEKANNT);
  });
});

describe('Gruppe und Bestenliste nur aus Sprachkursen (D-L04)', () => {
  it('die sechs Richtungen zählen, Wissen, Koran-Arabisch und unbekannt nie', () => {
    expect([...GRUPPEN_KURSE].sort()).toEqual([...RICHTUNGEN].sort());
    for (const k of RICHTUNGEN) expect(zaehltFuerGruppe(k)).toBe(true);
    for (const k of ['islam', 'koran', UNBEKANNT, 'tr', '']) expect(zaehltFuerGruppe(k)).toBe(false);
  });
});

describe('summenJeKurs', () => {
  it('XP und Lektionen je Tag und Kurs; andere Arten übergangen; optional nur bestimmte Tage', () => {
    const ereignisse: Ereignis[] = [
      lektion('2026-10-19', 'tr-aus-de', 'tr-aus-de.a1.e01.l01'),
      xp('2026-10-19', 10, 'tr-aus-de.a1.e01.l01'),
      lektion('2026-10-19', 'islam', 'islam.grund.e01.l01'),
      xp('2026-10-19', 12, 'islam.grund.e01.l01'),
      xp('2026-10-19', 3),
      xp('2026-10-20', 7, 'tr-aus-de.wiederholung'),
      { ...kopf('2026-10-19'), art: 'tagesziel', daten: { ziel: { art: 'kein' } } },
    ];
    expect(summenJeKurs(ereignisse)).toEqual([
      { tag: '2026-10-19', kurs: 'islam', xp: 12, lektionen: 1 },
      { tag: '2026-10-19', kurs: 'tr-aus-de', xp: 10, lektionen: 1 },
      { tag: '2026-10-19', kurs: UNBEKANNT, xp: 3, lektionen: 0 },
      { tag: '2026-10-20', kurs: 'tr-aus-de', xp: 7, lektionen: 0 },
    ]);
    expect(summenJeKurs(ereignisse, new Set(['2026-10-20']))).toEqual([{ tag: '2026-10-20', kurs: 'tr-aus-de', xp: 7, lektionen: 0 }]);
  });

  it('Eigenschaft: die Summen je Kurs ergeben die Tagessumme (nichts geht verloren, nichts doppelt)', () => {
    const kurse = [...KURS_SLUGS, 'tr'] as const;
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            tag: fc.constantFrom('2026-10-19', '2026-10-20', '2026-10-21'),
            kurs: fc.constantFrom(...kurse),
            menge: fc.integer({ min: 1, max: 20 }),
            istXp: fc.boolean(),
          }),
          { maxLength: 60 },
        ),
        (roh) => {
          const ereignisse = roh.map((r) =>
            r.istXp ? xp(r.tag, r.menge, `${r.kurs}.a1.e01.l01`) : lektion(r.tag, r.kurs, `${r.kurs}.a1.e01.l01`),
          );
          const summen = summenJeKurs(ereignisse);
          for (const tag of ['2026-10-19', '2026-10-20', '2026-10-21']) {
            const amTag = roh.filter((r) => r.tag === tag);
            const s = summen.filter((x) => x.tag === tag);
            expect(s.reduce((a, x) => a + x.xp, 0)).toBe(amTag.filter((r) => r.istXp).reduce((a, r) => a + r.menge, 0));
            expect(s.reduce((a, x) => a + x.lektionen, 0)).toBe(amTag.filter((r) => !r.istXp).length);
          }
        },
      ),
    );
  });
});

describe('tageAusKursen (Stand der Lehrkraft)', () => {
  it('fasst die erlaubten Kurse je Tag zusammen, ohne Pausen', () => {
    expect(
      tageAusKursen([
        { tag: '2026-10-19', xp: 10, lektionen: 1 },
        { tag: '2026-10-19', xp: 5, lektionen: 2 },
        { tag: '2026-10-21', xp: 0, lektionen: 1 },
      ]),
    ).toEqual([
      { tag: '2026-10-19', xp: 15, lektionen: 3, pause: false },
      { tag: '2026-10-21', xp: 0, lektionen: 1, pause: false },
    ]);
  });
});

describe('Migration 0022 trägt den Bestand mit denselben Kursen nach', () => {
  it('jeder Kurs-Slug steht in der Liste des Nachtrags; die Regeln nennen Lektionsschlüssel und Bezug', () => {
    const sql = readFileSync(join(process.cwd(), 'drizzle/migrations/0022_lernapp_tag_kurs.sql'), 'utf8');
    const listen = [...sql.matchAll(/IN \(([^)]*)\)/g)].map((m) => m[1]!).filter((l) => l.includes("'islam'"));
    expect(listen).toHaveLength(2);
    for (const l of listen)
      expect(
        l
          .split(',')
          .map((x) => x.trim().replace(/'/g, ''))
          .sort(),
      ).toEqual([...KURS_SLUGS].sort());
    expect(sql).toContain(`'${UNBEKANNT}'`);
    expect(sql).toContain(`"daten"->>'bezug'`);
    expect(sql).toContain(`"daten"->>'lektion'`);
  });
});
