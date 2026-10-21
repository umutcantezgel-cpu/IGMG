import { expect, test, type Route } from '@playwright/test';
import quellen from '../../../messages/bereiche/quellen.json';
import ar from '../../../messages/lernapp/ar.json';
import de from '../../../messages/lernapp/de.json';
import tr from '../../../messages/lernapp/tr.json';
import { INHALT_LIZENZ, PAKET_FORMAT } from '../../../src/lib/lernapp/paket/kennungen';
import { DATEN, ORT_DRITTLIZENZEN } from '../../../src/lib/lernapp/quellen';
import { swSteuert } from './hilfen';

/**
 * Lizenzverzeichnis und Namensnennungen (L8-03, ADR 0045 Nr. 15, ADR 0042 Nr. 10, Z-L17), Projekte „telefon“ und „desktop“:
 * - `/lern-app/[ui]/quellen` in de/tr/ar: alle Abschnitte (Inhalte, Sprachdaten, Koran und Hadith als Verweis, Bildkarten,
 *   Bibliotheken, Spracherkennung mit Drittlizenzen, Sprachausgabe mit Herkunftskette, Schriften) und je Datenquelle die
 *   Namensnennung; der Volltext der Drittlizenzen von ONNX Runtime kommt vom eigenen Ursprung,
 * - Namensnennung je Satz und Eintrag (Gegenprüfung L8-03-04, Mangel 1): auf einem neuen Gerät der Hinweis „noch keine
 *   Einheit“; offline aus einem Paket im Vorrat der Satz mit Urheber und Adresse der Quelle,
 * - offline: die Seite aus dem Vorrat des Lern-App-SW mit allen Namensnennungen (Netz abgeklemmt über `route`, nicht
 *   `setOffline`, das die Anfragen des Workers nicht erfasst),
 * - Website `/quellen` in de/tr/en mit den Abschnitten der Lern-App und dem Link auf die Drittlizenzen.
 */

const TEXTE = { de, tr, ar } as const;
const ABSCHNITTE = [
  'inhalte',
  'eintraege',
  'sprachdaten',
  'quelltexte',
  'bildkarten',
  'bibliotheken',
  'spracherkennung',
  'drittlizenzen',
  'sprachausgabe',
  'schriften',
];

