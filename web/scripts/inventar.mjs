// Inventar-Crawl (Release-Lauf I00, Grundlage für R2, R4, R6, R7, R8, R13 und später T10/T11): besucht jede öffentliche
// Route in drei Sprachen in einem frischen Browser-Kontext, OHNE etwas anzuklicken (Zustand vor jeder Entscheidung),
// und hält fest: Status, Anfragen (eigene/fremde Herkunft), Cookies, Web-Speicher, IndexedDB, Cache Storage,
// Service Worker, iframes, Bilder ohne alt, Links, Metadaten (lang, title, description, canonical, robots, hreflang,
// JSON-LD), Kopfzeilen (CSP, HSTS, X-Robots-Tag) und axe-Verstöße. Danach werden alle internen Links geprüft.
// Aufruf: node scripts/inventar.mjs [basis-url] [ausgabe-ohne-endung]
//   Standard: http://localhost:3100 und ../_lauf/release/eingang/I00-inventar(.json|.md)
// INVENTAR_NUR=start,impressum beschränkt auf einzelne Routen-Kennungen (Probe). Nur lesend; schreibt nichts außer den beiden Ausgabedateien. Exit 0 auch bei Funden (Inventar, kein Test).
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { chromium } from '@playwright/test';
import axeModul from '@axe-core/playwright';

const AxeBuilder = axeModul.default ?? axeModul;
const [basis = 'http://localhost:3100', ausgabeArg] = process.argv.slice(2);
const ausgabe = ausgabeArg ?? join(import.meta.dirname, '..', '..', '_lauf', 'release', 'eingang', 'I00-inventar');
const HERKUNFT = new URL(basis).origin;
const HOST = new URL(basis).host;
const SPRACHEN = ['de', 'tr', 'en'];
const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

