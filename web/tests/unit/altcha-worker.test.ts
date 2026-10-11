import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/** Die Worker-Kopie in public/altcha muss zur installierten altcha-Version passen (sonst `pnpm altcha:kopieren`). */
describe('ALTCHA-Worker', () => {
  it('public/altcha/pbkdf2.js ist identisch mit node_modules/altcha/dist/workers/pbkdf2.js', () => {
    const wurzel = join(import.meta.dirname, '..', '..');
    const kopie = readFileSync(join(wurzel, 'public', 'altcha', 'pbkdf2.js'));
    const quelle = readFileSync(join(wurzel, 'node_modules', 'altcha', 'dist', 'workers', 'pbkdf2.js'));
    expect(kopie.equals(quelle)).toBe(true);
  });
});
