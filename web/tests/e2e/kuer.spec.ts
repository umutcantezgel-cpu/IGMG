import { randomBytes } from 'node:crypto';
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import formulare from '../../messages/bereiche/formulare.json';
import hatim from '../../messages/bereiche/hatim.json';
import kalender from '../../messages/bereiche/kalender.json';
import newsletter from '../../messages/bereiche/newsletter.json';
import ramadan from '../../messages/bereiche/ramadan.json';
import spenden from '../../messages/bereiche/spenden.json';
import { ALTCHA_MS } from './hilfen/altcha';
import { angemeldetesKonto } from './hilfen/konto';

/**
 * Kür A der Gemeinde-Plattform (AUFTRAG 3.10, H-K01–H-K04): Kalender mit Hidschri-Tagen und vorläufigen besonderen
 * Tagen samt iCal, Ramadan (Hinweis ohne Countdown, Imsakiye), Spenden ohne und mit IBAN (GiroCode, IBAN kopieren),
 * Hatim (Verwaltung → öffentlich mit Ring, ohne Namen) und Newsletter (Formular, Meldung aus dem Anker).
 * Hatim und Newsletter hängen am Funktionsschalter (zur Bauzeit): Ist er aus, antworten die Seiten mit 404 – das wird
 * geprüft, der Rest des Ablaufs entfällt dann. Texte aus messages, Selektoren über Rollen und Beschriftungen.
 */
const k = kalender.de.kalender;
const r = ramadan.tr.ramadan;
const s = spenden.de.spenden;
const h = hatim.de.hatim;
const n = newsletter.de.newsletter;
const fo = formulare.de.formulare;
const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

async function oeffentlichBis(page: Page, pfad: string, pruefe: () => Promise<void>) {
  await expect(async () => {
    await page.goto(pfad);
    await pruefe();
  }).toPass({ timeout: 15_000, intervals: [500, 1000, 2000] });
}

async function axe(page: Page) {
  const ergebnis = await new AxeBuilder({ page }).include('main').withTags(WCAG).analyze();
  expect(ergebnis.violations.map((v) => `${v.id}: ${v.nodes.map((x) => x.target.join(' ')).join(', ')}`)).toEqual([]);
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => window.localStorage.setItem('igmg-konzepthinweis-gesehen', '1'));
});

test('Kalender: zwölf Monate mit Hidschri-Tagen, vorläufige besondere Tage, Achtstern-Legende, iCal-Abo', async ({ page, request }) => {
  const antwort = await page.goto('/kalender');
  expect(antwort?.status()).toBe(200);
  await expect(page.getByRole('heading', { level: 1, name: k.titel, exact: true })).toBeVisible();
  // Inhaltsverzeichnis mit zwölf Monaten, je Monat eine Tabelle mit Wochentagsköpfen
  await expect(page.getByRole('navigation', { name: k.inhalt }).getByRole('link')).toHaveCount(12);
  await expect(page.locator('section[id^="monat-"] table')).toHaveCount(12);
  // Vor der Freigabe sind alle besonderen Tage vorläufig (berechnet)
  const besondere = page.getByRole('region', { name: k.besondereTitel });
  await expect(besondere.getByText(k.vorlaeufigLang).first()).toBeVisible();
  await expect(page.getByText(k.hinweis)).toBeVisible();
  await axe(page);
  // iCal: ganztägige Termine mit Hinweis „vorläufig“
  const ics = await request.get('/api/ical/de/kalender');
  expect(ics.status()).toBe(200);
  expect(ics.headers()['content-type']).toContain('text/calendar');
  const text = (await ics.text()).replace(/\r\n /g, '');
  expect(text).toContain('BEGIN:VEVENT');
  expect(text).toMatch(/DTSTART;VALUE=DATE:\d{8}/);
  expect(text).toContain(`(${k.vorlaeufig})`);
  // Türkisch unter eigener Adresse
  await page.goto('/tr/takvim');
  await expect(page.locator('html')).toHaveAttribute('lang', 'tr');
  await expect(page.getByRole('heading', { level: 1, name: kalender.tr.kalender.titel, exact: true })).toBeVisible();
});

