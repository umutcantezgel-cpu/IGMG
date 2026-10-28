import { expect, test, type Page } from '@playwright/test';
import dachverband from '../../messages/bereiche/dachverband.json';
import gebetszeiten from '../../messages/bereiche/gebetszeiten.json';
import kalender from '../../messages/bereiche/kalender.json';
import mitglied from '../../messages/bereiche/mitglied.json';
import quellen from '../../messages/bereiche/quellen.json';
import ramadan from '../../messages/bereiche/ramadan.json';
import spenden from '../../messages/bereiche/spenden.json';
import wissen from '../../messages/bereiche/wissen.json';
import de from '../../messages/de.json';

/**
 * E2E Querverlinkung (Plan Marktstart P7): Block „IGMG-Netzwerk“ im Fuß (Links mit rel, hrefLang, Sprachkürzel beim
 * Rückfall), Schnellzugriff „Spenden“ auf /spenden, Kasten „Weltweit helfen mit Hasene“, „Fördermitglied der IGMG“,
 * Ramadan-Begleiter, Hinweis zur Bekanntgabe auf /kalender, „Mehr beim Dachverband“ und Videos nur als Link auf
 * /islamisches-wissen, Abschnitt /quellen#dachverband, FAQPage auf /igmg und /gebetszeiten. Beim Laden keine Anfrage an
 * Dritte (K-14). Daten aus den Seeds, Texte aus messages; der Konzept-Hinweis gilt als gesehen.
 */
const D = dachverband.de.dachverband;

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    try {
      window.localStorage.setItem('igmg-konzepthinweis-gesehen', '1');
    } catch {
      // Kein Speicher verfügbar: der Hinweis bleibt sichtbar.
    }
  });
});

/** Alle Anfragen beim Laden mitschreiben; danach dürfen nur Adressen der eigenen Website darunter sein (K-14). */
function protokolliere(page: Page): string[] {
  const anfragen: string[] = [];
  page.on('request', (a) => anfragen.push(a.url()));
  return anfragen;
}
async function nurEigene(page: Page, anfragen: string[]) {
  await page.waitForLoadState('networkidle');
  const eigen = new URL(page.url()).host;
  expect(anfragen.filter((u) => /^https?:/.test(u) && new URL(u).host !== eigen)).toEqual([]);
}
/** Strukturierte Daten der Seite (alle JSON-LD-Blöcke, `@graph` aufgelöst). */
async function jsonLd(page: Page): Promise<Record<string, unknown>[]> {
  const texte = await page.locator('script[type="application/ld+json"]').allTextContents();
  return texte.flatMap((t) => {
    const d = JSON.parse(t) as Record<string, unknown>;
    return Array.isArray(d['@graph']) ? (d['@graph'] as Record<string, unknown>[]) : [d];
  });
}

test('Fuß: „IGMG-Netzwerk“ mit externen Links (rel, hrefLang), Kinderclub mit Kürzel TR, „Mehr über die IGMG“ und Spenden', async ({
  page,
}) => {
  const anfragen = protokolliere(page);
  await page.goto('/');
  const netz = page.getByRole('navigation', { name: D.netzwerk.titel, exact: true });
  await netz.scrollIntoViewIfNeeded();
  await expect(netz).toBeVisible();
  await expect(netz.getByRole('heading', { level: 2, name: D.netzwerk.titel })).toBeVisible();
  const extern = netz.locator('a[href^="https://"]');
  await expect(extern).toHaveCount(5);
  for (const link of await extern.all()) {
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(link).toHaveAttribute('hreflang', /^(de|tr|en)$/);
  }
  const kinder = netz.getByRole('link', { name: `${D.netzwerk.links.kinderclub} TR ${D.aufTuerkisch}: ${D.externeSeite}` });
  await expect(kinder).toHaveAttribute('href', 'https://www.igmgcocuk.org');
  await expect(kinder).toHaveAttribute('hreflang', 'tr');
  await expect(netz.getByRole('link', { name: `${D.netzwerk.links.gebetskalender}: ${D.externeSeite}` })).toHaveAttribute(
    'href',
    'https://www.igmg.org/gebetskalender?stadt=Wetzlar&id=20238',
  );
  await expect(netz.getByRole('link', { name: D.netzwerk.mehr, exact: true })).toHaveAttribute('href', '/igmg');
  await expect(netz.locator('img, iframe')).toHaveCount(0);
  // Schnellzugriff „Spenden“ führt jetzt auf /spenden (vorher /projekte)
  const schnell = page.getByRole('navigation', { name: de.fuss.schnellzugriff, exact: true });
  await expect(schnell.getByRole('link', { name: de.fuss.qSpenden, exact: true })).toHaveAttribute('href', '/spenden');
  await nurEigene(page, anfragen);
});

