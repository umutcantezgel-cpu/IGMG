import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { testkursImBau } from '../../../scripts/lernapp/testkurs-im-bau.mjs';

/**
 * Bau-Datenbank ohne Datenbank (Vercel-Bau, öffentliche Test-Domain; Stufe C, L15-1): Der Testkurs mit seinen synthetischen
 * Tönen kommt nur auf ausdrücklichen Wunsch hinein (`LERNAPP_TESTKURS=1`), nie allein wegen `VERCEL=1`. Das Bau-Skript
 * `scripts/bau-datenbank.mjs` nutzt genau diese Bedingung.
 */
describe('testkursImBau', () => {
  it('Vercel-Bau ohne ausdrücklichen Wunsch: kein Testkurs', () => {
    expect(testkursImBau({ VERCEL: '1' })).toBe(false);
    expect(testkursImBau({ VERCEL: '1', VERCEL_ENV: 'production' })).toBe(false);
    expect(testkursImBau({})).toBe(false);
  });

  it('nur LERNAPP_TESTKURS=1 nimmt ihn auf (Vorführung im Beispielmodus)', () => {
    expect(testkursImBau({ LERNAPP_TESTKURS: '1' })).toBe(true);
    expect(testkursImBau({ VERCEL: '1', LERNAPP_TESTKURS: '1' })).toBe(true);
    expect(testkursImBau({ LERNAPP_TESTKURS: '0' })).toBe(false);
    expect(testkursImBau({ LERNAPP_TESTKURS: 'ja' })).toBe(false);
  });

  it('das Bau-Skript entscheidet nur über testkursImBau', () => {
    const skript = readFileSync(join(__dirname, '../../../scripts/bau-datenbank.mjs'), 'utf8');
    expect(skript).toContain("import { testkursImBau } from './lernapp/testkurs-im-bau.mjs';");
    expect(skript).toMatch(/const testkurs = testkursImBau\(process\.env\);/);
    expect(skript).not.toMatch(/process\.env\.(?:VERCEL|LERNAPP_TESTKURS)\b/);
  });

  it('die Audio-Route liefert Testbündel ohne Laufzeit-Datenbank nach derselben Bedingung', () => {
    const route = readFileSync(join(__dirname, '../../../src/app/lern-app/audio/[...pfad]/route.ts'), 'utf8');
    expect(route).toContain("if (!datenbankVerfuegbar()) return process.env.LERNAPP_TESTKURS === '1';");
    expect(testkursImBau.toString()).toContain("env.LERNAPP_TESTKURS === '1'");
  });
});
