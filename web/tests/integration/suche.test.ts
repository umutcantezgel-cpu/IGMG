import { afterAll, describe, expect, it } from 'vitest';
import { schema } from '@/lib/db';
import { verwaltungsUmgebung } from './hilfen/verwaltung';

/** D-S1 (ADR 0013): Volltext je Sprache, nur Sichtbares, Ausschnitt mit Marken statt HTML, Eingabe bereinigt. */
const { client, db } = await verwaltungsUmgebung();
const { suche, bereinigeSuche, teilwortMuster, MARKE_AN, MARKE_AUS } = await import('@/server/queries/suche');
afterAll(() => client.close());

const gestern = new Date(Date.now() - 86_400_000);
await db.insert(schema.nachricht).values([
  {
    slug: 'gebetsraum-renoviert',
    titel: { de: 'Gebetsraum renoviert', tr: 'Namaz salonu yenilendi' },
    klartext: { de: 'Der Gebetsraum wurde renoviert und hat neue Teppiche.', tr: 'Namaz salonu yenilendi ve yeni halılar serildi.' },
    status: 'veroeffentlicht',
    veroeffentlichtAm: gestern,
  },
  { slug: 'entwurf-teppiche', titel: { de: 'Entwurf Teppiche' }, klartext: { de: 'Teppiche im Entwurf' }, status: 'entwurf' },
  {
    slug: 'papierkorb-teppiche',
    titel: { de: 'Alt Teppiche' },
    klartext: { de: 'Teppiche im Papierkorb' },
    status: 'veroeffentlicht',
    veroeffentlichtAm: gestern,
    imPapierkorbSeit: new Date(),
  },
  {
    slug: 'geplant-teppiche',
    titel: { de: 'Geplant Teppiche' },
    klartext: { de: 'Teppiche später' },
    status: 'veroeffentlicht',
    veroeffentlichtAm: new Date(Date.now() + 86_400_000),
  },
]);
await db.insert(schema.wissenThema).values([
  {
    slug: 'gebet',
    kategorie: 'gebet',
    titel: { de: 'Das Gebet' },
    klartext: { de: 'Fünf tägliche Gebete und der Teppich als Gebetsplatz.' },
    status: 'veroeffentlicht',
    freigabe: 'geprueft',
  },
  // F-40: öffentlich nur religiös geprüfte Wissensthemen – „zur Prüfung“ erscheint in der Suche nicht
  {
    slug: 'testthema-teppich',
    kategorie: 'thema',
    titel: { de: 'Testthema Teppich' },
    klartext: { de: 'Testthema Teppich' },
    status: 'veroeffentlicht',
    freigabe: 'zur_pruefung',
  },
]);

describe('Suche', () => {
  it('findet veröffentlichte Inhalte (Stammformen, deutsch), nie Entwürfe, Papierkorb oder Geplantes', async () => {
    const t = await suche('Teppich', 'de');
    expect(t.map((x) => x.slug).sort()).toEqual(['gebet', 'gebetsraum-renoviert']);
    expect(t.every((x) => x.rang > 0)).toBe(true);
    const n = t.find((x) => x.slug === 'gebetsraum-renoviert')!;
    expect(n).toMatchObject({ art: 'nachricht', titel: 'Gebetsraum renoviert' });
    expect(n.ausschnitt).toContain(`${MARKE_AN}Teppiche${MARKE_AUS}`);
    expect(n.ausschnitt).not.toMatch(/<\/?b>/);
  });

  it('findet Teile zusammengesetzter Wörter (F-14), Volltext-Treffer zuerst', async () => {
    const t = await suche('Gebet', 'de');
    expect(t.map((x) => x.slug)).toEqual(['gebet', 'gebetsraum-renoviert']);
    expect(t[0]!.rang).toBeGreaterThan(0);
    expect(t[1]!.rang).toBe(0);
    expect((await suche('raum', 'de')).map((x) => x.slug)).toEqual(['gebetsraum-renoviert']);
    // nie Entwürfe, Papierkorb oder Geplantes – auch nicht über den Teilwort-Abgleich
    expect((await suche('eppich', 'de')).map((x) => x.slug).sort()).toEqual(['gebet', 'gebetsraum-renoviert']);
  });

  it('Teilwort-Abgleich nur für ein Wort ab 3 Zeichen; Platzhalter maskiert', async () => {
    expect(teilwortMuster('Gebet')).toBe('%Gebet%');
    expect(teilwortMuster('ab')).toBeNull();
    expect(teilwortMuster('neue Teppiche')).toBeNull();
    expect(teilwortMuster('"Gebet"')).toBeNull();
    expect(teilwortMuster('-Gebet')).toBeNull();
    expect(teilwortMuster('50%_\\x')).toBe('%50\\%\\_\\\\x%');
    expect(await suche('%%%', 'de')).toEqual([]);
    expect(await suche('___', 'de')).toEqual([]);
  });

  it('türkisch sucht im türkischen Text, Titel in der Sprache', async () => {
    const t = await suche('halılar', 'tr');
    expect(t).toHaveLength(1);
    expect(t[0]).toMatchObject({ slug: 'gebetsraum-renoviert', titel: 'Namaz salonu yenilendi' });
  });

  it('Sonderzeichen und SQL-artige Eingaben sind harmlos; zu kurz oder leer → keine Treffer', async () => {
    expect(await suche("'; drop table nachricht; --", 'de')).toEqual([]);
    expect(await suche('"neue Teppiche" -Papierkorb', 'de')).toHaveLength(1);
    expect(await suche('a', 'de')).toEqual([]);
    expect(bereinigeSuche(`  x\u0000y  ${'z'.repeat(200)}`)).toHaveLength(100);
    expect(bereinigeSuche(42)).toBe('');
    expect((await db.select().from(schema.nachricht)).length).toBe(4);
  });
});
