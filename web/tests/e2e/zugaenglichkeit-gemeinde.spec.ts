import { randomBytes } from 'node:crypto';
import AxeBuilder from '@axe-core/playwright';
import { expect as basisExpect, test, type Page } from '@playwright/test';
import chatTexte from '../../messages/bereiche/chat-fenster.json';
import unterrichtTexte from '../../messages/bereiche/unterricht.json';
import freigabenTexte from '../../messages/verwaltung/freigaben.json';
import kinderschutzTexte from '../../messages/verwaltung/kinderschutz.json';
import lernenTexte from '../../messages/verwaltung/lernen.json';
import { beispielkonten, kindAnmelden, leitungAnmelden, type Zugaenge } from './hilfen/gemeinde';
import { angemeldetesKonto, eigeneAbsenderAdresse } from './hilfen/konto';
import { schutzrolleWirksam } from './hilfen/schutzrolle';

/** Gegen den Entwicklungsserver kompiliert jede Seite beim ersten Aufruf noch – großzügiger warten. */
const expect = basisExpect.configure({ timeout: 15_000 });

/**
 * Z-07 am Server (Nacharbeit 2, P4): axe (WCAG 2.2 AA) auf den Seiten der Gemeinde-Plattform mit Anmeldung – Anwesenheit,
 * Gruppenchat der Leitung und des Kindes, Verwaltung › Kinderschutz, Gruppen und Freigaben – und der Fokus nach Senden
 * und Speichern per Tastatur (WCAG 2.4.3). Ziel: 0 Befunde „serious“ oder „critical“; leichtere Befunde stehen als
 * Anmerkung im Bericht. Beide Breiten (390 und 1440 px), je Projekt eigene Beispielkonten.
 *
 * Voraussetzung: Funktionen `konten`, `lernplattform` und `chat` an (FUNKTION_…=an). Kinder schreiben nur im Chatfenster
 * der Gruppe (08–20 Uhr, S-05): Außerhalb prüft der Test den gesperrten Zustand (Fokus auf dem Grund) und überspringt
 * das Senden mit Begründung. Zugänge wie in mein-bereich-lernen.spec.ts (`scripts/beispielkonten.ts`).
 */
const u = unterrichtTexte.de.unterricht;
const c = chatTexte.de.chatFenster;
const g = lernenTexte.gruppen;

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const ERNST = new Set(['serious', 'critical']);

let vorhanden: Zugaenge | null = null;
/** Erst im Test anlegen (übersprungene Tests legen nichts an); je Worker einmal. */
const zugaenge = () => (vorhanden ??= beispielkonten());

/**
 * axe auf der ganzen Seite: Befunde „serious“/„critical“ lassen den Test scheitern, alle Befunde stehen als Anmerkung
 * (Typ „axe“) im Bericht – auch „0 Befunde“, damit der Nachweis je Route im JSON-Bericht steht.
 */
async function pruefeAxe(page: Page, ort: string) {
  const ergebnis = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  const zeile = (v: (typeof ergebnis.violations)[number]) =>
    `${v.id} (${v.impact ?? 'unbekannt'}, ${v.nodes.length} Knoten): ${v.nodes
      .slice(0, 3)
      .map((n) => n.target.flat().join(' '))
      .join(' ; ')}`;
  const ernst = ergebnis.violations.filter((v) => ERNST.has(v.impact ?? ''));
  const leicht = ergebnis.violations.filter((v) => !ERNST.has(v.impact ?? ''));
  test.info().annotations.push({
    type: 'axe',
    description: `${ort} (${page.viewportSize()?.width} px): ernst/kritisch ${ernst.length}, mittel/gering ${leicht.length}${
      leicht.length ? ` – ${leicht.map(zeile).join(' | ')}` : ''
    }`,
  });
  expect(ernst.map(zeile), `axe ernst/kritisch auf ${ort}`).toEqual([]);
}

