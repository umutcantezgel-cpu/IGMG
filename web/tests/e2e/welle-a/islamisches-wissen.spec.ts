import { expect, test, type Page } from '@playwright/test';
import wissen from '../../../messages/bereiche/wissen.json';

/**
 * E2E Welle A (Kennung A23b), Ablauf 4 und 8: Islamisches Wissen. Übersicht mit Suche, Themen-Filter und „Filter
 * entfernen“, Artikel-Dialog mit Escape und Fokusrückgabe; Themenseite mit h1 als Themenname und aktuellem Thema-Link
 * mit aria-current. Alle drei Sprachen mit den lokalisierten Pfaden aus src/i18n/routing.ts. Texte aus
 * messages/bereiche/wissen.json. Die Themennamen kommen aus dem Seed (drizzle/seeds/bereiche/wissen.ts, Thema „mosque“).
 */

const SPRACHEN = [
  {
    kuerzel: 'de',
    lokal: 'de',
    uebersicht: '/islamisches-wissen',
    themenSeite: '/islamisches-wissen/mosque',
    themaName: 'Moschee',
    texte: wissen.de.wissen,
  },
  {
    kuerzel: 'tr',
    lokal: 'tr',
    uebersicht: '/tr/islami-bilgiler',
    themenSeite: '/tr/islami-bilgiler/mosque',
    themaName: 'Cami',
    texte: wissen.tr.wissen,
  },
  {
    kuerzel: 'en',
    lokal: 'en',
    uebersicht: '/en/islamic-knowledge',
    themenSeite: '/en/islamic-knowledge/mosque',
    themaName: 'Mosque',
    texte: wissen.en.wissen,
  },
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

/** Der Artikel-Reiter der Übersicht: Sein Panel ist das einzige sichtbare Artikelfeld. */
function artikelFeld(seite: Page, w: (typeof SPRACHEN)[number]['texte']) {
  return seite.getByRole('tabpanel', { name: w.reiter.artikel, exact: true });
}

for (const s of SPRACHEN) {
  const w = s.texte;

  test(`${s.kuerzel}: Suche filtert die Artikel; ohne Treffer erscheint der Leerzustand; eine leere Suche zeigt alle`, async ({ page }) => {
    await page.goto(s.uebersicht);
    const suche = page.getByRole('searchbox', { name: w.suche.label, exact: true });
    const artikel = artikelFeld(page, w);
    const karten = artikel.getByRole('article');
    await expect(karten.first()).toBeVisible();

    const titel = (await artikel.getByRole('heading', { level: 4 }).allTextContents()).map(normalisiere);
    const gesamt = titel.length;
    const ersterTitel = titel[0];
    const treffer = titel.filter((t) => t.toLocaleLowerCase(s.lokal).includes(ersterTitel.toLocaleLowerCase(s.lokal))).length;

    await suche.fill(ersterTitel);
    await expect(karten).toHaveCount(treffer);
    await expect(artikel.getByRole('heading', { level: 4, name: ersterTitel, exact: true })).toBeVisible();

    await suche.fill('zz-kein-treffer-zz');
    await expect(karten).toHaveCount(0);
    await expect(artikel.getByText(w.artikel.leer, { exact: true })).toBeVisible();

    await suche.fill('');
    await expect(karten).toHaveCount(gesamt);
    await expect(artikel.getByText(w.artikel.leer, { exact: true })).toHaveCount(0);
  });

  test(`${s.kuerzel}: Themen-Schalter filtert die Artikel; „${w.filter.entfernen}“ hebt den Filter auf`, async ({ page }) => {
    await page.goto(s.uebersicht);
    const themen = page.getByRole('group', { name: w.themen.titel, exact: true });
    const karten = artikelFeld(page, w).getByRole('article');
    const hinweis = page.getByRole('status').filter({ hasText: w.filter.gefiltert });
    const entfernen = page.getByRole('button', { name: w.filter.entfernen, exact: true });
    await expect(karten.first()).toBeVisible();
    const gesamt = await karten.count();
    // Negativ: ohne gewähltes Thema gibt es weder Filterhinweis noch „Filter entfernen“.
    await expect(entfernen).toHaveCount(0);
    await expect(hinweis).toHaveCount(0);

    const namen = (await themen.getByRole('button').allTextContents()).map(normalisiere);
    let gewaehlt: string | undefined;
    for (const name of namen) {
      await themen.getByRole('button', { name, exact: true }).click();
      await expect(themen.getByRole('button', { name, exact: true })).toHaveAttribute('aria-pressed', 'true');
      const anzahl = await karten.count();
      if (anzahl >= 1 && anzahl < gesamt) {
        gewaehlt = name;
        break;
      }
    }
    if (gewaehlt === undefined) {
      test.fixme(
        true,
        'Kein Thema mit Artikeln, die nicht alle Artikel umfassen: Filterwirkung mit den aktuellen Daten nicht prüfbar (offen).',
      );
      return;
    }
    const thema = gewaehlt;

    await expect(themen.getByRole('button', { name: thema, exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(hinweis).toContainText(thema);
    await expect(entfernen).toBeVisible();
    await expect.poll(() => karten.count()).toBeLessThan(gesamt);
    for (const karte of await karten.all()) {
      await expect(karte.getByText(thema, { exact: true })).toBeVisible();
    }

    await entfernen.click();
    await expect(themen.getByRole('button', { name: thema, exact: true })).toHaveAttribute('aria-pressed', 'false');
    await expect(hinweis).toHaveCount(0);
    await expect(karten).toHaveCount(gesamt);
  });

  test(`${s.kuerzel}: Artikel-Dialog öffnet sich, Escape schließt ihn, der Fokus kehrt zum Auslöser zurück`, async ({ page }) => {
    await page.goto(s.uebersicht);
    const karte = artikelFeld(page, w).getByRole('article').first();
    await expect(karte).toBeVisible();
    const titel = normalisiere(await karte.getByRole('heading', { level: 4 }).textContent());
    const ausloeser = karte.getByRole('button', { name: `${w.artikel.weiter}: ${titel}`, exact: true });

    await ausloeser.click();
    const dialog = page.getByRole('dialog', { name: titel, exact: true });
    await expect(dialog).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(ausloeser).toBeFocused();
  });

  test(`${s.kuerzel}: Themenseite: h1 ist der Themenname, der aktuelle Thema-Link trägt aria-current`, async ({ page }) => {
    await page.goto(s.themenSeite);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(s.themaName);

    const themenListe = page.getByRole('list', { name: w.themen.titel, exact: true });
    await expect(themenListe.getByRole('link', { name: s.themaName, exact: true })).toHaveAttribute('aria-current', 'page');
    // Negativ: genau ein Thema ist als aktuell markiert.
    await expect(themenListe.locator('[aria-current="page"]')).toHaveCount(1);
  });
}
