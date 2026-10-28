import { describe, expect, it, vi } from 'vitest';
import {
  berlinerTag,
  dekodiereEntities,
  FeedFehler,
  freitagDerWoche,
  holeFeed,
  HUTBA_FEED,
  leseFeed,
  schluesselAus,
  type Abruf,
} from '@/lib/dachverband/feed';

/**
 * Hutba-Feed der IGMG (Plan Marktstart P3): RSS 2.0 ohne Zusatzpaket, nur Titel, Link und Datum (G-06: Beschreibung und
 * Volltext werden nie gelesen), Entities, fremde Hosts, Freitag der Woche in Europe/Berlin über die Zeitumstellung am
 * 25.10.2026, Abruf mit Grenzen (eingesetzter Abruf, kein Netz).
 */
const item = (titel: string, link: string, pubDate: string, rest = '') => `
	<item>
		<title>${titel}</title>
		<link>${link}</link>
		<dc:creator><![CDATA[GS]]></dc:creator>
		<pubDate>${pubDate}</pubDate>
		<category><![CDATA[Freitagspredigt]]></category>
		<guid isPermaLink="false">https://www.igmg.org/?p=1</guid>${rest}
	</item>`;

const rss = (...items: string[]) => `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"
	xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/">
<channel>
	<title>Freitagspredigt &#8211; Islamische Gemeinschaft Millî Görüş (IGMG)</title>
	<link>https://www.igmg.org</link>
	<description></description>
	<language>de</language>${items.join('')}
</channel>
</rss>`;

/** Beschreibung und Volltext wie bei WordPress: mit Versangabe, Zitat und sogar einem „Item“ im Text. */
const INHALT = `
		<description><![CDATA[<p>Aziz Müminler! „Ein Zitat“ (49:6) <title>Falle</title></p>]]></description>
		<content:encoded><![CDATA[<p>Volltext mit </item><item><title>Eingeschmuggelt</title><link>https://www.igmg.org/falle/</link></p>]]></content:encoded>`;

const FIXTURE = rss(
  item(
    'Mit W&#252;rde gegen Islamfeindlichkeit',
    'https://www.igmg.org/vorurteile-und-gesellschaftlicher-frieden-2/',
    'Thu, 22 Oct 2026 12:13:49 +0000',
    INHALT,
  ),
  item('Infak &#8211; barmherzig wirtschaften', 'https://www.igmg.org/infak-barmherzig-wirtschaften/', 'Thu, 01 Oct 2026 08:18:39 +0000'),
  item(
    '<![CDATA[Rechte & Pflichten „in“ sozialen Medien]]>',
    'https://www.igmg.org/rechte-und-pflichten-in-sozialen-medien/',
    'Thu, 08 Oct 2026 13:09:02 +0000',
  ),
  item('Fremder Host', 'https://example.org/hutba/', 'Thu, 15 Oct 2026 08:00:00 +0000'),
  item('Ohne https', 'http://www.igmg.org/ohne-https/', 'Thu, 15 Oct 2026 08:00:00 +0000'),
  item('Ähnlicher Host', 'https://www.igmg.org.example.org/x/', 'Thu, 15 Oct 2026 08:00:00 +0000'),
  item('Mit Versangabe 49:6', 'https://www.igmg.org/mit-versangabe/', 'Thu, 15 Oct 2026 08:00:00 +0000'),
  item('Ohne Datum', 'https://www.igmg.org/ohne-datum/', 'irgendwann'),
  item('', 'https://www.igmg.org/ohne-titel/', 'Thu, 15 Oct 2026 08:00:00 +0000'),
  item('Doppelt', 'https://www.igmg.org/infak-barmherzig-wirtschaften/', 'Thu, 01 Oct 2026 08:18:39 +0000'),
);

