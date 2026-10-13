import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { sql } from 'drizzle-orm';
import { afterAll, describe, expect, it } from 'vitest';
import { schema } from '@/lib/db';
import { leseBukhari, normalisiereArabisch } from '@/lib/hadith/import';
import { verwaltungsUmgebung } from './hilfen/verwaltung';

/**
 * Hadith-Abfragen (AUFTRAG 3.3): Bücher, Buch 1 mit Ankern in der Reihenfolge der Quelle, nur geprüfte Übersetzungen,
 * kuratierte Auswahl und die Suche mit normalisierter arabischer Eingabe. Arabischer Text nur aus der importierten Datei
 * (web/daten/hadith, Bücher 1 und 2 – schneller als die ganze Sammlung); Übersetzungen sind Testplatzhalter.
 */
const { client, db } = await verwaltungsUmgebung();
const { ladeHadithAuswahl, ladeHadithBuch, ladeHadithBuchNummern, ladeHadithBuchTeile, ladeHadithUebersicht } = await import(
  '@/server/queries/hadith'
);
const { sucheHadith } = await import('@/server/queries/suche');
afterAll(() => client.close());

const quelle = leseBukhari(readFileSync(join(import.meta.dirname, '../../daten/hadith/ara-bukhari.json'), 'utf8'));
const hadithe = quelle.hadithe.filter((h) => h.buchNr <= 2);
await db.insert(schema.hadithSammlung).values({
  id: 'bukhari',
  name: { de: 'Sahih al-Bukhari', tr: 'Sahîh-i Buhârî', en: 'Sahih al-Bukhari' },
  quelle: 'fawazahmed0/hadith-api',
  url: 'https://github.com/fawazahmed0/hadith-api',
  version: 'test',
  lizenz: '[Test]',
  sha256: '0'.repeat(64),
});
await db
  .insert(schema.hadithBuch)
  .values(
    quelle.buecher
      .filter((b) => b.nr <= 2)
      .map((b) => ({ sammlungId: 'bukhari', nr: b.nr, titel: { de: '', en: b.titelEn }, hadithVon: b.hadithVon, hadithBis: b.hadithBis })),
  );
await db.insert(schema.hadith).values(hadithe.map((h) => ({ sammlungId: 'bukhari', ...h })));
await db.execute(sql`update hadith set suche = to_tsvector('simple', text_normalisiert)`);
await db.insert(schema.hadithUebersetzung).values([
  {
    sammlungId: 'bukhari',
    nummer: '1',
    sprache: 'de',
    text: '[Testübersetzung geprüft]',
    uebersetzer: '[Test]',
    quelle: '[Test]',
    lizenz: '[Test]',
    freigabe: 'geprueft',
  },
  {
    sammlungId: 'bukhari',
    nummer: '2',
    sprache: 'de',
    text: '[Testübersetzung Entwurf]',
    uebersetzer: '[Test]',
    quelle: '[Test]',
    lizenz: '[Test]',
    freigabe: 'entwurf',
  },
  {
    sammlungId: 'bukhari',
    nummer: '3',
    sprache: 'tr',
    text: '[Test zur Prüfung]',
    uebersetzer: '[Test]',
    quelle: '[Test]',
    lizenz: '[Test]',
    freigabe: 'zur_pruefung',
  },
]);

/** Ein Wort aus Hadith 1, das in den Testbüchern genau einmal vorkommt (aus der Quelle gewählt, nicht ausgedacht). */
function seltenesWort(nummer: string): string {
  const h = hadithe.find((x) => x.nummer === nummer)!;
  // nur Buchstaben und Harakat (keine Satzzeichen), mindestens vier Buchstaben
  const woerter = h.textAr.split(/\s+/).filter((w) => /^[\u0621-\u065f\u0670]+$/.test(w) && normalisiereArabisch(w).length >= 4);
  const kern = (w: string) => normalisiereArabisch(w).replace(/[^\u0621-\u064a]/g, '');
  const zahl = (w: string) => hadithe.filter((x) => x.textNormalisiert.split(' ').some((t) => kern(t) === kern(w))).length;
  const wort = woerter.find((w) => zahl(w) === 1);
  if (!wort) throw new Error('Kein seltenes Wort gefunden');
  return wort;
}

