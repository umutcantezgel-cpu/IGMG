import AxeBuilder from '@axe-core/playwright';
import { test as basis, expect, type Page } from '@playwright/test';
import quran from '../../messages/bereiche/quran.json';
import { TAG } from '../../src/lib/cache/tags';
import { entferneTestRezitation, erneuereCaches, legeTestRezitationAn, type TestRezitation } from './hilfen/rezitation';

/**
 * Player des Koran-Lesers mit aktiver Rezitation (Z-16, F-28; Endprüfung Stufe C: „Eine E2E für den Player mit aktiver
 * Rezitation gibt es weiterhin nicht“): Abspielen, Vers-Hervorhebung wandert (auch das Wort), Vers wiederholen ×3,
 * Tempo, Bedienung per Tastatur, Quellenzeile, 390 px und axe im geöffneten Player. Testdaten nur SYNTHETISCH: ein
 * Sinuston je Vers aus `hilfen/rezitation-anlegen.ts` (WAV → Ogg/Opus mit ffmpeg), nie eine Rezitation; dazu eine
 * Test-Vereinbarung, Vers- und Wortzeiten. Nach dem Lauf wird alles wieder entfernt.
 *
 * Seriell und nur im Projekt „desktop“ (390 px über die Fenstergröße im letzten Test): Eine aktive Rezitation gilt für die
 * ganze Website. Deshalb steht hier auch die Prüfung „ohne aktive Rezitation“ (vorher quran-leser.spec.ts) – vor dem
 * Anlegen, damit kein paralleler Lauf sie mit der Test-Rezitation sieht.
 *
 * Echter Lauf (playwright.config.ts, PostgreSQL + Mailpit): legt die Rezitation über das Skript in der E2E-Datenbank an
 * und lässt mit WARTUNG_TOKEN (.env) nur den Cache der Rezitationen verfallen (`REZITATION_CACHE`). Ersatzlauf gegen einen
 * Entwicklungsserver mit PGlite (playwright.lokal.config.ts): die Rezitation VOR dem Serverstart anlegen
 * (`… rezitation-anlegen.ts --json > datei`) und E2E_TESTREZITATION=<datei> setzen – dann legt die Spec nichts an und
 * entfernt nichts.
 */
const T = quran.de.quranSeite;
const P = T.player;
const fuelle = (vorlage: string, werte: Record<string, string | number>) =>
  vorlage.replace(/\{(\w+)\}/g, (_g, k: string) => String(werte[k] ?? ''));

/** Chromium ohne Autoplay-Sperre: Wiederholungen spielen ohne neuen Klick (wie die Werkstatt-Spec). */
const test = basis.extend({
  launchOptions: [
    async ({ launchOptions }, use) => {
      await use({ ...launchOptions, args: [...(launchOptions.args ?? []), '--autoplay-policy=no-user-gesture-required'] });
    },
    { scope: 'worker' },
  ],
});
test.describe.configure({ mode: 'serial' });

/**
 * Gezielte Cache-Erneuerung (Stufe C N6, wie `lernapp/koran.spec.ts`): derselbe Tag, den die Verwaltung beim Aktivieren und
 * Entfernen einer Rezitation verfallen lässt (`server/actions/rezitationen.ts`). Alle Start-Tags verfallen zu lassen, baute
 * mitten im parallelen Lauf auch alle Kursverzeichnisse der Lern-App kalt neu (`lernapp`, `einstellungen`).
 */
const REZITATION_CACHE = [TAG.rezitationen];

let rez: (TestRezitation & { vorhanden: boolean }) | null = null;

test.beforeEach(async ({ context }, info) => {
  test.skip(info.project.name !== 'desktop', 'Eine aktive Rezitation gilt für die ganze Website – einmal je Lauf');
  await context.addInitScript(() => {
    try {
      window.localStorage.setItem('igmg-konzepthinweis-gesehen', '1');
    } catch {
      // Kein Speicher verfügbar: der Hinweis bleibt sichtbar.
    }
  });
});

test.afterAll(async ({ baseURL }) => {
  if (!rez || rez.vorhanden) return;
  entferneTestRezitation(rez);
  await erneuereCaches(baseURL ?? 'http://localhost:3100', REZITATION_CACHE);
});

async function leserBereit(page: Page) {
  await expect(page.locator('.vers-ar').first(), 'Koran-Text fehlt: E2E-Datenbank ohne Inhaltsimport?').toBeVisible();
  await expect(page.locator('.leser.leser-bereit')).toHaveCount(1);
}

const vers = (page: Page, nr: number) => page.locator(`ol[data-sure="${rez?.sure}"] > li[data-v="${nr}"]`);
const player = (page: Page) => page.getByRole('region', { name: P.titel, exact: true });