// Routen nach src/i18n/routing.ts (Deutsch ohne Präfix). [slug] wird zur Laufzeit aus der Liste ermittelt.
const ROUTEN = [
  { id: 'start', de: '/', tr: '/tr', en: '/en' },
  { id: 'gebetszeiten', de: '/gebetszeiten', tr: '/tr/namaz-vakitleri', en: '/en/prayer-times' },
  { id: 'anzeige', de: '/gebetszeiten/anzeige', tr: '/tr/namaz-vakitleri/ekran', en: '/en/prayer-times/display' },
  { id: 'veranstaltungen', de: '/veranstaltungen', tr: '/tr/etkinlikler', en: '/en/events' },
  { id: 'veranstaltung', de: '/veranstaltungen/[slug]', tr: '/tr/etkinlikler/[slug]', en: '/en/events/[slug]', liste: 'veranstaltungen' },
  { id: 'nachrichten', de: '/nachrichten', tr: '/tr/haberler', en: '/en/news' },
  { id: 'nachricht', de: '/nachrichten/[slug]', tr: '/tr/haberler/[slug]', en: '/en/news/[slug]', liste: 'nachrichten' },
  { id: 'ueberuns', de: '/ueber-uns', tr: '/tr/hakkimizda', en: '/en/about-us' },
  { id: 'vorstand', de: '/vorstand', tr: '/tr/yonetim', en: '/en/board' },
  { id: 'projekte', de: '/projekte', tr: '/tr/projeler', en: '/en/projects' },
  { id: 'kontakt', de: '/kontakt', tr: '/tr/iletisim', en: '/en/contact' },
  { id: 'igmg', de: '/igmg', tr: '/tr/igmg', en: '/en/igmg' },
  { id: 'quran', de: '/quran', tr: '/tr/kuran', en: '/en/quran' },
  { id: 'sure', de: '/quran/1', tr: '/tr/kuran/1', en: '/en/quran/1' },
  { id: 'wissen', de: '/islamisches-wissen', tr: '/tr/islami-bilgiler', en: '/en/islamic-knowledge' },
  { id: 'wissenthema', de: '/islamisches-wissen/mosque', tr: '/tr/islami-bilgiler/mosque', en: '/en/islamic-knowledge/mosque' },
  { id: 'org-at', de: '/organisationen/ana-teskilati', tr: '/tr/organizasyonlar/ana-teskilati', en: '/en/organizations/ana-teskilati' },
  {
    id: 'org-kt',
    de: '/organisationen/kadin-teskilati',
    tr: '/tr/organizasyonlar/kadin-teskilati',
    en: '/en/organizations/kadin-teskilati',
  },
  {
    id: 'org-gt',
    de: '/organisationen/genclik-teskilati',
    tr: '/tr/organizasyonlar/genclik-teskilati',
    en: '/en/organizations/genclik-teskilati',
  },
  {
    id: 'org-kgt',
    de: '/organisationen/kadin-genclik-teskilati',
    tr: '/tr/organizasyonlar/kadin-genclik-teskilati',
    en: '/en/organizations/kadin-genclik-teskilati',
  },
  { id: 'korankurse', de: '/bildung/korankurse', tr: '/tr/egitim/kuran-kurslari', en: '/en/education/quran-courses' },
  { id: 'voranmeldung', de: '/bildung/voranmeldung', tr: '/tr/egitim/on-kayit', en: '/en/education/pre-registration' },
  { id: 'mitglied', de: '/mitglied-werden', tr: '/tr/uye-ol', en: '/en/become-a-member' },
  { id: 'moschee', de: '/webseite-fuer-moscheen', tr: '/tr/camiler-icin-web-sitesi', en: '/en/website-for-mosques' },
  { id: 'meldung', de: '/meldung', tr: '/tr/bildirim', en: '/en/report' },
  { id: 'impressum', de: '/impressum', tr: '/tr/kunye', en: '/en/imprint' },
  { id: 'datenschutz', de: '/datenschutz', tr: '/tr/gizlilik', en: '/en/privacy' },
  { id: 'barrierefreiheit', de: '/barrierefreiheit', tr: '/tr/erisilebilirlik', en: '/en/accessibility' },
  { id: 'suche', de: '/suche?q=Gebet', tr: '/tr/arama?q=namaz', en: '/en/search?q=prayer' },
  { id: 'offline', de: '/offline', tr: '/tr/offline', en: '/en/offline' },
  { id: 'nichtgefunden', de: '/gibt-es-nicht', tr: '/tr/gibt-es-nicht', en: '/en/gibt-es-nicht' },
  { id: 'anmelden', de: '/verwaltung/anmelden', tr: null, en: null },
  { id: 'passwort-vergessen', de: '/verwaltung/passwort-vergessen', tr: null, en: null },
];
const RESSOURCEN = ['/robots.txt', '/sitemap.xml', '/manifest.webmanifest', '/api/health', '/sw.js', '/favicon.ico'];

// Host statt Herkunft, damit ws://gleicher-host (Entwicklungsserver) als eigen gilt
const hostVon = (url) => {
  try {
    return new URL(url).host;
  } catch {
    return null;
  }
};

async function ermittleSlug(browser, sprache, route) {
  const liste = ROUTEN.find((r) => r.id === route.liste)[sprache];
  const muster = route[sprache].replace('[slug]', '');
  const html = await (await fetch(`${HERKUNFT}${liste}`)).text();
  const treffer = new RegExp(`href="(${muster.replaceAll('/', '\\/')}[a-z0-9-]+)"`).exec(html);
  return treffer?.[1] ?? null;
}

