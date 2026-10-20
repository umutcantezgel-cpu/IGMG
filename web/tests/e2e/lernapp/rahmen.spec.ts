import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import lernen from '../../../messages/bereiche/lernen.json';
import ar from '../../../messages/lernapp/ar.json';
import de from '../../../messages/lernapp/de.json';
import tr from '../../../messages/lernapp/tr.json';
import { beispielkonten, passwort } from '../hilfen/gemeinde';
import { eigeneAbsenderAdresse } from '../hilfen/konto';

/**
 * Rahmen der Lern-App (L1-03; ADR 0037 mit Fortschreibung S1, ADR 0044, KERN 4.0 §7–§8), Projekte „telefon“ (390 px) und
 * „desktop“ (1440 px):
 * - je Oberflächensprache ein Rauchtest (`html[lang][dir][data-oberflaeche]`, ar: `dir=rtl`, kein waagrechter Überlauf),
 * - axe ohne ernste und kritische Befunde auf Start, Einstellungen, Quellen und „nicht gefunden“ in de/tr/ar,
 * - Weiterleitungen (308) und 404 in der Gestalt der Lern-App (auch für die unstabile Parameter-Zuordnung eines
 *   Next-Updates: `/lern-app/xx`, `/lern-app/de/xyz`),
 * - Manifest je Sprache (eine `id`, Scope `/lern-app/`), Anmeldung des eigenen Service Workers samt Hülle – ohne
 *   `context.setOffline` (wirkt nicht auf Anfragen des Workers, Beleg S1/S6),
 * - Anmeldung im Scope mit Rückkehr in die Lern-App (E-Mail, Kinderzugang, Abmelden),
 * - Stationen auf `/lernen` der Website.
 * Bildschirmfotos für die Sichtabnahme nur mit `LERNAPP_BILDER=<ordner>`.
 */

type Ui = 'de' | 'tr' | 'ar';
const TEXTE = { de, tr, ar } as const;
const UIS: Ui[] = ['de', 'tr', 'ar'];
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

/** Pfad und Suchteil einer Adresse (Location und scriptURL können absolut sein). */
function pfadAus(adresse: string | undefined): string {
  const url = new URL(adresse ?? '', 'http://x');
  return url.pathname + url.search;
}

const KONZEPTHINWEIS = () => window.localStorage.setItem('igmg-konzepthinweis-gesehen', '1');

async function oberflaeche(page: Page) {
  return page.evaluate(() => ({
    lang: document.documentElement.lang,
    dir: document.documentElement.dir,
    oberflaeche: document.documentElement.dataset.oberflaeche ?? null,
    ueberlauf: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  }));
}

/** axe (WCAG 2.2 AA); gezählt werden ernste und kritische Befunde, als lesbare Zeilen. */
async function ernsteBefunde(page: Page, kennzeichen: string): Promise<string[]> {
  const ergebnis = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  return ergebnis.violations
    .filter((v) => v.impact === 'serious' || v.impact === 'critical')
    .map(
      (v) =>
        `${kennzeichen} ${v.id} (${v.impact}, ${v.nodes.length}): ${v.nodes
          .slice(0, 3)
          .map((n) => n.target.join(' '))
          .join(' ; ')}`,
    );
}

