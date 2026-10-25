import { expect, test } from '@playwright/test';
import de from '../../../messages/lernapp/de.json';
import { ergebnisText, KURS, LEKTION_1, spieleLektion1, swSteuert, testStation, xpText } from './hilfen';

/**
 * Offline (ADR 0038, ADR 0039 Nr. 12, ADR 0037 Fortschreibung Nr. 7, AUFTRAG §6 Station 3): Einheit im Lernpfad offline
 * speichern, dann das Netz abklemmen – über `page.route` und `context.route` (nicht `context.setOffline`, das die Anfragen des
 * Service Workers nicht erfasst) – und die Lektion vollständig spielen. Der Fortschritt bleibt auf dem Gerät.
 */

test('Einheit offline speichern, Netz abklemmen: Lektion vollständig spielbar, Fortschritt bleibt', async ({ page, context }, info) => {
  test.setTimeout(150_000);
  const bedienung = info.project.name === 'telefon' ? 'tippen' : 'tastatur';
  const lernpfad = `/lern-app/de/${KURS}`;

  await page.goto(lernpfad);
  await swSteuert(page);
  // einmal unter dem Worker laden, damit Seite, Programmteile und Schriften durch ihn gehen
  await page.reload();
  // die Station der Testeinheit (in der E2E-Datenbank stehen daneben die echten Einheiten mit eigenem Knopf)
  const speichern = testStation(page).getByRole('button', { name: de.lernpfad.offline });
  await expect(speichern).toBeVisible();
  await speichern.click();
  await expect(page.locator('main').getByText(de.lernpfad.offlineFertig.split(' (')[0]!).first()).toBeVisible({ timeout: 60_000 });

  // Vorrat: Seite der Übung (ohne Suchteil), Paket der Einheit, Bündel der Töne
  const vorrat = await page.evaluate(async () => {
    const aus: string[] = [];
    for (const name of await caches.keys())
      for (const r of await (await caches.open(name)).keys()) aus.push(`${name.replace(/-v[a-z0-9]+$/, '')} ${new URL(r.url).pathname}`);
    return aus;
  });
  expect(vorrat).toEqual(
    expect.arrayContaining([
      `igmg-lernapp-schale /lern-app/de/${KURS}/ueben`,
      expect.stringMatching(new RegExp(`^igmg-lernapp-pakete /lern-app/pakete/${KURS}/tr\\.a1\\.test/[0-9a-f]{64}$`)),
      expect.stringMatching(/^igmg-lernapp-audio \/lern-app\/audio\/tr\/tr\.a1\.test-[0-9a-f]{16}\.lpa$/),
    ]),
  );
  // Dauerhafter Speicher erst beim bewussten Speichern erbeten; der Eintrag im Speicher „pakete“ ist offline markiert
  const eintrag = await page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((ok, f) => {
      const r = indexedDB.open('igmg-lernapp');
      r.onsuccess = () => ok(r.result);
      r.onerror = () => f(r.error);
    });
    const alle = await new Promise<{ einheit: string; offline: boolean }[]>((ok, f) => {
      const r = db.transaction('pakete').objectStore('pakete').getAll();
      r.onsuccess = () => ok(r.result as { einheit: string; offline: boolean }[]);
      r.onerror = () => f(r.error);
    });
    db.close();
    return alle;
  });
  expect(eintrag).toEqual(expect.arrayContaining([expect.objectContaining({ einheit: 'tr.a1.test', offline: true })]));

  // Netz abklemmen: Seite und Kontext (auch Anfragen des Service Workers)
  const abgeklemmt: string[] = [];
  const abklemmen = (route: import('@playwright/test').Route) => {
    abgeklemmt.push(route.request().url());
    return route.abort('internetdisconnected');
  };
  await context.route('**/*', abklemmen);
  await page.route('**/*', abklemmen);
  expect(
    await page.evaluate(() =>
      fetch('/api/health', { cache: 'no-store' }).then(
        () => 'netz',
        () => 'kein netz',
      ),
    ),
  ).toBe('kein netz');

  await page.goto(`${lernpfad}/ueben?l=${LEKTION_1}`);
  await spieleLektion1(page, bedienung);
  await expect(page.getByText(ergebnisText(4, 4), { exact: true })).toBeVisible();
  await expect(page.getByText(xpText(10), { exact: true })).toBeVisible();

  // Fortschritt bleibt: Lernpfad (aus dem Vorrat) zeigt die Lektion als geschafft
  await page.goto(lernpfad);
  await expect(page.locator(`main a[href="${lernpfad}/ueben?l=${LEKTION_1}"]`)).toContainText(`(${de.lernpfad.geschafft})`);
  expect(abgeklemmt.length).toBeGreaterThan(0);

  // wieder online: der Stand ist derselbe
  await context.unrouteAll({ behavior: 'ignoreErrors' });
  await page.unrouteAll({ behavior: 'ignoreErrors' });
  await page.reload();
  await expect(page.locator(`main a[href="${lernpfad}/ueben?l=${LEKTION_1}"]`)).toContainText(`(${de.lernpfad.geschafft})`);
});
