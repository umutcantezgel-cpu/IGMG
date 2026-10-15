import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Z-08 (N1): Leseseiten mit großem Inhalt ohne umschließendes `<Suspense>` – in einem Suspense-Rahmen liefert React die
 * ganze Seite samt Konzept-Hinweis ausgelagert (`<div hidden id="S:…">` mit `$RC`) und deckt sie gedrosselt auf (LCP).
 * Erlaubt, weil alle Werte vorgerendert sind (generateStaticParams, `ensureStatic = 'navigation'`); MUSTER.md nennt die
 * Ausnahme von MUSTER 1.
 */
const SEITEN = [
  'quran/[sure]',
  'quran/cuz/[nr]',
  'hadith/bukhari/[buch]',
  'hadith/bukhari/[buch]/teil/[teil]',
  'elifbe/buchstaben/[buchstabe]',
];
const ORDNER = join(import.meta.dirname, '..', '..', 'src', 'app', '[locale]', '(website)');

describe.each(SEITEN)('Leseseite %s', (seite) => {
  // Kommentare entfernen: Die Begründung im Code nennt `<Suspense>` ausdrücklich
  const code = readFileSync(join(ORDNER, seite, 'page.tsx'), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');

  it('ohne Suspense-Rahmen um den Inhalt', () => {
    expect(code).not.toMatch(/<Suspense[\s>]/);
    expect(code).not.toMatch(/^import .*\bSuspense\b/m);
  });

  it('vollständig vorgerendert: ensureStatic navigation und generateStaticParams', () => {
    expect(code).toMatch(/^export const ensureStatic = 'navigation';$/m);
    expect(code).toMatch(/^export (async )?function generateStaticParams\(/m);
  });
});