for (const ui of UIS) {
  const t = TEXTE[ui];
  const dir = ui === 'ar' ? 'rtl' : 'ltr';

  test.describe(`Oberfläche ${ui}`, () => {
    test('Rauchtest: Start mit lang/dir, Kurswahl, ohne waagrechten Überlauf', async ({ page }) => {
      const antwort = await page.goto(`/lern-app/${ui}`);
      expect(antwort?.status()).toBe(200);
      expect(await oberflaeche(page)).toEqual({ lang: ui, dir, oberflaeche: 'lernapp', ueberlauf: 0 });
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(t.start.titel);
      await expect(page.locator('main')).toHaveCount(1);
      // Wissen unter jeder Oberfläche (mit Hinweis „auf Deutsch“ außer in de), Koran-Arabisch nicht in ar
      await expect(page.locator(`main a[href="/lern-app/${ui}/islam"]`)).toHaveCount(1);
      await expect(page.locator(`main a[href="/lern-app/${ui}/koran"]`)).toHaveCount(ui === 'ar' ? 0 : 1);
      await expect(page.getByText(t.kurse.aufDeutsch, { exact: true })).toHaveCount(ui === 'de' ? 0 : 1);
      // Insel „Heute“: leerer Stand eines neuen Geräts
      await expect(page.getByText(t.heute.nochNichts)).toBeVisible();
      // Sprachkurse der Oberflächensprache offen, je zwei Zielsprachen
      const offen = { de: ['tr-aus-de', 'ar-aus-de'], tr: ['de-aus-tr', 'ar-aus-tr'], ar: ['de-aus-ar', 'tr-aus-ar'] }[ui];
      for (const kurs of offen) await expect(page.locator(`main a[href="/lern-app/${ui}/${kurs}"]`).first()).toBeVisible();
    });

    test('axe: Start, Einstellungen, Quellen, nicht gefunden ohne ernste oder kritische Befunde', async ({ page }) => {
      test.setTimeout(90_000);
      const befunde: string[] = [];
      for (const pfad of ['', '/einstellungen', '/quellen', '/gibt-es-nicht']) {
        await page.goto(`/lern-app/${ui}${pfad}`);
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
        expect((await oberflaeche(page)).ueberlauf, `${ui}${pfad}: Überlauf`).toBe(0);
        befunde.push(...(await ernsteBefunde(page, `${ui}${pfad || '/'}`)));
      }
      expect(befunde).toEqual([]);
    });

    test('nicht gefunden: 404 im Wurzel-Layout der Lern-App', async ({ page }) => {
      for (const pfad of [`/lern-app/${ui}/gibt-es-nicht`, `/lern-app/${ui}/a/b`]) {
        const antwort = await page.goto(pfad);
        expect(antwort?.status(), pfad).toBe(404);
        expect(await oberflaeche(page)).toMatchObject({ lang: ui, dir, oberflaeche: 'lernapp' });
        await expect(page.getByRole('heading', { level: 1 })).toHaveText(t.nichtGefunden.titel);
      }
    });

    test('Einstellungen: Tagesziel und Ausgangssprache bleiben auf dem Gerät', async ({ page }) => {
      await page.goto(`/lern-app/${ui}/einstellungen`);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(t.einstellungen.titel);
      const ziel = page.getByRole('radio', { name: t.einstellungen.zielKeins, exact: true });
      await ziel.check();
      await expect(page.getByRole('status')).toHaveText(t.einstellungen.gespeichert);
      await page.reload();
      await expect(ziel).toBeChecked();
      // Startseite übernimmt die Einstellung (kein Tagesziel)
      await page.goto(`/lern-app/${ui}`);
      await expect(page.getByText(t.heute.keinZiel)).toBeVisible();
      if (ui === 'ar') {
        await page.goto('/lern-app/ar/einstellungen');
        await expect(page.getByRole('group', { name: t.einstellungen.ziffern })).toBeVisible();
      }
    });
  });
}

