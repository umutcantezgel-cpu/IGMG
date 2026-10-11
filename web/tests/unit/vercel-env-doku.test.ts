import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { VARIABLEN } from '@/lib/umgebung';

const WEB = resolve(import.meta.dirname, '../..');
const DOKU = readFileSync(join(WEB, 'docs/deploy/VERCEL-ENV.md'), 'utf8');

/** Kommt der Name als ganzes Wort vor? `PORT` zählt nicht in `SMTP_PORT`, weil davor ein Buchstabe oder `_` steht. */
function nennt(text: string, name: string): boolean {
  return new RegExp(`(?<![A-Za-z0-9_])${name}(?![A-Za-z0-9_])`).test(text);
}

describe('docs/deploy/VERCEL-ENV.md', () => {
  const namen = VARIABLEN.filter((variable) => !variable.muster).map((variable) => variable.name);

  it('listet Variablen aus VARIABLEN', () => {
    expect(namen.length).toBeGreaterThan(20);
  });

  it.each(namen)('nennt %s', (name) => {
    expect(nennt(DOKU, name)).toBe(true);
  });
});
