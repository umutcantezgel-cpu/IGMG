import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test, type Page, type Response } from '@playwright/test';

/**
 * Datenschutz-Technik öffentlicher Seiten (K-14, G-07, K-01, K-03). Beim Laden und bei der Bedienung (ans Ende
 * scrollen, Sprachmenü bzw. auf dem Telefon das Menü öffnen) gehen alle Anfragen an die eigene Herkunft oder sind
 * data:/blob:; bekannte Dritt-Dienste fehlen. Nach dem Besuch aller Routen gibt es keine Cookies und nur
 * Speicherschlüssel mit dem Präfix igmg-. Die Startseite sendet eine CSP mit default-src 'self' ohne Drittanbieter-Hosts.
 */

/**
 * Routen je Sprache: Adressen nach src/i18n/routing.ts (localePrefix „as-needed“, Deutsch ohne Präfix).
 * Der Slug der Detailseite wird zur Laufzeit aus dem ersten Link auf eine Detailseite in der Veranstaltungsliste
 * der jeweiligen Sprache ermittelt (sonst aus der Startseite). Weitere Seiten werden als Zeile ergänzt.
 */
const ROUTEN = [
  { id: 'start', seite: 'Startseite', de: '/', tr: '/tr', en: '/en' },
  { id: 'liste', seite: 'Veranstaltungen-Liste', de: '/veranstaltungen', tr: '/tr/etkinlikler', en: '/en/events' },
  { id: 'detail', seite: 'Veranstaltung-Detail', de: '/veranstaltungen/[slug]', tr: '/tr/etkinlikler/[slug]', en: '/en/events/[slug]' },
  { id: 'nachrichten', seite: 'Nachrichten', de: '/nachrichten', tr: '/tr/haberler', en: '/en/news' },
  {
    id: 'nachricht',
    seite: 'Nachricht-Detail',
    de: '/nachrichten/neue-gebetszeiten-fuer-den-winter',
    tr: '/tr/haberler/neue-gebetszeiten-fuer-den-winter',
    en: '/en/news/neue-gebetszeiten-fuer-den-winter',
  },
  { id: 'ueberuns', seite: 'Über uns', de: '/ueber-uns', tr: '/tr/hakkimizda', en: '/en/about-us' },
  { id: 'vorstand', seite: 'Vorstand', de: '/vorstand', tr: '/tr/yonetim', en: '/en/board' },
  { id: 'projekte', seite: 'Projekte', de: '/projekte', tr: '/tr/projeler', en: '/en/projects' },
  { id: 'kontakt', seite: 'Kontakt', de: '/kontakt', tr: '/tr/iletisim', en: '/en/contact' },
  { id: 'igmg', seite: 'IGMG', de: '/igmg', tr: '/tr/igmg', en: '/en/igmg' },
  {
    id: 'organisation',
    seite: 'Organisation (Ana Teşkilatı)',
    de: '/organisationen/ana-teskilati',
    tr: '/tr/organizasyonlar/ana-teskilati',
    en: '/en/organizations/ana-teskilati',
  },
  { id: 'korankurse', seite: 'Korankurse', de: '/bildung/korankurse', tr: '/tr/egitim/kuran-kurslari', en: '/en/education/quran-courses' },
  { id: 'gebetszeiten', seite: 'Gebetszeiten', de: '/gebetszeiten', tr: '/tr/namaz-vakitleri', en: '/en/prayer-times' },
  { id: 'wissen', seite: 'Islamisches Wissen', de: '/islamisches-wissen', tr: '/tr/islami-bilgiler', en: '/en/islamic-knowledge' },
  {
    id: 'wissenthema',
    seite: 'Islamisches Wissen, Thema',
    de: '/islamisches-wissen/mosque',
    tr: '/tr/islami-bilgiler/mosque',
    en: '/en/islamic-knowledge/mosque',
  },
  { id: 'impressum', seite: 'Impressum', de: '/impressum', tr: '/tr/kunye', en: '/en/imprint' },
  { id: 'datenschutz', seite: 'Datenschutz', de: '/datenschutz', tr: '/tr/gizlilik', en: '/en/privacy' },
  { id: 'nichtgefunden', seite: 'Seite nicht gefunden', de: '/gibt-es-nicht', tr: '/tr/gibt-es-nicht', en: '/en/gibt-es-nicht' },
  {
    id: 'voranmeldung',
    seite: 'Schüler-Voranmeldung',
    de: '/bildung/voranmeldung',
    tr: '/tr/egitim/on-kayit',
    en: '/en/education/pre-registration',
  },
  { id: 'mitglied', seite: 'Mitglied werden', de: '/mitglied-werden', tr: '/tr/uye-ol', en: '/en/become-a-member' },
  { id: 'meldung', seite: 'Meldung', de: '/meldung', tr: '/tr/bildirim', en: '/en/report' },
  { id: 'suche', seite: 'Suche', de: '/suche?q=Gebet', tr: '/tr/arama?q=namaz', en: '/en/search?q=prayer' },
  {
    id: 'moschee',
    seite: 'Webseite für Moscheen',
    de: '/webseite-fuer-moscheen',
    tr: '/tr/camiler-icin-web-sitesi',
    en: '/en/website-for-mosques',
  },
] as const;

