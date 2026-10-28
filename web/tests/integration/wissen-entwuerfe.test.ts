import { and, asc, eq } from 'drizzle-orm';
import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';
import type { Datenbank } from '@/lib/db';
import { schema } from '@/lib/db';
import type { Pruefung } from '@/lib/startklar/pruefungen';
import { KI_ENTWURF_VERFASSER, KI_ENTWURF_VERMERK } from '@/lib/wissen/entwurf';
import { angemeldetAls, aufrufe, formular, verwaltungsUmgebung } from './hilfen/verwaltung';

/**
 * Religiöse Erklärtexte als gekennzeichneter Entwurf (Plan Marktstart P5, ADR 0047, Nutzerentscheidung E-044 Nr. 5):
 * Der Seed „wissen-entwuerfe“ legt vier KI-Entwürfe „zur Prüfung“ an. Schalter `website_wissen_vorschau` aus (Standard der
 * Tests, `hilfen/umgebung.ts`) → nur die zwölf geprüften Bestandsthemen (wie `verwaltung-wissen.test.ts`); an → 16 Themen,
 * vier davon als Entwurf gekennzeichnet (Übersicht, Themenseite, Suche, Titel-Index). Die Freigabe durch die religiöse
 * Prüfung entfernt die Kennzeichnung, „Zurückweisen“ nimmt den Text sofort von der Website; die Warteschlange zeigt die
 * Entwürfe; Änderungen der Redaktion an einem sichtbaren Entwurf erneuern den Cache.
 */
const { client, db } = await verwaltungsUmgebung();
const oeffentlich = await import('@/server/queries/wissen');
const { suche } = await import('@/server/queries/suche');
const { ladeWarteschlange, ladeVerlauf } = await import('@/server/queries/verwaltung/freigaben');
const { entscheideFreigabe } = await import('@/server/actions/freigaben');
const aktionen = await import('@/server/actions/wissen');
const { gemeindePruefen } = await import('@/lib/startklar/gemeinde');
const { baueSuchIndex } = await import('@/lib/suche/titelindex-bau');
const { seed: seedWissen } = await import('../../drizzle/seeds/bereiche/wissen');
const { seed: seedEntwuerfe, WISSEN_ENTWUERFE } = await import('../../drizzle/seeds/bereiche/wissen-entwuerfe');
afterAll(() => client.close());
afterEach(() => {
  vi.unstubAllEnvs();
});

const ENTWUERFE = ['hajj-umrah', 'islamic-calendar', 'zakat-fitra-qurban', 'friday-prayer'];
const PRUEFUNG = [{ rolle: 'religioese_pruefung' as const }];
const REDAKTION = [{ rolle: 'redaktion' as const }];
const vorschauAn = () => vi.stubEnv('FUNKTION_WEBSITE_WISSEN_VORSCHAU', 'an');
const sichtbar = async () => (await oeffentlich.ladeWissensThemen()).map((t) => t.slug);
const zeile = async (slug: string) => (await db.select().from(schema.wissenThema).where(eq(schema.wissenThema.slug, slug)))[0]!;
const entscheide = (id: string, entscheidung: 'freigeben' | 'zurueckweisen', kommentar = '') =>
  entscheideFreigabe({}, formular({ inhaltTyp: 'wissen_thema', inhaltId: id, entscheidung, kommentar })).catch((e: { ziel?: string }) => ({
    ziel: e.ziel,
  }));
const absatz = (text: string) => JSON.stringify({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text }] }] });

async function cockpit(env: Record<string, string | undefined>): Promise<Pruefung | undefined> {
  const liste: Pruefung[] = [];
  await gemeindePruefen(db as unknown as Datenbank, env, true, new Date(), (p) => liste.push(p));
  return liste.find((p) => p.id === 'gemeinde.wissen-vorschau');
}