async function besuche(browser, pfad) {
  const kontext = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'allow' });
  const seite = await kontext.newPage();
  const anfragen = [];
  seite.on('request', (a) => anfragen.push({ url: a.url(), typ: a.resourceType() }));
  seite.on('websocket', (w) => anfragen.push({ url: w.url(), typ: 'websocket' }));
  const konsole = [];
  seite.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') konsole.push(`${m.type()}: ${m.text().slice(0, 1500)}`);
  });
  const eintrag = { pfad };
  try {
    const antwort = await seite.goto(`${HERKUNFT}${pfad}`, { waitUntil: 'load', timeout: 60_000 });
    eintrag.status = antwort?.status() ?? null;
    eintrag.endAdresse = seite.url().replace(HERKUNFT, '');
    const kopf = antwort ? await antwort.allHeaders() : {};
    eintrag.kopf = {
      csp: kopf['content-security-policy'] ?? null,
      hsts: kopf['strict-transport-security'] ?? null,
      xRobotsTag: kopf['x-robots-tag'] ?? null,
      cacheControl: kopf['cache-control'] ?? null,
      setCookie: (kopf['set-cookie'] ?? '')
        .split('\n')
        .filter(Boolean)
        .map((c) => c.split('=')[0]),
    };
    await seite.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
    await seite.waitForTimeout(1500);
    Object.assign(
      eintrag,
      await seite.evaluate(async () => {
        const meta = (n) => document.querySelector(`meta[name="${n}"]`)?.getAttribute('content') ?? null;
        const idb = indexedDB.databases ? (await indexedDB.databases()).map((d) => d.name) : ['(nicht abfragbar)'];
        const caches_ = 'caches' in window ? await caches.keys() : [];
        const sw = 'serviceWorker' in navigator ? (await navigator.serviceWorker.getRegistrations()).map((r) => r.scope) : [];
        const links = [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href'));
        const jsonld = [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => {
          try {
            const d = JSON.parse(s.textContent ?? '');
            return (Array.isArray(d) ? d : (d['@graph'] ?? [d])).map((x) => x['@type']).join(',');
          } catch {
            return '(ungültig)';
          }
        });
        return {
          lang: document.documentElement.lang,
          dir: document.documentElement.dir || null,
          titel: document.title,
          beschreibung: meta('description'),
          robots: meta('robots'),
          canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? null,
          hreflang: [...document.querySelectorAll('link[rel="alternate"][hreflang]')].map((l) => `${l.hreflang}=${l.getAttribute('href')}`),
          ogBild: document.querySelector('meta[property="og:image"]')?.getAttribute('content') ?? null,
          jsonld,
          h1: [...document.querySelectorAll('h1')].map((h) => h.textContent?.trim().slice(0, 80)),
          localStorage: Object.keys(localStorage),
          sessionStorage: Object.keys(sessionStorage),
          indexedDB: idb,
          cacheStorage: caches_,
          serviceWorker: sw,
          iframes: [...document.querySelectorAll('iframe')].map((f) => f.getAttribute('src')),
          bilderOhneAlt: [...document.querySelectorAll('img:not([alt])')].map((i) => i.getAttribute('src')),
          bilderLeererAlt: [...document.querySelectorAll('img[alt=""]')].length,
          bilder: [...document.querySelectorAll('img')].length,
          links,
          platzhalterText: (document.body.innerText.match(/\[[^\]\n]{2,80}\]/g) ?? []).slice(0, 30),
          beispielText: (document.body.innerText.match(/\b(Beispiel|Örnek|Example|Lorem ipsum|Testperson|example\.(test|com))\b/gi) ?? [])
            .length,
        };
      }),
    );
    eintrag.cookies = (await kontext.cookies()).map((c) => ({ name: c.name, domain: c.domain, httpOnly: c.httpOnly, ablauf: c.expires }));
    try {
      const axe = await new AxeBuilder({ page: seite }).withTags(AXE_TAGS).analyze();
      eintrag.axe = axe.violations.map((v) => ({ id: v.id, wirkung: v.impact, knoten: v.nodes.length }));
    } catch (e) {
      eintrag.axe = [{ id: `axe-fehler: ${String(e).slice(0, 120)}`, wirkung: null, knoten: 0 }];
    }
  } catch (e) {
    eintrag.fehler = String(e).slice(0, 300);
  }
  eintrag.anfragen = {
    gesamt: anfragen.length,
    fremd: [
      ...new Set(
        anfragen.filter((a) => !a.url.startsWith('data:') && !a.url.startsWith('blob:') && hostVon(a.url) !== HOST).map((a) => a.url),
      ),
    ],
    typen: anfragen.reduce((z, a) => ({ ...z, [a.typ]: (z[a.typ] ?? 0) + 1 }), {}),
  };
  eintrag.konsole = konsole;
  await kontext.close();
  return eintrag;
}