test('Fuß auf Englisch: Hasene mit Kürzel DE und hreflang de (Rückfall)', async ({ page }) => {
  await page.goto('/en');
  const E = dachverband.en.dachverband;
  const netz = page.getByRole('navigation', { name: E.netzwerk.titel, exact: true });
  const hasene = netz.getByRole('link', { name: `${E.netzwerk.links.hasene} DE ${E.aufDeutsch}: ${E.externeSeite}` });
  await expect(hasene).toHaveAttribute('hreflang', 'de');
  await expect(hasene).toHaveAttribute('href', 'https://www.hasene.org/de/');
  await expect(netz.getByRole('link', { name: E.netzwerk.mehr, exact: true })).toHaveAttribute('href', '/en/igmg');
});

test('/spenden: Kasten „Weltweit helfen mit Hasene“ mit deutlichem Empfänger, Links zu Hasene, ohne GiroCode', async ({ page }) => {
  const anfragen = protokolliere(page);
  await page.goto('/spenden');
  const H = spenden.de.spenden.hasene;
  const kasten = page.getByRole('region', { name: H.titel, exact: true });
  await expect(kasten).toBeVisible();
  await expect(kasten.getByText(H.empfaenger, { exact: true })).toBeVisible();
  const hasene = kasten.getByRole('link', { name: `${D.ziele.hasene.titel}: ${D.externeSeite}` });
  await expect(hasene).toHaveAttribute('href', 'https://www.hasene.org/de/');
  await expect(hasene).toHaveAttribute('rel', 'noopener noreferrer');
  await expect(kasten.getByRole('link', { name: `${D.ziele.zakatRechner.titel}: ${D.externeSeite}` })).toHaveAttribute(
    'href',
    'https://www.hasene.org/de/zakat-rechner/',
  );
  await expect(kasten.getByRole('img')).toHaveCount(0);
  await nurEigene(page, anfragen);
});

test('/mitglied-werden: Kasten „Fördermitglied der IGMG“ getrennt von der Anmeldung, nur Links', async ({ page }) => {
  await page.goto('/mitglied-werden');
  const F = mitglied.de.mitglied.foerder;
  const kasten = page.getByRole('region', { name: F.titel, exact: true });
  await expect(kasten).toBeVisible();
  await expect(kasten.getByText(F.punkte.beitrag, { exact: true })).toBeVisible();
  await expect(kasten.getByRole('link', { name: `${D.ziele.mitgliedschaft.titel}: ${D.externeSeite}` })).toHaveAttribute(
    'href',
    'https://www.igmg.org/mitgliedschaft/',
  );
  await expect(kasten.locator('iframe, form')).toHaveCount(0);
});

