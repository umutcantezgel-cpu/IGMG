import { expect, test, type Locator, type Page } from '@playwright/test';
import de from '../../messages/de.json';
import en from '../../messages/en.json';
import tr from '../../messages/tr.json';

/**
 * E2E Veranstaltungen (Blätter S04 und S05): Liste, Kategoriefilter, Leerzustand, Sprachwahl, Kalenderfeeds, Detailseite.
 * Adressen nach K-03: de /veranstaltungen, tr /tr/etkinlikler, en /en/events. Texte kommen aus messages/{de,tr,en}.json.
 * Der Erstbesuch-Hinweis ist vorab als gesehen markiert (siehe startseite.spec.ts).
 */

type Texte = Pick<typeof de, 'kopf' | 'pfad' | 'sprachwahl' | 'karten' | 'veranstaltungen' | 'veranstaltung'>;

type Liste = {
  kuerzel: 'de' | 'tr' | 'en';
  pfad: string;
  detailMuster: RegExp;
  texte: Texte;
};

const DE: Liste = { kuerzel: 'de', pfad: '/veranstaltungen', detailMuster: /\/veranstaltungen\/[^/]+$/, texte: de };
const TR: Liste = { kuerzel: 'tr', pfad: '/tr/etkinlikler', detailMuster: /\/tr\/etkinlikler\/[^/]+$/, texte: tr };
const EN: Liste = { kuerzel: 'en', pfad: '/en/events', detailMuster: /\/en\/events\/[^/]+$/, texte: en };
const LISTEN = [DE, TR, EN];

/**
 * Der Erstbesuch-Hinweis (Konzeptseite) setzt beim Bestätigen den Schlüssel igmg-konzepthinweis-gesehen = "1" im
 * localStorage (beobachtet). Dieser Zustand wird vor dem Laden gesetzt, damit der Hinweis Tab-Reihenfolge und Klicks nicht verdeckt.
 */
test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    try {
      window.localStorage.setItem('igmg-konzepthinweis-gesehen', '1');
    } catch {
      // Kein Speicher verfügbar: der Hinweis bleibt sichtbar.
    }
  });
});

/** Die sechs Kategorie-Schalter (ohne „Alle“), Namen aus karten.kat_*. */
function kategorien(texte: Texte): string[] {
  const karten = texte.karten;
  return [karten.kat_gebet, karten.kat_bildung, karten.kat_gemeinde, karten.kat_kultur, karten.kat_jugend, karten.kat_frauen];
}

/** Kategorie-Schlüssel (data-kategorie der Listenelemente) in derselben Reihenfolge wie kategorien(). */
const KATEGORIE_SCHLUESSEL = ['gebet', 'bildung', 'gemeinde', 'kultur', 'jugend', 'frauen'];

/** Schaltfläche in der Filterleiste (Gruppe „Kategorie“). Die Gruppe trennt sie von gleichnamigen Menüknöpfen der Hauptnavigation. */
function filterKnopf(seite: Page, texte: Texte, name: string): Locator {
  return seite.getByRole('group', { name: texte.veranstaltungen.kategorie, exact: true }).getByRole('button', { name, exact: true });
}

function normalisiere(text: string | null): string {
  return (text ?? '').replace(/\s+/g, ' ').trim();
}

function slugAus(adresse: string): string {
  return new URL(adresse).pathname.split('/').filter(Boolean).pop() ?? '';
}

/**
 * Öffnet die Liste und die Detailseite der ersten Karte; liefert Titel und Slug der Veranstaltung.
 * Der Link „Details ansehen“ trägt im Namen zusätzlich den Titel („Details ansehen: …“), daher ohne exakten Vergleich.
 */
async function oeffneErsteDetailseite(seite: Page, liste: Liste): Promise<{ titel: string; slug: string }> {
  await seite.goto(liste.pfad);
  const erste = seite.getByRole('article').first();
  await expect(erste).toBeVisible();
  const titel = normalisiere(await erste.getByRole('heading').first().textContent());
  await erste.getByRole('link', { name: liste.texte.karten.details }).click();
  await expect(seite).toHaveURL(liste.detailMuster);
  return { titel, slug: slugAus(seite.url()) };
}

