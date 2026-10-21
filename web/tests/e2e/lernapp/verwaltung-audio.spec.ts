import { test as basis, expect } from '@playwright/test';
import texte from '../../../messages/verwaltung/lernapp.json';
import { angemeldetesKonto } from '../hilfen/konto';
import { ernsteBefunde } from './hilfen';

/**
 * Verwaltung › Lern-App › Audio-Studio (L3-06, ADR 0039 Nr. 8, KERN 4.0 §4) mit dem Testkurs aus dem Seed: Mikrofon nur hier
 * (Permissions-Policy), `media-src 'self' blob:` nur unter /verwaltung/lernapp; Sprecherin mit Vereinbarung (PDF) anlegen;
 * Aufnahme mit dem Ersatz-Mikrofon von Chromium (synthetischer Ton, nie eine echte Stimme) für einen deutschen Zieltext, in der
 * Liste als Rohaufnahme, anhören (Wiedergabe als `blob:` ohne CSP-Verstoß) und verwerfen. Die Wahl Sprachausgabe ↔ Mensch
 * prüft der Integrationstest (sie ändert die Pakete des Testkurses). Nur Desktop; Testdaten fiktiv (G-04).
 */
const a = texte.lernapp.audio;
const EINTRAG = 'de.a1.e01.w001';

/** Chromium mit Ersatz-Mikrofon (ohne Rückfrage) und ohne Autoplay-Sperre – wie die Rezitations-Werkstatt. */
const test = basis.extend({
  launchOptions: [
    async ({ launchOptions }, use) => {
      await use({
        ...launchOptions,
        args: [
          ...(launchOptions.args ?? []),
          '--use-fake-device-for-media-stream',
          '--use-fake-ui-for-media-stream',
          '--autoplay-policy=no-user-gesture-required',
        ],
      });
    },
    { scope: 'worker' },
  ],
});

test.use({ permissions: ['microphone'] });
test.describe.configure({ mode: 'serial' });

/** Kleinste gültige PDF-Datei als Platzhalter einer unterschriebenen Vereinbarung (Testdaten). */
const PDF = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF\n');

test.beforeEach(async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'Verwaltungsabläufe nur einmal je Lauf');
  await page.addInitScript(() => {
    window.localStorage.setItem('igmg-konzepthinweis-gesehen', '1');
    // Ergebnis jeder Wiedergabe (play() erfüllt bzw. abgelehnt), damit eine CSP-Sperre von blob: sichtbar wird
    const w = window as unknown as { wiedergabe: string[] };
    w.wiedergabe = [];
    const play = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function (this: HTMLMediaElement) {
      const p = play.call(this);
      p.then(
        () => w.wiedergabe.push(`ok:${this.src.slice(0, 5)}`),
        () => w.wiedergabe.push(`fehler:${this.src.slice(0, 5)}`),
      );
      return p;
    };
  });
});

