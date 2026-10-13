import { expect, test, type Page } from '@playwright/test';
import elifbe from '../../messages/bereiche/elifbe.json';
import lernen from '../../messages/bereiche/lernen.json';
import { BUCHSTABEN, zeichen } from '../../src/lib/elifbe/alphabet';

/**
 * E2E Elifbe und Lernen (H-E01…E03): Übung lösen (B-18: richtig → Stern füllt sich, falsch → Farbe und Text ohne
 * Bewegung, Fortschritt nur lokal), Schreibweg (B-17: ≤ 1,6 s, „Nochmal“ startet neu; reduzierte Bewegung zeigt den
 * Endzustand mit nummerierten Zugpfeilen), Silbentafel und Lernweg. Texte aus messages/bereiche/{elifbe,lernen}.json.
 */

const T = elifbe.de.elifbe;
const FORTSCHRITT = 'igmg-elifbe-fortschritt';

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    try {
      window.localStorage.setItem('igmg-konzepthinweis-gesehen', '1');
    } catch {
      // Kein Speicher verfügbar: der Hinweis bleibt sichtbar.
    }
  });
});

function frage(page: Page) {
  return page.locator('section[aria-labelledby="ueben-frage"]');
}

/** Startet „Erkennen“ und liefert den Elifbâ-Namen des gezeigten Buchstabens. */
async function starteErkennen(page: Page): Promise<string> {
  await page.goto('/elifbe/ueben');
  await page.getByRole('button', { name: new RegExp(`^${T.ueben.erkennen}`) }).click();
  await expect(frage(page).getByRole('heading', { name: T.ueben.frageErkennen })).toBeVisible();
  const gezeigt = (await frage(page).locator('p[lang="ar"]').innerText()).trim();
  const b = BUCHSTABEN.find((x) => zeichen(x) === gezeigt);
  expect(b, `unbekanntes Zeichen ${gezeigt}`).toBeDefined();
  return b!.elifbe;
}

test.describe('Übungen', () => {
  test('richtige Antwort: Stern füllt sich, Rückmeldung, Fokus auf „Weiter“, Fortschritt nur im Browser', async ({ page }) => {
    const name = await starteErkennen(page);
    await frage(page).getByRole('button', { name, exact: true }).click();
    await expect(frage(page).getByRole('status')).toHaveText(T.ueben.richtig);
    await expect(frage(page).locator('.stern-fuellt')).toHaveCount(1);
    await expect(frage(page).getByRole('button', { name: T.ueben.weiter, exact: true })).toBeFocused();
    const gespeichert = await page.evaluate((k) => window.localStorage.getItem(k), FORTSCHRITT);
    const slug = BUCHSTABEN.find((b) => b.elifbe === name)!.slug;
    expect(JSON.parse(gespeichert ?? '{}')).toMatchObject({ version: 1, buchstaben: { [slug]: 1 } });
    const cookies = await page.context().cookies();
    expect(cookies).toEqual([]);
  });

  test('falsche Antwort: Farbe und Text, ohne Bewegung, ohne Stern', async ({ page }) => {
    const name = await starteErkennen(page);
    const falsch = frage(page).locator('.grid button').filter({ hasNotText: new RegExp(`^${name}$`) }).first();
    await falsch.click();
    await expect(frage(page).getByRole('status')).toContainText(name);
    await expect(falsch).toHaveClass(/border-fehler/);
    await expect(frage(page).locator('.stern-fuellt')).toHaveCount(0);
    // Nur Farbübergänge (CSS-Transitions), keine Bewegungs-Animation
    const bewegungen = await frage(page).evaluate((el) => el.getAnimations({ subtree: true }).filter((a) => a instanceof CSSAnimation).length);
    expect(bewegungen).toBe(0);
  });

  test('eine ganze Runde endet mit dem Abschluss und „Noch eine Runde“', async ({ page }) => {
    await page.goto('/elifbe/ueben');
    await page.getByRole('button', { name: new RegExp(`^${T.ueben.lesen}`) }).click();
    for (let i = 0; i < 8; i++) {
      await frage(page).locator('.grid button').first().click();
      await frage(page).getByRole('button', { name: T.ueben.weiter, exact: true }).click();
    }
    await expect(page.getByRole('heading', { name: T.ueben.fertigTitel })).toBeVisible();
    await expect(page.getByRole('button', { name: T.ueben.nochEineRunde })).toBeVisible();
  });
});

