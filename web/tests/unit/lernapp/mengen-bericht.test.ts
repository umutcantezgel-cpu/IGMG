import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { EINSTUFUNG_MINDESTENS, EINSTUFUNG_TYPEN } from '@/lib/lernapp/engine/einstufung';

/**
 * Mengenbericht der Lern-App (`_lernapp/werkzeuge/mengen.mjs`, Gegenprüfung L8-03-04 Mangel 6): Er deckt Z-L01 ganz ab – auch
 * Einstufungsbank und Tipp-Karten (PLAN §5.1) –, und seine Liste der Einstufungstypen ist dieselbe wie im Einstufungstest.
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
    expect(bericht.split('| Richtung | Tipp-Karten (Ziel ≈ 300 je Ausgangssprache) |').length - 1).toBe(staende);
  });
});
