import AxeBuilder from '@axe-core/playwright';
import { test as basis, expect as basisExpect, type Page } from '@playwright/test';
import texte from '../../messages/verwaltung/rezitationen.json';
import { angemeldetesKonto } from './hilfen/konto';

/**
 * Rezitations-Werkstatt (O-Q02, H-Q05, ADR 0029, Z-16): Rezitation anlegen, Testton hochladen, Versgrenzen aus Stille
 * vorschlagen, per Tastatur verschieben und speichern, Wörter mitklopfen, Prüfwiedergabe mit Hervorhebung und
 * Bestätigung; Aufnahme mit dem Ersatz-Mikrofon von Chromium. Testdaten nur synthetisch: Der Testton (Sinus mit
 * Pausen) entsteht im Browser (Web Audio + MediaRecorder), nie eine Rezitation.
 *
 * Lokal ohne PostgreSQL (playwright.lokal.config.ts): Anmeldezustand über E2E_ZUSTAND (storageState einer Verwaltungs-
 * sitzung mit TOTP, z. B. aus _gemeinde/werkzeuge/anmeldung.mjs); sonst Anmeldung per Einladung (religiöse Prüfung).
 */
const t = texte.rezitationen;
const w = t.werkstatt;
const ZUSTAND = process.env.E2E_ZUSTAND;
/** Erstes Kompilieren im Entwicklungsserver und Auswerten im Browser brauchen Zeit. */
const expect = basisExpect.configure({ timeout: 30_000 });

/** Chromium mit Ersatz-Mikrofon (ohne Rückfrage) und ohne Autoplay-Sperre (Testton im Browser erzeugen und abspielen). */
const test = basis.extend({
  launchOptions: [
    async ({ launchOptions }, use) => {
      await use({
        ...launchOptions,
        args: [
          ...(launchOptions.args ?? []),
          '--use-fake-device-for-media-stream',
          '--use-fake-ui-for-media-stream',
          '--autoplay-policy=no-user-gesture-required',
        ],
      });
    },
    { scope: 'worker' },
  ],
});

test.use({ permissions: ['microphone'], ...(ZUSTAND ? { storageState: ZUSTAND } : {}) });
test.describe.configure({ mode: 'serial' });

test.beforeEach(async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'Verwaltungsabläufe nur einmal je Lauf');
  await page.addInitScript(() => window.localStorage.setItem('igmg-konzepthinweis-gesehen', '1'));
});

async function anmelden(page: Page) {
  if (ZUSTAND) await page.goto('/verwaltung');
  else await angemeldetesKonto(page, 'religioese_pruefung');
}

/** Synthetischer Testton: drei Sinus-Töne (1 s, 330 Hz) mit je 0,7 s Stille, als WebM/Opus aus dem MediaRecorder. */
async function testton(page: Page): Promise<Buffer> {
  const base64 = await page.evaluate(async () => {
    const ctx = new AudioContext({ sampleRate: 48_000 });
    await ctx.resume();
    const ziel = ctx.createMediaStreamDestination();
    const ton = ctx.createOscillator();
    ton.frequency.value = 330;
    const lautstaerke = ctx.createGain();
    lautstaerke.gain.value = 0;
    ton.connect(lautstaerke).connect(ziel);
    const t0 = ctx.currentTime + 0.2;
    for (const [a, b] of [
      [0.3, 1.3],
      [2.0, 3.0],
      [3.7, 4.7],
    ]) {
      lautstaerke.gain.setValueAtTime(0.5, t0 + a);
      lautstaerke.gain.setValueAtTime(0, t0 + b);
    }
    const rec = new MediaRecorder(ziel.stream, { mimeType: 'audio/webm;codecs=opus' });
    const teile: Blob[] = [];
    rec.ondataavailable = (e) => teile.push(e.data);
    const gestoppt = new Promise((fertig) => (rec.onstop = fertig));
    ton.start();
    rec.start();
    await new Promise((fertig) => setTimeout(fertig, 5300));
    rec.stop();
    await gestoppt;
    ton.stop();
    await ctx.close();
    const bytes = new Uint8Array(await new Blob(teile).arrayBuffer());
    let text = '';
    for (const b of bytes) text += String.fromCharCode(b);
    return btoa(text);
  });
  return Buffer.from(base64, 'base64');
}