type Sprache = 'de' | 'tr' | 'en';
type Geraet = 'desktop' | 'telefon';
type RouteId = (typeof ROUTEN)[number]['id'];
type Fund = { url: string; art: string };
type Protokoll = { anfragen: string[]; dokumente: Response[] };
type Speicher = { local: string[]; session: string[] };
type Nachrichten = { sprachwahl: { aendern: string }; kopf: { menueOeffnen: string } };

const SPRACHEN: Sprache[] = ['de', 'tr', 'en'];
const SPEICHER_PRAEFIX = 'igmg-';
const ERLAUBTE_SCHEMAS = ['data:', 'blob:'];
/** Bekannte Dritt-Dienste: zusätzlich zur Herkunftsregel, damit die Meldung sie beim Namen nennt. */
const DRITT_DIENSTE = [
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'unpkg.com',
  'cdn.',
  'google-analytics',
  'googletagmanager',
  'facebook',
  'youtube',
  'youtu.be',
  'maps.google',
];

/** Rollen-Namen der Bedienelemente stammen aus messages/{de,tr,en}.json, damit die Tests denselben Text wie die Seite finden. */
function ladeNachrichten(sprache: Sprache): Nachrichten {
  return JSON.parse(readFileSync(join(__dirname, '..', '..', 'messages', `${sprache}.json`), 'utf8')) as Nachrichten;
}
const NACHRICHTEN: Record<Sprache, Nachrichten> = { de: ladeNachrichten('de'), tr: ladeNachrichten('tr'), en: ladeNachrichten('en') };

function routeZu(id: RouteId, sprache: Sprache): string {
  const zeile = ROUTEN.find((z) => z.id === id);
  if (!zeile) throw new Error(`Route „${id}“ fehlt in der Tabelle`);
  return zeile[sprache];
}

function geraetVon(projekt: string): Geraet {
  return projekt === 'telefon' ? 'telefon' : 'desktop';
}

function herkunftVon(baseURL: string | undefined): { url: string; host: string } {
  if (!baseURL) throw new Error('baseURL ist nicht gesetzt');
  const adresse = new URL(baseURL);
  return { url: adresse.origin, host: adresse.host };
}

function hostVon(url: string): string | null {
  try {
    return new URL(url).host;
  } catch {
    return null;
  }
}

function pfadVon(href: string, basis: string): string | null {
  try {
    return new URL(href, basis).pathname;
  } catch {
    return null;
  }
}

/** Zeichnet ab jetzt jede Anfrage, jede WebSocket-Verbindung und jede Dokumentantwort der Seite auf. */
function protokolliere(seite: Page): Protokoll {
  const protokoll: Protokoll = { anfragen: [], dokumente: [] };
  seite.on('request', (anfrage) => protokoll.anfragen.push(anfrage.url()));
  seite.on('websocket', (socket) => protokoll.anfragen.push(socket.url()));
  seite.on('response', (antwort) => {
    if (antwort.request().resourceType() === 'document') protokoll.dokumente.push(antwort);
  });
  return protokoll;
}

/** Anfragen, die weder an die eigene Herkunft gehen noch data:/blob: sind. Bekannte Dritt-Dienste werden benannt. */
function findeFremdeAnfragen(anfragen: string[], host: string): Fund[] {
  const funde: Fund[] = [];
  for (const url of anfragen) {
    if (ERLAUBTE_SCHEMAS.some((schema) => url.startsWith(schema))) continue;
    const anfrageHost = hostVon(url);
    if (anfrageHost === host) continue;
    if (anfrageHost === null) {
      funde.push({ url, art: 'keine gültige URL' });
      continue;
    }
    const dienst = DRITT_DIENSTE.find((d) => anfrageHost.includes(d));
    funde.push({ url, art: dienst ? `Dritt-Dienst (${dienst})` : 'fremde Herkunft' });
  }
  return funde;
}

