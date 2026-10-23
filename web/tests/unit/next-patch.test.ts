import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * P4 (echte E2E, cms.spec „Weiterleitung“): next@16.4.0 (und unverändert 16.4.2) hängt im Standalone-Betrieb (`next start`, Docker) beim frischen
 * Rendern (Cache MISS) die Kopfzeilen der Seite ein zweites Mal an. Bei einer Weiterleitung aus der Fangroute (308,
 * `permanentRedirect`) stand `location` doppelt da, der Browser folgte „/ziel, /ziel“ und landete auf 404.
 * `patches/next@16.4.2.patch` (pnpm patchedDependencies; aus 16.4.0 unverändert übernommen) hängt gleiche Werte nicht erneut an. Dieser Test stellt sicher,
 * dass die installierte Fassung den Patch trägt – nach einem Update von Next ist der Fehler neu zu prüfen.
 */
const require = createRequire(import.meta.url);
const NEXT = dirname(require.resolve('next/package.json'));

describe('Patch next@16.4.2: keine doppelten Kopfzeilen beim Cache-MISS', () => {
  for (const datei of ['dist/build/templates/app-page-runtime.js', 'dist/esm/build/templates/app-page-runtime.js']) {
    it(`${datei} hängt vorhandene gleiche Werte nicht erneut an`, () => {
      const quelle = readFileSync(join(NEXT, datei), 'utf8');
      expect(quelle).toContain('IGMG-Patch (P4, next@16.4.0)');
      expect(quelle).toContain('if (vorhanden !== undefined && String(vorhanden) === String(value)) continue;');
    });
  }

  it('gilt für die installierte Version', () => {
    const { version } = JSON.parse(readFileSync(join(NEXT, 'package.json'), 'utf8')) as { version: string };
    expect(version).toBe('16.4.2');
  });
});
