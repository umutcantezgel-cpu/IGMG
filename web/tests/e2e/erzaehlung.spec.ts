import { expect, test } from '@playwright/test';
import de from '../../messages/de.json';
import projekte from '../../messages/bereiche/projekte.json';
import ramadan from '../../messages/bereiche/ramadan.json';
import { istRamadan } from '../../src/lib/gebetszeiten/hijri';
import { berlinerDatum } from '../../src/lib/gebetszeiten/naechstes';

/**
 * E2E Erzählansichten (Paket H-B09, Vorführpfad Station 1): Startseite mit „Unsere neue Moschee – eröffnet“ und
 * Tages- bzw. Fastenbogen (B-06/B-20), Über uns mit der Eröffnung als letzter Station (B-07), Cüz-Ring mit Staffel
 * ≤ 8 (K-007), keine Mondsichel in Leiste und Gebetszeiten (MN-27). Texte aus messages, Inhalte aus den Seeds.
 * Die E2E-Umgebung läuft als Produktion: Der Schalter `ramadan_vorschau` ist aus, es gibt keinen Vorschau-Knopf.
 */
const START = de.start;

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    try {
      window.localStorage.setItem('igmg-konzepthinweis-gesehen', '1');
    } catch {
      // Kein Speicher verfügbar: der Hinweis bleibt sichtbar.
    }
  });
});

test.describe('Startseite', () => {
  test('„Unsere neue Moschee ist eröffnet“: Name und Text aus dem Seiteninhalt, Fotoplatzhalter, Wege zu Projekt und Geschichte', async ({
    page,
  }) => {
    await page.goto('/');
    const abschnitt = page.getByRole('region', { name: START.moschee.titel });
    await expect(abschnitt).toBeVisible();
    await expect(abschnitt).toContainText('Neue Fatih-Moschee');
    await expect(abschnitt).toContainText(projekte.de.projekte.status.fertiggestellt);
    // Eröffnungsdatum und Foto sind Platzhalter der Gemeinde (MN-08), kein echtes Bild
    await expect(abschnitt).toContainText(/\[Datum – von der Gemeinde\]/);
    await expect(abschnitt.getByRole('img', { name: /\[Foto von der Gemeinde\]/ })).toBeVisible();
    await expect(abschnitt.locator('img')).toHaveCount(0);
    await expect(abschnitt.getByRole('link', { name: START.moschee.projekt })).toHaveAttribute('href', '/projekte');
    await expect(abschnitt.getByRole('link', { name: START.moschee.geschichte })).toHaveAttribute('href', '/ueber-uns');
  });

  test('Bogen nach dem Datum: im Ramadan der Fastenbogen, sonst der Tagesbogen', async ({ page }) => {
    await page.goto('/');
    const imRamadan = istRamadan(berlinerDatum(new Date()));
    const titel = imRamadan ? ramadan.de.ramadan.bogen.titel : START.bogenTitel;
    await expect(page.locator('figure figcaption').filter({ hasText: titel }).first()).toBeVisible();
  });

  test('Ramadan-Vorschau nur mit Schalter: der Knopf zeigt den Fastenbogen als Vorschau und führt zurück', async ({ page }) => {
    await page.goto('/');
    const knopf = page.getByRole('button', { name: START.fasten.zeigen });
    // Produktion (E2E-Lauf): Schalter aus → kein Knopf, der Tagesbogen bleibt. Entwicklung/Vorschau: Schalter an.
    if ((await knopf.count()) === 0 || istRamadan(berlinerDatum(new Date()))) {
      await expect(knopf).toHaveCount(0);
      return;
    }
    await knopf.click();
    await expect(page.locator('figure figcaption').filter({ hasText: START.fasten.vorschauTitel })).toBeVisible();
    await expect(page.getByText(START.fasten.vorschauHinweis)).toBeVisible();
    await expect(page.getByRole('link', { name: START.fasten.ramadan })).toHaveAttribute('href', '/ramadan');
    const zurueck = page.getByRole('button', { name: START.fasten.zurueck });
    await expect(zurueck).toBeFocused();
    await zurueck.click();
    await expect(page.locator('figure figcaption').filter({ hasText: START.bogenTitel })).toBeVisible();
  });
});

test.describe('Über uns: Weg der Gemeinde (B-07 mit Eröffnung)', () => {
  test('die letzte Station ist die Eröffnung der neuen Fatih-Moschee', async ({ page }) => {
    await page.goto('/ueber-uns');
    const stationen = page.locator('section[aria-labelledby="ueber-reise"] ol > li');
    expect(await stationen.count()).toBeGreaterThanOrEqual(5);
    await expect(stationen.last().getByRole('heading', { level: 3 })).toContainText('Eröffnung der neuen Fatih-Moschee');
  });
});

test.describe('Quran: Cüz-Ring', () => {
  test('30 Segmente, höchstens 8 Staffelschritte (K-007)', async ({ page }) => {
    await page.goto('/quran');
    const verzoegerungen = await page.evaluate(() => [
      ...new Set([...document.querySelectorAll('.cuz-ring .cuz-segment')].map((e) => getComputedStyle(e).animationDelay)),
    ]);
    expect(await page.locator('.cuz-ring .cuz-segment').count()).toBe(30);
    expect(verzoegerungen.length).toBeLessThanOrEqual(8);
  });

  test.describe('reduzierte Bewegung', () => {
    test.use({ reducedMotion: 'reduce' });

    test('Ring ohne Animation', async ({ page }) => {
      await page.goto('/quran');
      const namen = await page.evaluate(() => [
        ...new Set([...document.querySelectorAll('.cuz-ring .cuz-segment')].map((e) => getComputedStyle(e).animationName)),
      ]);
      expect(namen).toEqual(['none']);
    });
  });
});

test.describe('Keine Mondsichel (MN-27)', () => {
  for (const pfad of ['/', '/gebetszeiten']) {
    test(`${pfad}: Imsak und Yatsı mit Nachtzeichen, kein Lucide-Mond`, async ({ page }) => {
      await page.goto(pfad);
      await expect(page.locator('svg.lucide-moon, svg[class*="lucide-moon"]')).toHaveCount(0);
    });
  }
});