async function pruefeLinks(alle) {
  const intern = [
    ...new Set(
      alle
        .filter((h) => h && (h.startsWith('/') || h.startsWith(HERKUNFT)) && !h.startsWith('//'))
        .map((h) => h.replace(HERKUNFT, '').split('#')[0]),
    ),
  ]
    .filter(Boolean)
    .sort();
  const extern = [...new Set(alle.filter((h) => h && /^https?:/.test(h) && !h.startsWith(HERKUNFT)))].sort();
  const sonst = [...new Set(alle.filter((h) => h && !/^(https?:|\/|#)/.test(h)))].sort();
  const ergebnisse = [];
  for (const pfad of intern) {
    try {
      const r = await fetch(`${HERKUNFT}${pfad}`, { redirect: 'manual' });
      ergebnisse.push({ pfad, status: r.status, ziel: r.headers.get('location') });
    } catch (e) {
      ergebnisse.push({ pfad, status: null, fehler: String(e).slice(0, 120) });
    }
  }
  return { intern: ergebnisse, extern, sonst };
}

const beginn = Date.now();
const browser = await chromium.launch();
const seiten = [];
try {
  const nur = process.env.INVENTAR_NUR?.split(',');
  for (const route of ROUTEN.filter((r) => !nur || nur.includes(r.id))) {
    for (const sprache of SPRACHEN) {
      let pfad = route[sprache];
      if (!pfad) continue;
      if (pfad.includes('[slug]')) {
        pfad = await ermittleSlug(browser, sprache, route);
        if (!pfad) {
          seiten.push({ id: route.id, sprache, pfad: route[sprache], fehler: 'kein Slug in der Liste gefunden' });
          continue;
        }
      }
      process.stdout.write(`${route.id} ${sprache} ${pfad} … `);
      const e = await besuche(browser, pfad);
      seiten.push({ id: route.id, sprache, ...e });
      console.log(e.status ?? e.fehler);
    }
  }
} finally {
  await browser.close();
}
const ressourcen = [];
for (const r of RESSOURCEN) {
  const a = await fetch(`${HERKUNFT}${r}`, { redirect: 'manual' }).catch((e) => ({ status: null, fehler: String(e) }));
  const text = a.text ? await a.text() : '';
  ressourcen.push({
    pfad: r,
    status: a.status,
    typ: a.headers?.get('content-type') ?? null,
    xRobotsTag: a.headers?.get('x-robots-tag') ?? null,
    auszug: text.slice(0, r === '/sitemap.xml' ? 600 : 400),
    sitemapEintraege: r === '/sitemap.xml' ? (text.match(/<loc>/g) ?? []).length : undefined,
  });
}
const links = await pruefeLinks(seiten.flatMap((s) => s.links ?? []));
const daten = {
  basis: HERKUNFT,
  zeit: new Date().toISOString(),
  dauerS: Math.round((Date.now() - beginn) / 1000),
  seiten,
  ressourcen,
  links,
};

// Zusammenfassung als Markdown
const z = [];
const vereinigt = (f) => [...new Set(seiten.flatMap(f))].sort();
z.push(
  `# I00 Inventar-Crawl\n\nBasis ${HERKUNFT} · ${daten.zeit} · ${seiten.length} Seitenaufrufe · Dauer ${daten.dauerS} s · ohne Klick (Zustand vor jeder Entscheidung), Desktop 1440 px\n`,
);
z.push('## Endgerätezugriffe (vereinigt über alle Seiten, ohne Interaktion)\n');
z.push(`- Cookies: ${vereinigt((s) => (s.cookies ?? []).map((c) => c.name)).join(', ') || 'keine'}`);
z.push(`- Set-Cookie im Dokument: ${vereinigt((s) => s.kopf?.setCookie ?? []).join(', ') || 'keine'}`);
z.push(`- localStorage: ${vereinigt((s) => s.localStorage ?? []).join(', ') || 'keine'}`);
z.push(`- sessionStorage: ${vereinigt((s) => s.sessionStorage ?? []).join(', ') || 'keine'}`);
z.push(`- IndexedDB: ${vereinigt((s) => s.indexedDB ?? []).join(', ') || 'keine'}`);
z.push(`- Cache Storage: ${vereinigt((s) => s.cacheStorage ?? []).join(', ') || 'keine'}`);
z.push(`- Service Worker (Scopes): ${vereinigt((s) => s.serviceWorker ?? []).join(', ') || 'keine'}`);
z.push(`- iframes: ${vereinigt((s) => (s.iframes ?? []).map(String)).join(', ') || 'keine'}`);
z.push(`- Fremde Anfragen: ${vereinigt((s) => s.anfragen?.fremd ?? []).join(', ') || 'keine'}\n`);
z.push('## Seiten\n');
z.push(
  '| Route | Spr. | Pfad | Status | lang | title | descr. | canonical | robots | X-Robots-Tag | hreflang | og:image | JSON-LD | axe (Regel×Knoten) | img ohne alt | Platzh. | Bsp. | Konsole |',
);
z.push('|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|');
for (const s of seiten) {
  if (s.fehler) {
    z.push(`| ${s.id} | ${s.sprache} | ${s.pfad} | FEHLER: ${s.fehler.replaceAll('|', '/')} |||||||||||||||`);
    continue;
  }
  z.push(
    `| ${s.id} | ${s.sprache} | ${s.pfad}${s.endAdresse !== s.pfad ? ` → ${s.endAdresse}` : ''} | ${s.status} | ${s.lang} | ${(s.titel ?? '').slice(0, 50).replaceAll('|', '/')} | ${s.beschreibung ? 'ja' : '**nein**'} | ${s.canonical ?? '**–**'} | ${s.robots ?? '–'} | ${s.kopf?.xRobotsTag ?? '–'} | ${s.hreflang?.length ?? 0} | ${s.ogBild ? 'ja' : 'nein'} | ${s.jsonld?.join(' ') || '–'} | ${s.axe?.map((a) => `${a.id}×${a.knoten}`).join(' ') || '0'} | ${s.bilderOhneAlt?.length ?? 0} | ${s.platzhalterText?.length ?? 0} | ${s.beispielText ?? 0} | ${s.konsole?.length ?? 0} |`,
  );
}
z.push('\n## Platzhalter-Texte (eckige Klammern, je Seite höchstens 30)\n');
for (const s of seiten.filter((x) => x.platzhalterText?.length && x.sprache === 'de'))
  z.push(`- ${s.pfad}: ${s.platzhalterText.join(' · ')}`);
z.push('\n## Kopfzeilen (Startseite de)\n');
const start = seiten.find((s) => s.id === 'start' && s.sprache === 'de');
z.push('```');
z.push(`CSP: ${start?.kopf?.csp ?? '–'}`);
z.push(`HSTS: ${start?.kopf?.hsts ?? '–'}`);
z.push(`Cache-Control: ${start?.kopf?.cacheControl ?? '–'}`);
z.push('```\n');
z.push('## Ressourcen\n');
for (const r of ressourcen)
  z.push(
    `- ${r.pfad}: ${r.status} ${r.typ ?? ''}${r.sitemapEintraege !== undefined ? ` · ${r.sitemapEintraege} <loc>` : ''}${r.xRobotsTag ? ` · X-Robots-Tag ${r.xRobotsTag}` : ''}`,
  );
z.push('\n```text');
z.push(ressourcen.find((r) => r.pfad === '/robots.txt')?.auszug ?? '');
z.push('```\n');
z.push(
  `## Links\n\nIntern geprüft: ${links.intern.length} · nicht 2xx/3xx: ${links.intern.filter((l) => !l.status || l.status >= 400).length}\n`,
);
for (const l of links.intern.filter((x) => !x.status || x.status >= 400))
  z.push(`- **${l.status ?? 'Fehler'}** ${l.pfad}${l.fehler ? ` (${l.fehler})` : ''}`);
z.push(`\nExterne Links (${links.extern.length}):`);
for (const l of links.extern) z.push(`- ${l}`);
z.push(`\nSonstige (mailto/tel/…): ${links.sonst.join(', ') || 'keine'}`);
z.push('\n## Konsolenmeldungen (einmalig)\n');
for (const k of vereinigt((s) => s.konsole ?? [])) z.push(`- ${k.replaceAll('\n', ' ')}`);

mkdirSync(dirname(ausgabe), { recursive: true });
writeFileSync(`${ausgabe}.json`, `${JSON.stringify(daten, null, 1)}\n`);
writeFileSync(`${ausgabe}.md`, `${z.join('\n')}\n`);
console.log(`Inventar geschrieben: ${ausgabe}.md / .json (${seiten.length} Aufrufe, ${daten.dauerS} s)`);
