import { expect, test } from '@playwright/test';
import gebetszeiten from '../../../messages/bereiche/gebetszeiten.json';

/**
 * E2E Welle A (Kennung A23b), Ablauf 3: Gebetszeiten. Die Reiter Heute, Monatlich, Qibla und Einstellungen wechseln mit
 * Tastatur und Klick. Der Qibla-Kompass hört erst nach „Kompass aktivieren“ auf Lagesensoren und zeigt danach einen
 * Hinweis. Der Link „Vollbild“ führt zur Anzeige. Texte aus messages/bereiche/gebetszeiten.json (de).
 */

const t = gebetszeiten.de.gebetszeiten;
const q = gebetszeiten.de.gebetszeitenQibla;
const REITER = [t.tabHeute, t.tabMonat, t.tabQibla, t.tabEinstellungen] as const;

/** Der Erstbesuch-Hinweis (Konzeptseite) ist vorab als gesehen markiert, damit er Tastatur und Klicks nicht verdeckt. */
test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    try {
      window.localStorage.setItem('igmg-konzepthinweis-gesehen', '1');
    } catch {
      // Kein Speicher verfügbar: der Hinweis bleibt sichtbar.
    }
  });
});

test('Reiter Heute, Monatlich, Qibla und Einstellungen: Pfeiltasten, Pos1 und Ende; aria-selected und Panel stimmen', async ({ page }) => {
  await page.goto('/gebetszeiten');
  const liste = page.getByRole('tablist', { name: t.ansichtAria, exact: true });
  const reiter = (name: string) => liste.getByRole('tab', { name, exact: true });

  async function pruefeAuswahl(name: string) {
    await expect(reiter(name)).toHaveAttribute('aria-selected', 'true');
    await expect(reiter(name)).toBeFocused();
    await expect(page.getByRole('tabpanel', { name, exact: true })).toBeVisible();
    await expect(page.getByRole('tabpanel')).toHaveCount(1);
    for (const anderer of REITER.filter((r) => r !== name)) {
      await expect(reiter(anderer)).toHaveAttribute('aria-selected', 'false');
    }
  }

  await reiter(REITER[0]).focus();
  await pruefeAuswahl(REITER[0]);
  await page.keyboard.press('ArrowRight');
  await pruefeAuswahl(REITER[1]);
  await page.keyboard.press('ArrowRight');
  await pruefeAuswahl(REITER[2]);
  await page.keyboard.press('End');
  await pruefeAuswahl(REITER[3]);
  await page.keyboard.press('ArrowRight');
  await pruefeAuswahl(REITER[0]);
  await page.keyboard.press('ArrowLeft');
  await pruefeAuswahl(REITER[3]);
  await page.keyboard.press('Home');
  await pruefeAuswahl(REITER[0]);

  await reiter(t.tabQibla).click();
  await pruefeAuswahl(t.tabQibla);
});

test('Qibla: ohne Klick auf „Kompass aktivieren“ kein Lagesensor; nach dem Klick zeigt der Kompass einen Hinweis', async ({
  page,
  context,
}) => {
  // Spion: protokolliert jede Registrierung eines Lagesensor-Ereignisses über window.addEventListener.
  await context.addInitScript(() => {
    const anfragen: string[] = [];
    Object.defineProperty(window, '__sensorAnfragen', { value: anfragen });
    const urspruenglich = window.addEventListener as unknown as (this: Window, ...args: unknown[]) => void;
    window.addEventListener = function (this: Window, typ: unknown, ...rest: unknown[]) {
      if (typ === 'deviceorientation' || typ === 'deviceorientationabsolute') anfragen.push(String(typ));
      return urspruenglich.call(this, typ, ...rest);
    } as unknown as typeof window.addEventListener;
  });

  await page.goto('/gebetszeiten');
  const sensoren = () => page.evaluate(() => (window as unknown as { __sensorAnfragen: string[] }).__sensorAnfragen.slice());
  expect(await sensoren()).toEqual([]);

  await page.getByRole('tab', { name: t.tabQibla, exact: true }).click();
  const feld = page.getByRole('tabpanel', { name: t.tabQibla, exact: true });
  const aktivieren = feld.getByRole('button', { name: q.kompass_aktivieren, exact: true });
  await expect(aktivieren).toBeVisible();
  await expect(feld.getByText(q.kompass_hinweis, { exact: true })).toBeVisible();
  // Vor dem Klick hat kein Code einen Lagesensor angefordert.
  expect(await sensoren()).toEqual([]);

  await aktivieren.click();
  // Nach dem Klick zeigt der Kompass einen Hinweis. Welcher Zweig greift, hängt vom Gerät ab: Ohne Erlaubnis
  // (verweigert), ohne Sensor (fehlt) oder mit Wartezeit (startet, danach fehlt).
  const status = feld.getByRole('status');
  await expect(status).toHaveText(alternativen([q.kompass_startet, q.kompass_verweigert, q.kompass_fehlt, q.kompass_aktiv]));
  // Der Hinweis bleibt in einem Endzustand stehen; er hängt nicht bei „wird gestartet“.
  await expect(status).toHaveText(alternativen([q.kompass_verweigert, q.kompass_fehlt, q.kompass_aktiv]), { timeout: 10_000 });

  // Kontrolle des Spions: Eine Registrierung auf dieser Seite wird erkannt, daher ist „keine Anfrage vor dem Klick“ aussagekräftig.
  await page.evaluate(() => window.addEventListener('deviceorientation', () => {}));
  expect(await sensoren()).toContain('deviceorientation');
});

/** Ein Muster, das genau einen der Texte als vollständigen Inhalt erlaubt. */
function alternativen(texte: readonly string[]): RegExp {
  return new RegExp(`^(${texte.map(escapeRegExp).join('|')})$`);
}

test('Link „Vollbild“ führt zur Anzeige', async ({ page }) => {
  await page.goto('/gebetszeiten');
  const vollbild = page.getByRole('link', { name: t.vollbildAria, exact: true });
  await expect(vollbild).toHaveAttribute('href', '/gebetszeiten/anzeige');
  await vollbild.click();
  await expect(page).toHaveURL(/\/gebetszeiten\/anzeige$/);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