for (const liste of LISTEN) {
  const t = liste.texte;

  test(`${liste.kuerzel}: h1 „${t.veranstaltungen.titel}“ und mindestens eine Karte sichtbar`, async ({ page }) => {
    await page.goto(liste.pfad);
    await expect(page.getByRole('heading', { level: 1, name: t.veranstaltungen.titel, exact: true })).toBeVisible();
    await expect(page.getByRole('article').first()).toBeVisible();
  });

  test(`${liste.kuerzel}: Schaltfläche „${t.veranstaltungen.alle}“ ist beim Öffnen aktiv`, async ({ page }) => {
    await page.goto(liste.pfad);
    await expect(filterKnopf(page, t, t.veranstaltungen.alle)).toHaveAttribute('aria-pressed', 'true');
  });

  test(`${liste.kuerzel}: Kategorie-Schalter blendet andere Karten aus, sichtbare Karten gehören zur gewählten Kategorie`, async ({
    page,
  }, testInfo) => {
    await page.goto(liste.pfad);
    const karten = page.getByRole('article');
    await expect(karten.first()).toBeVisible();
    const gesamt = await karten.count();

    let gewaehlt: string | undefined;
    for (const kategorie of kategorien(t)) {
      await filterKnopf(page, t, kategorie).click();
      await expect(filterKnopf(page, t, kategorie)).toHaveAttribute('aria-pressed', 'true');
      const anzahl = await karten.count();
      if (anzahl >= 1 && anzahl < gesamt) {
        gewaehlt = kategorie;
        break;
      }
    }
    if (gewaehlt === undefined) {
      test.fixme(
        true,
        'Keine Kategorie mit Treffern, die nicht alle Karten umfassen: Filterwirkung ist mit den aktuellen Daten nicht prüfbar (offen).',
      );
      return;
    }

    await expect(filterKnopf(page, t, gewaehlt)).toHaveAttribute('aria-pressed', 'true');
    await expect(filterKnopf(page, t, t.veranstaltungen.alle)).toHaveAttribute('aria-pressed', 'false');
    expect(await karten.count()).toBeLessThan(gesamt);
    // Telefon (H-C03): die Kompaktzeile trägt kein Kategorie-Etikett; dort zählt die Kategorie der umschließenden Zeile.
    const schluessel = KATEGORIE_SCHLUESSEL[kategorien(t).indexOf(gewaehlt)];
    for (const karte of await karten.all()) {
      if (testInfo.project.name === 'telefon') {
        await expect(karte.locator('xpath=ancestor::li[1]')).toHaveAttribute('data-kategorie', schluessel);
      } else {
        await expect(karte.getByText(gewaehlt, { exact: true }).first()).toBeVisible();
      }
    }
  });

  test(`${liste.kuerzel}: Kategorie ohne Termine zeigt Leerzustand, „${t.veranstaltungen.alle}“ zeigt wieder alle Karten`, async ({
    page,
  }) => {
    await page.goto(liste.pfad);
    const karten = page.getByRole('article');
    await expect(karten.first()).toBeVisible();
    const gesamt = await karten.count();

    let leer: string | undefined;
    for (const kategorie of kategorien(t)) {
      await filterKnopf(page, t, kategorie).click();
      await expect(filterKnopf(page, t, kategorie)).toHaveAttribute('aria-pressed', 'true');
      if ((await karten.count()) === 0) {
        leer = kategorie;
        break;
      }
    }
    if (leer === undefined) {
      test.fixme(true, 'Keine Kategorie ohne kommende Termine in den Daten: Leerzustand ist mit diesen Daten nicht prüfbar (offen).');
      return;
    }
    test.info().annotations.push({ type: 'leere Kategorie', description: leer });

    await expect(page.getByText(t.veranstaltungen.leerTitel, { exact: true })).toBeVisible();
    // Im Leerzustand gibt es zwei Knöpfe „Alle“: den Filterknopf und danach den Rücksetzknopf des Leerzustands.
    await page.getByRole('button', { name: t.veranstaltungen.alle, exact: true }).last().click();
    await expect(filterKnopf(page, t, t.veranstaltungen.alle)).toHaveAttribute('aria-pressed', 'true');
    await expect(karten.first()).toBeVisible();
    expect(await karten.count()).toBe(gesamt);
  });

  test(`${liste.kuerzel}: Kalender-Abo „${t.veranstaltungen.aboTitel}“ bietet webcal-Abo und Datei, die Datei liefert einen Kalender`, async ({
    page,
    request,
  }) => {
    // Der Abo-Knopf (webcal) und der Textlink „Datei laden“ (.ics) zeigen auf denselben Veranstaltungs-Feed (K-19).
    const pfad = `/api/ical/${liste.kuerzel}/veranstaltungen`;
    await page.goto(liste.pfad);

    const abo = page.getByRole('link', { name: t.veranstaltungen.aboAbonnieren, exact: true });
    await expect(abo).toBeVisible();
    const aboZiel = (await abo.getAttribute('href')) ?? '';
    expect(aboZiel).toMatch(/^webcal:\/\//);
    expect(new URL(aboZiel.replace(/^webcal:/, 'http:')).pathname).toBe(pfad);

    const datei = page.getByRole('link', { name: t.veranstaltungen.aboDatei, exact: true });
    await expect(datei).toBeVisible();
    await expect(datei).toHaveAttribute('download', /\.ics$/);
    const dateiZiel = (await datei.getAttribute('href')) ?? '';
    expect(new URL(dateiZiel, page.url()).pathname).toBe(pfad);

    const antwort = await request.get(dateiZiel);
    expect(antwort.status()).toBe(200);
    expect(antwort.headers()['content-type']).toContain('text/calendar');
    expect(await antwort.text()).toContain('BEGIN:VCALENDAR');
  });

  test(`${liste.kuerzel}: „${t.karten.details}“ der ersten Karte öffnet die Detailseite mit dem Kartentitel als h1`, async ({ page }) => {
    const { titel } = await oeffneErsteDetailseite(page, liste);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(titel);
  });

  test(`${liste.kuerzel}: Breadcrumb der Detailseite enthält einen Link zu den Veranstaltungen`, async ({ page }) => {
    await oeffneErsteDetailseite(page, liste);
    const brotkrumen = page.getByRole('navigation', { name: t.pfad.label, exact: true });
    await expect(brotkrumen.getByRole('link', { name: t.kopf.veranstaltungen, exact: true })).toHaveAttribute('href', liste.pfad);
  });

  test(`${liste.kuerzel}: „${t.veranstaltung.merken}“ ist ein Link auf die Kalenderdatei des Termins`, async ({ page, request }) => {
    const { slug } = await oeffneErsteDetailseite(page, liste);
    // Der Link trägt im Namen zusätzlich die Beschreibung („Merken: Termin als Kalenderdatei …“).
    const merken = page.getByRole('link', { name: t.veranstaltung.merken });
    await expect(merken).toBeVisible();
    const ziel = (await merken.getAttribute('href')) ?? '';
    expect(new URL(ziel, page.url()).pathname).toBe(`/api/ical/${liste.kuerzel}/veranstaltung/${slug}`);

    const antwort = await request.get(ziel);
    expect(antwort.status()).toBe(200);
    expect(antwort.headers()['content-type']).toContain('text/calendar');
    expect(antwort.headers()['content-disposition']).toContain('attachment');
    expect(await antwort.text()).toContain('BEGIN:VEVENT');
  });

  test(`${liste.kuerzel}: unbekannter Slug antwortet mit HTTP 404`, async ({ page }) => {
    const antwort = await page.goto(`${liste.pfad}/gibt-es-nicht-xyz`);
    expect(antwort?.status()).toBe(404);
  });

  test(`${liste.kuerzel}: Abschnitt #anmeldung hat die Überschrift „${t.veranstaltung.anmeldung}“`, async ({ page }) => {
    await oeffneErsteDetailseite(page, liste);
    await expect(page.locator('#anmeldung')).toBeAttached();
    await expect(page.locator('#anmeldung').getByRole('heading', { name: t.veranstaltung.anmeldung, exact: true })).toBeVisible();
  });
}

test('de: Sprachwahl im Kopf wechselt von der Liste auf /tr/etkinlikler', async ({ page }, testInfo) => {
  await page.goto(DE.pfad);
  await expect(page.getByRole('heading', { level: 1, name: de.veranstaltungen.titel, exact: true })).toBeVisible();
  if (testInfo.project.name === 'telefon') {
    // Auf dem Telefon liegt die Sprachwahl im Menü-Dialog „Navigation“ (Gruppe „Sprache / Dil / Language“).
    await page.getByRole('button', { name: de.kopf.menueOeffnen, exact: true }).click();
  } else {
    await page.getByRole('button', { name: de.sprachwahl.aendern, exact: true }).click();
  }
  // Der Sprachlink trägt im Namen das Kürzel („TR Türkçe“), daher ohne exakten Vergleich.
  await page.getByRole('link', { name: de.sprachwahl.tr }).click();
  await expect(page).toHaveURL(/\/tr\/etkinlikler$/);
  await expect(page.getByRole('heading', { level: 1, name: tr.veranstaltungen.titel, exact: true })).toBeVisible();
});

test('en: Detailseite /en/events/<slug> hat lang="en"; deutsche h1 ohne Übersetzung trägt lang="de"', async ({ page }) => {
  const { titel, slug } = await oeffneErsteDetailseite(page, DE);
  await page.goto(`${EN.pfad}/${slug}`);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  const ueberschrift = page.getByRole('heading', { level: 1 });
  await expect(ueberschrift).toBeVisible();
  const text = normalisiere(await ueberschrift.textContent());
  await expect(ueberschrift).toHaveAttribute('lang', text === titel ? 'de' : 'en');
});