describe('Seed „wissen-entwuerfe“', () => {
  it('nach „wissen“: vier Themen zur Prüfung mit KI-Vermerk, Antrag im Freigabe-Verlauf und erster Fassung; idempotent', async () => {
    expect(await seedWissen(db as never)).toBe(13);
    expect(await seedEntwuerfe(db as never)).toBe(4);
    expect(await seedEntwuerfe(db as never)).toBe(0);
    const zeilen = await db
      .select()
      .from(schema.wissenThema)
      .where(eq(schema.wissenThema.verfasstVon, KI_ENTWURF_VERFASSER))
      .orderBy(asc(schema.wissenThema.sortierung));
    expect(zeilen.map((z) => [z.slug, z.sortierung, z.status, z.freigabe, z.istBeispiel])).toEqual(
      ENTWUERFE.map((s, i) => [s, 13 + i, 'veroeffentlicht', 'zur_pruefung', true]),
    );
    for (const z of zeilen) {
      expect(z.quelle).toContain('https://www.igmg');
      expect(z.klartext.de).toContain(z.titel.de);
      expect(z.klartext.tr).toBeTruthy();
      expect(z.klartext.en).toBeTruthy();
      const verlauf = await db
        .select()
        .from(schema.freigabe)
        .where(and(eq(schema.freigabe.inhaltTyp, 'wissen_thema'), eq(schema.freigabe.inhaltId, z.id)));
      expect(verlauf).toMatchObject([{ art: 'religioes', status: 'zur_pruefung', von: null, kommentar: KI_ENTWURF_VERMERK }]);
      const fassungen = await db
        .select()
        .from(schema.revision)
        .where(and(eq(schema.revision.inhaltTyp, 'wissen_thema'), eq(schema.revision.inhaltId, z.id)));
      expect(fassungen).toHaveLength(1);
      expect(fassungen[0]).toMatchObject({ kommentar: KI_ENTWURF_VERFASSER, inhalt: { slug: z.slug, freigabe: 'zur_pruefung' } });
    }
    expect(WISSEN_ENTWUERFE).toHaveLength(4);
  });
});

describe('Schalter website_wissen_vorschau', () => {
  it('aus (Standard der Tests): nur die zwölf geprüften Themen – Übersicht, Themenseite, Adressen, Suche, Titel-Index', async () => {
    const themen = await oeffentlich.ladeWissensThemen();
    expect(themen).toHaveLength(12);
    expect(themen.every((t) => !t.entwurf && !t.kiEntwurf)).toBe(true);
    for (const s of ENTWUERFE) expect(await oeffentlich.ladeWissensThema(s)).toBeNull();
    expect(await oeffentlich.ladeWissensSlugs()).toHaveLength(12);
    expect((await suche('Zakat', 'de')).filter((t) => t.art === 'wissen')).toEqual([]);
    const index = await baueSuchIndex(db as unknown as Datenbank, { hadith: false });
    expect(index.eintraege.filter((e) => e.art === 'wissen')).toHaveLength(12);
    expect(await cockpit({ FUNKTION_WEBSITE_WISSEN_VORSCHAU: 'aus' })).toMatchObject({ status: 'ok' });
  });

  it('an: 16 Themen, die vier Entwürfe am Ende und gekennzeichnet; Themenseite, Suche und Titel-Index finden sie', async () => {
    vorschauAn();
    const themen = await oeffentlich.ladeWissensThemen();
    expect(themen).toHaveLength(16);
    expect(themen.slice(12).map((t) => t.slug)).toEqual(ENTWUERFE);
    expect(themen.filter((t) => t.entwurf).map((t) => t.slug)).toEqual(ENTWUERFE);
    expect(themen.filter((t) => t.kiEntwurf)).toHaveLength(4);
    expect(themen.slice(0, 12).every((t) => !t.entwurf)).toBe(true);
    expect(await oeffentlich.ladeWissensThema('hajj-umrah')).toMatchObject({ slug: 'hajj-umrah', entwurf: true, kiEntwurf: true });
    expect(await oeffentlich.ladeWissensSlugs()).toHaveLength(16);
    const treffer = (await suche('Zakat', 'de')).filter((t) => t.art === 'wissen');
    expect(treffer.map((t) => [t.slug, t.entwurf])).toContainEqual(['zakat-fitra-qurban', true]);
    expect((await suche('Arafat', 'tr')).find((t) => t.slug === 'hajj-umrah')).toMatchObject({ entwurf: true, titel: 'Hac ve Umre' });
    const index = await baueSuchIndex(db as unknown as Datenbank, { hadith: false, wissenEntwuerfe: true });
    expect(index.eintraege.filter((e) => e.art === 'wissen')).toHaveLength(16);
    expect(await cockpit({ FUNKTION_WEBSITE_WISSEN_VORSCHAU: 'an' })).toMatchObject({
      status: 'hinweis',
      meldung: expect.stringContaining('4 Wissensthemen sind als „Entwurf zur Prüfung'),
    });
  });

  it('ohne Umgebung gilt die Einstellung „funktionen“ (Cockpit/Datenbank); die Umgebung schlägt sie', async () => {
    vi.stubEnv('FUNKTION_WEBSITE_WISSEN_VORSCHAU', undefined);
    // Standard außerhalb der Produktion und in der Produktion: an (Nutzerentscheidung)
    expect(await sichtbar()).toHaveLength(16);
    await db.insert(schema.einstellung).values({ schluessel: 'funktionen', wert: { website_wissen_vorschau: false } });
    expect(await sichtbar()).toHaveLength(12);
    vorschauAn();
    expect(await sichtbar()).toHaveLength(16);
    await db.delete(schema.einstellung).where(eq(schema.einstellung.schluessel, 'funktionen'));
  });
});