/** Speicherschlüssel ohne Präfix igmg-, mit Angabe des Speichers. */
function findeFremdeSchluessel(speicher: Speicher): string[] {
  return [
    ...speicher.local.filter((k) => !k.startsWith(SPEICHER_PRAEFIX)).map((k) => `localStorage: ${k}`),
    ...speicher.session.filter((k) => !k.startsWith(SPEICHER_PRAEFIX)).map((k) => `sessionStorage: ${k}`),
  ];
}

/** Werte der Set-Cookie-Kopfzeilen. Playwright führt gleichnamige Kopfzeilen nicht zusammen. */
function setCookieWerte(kopfzeilen: { name: string; value: string }[]): string[] {
  return kopfzeilen.filter((k) => k.name.toLowerCase() === 'set-cookie').map((k) => k.value);
}

/** Set-Cookie-Befunde aller Dokumentantworten als „Adresse: Name“. Die Werte werden nicht ausgegeben. */
async function setCookieBefunde(dokumente: Response[]): Promise<string[]> {
  const befunde: string[] = [];
  for (const dokument of dokumente) {
    for (const wert of setCookieWerte(await dokument.headersArray())) {
      befunde.push(`${dokument.url()}: ${wert.split('=')[0]}`);
    }
  }
  return befunde;
}

function istDrittHost(quelle: string): boolean {
  if (quelle.startsWith("'") || ERLAUBTE_SCHEMAS.includes(quelle.toLowerCase())) return false;
  return /^(https?|wss?|ftp):/i.test(quelle) || quelle.includes('.') || quelle.includes('*');
}

/** Prüft eine CSP: default-src 'self' und kein Drittanbieter-Host in irgendeiner Direktive. Liefert die Befunde. */
function pruefeCsp(richtlinie: string): string[] {
  const direktiven = richtlinie
    .split(';')
    .map((d) => d.trim())
    .filter((d) => d.length > 0)
    .map((d) => d.split(/\s+/));
  const befunde: string[] = [];
  const standard = direktiven.find((d) => d[0].toLowerCase() === 'default-src');
  if (!standard) befunde.push('default-src fehlt');
  else if (!standard.includes("'self'")) befunde.push("default-src ohne 'self'");
  for (const [name, ...quellen] of direktiven) {
    for (const quelle of quellen) {
      if (istDrittHost(quelle)) befunde.push(`${name.toLowerCase()}: ${quelle}`);
    }
  }
  return befunde;
}

async function pruefeStartseitenCsp(antwort: Response, pfad: string): Promise<void> {
  const richtlinien = (await antwort.headersArray()).filter((k) => k.name.toLowerCase() === 'content-security-policy').map((k) => k.value);
  expect(richtlinien.length, `Kein Content-Security-Policy-Header auf ${pfad}`).toBeGreaterThan(0);
  const befunde = richtlinien.flatMap((r) => pruefeCsp(r));
  expect(befunde, `CSP auf ${pfad}: ${befunde.join(' | ')}`).toEqual([]);
}

/** Desktop: Sprachmenü öffnen. Telefon: Menü öffnen, dort liegt die Sprachwahl. */
async function oeffneMenue(seite: Page, sprache: Sprache, geraet: Geraet): Promise<void> {
  const texte = NACHRICHTEN[sprache];
  if (geraet === 'desktop') {
    const knopf = seite.getByRole('button', { name: texte.sprachwahl.aendern });
    await knopf.click();
    await expect(knopf, 'Sprachmenü öffnet sich nicht').toHaveAttribute('aria-expanded', 'true');
    return;
  }
  await seite.getByRole('button', { name: texte.kopf.menueOeffnen }).click();
  await expect(seite.getByRole('dialog'), 'Telefonmenü öffnet sich nicht').toBeVisible();
}

/** Ein Besuch: laden, Konzept-Hinweis bestätigen, ans Ende scrollen, Menü öffnen, Netzwerk ruhig abwarten. */
/** Erwarteter HTTP-Status: unbekannte Adressen antworten mit 404 (Tor A SP-A-05), alle anderen Routen mit 200. */
function erwarteterStatus(pfad: string): number {
  return pfad === routeZu('nichtgefunden', 'de') || pfad === routeZu('nichtgefunden', 'tr') || pfad === routeZu('nichtgefunden', 'en')
    ? 404
    : 200;
}

