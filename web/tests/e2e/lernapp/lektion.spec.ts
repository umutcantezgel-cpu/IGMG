import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { expect, type Page, test } from '@playwright/test';
import ar from '../../../messages/lernapp/ar.json';
import de from '../../../messages/lernapp/de.json';
import tr from '../../../messages/lernapp/tr.json';
import { formatiere } from '../../../src/lib/lernapp/format';
import { ergebnisText, ernsteBefunde, KURS, LEKTION_1, LEKTION_2, spieleLektion1, xpText } from './hilfen';

/**
 * Lektion des Testkurses (L1, PLAN §13 E2E; KERN 4.0 §8): Auswahl, Paare und Wortbank nur mit der Tastatur (desktop) bzw.
 * per Tippen (telefon); Rückmeldung in der einen Live-Region; Ergebnis und XP stehen statisch (keine hochzählende Zahl);
 * danach Lernpfad und Start mit dem Stand auf dem Gerät. axe ohne ernste oder kritische Befunde auf Lernpfad und Spieler in
 * de/tr/ar. Mit `LERNAPP_BILDER=<ordner>` zusätzlich Bildschirmfotos von Lernpfad und Spieler.
 */

type Ui = 'de' | 'tr' | 'ar';
const TEXTE = { de, tr, ar } as const;
/** Je Oberfläche ein Kurs, dessen Ausgangssprache sie ist (Testkurs: Einheit a1.test je Zielsprache). */
const KURS_VON: Record<Ui, string> = { de: 'tr-aus-de', tr: 'de-aus-tr', ar: 'de-aus-ar' };

async function ueberlauf(page: Page) {
  return page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
}

test.describe('Lektion des Testkurses (de)', () => {
  test('nur mit der Tastatur: Auswahl, Paare, Wortbank; Live-Region; Ergebnis statisch; Stand auf dem Gerät', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'Tastatur auf dem Desktop, Tippen auf dem Telefon');
    test.setTimeout(90_000);
    await page.goto(`/lern-app/de/${KURS}`);
    const lektion = page.locator(`main a[href="/lern-app/de/${KURS}/ueben?l=${LEKTION_1}"]`);
    // erstes Laden des Lernpfads: Kursverzeichnis, Vorrat und die zwei automatisch gespeicherten Einheiten
    await expect(lektion).toBeVisible({ timeout: 15_000 });
    await lektion.focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL((u) => u.pathname === `/lern-app/de/${KURS}/ueben` && u.searchParams.get('l') === LEKTION_1);
    await spieleLektion1(page, 'tastatur');

    // Ergebnis ohne hochzählende Zahl: sofort der Endwert und danach unverändert
    const xp = page.getByText(xpText(10), { exact: true });
    await expect(xp).toBeVisible();
    await expect(page.getByText(ergebnisText(4, 4), { exact: true })).toBeVisible();
    // jedes Bild über 1,6 s (Dauer von B-30) zeigt denselben Text
    const proben = await page.evaluate(
      () =>
        new Promise<string[]>((fertig) => {
          const werte: string[] = [];
          const start = performance.now();
          const schritt = () => {
            werte.push(document.querySelector('main')?.textContent ?? '');
            if (performance.now() - start < 1600) requestAnimationFrame(schritt);
            else fertig(werte);
          };
          requestAnimationFrame(schritt);
        }),
    );
    expect(proben.length).toBeGreaterThan(5);
    expect(new Set(proben).size).toBe(1);
    expect(proben[0]).toContain(xpText(10));
    // Abschluss (L7-01): Tagesziel (Standard 1 Lektion) erreicht, Serie mit einem Lerntag, erstes Abzeichen – alles statisch
    const abschluss = page.locator('[data-abschluss]');
    await expect(abschluss).toContainText(de.abschluss.zielErreicht);
    await expect(abschluss).toContainText(formatiere(de.serie.laenge, { n: 1 }, 'de'));
    await expect(abschluss.getByRole('heading', { name: formatiere(de.abschluss.neueAbzeichen, { n: 1 }, 'de') })).toBeVisible();
    await expect(abschluss.locator('[data-abzeichen="lektionen-1"]')).toContainText(
      formatiere(de.abzeichen.arten.lektionen.name, { n: 1 }, 'de'),
    );

    // Lernpfad: Lektion geschafft; Start: heute 1 Lektion, „Weiter lernen“ mit der nächsten Lektion
    await page.getByRole('link', { name: de.spieler.zurueck }).click();
    await expect(page.locator(`main a[href="/lern-app/de/${KURS}/ueben?l=${LEKTION_1}"]`)).toContainText(`(${de.lernpfad.geschafft})`, {
      timeout: 15_000,
    });
    await page.goto('/lern-app/de');
    await expect(page.locator(`main a[href="/lern-app/de/${KURS}/ueben?l=${LEKTION_2}"]`)).toContainText(de.heute.weiter);
    await expect(page.getByText(de.heute.nochNichts)).toHaveCount(0);
  });

  test('per Tippen, erste Antwort daneben: Wiederholung am Ende ohne Strafe', async ({ page }, info) => {
    test.skip(info.project.name !== 'telefon', 'Tippen auf dem Telefon, Tastatur auf dem Desktop');
    test.setTimeout(90_000);
    await page.goto(`/lern-app/de/${KURS}/ueben?l=${LEKTION_1}`);
    await spieleLektion1(page, 'tippen', { ersteFalsch: true });
    await expect(page.getByText(ergebnisText(3, 4), { exact: true })).toBeVisible();
    await expect(page.getByText(xpText(10), { exact: true })).toBeVisible();
    expect(await ueberlauf(page)).toBe(0);
  });
});

