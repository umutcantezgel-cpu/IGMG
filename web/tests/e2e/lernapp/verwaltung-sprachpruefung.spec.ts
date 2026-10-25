import { existsSync } from 'node:fs';
import { expect, type Page, test } from '@playwright/test';
import pg from 'pg';
import pruefung from '../../../messages/verwaltung/lernapp-pruefung.json';
import { angemeldetesKonto } from '../hilfen/konto';
import { ernsteBefunde } from './hilfen';

/**
 * Verwaltung › Lern-App › Sprachprüfung (L3-06, ADR 0041 Nr. 3–5/10, PLAN §6.5/§7.2) mit dem Testkurs aus dem Seed: Die Rolle
 * „Sprachprüfung“ landet nach der Anmeldung direkt in der Warteschlange ihrer Prüfsprache (Deutsch), zieht die Stichprobe der
 * Zieltexte von `de.a1.test`, beurteilt einen Eintrag mit dem Tastenkürzel 1 und einen mit Korrektur (2, leichte Kategorie,
 * Korrekturvorschlag), prüft, dass die Kürzel nur im Prüfbereich wirken und sich ausschalten lassen (WCAG 2.1.4), und
 * wechselt die Sprache der Oberfläche (tr, ar: Gerüst links-nach-rechts, Texte mit `lang`/`dir`).
 * Die Stichprobe bleibt offen (weder veröffentlicht noch gesperrt), damit die übrigen Specs den Testkurs unverändert sehen.
 * Nur Desktop; Testdaten fiktiv (G-04).
 */
const d = pruefung.de;
const s = d.stichprobe;

test.describe.configure({ mode: 'serial' });

test.beforeEach(async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'Verwaltungsabläufe nur einmal je Lauf');
  await page.addInitScript(() => window.localStorage.setItem('igmg-konzepthinweis-gesehen', '1'));
});

/** Testdaten (G-04): Prüfsprache Deutsch für das neue Testkonto, wie sie die Redaktion unter „Prüfende“ setzt. */
async function pruefspracheDeutsch(email: string) {
  if (!process.env.DATABASE_URL && existsSync('.env')) process.loadEnvFile('.env');
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    const { rows } = await client.query<{ id: string }>('select id from "user" where email = $1', [email]);
    const id = rows[0]?.id;
    if (!id) throw new Error(`Testkonto ${email} fehlt`);
    await client.query(`insert into lernapp_pruefer_sprache (benutzer_id, sprache, ebene) values ($1, 'de', 'muttersprache')`, [id]);
  } finally {
    await client.end();
  }
}

const eintragKopf = (page: Page) => page.getByRole('heading', { level: 2, name: /^Eintrag \d+ von \d+$/ });

