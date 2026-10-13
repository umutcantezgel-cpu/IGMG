import { and, eq } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { schema } from '@/lib/db';
import { verwaltungsUmgebung } from './hilfen/verwaltung';

/**
 * Elifbe-Abfragen (ADR 0030, H-E02): Beispielwörter sind nur Verweise auf `quran_wort` – jedes gelieferte Wort steht
 * genau so an Sure/Vers/Position in der Datenbank. Testwörter sind synthetisch aus Codepunkten gebaut (keine
 * Korantexte); Cüz 30 kommt zuerst, je Wortform einmal, die Auswahl der Lehrkraft geht vor.
 */
const { client, db } = await verwaltungsUmgebung();
const { ladeBeispielwoerter, ladeElifbeAudio, ladeLektionstexte } = await import('@/server/queries/elifbe');
afterAll(() => client.close());

const cp = (...n: number[]) => String.fromCodePoint(...n);
const BE = 0x0628;
const FATHA = 0x064e;
/** Synthetische Wörter: Buchstabe + Fatha + Füllbuchstaben (Ra, Dal, Lam). */
const WORT = {
  be1: cp(BE, FATHA, 0x0631),
  be2: cp(BE, FATHA, 0x062f),
  be3: cp(BE, FATHA, 0x0644),
  te: cp(0x062a, FATHA, 0x0631),
  elifWasla: cp(0x0671, 0x0644),
  hamzaOben: cp(0x0623, FATHA, 0x062f),
};

beforeAll(async () => {
  const formen = await db
    .insert(schema.quranWortform)
    .values(Object.values(WORT).map((textAr) => ({ textAr })))
    .returning({ id: schema.quranWortform.id, textAr: schema.quranWortform.textAr });
  const form = (t: string) => formen.find((f) => f.textAr === t)!.id;
  await db.insert(schema.quranWort).values([
    // vor Cüz 30
    { sure: 2, vers: 5, pos: 1, textAr: WORT.be1, formId: form(WORT.be1) },
    { sure: 2, vers: 6, pos: 3, textAr: WORT.te, formId: form(WORT.te) },
    { sure: 3, vers: 1, pos: 2, textAr: WORT.elifWasla, formId: form(WORT.elifWasla) },
    // Cüz 30 (ab 78:1)
    { sure: 78, vers: 2, pos: 1, textAr: WORT.be2, formId: form(WORT.be2) },
    { sure: 78, vers: 9, pos: 2, textAr: WORT.be2, formId: form(WORT.be2) },
    { sure: 80, vers: 4, pos: 3, textAr: WORT.be3, formId: form(WORT.be3) },
    { sure: 81, vers: 1, pos: 1, textAr: WORT.hamzaOben, formId: form(WORT.hamzaOben) },
  ]);
  await db.insert(schema.quranEinteilung).values({ art: 'cuz', nr: 30, sure: 78, vers: 1 });
});

describe('Elifbe-Beispielwörter', () => {
  it('liefern nur Wörter aus quran_wort, die mit dem Buchstaben beginnen – Cüz 30 zuerst, je Form einmal', async () => {
    const woerter = await ladeBeispielwoerter(BE);
    expect(woerter.map((w) => [w.sure, w.vers, w.pos])).toEqual([
      [78, 2, 1],
      [80, 4, 3],
      [2, 5, 1],
    ]);
    for (const w of woerter) {
      const [zeile] = await db
        .select({ textAr: schema.quranWort.textAr })
        .from(schema.quranWort)
        .where(and(eq(schema.quranWort.sure, w.sure), eq(schema.quranWort.vers, w.vers), eq(schema.quranWort.pos, w.pos)));
      expect(zeile?.textAr).toBe(w.textAr);
      expect(w.textAr.startsWith(cp(BE))).toBe(true);
    }
  });

  it('Elif zählt mit Wasla, die Hamza mit Träger Elif; ohne Treffer bleibt die Liste leer', async () => {
    expect((await ladeBeispielwoerter(0x0627)).map((w) => w.textAr)).toEqual([WORT.elifWasla]);
    expect((await ladeBeispielwoerter(0x0621)).map((w) => w.textAr)).toEqual([WORT.hamzaOben]);
    expect(await ladeBeispielwoerter(0x0638)).toEqual([]);
    expect(await ladeBeispielwoerter(BE, 1)).toHaveLength(1);
  });

  it('die Auswahl der Lehrkraft (elifbe_beispielwort) geht vor und verweist nur auf vorhandene Stellen', async () => {
    await db.insert(schema.elifbeBeispielwort).values([
      { buchstabe: '0628', sure: 2, vers: 5, pos: 1 },
      // Verweis ohne Wort in quran_wort fällt weg
      { buchstabe: '0628', sure: 99, vers: 1, pos: 1 },
    ]);
    expect(await ladeBeispielwoerter(BE)).toEqual([{ sure: 2, vers: 5, pos: 1, textAr: WORT.be1 }]);
  });
});

describe('Elifbe-Audio und Lektionstexte', () => {
  it('ohne Aufnahmen kein Audio (Platzhalter „Aufnahme folgt“)', async () => {
    expect(await ladeElifbeAudio()).toEqual({});
  });

  it('nur freigegebene Lektionstexte (Status geprueft) sind öffentlich', async () => {
    await db.insert(schema.elifbeLektion).values([
      { nr: 1, slug: '1', titel: { de: '[Testtitel geprüft]' }, freigabe: 'geprueft' },
      { nr: 2, slug: '2', titel: { de: '[Testtitel Entwurf]' }, freigabe: 'entwurf' },
      { nr: 3, slug: '3', titel: { de: '[Testtitel zur Prüfung]' }, freigabe: 'zur_pruefung' },
    ]);
    const texte = await ladeLektionstexte();
    expect(Object.keys(texte)).toEqual(['1']);
    expect(texte[1]?.titel.de).toBe('[Testtitel geprüft]');
  });
});
