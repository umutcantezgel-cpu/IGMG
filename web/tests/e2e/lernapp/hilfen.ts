import AxeBuilder from '@axe-core/playwright';
import { expect, type Page } from '@playwright/test';
import de from '../../../messages/lernapp/de.json';
import { formatiere } from '../../../src/lib/lernapp/format';

/**
 * Hilfen für die E2E der Lern-App (L1): Testkurs aus dem Seed (`drizzle/seeds/lernapp-test.ts`, neutrale Alltagswörter,
 * synthetische Töne), Lektion `tr-aus-de.a1.test.l01` in der deutschen Oberfläche:
 * 1. Auswahl „su“ → „Wasser“  2. Paare su/Wasser, ekmek/Brot, ev/Haus, kitap/Buch  3. Wortbank „Su içiyorum.“
 * 4. Auswahl „Buch“ → „kitap“.
 */

export const KURS = 'tr-aus-de';
/** Thema der Testeinheit in der Oberfläche de (Station im Lernpfad; daneben stehen in der E2E-Datenbank die echten Einheiten). */
export const THEMA_TEST = 'Testeinheit: Alltag';
export const LEKTION_1 = 'tr-aus-de.a1.test.l01';
export const LEKTION_2 = 'tr-aus-de.a1.test.l02';
export const EINHEIT = 'tr.a1.test';
export const KARTE_WASSER = 'tr-aus-de:tr.a1.test.w001';
export const PAARE: [string, string][] = [
  ['su', 'Wasser'],
  ['ekmek', 'Brot'],
  ['ev', 'Haus'],
  ['kitap', 'Buch'],
];

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

/**
 * axe (WCAG 2.2 AA); gezählt werden ernste und kritische Befunde, als lesbare Zeilen. Vorher laufen alle Übergänge aus
 * (Einblenden des Rückmeldeblatts): mitten im Übergang misst axe halbe Deckkraft als Kontrast.
 */
export async function ernsteBefunde(page: Page, kennzeichen: string): Promise<string[]> {
  await page.waitForFunction(() =>
    document.getAnimations().every((a) => a.playState !== 'running' || a.effect?.getTiming().iterations === Infinity),
  );
  const ergebnis = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  return ergebnis.violations
    .filter((v) => v.impact === 'serious' || v.impact === 'critical')
    .map(
      (v) =>
        `${kennzeichen} ${v.id} (${v.impact}, ${v.nodes.length}): ${v.nodes
          .slice(0, 3)
          .map((n) => n.target.join(' '))
          .join(' ; ')}`,
    );
}

/** Station der Testeinheit im Lernpfad (Oberfläche de): Abschnitt mit ihrem Thema als Überschrift. */
export const testStation = (page: Page) => page.getByRole('region', { name: THEMA_TEST, exact: true });

/** Die eine Live-Region des Spielers (Rückmeldeblatt). */
export const liveRegion = (page: Page) => page.locator('main p[role="status"].sr-only').first();

export type Bedienung = 'tastatur' | 'tippen';

const t = de.spieler;

async function weiter(page: Page, art: Bedienung) {
  const knopf = page.getByRole('button', { name: t.weiter, exact: true });
  await expect(knopf).toBeVisible();
  if (art === 'tippen') await knopf.tap();
  else {
    // Fokus liegt nach dem Prüfen auf „Weiter“ (KERN 4.0 §8)
    await expect(knopf).toBeFocused();
    await page.keyboard.press('Enter');
  }
}

async function auswahl(page: Page, art: Bedienung, ziel: string, { ziffer = false } = {}) {
  const radio = page.getByRole('radio', { name: ziel, exact: true });
  await expect(radio).toBeAttached();
  if (art === 'tippen') {
    await page.locator('main label').filter({ has: radio }).tap();
    await expect(radio).toBeChecked();
    await page.getByRole('button', { name: t.pruefen, exact: true }).tap();
    return;
  }
  if (ziffer) {
    // Ziffern 1–n wählen direkt (Position in der Anzeige)
    const namen = await page.locator('main fieldset label').allInnerTexts();
    const pos = namen.findIndex((n) => n.includes(ziel));
    await page.getByRole('radio').first().focus();
    await page.keyboard.press(String(pos + 1));
  } else {
    await radio.focus();
    await page.keyboard.press('Space');
  }
  await expect(radio).toBeChecked();
  await page.keyboard.press('Enter');
}

