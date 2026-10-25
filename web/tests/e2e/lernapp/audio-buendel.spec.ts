import { expect, type Page, test } from '@playwright/test';
import tr from '../../../messages/lernapp/tr.json';
import { liveRegion } from './hilfen';

/**
 * Hören aus dem Bündel der Zielsprache Deutsch (L3-05, ADR 0039 Nr. 3 mit Fortschreibung S4 Nr. 3): Der Spieler lädt das
 * Bündel der Einheit über `/lern-app/audio/de/…`, schneidet den Clip und spielt ihn normal und langsam bis `ended` – in
 * der türkischen Oberfläche (Deutsch lernen), Lektion l03 des Testkurses.
 *
 * - Regulär: das synthetische Testbündel (Töne, ADR 0039 Nr. 11).
 * - Probelauf der Audio-Kette: mit `E2E_AUDIO_MANIFEST` (Import) und `LERNAPP_AUDIO_LOKAL` (Route) kommt das lokal gebaute
 *   Bündel der Sprachausgabe; `E2E_AUDIO_BUENDEL` nennt seinen Dateinamen, und genau dieses Bündel muss geladen werden.
 *   Dann hat auch der Satz ohne Testton einen Clip – die erste Hörübung wird gehört statt übersprungen.
 */
const t = tr;

async function enden(page: Page): Promise<number> {
  return page.evaluate(() => (window as unknown as { __enden: number }).__enden);
}

async function richtigWeiter(page: Page) {
  await expect(liveRegion(page)).toContainText(t.spieler.richtig);
  const weiter = page.getByRole('button', { name: t.spieler.weiter, exact: true });
  await expect(weiter).toBeFocused();
  await page.keyboard.press('Enter');
}

async function waehle(page: Page, name: string) {
  const radio = page.getByRole('radio', { name, exact: true });
  await radio.focus();
  await page.keyboard.press('Space');
  await expect(radio).toBeChecked();
  await page.keyboard.press('Enter');
}

async function hoere(page: Page, langsam = false) {
  const vorher = await enden(page);
  await page.getByRole('button', { name: langsam ? t.aufgaben.hoeren.langsam : t.aufgaben.hoeren.anhoeren, exact: true }).click();
  await expect.poll(() => enden(page), { timeout: 15_000 }).toBe(vorher + 1);
}

test('Deutsch lernen: Hörübung spielt den Clip aus dem Bündel der Einheit bis zum Ende, normal und langsam', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'einmal genügt (Tastatur und Wiedergabe prüft typen-a auf beiden Breiten)');
  test.setTimeout(120_000);
  const buendel: string[] = [];
  page.on('request', (r) => {
    const pfad = new URL(r.url()).pathname;
    if (pfad.startsWith('/lern-app/audio/')) buendel.push(pfad);
  });
  await page.addInitScript(() => {
    const w = window as unknown as { __enden: number };
    w.__enden = 0;
    const spiele = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function (this: HTMLMediaElement & { __beobachtet?: boolean }) {
      if (!this.__beobachtet) {
        this.__beobachtet = true;
        this.addEventListener('ended', () => w.__enden++);
      }
      return spiele.call(this);
    };
  });
  await page.goto('/lern-app/tr/de-aus-tr/ueben?l=de-aus-tr.a1.test.l03');
  const bedeutung = page.getByRole('heading', { name: t.aufgaben.hoeren_waehlen.waehleBedeutung });

  // Bildkarte, Freitext, erste Hörübung (ohne Testton „Audio folgt“, im Probelauf mit Clip) bis zur Hörübung „Bedeutung“
  for (let schritt = 0; schritt < 4 && !(await bedeutung.isVisible()); schritt++) {
    const form = page.locator('main form[data-aufgabe]');
    await expect(form).toBeVisible();
    const typ = await form.getAttribute('data-aufgabe');
    if (typ === 'bild_wort') {
      await waehle(page, 'Haus');
      await richtigWeiter(page);
    } else if (typ === 'frei') {
      await page.getByRole('textbox', { name: t.aufgaben.frei.eingabe }).focus();
      await page.keyboard.insertText('Brot');
      await page.keyboard.press('Enter');
      await richtigWeiter(page);
    } else if (typ === 'hoeren_waehlen') {
      // Die Übung lädt nach (lazy, Suspense): erst warten, bis „Audio folgt“ oder „Anhören“ dasteht
      const folgt = page.getByText(t.aufgaben.hoeren.audioFolgt, { exact: true });
      await expect(folgt.or(page.getByRole('button', { name: t.aufgaben.hoeren.anhoeren, exact: true }))).toBeVisible();
      if (await folgt.isVisible()) await page.getByRole('button', { name: t.aufgaben.hoeren.ueberspringen, exact: true }).click();
      else {
        await hoere(page);
        await waehle(page, 'Das Haus ist neu.');
        await richtigWeiter(page);
      }
      await expect(bedeutung).toBeVisible();
    } else throw new Error(`unerwartete Aufgabe ${typ}`);
  }

  await expect(bedeutung).toBeVisible();
  await hoere(page);
  await hoere(page, true);
  expect(buendel.length).toBeGreaterThan(0);
  for (const b of buendel) expect(b).toMatch(/^\/lern-app\/audio\/de\/de\.a1\.test-[0-9a-f]{16}\.lpa$/);
  if (process.env.E2E_AUDIO_BUENDEL) expect(new Set(buendel)).toEqual(new Set([`/lern-app/audio/de/${process.env.E2E_AUDIO_BUENDEL}`]));
});