test('Ramadan (tr): Titel mit Jahr, Hinweis „voraussichtlich“ ohne Countdown, vorläufig, Platzhalter der Gemeinde', async ({ page }) => {
  const antwort = await page.goto('/tr/ramazan');
  expect(antwort?.status()).toBe(200);
  await expect(page.getByRole('heading', { level: 1, name: /^Ramazan \d{4}$/ })).toBeVisible();
  await expect(page.getByText(r.vorlaeufig).first()).toBeVisible();
  await expect(page.getByText(r.gemeinde.teravih)).toBeVisible();
  await expect(page.getByText(r.gemeinde.fitre)).toBeVisible();
  // Imsakiye (im Ramadan oder als Vorschau mit Schalter) oder der Hinweis, dass sie folgt
  const tabelle = page.getByRole('table', { name: /^İmsakiye \d{4}/ });
  if (await tabelle.count()) {
    const zeilen = await tabelle.locator('tbody tr').count();
    expect(zeilen === 29 || zeilen === 30).toBe(true);
    await expect(page.getByRole('button', { name: r.imsakiye.drucken })).toBeVisible();
  } else {
    await expect(page.getByText(r.keineVorschau)).toBeVisible();
  }
  await axe(page);
});

test.describe.serial('Spenden ohne und mit Bankverbindung', () => {
  test('ohne gültige IBAN: Platzhalter, kein GiroCode; mit IBAN: GiroCode, IBAN kopieren; danach wieder Platzhalter', async ({
    page,
    context,
  }, info) => {
    test.skip(info.project.name !== 'desktop', 'Verwaltungsablauf nur einmal je Lauf');
    test.setTimeout(150_000);
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    const antwort = await page.goto('/spenden');
    expect(antwort?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 2, name: s.platzhalter.titel })).toBeVisible();
    await expect(page.getByRole('img', { name: /GiroCode/ })).toHaveCount(0);
    await axe(page);

    // Verwaltung › Einstellungen › Spenden: falsche Prüfziffer → Fehler; gültige Prüf-IBAN (Norm-Beispiel) → gespeichert
    await angemeldetesKonto(page);
    await page.goto('/verwaltung/einstellungen');
    const bereich = page.getByRole('region', { name: 'Spenden' });
    await bereich.getByLabel('Empfänger (Kontoinhaber)').fill('[Verein – Testdaten]');
    await bereich.getByLabel('IBAN', { exact: true }).fill('DE89 3704 0044 0532 0130 01');
    await bereich.getByRole('button', { name: 'Spenden speichern' }).click();
    await expect(bereich.getByText('Diese IBAN ist nicht gültig (Prüfziffer).').first()).toBeVisible();
    await bereich.getByLabel('IBAN', { exact: true }).fill('DE89 3704 0044 0532 0130 00');
    await bereich.getByRole('button', { name: 'Spenden speichern' }).click();
    await expect(bereich.getByText('Gespeichert. Die Seite „Spenden“ zeigt die neuen Angaben.')).toBeVisible();

    await oeffentlichBis(page, '/spenden', async () => {
      await expect(page.getByRole('img', { name: `GiroCode für die Überweisung: ${s.allgemeinTitel}` })).toBeVisible({ timeout: 1000 });
    });
    await expect(page.getByText('DE89 3704 0044 0532 0130 00')).toBeVisible();
    await expect(page.getByText(s.keinDienst)).toBeVisible();
    await page.getByRole('button', { name: s.bank.kopieren }).click();
    await expect(page.getByRole('status').filter({ hasText: s.bank.kopiert })).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('DE89370400440532013000');
    await axe(page);

    // Aufräumen: IBAN leeren → Platzhalter (andere Specs sehen den Ausgangszustand)
    await page.goto('/verwaltung/einstellungen');
    await page.getByRole('region', { name: 'Spenden' }).getByLabel('IBAN', { exact: true }).fill('');
    await page.getByRole('region', { name: 'Spenden' }).getByRole('button', { name: 'Spenden speichern' }).click();
    await expect(page.getByText('Gespeichert. Die Seite „Spenden“ zeigt die neuen Angaben.')).toBeVisible();
    await oeffentlichBis(page, '/spenden', async () => {
      await expect(page.getByRole('heading', { level: 2, name: s.platzhalter.titel })).toBeVisible({ timeout: 1000 });
    });
  });
});

