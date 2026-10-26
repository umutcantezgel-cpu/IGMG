import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { EINSTUFUNG_MINDESTENS, EINSTUFUNG_TYPEN } from '@/lib/lernapp/engine/einstufung';

/**
 * Mengenbericht der Lern-App (`_lernapp/werkzeuge/mengen.mjs`, Gegenprüfung L8-03-04 Mangel 6): Er deckt Z-L01 ganz ab – auch
 * Einstufungsbank und Tipp-Karten (PLAN §5.1) –, und seine Liste der Einstufungstypen ist dieselbe wie im Einstufungstest.
 * Stufe C (C-inhalte.md Nacharbeit 1, N7): Umfang nach L3-E16 (A1–B1) als Standard, je Zielsprache verwiesen und live.
 */
const LERNAPP = join(import.meta.dirname, '..', '..', '..', '..', '_lernapp');
const werkzeug = readFileSync(join(LERNAPP, 'werkzeuge', 'mengen.mjs'), 'utf8');
const bericht = readFileSync(join(LERNAPP, 'berichte', 'mengen.md'), 'utf8');

describe('Mengenbericht', () => {
  it('zählt die Einstufungsbank mit denselben Typen wie der Einstufungstest', () => {
    const liste = /const EINSTUFUNG_TYPEN = \[([^\]]*)\];/.exec(werkzeug)?.[1] ?? '';
    expect([...liste.matchAll(/'([a-z_]+)'/g)].map((m) => m[1])).toEqual([...EINSTUFUNG_TYPEN]);
    expect(werkzeug).toContain(`every((st) => je[st] >= ${EINSTUFUNG_MINDESTENS})`);
  });

  it('nennt Einstufungsbank (≈ 400 je Zielsprache) und Tipp-Karten (≈ 300 je Richtung) mit Bewertung, je Stand', () => {
    expect(werkzeug).toContain('const ZIEL_EINSTUFUNG_JE_SPRACHE = 400;');
    expect(werkzeug).toContain('const ZIEL_TIPPS_JE_RICHTUNG = 300;');
    const staende = bericht.split('\n## Stand: ').length - 1;
    expect(staende).toBeGreaterThan(0);
    expect(bericht.split('### Einstufungsbank und Tipp-Karten (Z-L01, PLAN §5.1)').length - 1).toBe(staende);
    expect(bericht.match(/\| Richtung \| Tipp-Karten \(Ziel ≈ \d+ je Ausgangssprache(, anteilig)?\) \|/g)).toHaveLength(staende);
  });

  it('bewertet nach L3-E16 standardmäßig A1–B1 (Stufenauswahl) und nennt je Zielsprache verwiesen und live (Stufe C, N7)', () => {
    expect(werkzeug).toContain("const STANDARD_STUFEN = ['a1', 'a2', 'b1'];");
    expect(werkzeug).toContain("a === '--stufen'");
    const staende = bericht.split('\n## Stand: ').length - 1;
    expect(bericht.split('Umfang: A1–B1 (Standard nach L3-E16').length - 1).toBe(staende);
    expect(bericht.split('### Bewertung Z-L01 je Zielsprache (Σ A1–B1, erfüllt ab Ziel − 5 %)').length - 1).toBe(staende);
    expect(bericht.split('### Freigegeben, in Aufgaben verwiesen und live (Σ A1–B1)').length - 1).toBe(staende);
    expect(bericht).toContain('| Sätze in Aufgaben verwiesen | Sätze live |');
  });

  it('zählt eine doppelt genannte Stufe nur einmal (Gegenprüfung N7)', { timeout: 30_000 }, () => {
    const lauf = (stufen: string) =>
      execFileSync(process.execPath, [join(LERNAPP, 'werkzeuge', 'mengen.mjs'), '--stufen', stufen], { encoding: 'utf8' })
        .split('\n')
        .filter((z) => !z.startsWith('Erzeugt mit '))
        .join('\n');
    const doppelt = lauf('a1,A1,a1');
    expect(doppelt).toContain('### Bewertung Z-L01 je Zielsprache (Σ A1, erfüllt ab Ziel − 5 %)');
    expect(doppelt).toEqual(lauf('a1'));
  });
});
