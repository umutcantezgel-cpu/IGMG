import { expect, test } from '@playwright/test';
import de from '../../messages/de.json';
import en from '../../messages/en.json';
import suche from '../../messages/bereiche/suche.json';

/** D-S1 (ADR 0013): Suche über den Kopf erreichbar, Treffer in der Sprache, ohne JavaScript nutzbar, Ergebnisse führen zum Inhalt. */
const SPRACHEN = [
  { kuerzel: 'de', start: '/', pfad: '/suche', wort: 'Gebetszeiten', menue: de.kopf.menueOeffnen },
  { kuerzel: 'en', start: '/en', pfad: '/en/search', wort: 'prayer', menue: en.kopf.menueOeffnen },
] as const;

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => window.localStorage.setItem('igmg-konzepthinweis-gesehen', '1'));
});

for (const s of SPRACHEN) {
  const t = suche[s.kuerzel].suche;
  test(`${s.kuerzel}: Kopf → Suche → Treffer → Inhalt`, async ({ page }) => {
    await page.goto(s.start);
    // Unter 640 px steht die Suche im Telefonmenü (Platz in der Kopfzeile, Tor B/C)
    if ((page.viewportSize()?.width ?? 1440) < 640) await page.getByRole('button', { name: s.menue, exact: true }).click();
    await page.getByRole('banner').getByRole('link', { name: t.kopfLink, exact: true }).filter({ visible: true }).click();
    await expect(page).toHaveURL(new RegExp(`${s.pfad}$`));
    await expect(page.getByRole('heading', { level: 1, name: t.titel })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: t.leer })).toBeVisible();
    const feld = page.getByRole('searchbox', { name: t.feld });
    await feld.fill(s.wort);
    await feld.press('Enter');
    await expect(page).toHaveURL(new RegExp(`\\?q=${s.wort}$`));
    const liste = page.getByRole('main').getByRole('listitem');
    await expect(liste.first()).toBeVisible();
    await expect(page.getByRole('main').getByRole('heading', { level: 2 })).toContainText(s.wort);
    await expect(feld).toHaveValue(s.wort);
    const titel = (await liste.first().getByRole('link').innerText()).trim();
    await liste.first().getByRole('link').click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(titel);
  });
}

test('ohne Treffer: Hinweis; Seite nicht indexiert', async ({ page }) => {
  const t = suche.de.suche;
  await page.goto('/suche?q=xyzunbekannt');
  // Mit Datenbank „Keine Treffer“; ohne (Beispielmodus, Titel-Index) der Hinweis auf die Titel-Suche
  const texte = [t.keine, t.statisch.keine].map((x) => x.replace('{begriff}', 'xyzunbekannt'));
  await expect(page.getByRole('main').getByRole('heading', { level: 2 })).toHaveText(
    new RegExp(`^(?:${texte.map((x) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})$`),
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
});

test.describe('ohne JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('GET-Formular liefert Treffer', async ({ page }) => {
    await page.goto('/suche');
    await page.getByRole('searchbox', { name: suche.de.suche.feld }).fill('Gebetszeiten');
    await page.getByRole('button', { name: suche.de.suche.absenden }).click();
    await expect(page.getByRole('main').getByRole('listitem').first()).toBeVisible();
  });
});
