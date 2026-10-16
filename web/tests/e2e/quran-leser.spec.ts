import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import quran from '../../messages/bereiche/quran.json';

/**
 * E2E Koran-Leser (O-Q01, H-Q01, H-Q02): Wortkarte per Tastatur (ein Tab-Halt je Vers, Pfeiltasten, Eingabe),
 * Tajwid-Seitenleiste aus der Wortkarte, Lesemodus und Tajwid-Schalter mit Speicherung im Gerät, Nachsatz der langen
 * Sure 2, Surensuche, axe in den offenen Zuständen (ohne Rezitation und Player: quran-player.spec.ts).
 * Voraussetzung: Die E2E-Datenbank enthält den Inhaltsimport (pnpm inhalte:import, wie die Bau-Datenbank).
 * Texte aus messages/bereiche/quran.json; Selektoren über Rollen, Beschriftungen und die Satz-Klassen.
 */
const T = quran.de.quranSeite;
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const fuelle = (vorlage: string, werte: Record<string, string | number>) =>
  vorlage.replace(/\{(\w+)\}/g, (_g, k: string) => String(werte[k] ?? ''));

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    try {
      window.localStorage.setItem('igmg-konzepthinweis-gesehen', '1');
    } catch {
      // Kein Speicher verfügbar: der Hinweis bleibt sichtbar.
    }
  });
});

/** Leser bereit: Verse aus der Datenbank sind da und die Insel hat sie bedienbar gemacht. */
async function leserBereit(page: Page) {
  await expect(page.locator('.vers-ar').first(), 'Koran-Text fehlt: E2E-Datenbank ohne Inhaltsimport?').toBeVisible();
  await expect(page.locator('.leser.leser-bereit')).toHaveCount(1);
}

test('Wortkarte per Tastatur: ein Tab-Halt je Vers, Pfeiltasten durch die Wörter, Eingabe öffnet, Escape schließt', async ({ page }) => {
  await page.goto('/quran/1');
  await leserBereit(page);
  const vers1 = page.locator('#v1 .vers-ar');
  await vers1.focus();
  await expect(vers1).toBeFocused();
  // Rechtsläufig: Pfeil links = nächstes Wort
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('#v1 [data-w="1"]')).toBeFocused();
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('#v1 [data-w="2"]')).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#v1 [data-w="1"]')).toBeFocused();
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('Enter');

  const karte = page.getByRole('dialog', { name: fuelle(T.wortkarte.titel, { pos: 2, vers: 1 }) });
  await expect(karte).toBeVisible();
  await expect(karte.getByText(fuelle(T.wortkarte.stelle, { sure: 1, vers: 1, pos: 2 }))).toBeVisible();
  // Ohne geprüfte Bedeutung: ehrlicher Hinweis; Vorkommen der Form als Zahl
  await expect(karte.getByText(T.wortkarte.keineBedeutung)).toBeVisible();
  await expect(karte.getByText(/\d+/).first()).toBeVisible();
  await expect(page.locator('#v1 [data-w="2"]')).toHaveAttribute('aria-expanded', 'true');

  const befunde = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  expect(befunde.violations.map((v) => `${v.id} (${v.nodes.length})`)).toEqual([]);

  await page.keyboard.press('Escape');
  await expect(karte).toBeHidden();
  await expect(page.locator('#v1 [data-w="2"]')).toBeFocused();

  // Tab verlässt den Vers und landet auf dem nächsten Vers (Wörter sind keine eigenen Tab-Halte)
  await page.keyboard.press('Tab');
  await expect(page.locator('#v2 .vers-ar')).toBeFocused();
});

