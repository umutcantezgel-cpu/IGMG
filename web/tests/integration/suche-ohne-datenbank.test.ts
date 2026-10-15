import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { sql } from 'drizzle-orm';
import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';
import { schema, type Datenbank } from '@/lib/db';
import { leseBukhari } from '@/lib/hadith/import';
import { leseMetadaten } from '@/lib/quran/metadaten';
import { verwaltungsUmgebung } from './hilfen/verwaltung';

/**
 * Suche ohne Laufzeit-Datenbank (Endprüfung Stufe C, Kleinigkeiten: live immer „Keine Treffer“, `suche.ts:66-67`, `:117`).
 * Geprüft: (1) der beim Bau erzeugte Titel-Index nimmt nur Öffentliches auf (wie die Volltextsuche und die Seiten),
 * die Hadith-Zuordnung kennt Buch, Stelle und Teil; (2) `sucheFuerSeite` sucht mit Datenbank unverändert im Volltext –
 * auch wenn eine Index-Datei daliegt – und ohne Datenbank im Index; ohne Index meldet sie „ohne“ statt „Keine Treffer“.
 * Arabische Namen und Texte nur aus web/daten; alle übrigen Testdaten fiktiv.
 */
const { client, db } = await verwaltungsUmgebung();
const { baueSuchIndex: baue } = await import('@/lib/suche/titelindex-bau');
/** Die Test-Datenbank (PGlite) hat denselben Abfrage-Aufbau wie `Datenbank` (PostgreSQL), nur andere Ergebnistypen. */
const baueSuchIndex = (d: typeof db, o: { hadith: boolean }) => baue(d as unknown as Datenbank, o);
const { pruefeSuchIndex } = await import('@/lib/suche/titelindex');
const { suche, sucheHadith, sucheFuerSeite } = await import('@/server/queries/suche');
const ordner = mkdtempSync(join(tmpdir(), 'igmg-suchindex-'));
afterAll(() => {
  rmSync(ordner, { recursive: true, force: true });
  return client.close();
});
afterEach(() => {
  vi.unstubAllEnvs();
});

const gestern = new Date(Date.now() - 86_400_000);
const morgen = new Date(Date.now() + 86_400_000);
await db.insert(schema.nachricht).values([
  { slug: 'gebetsraum-renoviert', titel: { de: 'Gebetsraum renoviert' }, klartext: { de: 'Neue Teppiche.' }, status: 'veroeffentlicht', veroeffentlichtAm: gestern },
  { slug: 'entwurf-gebet', titel: { de: 'Entwurf Gebet' }, status: 'entwurf' },
  { slug: 'papierkorb-gebet', titel: { de: 'Alt Gebet' }, status: 'veroeffentlicht', veroeffentlichtAm: gestern, imPapierkorbSeit: new Date() },
  { slug: 'geplant-gebet', titel: { de: 'Geplant Gebet' }, status: 'veroeffentlicht', veroeffentlichtAm: morgen },
]);
await db.insert(schema.wissenThema).values([
  { slug: 'gebet', kategorie: 'gebet', titel: { de: 'Das Gebet' }, klartext: { de: 'Fünf Gebete.' }, status: 'veroeffentlicht' },
  { slug: 'entwurf-thema', kategorie: 'gebet', titel: { de: 'Gebet Entwurf' }, status: 'entwurf' },
]);
await db.insert(schema.seite).values([
  { slugDe: 'jugendraum', slugTr: 'genclik-odasi', titel: { de: 'Jugendraum' }, status: 'veroeffentlicht' },
  { slugDe: 'spaeter', titel: { de: 'Später' }, status: 'veroeffentlicht', veroeffentlichenAm: morgen },
  { slugDe: 'entwurf-seite', titel: { de: 'Entwurf' }, status: 'entwurf' },
]);
// Suren 1 und 2 aus den Tanzil-Metadaten (web/daten)
const meta = leseMetadaten(readFileSync(join(import.meta.dirname, '../../daten/tanzil/quran-data.xml'), 'utf8')).suren.slice(0, 2);
await db.insert(schema.quranQuelle).values({ id: 'tanzil', bezeichnung: '[Quelle]', url: 'https://example.test', version: 'test', sha256: '0'.repeat(64), lizenz: '[Lizenz]' });
await db
  .insert(schema.quranSure)
  .values(meta.map((m) => ({ nr: m.nr, nameAr: m.nameAr, verseAnzahl: m.verse, quelleId: 'tanzil', nameUmschrift: m.umschrift })));