for (const ui of ['de', 'tr', 'ar'] as const) {
  test(`Lern-App ${ui}: Quellen mit Daten, Namensnennung, Drittlizenzen und Herkunftskette der Stimme`, async ({ page, request }) => {
    const t = TEXTE[ui];
    const antwort = await page.goto(`/lern-app/${ui}/quellen`);
    expect(antwort?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(t.quellen.titel);
    for (const id of ABSCHNITTE) await expect(page.locator(`h2#${id}`), id).toBeVisible();
    // neues Gerät: noch keine Einheit im Vorrat (die Insel hat gelesen)
    await expect(page.locator('section[aria-labelledby="eintraege"]').getByText(t.namensnennung.insel.leer)).toBeVisible();
    for (const d of DATEN) {
      const karte = page.locator(`#quelle-${d.id}`);
      await expect(karte.getByRole('heading', { level: 3 })).toHaveText(d.name);
      await expect(karte.getByText(d.namensnennung, { exact: true })).toBeVisible();
      await expect(karte.getByText(t.lizenzverzeichnis.verwendungen[d.id], { exact: true })).toBeVisible();
    }
    await expect(page.locator('main')).toContainText('ONNX Runtime Web');
    await expect(page.locator('main')).toContainText('Noto Sans Arabic');
    // Herkunftskette der deutschen Stimme: Gewichte, Export, Erzeugung, Wasserzeichen
    await expect(page.locator('main')).toContainText('Thorsten-Voice/VITS@54f782a5e798cb4597fdac2e866ac8318143e0fb');
    await expect(page.getByText(t.lizenzverzeichnis.wasserzeichen, { exact: true })).toBeVisible();
    // Drittlizenzen von ONNX Runtime: Link vom eigenen Ursprung, Volltext als Textdatei
    const link = page.getByRole('link', { name: t.lizenzverzeichnis.drittlizenzenLink });
    await expect(link).toHaveAttribute('href', ORT_DRITTLIZENZEN.pfad);
    const datei = await request.get(ORT_DRITTLIZENZEN.pfad);
    expect(datei.status()).toBe(200);
    expect(datei.headers()['content-type']).toMatch(/^text\/plain/);
    expect((await datei.text()).startsWith('THIRD PARTY SOFTWARE NOTICES AND INFORMATION')).toBe(true);
    // keine Links nach außen auf der Seite (Adressen stehen als Text, ADR 0044 Nr. 7)
    const fremd = await page
      .locator('main a[href]')
      .evaluateAll((l) => l.map((a) => (a as HTMLAnchorElement).href).filter((h) => new URL(h).origin !== location.origin));
    expect(fremd).toEqual([]);
  });
}

test('Lern-App offline: Quellen mit allen Namensnennungen aus dem Vorrat', async ({ page, context }) => {
  test.setTimeout(90_000);
  await page.goto('/lern-app/de');
  await swSteuert(page);
  await expect
    .poll(
      () =>
        page.evaluate(async () => {
          const name = (await caches.keys()).find((n) => n.startsWith('igmg-lernapp-schale-v'));
          return name ? (await (await caches.open(name)).keys()).map((r) => new URL(r.url).pathname) : [];
        }),
      { timeout: 30_000 },
    )
    .toContain('/lern-app/de/quellen');
  // ein Einheitenpaket im Vorrat (wie nach einer Lektion), mit einem Satz aus Tatoeba und einem eigenen Eintrag
  const paket = JSON.stringify({
    format: PAKET_FORMAT,
    version: 1,
    kurs: 'de-aus-tr',
    zielsprache: 'de',
    ausgangssprache: 'tr',
    einheit: { schluessel: 'de.a1.e90', stufe: 'a1', reihenfolge: 90, thema: { de: '[Thema]', tr: '[Thema]' } },
    hinweis: false,
    lektionen: [{ schluessel: 'de-aus-tr.a1.e90.l01', art: 'lektion', aufgaben: [] }],
    eintraege: {
      'de.a1.e90.s0001': {
        text: 'Guten Morgen!',
        sprache: 'de',
        quelle: 'tatoeba:1234',
        lizenz: 'CC-BY-2.0-FR',
        namensnennung: 'Satz #1234 von [Benutzername] (Tatoeba), CC BY 2.0 FR',
      },
      'de.a1.e90.s0002': { text: 'Gute Nacht!', sprache: 'de', quelle: 'ki:e2e', lizenz: 'CC-BY-SA-4.0' },
    },
    tipps: [],
    audio: [],
    lizenz: INHALT_LIZENZ,
  });
  await page.evaluate(async (json) => {
    const bytes = new TextEncoder().encode(json);
    const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', bytes));
    const hash = Array.from(digest, (b) => b.toString(16).padStart(2, '0')).join('');
    const vorrat = await caches.open('igmg-lernapp-pakete');
    await vorrat.put(
      `/lern-app/pakete/de-aus-tr/de.a1.e90/${hash}`,
      new Response(json, { headers: { 'content-type': 'application/json' } }),
    );
  }, paket);
  const abklemmen = (route: Route) => route.abort('internetdisconnected');
  await context.route('**/*', abklemmen);
  await page.route('**/*', abklemmen);
  await page.goto('/lern-app/de/quellen');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(de.quellen.titel);
  for (const d of DATEN) await expect(page.locator(`#quelle-${d.id}`).getByText(d.namensnennung, { exact: true })).toBeVisible();
  await expect(page.locator('main')).toContainText('Apache License');
  // Namensnennung je Satz aus dem Paket im Vorrat, ohne Netz
  const einheit = page.locator('section[aria-labelledby="eintraege"] details');
  await expect(einheit.locator('summary')).toContainText(`${de.kurse.ziel.de} (${de.kurse.fuer.tr}) · [Thema]`);
  await expect(einheit.locator('summary')).toContainText('1 Eintrag mit Namensnennung');
  await einheit.locator('summary').click();
  await expect(einheit.getByText('Guten Morgen!', { exact: true })).toBeVisible();
  await expect(einheit.getByText('Satz #1234 von [Benutzername] (Tatoeba), CC BY 2.0 FR', { exact: true })).toBeVisible();
  await expect(einheit.getByText('https://tatoeba.org/de/sentences/show/1234', { exact: true })).toBeVisible();
  await expect(einheit).toContainText('1 weiterer Eintrag ist ein eigener Inhalt der Lern-App');
});

for (const [sprache, pfad] of [
  ['de', '/quellen'],
  ['tr', '/tr/kaynaklar'],
  ['en', '/en/sources'],
] as const) {
  test(`Website ${sprache}: /quellen nennt Sprachdaten, Bildkarten und Spracherkennung der Lern-App`, async ({ page }) => {
    const t = quellen[sprache].quellen;
    const antwort = await page.goto(pfad);
    expect(antwort?.status()).toBe(200);
    for (const id of ['lernapp-daten', 'sprachausgabe', 'lernapp-spracherkennung'])
      await expect(page.locator(`section#${id}`), id).toBeVisible();
    await expect(page.getByRole('heading', { name: t.abschnitte['lernapp-daten'] })).toBeVisible();
    for (const id of [
      'tatoeba',
      'wiktionary',
      'wordfreq',
      'camel-msa',
      'frequencywords',
      'lucide-bildkarten',
      'whisper',
      'onnxruntime-web',
      'noto-sans-arabic',
    ])
      await expect(page.locator(`article#${id}`), id).toBeVisible();
    const tatoeba = DATEN.find((d) => d.id === 'tatoeba')!;
    await expect(page.locator('article#tatoeba').getByText(tatoeba.namensnennung, { exact: true })).toBeVisible();
    await expect(page.locator('article#onnxruntime-web').getByRole('link', { name: 'ThirdPartyNotices.txt' })).toHaveAttribute(
      'href',
      ORT_DRITTLIZENZEN.pfad,
    );
  });
}