async function besuche(seite: Page, pfad: string, sprache: Sprache, geraet: Geraet): Promise<Response> {
  const antwort = await seite.goto(pfad);
  if (!antwort) throw new Error(`${pfad}: keine Antwort`);
  expect(antwort.status(), `${pfad} antwortet nicht mit ${erwarteterStatus(pfad)}`).toBe(erwarteterStatus(pfad));
  await expect(seite.getByRole('main'), `${pfad}: Hauptinhalt fehlt`).toBeVisible();
  await seite.waitForLoadState('networkidle');
  // Der Konzept-Hinweis erscheint einmal je Browser und sperrt die Seite. Bestätigen setzt igmg-konzepthinweis-gesehen.
  const hinweis = seite.getByRole('alertdialog');
  if ((await hinweis.count()) > 0) await hinweis.getByRole('button').click();
  await seite.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect(seite.getByRole('contentinfo'), `${pfad}: Seitenende nicht erreicht`).toBeInViewport();
  await oeffneMenue(seite, sprache, geraet);
  await seite.waitForLoadState('networkidle');
  return antwort;
}

/** Slug zur Laufzeit: erster Link auf eine Detailseite in der Veranstaltungsliste, sonst auf der Startseite. */
async function ermittleDetailPfad(seite: Page, sprache: Sprache, basis: string): Promise<string | null> {
  const muster = routeZu('detail', sprache);
  const stelle = muster.indexOf('[slug]');
  if (stelle < 0) throw new Error(`Detail-Route ohne [slug]: ${muster}`);
  const praefix = muster.slice(0, stelle);
  for (const quelle of [routeZu('liste', sprache), routeZu('start', sprache)]) {
    await seite.goto(quelle);
    await seite.waitForLoadState('networkidle');
    const hrefs = await seite.getByRole('link').evaluateAll((links) => links.map((l) => l.getAttribute('href') ?? ''));
    for (const href of hrefs) {
      const pfad = pfadVon(href, basis);
      if (pfad?.startsWith(praefix) && pfad.length > praefix.length && !pfad.slice(praefix.length).includes('/')) return pfad;
    }
  }
  return null;
}

for (const zeile of ROUTEN) {
  for (const sprache of SPRACHEN) {
    test(`${zeile.seite} (${sprache}): Anfragen nur an die eigene Herkunft, keine Set-Cookie-Header`, async ({ page, baseURL }, info) => {
      const herkunft = herkunftVon(baseURL);
      const protokoll = protokolliere(page);
      const pfad = zeile.id === 'detail' ? await ermittleDetailPfad(page, sprache, herkunft.url) : routeZu(zeile.id, sprache);
      if (!pfad) {
        test.fixme(
          true,
          `OFFENE FRAGE: Im Datenstand (${sprache}) führt kein Link zu einer Veranstaltungs-Detailseite; Detailseite nicht prüfbar.`,
        );
        return;
      }
      const antwort = await besuche(page, pfad, sprache, geraetVon(info.project.name));
      expect(protokoll.anfragen.length, `Keine Anfrage erfasst bei ${pfad}: die Prüfung wäre leer`).toBeGreaterThan(0);
      expect(protokoll.dokumente.length, `Keine Dokumentantwort erfasst bei ${pfad}: die Cookie-Prüfung wäre leer`).toBeGreaterThan(0);
      const fremde = findeFremdeAnfragen(protokoll.anfragen, herkunft.host).map((f) => `${f.url} (${f.art})`);
      expect(fremde, `Fremde Anfragen bei ${pfad}: ${fremde.join(' | ') || 'keine'}`).toEqual([]);
      expect(await setCookieBefunde(protokoll.dokumente), `Set-Cookie-Header auf Dokumentantworten bei ${pfad}`).toEqual([]);
      if (zeile.id === 'start') await pruefeStartseitenCsp(antwort, pfad);
    });
  }
}