test('ar: Oberflächenschrift Noto Sans Arabic ohne Verschiebung beim Laden', async ({ page }) => {
  await page.goto('/lern-app/ar');
  const messung = await page.evaluate(
    () =>
      new Promise<{ schrift: string; geladen: boolean; verschiebung: number }>((fertig) => {
        let summe = 0;
        new PerformanceObserver((liste) => {
          for (const e of liste.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[])
            if (!e.hadRecentInput) summe += e.value;
        }).observe({ type: 'layout-shift', buffered: true });
        void document.fonts.ready.then(() =>
          requestAnimationFrame(() =>
            requestAnimationFrame(() =>
              fertig({
                schrift: getComputedStyle(document.querySelector('h1') ?? document.body).fontFamily,
                geladen: [...document.fonts].some((f) => f.family.includes('schriftArabischUi') && f.status === 'loaded'),
                verschiebung: summe,
              }),
            ),
          ),
        );
      }),
  );
  expect(messung.schrift).toMatch(/^"?schriftArabischUi/);
  expect(messung.geladen).toBe(true);
  expect(messung.verschiebung).toBeLessThanOrEqual(0.1);
});

test.describe('Adressen, Manifest und Service Worker', () => {
  test.beforeEach(async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'einmal je Lauf genügt');
    await page.addInitScript(KONZEPTHINWEIS);
  });

  test('Weiterleitungen 308 und 404 für unbekannte Oberflächensprachen', async ({ request, page }) => {
    for (const [von, nach] of [
      ['/lern-app', '/lern-app/de'],
      ['/tr/lern-app', '/lern-app/tr'],
      ['/en/lern-app', '/lern-app/de'],
      ['/tr/lern-app/ar', '/lern-app/ar'],
    ]) {
      const antwort = await request.get(von, { maxRedirects: 0 });
      expect(antwort.status(), von).toBe(308);
      expect(pfadAus(antwort.headers().location), von).toBe(nach);
    }
    for (const pfad of ['/lern-app/xx', '/lern-app/xx/yy', '/lern-app/ar/koran']) {
      const antwort = await page.goto(pfad);
      expect(antwort?.status(), pfad).toBe(404);
      const lang = pfad.startsWith('/lern-app/ar') ? 'ar' : 'de';
      expect(await oberflaeche(page)).toMatchObject({ lang, oberflaeche: 'lernapp' });
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(TEXTE[lang].nichtGefunden.titel);
    }
  });

  test('Manifest je Oberflächensprache: eine id, Scope /lern-app/, Symbole', async ({ request, page }) => {
    for (const ui of UIS) {
      const antwort = await request.get(`/lern-app/${ui}/manifest.webmanifest`);
      expect(antwort.status()).toBe(200);
      expect(antwort.headers()['content-type']).toContain('application/manifest+json');
      const m = (await antwort.json()) as Record<string, unknown> & { icons: { src: string; purpose?: string }[] };
      expect(m).toMatchObject({
        id: '/lern-app/',
        scope: '/lern-app/',
        start_url: `/lern-app/${ui}`,
        lang: ui,
        dir: ui === 'ar' ? 'rtl' : 'ltr',
        name: TEXTE[ui].meta.name,
        display: 'standalone',
      });
      expect(String(m.name)).toMatch(/^\[.+\]$/);
      expect(m.icons.some((i) => i.purpose === 'maskable')).toBe(true);
      for (const i of m.icons) expect((await request.get(i.src)).status(), i.src).toBe(200);
    }
    await page.goto('/lern-app/tr');
    const links = await page.locator('link[rel="manifest"]').evaluateAll((l) => l.map((e) => e.getAttribute('href')));
    expect(links).toEqual(['/lern-app/tr/manifest.webmanifest']);
  });

  test('Service Worker: eigener Scope /lern-app/, Hülle vorgehalten, Anmeldung nie', async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto('/lern-app/de');
    const reg = await page.evaluate(async () => {
      const r = await navigator.serviceWorker.ready;
      return { scope: r.scope, skript: r.active?.scriptURL };
    });
    expect(pfadAus(reg.scope)).toBe('/lern-app/');
    expect(pfadAus(reg.skript)).toMatch(/^\/lern-app\/sw\.js\?v=[a-z0-9]{1,12}$/);
    // Die Seite bittet den Worker, die Hülle der Oberfläche vorzuhalten (Start, Fortschritt, Wortschatz, Einstellungen, Quellen)
    await expect
      .poll(
        () =>
          page.evaluate(async () => {
            const name = (await caches.keys()).find((n) => n.startsWith('igmg-lernapp-schale-v'));
            if (!name) return [];
            const c = await caches.open(name);
            return (await c.keys()).map((r) => new URL(r.url).pathname).filter((p) => !p.startsWith('/_next/'));
          }),
        { timeout: 30_000 },
      )
      .toEqual(expect.arrayContaining(['/lern-app/de', '/lern-app/de/einstellungen', '/lern-app/de/quellen']));
    await page.reload();
    await expect.poll(() => page.evaluate(() => navigator.serviceWorker.controller?.scriptURL ?? '')).toContain('/lern-app/sw.js');
    // Übungsseite unter ihrem Pfad ohne Suchteil (ignoreSearch), die Anmeldung nie
    await page.goto('/lern-app/de/tr-aus-de/ueben?l=tr.a1.e01.l01');
    await page.goto('/lern-app/de/anmelden');
    const eintraege = await page.evaluate(async () => {
      const name = (await caches.keys()).find((n) => n.startsWith('igmg-lernapp-schale-v')) ?? '';
      return (await (await caches.open(name)).keys()).map((r) => new URL(r.url).pathname + new URL(r.url).search);
    });
    expect(eintraege).toContain('/lern-app/de/tr-aus-de/ueben');
    expect(eintraege.filter((e) => e.includes('anmelden') || e.includes('?l='))).toEqual([]);
    // Der Root-Worker der Website ist hier nicht angemeldet
    const scopes = await page.evaluate(async () =>
      (await navigator.serviceWorker.getRegistrations()).map((r) => new URL(r.scope).pathname),
    );
    expect(scopes).toEqual(['/lern-app/']);
  });

  test('Website /lernen: Stationen „Sprachen lernen“ und „Wissen üben“ führen in die Lern-App', async ({ page }) => {
    for (const [pfad, sprache, ui] of [
      ['/lernen', 'de', 'de'],
      ['/tr/ogren', 'tr', 'tr'],
      ['/en/learn', 'en', 'de'],
    ] as const) {
      await page.goto(pfad);
      const l = lernen[sprache].lernen.lernApp;
      await expect(page.getByRole('link', { name: `${l.sprachenLink}: ${l.sprachenTitel}` })).toHaveAttribute('href', `/lern-app/${ui}`);
      await expect(page.getByRole('link', { name: `${l.wissenLink}: ${l.wissenTitel}` })).toHaveAttribute('href', `/lern-app/${ui}/islam`);
    }
  });
});