test('/ramadan: Ramadan-Begleiter der IGMG und neuer Fitre-Platzhalter', async ({ page }) => {
  await page.goto('/ramadan');
  const R = ramadan.de.ramadan;
  const kasten = page.getByRole('region', { name: R.begleiter.titel, exact: true });
  await expect(kasten).toBeVisible();
  await expect(kasten.getByRole('link', { name: `${R.begleiter.link}: ${D.externeSeite}` })).toHaveAttribute(
    'href',
    'https://www.igmg.org/ramazan-yoldasim/',
  );
  await expect(page.getByText(R.gemeinde.fitre, { exact: true })).toBeVisible();
});

test('/kalender: verbindliche Bekanntgabe durch die IGMG mit Links zu Gelehrtenrat und Festen', async ({ page }) => {
  await page.goto('/kalender');
  await expect(page.getByText(kalender.de.kalender.igmg, { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: `${D.ziele.gelehrtenratHilal.titel}: ${D.externeSeite}` })).toHaveAttribute(
    'rel',
    'noopener noreferrer',
  );
  await expect(page.getByRole('link', { name: `${D.ziele.feste.titel}: ${D.externeSeite}` })).toBeVisible();
});

test('/islamisches-wissen: „Mehr beim Dachverband“ unter der Insel; Hadsch-Video nur als Link zu YouTube, ohne iframe', async ({
  page,
}) => {
  const anfragen = protokolliere(page);
  await page.goto('/islamisches-wissen');
  const W = wissen.de.wissen;
  const mehr = page.getByRole('region', { name: W.dachverband.titel, exact: true });
  await expect(mehr).toBeVisible();
  await expect(mehr.getByRole('link', { name: `${D.ziele.freitagspredigt.titel}: ${D.externeSeite}` })).toHaveAttribute(
    'href',
    'https://www.igmg.org/freitagspredigt/',
  );
  await expect(mehr.getByRole('link')).toHaveCount(6);
  // Reiter „Videos“ → Hadsch-Video öffnen → Link „Auf YouTube ansehen“, keine Einbettung
  await page.getByRole('tab', { name: W.reiter.videos }).click();
  await page.getByRole('button', { name: `${W.videos.ansehen}: Wie wird der Hadsch verrichtet?` }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('link', { name: `${W.videos.youtube}: Wie wird der Hadsch verrichtet?` })).toHaveAttribute(
    'href',
    'https://www.youtube.com/watch?v=ytTuELK2slU',
  );
  await expect(page.locator('iframe')).toHaveCount(0);
  await nurEigene(page, anfragen);
});

test('/quellen#dachverband: Abschnitt mit Anker und Einträgen ohne Lizenzobjekt', async ({ page }) => {
  await page.goto('/quellen#dachverband');
  const Q = quellen.de.quellen;
  const abschnitt = page.locator('section#dachverband');
  await expect(abschnitt).toBeVisible();
  await expect(abschnitt.getByRole('heading', { level: 2, name: Q.abschnitte.dachverband })).toBeVisible();
  await expect(abschnitt.locator('article')).toHaveCount(9);
  await expect(abschnitt.getByText(Q.dachverband.lizenz, { exact: true }).first()).toBeVisible();
  await expect(abschnitt.locator('article#igmg-hutba-feed')).toContainText(Q.eintraege['igmg-hutba-feed'].verwendung);
});

test('FAQPage auf /igmg und /gebetszeiten (strukturierte Daten aus den sichtbaren Fragen)', async ({ page }) => {
  await page.goto('/igmg');
  const igmg = (await jsonLd(page)).find((d) => d['@type'] === 'FAQPage');
  expect(igmg).toBeDefined();
  expect((igmg!.mainEntity as unknown[]).length).toBeGreaterThan(0);

  await page.goto('/gebetszeiten');
  const gz = (await jsonLd(page)).find((d) => d['@type'] === 'FAQPage');
  expect(gz).toBeDefined();
  const fragen = gz!.mainEntity as { name: string }[];
  expect(fragen[0].name).toBe(gebetszeiten.de.gebetszeitenFaq.quelle.frage);
  expect(gz!.inLanguage).toBe('de');
});