test.describe('Schreibweg', () => {
  test('zeichnet sich in höchstens 1,6 s; „Nochmal schreiben“ startet die Züge neu', async ({ page }) => {
    await page.goto('/elifbe/buchstaben/be');
    const svg = page.locator('#schreibweg');
    await expect(svg).toBeVisible();
    await expect(svg).toHaveAttribute('aria-label', T.buchstabe.schreibwegBild.replace('{name}', 'Be'));
    const ende = await svg.evaluate((el) =>
      Math.max(
        ...[...el.querySelectorAll('.schreibweg-zug')].flatMap((z) =>
          z.getAnimations().map((a) => {
            const t = a.effect?.getComputedTiming();
            return Number(t?.delay ?? 0) + Number(t?.activeDuration ?? 0);
          }),
        ),
      ),
    );
    expect(ende).toBeGreaterThan(0);
    expect(ende).toBeLessThanOrEqual(1600);
    await page.waitForTimeout(1700);
    await page.getByRole('button', { name: T.buchstabe.nochmal }).click();
    const zeit = await svg.evaluate((el) => Number(el.querySelector('.schreibweg-zug')?.getAnimations()[0]?.currentTime ?? -1));
    expect(zeit).toBeGreaterThanOrEqual(0);
    expect(zeit).toBeLessThan(600);
    // Zugpfeile auf Wunsch
    await page.getByRole('button', { name: T.buchstabe.pfeile }).click();
    await expect(svg.locator('.schreibweg-pfeile')).toBeVisible();
  });

  test.describe('reduzierte Bewegung', () => {
    test.use({ reducedMotion: 'reduce' });

    test('zeigt den Endzustand mit nummerierten Zugpfeilen, ohne Animation', async ({ page }) => {
      await page.goto('/elifbe/buchstaben/be');
      const svg = page.locator('#schreibweg');
      await expect(svg.locator('.schreibweg-pfeile')).toBeVisible();
      await expect(svg.locator('.schreibweg-tinte')).toBeHidden();
      // Be: ein Hauptzug und ein Punkt → Nummern 1 und 2
      await expect(svg.locator('.schreibweg-pfeile text')).toHaveText(['1', '2']);
      const laufend = await page.evaluate(() => document.getAnimations().filter((a) => (a as CSSAnimation).animationName === 'schreiben').length);
      expect(laufend).toBe(0);
      await expect(page.getByRole('button', { name: T.buchstabe.nochmal })).toBeHidden();
    });
  });
});

test('Lektion 1: Silbentafel aller 29 Buchstaben aus Codepunkten, Lesereihen mit Umschrift', async ({ page }) => {
  const antwort = await page.goto('/elifbe/lektion/1');
  expect(antwort?.status()).toBe(200);
  const tafel = page.getByRole('list', { name: T.lektion.tafel.replace('{titel}', T.lektionen.fatha.titel) });
  await expect(tafel.getByRole('listitem')).toHaveCount(29);
  await expect(tafel).toContainText('ba');
  await page.getByText(T.lektion.umschriftZeigen).click();
  await expect(page.getByText(`${T.lektion.reihe.replace('{nr}', '1')}:`)).toBeVisible();
  expect((await page.goto('/elifbe/lektion/99'))?.status()).toBe(404);
});

test('/lernen: Lernweg mit fünf Stationen und Weg zum Elifbe', async ({ page }) => {
  await page.goto('/lernen');
  const weg = page.getByRole('list', { name: lernen.de.lernen.wegTitel });
  await expect(weg.getByRole('listitem')).toHaveCount(5);
  await weg.getByRole('link', { name: new RegExp(`^${lernen.de.lernen.elifbeLink}`) }).click();
  await expect(page).toHaveURL(/\/elifbe$/);
  await expect(page.getByRole('heading', { level: 1, name: T.titel })).toBeVisible();
});

test('Buchstabenseiten: 29 statische Seiten mit Blättern; unbekannter Buchstabe 404', async ({ page }) => {
  await page.goto('/tr/elifba/harfler/cim');
  await expect(page.getByRole('heading', { level: 1, name: 'Cim' })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'tr');
  await page.getByRole('link', { name: new RegExp(elifbe.tr.elifbe.buchstabe.weiter) }).click();
  await expect(page).toHaveURL(/\/tr\/elifba\/harfler\/ha$/);
  expect((await page.goto('/elifbe/buchstaben/gibt-es-nicht'))?.status()).toBe(404);
});