describe('Hadith-Abfragen', () => {
  it('Übersicht: Sammlung, Bücher mit Anzahl, geprüfte Übersetzungen je Sprache, leere Auswahl', async () => {
    const u = await ladeHadithUebersicht();
    expect(u.sammlung?.name.tr).toBe('Sahîh-i Buhârî');
    expect(u.buecher.map((b) => b.nr)).toEqual([1, 2]);
    expect(u.buecher[0]).toMatchObject({ nr: 1, titelEn: 'Revelation', anzahl: 7 });
    expect(u.gesamt).toBe(hadithe.length);
    expect(u.geprueft).toEqual({ de: 1, tr: 0, en: 0 });
    expect(u.auswahlAnzahl).toBe(0);
    expect(await ladeHadithBuchNummern()).toEqual([1, 2]);
  });

  it('Buch 1: sieben Hadithe in der Reihenfolge der Quelle, Text unverändert, Blättern', async () => {
    const b = await ladeHadithBuch(1);
    expect(b?.hadithe.map((h) => h.nummer)).toEqual(['1', '2', '3', '4', '5', '6', '7']);
    expect(b?.hadithe.map((h) => h.imBuchNr)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(b).toMatchObject({ teil: 1, teile: 1 });
    expect(b?.hadithe.every((h) => h.teil === 1)).toBe(true);
    expect(await ladeHadithBuch(1, 2)).toBeNull();
    expect(await ladeHadithBuchTeile()).toEqual([]);
    expect(b?.hadithe[0].textAr).toBe(hadithe.find((h) => h.nummer === '1')!.textAr);
    expect(b?.vorher).toBeNull();
    expect(b?.naechstes).toMatchObject({ nr: 2, titelEn: 'Belief' });
    expect((await ladeHadithBuch(2))?.vorher?.nr).toBe(1);
  });

  it('nur geprüfte Übersetzungen verlassen die Datenbank', async () => {
    const b = await ladeHadithBuch(1);
    expect(b?.hadithe[0].uebersetzungen).toEqual([
      expect.objectContaining({ sprache: 'de', text: '[Testübersetzung geprüft]', freigabe: 'geprueft' }),
    ]);
    expect(b?.hadithe[1].uebersetzungen).toEqual([]);
    expect(b?.hadithe[2].uebersetzungen).toEqual([]);
  });

  it('unbekannte oder ungültige Bücher: null', async () => {
    for (const nr of [0, -1, 1.5, 3, 97]) expect(await ladeHadithBuch(nr)).toBeNull();
  });

  it('Auswahl in fester Reihenfolge; Verweise ohne Hadith fallen weg', async () => {
    await db.insert(schema.hadithAuswahl).values([
      { liste: 'auswahl', sammlungId: 'bukhari', nummer: '9', reihenfolge: 2 },
      { liste: 'auswahl', sammlungId: 'bukhari', nummer: '1', reihenfolge: 1 },
      { liste: 'auswahl', sammlungId: 'bukhari', nummer: '99999', reihenfolge: 3 },
      { liste: 'des-tages', sammlungId: 'bukhari', nummer: '5', reihenfolge: 0 },
    ]);
    const a = await ladeHadithAuswahl();
    expect(a.hadithe.map((h) => h.nummer)).toEqual(['1', '9']);
    expect(a.hadithe[0].uebersetzungen.map((u) => u.text)).toEqual(['[Testübersetzung geprüft]']);
    expect((await ladeHadithAuswahl('des-tages')).hadithe.map((h) => h.nummer)).toEqual(['5']);
  });
});

describe('Hadith-Suche', () => {
  it('arabische Eingabe mit und ohne Harakat findet denselben Hadith; Ausschnitt markiert das Wort im Original', async () => {
    const wort = seltenesWort('1');
    const mit = await sucheHadith(wort);
    const ohne = await sucheHadith(normalisiereArabisch(wort));
    expect(mit.map((t) => t.nummer)).toEqual(['1']);
    expect(ohne.map((t) => t.nummer)).toEqual(['1']);
    expect(mit[0]).toMatchObject({ buchNr: 1, imBuchNr: 1 });
    expect(mit[0].rang).toBeGreaterThan(0);
    expect(mit[0].ausschnitt.teile.filter((t) => t.treffer).map((t) => t.text)).toEqual([wort]);
  });

  it('Nummernsuche, lateinische Eingabe und Sonderzeichen', async () => {
    expect((await sucheHadith('Bukhari 3')).map((t) => t.nummer)).toEqual(['3']);
    expect((await sucheHadith('12')).map((t) => t.nummer)).toEqual(['12']);
    expect(await sucheHadith('12345')).toEqual([]);
    expect(await sucheHadith('Gebet')).toEqual([]);
    expect(await sucheHadith("'; drop table hadith; --")).toEqual([]);
    expect((await db.select().from(schema.hadith)).length).toBe(hadithe.length);
  });
});

describe('Lange Bücher in Teilen zu je 100 Hadithen', () => {
  // Buch 4 der Quelle hat mehr als 100 Hadithe; erst nach der Suche eingefügt, damit deren Erwartungen gelten
  const buch4 = quelle.hadithe.filter((h) => h.buchNr === 4);

  it('Teil 1 und 2, Teil jenseits des Buchs null, Teile für Seiten und Sitemap', async () => {
    expect(buch4.length).toBeGreaterThan(100);
    expect(buch4.length).toBeLessThanOrEqual(200);
    const b = quelle.buecher.find((x) => x.nr === 4)!;
    await db
      .insert(schema.hadithBuch)
      .values({ sammlungId: 'bukhari', nr: 4, titel: { de: '', en: b.titelEn }, hadithVon: b.hadithVon, hadithBis: b.hadithBis });
    await db.insert(schema.hadith).values(buch4.map((h) => ({ sammlungId: 'bukhari', ...h })));
    const eins = await ladeHadithBuch(4);
    const zwei = await ladeHadithBuch(4, 2);
    expect(eins).toMatchObject({ teil: 1, teile: 2, buch: { nr: 4, anzahl: buch4.length } });
    expect(eins?.hadithe.map((h) => h.nummer)).toEqual(buch4.slice(0, 100).map((h) => h.nummer));
    expect(zwei?.hadithe.map((h) => h.nummer)).toEqual(buch4.slice(100).map((h) => h.nummer));
    expect(zwei?.hadithe.every((h) => h.teil === 2)).toBe(true);
    expect(zwei?.vorher?.nr).toBe(2);
    expect(await ladeHadithBuch(4, 3)).toBeNull();
    expect(await ladeHadithBuch(4, 0)).toBeNull();
    expect(await ladeHadithBuchTeile()).toEqual([{ nr: 4, teile: 2 }]);
  });

  it('Auswahl und Suche kennen den Teil, auf dem der Hadith steht', async () => {
    const vorn = buch4[0].nummer;
    const hinten = buch4[100].nummer;
    await db.insert(schema.hadithAuswahl).values([
      { liste: 'teile', sammlungId: 'bukhari', nummer: hinten, reihenfolge: 1 },
      { liste: 'teile', sammlungId: 'bukhari', nummer: vorn, reihenfolge: 2 },
      { liste: 'teile', sammlungId: 'bukhari', nummer: '1', reihenfolge: 3 },
    ]);
    const a = await ladeHadithAuswahl('teile');
    expect(a.hadithe.map((h) => [h.nummer, h.teil])).toEqual([
      [hinten, 2],
      [vorn, 1],
      ['1', 1],
    ]);
    expect((await sucheHadith(hinten)).map((t) => [t.nummer, t.teil])).toEqual([[hinten, 2]]);
    expect((await sucheHadith(vorn)).map((t) => [t.nummer, t.teil])).toEqual([[vorn, 1]]);
  });
});