describe('Parser', () => {
  it('liest nur Titel, Link und Datum; Entities, CDATA und Anführungszeichen bereinigt; Freitag als Datum', () => {
    const { eintraege, abgewiesen } = leseFeed(FIXTURE);
    expect(eintraege).toEqual([
      {
        schluessel: 'vorurteile-und-gesellschaftlicher-frieden-2',
        titel: 'Mit Würde gegen Islamfeindlichkeit',
        url: 'https://www.igmg.org/vorurteile-und-gesellschaftlicher-frieden-2/',
        datum: '2026-10-23',
        veroeffentlicht: '2026-10-22T12:13:49.000Z',
      },
      {
        schluessel: 'infak-barmherzig-wirtschaften',
        titel: 'Infak – barmherzig wirtschaften',
        url: 'https://www.igmg.org/infak-barmherzig-wirtschaften/',
        datum: '2026-10-02',
        veroeffentlicht: '2026-10-01T08:18:39.000Z',
      },
      {
        schluessel: 'rechte-und-pflichten-in-sozialen-medien',
        titel: 'Rechte & Pflichten in sozialen Medien',
        url: 'https://www.igmg.org/rechte-und-pflichten-in-sozialen-medien/',
        datum: '2026-10-09',
        veroeffentlicht: '2026-10-08T13:09:02.000Z',
      },
    ]);
    // fremder Host, http, ähnlicher Host, Versangabe, ohne Datum, ohne Titel, doppelt
    expect(abgewiesen).toBe(7);
  });

  it('G-06: Beschreibung und Volltext tauchen nirgends auf, auch kein eingeschmuggeltes Item', () => {
    const text = JSON.stringify(leseFeed(FIXTURE));
    for (const verboten of ['Aziz', 'Zitat', '49:6', 'Falle', 'Volltext', 'Eingeschmuggelt']) expect(text).not.toContain(verboten);
  });

  it('kein RSS-Kanal: Formatfehler; leerer Kanal: keine Einträge', () => {
    expect(() => leseFeed('<html><body>Wartung</body></html>')).toThrow(FeedFehler);
    expect(leseFeed(rss())).toEqual({ eintraege: [], abgewiesen: 0 });
  });

  it('Entities: benannt, dezimal und hexadezimal; unbekannte bleiben stehen', () => {
    expect(dekodiereEntities('A &amp; B &#8211; C &#x2013; D &bdquo;E&ldquo; &foo; &#0;')).toBe('A & B – C – D „E“ &foo; &#0;');
  });

  it('Kennung aus dem Adressteil: Prozentkodierung, Umlaute und Sonderzeichen', () => {
    const k = (pfad: string) => schluesselAus(new URL(`https://www.igmg.org${pfad}`));
    expect(k('/infak-barmherzig-wirtschaften/')).toBe('infak-barmherzig-wirtschaften');
    expect(k('/hutba-der-mira%c2%a2dsch/')).toBe('hutba-der-mira-dsch');
    expect(k('/stra%C3%9Fe-und-%C3%BCbung/')).toBe('strasse-und-ubung');
    expect(k('/')).toBeNull();
    expect(k('/a/')).toBeNull();
  });
});

describe('Freitag der Woche in Europe/Berlin (Zeitumstellung 25.10.2026)', () => {
  it.each([
    ['Do. 22.10. 12:13 UTC (Sommerzeit)', '2026-10-22T12:13:49Z', '2026-10-22', '2026-10-23'],
    ['Do. 22.10. 22:30 UTC = Fr. 00:30 MESZ', '2026-10-22T22:30:00Z', '2026-10-23', '2026-10-23'],
    ['Fr. 23.10. 21:59 UTC = Fr. 23:59 MESZ', '2026-10-23T21:59:00Z', '2026-10-23', '2026-10-23'],
    ['Fr. 23.10. 22:30 UTC = Sa. 00:30 MESZ', '2026-10-23T22:30:00Z', '2026-10-24', '2026-10-30'],
    ['Sa. 24.10. 23:30 UTC = So. 01:30 MESZ', '2026-10-24T23:30:00Z', '2026-10-25', '2026-10-30'],
    ['So. 25.10. 23:30 UTC = Mo. 00:30 MEZ', '2026-10-25T23:30:00Z', '2026-10-26', '2026-10-30'],
    ['Do. 29.10. 22:30 UTC = Do. 23:30 MEZ', '2026-10-29T22:30:00Z', '2026-10-29', '2026-10-30'],
    ['Do. 29.10. 23:30 UTC = Fr. 00:30 MEZ', '2026-10-29T23:30:00Z', '2026-10-30', '2026-10-30'],
    ['Mi. 16.09. (früher veröffentlicht)', '2026-09-16T14:13:58Z', '2026-09-16', '2026-09-18'],
  ])('%s', (_n, zeitpunkt, tag, freitag) => {
    expect(berlinerTag(new Date(zeitpunkt))).toBe(tag);
    expect(freitagDerWoche(new Date(zeitpunkt))).toBe(freitag);
  });
});