for (const ui of ['de', 'tr', 'ar'] as const) {
  test(`axe ${ui}: Lernpfad und Spieler (Aufgabe und Rückmeldung) ohne ernste oder kritische Befunde`, async ({ page }, info) => {
    test.setTimeout(120_000);
    const t = TEXTE[ui];
    const kurs = KURS_VON[ui];
    const befunde: string[] = [];
    const bilder = process.env.LERNAPP_BILDER ?? '';
    const breite = info.project.name === 'telefon' ? 390 : 1440;
    const foto = async (name: string) => {
      if (!bilder) return;
      mkdirSync(bilder, { recursive: true });
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: join(bilder, `lernapp-${ui}-${name}-${breite}.png`), fullPage: true });
    };

    await page.goto(`/lern-app/${ui}/${kurs}`);
    // Lektion 1 der Testeinheit (vor ihr steht der Vorkurs der Richtung, daneben die echten Einheiten)
    const erste = page.locator(`main a[href="/lern-app/${ui}/${kurs}/ueben?l=${kurs}.a1.test.l01"]`);
    await expect(erste).toBeVisible({ timeout: 15_000 });
    // je Station ein Knopf (Testeinheit und echte Einheiten)
    await expect(page.getByRole('button', { name: t.lernpfad.offline }).first()).toBeVisible();
    expect(await ueberlauf(page), 'Lernpfad: Überlauf').toBe(0);
    befunde.push(...(await ernsteBefunde(page, `${ui} Lernpfad`)));
    await foto('lernpfad');

    await erste.click();
    await expect(page.getByRole('heading', { level: 2 }).first()).toBeVisible();
    await expect(page.getByRole('radio').first()).toBeAttached();
    expect(await ueberlauf(page), 'Spieler: Überlauf').toBe(0);
    befunde.push(...(await ernsteBefunde(page, `${ui} Spieler`)));
    await foto('spieler');

    // Rückmeldeblatt (beliebige Antwort)
    await page.locator('main fieldset label').first().click();
    await page.getByRole('button', { name: t.spieler.pruefen, exact: true }).click();
    await expect(page.getByRole('button', { name: t.spieler.weiter, exact: true })).toBeFocused();
    befunde.push(...(await ernsteBefunde(page, `${ui} Rückmeldung`)));
    await foto('rueckmeldung');
    expect(befunde).toEqual([]);
  });
}
