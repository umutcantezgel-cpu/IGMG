import { expect, test } from '@playwright/test';
import de from '../../../messages/lernapp/de.json';
import { formatiere } from '../../../src/lib/lernapp/format';
import { ernsteBefunde, KURS, LEKTION_1, perTab } from './hilfen';

/**
 * Lernpfad mit echten Kursgrößen (Stufe C N8/N9a, Gegenprüfung N8 Nr. 5b/5c): Die Stufe der aktuellen Einheit steht offen, die
 * übrigen klappen als `<details>` auf. „Stufe aufklappen“ per Tastatur (Summary mit Stufe und Handlung im Namen, per Tab vom
 * Anfang des Inhalts aus erreicht – durch die offene Stufe A1 hindurch, kein `locator.focus()`), danach sind alle Stationen der
 * Stufe da und ihre Knöpfe per Tab erreichbar; nach der ersten Eingabe stehen auch alle Stationen der offenen Stufe
 * (Häppchen). „Stufe offline speichern“ steht an jeder Stufe, auch an zugeklappten. axe ohne ernste Befunde.
 */

type Verzeichnis = { einheiten: { schluessel: string; stufe: string }[] };

test('Stufe aufklappen per Tastatur: alle Stationen, Knöpfe erreichbar, axe', async ({ page }) => {
  test.setTimeout(90_000);
  const lernpfad = `/lern-app/de/${KURS}`;
  await page.goto(lernpfad);
  await expect(page.locator(`main a[href="${lernpfad}/ueben?l=${LEKTION_1}"]`)).toBeVisible({ timeout: 15_000 });
  const v = (await page.evaluate(async (k) => (await fetch(`/lern-app/pakete/${k}`)).json(), KURS)) as Verzeichnis;
  const zahl = (stufe: string) => v.einheiten.filter((e) => e.stufe === stufe).length;
  expect(zahl('a2')).toBeGreaterThan(4);

  // jede Stufe hat „Stufe offline speichern“ – auch die zugeklappten
  for (const [stufe, name] of [
    ['a1', 'A1'],
    ['a2', 'A2'],
    ['b1', 'B1'],
  ])
    await expect(
      page
        .locator(`section[aria-labelledby="stufe-${stufe}"]`)
        .getByRole('button', { name: formatiere(de.lernpfad.stufeOffline, { stufe: name }, 'de'), exact: true }),
    ).toBeVisible();

  // Summary per Tastatur: Name mit Stufe und Handlung; vom Anfang des Inhalts (`main`, nach einem Klick auf die Überschrift der
  // Stufe) per Tab durch die Stationen von A1 und „A1: ganze Stufe offline speichern“ (am Ende jeder Stufe)
  const stufe = page.locator('main details[data-stufe-zu="a2"]');
  const summary = stufe.locator('summary');
  await expect(summary).toHaveText(formatiere(de.lernpfad.stufeZeigen, { stufe: 'A2', anzahl: zahl('a2') }, 'de'));
  await perTab(page, summary, page.locator('#stufe-a2'));
  await page.keyboard.press('Enter');
  await expect(stufe).toHaveAttribute('open', '');
  // nach allen Takten: alle Stationen der aufgeklappten Stufe und der offenen Stufe A1
  await expect(stufe.locator('ol > li')).toHaveCount(zahl('a2'), { timeout: 15_000 });
  await expect(page.locator('section[aria-labelledby="stufe-a1"] > ol > li')).toHaveCount(zahl('a1'), { timeout: 15_000 });

  // Tastatur: von der Summary aus (der Fokus blieb dort) in die Stationen der Stufe bis „Einheit offline speichern“ der ersten
  // Station
  await expect(summary).toBeFocused();
  let erreicht = false;
  for (let i = 0; i < 8 && !erreicht; i++) {
    await page.keyboard.press('Tab');
    erreicht = await page.evaluate((name) => {
      const a = document.activeElement;
      return Boolean(a?.closest('details[data-stufe-zu="a2"]') && a.tagName === 'BUTTON' && a.textContent?.trim() === name);
    }, de.lernpfad.offline);
  }
  expect(erreicht).toBe(true);
  expect(await ernsteBefunde(page, 'Lernpfad A2 aufgeklappt')).toEqual([]);
});
