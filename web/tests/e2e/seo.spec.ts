import { expect, test } from '@playwright/test';

/**
 * Suche und Antwortmaschinen (ADR 0049, Plan Marktstart P8): Jede Adresse aus /sitemap.xml wird nur abgerufen (kein
 * Browser) und im HTML geprüft – Antwort 200, Titel mit „Wetzlar“ ohne Platzhalter, Beschreibung 50–160 Zeichen ohne
 * Platzhalter, canonical = eigene Adresse, hreflang de/tr/en/x-default, genau eine h1, jedes JSON-LD parsebar, kein
 * img/script/iframe von fremden Hosts (statischer K-14-Schutz) und `noindex` nur dort, wo es gewollt ist.
 * Die Indexierungs-Schranke wird an /llms.txt erkannt (404 = Konzept-Hinweis auf Vercel aktiv): Dann muss jede Seite
 * `noindex` tragen, sonst keine außer den Ausnahmen. Auch gegen live:
 * `E2E_BASIS=https://… pnpm exec playwright test -c playwright.lokal.config.ts tests/e2e/seo.spec.ts --project desktop`.
 */

type Regel = 'status' | 'titel' | 'beschreibung' | 'canonical' | 'hreflang' | 'h1' | 'jsonld' | 'fremd' | 'noindex';

/**
 * Bewusste Ausnahmen je Regel (Adressmuster auf den Pfad, mit Grund). Ausnahmen für feste Texte müssen noch greifen,
 * sonst werden sie gemeldet und gehören gelöscht. Ausnahmen für gepflegte Inhalte (`mussGreifen: false`) hängen vom
 * Datenstand ab (Seed der E2E-Datenbank, live die Gemeinde) und bleiben bis zum Marktstart-Stand stehen.
 * Befund des ersten Laufs (28.10.2026, Beispielmodus, 1158 Adressen): nur Beschreibungen – alles andere ohne Befund.
 */
const AUSNAHMEN: { muster: RegExp; regel: Regel; grund: string; mussGreifen?: boolean }[] = [
  {
    muster: /^(\/(tr|en))?\/(gebetszeiten\/anzeige|namaz-vakitleri\/ekran|prayer-times\/display)$/,
    regel: 'noindex',
    grund: 'Vollbild für den Bildschirm der Moschee, absichtlich noindex; steht nicht in der Sitemap (ADR 0049)',
    mussGreifen: false,
  },
  // Feste Texte (messages) haben keine Ausnahme mehr: Welle 3 hat elifbe.buchstabe.untertitel (en),
  // elifbe.lektion.untertitel (tr) und meldung.untertitel (tr) auf mindestens 50 Zeichen verlängert.
  // Gepflegte Inhalte des Seeds (Beispielinhalte, ist_beispiel, G-05): Die Gemeinde ersetzt sie vor dem Start (Startklar
  // „inhalte.beispiele“ und „inhalte.platzhalter-*“); bis dahin bleiben die Ausnahmen, Texte des Seeds ändert Welle 3 nicht.
  {
    muster: /^(\/(tr|en))?\/(organisationen|organizasyonlar|organizations)\/[a-z-]+$/,
    regel: 'beschreibung',
    grund:
      'Untertitel der Organisationsseiten (Seiteninhalt organisation-*, Leitsatz) unter 50 Zeichen – Beispielinhalt mit Platzhaltern (Adresse, Telefon), den die Gemeinde pflegt',
    mussGreifen: false,
  },
  {
    muster: /^(\/(tr|en))?\/(veranstaltungen|etkinlikler|events)\/(gemeindeversammlung|korankurs-fuer-kinder|freitagsgebet-mit-khutba)$/,
    regel: 'beschreibung',
    grund: 'Kurztexte der Beispiel-Veranstaltungen in tr/en unter 50 Zeichen',
    mussGreifen: false,
  },
  {
    muster: /^(\/(tr|en))?\/(nachrichten|haberler|news)\/(neuer-imam-stellt-sich-vor|eroeffnung-der-neuen-fatih-moschee)$/,
    regel: 'beschreibung',
    grund: 'Kurztexte der Beispiel-Neuigkeiten mit Platzhalter ([Name – Imam], [Datum – von der Gemeinde])',
    mussGreifen: false,
  },
  {
    muster: /^\/(unsere-moschee|tr\/camimiz|en\/our-mosque)$/,
    regel: 'beschreibung',
    grund: 'Beschreibung der Beispiel-Seite im CMS ist ein Platzhalter',
    mussGreifen: false,
  },
];

