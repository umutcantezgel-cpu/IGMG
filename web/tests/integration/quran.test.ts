import { afterAll, describe, expect, it } from 'vitest';
import { schema } from '@/lib/db';
import { verwaltungsUmgebung } from './hilfen/verwaltung';

/** D-Q1 (ADR 0009, G-06): ohne Import keine Quelle (Platzhalter); mit Import Suren und Verse unverändert. Daten fiktiv. */
const { client, db } = await verwaltungsUmgebung();
const { ladeQuranStand, ladeSure } = await import('@/server/queries/quran');
afterAll(() => client.close());

describe('Quran-Abfragen', () => {
  it('ohne Import: keine Quelle, keine Suren, keine Sure', async () => {
    expect(await ladeQuranStand()).toEqual({ quelle: null, suren: [] });
    expect(await ladeSure(1)).toBeNull();
  });

  it('mit Import: Quelle, Surenliste, Verse in Reihenfolge; ungültige Nummern null', async () => {
    await db.insert(schema.quranQuelle).values({
      id: 'test',
      bezeichnung: '[Testquelle]',
      url: 'https://example.test',
      version: '0',
      sha256: '0'.repeat(64),
      lizenz: '[Testlizenz]',
    });
    await db.insert(schema.quranSure).values([
      { nr: 1, nameAr: '[Testsure Eins]', verseAnzahl: 2, quelleId: 'test' },
      { nr: 2, nameAr: '[Testsure Zwei]', verseAnzahl: 1, quelleId: 'test' },
    ]);
    await db.insert(schema.quranVers).values([
      { sure: 1, vers: 2, textAr: '[Testvers 1:2]' },
      { sure: 1, vers: 1, textAr: '[Testvers 1:1]' },
      { sure: 2, vers: 1, textAr: '[Testvers 2:1]' },
    ]);
    const stand = await ladeQuranStand();
    expect(stand.quelle).toEqual({ bezeichnung: '[Testquelle]', url: 'https://example.test', version: '0' });
    expect(stand.suren.map((s) => s.nr)).toEqual([1, 2]);
    expect((await ladeSure(1))?.verse.map((v) => v.textAr)).toEqual(['[Testvers 1:1]', '[Testvers 1:2]']);
    for (const nr of [0, 115, 1.5, 3]) expect(await ladeSure(nr)).toBeNull();
  });
});