/** Leser öffnen und den Player über „Abspielen“ in der Werkzeugleiste starten; wartet, bis der Ton läuft. */
async function oeffnePlayer(page: Page) {
  await page.goto(`/quran/${rez?.sure}`);
  await leserBereit(page);
  await page.getByRole('group', { name: T.leser.werkzeuge }).getByRole('button', { name: T.leser.abspielen, exact: true }).click();
  await expect(player(page)).toBeVisible();
  await expect(player(page).getByRole('button', { name: P.pause, exact: true })).toBeVisible({ timeout: 15_000 });
}

/** Tab drücken, bis das Element mit dieser Beschriftung den Fokus hat (höchstens `max` Schritte). */
async function tabBis(page: Page, name: string, rueckwaerts = false, max = 40) {
  for (let i = 0; i < max; i++) {
    await page.keyboard.press(rueckwaerts ? 'Shift+Tab' : 'Tab');
    if ((await page.evaluate(() => document.activeElement?.getAttribute('aria-label') ?? '')) === name) return;
  }
  throw new Error(`Kein Fokus auf „${name}“ nach ${max} Tabs`);
}

test('ohne aktive Rezitation: ruhiger Hinweis statt Abspiel-Knopf (390 und 1440 px)', async ({ page }) => {
  test.skip(Boolean(process.env.E2E_TESTREZITATION), 'Test-Rezitation wurde schon vor dem Serverstart angelegt');
  for (const breite of [1440, 390]) {
    await page.setViewportSize({ width: breite, height: breite === 390 ? 844 : 900 });
    await page.goto('/quran/36');
    await leserBereit(page);
    await expect(page.getByRole('button', { name: T.leser.abspielen, exact: true })).toHaveCount(0);
    if (breite === 390) await page.getByRole('button', { name: T.leser.ansicht }).click();
    await expect(page.getByText(T.leser.rezitationFolgt).filter({ visible: true })).toBeVisible();
  }
});

test('Testdaten: aktive Rezitation mit synthetischem Testton, Vereinbarung und Zeiten', async ({ baseURL, request }) => {
  test.setTimeout(120_000);
  rez = legeTestRezitationAn();
  await erneuereCaches(baseURL ?? 'http://localhost:3100', REZITATION_CACHE);
  expect(rez.id).toMatch(/^e2e-testton-/);
  expect(rez.verse).toBeGreaterThanOrEqual(2);
  // Audio über die eigene Route, mit Byte-Bereichen (Springen an Versanfänge)
  const teil = await request.get(rez.audio, { headers: { Range: 'bytes=0-99' } });
  expect(teil.status()).toBe(206);
  expect(teil.headers()['content-type']).toBe(rez.mime);
  const zeiten = await request.get(`/api/quran/${rez.sure}/zeiten/${rez.id}`);
  expect(zeiten.status()).toBe(200);
  expect(((await zeiten.json()) as { verse: unknown[] }).verse).toHaveLength(rez.verse);
});

test('Abspielen: Quellenzeile, Vers- und Wort-Hervorhebung, Hervorhebung wandert zum nächsten Vers', async ({ page }) => {
  test.skip(!rez, 'braucht die Testdaten aus dem vorigen Test');
  const r = rez as TestRezitation;
  await oeffnePlayer(page);
  const p = player(page);
  await expect(p.getByText(fuelle(P.quelle, { rezitator: r.rezitator, lizenz: r.lizenz }), { exact: true })).toBeVisible();
  await expect(p.getByText(fuelle(P.stelle, { sure: r.sure, vers: 1 }), { exact: true })).toBeVisible();
  await expect(vers(page, 1)).toHaveAttribute('data-aktiv', '');
  // Die Datei kommt aus der eigenen Route
  const quelle = await p.locator('audio').evaluate((a: HTMLAudioElement) => new URL(a.currentSrc).pathname);
  expect(quelle).toBe(r.audio);
  // Wort im Takt hervorgehoben (CSS Custom Highlight API, sonst Klasse am Wort)
  await expect
    .poll(() =>
      page.evaluate(() => ('highlights' in CSS ? CSS.highlights.has('quran-wort') : document.querySelector('.wort-aktiv') !== null)),
    )
    .toBe(true);
  // Hervorhebung wandert: Vers 2 aktiv, Vers 1 nicht mehr
  await expect(vers(page, 2)).toHaveAttribute('data-aktiv', '', { timeout: r.versMs * 2 + 5000 });
  await expect(vers(page, 1)).not.toHaveAttribute('data-aktiv');
  await expect(p.getByText(fuelle(P.stelle, { sure: r.sure, vers: 2 }), { exact: true })).toBeVisible();
  expect(await p.locator('audio').evaluate((a: HTMLAudioElement) => a.currentTime)).toBeGreaterThanOrEqual(r.versMs / 1000);
});