describe('Freigabe über die Warteschlange (ADR 0030)', () => {
  it('die Warteschlange zeigt die vier Entwürfe mit allen Sprachen und Adresse', async () => {
    const eintraege = (await ladeWarteschlange()).filter((e) => e.inhaltTyp === 'wissen_thema');
    expect(eintraege.map((e) => e.titel)).toEqual([
      'Hadsch und Umra',
      'Islamischer Kalender, Feste und gesegnete Nächte',
      'Zakat, Fitra, Fidya und Kurban',
      'Freitagsgebet und Freitagspredigt',
    ]);
    const hadsch = eintraege[0]!;
    expect(hadsch).toMatchObject({ art: 'religioes', eingereichtVon: null });
    expect(hadsch.angaben).toEqual(
      expect.arrayContaining([
        { label: 'adresse', wert: '/islamisches-wissen/hajj-umrah' },
        { label: 'titel_tr', wert: 'Hac ve Umre', lang: 'tr' },
        { label: 'titel_en', wert: 'Hajj and Umrah', lang: 'en' },
      ]),
    );
    expect(hadsch.text).toMatchObject({ type: 'doc' });
    expect(hadsch.textUebersetzungen?.map((u) => u.sprache)).toEqual(['tr', 'en']);
  });

  it('Freigeben durch die religiöse Prüfung (ohne Vier-Augen-Konflikt, Verfasser ist die KI): geprüft, ohne Kennzeichnung', async () => {
    const { id } = await zeile('hajj-umrah');
    await angemeldetAls(REDAKTION);
    expect(await entscheide(id, 'freigeben')).toEqual({ fehler: 'nurReligioesePruefung' });
    const imam = await angemeldetAls(PRUEFUNG);
    expect(await entscheide(id, 'freigeben')).toEqual({ ziel: '/verwaltung/freigaben?erledigt=freigeben' });
    expect(await zeile('hajj-umrah')).toMatchObject({ freigabe: 'geprueft', geprueftVon: imam, verfasstVon: KI_ENTWURF_VERFASSER });
    expect(aufrufe.updateTag).toContain('wissen');
    vorschauAn();
    expect(await oeffentlich.ladeWissensThema('hajj-umrah')).toMatchObject({ entwurf: false, kiEntwurf: false });
    expect((await oeffentlich.ladeWissensThemen()).filter((t) => t.entwurf)).toHaveLength(3);
    vi.stubEnv('FUNKTION_WEBSITE_WISSEN_VORSCHAU', 'aus');
    // Ohne Vorschau: der freigegebene Text bleibt öffentlich – jetzt 13 Themen
    expect(await sichtbar()).toHaveLength(13);
    expect(await sichtbar()).toContain('hajj-umrah');
    expect((await ladeWarteschlange()).filter((e) => e.inhaltTyp === 'wissen_thema')).toHaveLength(3);
    expect((await ladeVerlauf()).find((v) => v.inhaltId === id)).toMatchObject({ status: 'geprueft', titel: 'Hadsch und Umra' });
  });

  it('Zurückweisen nimmt den Entwurf sofort von der Website – auch mit eingeschalteter Vorschau', async () => {
    const { id } = await zeile('friday-prayer');
    await angemeldetAls(PRUEFUNG);
    expect(await entscheide(id, 'zurueckweisen', 'Bitte Abschnitt zur Hutba überarbeiten')).toEqual({
      ziel: '/verwaltung/freigaben?erledigt=zurueckweisen',
    });
    expect((await zeile('friday-prayer')).freigabe).toBe('entwurf');
    expect(aufrufe.updateTag).toContain('wissen');
    vorschauAn();
    expect(await sichtbar()).not.toContain('friday-prayer');
    expect(await oeffentlich.ladeWissensThema('friday-prayer')).toBeNull();
    expect(await sichtbar()).toHaveLength(15);
  });
});

