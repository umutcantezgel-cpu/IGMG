import { type BrowserContext, expect, test } from '@playwright/test';
import de from '../../../messages/lernapp/de.json';
import { beantworteErste, KURS, LEKTION_1, loeseWiederholung, spieleLektion1, swSteuert, testStation } from './hilfen';

/**
 * Netzprotokoll ohne Konto (KERN 4.0 §6, ADR 0038 Nr. 1, Abnahme Z-L08): alle Anfragen der Seiten, ihrer Worker und des
 * Service Workers (`context.on('request')`) mit Methode und Adresse; erwartet nur GET an den eigenen Ursprung, keine API
 * (auch nicht `/api/lernapp/sitzung`), keine Cookies.
 * 1. Start, Lernpfad, Einheit offline speichern, eine Lektion, Einstellung ändern, Wiederholen und Tipps.
 * 2. (Stufe C N9b) Einstufung mit einer Frage, Fortschritt, Wortschatz, Quellen, Wissenskurs (Lernpfad und erste Aufgabe),
 *    Koran-Kurs (erste Einheit aufgeklappt) und eine gespielte Wiederholungsrunde nach einer Lektion mit Fehler.
 */

type Anfrage = { methode: string; url: string; worker: boolean };

function protokoll(context: BrowserContext) {
  const anfragen: Anfrage[] = [];
  context.on('request', (r) => anfragen.push({ methode: r.method(), url: r.url(), worker: Boolean(r.serviceWorker()) }));
  return anfragen;
}

async function pruefeProtokoll(anfragen: Anfrage[], ursprung: string, context: BrowserContext) {
  expect(anfragen.length).toBeGreaterThan(10);
  const fremd = anfragen.filter((a) => a.methode !== 'GET' || new URL(a.url).origin !== ursprung);
  expect(fremd).toEqual([]);
  expect(anfragen.filter((a) => new URL(a.url).pathname.startsWith('/api/'))).toEqual([]);
  // der Worker hat Pakete bzw. Seiten selbst geholt (auch seine Anfragen sind im Protokoll)
  expect(anfragen.some((a) => a.worker)).toBe(true);
  expect(await context.cookies()).toEqual([]);
}

test('ohne Konto: nur GET an den eigenen Ursprung, keine API, keine Cookies', async ({ page, context, baseURL }, info) => {
  test.skip(info.project.name !== 'desktop', 'einmal je Lauf genügt');
  test.setTimeout(150_000);
  const ursprung = new URL(baseURL ?? 'http://localhost').origin;
  const anfragen = protokoll(context);

  await page.goto('/lern-app/de');
  await expect(page.getByText(de.heute.nochNichts)).toBeVisible();
  await page.goto(`/lern-app/de/${KURS}`);
  await testStation(page).getByRole('button', { name: de.lernpfad.offline }).click();
  await expect(page.locator('main').getByText(de.lernpfad.offlineFertig.split(' (')[0]!).first()).toBeVisible({ timeout: 60_000 });
  await page.goto(`/lern-app/de/${KURS}/ueben?l=${LEKTION_1}`);
  await spieleLektion1(page, 'tastatur');
  await page.goto('/lern-app/de/einstellungen');
  await page.getByRole('radio', { name: de.einstellungen.zielKeins, exact: true }).check();
  await expect(page.getByRole('status').filter({ hasText: de.einstellungen.gespeichert })).toBeVisible();
  await page.goto(`/lern-app/de/${KURS}/wiederholen`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(de.wiederholen.titel);
  await page.goto(`/lern-app/de/${KURS}/tipps?e=tr.a1.test`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(de.tipps.titel);
  await page.goto('/lern-app/de');
  await expect(page.getByText(de.heute.nochNichts)).toHaveCount(0);

  await pruefeProtokoll(anfragen, ursprung, context);
});

test('ohne Konto: Einstufung, Fortschritt, Wortschatz, Quellen, Wissen, Koran und eine gespielte Wiederholungsrunde', async ({
  page,
  context,
  baseURL,
}, info) => {
  test.skip(info.project.name !== 'desktop', 'einmal je Lauf genügt');
  test.setTimeout(180_000);
  const ursprung = new URL(baseURL ?? 'http://localhost').origin;
  const anfragen = protokoll(context);

  await page.goto('/lern-app/de');
  await swSteuert(page);

  await page.goto(`/lern-app/de/${KURS}/einstufung`);
  await page.getByRole('button', { name: de.einstufung.start, exact: true }).click();
  await beantworteErste(page, de, { weiter: true });

  for (const [pfad, titel] of [
    ['/lern-app/de/fortschritt', de.fortschritt.titel],
    ['/lern-app/de/wortschatz', de.wortschatz.titel],
    ['/lern-app/de/quellen', de.quellen.titel],
  ] as const) {
    await page.goto(pfad);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(titel);
  }

  await page.goto('/lern-app/de/islam');
  await page.locator('main a[href="/lern-app/de/islam/ueben?l=islam.grund.test.l01"]').click();
  await beantworteErste(page, de, { weiter: true });

  await page.goto('/lern-app/de/koran');
  const e01 = page.locator('details[data-einheit="koran.grund.e01"]');
  await e01.locator('summary').click();
  await expect(e01.locator('li[data-stelle]').first()).toBeVisible();

  // Lektion mit einem Fehler, danach eine Wiederholungsrunde bis zum Ende
  await page.goto(`/lern-app/de/${KURS}/ueben?l=${LEKTION_1}`);
  await spieleLektion1(page, 'tastatur', { ersteFalsch: true });
  await page.goto(`/lern-app/de/${KURS}/wiederholen`);
  await expect(page.locator('main form[data-aufgabe]')).toBeVisible({ timeout: 30_000 });
  for (let i = 0; i < 8 && (await page.locator('main form[data-aufgabe]').count()) > 0; i++) await loeseWiederholung(page);
  await expect(page.getByRole('heading', { name: de.spieler.fertigTitel })).toBeVisible();
  await expect(page.getByRole('link', { name: de.spieler.zurueck })).toBeVisible();

  await pruefeProtokoll(anfragen, ursprung, context);
  // jede besuchte Art von Seite steht im Protokoll (der Worker kann Seiten auch aus dem Vorrat beantworten – dann fehlt die
  // Anfrage nicht, sie kommt vom Worker)
  const pfade = new Set(anfragen.map((a) => new URL(a.url).pathname));
  for (const p of ['/lern-app/de/tr-aus-de/einstufung', '/lern-app/de/islam', '/lern-app/de/koran', '/lern-app/de/tr-aus-de/wiederholen'])
    expect(pfade.has(p), p).toBe(true);
});
