import { randomBytes } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { schema } from '@/lib/db';
import type { DachverbandInhalt } from '@/lib/validierung/seiteninhalte/dachverband';
import { DACHVERBAND_BEISPIEL, seed as dachverbandSeed } from '../../drizzle/seeds/bereiche/dachverband';
import { alsRouteHandler, angemeldetAls, aufrufe, verwaltungsUmgebung } from './hilfen/verwaltung';

/**
 * Abgleich „Aus dem Dachverband“ mit dem Hutba-Feed der IGMG (Plan Marktstart P3) gegen PGlite mit Fake-Feed (`fetch`
 * ersetzt bzw. eingesetzter Abruf, kein Netz): Zugang (Cron und Wartung getrennt), Trockenlauf, Erstlauf mit Audit ohne
 * Person, `istBeispiel = false` und Cache-Tag, zweiter Lauf unverändert, ausgeblendete Einträge bleiben ausgeblendet,
 * Seed wird wiedererkannt, Feed-Fehler und unlesbarer Bestand ändern nichts, Knopf in der Verwaltung mit Recht und
 * Ratenbegrenzung; öffentlich liest die Seite die neuen Einträge.
 */
const { client, db } = await verwaltungsUmgebung();
const route = await import('@/app/api/wartung/dachverband-abgleich/route');
const { gleicheDachverbandAb } = await import('@/lib/dachverband/abgleich');
const { holeDachverbandFeed } = await import('@/server/actions/seiteninhalte');
const { ladeSeiteninhalt } = await import('@/server/queries/seiteninhalte');
afterAll(() => client.close());

const CRON = randomBytes(32).toString('base64');
const WARTUNG = randomBytes(32).toString('base64');
const vorher = { cron: process.env.CRON_SECRET, wartung: process.env.WARTUNG_TOKEN };
beforeAll(() => {
  process.env.CRON_SECRET = CRON;
  process.env.WARTUNG_TOKEN = WARTUNG;
});
afterAll(() => {
  for (const [name, wert] of [
    ['CRON_SECRET', vorher.cron],
    ['WARTUNG_TOKEN', vorher.wartung],
  ] as const) {
    if (wert === undefined) delete process.env[name];
    else process.env[name] = wert;
  }
  vi.unstubAllGlobals();
});

const IGMG = 'https://www.igmg.org';
type Item = { titel: string; pfad: string; pubDate: string };
const ITEMS: Item[] = [
  {
    titel: 'Mit W&#252;rde gegen Islamfeindlichkeit',
    pfad: 'vorurteile-und-gesellschaftlicher-frieden-2',
    pubDate: 'Thu, 22 Oct 2026 12:13:49 +0000',
  },
  {
    titel: 'Vorurteile und gesellschaftlicher Frieden',
    pfad: 'vorurteile-und-gesellschaftlicher-frieden',
    pubDate: 'Thu, 15 Oct 2026 08:20:37 +0000',
  },
  {
    titel: 'Rechte und Pflichten in sozialen Medien',
    pfad: 'rechte-und-pflichten-in-sozialen-medien',
    pubDate: 'Thu, 08 Oct 2026 13:09:02 +0000',
  },
];
const feed = { items: [...ITEMS], status: 200, abrufe: 0 };
const rss = (items: Item[]) =>
  `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/"><channel><title>Freitagspredigt</title>${items
    .map(
      (i) =>
        `<item><title>${i.titel}</title><link>${IGMG}/${i.pfad}/</link><pubDate>${i.pubDate}</pubDate><description><![CDATA[Aziz Müminler (49:6)]]></description></item>`,
    )
    .join('')}</channel></rss>`;
const fakeAbruf = async (): Promise<Response> => {
  feed.abrufe++;
  if (feed.status !== 200) return new Response('', { status: feed.status });
  return new Response(rss(feed.items), { status: 200, headers: { 'content-type': 'application/rss+xml; charset=UTF-8' } });
};
const anfrage = (methode: 'GET' | 'POST', auth?: string, suche = '') =>
  new Request(`https://example.test/api/wartung/dachverband-abgleich${suche}`, {
    method: methode,
    headers: auth ? { authorization: `Bearer ${auth}` } : {},
  });
const zeile = async () => (await db.select().from(schema.seiteninhalt).where(eq(schema.seiteninhalt.bereich, 'dachverband')))[0];
const audit = () => db.select().from(schema.auditEintrag).where(eq(schema.auditEintrag.aktion, 'dachverband.abgleich'));
const eintraege = async () => ((await zeile())?.inhalt as DachverbandInhalt | undefined)?.eintraege ?? [];

beforeEach(() => {
  feed.items = [...ITEMS];
  feed.status = 200;
  feed.abrufe = 0;
  aufrufe.revalidateTag.length = 0;
  aufrufe.revalidateProfil.length = 0;
  vi.stubGlobal('fetch', vi.fn(fakeAbruf));
});