/** Wartet, bis der Chat geladen und der Schreibzustand bekannt ist (kein „wird geladen“ mehr). */
async function chatGeladen(page: Page) {
  await expect(page.getByRole('log')).toBeVisible();
  await expect(page.getByRole('log').getByText(c.laedt)).toHaveCount(0);
}

test.beforeEach(async ({ page, request }) => {
  test.skip((await request.get('/anmelden')).status() === 404, 'Funktion „konten“ ist aus – Server mit FUNKTION_KONTEN=an starten');
  const kinder = await request.get('/mein-bereich/kinder', { maxRedirects: 0 });
  test.skip(kinder.status() === 404, 'Funktion „lernplattform“ ist aus – Server mit FUNKTION_LERNPLATTFORM=an starten');
  await page.addInitScript(() => window.localStorage.setItem('igmg-konzepthinweis-gesehen', '1'));
  await eigeneAbsenderAdresse(page);
});

test('Lehrkraft: Anwesenheit und Gruppenchat – axe ohne ernste Befunde, Fokus bleibt nach Speichern und Senden', async ({ page }) => {
  test.setTimeout(180_000);
  const { lehrkraft, lernplattform: lp } = zugaenge();
  await leitungAnmelden(page, lehrkraft);

  // Anwesenheit „Heute“ (B-23)
  await page.goto('/mein-bereich/unterricht');
  await expect(page.getByRole('heading', { level: 2, name: u.heute.titel })).toBeVisible();
  await page.getByRole('link', { name: `${u.heute.anwesenheit}: ${lp.gruppe}, 16:00–17:30` }).click();
  await expect(page.getByRole('heading', { level: 2, name: u.anwesenheit.erfassen.titel })).toBeVisible();
  await pruefeAxe(page, 'Anwesenheit erfassen');
  const speichern = page.getByRole('button', { name: u.anwesenheit.erfassen.speichern });
  await speichern.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('status').filter({ hasText: u.anwesenheit.erfassen.gespeichert })).toBeVisible();
  await expect(speichern).toBeFocused();
  await pruefeAxe(page, 'Anwesenheit nach dem Speichern');

  // Gruppenchat als Leitung (schreibt auch außerhalb der Chatzeiten): Senden per Tastatur, Fokus danach im leeren Feld
  await page.goto(`/mein-bereich/gruppen/${lp.gruppeId}/chat`);
  await chatGeladen(page);
  await pruefeAxe(page, 'Gruppenchat (Leitung)');
  const feld = page.getByRole('textbox', { name: c.eingabe });
  await expect(feld).toBeEnabled();
  const probe = `Tastaturprobe ${randomBytes(3).toString('hex')}`;
  await feld.fill(probe);
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: c.senden, exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('log').getByText(probe)).toBeVisible();
  await expect(feld).toBeFocused();
  await expect(feld).toHaveValue('');
  await pruefeAxe(page, 'Gruppenchat (Leitung) nach dem Senden');
});