test('Nach dem Besuch aller Routen: keine Cookies, nur igmg-Speicherschlüssel', async ({ page, context, baseURL }, info) => {
  test.setTimeout(300_000);
  const herkunft = herkunftVon(baseURL);
  const geraet = geraetVon(info.project.name);
  const protokoll = protokolliere(page);
  // Erst alle Adressen ermitteln (Slugs zur Laufzeit), dann besuchen. Fehlt ein Link, ist der Lauf offen und nicht still verkürzt.
  const ziele: { sprache: Sprache; seite: string; pfad: string }[] = [];
  const fehlend: string[] = [];
  for (const sprache of SPRACHEN) {
    for (const zeile of ROUTEN) {
      const pfad = zeile.id === 'detail' ? await ermittleDetailPfad(page, sprache, herkunft.url) : routeZu(zeile.id, sprache);
      if (pfad) ziele.push({ sprache, seite: zeile.seite, pfad });
      else fehlend.push(`${zeile.seite} (${sprache})`);
    }
  }
  if (fehlend.length > 0) {
    test.fixme(true, `OFFENE FRAGE: Ohne Veranstaltungs-Link im Datenstand nicht prüfbar: ${fehlend.join(', ')}`);
    return;
  }
  for (const ziel of ziele) {
    await besuche(page, ziel.pfad, ziel.sprache, geraet);
  }
  expect(protokoll.anfragen.length, 'Keine Anfragen erfasst: die Prüfung wäre leer').toBeGreaterThan(0);
  expect(protokoll.dokumente.length, 'Keine Dokumentantworten erfasst: die Cookie-Prüfung wäre leer').toBeGreaterThanOrEqual(ziele.length);
  const fremde = findeFremdeAnfragen(protokoll.anfragen, herkunft.host).map((f) => `${f.url} (${f.art})`);
  expect(fremde, `Fremde Anfragen beim Besuch aller ${ziele.length} Routen: ${fremde.join(' | ') || 'keine'}`).toEqual([]);
  const cookies = await context.cookies();
  expect(
    cookies.map((c) => `${c.name} (${c.domain})`),
    'Cookies nach dem Besuch aller Routen (context.cookies())',
  ).toEqual([]);
  expect(await setCookieBefunde(protokoll.dokumente), 'Set-Cookie-Header auf Dokumentantworten im Besuch aller Routen').toEqual([]);
  const speicher = await page.evaluate(() => ({
    local: Object.keys(window.localStorage),
    session: Object.keys(window.sessionStorage),
  }));
  const gefunden = `localStorage [${speicher.local.join(', ')}], sessionStorage [${speicher.session.join(', ')}]`;
  console.log(`Gefundene Speicherschlüssel: ${gefunden}`);
  const fremdeSchluessel = findeFremdeSchluessel(speicher);
  expect(fremdeSchluessel, `Speicherschlüssel ohne Präfix igmg-: ${fremdeSchluessel.join(', ') || 'keine'}. Gefunden: ${gefunden}`).toEqual(
    [],
  );
});

test.describe('Gegenprobe der Prüfregeln', () => {
  test.beforeEach(({}, info) => {
    test.skip(info.project.name !== 'desktop', 'Prüfregeln nur einmal je Lauf');
  });

  test('Verstöße werden mit Namen gemeldet, Erlaubtes bleibt frei', () => {
    const funde = findeFremdeAnfragen(
      [
        'http://localhost:3100/_next/static/a.js',
        'data:image/png;base64,AAAA',
        'blob:http://localhost:3100/0c1f',
        'https://fonts.googleapis.com/css2?family=Inter',
        'http://127.0.0.1:3100/x',
        'https://cdn.jsdelivr.net/npm/paket@1.0.0/index.js',
      ],
      'localhost:3100',
    );
    expect(funde.map((f) => f.url)).toEqual([
      'https://fonts.googleapis.com/css2?family=Inter',
      'http://127.0.0.1:3100/x',
      'https://cdn.jsdelivr.net/npm/paket@1.0.0/index.js',
    ]);
    expect(funde.map((f) => f.art)).toEqual(['Dritt-Dienst (fonts.googleapis.com)', 'fremde Herkunft', 'Dritt-Dienst (cdn.)']);
  });

  test('Speicherschlüssel ohne Präfix igmg- werden gemeldet', () => {
    expect(findeFremdeSchluessel({ local: ['igmg-konzepthinweis-gesehen'], session: ['theme', 'igmg-tab'] })).toEqual([
      'sessionStorage: theme',
    ]);
  });

  test('Set-Cookie-Kopfzeilen werden erkannt', () => {
    expect(
      setCookieWerte([
        { name: 'Content-Type', value: 'text/html' },
        { name: 'set-cookie', value: 'sid=1; Path=/' },
      ]),
    ).toEqual(['sid=1; Path=/']);
  });

  test('CSP-Prüfung meldet Drittanbieter-Hosts und fehlendes default-src', () => {
    expect(pruefeCsp("default-src 'self'; img-src 'self' data: blob:")).toEqual([]);
    expect(pruefeCsp("default-src 'self'; img-src 'self' https://bilder.example.test")).toEqual(['img-src: https://bilder.example.test']);
    expect(pruefeCsp("img-src 'self'")).toEqual(['default-src fehlt']);
    expect(pruefeCsp("default-src 'none'")).toEqual(["default-src ohne 'self'"]);
  });
});