describe('Zugang zur Wartungsroute', () => {
  it('ohne bzw. mit falschem Bearer 401, ohne Abruf; CRON_SECRET und WARTUNG_TOKEN sind getrennt', async () => {
    expect((await route.GET(anfrage('GET'))).status).toBe(401);
    expect((await route.GET(anfrage('GET', WARTUNG))).status).toBe(401);
    expect((await route.POST(anfrage('POST'))).status).toBe(401);
    expect((await route.POST(anfrage('POST', CRON))).status).toBe(401);
    expect(feed.abrufe).toBe(0);
    expect(await zeile()).toBeUndefined();
  });
});

describe('Abgleich mit dem Fake-Feed', () => {
  it('Trockenlauf rechnet, schreibt aber nichts (keine Zeile, kein Audit, kein Tag)', async () => {
    const antwort = await route.POST(anfrage('POST', WARTUNG, '?trocken=1'));
    expect(antwort.headers.get('cache-control')).toBe('no-store');
    expect(await antwort.json()).toMatchObject({ status: 'ok', trocken: true, neu: 3, vorhanden: 0, geaendert: false });
    expect(feed.abrufe).toBe(1);
    expect(await zeile()).toBeUndefined();
    expect(await audit()).toHaveLength(0);
    expect(aufrufe.revalidateTag).toEqual([]);
  });

  it('Erstlauf per Cron: fügt die Predigten ein (Hutba, Feed, Freitag, ohne Kurztext), istBeispiel false, Audit ohne Person, Tag', async () => {
    const antwort = await alsRouteHandler(() => route.GET(anfrage('GET', CRON)));
    const e = await antwort.json();
    expect(e).toMatchObject({ status: 'ok', neu: 3, vorhanden: 0, abgewiesen: 0, geaendert: true });
    expect(e.neueSchluessel).toEqual([
      'vorurteile-und-gesellschaftlicher-frieden-2',
      'vorurteile-und-gesellschaftlicher-frieden',
      'rechte-und-pflichten-in-sozialen-medien',
    ]);
    const z = await zeile();
    expect(z).toMatchObject({ istBeispiel: false, quelle: 'dachverband-feed', aktualisiertVon: null });
    expect((z.inhalt as DachverbandInhalt).eintraege[0]).toEqual({
      schluessel: 'vorurteile-und-gesellschaftlicher-frieden-2',
      art: 'hutba',
      datum: '2026-10-23',
      titel: { de: 'Mit Würde gegen Islamfeindlichkeit' },
      url: `${IGMG}/vorurteile-und-gesellschaftlicher-frieden-2/`,
      sichtbar: true,
      herkunft: 'feed',
    });
    // G-06: nichts aus der Beschreibung
    expect(JSON.stringify(z.inhalt)).not.toMatch(/Aziz|49:6/);
    const [a] = await audit();
    expect(a).toMatchObject({
      benutzerId: null,
      zielTyp: 'seiteninhalt',
      zielId: 'dachverband',
      details: { neu: 3, vorhanden: 0, entfernt: 0, abgewiesen: 0, geprueft: 3 },
    });
    expect(aufrufe.verfallen).toContain('seiteninhalt:dachverband');
    expect(aufrufe.revalidateProfil).toEqual([{ expire: 0 }]);
  });

  it('öffentlich: der Seiteninhalt liefert die neuen Einträge', async () => {
    const inhalt = await ladeSeiteninhalt('dachverband');
    expect(inhalt.istBeispiel).toBe(false);
    expect(inhalt.eintraege.map((e) => e.datum)).toEqual(['2026-10-23', '2026-10-16', '2026-10-09']);
  });

  it('zweiter Lauf mit demselben Feed: „unveraendert“, nichts geschrieben, kein Audit, kein Tag', async () => {
    const vorherZeile = await zeile();
    const e = await gleicheDachverbandAb();
    expect(e).toMatchObject({ status: 'unveraendert', neu: 0, vorhanden: 3, geaendert: false });
    expect((await zeile()).aktualisiertAm.getTime()).toBe(vorherZeile.aktualisiertAm.getTime());
    expect(await audit()).toHaveLength(1);
    expect(aufrufe.revalidateTag).toEqual([]);
  });

  it('von der Redaktion ausgeblendete und bearbeitete Einträge bleiben, wie sie sind; nur Neues kommt dazu', async () => {
    const bestand = await eintraege();
    const geaendert = bestand.map((e) =>
      e.schluessel === 'vorurteile-und-gesellschaftlicher-frieden-2' ? { ...e, sichtbar: false, titel: { de: 'Von Hand', tr: 'Elle' } } : e,
    );
    await db
      .update(schema.seiteninhalt)
      .set({ inhalt: { eintraege: geaendert } })
      .where(eq(schema.seiteninhalt.bereich, 'dachverband'));
    feed.items = [{ titel: 'Neue Predigt', pfad: 'neue-predigt', pubDate: 'Thu, 29 Oct 2026 23:30:00 +0000' }, ...ITEMS];
    const e = await gleicheDachverbandAb();
    expect(e).toMatchObject({ status: 'ok', neu: 1, vorhanden: 3 });
    const nachher = await eintraege();
    expect(nachher.map((x) => x.schluessel)).toEqual(['neue-predigt', ...geaendert.map((x) => x.schluessel)]);
    // Zeitumstellung: Do. 29.10. 23:30 UTC ist in Berlin schon Freitag, 00:30 MEZ
    expect(nachher[0]).toMatchObject({ datum: '2026-10-30', sichtbar: true });
    expect(nachher.find((x) => x.schluessel === 'vorurteile-und-gesellschaftlicher-frieden-2')).toMatchObject({
      sichtbar: false,
      titel: { de: 'Von Hand', tr: 'Elle' },
    });
  });

  it('Feed-Fehler (503, zweimal versucht): „fehler“, nichts geschrieben', async () => {
    feed.status = 503;
    const vorherZeile = await zeile();
    const e = await gleicheDachverbandAb({ warte: async () => undefined });
    expect(e).toMatchObject({ status: 'fehler', fehlerCode: 'status', geaendert: false });
    expect(feed.abrufe).toBe(2);
    expect((await zeile()).inhalt).toEqual(vorherZeile.inhalt);
  });

  it('unlesbarer Bestand wird nie überschrieben: „fehler“ mit Code „unlesbar“', async () => {
    const vorherZeile = await zeile();
    await db
      .update(schema.seiteninhalt)
      .set({ inhalt: { eintraege: 'kaputt' } })
      .where(eq(schema.seiteninhalt.bereich, 'dachverband'));
    expect(await gleicheDachverbandAb()).toMatchObject({ status: 'fehler', fehlerCode: 'unlesbar' });
    expect(await gleicheDachverbandAb({ trocken: true })).toMatchObject({ status: 'fehler', fehlerCode: 'unlesbar' });
    expect((await zeile()).inhalt).toEqual({ eintraege: 'kaputt' });
    await db.update(schema.seiteninhalt).set({ inhalt: vorherZeile.inhalt }).where(eq(schema.seiteninhalt.bereich, 'dachverband'));
  });
});

