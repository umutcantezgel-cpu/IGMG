import { describe, expect, it } from 'vitest';
import { tageszeilen } from '@/lib/gebetszeiten/hijri';

/** Kopfzeilen des Tagesbogens kommen fertig vom Server (H-L01): Wochentag, Datum und Hidschri-Datum je Kalendertag. */
describe('tageszeilen', () => {
  it('liefert je Kalendertag Wochentag · Hidschri-Datum in der Sprache der Seite', () => {
    const z = tageszeilen(['2026-10-12', '2026-10-13'], 'de-DE');
    expect(Object.keys(z)).toEqual(['2026-10-12', '2026-10-13']);
    expect(z['2026-10-12']).toMatch(/^Mo\., 12\. Okt\. · .*1448/);
    expect(z['2026-10-13']).toMatch(/^Di\., 13\. Okt\. · /);
  });

  it('hängt nicht von der Zeitzone des Prozesses ab (Mittag UTC)', () => {
    expect(tageszeilen(['2026-03-29'], 'en-GB')['2026-03-29']).toMatch(/^Sun 29 Mar · /);
  });
});
