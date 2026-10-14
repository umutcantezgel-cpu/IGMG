import { expect, test, type Locator, type Page } from '@playwright/test';
import gebetszeiten from '../../messages/bereiche/gebetszeiten.json';
import ort from '../../messages/bereiche/mein-ort.json';
import projekte from '../../messages/bereiche/projekte.json';
import de from '../../messages/de.json';

/**
 * Sichtabnahme Z-04, Befundpaket 2 (öffentliche Seiten): messbare Kriterien für Startseite, Gebetszeiten und Projekte.
 * - Startseite: Aufmacher ist nicht die alte Empfehlung von 2025 (ST-1), „Gemeinde beitreten“ steht auf dem Telefon im
 *   ersten Bildschirm (ST-2), die Beschriftungen des Tagesbogens stehen auf einer Grundlinie (ST-3), nach Isha steht
 *   rechts die Marke „jetzt“ (ST-4).
 * - Gebetszeiten: Reiterleiste einzeilig, aktiver Reiter im Blick (G-1), genau ein „Vollbild“ im Kopf (G-4), Ortsauswahl
 *   so breit wie die Tabelle und Spalten bündig (G-3), Zifferblatt mit Gradzahl (G-2).
 * - Projekte: kein Text läuft über eine Kennzahl-Kachel hinaus (PR-1), Meilensteine als gleich gebaute Zeilen (PR-2).
 * Texte aus messages, Inhalte aus den Seeds.
 */
const START = de.start;
const GZ = gebetszeiten.de.gebetszeiten;
const ORT = ort.de.meinOrt;
const PR = projekte.de.projekte;

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    try {
      window.localStorage.setItem('igmg-konzepthinweis-gesehen', '1');
    } catch {
      // Kein Speicher verfügbar: der Hinweis bleibt sichtbar.
    }
  });
});

/** Rechteck eines Elements (Seite, nicht Fenster). */
async function kasten(l: Locator) {
  const k = await l.boundingBox();
  expect(k).not.toBeNull();
  return k!;
}

/** Reiter wählen; vor der Hydrierung bleibt ein Klick wirkungslos, deshalb bis zur Auswahl wiederholen. */
async function waehleReiter(reiter: Locator) {
  await expect(async () => {
    await reiter.click();
    await expect(reiter).toHaveAttribute('aria-selected', 'true', { timeout: 2000 });
  }).toPass({ timeout: 60_000 });
}

async function neuigkeiten(page: Page) {
  return page.getByRole('region', { name: START.neuigkeitenTitel });
}

test.describe('Startseite', () => {
  test('Aufmacher: nicht die Bestandsmeldung von 2025, sondern ein Beitrag ab dem 12.10.2026 (ST-1)', async ({ page }) => {
    await page.goto('/');
    const bereich = await neuigkeiten(page);
    const aufmacher = bereich.locator('article').first();
    await expect(aufmacher.getByRole('heading', { level: 3 })).not.toHaveText('Neue Gebetszeiten für den Winter');
    const datum = await aufmacher.locator('time').first().getAttribute('datetime');
    expect(datum! >= '2026-10-12').toBe(true);
  });

  test('Telefon: Kennung, Titel, Einleitung und „Gemeinde beitreten“ vor der Tageskarte, Knopf im ersten Bildschirm (ST-2)', async ({
    page,
  }, info) => {
    test.skip(info.project.name !== 'telefon', 'nur auf dem Telefon');
    await page.goto('/');
    const knopf = page.getByRole('link', { name: START.beitreten });
    const k = await kasten(knopf);
    expect(k.y + k.height).toBeLessThanOrEqual(844);
    const bogen = await kasten(page.locator('figure').filter({ hasText: START.bogenTitel }).first());
    expect(bogen.y).toBeGreaterThan(k.y + k.height);
  });

  test('Desktop: die sechs Beschriftungen des Tagesbogens stehen auf einer Grundlinie (ST-3)', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'die einzeilige Reihe gilt ab 36 rem Bogenbreite');
    await page.goto('/');
    const namen = page.locator('figure').filter({ hasText: START.bogenTitel }).first().locator('ol > li > span:first-child');
    await expect(namen).toHaveCount(6);
    const oben = await namen.evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().top)));
    expect(new Set(oben).size).toBe(1);
    // keine Beschriftung überlappt die nächste
    const lr = await namen.evaluateAll((els) => els.map((e) => [e.getBoundingClientRect().left, e.getBoundingClientRect().right]));
    lr.slice(1).forEach(([links], i) => expect(links).toBeGreaterThanOrEqual(lr[i][1]));
  });

  test('nach Isha steht rechts die Marke „jetzt“ (ST-4)', async ({ page }) => {
    // Isha der Seite lesen, dann mit der Uhr 10 Minuten nach Isha (heute, Europe/Berlin) neu laden
    await page.goto('/');
    const figur = page.locator('figure').filter({ hasText: START.bogenTitel }).first();
    const isha = (await figur.locator('ol > li').last().locator('span').last().textContent())!.trim();
    const [h, m] = isha.split(':').map(Number);
    test.skip(h * 60 + m + 10 >= 24 * 60, 'Isha nach 23:50: kein Abend auf diesem Bogen');
    const heute = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Berlin' }).format(new Date());
    const zeit = `${String(h + Math.floor((m + 10) / 60)).padStart(2, '0')}:${String((m + 10) % 60).padStart(2, '0')}`;
    // Sommerzeit oder nicht: Berlin-Versatz über die Zeitzone des Datums bestimmen
    const versatz = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Berlin', timeZoneName: 'longOffset' })
      .format(new Date(`${heute}T12:00:00Z`))
      .split('GMT')[1];
    await page.clock.install({ time: new Date(`${heute}T${zeit}:00${versatz}`) });
    await page.reload();
    const bogen = page.locator('figure').filter({ hasText: START.bogenTitel }).first();
    const marke = bogen.getByText(START.bogenJetzt, { exact: true });
    await expect(marke).toBeVisible();
    const f = await kasten(bogen);
    const j = await kasten(marke);
    expect(j.x).toBeGreaterThan(f.x + f.width / 2);
  });
});