describe('Abruf', () => {
  const xml = (inhalt = FIXTURE, typ = 'application/rss+xml; charset=UTF-8') =>
    new Response(inhalt, { status: 200, headers: { 'content-type': typ } });

  it('eigener User-Agent, kein Weiterleiten, ohne Cookies und Cache; feste Feed-Adresse', async () => {
    const abruf = vi.fn<Abruf>(async () => xml());
    const e = await holeFeed({ abruf });
    expect(e.eintraege).toHaveLength(3);
    expect(abruf).toHaveBeenCalledTimes(1);
    const [adresse, init] = abruf.mock.calls[0];
    expect(adresse).toBe(HUTBA_FEED);
    expect(HUTBA_FEED).toBe('https://www.igmg.org/category/irschad/freitagspredigt/feed/');
    expect(init).toMatchObject({ method: 'GET', redirect: 'error', cache: 'no-store', credentials: 'omit' });
    expect((init.headers as Record<string, string>)['user-agent']).toBe('IGMG-Wetzlar-Website (Dachverband-Abgleich)');
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it('Serverfehler: ein zweiter Versuch; danach Fehler mit Status', async () => {
    const warte = vi.fn(async () => undefined);
    const abruf = vi.fn<Abruf>(async () => new Response('', { status: 503 }));
    await expect(holeFeed({ abruf, warte })).rejects.toMatchObject({ code: 'status', status: 503 });
    expect(abruf).toHaveBeenCalledTimes(2);
    expect(warte).toHaveBeenCalledTimes(1);
    const zweiterKlappt = vi
      .fn<Abruf>()
      .mockResolvedValueOnce(new Response('', { status: 502 }))
      .mockResolvedValueOnce(xml());
    expect((await holeFeed({ abruf: zweiterKlappt, warte })).eintraege).toHaveLength(3);
  });

  it('404 wird nicht wiederholt; Netzfehler zweimal versucht', async () => {
    const nicht = vi.fn<Abruf>(async () => new Response('', { status: 404 }));
    await expect(holeFeed({ abruf: nicht, warte: async () => undefined })).rejects.toMatchObject({ code: 'status', status: 404 });
    expect(nicht).toHaveBeenCalledTimes(1);
    const netz = vi.fn<Abruf>(async () => {
      throw new TypeError('fetch failed');
    });
    await expect(holeFeed({ abruf: netz, warte: async () => undefined })).rejects.toMatchObject({ code: 'netz' });
    expect(netz).toHaveBeenCalledTimes(2);
  });

  it('falscher Inhaltstyp und mehr als 2 MB: abgewiesen', async () => {
    await expect(holeFeed({ abruf: async () => xml(FIXTURE, 'text/html') })).rejects.toMatchObject({ code: 'inhaltstyp' });
    const gross = 'x'.repeat(2 * 1024 * 1024 + 1);
    await expect(holeFeed({ abruf: async () => xml(gross) })).rejects.toMatchObject({ code: 'zu_gross' });
    await expect(
      holeFeed({
        abruf: async () =>
          new Response('', { status: 200, headers: { 'content-type': 'application/xml', 'content-length': String(3 * 1024 * 1024) } }),
      }),
    ).rejects.toMatchObject({ code: 'zu_gross' });
  });
});