const SPRACHEN = ['de', 'tr', 'en', 'x-default'] as const;
const BESCHREIBUNG = { min: 50, max: 160 };

/** Häufige HTML-Entitäten in Attributen und Titeln (React/Next maskieren &, <, >, " und '). */
function entschluesselt(text: string): string {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

/** Attribute eines Tags (Name in Kleinbuchstaben → Wert). */
function attribute(tag: string): Record<string, string> {
  return Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map((m) => [m[1].toLowerCase(), entschluesselt(m[2])]));
}

/** Alle öffnenden Tags eines Namens mit ihren Attributen. */
function tags(html: string, name: string): Record<string, string>[] {
  return [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'gi'))].map((m) => attribute(m[0]));
}

/**
 * Befunde einer Seite. `url` = Adresse aus der Sitemap, `html` = Antworttext, `robotsKopf` = X-Robots-Tag,
 * `noindexErwartet` = Schranke aktiv.
 */
function pruefeSeite(url: string, html: string, robotsKopf: string | null, noindexErwartet: boolean): { regel: Regel; text: string }[] {
  const befunde: { regel: Regel; text: string }[] = [];
  const melde = (regel: Regel, text: string) => befunde.push({ regel, text });
  const eigenerHost = new URL(url).host;

  const titel = entschluesselt(/<title>([^<]*)<\/title>/i.exec(html)?.[1] ?? '');
  if (!titel.includes('Wetzlar') || titel.includes('[')) melde('titel', `Titel „${titel}“`);

  const metas = tags(html, 'meta');
  const beschreibung = metas.find((m) => m.name === 'description')?.content ?? '';
  if (beschreibung.length < BESCHREIBUNG.min || beschreibung.length > BESCHREIBUNG.max || beschreibung.includes('['))
    melde('beschreibung', `Beschreibung (${beschreibung.length} Zeichen) „${beschreibung.slice(0, 80)}“`);

  const links = tags(html, 'link');
  const canonical = links.find((l) => l.rel === 'canonical')?.href;
  // Vergleich normalisiert: Next schreibt die Startseite ohne abschließenden Schrägstrich („https://…“ = „https://…/“)
  if (!canonical || new URL(canonical).href !== new URL(url).href) melde('canonical', `canonical ${canonical ?? 'fehlt'}`);
  const hreflang = new Set(links.filter((l) => l.rel === 'alternate' && l.hreflang).map((l) => l.hreflang));
  const fehlend = SPRACHEN.filter((s) => !hreflang.has(s));
  if (fehlend.length) melde('hreflang', `hreflang fehlt: ${fehlend.join(', ')}`);

  const h1 = (html.match(/<h1[\s>]/gi) ?? []).length;
  if (h1 !== 1) melde('h1', `${h1} h1-Überschriften`);

  for (const m of html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      JSON.parse(m[1]);
    } catch {
      melde('jsonld', `JSON-LD nicht parsebar: ${m[1].slice(0, 60)}`);
    }
  }

  for (const name of ['img', 'script', 'iframe']) {
    for (const t of tags(html, name)) {
      const quellen = [t.src, ...(t.srcset ?? '').split(',').map((s) => s.trim().split(/\s+/)[0])].filter(Boolean);
      for (const q of quellen) {
        const host = new URL(q, url).host;
        if (host !== eigenerHost) melde('fremd', `<${name}> von ${host}`);
      }
    }
  }

  const robots = [metas.find((m) => m.name === 'robots')?.content ?? '', robotsKopf ?? ''].join(',');
  const noindex = /noindex/i.test(robots);
  if (noindex !== noindexErwartet) melde('noindex', noindex ? `unerwartet noindex (${robots})` : 'noindex fehlt trotz aktiver Schranke');
  return befunde;
}

/** Adressen (<loc>) einer Sitemap. */
function adressenAus(xml: string): string[] {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => entschluesselt(m[1].trim()));
}

// Nur Abrufe ohne Browser: einmal je Lauf genügt (Projekt „desktop“)
test.skip(({ isMobile }) => isMobile, 'einmal je Lauf genügt');