test('Wortkarte → Tajwid-Seitenleiste: Regel mit Familie, Platzhalter statt ungeprüfter Erklärung, Beispiel markiert', async ({ page }) => {
  await page.goto('/quran/1');
  await leserBereit(page);
  await page.locator('#v1 [data-w="2"]').click();
  const karte = page.getByRole('dialog', { name: fuelle(T.wortkarte.titel, { pos: 2, vers: 1 }) });
  await expect(karte).toBeVisible();
  const regel = karte.getByRole('button', { name: new RegExp(T.wortkarte.regelOeffnen.replace('{name}', '.+')) }).first();
  await expect(regel).toBeVisible();
  await regel.click();

  const leiste = page.locator('dialog.regel-leiste[open]');
  await expect(leiste).toBeVisible();
  await expect(leiste.getByText(T.tajwidLeiste.kennung, { exact: true })).toBeVisible();
  await expect(leiste.getByText(T.tajwidLeiste.platzhalter)).toBeVisible();
  await expect(leiste.getByText(fuelle(T.tajwidLeiste.beispiel, { sure: 1, vers: 1 }))).toBeVisible();
  await expect(leiste.locator('.regel-markiert')).not.toHaveCount(0);
  await expect(leiste.getByRole('link', { name: T.tajwidLeiste.alleRegeln })).toHaveAttribute('href', /\/quran\/tajwid#regel-/);

  const befunde = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  expect(befunde.violations.map((v) => `${v.id} (${v.nodes.length})`)).toEqual([]);

  await page.keyboard.press('Escape');
  await expect(leiste).toHaveCount(0);
  await expect(page.locator('#v1 [data-w="2"]')).toBeFocused();
});

test('Lesemodus und Tajwid-Schalter wirken sofort und bleiben im Gerät gespeichert', async ({ page }) => {
  await page.goto('/quran/1');
  await leserBereit(page);
  const leser = page.locator('.leser');
  const ansicht = page.getByRole('button', { name: T.leser.ansicht });
  await ansicht.click();
  await expect(ansicht).toHaveAttribute('aria-expanded', 'true');

  await page.getByRole('radio', { name: T.leser.modus.arabisch }).check();
  await expect(leser).toHaveAttribute('data-modus', 'arabisch');
  await expect(page.locator('#v1 .vers-ue')).toBeHidden();
  await expect(page.locator('#v1 .vers-ar')).toBeVisible();

  await page.getByRole('radio', { name: T.leser.modus.uebersetzung }).check();
  await expect(leser).toHaveAttribute('data-modus', 'uebersetzung');
  await expect(page.locator('#v1 .vers-ar')).toBeHidden();

  const tajwid = page.getByRole('button', { name: T.leser.tajwid, exact: true });
  await expect(tajwid).toHaveAttribute('aria-pressed', 'true');
  await tajwid.click();
  await expect(tajwid).toHaveAttribute('aria-pressed', 'false');
  await expect(leser).toHaveAttribute('data-tajwid', 'aus');

  await page.reload();
  await expect(page.locator('.leser')).toHaveAttribute('data-modus', 'uebersetzung');
  await expect(page.locator('.leser')).toHaveAttribute('data-tajwid', 'aus');
  await expect(page.getByRole('button', { name: T.leser.tajwid, exact: true })).toHaveAttribute('aria-pressed', 'false');
  const gespeichert = await page.evaluate(() => window.localStorage.getItem('igmg-quran-einstellungen'));
  expect(JSON.parse(gespeichert ?? '{}')).toMatchObject({ modus: 'uebersetzung', tajwid: 'aus' });

  // Zurück zur Vorgabe
  await page.getByRole('button', { name: T.leser.ansicht }).click();
  await page.getByRole('radio', { name: T.leser.modus.beide }).check();
  await page.getByRole('button', { name: T.leser.tajwid, exact: true }).click();
  await expect(page.locator('.leser')).toHaveAttribute('data-modus', 'beide');
});

test('Sure 2 (lang): schlichter Text im HTML, Wörter und Tajwid nach dem Laden; Basmala über Vers 1', async ({ page }) => {
  await page.goto('/quran/2');
  await expect(page.locator('.basmala')).toBeVisible();
  await expect(page.locator('.vers-ar')).toHaveCount(286);
  await expect(page.locator('.vers-ar[data-roh]')).toHaveCount(0, { timeout: 20_000 });
  await expect(page.locator('#v255 .vers-ar [data-w]').first()).toBeAttached();
  await expect(page.locator('.vers-ar .tj').first()).toBeAttached();
});

// „Ohne aktive Rezitation: ruhiger Hinweis statt Abspiel-Knopf“ steht jetzt in quran-player.spec.ts vor dem Anlegen der
// Test-Rezitation (seriell): Eine aktive Rezitation gilt für die ganze Website, ein paralleler Lauf hier sähe sie sonst.

test('Übersicht: Surensuche filtert im Browser, Cüz-Liste führt zum Cüz', async ({ page }) => {
  await page.goto('/quran');
  const suche = page.getByRole('searchbox', { name: T.uebersicht.sucheLabel });
  await suche.fill('Yasin');
  await expect(page.locator('li[data-nr]:visible')).toHaveCount(1);
  await expect(page.locator('li[data-nr="36"]')).toBeVisible();
  await suche.fill('2');
  await expect(page.locator('li[data-nr]:visible')).toHaveCount(1);
  await suche.fill('');
  await expect(page.locator('li[data-nr]:visible')).toHaveCount(114);

  const liste = page.getByRole('navigation', { name: T.uebersicht.cuzListe });
  await liste.getByRole('link', { name: fuelle(T.uebersicht.cuzLabel, { nr: 30, sure: 78, vers: 1 }) }).click();
  await expect(page).toHaveURL(/\/quran\/cuz\/30$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(fuelle(T.cuz.titel, { nr: 30 }));
  await expect(page.locator('ol[data-sure]')).toHaveCount(37);
});

// Sichtabnahme Z-04, Paket 1 (W-1…W-4, T-1…T-4): messbare Kriterien der Nachaufnahme
test('Wortkarte: Regelknopf in Akzentgrün mit Farbfeld; breit angedockt ohne verdeckten Vers, Telefon Wort über dem Blatt', async ({
  page,
}, info) => {
  await page.goto('/quran/1');
  await leserBereit(page);
  await page.locator('#v1 [data-w="2"]').click();
  const karte = page.getByRole('dialog', { name: fuelle(T.wortkarte.titel, { pos: 2, vers: 1 }) });
  const regel = karte.getByRole('button', { name: new RegExp(T.wortkarte.regelOeffnen.replace('{name}', '.+')) }).first();
  await expect(regel).toBeVisible();
  await expect(regel.locator('.tj-probe')).toHaveCount(1);
  expect(await regel.evaluate((e) => getComputedStyle(e).textDecorationLine)).toBe('none');
  await page.waitForTimeout(800);
  if (info.project.name === 'desktop') {
    await expect(karte).toHaveAttribute('data-andock', 'rechts');
    const ueberdeckt = await page.evaluate(() => {
      const k = document.querySelector('.wortkarte')!.getBoundingClientRect();
      return [...document.querySelectorAll('.vers-ar, .vers-ue')].some((e) =>
        [...e.getClientRects()].some((r) => r.right > k.left && r.left < k.right && r.bottom > k.top && r.top < k.bottom),
      );
    });
    expect(ueberdeckt).toBe(false);
  } else {
    const { wort, blatt, hoehe } = await page.evaluate(() => ({
      wort: document.querySelector('#v1 [data-w="2"]')!.getBoundingClientRect(),
      blatt: document.querySelector('.wortkarte')!.getBoundingClientRect().top,
      hoehe: window.innerHeight,
    }));
    expect(wort.top).toBeGreaterThanOrEqual(0);
    expect(wort.bottom).toBeLessThanOrEqual(blatt);
    expect(hoehe - blatt).toBeLessThanOrEqual(hoehe * 0.6 + 1);
  }
});

test('Tajwid-Seitenleiste: Markierung mit 2-px-Ring, „Markiert: …“, Familie als Link, „Alle Tajwid-Regeln“ dicht darunter', async ({
  page,
}) => {
  await page.goto('/quran/1');
  await leserBereit(page);
  await page.locator('#v1 [data-w="2"]').click();
  const karte = page.getByRole('dialog', { name: fuelle(T.wortkarte.titel, { pos: 2, vers: 1 }) });
  await karte
    .getByRole('button', { name: new RegExp(T.wortkarte.regelOeffnen.replace('{name}', '.+')) })
    .first()
    .click();
  const leiste = page.locator('dialog.regel-leiste[open]');
  const markiert = leiste.locator('.beispiel-wort .regel-markiert').first();
  await expect(markiert).toBeVisible();
  expect(await markiert.evaluate((e) => getComputedStyle(e).outlineWidth)).toBe('2px');
  await expect(leiste.getByText(new RegExp(`^${T.tajwidLeiste.markiert.replace('{name}', '.+')}$`))).toBeVisible();
  await expect(leiste.getByRole('link', { name: new RegExp(Object.values(T.familien).join('|')) }).first()).toHaveAttribute(
    'href',
    /\/quran\/tajwid#familie-/,
  );
  const abstand = await leiste.evaluate((d) => {
    const alle = [...d.querySelectorAll('a')].at(-1)!.getBoundingClientRect().top;
    const sektionen = [...d.querySelectorAll('section')];
    return alle - sektionen.at(-1)!.getBoundingClientRect().bottom;
  });
  expect(abstand).toBeLessThanOrEqual(25);
});
