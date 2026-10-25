import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { eq, sql } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { db as appDb, schema } from '@/lib/db';
import { RICHTUNGEN, type Sprache, zerlegeRichtung } from '@/lib/lernapp/kurse';
import { sha256Hex, textHash } from '@/lib/lernapp/paket/hash';
import { verwaltungsUmgebung } from './hilfen/verwaltung';

/**
 * Testkurs getrennt von den echten Inhalten (Stufe C, Befund L15-1; Z-L15, Z-L20, Z-L21) gegen PGlite: die echten Einheiten
 * der Stufe A1 aller drei Zielsprachen aus `web/inhalte/lernapp` und danach – wie in der E2E-Datenbank bzw. im Bau ohne
 * Datenbank mit `LERNAPP_TESTKURS=1` – der Testkurs mit seinen synthetischen Tönen.
 *
 * - Regression: `<kurs>.a1.e01` ist in jeder Richtung die echte Einheit (Thema, Lektionen); die Testeinheit steht daneben
 *   unter `<kurs>.a1.test`, nur sie verweist auf die Testbündel.
 * - Paketbau: echte Einträge mit demselben Text wie ein Eintrag des Testkurses bekommen keinen Testton; die Testeinheit
 *   behält ihn.
 * - Echte Einträge bekommen nur Clips einer freigegebenen Stimme (Hörabnahme bestanden) oder `mensch:<id>` mit Vereinbarung;
 *   das Audio-Studio zeigt dieselbe wirksame Stimme.
 */
const { client } = await verwaltungsUmgebung();
const { importiereLernapp } = await import('@/lib/lernapp/inhalt/import');
const { lernappTestkurs, testEinheit, testkursClipTexte, TEST_STIMME } = await import('../../drizzle/seeds/lernapp-test');
const { inhaltsdateien, INHALT_WURZEL } = await import('../../scripts/lernapp/inhaltsdateien');
const pakete = await import('@/server/queries/lernapp/pakete');
const { ladeStudio, STUDIO_SEITE } = await import('@/server/queries/lernapp/audio-studio');
const { THORSTEN } = await import('@/lib/lernapp/audio/stimmen');
afterAll(() => client.close());