test.describe('SEO aller Sitemap-Adressen', () => {
  test('Titel, Beschreibung, canonical, hreflang, h1, JSON-LD, Fremdquellen und noindex', async ({ request }) => {
    test.setTimeout(15 * 60_000);
    const sitemap = await request.get('/sitemap.xml');
    expect(sitemap.status()).toBe(200);
    const adressen = adressenAus(await sitemap.text());
    expect(adressen.length).toBeGreaterThan(100);
    expect(new Set(adressen).size, 'doppelte Adressen in der Sitemap').toBe(adressen.length);

    const llms = await request.get('/llms.txt');
    expect([200, 404], '/llms.txt antwortet mit 200 oder 404 (Schranke)').toContain(llms.status());
    const schranke = llms.status() === 404;
    if (!schranke) expect(await llms.text()).toMatch(/^# IGMG Wetzlar\n/);

    const befunde: string[] = [];
    const genutzt = new Set<number>();
    // Fünf Abrufe gleichzeitig: schnell genug, ohne den Server zu überlasten
    for (let i = 0; i < adressen.length; i += 5) {
      await Promise.all(
        adressen.slice(i, i + 5).map(async (url) => {
          const pfad = new URL(url).pathname;
          // Relativ zur Basis abrufen: Die Sitemap nennt die öffentliche Adresse (APP_URL), geprüft wird E2E_BASIS
          const antwort = await request.get(pfad, { maxRedirects: 0 });
          const gefunden =
            antwort.status() === 200
              ? pruefeSeite(url, await antwort.text(), antwort.headers()['x-robots-tag'] ?? null, schranke)
              : [{ regel: 'status' as const, text: `HTTP ${antwort.status()}` }];
          for (const b of gefunden) {
            const a = AUSNAHMEN.findIndex((x) => x.regel === b.regel && x.muster.test(pfad));
            if (a >= 0) genutzt.add(a);
            else befunde.push(`${pfad}: ${b.text}`);
          }
        }),
      );
    }
    expect(befunde).toEqual([]);
    expect(AUSNAHMEN.filter((a, i) => a.mussGreifen !== false && !genutzt.has(i)).map((a) => `Ausnahme ohne Treffer: ${a.muster}`)).toEqual(
      [],
    );
  });
});

test.describe('Prüfregeln der SEO-Prüfung', () => {
  const url = 'https://example.test/kontakt';
  const kopf = (zusatz = '') =>
    `<title>Kontakt &amp; Anfahrt · IGMG Wetzlar</title><meta name="description" content="${'x'.repeat(80)}"/>` +
    `<link rel="canonical" href="${url}"/>` +
    ['de', 'tr', 'en', 'x-default'].map((s) => `<link rel="alternate" hrefLang="${s}" href="${url}"/>`).join('') +
    zusatz;

  test('eine saubere Seite ergibt keine Befunde', () => {
    const html = `${kopf()}<h1>Kontakt</h1><script type="application/ld+json">{"@context":"https://schema.org"}</script><img src="/bilder/a.webp"/>`;
    expect(pruefeSeite(url, html, null, false)).toEqual([]);
  });

  test('Verstöße werden je Regel gemeldet', () => {
    const html =
      '<title>[Titel]</title><meta name="description" content="kurz"/><meta name="robots" content="noindex, follow"/>' +
      '<h1>A</h1><h1>B</h1><script type="application/ld+json">{kaputt</script><iframe src="https://www.youtube.com/embed/x"></iframe>' +
      '<img srcSet="https://fremd.example/b.webp 1x"/>';
    expect(pruefeSeite(url, html, null, false).map((b) => b.regel)).toEqual([
      'titel',
      'beschreibung',
      'canonical',
      'hreflang',
      'h1',
      'jsonld',
      'fremd',
      'fremd',
      'noindex',
    ]);
  });

  test('aktive Schranke: noindex ist Pflicht, auch per X-Robots-Tag', () => {
    const html = `${kopf()}<h1>Kontakt</h1>`;
    expect(pruefeSeite(url, html, null, true).map((b) => b.regel)).toEqual(['noindex']);
    expect(pruefeSeite(url, html, 'noindex, follow', true)).toEqual([]);
    expect(pruefeSeite(url, `${kopf('<meta name="robots" content="noindex, follow"/>')}<h1>K</h1>`, null, true)).toEqual([]);
  });

  test('Adressen aus der Sitemap', () => {
    expect(
      adressenAus('<urlset><url><loc>https://example.test/</loc></url><url><loc>https://example.test/tr?a=1&amp;b=2</loc></url></urlset>'),
    ).toEqual(['https://example.test/', 'https://example.test/tr?a=1&b=2']);
  });
});