test.describe('Anmeldung im Scope der Lern-App', () => {
  test.beforeEach(async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'einmal je Lauf genügt');
    await eigeneAbsenderAdresse(page);
  });

  test('E-Mail und Passwort: zurück in die Lern-App, angemeldet, abmelden bleibt im Scope', async ({ page }) => {
    test.setTimeout(90_000);
    const konten = beispielkonten() as unknown as { gemeinde: { email: string; passwort: string | null } };
    const antwort = await page.goto('/lern-app/de/anmelden?weiter=/lern-app/de/einstellungen');
    expect(antwort?.headers()['cache-control']).toContain('no-store');
    await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute('content', /noindex/);
    expect(await oberflaeche(page)).toMatchObject({ lang: 'de', dir: 'ltr', oberflaeche: 'lernapp' });
    await page.getByLabel(de.anmelden.email).fill(konten.gemeinde.email);
    await page.locator('#anmelden-passwort').fill(passwort(konten.gemeinde.passwort));
    await page.getByRole('button', { name: de.anmelden.absenden, exact: true }).first().click();
    // Pfad prüfen, nicht das Ende der Adresse: die Anmeldeseite selbst endet auf `?weiter=/lern-app/de/einstellungen`
    await expect(page).toHaveURL((url) => url.pathname === '/lern-app/de/einstellungen');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(de.einstellungen.titel);
    await page.goto('/lern-app/de/anmelden');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(de.anmelden.angemeldet);
    await page.getByRole('button', { name: de.anmelden.abmelden }).click();
    await expect(page).toHaveURL(/\/lern-app\/de\/anmelden\?hinweis=abgemeldet$/);
    await expect(page.getByText(de.anmelden.abgemeldet)).toBeVisible();
  });

  test('Kinderzugang (tr): Benutzername und Passwort, danach Start der Lern-App', async ({ page }) => {
    test.setTimeout(90_000);
    const konten = beispielkonten();
    await page.goto('/lern-app/tr/anmelden?zugang=kind');
    await expect(page.getByRole('tab', { name: tr.anmelden.reiterKind })).toHaveAttribute('aria-selected', 'true');
    await page.getByLabel(tr.anmelden.benutzername).fill(konten.kind.benutzername);
    await page.locator('#kind-passwort').fill(passwort(konten.kind.passwort));
    await page.locator('#bereich-kind').getByRole('button', { name: tr.anmelden.absenden, exact: true }).click();
    await expect(page).toHaveURL((url) => url.pathname === '/lern-app/tr');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(tr.start.titel);
  });

  test('falsches Passwort: Meldung in der Oberflächensprache (ar), Fokus auf der Meldung', async ({ page }) => {
    await page.goto('/lern-app/ar/anmelden');
    await page.getByLabel(ar.anmelden.email).fill('niemand@example.test');
    await page.locator('#anmelden-passwort').fill('falsch-falsch-falsch');
    await page.getByRole('button', { name: ar.anmelden.absenden, exact: true }).first().click();
    await expect(page.locator('#anmelden-meldung')).toHaveText(ar.anmelden.fehler.anmelden);
    await expect(page.locator('#anmelden-meldung')).toBeFocused();
  });
});

test('Bildschirmfotos für die Sichtabnahme (nur mit LERNAPP_BILDER)', async ({ page }, info) => {
  const ordner = process.env.LERNAPP_BILDER ?? '';
  test.skip(!ordner, 'nur auf Wunsch');
  mkdirSync(ordner, { recursive: true });
  const breite = info.project.name === 'telefon' ? 390 : 1440;
  for (const ui of UIS)
    for (const [name, pfad] of [
      ['start', ''],
      ['einstellungen', '/einstellungen'],
    ]) {
      await page.goto(`/lern-app/${ui}${pfad}`);
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: join(ordner, `lernapp-${ui}-${name}-${breite}.png`), fullPage: true });
    }
});
