import { expect, test } from '@playwright/test';
import de from '../../../messages/lernapp/de.json';
import verwaltung from '../../../messages/verwaltung/lernapp.json';
import { formatiere } from '../../../src/lib/lernapp/format';
import { angemeldetesKonto } from '../hilfen/konto';
import { ernsteBefunde, KURS, LEKTION_1, liveRegion } from './hilfen';

/**
 * „Fehler melden“ (L3-06b, ADR 0041 Nr. 9, KERN 4.0 §5/§6/§8) mit dem Testkurs: Knopf im Rückmeldeblatt; ALTCHA (`GET
 * /api/altcha`) erst nach dem Klick, gelöst im Browser; `POST /api/lernapp/meldung` nur mit Kurs, Aufgabe, Kategorie und
 * ALTCHA, ohne Cookies; während des Sendens bleibt der Fokus auf dem Knopf und Escape schließt nicht; Dialog mit
 * Fokusrückgabe; die Meldung erscheint in /verwaltung/lernapp/meldungen, und nach „Ohne
 * Änderung erledigen“ liegt der Fokus auf der Ansage der Liste (WCAG 2.4.3/4.1.3). Nur Desktop; axe auf Blatt und Dialog.
 */
const m = de.melden;
const v = verwaltung.lernapp.meldungen;
const AUFGABE = 'tr.a1.test.l01.a01';

test.describe.configure({ mode: 'serial' });

test.beforeEach(async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'Melde-Weg einmal je Lauf');
  await page.addInitScript(() => window.localStorage.setItem('igmg-konzepthinweis-gesehen', '1'));
});

test('Lern-App: melden aus dem Rückmeldeblatt, ALTCHA erst nach dem Klick, nur Aufgabe und Kategorie', async ({ page, context }) => {
  test.setTimeout(150_000);
  const api: { methode: string; pfad: string; koerper: string | null }[] = [];
  context.on('request', (r) => {
    const u = new URL(r.url());
    if (u.pathname.startsWith('/api/')) api.push({ methode: r.method(), pfad: u.pathname, koerper: r.postData() });
  });
  await page.goto(`/lern-app/de/${KURS}/ueben?l=${LEKTION_1}`);
  // erstes Laden der Lektion: Kursverzeichnis und Paket der Einheit
  await expect(page.getByRole('heading', { name: de.aufgaben.auswahl.waehleUebersetzung })).toBeVisible({ timeout: 15_000 });
  // erste Aufgabe (Auswahl): beantworten, dann steht das Rückmeldeblatt mit „Weiter“ und „Fehler melden“
  const radio = page.getByRole('radio', { name: 'Wasser', exact: true });
  await radio.focus();
  await page.keyboard.press('Space');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: de.spieler.weiter, exact: true })).toBeFocused();
  const melden = page.getByRole('button', { name: m.knopf, exact: true });
  await expect(melden).toBeVisible();
  expect(await ernsteBefunde(page, 'blatt-melden')).toEqual([]);
  expect(api).toEqual([]);

  await melden.click();
  const dialog = page.getByRole('dialog', { name: m.titel });
  await expect(dialog).toBeVisible();
  await expect.poll(() => api.map((a) => `${a.methode} ${a.pfad}`)).toContain('GET /api/altcha');
  // ohne Kategorie: Hinweis am Feld, nichts gesendet
  await dialog.getByRole('button', { name: m.senden, exact: true }).click();
  await expect(dialog.getByText(m.waehlen)).toBeVisible();
  await dialog.getByRole('radio', { name: m.kategorien.fehler_uebersetzung, exact: true }).check();
  expect(await ernsteBefunde(page, 'melde-dialog')).toEqual([]);
  // Die Meldung wird angehalten, bis der Zustand „sendet“ geprüft ist: Der Fokus bleibt auf dem Knopf (nur aria-disabled,
  // nicht deaktiviert), und Escape schließt den Dialog nicht, damit das Ergebnis angesagt wird (Gegenprüfung L3-06b)
  let loslassen!: () => void;
  const gehalten = new Promise<void>((r) => {
    loslassen = r;
  });
  await page.route('**/api/lernapp/meldung', async (route) => {
    await gehalten;
    await route.continue();
  });
  const knopf = dialog.locator('button[type="submit"]');
  await expect(knopf).toHaveText(m.senden);
  await knopf.click();
  await expect(dialog.getByRole('status')).toHaveText(m.sendet);
  await expect(knopf).toBeFocused();
  await expect(knopf).toHaveAttribute('aria-disabled', 'true');
  await page.keyboard.press('Escape');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('radio', { name: m.kategorien.fehler_uebersetzung, exact: true })).toBeChecked();
  loslassen();
  // die Lösung im Browser dauert je nach Last einige Sekunden
  await expect(dialog.getByRole('status')).toHaveText(m.danke, { timeout: 90_000 });
  await expect(page.locator(':focus')).toHaveText(m.schliessen);
  await page.keyboard.press('Enter');
  await expect(dialog).toBeHidden();
  await expect(melden).toBeFocused();
  await expect(liveRegion(page)).toContainText(de.spieler.richtig);

  const posts = api.filter((a) => a.methode === 'POST');
  expect(posts.map((a) => a.pfad)).toEqual(['/api/lernapp/meldung']);
  const koerper = JSON.parse(posts[0]!.koerper ?? '{}') as Record<string, string>;
  expect(Object.keys(koerper).sort()).toEqual(['altcha', 'aufgabe', 'kategorie', 'kurs']);
  expect(koerper).toMatchObject({ kurs: KURS, aufgabe: AUFGABE, kategorie: 'fehler_uebersetzung' });
  expect(await context.cookies()).toEqual([]);
});

test('Verwaltung: die Meldung steht unter Meldungen; nach dem Erledigen Fokus und Ansage', async ({ page }) => {
  test.setTimeout(90_000);
  await angemeldetesKonto(page, 'bildung');
  await page.goto('/verwaltung/lernapp/meldungen');
  await expect(page.getByRole('heading', { level: 1, name: v.titel })).toBeVisible();
  const eintrag = page
    .getByRole('listitem')
    .filter({ hasText: formatiere(v.aufgabe, { aufgabe: AUFGABE, kurs: KURS }, 'de') })
    .filter({ has: page.getByRole('heading', { name: v.kategorie.fehler_uebersetzung }) })
    .first();
  await expect(eintrag).toBeVisible();
  expect(await ernsteBefunde(page, 'verwaltung-meldungen')).toEqual([]);
  const vorher = await page
    .getByRole('listitem')
    .filter({ hasText: formatiere(v.aufgabe, { aufgabe: AUFGABE, kurs: KURS }, 'de') })
    .count();
  await eintrag.getByRole('button', { name: v.erledigen }).click();
  // der Eintrag verschwindet aus „offen“; der Fokus fällt nicht auf den Seitenanfang, sondern auf die Ansage der Liste
  await expect(page.locator(':focus')).toContainText(v.erledigtText);
  await expect(page.getByRole('listitem').filter({ hasText: formatiere(v.aufgabe, { aufgabe: AUFGABE, kurs: KURS }, 'de') })).toHaveCount(
    vorher - 1,
  );
  await page.goto('/verwaltung/lernapp/meldungen?ansicht=erledigt');
  await expect(
    page
      .getByRole('listitem')
      .filter({ hasText: formatiere(v.aufgabe, { aufgabe: AUFGABE, kurs: KURS }, 'de') })
      .first(),
  ).toBeVisible();
});
