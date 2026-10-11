import { expect, test } from '@playwright/test';
import formulare from '../../messages/bereiche/formulare.json';

/**
 * Formulare ohne JavaScript: Hinweis sichtbar; natives Absenden (auch „Weiter“ im FormWizard) führt zurück zur
 * Formularseite mit Anker statt zu einer Fehlerseite – gespeichert wird nichts (`zurueckOhneSkript`, E-028).
 */
test.use({ javaScriptEnabled: false });

const SEITEN = [
  { name: 'Kontakt (tr)', pfad: '/tr/iletisim', sprache: 'tr', knopf: formulare.tr.formulare.senden },
  { name: 'Mitglied werden (FormWizard)', pfad: '/mitglied-werden', sprache: 'de', knopf: formulare.de.formulare.wizard.weiter },
] as const;

for (const s of SEITEN) {
  test(`${s.name}: Hinweis ohne JavaScript, Absenden führt zurück statt zu einem Fehler`, async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'einmal je Lauf genügt');
    const antworten: number[] = [];
    page.on('response', (r) => r.request().isNavigationRequest() && antworten.push(r.status()));
    // Playwright schaltet nur die Ausführung ab; ob Chromium <noscript> dann als Elemente oder als Rohtext liest, ist
    // nicht verlässlich – innerHTML liefert in beiden Fällen das ausgelieferte Markup (Absatz mit id="ohne-skript").
    const hinweis = async () => (await Promise.all((await page.locator('noscript').all()).map((n) => n.innerHTML()))).join(' ');
    await page.goto(s.pfad);
    expect(await hinweis()).toContain('id="ohne-skript"');
    expect(await hinweis()).toContain(formulare[s.sprache].formulare.ohneSkript);
    await page.getByRole('button', { name: s.knopf, exact: true }).click();
    await page.waitForURL((u) => u.pathname === s.pfad && u.hash === '#ohne-skript');
    expect(await hinweis()).toContain(formulare[s.sprache].formulare.ohneSkript);
    expect(antworten.filter((c) => c >= 500)).toEqual([]);
  });
}