async function paare(page: Page, art: Bedienung) {
  const knopf = (name: string) => page.getByRole('button', { name, exact: true });
  if (art === 'tastatur') {
    // Pfeiltasten wechseln innerhalb einer Liste
    await knopf(PAARE[0]![0]).focus();
    await page.keyboard.press('ArrowDown');
    await expect(knopf(PAARE[1]![0])).toBeFocused();
  }
  for (const [links, rechts] of PAARE) {
    if (art === 'tippen') {
      await knopf(links).tap();
      await knopf(rechts).tap();
    } else {
      await knopf(links).focus();
      await page.keyboard.press('Enter');
      await expect(knopf(links)).toHaveAttribute('aria-pressed', 'true');
      await knopf(rechts).focus();
      await page.keyboard.press('Enter');
    }
  }
}

async function wortbank(page: Page, art: Bedienung, woerter: string[]) {
  const kachel = (w: string) => page.getByRole('button', { name: formatiere(de.aufgaben.wortbank.hinzufuegen, { wort: w }), exact: true });
  for (const w of woerter) {
    if (art === 'tippen') await kachel(w).tap();
    else {
      await kachel(w).focus();
      await page.keyboard.press('Enter');
    }
    // Die Kachel steht in der Antwort; der Fokus wandert erst im nächsten Bild (requestAnimationFrame) zur nächsten Kachel –
    // abwarten, sonst landet „Enter“ unter Last auf der Kachel, die der Spieler gerade fokussiert.
    await expect(kachel(w)).toHaveCount(0);
    await page.evaluate(() => new Promise<void>((fertig) => requestAnimationFrame(() => requestAnimationFrame(() => fertig()))));
  }
  const pruefen = page.getByRole('button', { name: t.pruefen, exact: true });
  if (art === 'tippen') await pruefen.tap();
  else {
    await pruefen.focus();
    await page.keyboard.press('Enter');
  }
}

/**
 * Spielt Lektion 1 des Testkurses (Oberfläche de) ganz durch. `ersteFalsch`: Die erste Aufgabe wird zuerst falsch beantwortet
 * und kommt am Ende ohne Strafe noch einmal. Prüft die Live-Region nach jeder Antwort.
 */
export async function spieleLektion1(page: Page, art: Bedienung, { ersteFalsch = false } = {}) {
  const status = liveRegion(page);
  // erstes Laden der Lektion: Kursverzeichnis und Paket der Einheit (mit den echten Inhalten daneben etwas länger)
  await expect(page.getByRole('heading', { name: de.aufgaben.auswahl.waehleUebersetzung })).toBeVisible({ timeout: 15_000 });
  await auswahl(page, art, ersteFalsch ? 'Brot' : 'Wasser', { ziffer: !ersteFalsch });
  if (ersteFalsch) {
    await expect(status).toContainText(t.falsch);
    await expect(status).toContainText(t.spaeter);
  } else await expect(status).toHaveText(t.richtig);
  await weiter(page, art);

  await expect(page.getByRole('heading', { name: de.aufgaben.paare.findePaare })).toBeVisible();
  await paare(page, art);
  await expect(status).toHaveText(t.richtig);
  await weiter(page, art);

  await expect(page.getByRole('heading', { name: de.aufgaben.wortbank.uebersetze })).toBeVisible();
  await wortbank(page, art, ['Su', 'içiyorum']);
  await expect(status).toHaveText(t.richtig);
  await weiter(page, art);

  await expect(page.getByRole('heading', { name: de.aufgaben.auswahl.waehleWort })).toBeVisible();
  await auswahl(page, art, 'kitap');
  await expect(status).toHaveText(t.richtig);
  await weiter(page, art);

  if (ersteFalsch) {
    await expect(page.getByText(t.nochEinmal, { exact: true })).toBeVisible();
    await auswahl(page, art, 'Wasser');
    await expect(status).toHaveText(t.richtig);
    await weiter(page, art);
  }
  await expect(page.getByRole('heading', { name: t.fertigTitel })).toBeVisible();
  // der Weg zurück erscheint, sobald Ereignisse und Ableitung auf dem Gerät gespeichert sind
  await expect(page.getByRole('link', { name: t.zurueck })).toBeVisible();
}