/** Echte Inhalte der Stufe A1: Sprachdateien und Übersetzungen aller Richtungen. */
const A1 = inhaltsdateien().filter((q) => /^(?:sprache\/(?:de|tr|ar)|uebersetzung\/(?:de|tr|ar)-aus-(?:de|tr|ar))\/a1\//.test(q.pfad));
type Einheit = { einheit: { schluessel: string; thema: Record<string, string> }; lektionen: unknown[] };
const echteE01 = (z: Sprache) => JSON.parse(readFileSync(join(INHALT_WURZEL, 'sprache', z, 'a1', `${z}.a1.e01.json`), 'utf8')) as Einheit;
/** Texte der echten A1-Einträge einer Zielsprache (Lemmata und Sätze). */
const echteTexte = (z: Sprache) =>
  new Set(
    A1.filter((q) => q.pfad.startsWith(`sprache/${z}/`)).flatMap((q) => {
      const d = JSON.parse(q.text) as { lemmata: { lemma: string }[]; saetze: { text: string }[] };
      return [...d.lemmata.map((l) => l.lemma), ...d.saetze.map((s) => s.text)];
    }),
  );

beforeAll(async () => {
  const echt = await importiereLernapp(appDb, A1);
  expect(echt.konflikte).toEqual([]);
  await lernappTestkurs(appDb);
}, 240_000);

describe('Testkurs am eigenen Ort (Stufe C, L15-1)', () => {
  it('Regression: a1.e01 ist in allen sechs Richtungen die echte Einheit; nur die Testeinheit verweist auf Testbündel', async () => {
    for (const richtung of RICHTUNGEN) {
      const { ziel } = zerlegeRichtung(richtung);
      const v = await pakete.verzeichnisVon(richtung, true);
      const echt = echteE01(ziel);
      const e01 = v.einheiten.find((e) => e.schluessel === `${ziel}.a1.e01`);
      expect(e01?.thema, richtung).toEqual(echt.einheit.thema);
      expect(e01?.lektionen, richtung).toBe(echt.lektionen.length);
      const test = v.einheiten.find((e) => e.schluessel === testEinheit(ziel));
      expect(test?.thema.de, richtung).toBe('Testeinheit: Alltag');
      expect(
        test?.audio.map((a) => a.adresse),
        richtung,
      ).toEqual([expect.stringMatching(new RegExp(`^/lern-app/audio/${ziel}/${ziel}\\.a1\\.test-[0-9a-f]{16}\\.lpa$`))]);
      const fremd = v.einheiten.filter((e) => e.schluessel !== testEinheit(ziel) && e.audio.some((a) => a.adresse.includes('.a1.test-')));
      expect(
        fremd.map((e) => e.schluessel),
        richtung,
      ).toEqual([]);
    }
  });

  it('Paketbau: echte Einträge mit gleichem Text bekommen keinen Testton, die Testeinheit behält ihn', async () => {
    for (const richtung of RICHTUNGEN) {
      const { ziel } = zerlegeRichtung(richtung);
      // Testkurs und echte Inhalte teilen Texte (z. B. „Haus“, „üç“, „Su içiyorum.“) – sonst wäre der Test leer
      const geteilt = new Set(testkursClipTexte(ziel).filter((t) => echteTexte(ziel).has(t)));
      expect(geteilt.size, richtung).toBeGreaterThan(0);
      const gebaut = await pakete.baueRichtung(richtung, true);
      let gesehen = 0;
      for (const r of gebaut) {
        const eintraege = Object.values(r.paket.eintraege).filter((x) => x.sprache === ziel);
        if (r.paket.einheit.schluessel === testEinheit(ziel)) {
          const mitTon = eintraege.filter((x) => x.stimme);
          expect(mitTon.length, richtung).toBeGreaterThan(0);
          expect(new Set(mitTon.map((x) => x.stimme)), richtung).toEqual(new Set([TEST_STIMME]));
          expect(r.paket.audio).toHaveLength(1);
          continue;
        }
        gesehen += eintraege.filter((x) => geteilt.has(x.text)).length;
        expect(
          eintraege.filter((x) => x.stimme).map((x) => `${x.text}: ${x.stimme}`),
          `${richtung} ${r.paket.einheit.schluessel}`,
        ).toEqual([]);
        expect(r.paket.audio, `${richtung} ${r.paket.einheit.schluessel}`).toEqual([]);
      }
      expect(gesehen, richtung).toBeGreaterThan(0);
    }
  });

  it('echte Einträge: Sprachausgabe erst nach bestandener Hörabnahme, Mensch nur mit Vereinbarung; Audio-Studio gleich', async () => {
    // drei Lemmata der echten de.a1.e01 (in deren Aufgaben verwendet), ohne Religionsbezug, mit Texten außerhalb des Testkurses
    const eingabe = (await pakete.ladeBauEingaben('de-aus-tr', 'de.a1.e01'))[0]!;
    const texte = [...eingabe.eintraege.values()].map((x) => x.text);
    const [sprachausgabe, mensch, ohne] = [...eingabe.eintraege.values()]
      .filter((x) => x.art === 'lemma' && !x.religionsbezug && !testkursClipTexte('de').includes(x.text))
      .filter((x) => texte.filter((t) => t === x.text).length === 1)
      .map((x) => ({ schluessel: x.schluessel, lemma: x.text }));
    const clip = (text: string, stimme: string, sprecherId: string | null = null) => ({
      sprache: 'de' as const,
      textHash: textHash(text),
      stimme,
      sprecherId,
      buendel: 'de.a1.e01-0123456789abcdef.lpa',
      versatz: 100,
      laenge: 10,
      dauerMs: 500,
      sha256: sha256Hex(`${text}|${stimme}`),
    });
    const [medium] = await appDb
      .insert(schema.medium)
      .values({ schluessel: 'test/vereinbarung-l15.pdf', typ: 'application/pdf', groesse: 1, alt: { de: '[Vereinbarung]' } })
      .returning({ id: schema.medium.id });
    const [sprecher] = await appDb
      .insert(schema.lernappSprecher)
      .values({ name: '[Sprecherin]', vereinbarungMediumId: medium!.id })
      .returning({ id: schema.lernappSprecher.id });
    await appDb.insert(schema.lernappAudio).values([
      clip(sprachausgabe!.lemma, THORSTEN.id),
      clip(mensch!.lemma, `mensch:${sprecher!.id}`, sprecher!.id),
      // menschliche Stimme ohne hinterlegte Sprecherin (keine Vereinbarung): nie ausgeliefert
      clip(ohne!.lemma, 'mensch:00000000-0000-4000-8000-0000000000ff', null),
    ]);
    const audio = async () => (await pakete.ladeBauEingaben('de-aus-tr', 'de.a1.e01'))[0]!.audio;
    const stimme = async (text: string) => (await audio()).get(textHash(text))?.stimme ?? null;
    /** Wirksame Stimme im Audio-Studio: Seite des Eintrags (Filter „alle“, nach Schlüssel wie `ladeStudio`). */
    const wirksam = async (schluessel: string) => {
      const vorher = await appDb.execute<{ n: number }>(sql`
        select count(*)::int as n from (
          select schluessel from lernapp_lemma where kurs_id = 'de' and not religionsbezug and status <> 'gesperrt'
          union all
          select schluessel from lernapp_satz where kurs_id = 'de' and not religionsbezug and status <> 'gesperrt'
        ) t where schluessel < ${schluessel}`);
      const s = await ladeStudio('de', 'alle', Math.floor(vorher.rows[0]!.n / STUDIO_SEITE));
      const e = s.eintraege.find((x) => x.schluessel === schluessel);
      if (!e) throw new Error(`${schluessel} nicht im Studio`);
      return e.wirksam;
    };

    // Hörabnahme offen (LM-06): kein Clip der Sprachausgabe an einem echten Eintrag – „Audio folgt“
    expect(THORSTEN.hoerabnahme).toBe('offen');
    expect(await stimme(sprachausgabe!.lemma)).toBeNull();
    expect(await wirksam(sprachausgabe!.schluessel)).toBeNull();
    // Mensch mit Vereinbarung: ausgeliefert; ohne Vereinbarung nie
    expect(await stimme(mensch!.lemma)).toBe(`mensch:${sprecher!.id}`);
    expect(await wirksam(mensch!.schluessel)).toBe(`mensch:${sprecher!.id}`);
    expect(await stimme(ohne!.lemma)).toBeNull();
    expect(await wirksam(ohne!.schluessel)).toBeNull();
    // Vereinbarung im Papierkorb: die Aufnahme wird nicht mehr ausgeliefert
    await appDb.update(schema.medium).set({ imPapierkorbSeit: new Date() }).where(eq(schema.medium.id, medium!.id));
    expect(await stimme(mensch!.lemma)).toBeNull();
    expect(await wirksam(mensch!.schluessel)).toBeNull();
    await appDb.update(schema.medium).set({ imPapierkorbSeit: null }).where(eq(schema.medium.id, medium!.id));
    // nach bestandener Hörabnahme (nur Mensch, `audio/stimmen.ts`) liefert der Paketbau die Sprachausgabe aus
    THORSTEN.hoerabnahme = 'bestanden';
    try {
      expect(await stimme(sprachausgabe!.lemma)).toBe(THORSTEN.id);
      expect(await wirksam(sprachausgabe!.schluessel)).toBe(THORSTEN.id);
    } finally {
      THORSTEN.hoerabnahme = 'offen';
    }
    // Testtöne erscheinen auch im Studio nie als wirksame Stimme eines echten Eintrags (gleicher Text wie im Testkurs)
    const geteilt = (await pakete.ladeBauEingaben('de-aus-tr'))
      .filter((e) => e.einheit.schluessel !== testEinheit('de'))
      .flatMap((e) => [...e.eintraege.values()])
      .find((x) => testkursClipTexte('de').includes(x.text));
    expect(geteilt).toBeDefined();
    expect(await wirksam(geteilt!.schluessel)).toBeNull();
    expect(await wirksam(`${testEinheit('de')}.w003`)).toBe(TEST_STIMME);
  });
});