describe('Bearbeiten durch die Redaktion (Cache, Kennzeichnung)', () => {
  it('inhaltliche Änderung an einem sichtbaren Entwurf: bleibt zur Prüfung, Cache erneuert, Hinweis ohne KI-Angabe', async () => {
    const z = await zeile('zakat-fitra-qurban');
    const autor = await angemeldetAls(REDAKTION);
    const r = await aktionen.speichereWissensThema(
      {},
      formular({
        id: z.id,
        titelDe: z.titel.de,
        titelTr: z.titel.tr ?? '',
        titelEn: z.titel.en ?? '',
        kurztextDe: z.kurztext!.de,
        kurztextTr: z.kurztext!.tr ?? '',
        kurztextEn: z.kurztext!.en ?? '',
        inhaltDe: absatz('Überarbeiteter Testabsatz der Redaktion.'),
        sichtbar: 'ja',
      }),
    );
    expect(r).toMatchObject({ freigabe: 'zur_pruefung' });
    expect(await zeile('zakat-fitra-qurban')).toMatchObject({ freigabe: 'zur_pruefung', verfasstVon: autor });
    expect(aufrufe.updateTag).toContain('wissen');
    vorschauAn();
    expect(await oeffentlich.ladeWissensThema('zakat-fitra-qurban')).toMatchObject({ entwurf: true, kiEntwurf: false });
  });

  it('Ausblenden eines sichtbaren Entwurfs: sofort weg, Cache erneuert', async () => {
    const z = await zeile('islamic-calendar');
    await angemeldetAls(REDAKTION);
    const r = await aktionen.speichereWissensThema(
      {},
      formular({
        id: z.id,
        titelDe: z.titel.de,
        titelTr: z.titel.tr ?? '',
        titelEn: z.titel.en ?? '',
        kurztextDe: z.kurztext!.de,
        kurztextTr: z.kurztext!.tr ?? '',
        kurztextEn: z.kurztext!.en ?? '',
        inhaltDe: JSON.stringify(z.inhalt!.de),
        inhaltTr: JSON.stringify(z.inhalt!.tr),
        inhaltEn: JSON.stringify(z.inhalt!.en),
      }),
    );
    expect(r).toMatchObject({ freigabe: 'zur_pruefung' });
    expect(await zeile('islamic-calendar')).toMatchObject({
      status: 'entwurf',
      freigabe: 'zur_pruefung',
      verfasstVon: KI_ENTWURF_VERFASSER,
    });
    expect(aufrufe.updateTag).toContain('wissen');
    vorschauAn();
    expect(await sichtbar()).not.toContain('islamic-calendar');
  });
});