/** Ergebnistext und XP der Lektion (statisch). */
export const ergebnisText = (richtig: number, gesamt: number) => formatiere(t.fertigText, { richtig, gesamt }, 'de');
export const xpText = (n: number) => formatiere(t.xp, { n }, 'de');

/** Kartenstand aus der lokalen Datenbank `igmg-lernapp` (ohne Profilfeld). */
export async function kartenstand(page: Page, karte: string): Promise<Record<string, unknown> | null> {
  return page.evaluate(async (k) => {
    const db = await new Promise<IDBDatabase>((ok, fehler) => {
      const r = indexedDB.open('igmg-lernapp');
      r.onsuccess = () => ok(r.result);
      r.onerror = () => fehler(r.error);
    });
    const alle = await new Promise<Record<string, unknown>[]>((ok, fehler) => {
      const r = db.transaction('karten').objectStore('karten').getAll();
      r.onsuccess = () => ok(r.result as Record<string, unknown>[]);
      r.onerror = () => fehler(r.error);
    });
    db.close();
    const stand = alle.find((x) => x.karte === k);
    if (!stand) return null;
    const { profil: _profil, ...rest } = stand;
    return rest;
  }, karte);
}

/** Wartet, bis der Service Worker der Lern-App die Seite steuert. */
export async function swSteuert(page: Page) {
  await expect
    .poll(() => page.evaluate(() => navigator.serviceWorker.controller?.scriptURL ?? ''), { timeout: 30_000 })
    .toContain('/lern-app/sw.js');
}

/**
 * Eine Aufgabe der Wiederholungsrunde (aus Lektion 1 des Testkurses, Oberfläche de) richtig lösen – Auswahl, Paare, Wortbank;
 * danach „Weiter“.
 */
export async function loeseWiederholung(page: Page) {
  const form = page.locator('main form[data-aufgabe]');
  const typ = await form.getAttribute('data-aufgabe');
  if (typ === 'auswahl') {
    const ueberschrift = await page.locator('main form h2').innerText();
    const ziel = ueberschrift === de.aufgaben.auswahl.waehleUebersetzung ? 'Wasser' : 'kitap';
    await page
      .locator('main label')
      .filter({ has: page.getByRole('radio', { name: ziel, exact: true }) })
      .click();
    await page.getByRole('button', { name: t.pruefen, exact: true }).click();
  } else if (typ === 'paare') {
    for (const [links, rechts] of PAARE) {
      await page.getByRole('button', { name: links, exact: true }).click();
      await page.getByRole('button', { name: rechts, exact: true }).click();
    }
  } else if (typ === 'wortbank') {
    for (const w of ['Su', 'içiyorum']) {
      const kachel = page.getByRole('button', { name: formatiere(de.aufgaben.wortbank.hinzufuegen, { wort: w }, 'de'), exact: true });
      await kachel.click();
      await expect(kachel).toHaveCount(0);
    }
    await page.getByRole('button', { name: t.pruefen, exact: true }).click();
  } else throw new Error(`unerwarteter Typ ${typ}`);
  await expect(liveRegion(page)).toContainText(t.richtig);
  await page.getByRole('button', { name: t.weiter, exact: true }).click();
}

/** Wiederholungsrunde bis „fertig“ spielen (höchstens acht Aufgaben). */
export async function wiederholeBisFertig(page: Page) {
  await expect(page.locator('main form[data-aufgabe]')).toBeVisible({ timeout: 15_000 });
  for (let i = 0; i < 8 && (await page.locator('main form[data-aufgabe]').count()) > 0; i++) await loeseWiederholung(page);
  await expect(page.getByRole('heading', { name: t.fertigTitel })).toBeVisible();
  await expect(page.getByRole('link', { name: t.zurueck })).toBeVisible();
}
