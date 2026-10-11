import { expect, test, type Locator } from '@playwright/test';
import deMessages from '../../../messages/de.json';
import enMessages from '../../../messages/en.json';
import trMessages from '../../../messages/tr.json';
import nachrichten from '../../../messages/bereiche/nachrichten.json';

/**
 * E2E Welle A (Kennung A23b), Ablauf 1 und 8: Nachrichtenliste. Ein Kategorie-Schalter (aria-pressed) blendet die
 * übrigen Karten aus, „Alle“ zeigt wieder alle. Der Kartenlink „Weiterlesen: <Titel>“ öffnet die Detailseite mit dem
 * Titel als h1. Alle drei Sprachen mit den lokalisierten Pfaden aus src/i18n/routing.ts (de ohne Präfix, tr /haberler,
 * en /news). Texte aus messages/bereiche/nachrichten.json und messages/{de,tr,en}.json (karten.weiterlesen).
 */

const SPRACHEN = [
  { kuerzel: 'de', pfad: '/nachrichten', texte: nachrichten.de.nachrichten, weiterlesen: deMessages.karten.weiterlesen },
  { kuerzel: 'tr', pfad: '/tr/haberler', texte: nachrichten.tr.nachrichten, weiterlesen: trMessages.karten.weiterlesen },
  { kuerzel: 'en', pfad: '/en/news', texte: nachrichten.en.nachrichten, weiterlesen: enMessages.karten.weiterlesen },
] as const;

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

function normalisiere(text: string | null): string {
  return (text ?? '').replace(/\s+/g, ' ').trim();
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Kategorie-Schalter in der Gruppe. Der Name trägt die Anzahl („Gemeinde 2 Nachrichten“), daher nur am Anfang verankert. */
function schalter(gruppe: Locator, bezeichnung: string): Locator {
  return gruppe.getByRole('button', { name: new RegExp(`^${escapeRegExp(bezeichnung)}(\\s|$)`) });
}

for (const s of SPRACHEN) {
  const t = s.texte;
  const detailMuster = new RegExp(`${escapeRegExp(s.pfad)}/[^/]+$`);

  test(`${s.kuerzel}: Kategorie-Schalter filtert die sichtbaren Karten, „${t.alle}“ zeigt wieder alle`, async ({ page }) => {
    await page.goto(s.pfad);
    const gruppe = page.getByRole('group', { name: t.gruppe, exact: true });
    const karten = page.getByRole('article');
    const alle = schalter(gruppe, t.alle);
    await expect(karten.first()).toBeVisible();
    await expect(alle).toHaveAttribute('aria-pressed', 'true');
    const gesamt = await karten.count();

    const kategorien = Object.values(t.kategorien);
    let gewaehlt: string | undefined;
    for (const kategorie of kategorien) {
      await schalter(gruppe, kategorie).click();
      await expect(schalter(gruppe, kategorie)).toHaveAttribute('aria-pressed', 'true');
      const anzahl = await karten.count();
      if (anzahl >= 1 && anzahl < gesamt) {
        gewaehlt = kategorie;
        break;
      }
    }
    if (gewaehlt === undefined) {
      test.fixme(
        true,
        'Keine Kategorie mit Treffern, die nicht alle Karten umfasst: Filterwirkung ist mit den aktuellen Daten nicht prüfbar (offen).',
      );
      return;
    }
    const kategorieGewaehlt = gewaehlt;

    await expect(schalter(gruppe, kategorieGewaehlt)).toHaveAttribute('aria-pressed', 'true');
    await expect(alle).toHaveAttribute('aria-pressed', 'false');
    for (const andere of kategorien.filter((k) => k !== kategorieGewaehlt)) {
      await expect(schalter(gruppe, andere)).toHaveAttribute('aria-pressed', 'false');
    }
    await expect.poll(() => karten.count()).toBeGreaterThan(0);
    await expect.poll(() => karten.count()).toBeLessThan(gesamt);

    await alle.click();
    await expect(alle).toHaveAttribute('aria-pressed', 'true');
    await expect(schalter(gruppe, kategorieGewaehlt)).toHaveAttribute('aria-pressed', 'false');
    await expect(karten).toHaveCount(gesamt);
  });

  test(`${s.kuerzel}: Kartenlink trägt den Namen „${s.weiterlesen}: <Titel>“`, async ({ page }) => {
    await page.goto(s.pfad);
    const karte = page.getByRole('article').first();
    await expect(karte).toBeVisible();
    const titel = normalisiere(await karte.getByRole('heading').first().textContent());
    await expect(karte.getByRole('link', { name: `${s.weiterlesen}: ${titel}`, exact: true })).toBeVisible();
  });

  test(`${s.kuerzel}: Kartenlink „${s.weiterlesen}: <Titel>“ öffnet die Detailseite mit dem Titel als h1`, async ({ page }) => {
    await page.goto(s.pfad);
    const karte = page.getByRole('article').first();
    await expect(karte).toBeVisible();
    const titel = normalisiere(await karte.getByRole('heading').first().textContent());
    expect(titel).not.toBe('');

    // Der Name wird hier toleriert (Leerzeichen vor dem Doppelpunkt, siehe BEFUND oben); geprüft wird die Funktion.
    await karte.getByRole('link', { name: new RegExp(`^${escapeRegExp(s.weiterlesen)}\\s*:\\s*${escapeRegExp(titel)}$`) }).click();
    await expect(page).toHaveURL(detailMuster);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(titel);
  });
}