test('Sprachprüfung: Warteschlange, Stichprobe ziehen, Tastenkürzel, Korrektur, Sprachwahl', async ({ page }) => {
  await angemeldetesKonto(page, 'sprachpruefung', undefined, pruefspracheDeutsch, /\/verwaltung\/lernapp\/sprachpruefung$/);
  await expect(page.getByRole('heading', { level: 1, name: d.titel })).toBeVisible();
  await expect(page.getByText(d.eigeneSprachen.replace('{sprachen}', d.sprachname.de))).toBeVisible();

  // Warteschlange: Zieltexte der deutschen Testeinheit, noch ohne Stichprobe
  const tabelle = page.getByRole('region', { name: d.warteschlange.beschriftung });
  const zeile = tabelle.getByRole('row').filter({ hasText: 'de.a1.test' }).filter({ hasText: d.art.zieltext });
  await expect(zeile).toHaveCount(1);
  await expect(zeile).toContainText(d.warteschlange.keine);
  expect(await ernsteBefunde(page, 'warteschlange')).toEqual([]);
  await zeile.getByRole('button', { name: d.warteschlange.ziehen }).click();
  await expect(page).toHaveURL(/\/verwaltung\/lernapp\/sprachpruefung\/[0-9a-f-]{36}\?ui=de$/);
  const adresse = new URL(page.url()).pathname;

  // Einlauf (erste Stichproben der Sprache, 30 %); weniger als 20 Einträge → alle gezogen
  await expect(page.getByText(s.einlauf)).toBeVisible();
  await expect(eintragKopf(page)).toHaveText(/^Eintrag 1 von \d+$/);
  const anzahl = Number((await eintragKopf(page).innerText()).match(/von (\d+)$/)![1]);
  expect(anzahl).toBeGreaterThan(2);
  const liste = page.getByRole('list').filter({ has: page.getByRole('button', { name: /de\.a1\.test\./ }) });

  // Tastenkürzel 1: in Ordnung und weiter (Fokus nicht in einem Textfeld)
  await eintragKopf(page).focus();
  await page.keyboard.press('1');
  await expect(page.getByText(s.gespeichert)).toBeVisible();
  await expect(eintragKopf(page)).toHaveText(`Eintrag 2 von ${anzahl}`);
  await expect(eintragKopf(page)).toBeFocused();
  await expect(liste.getByRole('button').first()).toContainText(s.urteile.ok);

  // Tastenkürzel 2: Korrektur – Fokus im Korrekturfeld, Kategorie Pflicht, leichte Kategorie mit Vorschlag
  await page.keyboard.press('2');
  const korrektur = page.getByLabel(s.korrektur);
  await expect(korrektur).toBeFocused();
  await korrektur.fill('[Korrigierte Fassung]');
  await page.getByRole('button', { name: s.speichern }).click();
  await expect(page.getByText(d.fehler.kategorieFehlt)).toBeVisible();
  await page.getByRole('radio', { name: s.kategorien.zeichensetzung }).check();
  await page.getByRole('button', { name: s.speichern }).click();
  await expect(page.getByText(s.gespeichert)).toBeVisible();
  await expect(eintragKopf(page)).toHaveText(`Eintrag 3 von ${anzahl}`);
  await expect(liste.getByRole('button').nth(1)).toContainText(s.urteile.korrektur);
  expect(await ernsteBefunde(page, 'stichprobe')).toEqual([]);

  // N/P blättern, ohne zu urteilen
  await page.keyboard.press('p');
  await expect(eintragKopf(page)).toHaveText(`Eintrag 2 von ${anzahl}`);
  await expect(page.getByText(s.beurteilt.replace('{urteil}', `${s.urteile.korrektur} (${s.kategorien.zeichensetzung})`))).toBeVisible();

  // WCAG 2.1.4: Kürzel wirken nur im Prüfbereich – in der Eintragsliste speichert „1“ nichts – und lassen sich ausschalten
  const dritter = liste.getByRole('button').nth(2);
  await dritter.focus();
  await page.keyboard.press('1');
  await expect(eintragKopf(page)).toHaveText(`Eintrag 2 von ${anzahl}`);
  await expect(dritter).toContainText(s.offen);
  const schalter = page.getByRole('checkbox', { name: s.tasten.schalter });
  await expect(schalter).toBeChecked();
  await schalter.uncheck();
  await eintragKopf(page).focus();
  await page.keyboard.press('n');
  await page.keyboard.press('1');
  await expect(eintragKopf(page)).toHaveText(`Eintrag 2 von ${anzahl}`);
  await expect(dritter).toContainText(s.offen);
  await expect(page.getByRole('button', { name: s.naechster })).not.toHaveAttribute('aria-keyshortcuts');
  await schalter.check();
  await expect(page.getByRole('button', { name: s.naechster })).toHaveAttribute('aria-keyshortcuts', 'N');

  // Nach dem Neuladen: Urteile gespeichert, Stand in der Warteschlange
  await page.goto('/verwaltung/lernapp/sprachpruefung');
  await expect(zeile).toContainText(d.warteschlange.offen.replace('{geprueft}', '2').replace('{groesse}', String(anzahl)));

  // Sprachwahl: Türkisch und Arabisch – Gerüst links-nach-rechts, Texte mit lang/dir
  for (const ui of ['tr', 'ar'] as const) {
    const texte = pruefung[ui];
    await page.goto(adresse);
    await page.getByRole('navigation', { name: d.sprachwahl }).getByRole('link', { name: texte.sprachname[ui] }).click();
    await expect(page).toHaveURL(new RegExp(`\\?ui=${ui}$`));
    const titel = page.getByRole('heading', { level: 1 });
    await expect(titel).toHaveAttribute('lang', ui);
    await expect(page.getByRole('navigation', { name: texte.sprachwahl })).toHaveAttribute('dir', ui === 'ar' ? 'rtl' : 'ltr');
    await expect(page.getByRole('button', { name: texte.stichprobe.speichern })).toHaveAttribute('dir', ui === 'ar' ? 'rtl' : 'ltr');
    expect(await page.locator('html').getAttribute('dir')).not.toBe('rtl');
    expect(await ernsteBefunde(page, `stichprobe-${ui}`)).toEqual([]);
  }
});