test('Audio-Studio: Sprecherin mit Vereinbarung, Aufnahme, Anhören, Verwerfen', async ({ page }) => {
  await angemeldetesKonto(page, 'bildung');
  const antwort = await page.goto('/verwaltung/lernapp/audio?kurs=de&filter=alle&seite=0');
  const kopf = antwort!.headers();
  expect(kopf['permissions-policy']).toMatch(/microphone=\(self\)/);
  expect(kopf['content-security-policy']).toContain("media-src 'self' blob:");
  await expect(page.getByRole('heading', { level: 1, name: a.titel })).toBeVisible();
  // Hinweis im Abschnitt „Sprecherinnen und Sprecher“ und statt „Aufnehmen“ an jedem Eintrag
  await expect(page.getByText(a.ohneSprecher).first()).toBeVisible();

  // Ohne Vereinbarung nicht anlegbar; mit PDF und Modul B1
  const formular = page.locator('form').filter({ has: page.getByRole('button', { name: a.anlegen }) });
  await formular.getByLabel(a.name).fill('[Sprecherin A]');
  await formular.getByRole('button', { name: a.anlegen }).click();
  await expect(page.getByText(texte.lernapp.feldFehler.dateiFehlt)).toBeVisible();
  await formular.getByLabel(a.name).fill('[Sprecherin A]');
  await formular.getByLabel(a.vereinbarung).setInputFiles({ name: 'vereinbarung.pdf', mimeType: 'application/pdf', buffer: PDF });
  await formular.getByLabel(a.b1Feld).check();
  await formular.getByRole('button', { name: a.anlegen }).click();
  await expect(page.getByText(`[Sprecherin A]: Vereinbarung ${a.vereinbarungDa}, 0 Aufnahmen (${a.b1})`)).toBeVisible();
  await expect(page.getByText(a.ohneSprecher)).toHaveCount(0);
  expect(await ernsteBefunde(page, 'audio-studio')).toEqual([]);

  // Aufnahme mit dem Ersatz-Mikrofon (Sinuston von Chromium)
  const eintrag = page.getByRole('listitem').filter({ has: page.getByText(EINTRAG, { exact: true }) });
  // Fokusführung: Öffnen → Auswahl der Sprecherin, Start → „Aufnahme beenden“, Ende → „Probehören“; angesagt werden nur
  // Start und Ende (die sekündliche Zeitanzeige ist keine Live-Region)
  await eintrag.getByRole('button', { name: a.aufnehmenFuer.replace('{schluessel}', EINTRAG) }).click();
  await expect(eintrag.getByLabel(a.sprecher)).toBeFocused();
  await expect(eintrag.getByLabel(a.sprecher)).toHaveValue(/[0-9a-f-]{36}/);
  await eintrag.getByRole('button', { name: a.start }).click();
  await expect(eintrag.getByRole('button', { name: a.stopp })).toBeFocused();
  await expect(eintrag.getByRole('status')).toHaveText(a.aufnahmeGestartet);
  await expect(eintrag.getByText(a.laeuftAufnahme.replace('{sekunden}', '2'))).toBeVisible({ timeout: 10_000 });
  await expect(eintrag.getByRole('status')).toHaveText(a.aufnahmeGestartet);
  await eintrag.getByRole('button', { name: a.stopp }).click();
  await expect(eintrag.getByRole('button', { name: a.probehoeren })).toBeFocused();
  await expect(eintrag.getByRole('status')).toHaveText(
    new RegExp(`^${a.aufnahmeBeendet.replace('{sekunden}', '\\d+').replace(/[().]/g, '\\$&')}$`),
  );
  await eintrag.getByRole('button', { name: a.hochladen }).click();
  await expect(eintrag.getByText(a.ergebnis.neu)).toBeVisible({ timeout: 15_000 });
  await expect(eintrag.getByRole('heading', { name: a.aufnahmen })).toBeVisible();
  await expect(eintrag.getByText(new RegExp(`^\\[Sprecherin A\\], [\\d,]+ s, ${a.aufnahmeStatus.neu}$`))).toBeVisible();

  // Rohaufnahme anhören: geladen über die geschützte Route, abgespielt als blob: (CSP erlaubt es nur hier)
  await eintrag.getByRole('button', { name: a.aufnahmeAnhoeren }).click();
  await expect.poll(() => page.evaluate(() => (window as unknown as { wiedergabe: string[] }).wiedergabe)).toContain('ok:blob:');
  await expect(eintrag.getByText(a.clipFehlt)).toHaveCount(0);

  // Verwerfen: Datei gelöscht, Zeile „verworfen“ ohne Anhören
  await eintrag.getByRole('button', { name: a.aufnahmeVerwerfen }).click();
  await expect(eintrag.getByText(new RegExp(`, ${a.aufnahmeStatus.verworfen}$`))).toBeVisible();
  await expect(eintrag.getByRole('button', { name: a.aufnahmeAnhoeren })).toHaveCount(0);
});