test('Vers wiederholen ×3: Vers 1 spielt dreimal, dann Vers 2', async ({ page }) => {
  test.skip(!rez, 'braucht die Testdaten');
  const r = rez as TestRezitation;
  test.setTimeout(r.versMs * 6 + 60_000);
  await oeffnePlayer(page);
  const p = player(page);
  await p.getByRole('button', { name: P.pause, exact: true }).click();
  await expect(p.getByRole('button', { name: P.abspielen, exact: true })).toBeVisible();
  await p.getByLabel(P.wiederholen).selectOption('3');
  // Jedes Abspielen mit dem dann aktiven Vers mitschreiben
  await p.locator('audio').evaluate((a: HTMLAudioElement) => {
    const w = window as unknown as { __abspielen: string[] };
    w.__abspielen = [];
    a.addEventListener('play', () => w.__abspielen.push(document.querySelector<HTMLElement>('li[data-aktiv]')?.dataset.v ?? '?'));
  });
  await p.getByRole('button', { name: P.abspielen, exact: true }).click();
  await expect(vers(page, 2)).toHaveAttribute('data-aktiv', '', { timeout: r.versMs * 3 + 10_000 });
  const abspielen = await page.evaluate(() => (window as unknown as { __abspielen: string[] }).__abspielen);
  expect(abspielen.filter((v) => v === '1')).toHaveLength(3);
  expect(abspielen.at(-1)).toBe('2');
});

test('Tempo: 0,75× und 1,25× wirken auf die Wiedergabe und bleiben beim nächsten Vers', async ({ page }) => {
  test.skip(!rez, 'braucht die Testdaten');
  await oeffnePlayer(page);
  const p = player(page);
  const audio = p.locator('audio');
  await p.getByLabel(P.tempo).selectOption('1.25');
  await expect.poll(() => audio.evaluate((a: HTMLAudioElement) => a.playbackRate)).toBe(1.25);
  await p.getByLabel(P.tempo).selectOption('0.75');
  await expect.poll(() => audio.evaluate((a: HTMLAudioElement) => a.playbackRate)).toBe(0.75);
  await p.getByRole('button', { name: P.weiter, exact: true }).click();
  await expect(vers(page, 2)).toHaveAttribute('data-aktiv', '');
  await expect.poll(() => audio.evaluate((a: HTMLAudioElement) => a.playbackRate)).toBe(0.75);
});

test('Tastatur: öffnen, nächster und vorheriger Vers, anhalten und weiter, schließen', async ({ page }) => {
  test.skip(!rez, 'braucht die Testdaten');
  await page.goto(`/quran/${rez?.sure}`);
  await leserBereit(page);
  const start = page.getByRole('group', { name: T.leser.werkzeuge }).getByRole('button', { name: T.leser.abspielen, exact: true });
  await start.focus();
  await page.keyboard.press('Enter');
  const p = player(page);
  await expect(p.getByRole('button', { name: P.pause, exact: true })).toBeVisible({ timeout: 15_000 });
  await tabBis(page, P.weiter);
  await page.keyboard.press('Enter');
  await expect(vers(page, 2)).toHaveAttribute('data-aktiv', '');
  await tabBis(page, P.vorher, true);
  await page.keyboard.press('Enter');
  await expect(vers(page, 1)).toHaveAttribute('data-aktiv', '');
  // Anhalten und weiter mit der Leertaste auf dem Abspielknopf (er wechselt seine Beschriftung, der Fokus bleibt)
  await tabBis(page, P.pause);
  await page.keyboard.press('Space');
  await expect(p.getByRole('button', { name: P.abspielen, exact: true })).toBeFocused();
  expect(await p.locator('audio').evaluate((a: HTMLAudioElement) => a.paused)).toBe(true);
  await page.keyboard.press('Space');
  await expect(p.getByRole('button', { name: P.pause, exact: true })).toBeFocused();
  // Wiederholen per Tastatur (Pfeil nach unten in der Auswahl)
  await p.getByLabel(P.wiederholen).focus();
  await page.keyboard.press('ArrowDown');
  await expect(p.getByLabel(P.wiederholen)).toHaveValue('3');
  await tabBis(page, P.schliessen);
  await page.keyboard.press('Enter');
  await expect(player(page)).toHaveCount(0);
  await expect(page.locator('li[data-aktiv]')).toHaveCount(0);
});

test('390 px: Player ohne Überlauf, Bedienelemente mindestens 44 px; axe ohne Befund im geöffneten Player', async ({ page }) => {
  test.skip(!rez, 'braucht die Testdaten');
  await page.setViewportSize({ width: 390, height: 844 });
  await oeffnePlayer(page);
  const p = player(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  for (const ziel of await p.locator('button, select, label:has(input[type="checkbox"])').all()) {
    const box = await ziel.boundingBox();
    expect(box?.height ?? 0, `Höhe von ${await ziel.evaluate((e) => e.outerHTML.slice(0, 80))}`).toBeGreaterThanOrEqual(44);
  }
  await p.getByRole('button', { name: P.pause, exact: true }).click();
  const axe = await new AxeBuilder({ page })
    .include('section.player')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(axe.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
});