test.describe('Gebetszeiten', () => {
  test('Reiterleiste einzeilig, der aktive Reiter steht ganz im Blick (G-1)', async ({ page }) => {
    await page.goto('/gebetszeiten');
    const leiste = page.getByRole('tablist', { name: GZ.ansichtAria, exact: true });
    const reiter = leiste.getByRole('tab');
    await expect(reiter).toHaveCount(5);
    const oben = await reiter.evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().top)));
    expect(new Set(oben).size).toBe(1);
    // Letzten Reiter wählen: er wird in den Blick gescrollt
    await waehleReiter(leiste.getByRole('tab', { name: GZ.tabEinstellungen, exact: true }));
    await expect
      .poll(async () => {
        const l = await kasten(leiste);
        const r = await kasten(leiste.getByRole('tab', { name: GZ.tabEinstellungen, exact: true }));
        return r.x >= l.x - 1 && r.x + r.width <= l.x + l.width + 1;
      })
      .toBe(true);
    const seitenbreite = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(seitenbreite).toBeLessThanOrEqual(page.viewportSize()!.width);
  });

  test('genau ein „Vollbild“, im Kopf über dem nächsten Gebet (G-4)', async ({ page }) => {
    await page.goto('/gebetszeiten');
    const vollbild = page.getByRole('link', { name: GZ.vollbildAria, exact: true });
    await expect(vollbild).toHaveCount(1);
    await expect(vollbild).toBeVisible();
    const k = await kasten(vollbild);
    const titel = await kasten(page.getByRole('heading', { level: 1 }));
    const naechstes = await kasten(page.locator('#gz-naechstes'));
    expect(k.y).toBeGreaterThan(titel.y);
    expect(k.y + k.height).toBeLessThan(naechstes.y);
  });

  test('Mein Ort mit Gießen: Auswahl so breit wie die Tabelle, Kopf und Zellen bündig, Gradzahl im Kreis (G-2, G-3)', async ({ page }) => {
    await page.goto('/gebetszeiten');
    await waehleReiter(page.getByRole('tab', { name: ORT.tab }));
    await page.getByRole('button', { name: ORT.ortWaehlen }).click();
    await page.getByLabel(ORT.ortLabel).selectOption('Gießen');
    await expect(page.getByRole('heading', { name: ORT.zeitenFuer.replace('{ort}', 'Gießen') })).toBeVisible();
    const tabelle = page.getByRole('table');
    const auswahl = await kasten(page.getByLabel(ORT.ortLabel));
    const t = await kasten(tabelle);
    expect(Math.abs(auswahl.width - t.width)).toBeLessThanOrEqual(1);
    // Textanfang des Spaltenkopfs „Gebet“ und der ersten Zeile liegen gleich weit links
    const anfang = (l: Locator) => l.evaluate((e) => e.getBoundingClientRect().left + parseFloat(getComputedStyle(e).paddingLeft));
    const kopf = await anfang(tabelle.getByRole('columnheader').first());
    const zeile = await anfang(tabelle.getByRole('rowheader').first());
    expect(Math.abs(kopf - zeile)).toBeLessThanOrEqual(1);
    const kompass = page.getByRole('img', { name: /Qibla/ });
    await expect(kompass).toContainText('°');
  });
});

test.describe('Projekte', () => {
  test('kein Text läuft über eine Kennzahl-Kachel hinaus (PR-1)', async ({ page }) => {
    await page.goto('/projekte');
    const werte = page.locator('section[aria-labelledby="projekt-beschreibung"] dl dd');
    await expect(werte).toHaveCount(4);
    const ueber = await werte.evaluateAll(
      (els) =>
        els.filter((e) => {
          const kachel = e.parentElement!.getBoundingClientRect();
          const r = e.getBoundingClientRect();
          return e.scrollWidth > e.clientWidth + 1 || r.right > kachel.right + 0.5;
        }).length,
    );
    expect(ueber).toBe(0);
  });

  test('Meilensteine: alle Zeilen gleich gebaut, Titel bündig (PR-2)', async ({ page }) => {
    await page.goto('/projekte');
    const bereich = page.getByRole('region', { name: PR.bezeichnungen.meilensteine });
    const titel = bereich.locator('ol').last().locator('li h3');
    const anzahl = await titel.count();
    expect(anzahl).toBeGreaterThan(0);
    const links = await titel.evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().left)));
    expect(new Set(links).size).toBe(1);
  });
});