test('Kind: Gruppenchat – Regeln bestätigen und Senden per Tastatur, Fokus im Feld; axe ohne ernste Befunde', async ({ page }) => {
  test.setTimeout(150_000);
  const { kind, lernplattform: lp } = zugaenge();
  await kindAnmelden(page, kind);

  await page.goto(`/mein-bereich/gruppen/${lp.gruppeId}/chat`);
  await chatGeladen(page);
  // Regeln per Tastatur bestätigen, falls noch offen (die Beispielkonten haben sie schon bestätigt; einen frischen
  // Kinderzugang prüft lernkette.spec.ts): danach steht der Fokus im Feld bzw. – wenn der Chat zu ist – auf dem Grund
  const regeln = page.getByRole('button', { name: c.regelnBestaetigen });
  const mitRegeln = (await regeln.count()) > 0;
  if (mitRegeln) {
    await pruefeAxe(page, 'Gruppenchat (Kind, Regeln)');
    await regeln.focus();
    await page.keyboard.press('Enter');
    await expect(regeln).toHaveCount(0);
  }
  const feld = page.getByRole('textbox', { name: c.eingabe });
  const geschlossen = page.getByText(c.grund.geschlossen);
  await expect(feld.or(geschlossen).first()).toBeVisible();
  if (await geschlossen.isVisible()) {
    if (mitRegeln) await expect(page.locator(':focus')).toContainText(c.grund.geschlossen);
    await pruefeAxe(page, 'Gruppenchat (Kind, geschlossen)');
    test.skip(true, 'Chatfenster der Gruppe geschlossen (Kinder schreiben 08–20 Uhr Serverzeit, S-05) – Senden nicht prüfbar');
  }
  await expect(feld).toBeEnabled();
  if (mitRegeln) await expect(feld).toBeFocused();
  await pruefeAxe(page, 'Gruppenchat (Kind, offen)');
  const probe = `Kindprobe ${randomBytes(3).toString('hex')}`;
  await feld.fill(probe);
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: c.senden, exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('log').getByText(probe)).toBeVisible();
  await expect(feld).toBeFocused();
  await expect(feld).toHaveValue('');
  // Zweiter Weg: Enter im Feld sendet ebenfalls, der Fokus bleibt im Feld
  const probe2 = `Kindprobe ${randomBytes(3).toString('hex')}`;
  await feld.fill(probe2);
  await page.keyboard.press('Enter');
  await expect(page.getByRole('log').getByText(probe2)).toBeVisible();
  await expect(feld).toBeFocused();
  await pruefeAxe(page, 'Gruppenchat (Kind) nach dem Senden');
});

test('Verwaltung › Meldungen & Kinderschutz: axe ohne ernste Befunde', async ({ page }) => {
  test.setTimeout(150_000);
  zugaenge(); // Beispielgruppe mit offener Meldung, damit die Liste nicht leer ist
  await angemeldetesKonto(page, 'kinderschutz', undefined, (email) => schutzrolleWirksam(email, 'kinderschutz'));
  await page.goto('/verwaltung/kinderschutz');
  await expect(page.getByRole('heading', { level: 1, name: kinderschutzTexte.kinderschutz.titel })).toBeVisible();
  await pruefeAxe(page, 'Verwaltung › Kinderschutz');
  await page.goto('/verwaltung/kinderschutz?ansicht=alle');
  await expect(page.getByRole('heading', { level: 1, name: kinderschutzTexte.kinderschutz.titel })).toBeVisible();
  await pruefeAxe(page, 'Verwaltung › Kinderschutz (alle)');
});

test('Verwaltung › Gruppen und Freigaben: axe ohne ernste Befunde, Fokus nach Speichern auf der Meldung', async ({ page }) => {
  test.setTimeout(150_000);
  const { lernplattform: lp } = zugaenge();
  await angemeldetesKonto(page, 'administration');
  await page.goto('/verwaltung/gruppen');
  await expect(page.getByRole('heading', { level: 1, name: g.titel })).toBeVisible();
  await pruefeAxe(page, 'Verwaltung › Gruppen');

  await page.goto(`/verwaltung/gruppen/${lp.gruppeId}`);
  await expect(page.getByRole('heading', { level: 1, name: lp.gruppe })).toBeVisible();
  await pruefeAxe(page, 'Verwaltung › Gruppe');
  // Speichern per Tastatur: Der Fokus geht auf die Meldung „gespeichert“ (role=status), nicht auf <body>
  const formular = page.locator('form').filter({ has: page.getByLabel(`${g.formular.nameDe} (Pflichtfeld)`) });
  const speichern = formular.getByRole('button', { name: g.speichern, exact: true });
  await speichern.focus();
  await page.keyboard.press('Enter');
  await expect(formular.getByText(g.gespeichert)).toBeVisible();
  await expect(page.locator(':focus')).toContainText(g.gespeichert);
  await pruefeAxe(page, 'Verwaltung › Gruppe nach dem Speichern');

  await page.goto('/verwaltung/freigaben');
  await expect(page.getByRole('heading', { level: 1, name: freigabenTexte.freigaben.titel })).toBeVisible();
  await pruefeAxe(page, 'Verwaltung › Freigaben');
});