/** Beschriftung am Anfang (Pflichtfeld-Zusatz folgt), Sonderzeichen maskiert. */
const beginnt = (text: string) => new RegExp(`^${text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`);

const fuelle = (vorlage: string, werte: Record<string, string | number>) =>
  Object.entries(werte).reduce((s, [k, v]) => s.replace(`{${k}}`, String(v)), vorlage);

let rezitation = '';

test('Werkstatt: Testton hochladen, Grenzen vorschlagen und speichern, mitklopfen, Prüfwiedergabe bestätigen', async ({ page }) => {
  test.setTimeout(240_000);
  await anmelden(page);
  await page.goto('/verwaltung/rezitationen');
  await expect(page.getByRole('heading', { level: 1, name: t.titel })).toBeVisible();

  // Anlegen
  await page.getByRole('main').getByRole('link', { name: t.neu }).first().click();
  await expect(page.getByRole('heading', { level: 1, name: t.neu })).toBeVisible();
  const name = `[E2E Testton ${Date.now().toString(36)}]`;
  await page.getByLabel(beginnt(t.formular.nameDe)).fill(name);
  await page.getByLabel(beginnt(t.formular.rezitator)).fill('[Testperson]');
  await page.getByLabel(beginnt(t.formular.lizenz)).fill('[Testlizenz]');
  await page.getByRole('button', { name: t.formular.anlegen }).click();
  await expect(page).toHaveURL(/\/verwaltung\/rezitationen\/[a-z0-9-]+\?angelegt=1$/);
  rezitation = new URL(page.url()).pathname.split('/').pop() ?? '';
  await expect(page.getByText(t.angelegt)).toBeVisible();
  // Ohne Vereinbarung kein Aktivieren
  await expect(page.getByRole('button', { name: t.freigabe.aktivieren, exact: true })).toHaveCount(0);

  // Suren-Raster → Werkstatt Sure 108 (drei Verse)
  await page.getByRole('link', { name: /^Sure 108,/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: /^Sure 108 · / })).toBeVisible();
  const quelle = page.getByRole('region', { name: w.quelle.titel });
  await expect(quelle).toBeVisible();

  // Upload des Testtons
  const ton = await testton(page);
  await quelle.locator('input[type="file"]').setInputFiles({ name: 'testton.webm', mimeType: 'audio/webm', buffer: ton });
  await quelle.getByRole('button', { name: w.quelle.dateiHochladen, exact: true }).click();
  await expect(quelle.getByText(w.quelle.uebernommen)).toBeVisible({ timeout: 30_000 });

  // Wellenform und Versgrenzen
  const grenzen = page.getByRole('region', { name: w.wellenform.titel });
  await expect(grenzen.getByRole('region', { name: w.wellenform.bereich })).toBeVisible({ timeout: 30_000 });
  await grenzen.getByRole('button', { name: w.wellenform.vorschlagen }).click();
  const g1 = grenzen.getByRole('slider', { name: fuelle(w.wellenform.grenze, { vor: 1, nach: 2 }) });
  const g2 = grenzen.getByRole('slider', { name: fuelle(w.wellenform.grenze, { vor: 2, nach: 3 }) });
  await expect(g1).toBeVisible();
  // Grenzen liegen in den Pausen (Ton 1 endet ≈ 1,5 s, Ton 2 beginnt ≈ 2,2 s; Ton 2 endet ≈ 3,2 s, Ton 3 beginnt ≈ 3,9 s)
  const wert = async (s: typeof g1) => Number(await s.getAttribute('aria-valuenow'));
  const v1 = await wert(g1);
  const v2 = await wert(g2);
  expect(v1).toBeGreaterThan(1300);
  expect(v1).toBeLessThan(2400);
  expect(v2).toBeGreaterThan(3000);
  expect(v2).toBeLessThan(4100);
  // Tastatur: ±50 ms, mit Umschalt ±500 ms
  await g1.focus();
  await page.keyboard.press('ArrowRight');
  await expect(g1).toHaveAttribute('aria-valuenow', String(v1 + 50));
  await page.keyboard.press('Shift+ArrowLeft');
  await expect(g1).toHaveAttribute('aria-valuenow', String(v1 - 450));
  await page.keyboard.press('Shift+ArrowRight');
  await page.keyboard.press('ArrowLeft');
  await expect(g1).toHaveAttribute('aria-valuenow', String(v1));
  await expect(grenzen.getByText(w.wellenform.ungespeichert)).toBeVisible();
  await grenzen.getByRole('button', { name: w.wellenform.speichern }).click();
  await expect(grenzen.getByText(w.wellenform.gespeichert)).toBeVisible();

  // Mitklopfen: Vers 1 bei 0,7-facher Geschwindigkeit
  const klopfen = page.getByRole('region', { name: w.klopfen.titel });
  await expect(klopfen.getByRole('radio', { name: fuelle(w.klopfen.tempoWert, { faktor: '0,7' }) })).toBeChecked();
  await klopfen.getByRole('button', { name: w.klopfen.starten }).click();
  const flaeche = klopfen.getByRole('button', { name: beginnt(w.klopfen.flaeche) });
  await expect(flaeche).toBeFocused();
  const zaehler = (await flaeche.innerText()).match(/0 von (\d+)/);
  const anzahl = Number(zaehler?.[1] ?? 0);
  expect(anzahl).toBeGreaterThan(1);
  for (let i = 0; i < anzahl; i++) {
    await page.waitForTimeout(220);
    await page.keyboard.press('Space');
  }
  await expect(klopfen.getByText(w.klopfen.fertig)).toBeVisible();
  await expect(klopfen.getByRole('region', { name: w.klopfen.korrektur }).getByRole('row')).toHaveCount(anzahl + 1);
  await klopfen.getByRole('button', { name: fuelle(w.klopfen.spaeter, { nr: 1 }) }).click();
  await klopfen.getByRole('button', { name: w.klopfen.speichern }).click();
  await expect(klopfen.getByText(fuelle(w.klopfen.gespeichert, { nr: 1 }))).toBeVisible();

  // Prüfwiedergabe: Vers 1 ganz hören (getönt), dann bestätigen
  const pruefen = page.getByRole('region', { name: w.pruefen.titel });
  const vers1 = pruefen.locator('li[data-v="1"]');
  await expect(vers1.getByText(w.pruefen.standOffen)).toBeVisible();
  const bestaetigen = pruefen.getByRole('button', { name: fuelle(w.pruefen.bestaetigen, { nr: 1 }) });
  await expect(bestaetigen).toBeDisabled();
  await pruefen.getByRole('button', { name: fuelle(w.pruefen.vers, { nr: 1 }) }).click();
  await expect(vers1).toHaveAttribute('data-aktiv', '');
  await expect(bestaetigen).toBeEnabled({ timeout: 15_000 });
  await bestaetigen.click();
  await expect(pruefen.getByText(fuelle(w.pruefen.bestaetigt, { nr: 1 }))).toBeVisible();
  await expect(vers1.getByText(w.pruefen.standGeprueft)).toBeVisible();

  const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  expect(axe.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);

  // Raster zeigt den Stand der Sure
  await page.goto(`/verwaltung/rezitationen/${rezitation}`);
  await expect(page.getByRole('link', { name: new RegExp(`^Sure 108, .*: ${t.raster.stufe.verse}$`) })).toBeVisible();
});

test('Werkstatt: Aufnahme im Browser (Ersatz-Mikrofon) und Upload', async ({ page }) => {
  test.setTimeout(120_000);
  test.skip(!rezitation, 'braucht die Rezitation aus dem ersten Test');
  await anmelden(page);
  await page.goto(`/verwaltung/rezitationen/${rezitation}/abgleich/1`);
  const quelle = page.getByRole('region', { name: w.quelle.titel });
  await quelle.getByRole('button', { name: w.quelle.aufnehmen }).click();
  await expect(quelle.getByText(/^Aufnahme läuft/)).toBeVisible();
  await page.waitForTimeout(2000);
  await quelle.getByRole('button', { name: w.quelle.beenden }).click();
  await expect(quelle.getByText(/^Aufnahme: 0:0\d,\d$/)).toBeVisible();
  await quelle.getByRole('button', { name: w.quelle.hochladen }).click();
  await expect(quelle.getByText(w.quelle.uebernommen)).toBeVisible({ timeout: 30_000 });
  await expect(page.getByRole('region', { name: w.wellenform.titel }).getByRole('region', { name: w.wellenform.bereich })).toBeVisible({
    timeout: 30_000,
  });
});