test('Hatim: in der Verwaltung anlegen und veröffentlichen, öffentlich Ring und 30 Cüz ohne Namen', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'Verwaltungsablauf nur einmal je Lauf');
  test.setTimeout(150_000);
  const liste = await page.goto('/hatim');
  if (liste?.status() === 404) {
    // Funktionsschalter „hatim“ aus (Produktion ohne FUNKTION_HATIM=an): auch die Detailseiten gibt es dann nicht
    expect((await page.goto('/hatim/_'))?.status()).toBe(404);
    test.skip(true, 'Funktion „hatim“ ist zur Bauzeit aus');
  }
  await expect(page.getByRole('heading', { level: 1, name: h.titel, exact: true })).toBeVisible();

  await angemeldetesKonto(page);
  const titel = `Testhatim ${randomBytes(3).toString('hex')}`;
  await page.goto('/verwaltung/hatim/neu');
  await page
    .getByLabel(/^Titel/)
    .first()
    .fill(titel);
  await page
    .getByLabel(/^Anlass/)
    .first()
    .fill('Für die Gemeinde (Testdaten)');
  await page.getByRole('button', { name: 'Hatim anlegen' }).click();
  await expect(page).toHaveURL(/\/verwaltung\/hatim\/[0-9a-f-]{36}\?angelegt=1$/);
  await page.getByRole('button', { name: 'Veröffentlichen' }).click();
  await expect(page.getByText('Veröffentlicht', { exact: true }).first()).toBeVisible();
  const id = /hatim\/([0-9a-f-]{36})/.exec(page.url())![1];

  await oeffentlichBis(page, '/hatim', async () => {
    await expect(page.getByRole('heading', { level: 3, name: titel })).toBeVisible({ timeout: 1000 });
  });
  await expect(page.getByRole('img', { name: `Stand der Hatim „${titel}“: 0 von 30 Cüz gelesen, 0 übernommen, 30 frei.` })).toBeVisible();
  await expect(page.getByRole('link', { name: `${h.uebernehmen}: ${titel}` })).toHaveAttribute('href', '/mein-bereich/hatim');
  await axe(page);

  await page.goto(`/hatim/${id}`);
  await expect(page.getByRole('heading', { level: 1, name: titel })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: h.cuzTitel })).toBeVisible();
  await expect(page.locator('li[data-stand]')).toHaveCount(30);
  await expect(page.getByRole('link', { name: 'Cüz 30 im Koran-Leser öffnen' })).toHaveAttribute('href', '/quran/cuz/30');
  await axe(page);
});

test('Newsletter: Fehler mit Zusammenfassung, Erfolg ohne Auskunft; Meldung aus dem Anker', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'Formular-Ratenlimit: nur einmal je Lauf');
  test.setTimeout(150_000);
  const antwort = await page.goto('/newsletter');
  if (antwort?.status() === 404) test.skip(true, 'Funktion „newsletter“ ist zur Bauzeit aus');
  await expect(page.getByRole('heading', { level: 1, name: n.titel, exact: true })).toBeVisible();
  const formular = page.locator('#anmelden form');
  await formular.getByLabel(/^E-Mail-Adresse/).fill('kein-at-zeichen');
  await expect(formular.locator('input[name="altcha"]')).not.toHaveValue('', { timeout: ALTCHA_MS });
  await formular.getByRole('button', { name: n.senden }).click();
  const zusammenfassung = page.getByRole('alert').filter({ hasText: fo.zusammenfassung });
  await expect(zusammenfassung).toBeFocused();
  await expect(formular.getByLabel(/^E-Mail-Adresse/)).toHaveAttribute('aria-invalid', 'true');
  await axe(page);

  await formular.getByLabel(/^E-Mail-Adresse/).fill(`testperson.${randomBytes(4).toString('hex')}@example.test`);
  await formular.getByRole('checkbox', { name: new RegExp(n.thema.ramadan) }).check();
  await formular.getByRole('checkbox', { name: /^Ich möchte den Newsletter/ }).check();
  await expect(formular.locator('input[name="altcha"]')).not.toHaveValue('', { timeout: ALTCHA_MS });
  await formular.getByRole('button', { name: n.senden }).click();
  await expect(page.getByRole('heading', { level: 2, name: n.erfolgTitel })).toBeVisible();

  await page.goto('/newsletter#abgemeldet');
  await expect(page.getByRole('status').filter({ hasText: n.meldung.abgemeldet })).toBeVisible();
  // Unbekanntes Token: Weiterleitung auf #ungueltig, kein Fehler
  await page.goto('/api/newsletter/bestaetigen?token=unbekanntes-token-1234567890&sprache=de');
  await expect(page).toHaveURL(/\/newsletter#ungueltig$/);
  await expect(page.getByRole('alert').filter({ hasText: n.meldung.ungueltig })).toBeVisible();
});