// Bücher 1–4 von Sahih al-Bukhari aus web/daten (Buch 4 hat mehr als 100 Hadithe: zwei Teile)
const quelle = leseBukhari(readFileSync(join(import.meta.dirname, '../../daten/hadith/ara-bukhari.json'), 'utf8'));
await db.insert(schema.hadithSammlung).values({
  id: 'bukhari',
  name: { de: 'Sahih al-Bukhari' },
  quelle: '[Quelle]',
  url: 'https://example.test',
  version: 'test',
  lizenz: '[Lizenz]',
  sha256: '0'.repeat(64),
});
await db
  .insert(schema.hadithBuch)
  .values(quelle.buecher.filter((b) => b.nr <= 4).map((b) => ({ sammlungId: 'bukhari', nr: b.nr, titel: { de: '', en: b.titelEn }, hadithVon: b.hadithVon, hadithBis: b.hadithBis })));
const hadithe = quelle.hadithe.filter((h) => h.buchNr <= 4);
await db.insert(schema.hadith).values(hadithe.map((h) => ({ sammlungId: 'bukhari', ...h })));
await db.execute(sql`update hadith set suche = to_tsvector('simple', text_normalisiert)`);
const buch4 = hadithe.filter((h) => h.buchNr === 4).sort((a, b) => a.sortierung - b.sortierung);

describe('Titel-Index aus der Bau-Datenbank', () => {
  it('nur Veröffentlichtes, nicht im Papierkorb, nicht vor dem Datum; keine Texte', async () => {
    const index = await baueSuchIndex(db, { hadith: true });
    expect(pruefeSuchIndex(JSON.parse(JSON.stringify(index)))).not.toBeNull();
    const titel = (art: string) => index.eintraege.filter((e) => e.art === art).map((e) => ('slug' in e ? e.slug : 'slugs' in e ? e.slugs.de : e.nr));
    expect(titel('nachricht')).toEqual(['gebetsraum-renoviert']);
    expect(titel('wissen')).toEqual(['gebet']);
    expect(titel('seite')).toEqual(['jugendraum']);
    expect(titel('sure')).toEqual([1, 2]);
    expect(titel('hadithBuch')).toEqual([1, 2, 3, 4]);
    // keine Inhalte außer Titeln: weder Klartext noch Hadithtext
    const text = JSON.stringify(index);
    expect(text).not.toContain('Teppiche');
    expect(text).not.toContain(hadithe[0].textAr.slice(0, 20));
  });

  it('Hadith-Zuordnung: alle Nummern je Buch in der Reihenfolge der Quelle; ohne Gesamtsammlung keine', async () => {
    const index = await baueSuchIndex(db, { hadith: true });
    const anzahl = index.hadith?.buecher.reduce((n, [, l]) => n + l.length, 0);
    expect(anzahl).toBe(hadithe.length);
    expect(index.hadith?.buecher.find(([nr]) => nr === 4)?.[1].map(([n]) => n)).toEqual(buch4.map((h) => h.nummer));
    const ohne = await baueSuchIndex(db, { hadith: false });
    expect(ohne.hadith).toBeNull();
    expect(ohne.eintraege.some((e) => e.art === 'hadithBuch')).toBe(false);
  });
});