describe('Seed und Abgleich', () => {
  it('der Seed wird wiedererkannt: Feed mit denselben Predigten ändert nichts, eine neue kommt vorn dazu', async () => {
    await db.delete(schema.seiteninhalt).where(eq(schema.seiteninhalt.bereich, 'dachverband'));
    expect(await dachverbandSeed(db as never)).toBe(1);
    expect(await dachverbandSeed(db as never)).toBe(0);
    expect(await zeile()).toMatchObject({ istBeispiel: true });
    expect(await gleicheDachverbandAb()).toMatchObject({ status: 'unveraendert', vorhanden: 3 });
    feed.items = [{ titel: 'Neue Predigt', pfad: 'neue-predigt-2', pubDate: 'Thu, 29 Oct 2026 08:00:00 +0000' }, ...ITEMS];
    const e = await gleicheDachverbandAb();
    expect(e).toMatchObject({ status: 'ok', neu: 1 });
    const z = await zeile();
    expect(z).toMatchObject({ istBeispiel: false, quelle: 'dachverband-feed' });
    expect((z.inhalt as DachverbandInhalt).eintraege).toHaveLength((DACHVERBAND_BEISPIEL.eintraege ?? []).length + 1);
  });
});

describe('Verwaltung: „Jetzt aus dem Feed holen“', () => {
  it('ohne Sitzung oder ohne Recht seiteninhalt.bearbeiten: keinRecht, kein Abruf', async () => {
    await angemeldetAls(null);
    expect(await holeDachverbandFeed({}, new FormData())).toEqual({ fehler: 'keinRecht' });
    await angemeldetAls([{ rolle: 'bildung' }]);
    expect(await holeDachverbandFeed({}, new FormData())).toEqual({ fehler: 'keinRecht' });
    await angemeldetAls([{ rolle: 'redaktion' }], false);
    expect(await holeDachverbandFeed({}, new FormData())).toEqual({ fehler: 'keinRecht' });
    expect(feed.abrufe).toBe(0);
  });

  it('Redaktion: holt den Feed, Audit mit Person, neue Einträge an den Editor; höchstens alle 5 Minuten', async () => {
    const id = await angemeldetAls([{ rolle: 'redaktion' }]);
    feed.items = [{ titel: 'Aus der Verwaltung', pfad: 'aus-der-verwaltung', pubDate: 'Thu, 05 Nov 2026 08:00:00 +0000' }, ...ITEMS];
    const z = await holeDachverbandFeed({}, new FormData());
    expect(z.ergebnis).toMatchObject({ status: 'ok', neu: 1 });
    expect(z.neueEintraege?.map((e) => [e.schluessel, e.datum])).toEqual([['aus-der-verwaltung', '2026-11-06']]);
    expect(aufrufe.updateTag).toContain('seiteninhalt:dachverband');
    expect((await audit()).at(-1)).toMatchObject({ benutzerId: id, details: { neu: 1 } });
    expect(await holeDachverbandFeed({}, new FormData())).toEqual({ fehler: 'zuOft' });
  });
});