describe('sucheFuerSeite: mit Datenbank unverändert', () => {
  it('Volltext und Hadith-Suche wie bisher, auch wenn eine Index-Datei daliegt', async () => {
    const datei = join(ordner, 'mit-db.json');
    writeFileSync(datei, JSON.stringify(await baueSuchIndex(db, { hadith: true })));
    vi.stubEnv('SUCHINDEX_DATEI', datei);
    const e = await sucheFuerSeite({ begriff: 'Gebet', sprache: 'de', hadithAn: true, nurHadith: false, feste: () => [{ titel: 'Gebetszeiten', href: '/gebetszeiten' }] });
    expect(e.modus).toBe('datenbank');
    if (e.modus !== 'datenbank') return;
    expect(e).toEqual({ modus: 'datenbank', hadithFilter: true, treffer: await suche('Gebet', 'de'), hadith: await sucheHadith('Gebet') });
    expect(e.treffer.map((t) => t.slug)).toEqual(['gebet', 'gebetsraum-renoviert']);

    const n = await sucheFuerSeite({ begriff: 'Bukhari 3', sprache: 'de', hadithAn: true, nurHadith: true });
    expect(n).toEqual({ modus: 'datenbank', hadithFilter: true, treffer: [], hadith: await sucheHadith('Bukhari 3') });
    expect(n.modus === 'datenbank' && n.hadith[0].ausschnitt.teile.length).toBeGreaterThan(0);
    // Schalter aus: kein Filter, keine Hadith-Treffer (wie bisher)
    expect(await sucheFuerSeite({ begriff: 'Bukhari 3', sprache: 'de', hadithAn: false, nurHadith: true })).toMatchObject({
      modus: 'datenbank',
      hadithFilter: false,
      hadith: [],
    });
  });
});

describe('sucheFuerSeite: ohne Laufzeit-Datenbank (Beispielmodus)', () => {
  function ohneDatenbank(datei: string) {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('DATABASE_URL', '');
    vi.stubEnv('BAU_PGLITE', '');
    vi.stubEnv('SUCHINDEX_DATEI', datei);
  }

  it('Titel aus dem Index, feste Seiten, Nummernsuche zum Hadith mit Teil', async () => {
    const datei = join(ordner, 'ohne-db.json');
    writeFileSync(datei, JSON.stringify(await baueSuchIndex(db, { hadith: true })));
    ohneDatenbank(datei);
    const feste = () => [{ titel: 'Gebetszeiten', href: '/gebetszeiten' }];
    const e = await sucheFuerSeite({ begriff: 'Gebet', sprache: 'de', hadithAn: true, nurHadith: false, feste });
    expect(e).toMatchObject({ modus: 'titel', hadithFilter: true, hadith: [] });
    expect(e.modus === 'titel' && e.titel.map((t) => [t.art, t.titel])).toEqual([
      ['seite', 'Gebetszeiten'],
      ['nachricht', 'Gebetsraum renoviert'],
      ['wissen', 'Das Gebet'],
    ]);
    const hinten = buch4[100];
    const n = await sucheFuerSeite({ begriff: `Bukhari ${hinten.nummer}`, sprache: 'de', hadithAn: true, nurHadith: true });
    expect(n).toMatchObject({ modus: 'titel', titel: [], hadith: [{ nummer: hinten.nummer, buchNr: 4, teil: 2 }] });
    // dieselbe Stelle wie die Volltextsuche mit Datenbank
    vi.unstubAllEnvs();
    const mitDb = await sucheHadith(hinten.nummer);
    expect(n.modus === 'titel' && n.hadith[0]).toMatchObject({ buchNr: mitDb[0].buchNr, imBuchNr: mitDb[0].imBuchNr, teil: mitDb[0].teil });
  });

  it('Filter „Hadith“ nur mit Hadith-Daten im Index und eingeschalteter Sammlung', async () => {
    const datei = join(ordner, 'ohne-hadith.json');
    writeFileSync(datei, JSON.stringify(await baueSuchIndex(db, { hadith: false })));
    ohneDatenbank(datei);
    expect(await sucheFuerSeite({ begriff: 'Bukhari 1', sprache: 'de', hadithAn: true, nurHadith: true })).toMatchObject({
      modus: 'titel',
      hadithFilter: false,
      hadith: [],
    });
  });

  it('ohne Index-Datei: Modus „ohne“ (Hinweis statt „Keine Treffer“), kein Hadith-Filter', async () => {
    ohneDatenbank(join(ordner, 'fehlt.json'));
    expect(await sucheFuerSeite({ begriff: 'Gebet', sprache: 'de', hadithAn: true, nurHadith: false })).toEqual({
      modus: 'ohne',
      hadithFilter: false,
    });
  });
});
