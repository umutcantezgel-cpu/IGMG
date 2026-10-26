import { type BrowserContext, expect, type Page, type Route, test } from '@playwright/test';
import de from '../../../messages/lernapp/de.json';
import { formatiere } from '../../../src/lib/lernapp/format';
import { EINHEIT, ergebnisText, KURS, LEKTION_1, spieleLektion1, swSteuert, testStation, wiederholeBisFertig, xpText } from './hilfen';
import { beobachteAudio, spieleTurkisch } from './l03';

/**
 * Offline (ADR 0038, ADR 0039 Nr. 12, ADR 0037 Fortschreibung Nr. 7, AUFTRAG §6 Station 3, ABNAHME Z-L04):
 * - Einheit im Lernpfad offline speichern, dann das Netz abklemmen – über `page.route` und `context.route` – und die Lektion
 *   vollständig spielen. Der Fortschritt bleibt auf dem Gerät.
 * - Stufe C N9a: „Stufe offline speichern“ (Speicherbedarf vorher, abbrechbar), dann ohne Netz – `context.setOffline(true)`
 *   (`navigator.onLine` ist `false`) UND Abklemmen per Route (erfasst auch die Anfragen des Service Workers) – die Lektion
 *   einer Einheit, die nur die Stufe gespeichert hat, die Hörübung aus dem Bündel, Wiederholen bis „fertig“; der Fortschritt
 *   bleibt.
 * - Befund G-1: Nach einem Bauwechsel (Lern-App-Worker mit neuer `?v=`) bleibt eine gespeicherte Einheit ohne Netz spielbar –
 *   erst aus dem Kursvorrat des alten Baus, nach der Wiederherstellung aus dem eigenen; der Lernpfad sagt ehrlich, solange etwas
 *   fehlt.
 */

type Verzeichnis = { einheiten: { schluessel: string; stufe: string; hash: string; audio: { adresse: string }[] }[] };

/** Netz weg: Kontext offline (`navigator.onLine` = false) und alle Anfragen von Seite und Kontext (auch des Workers) abgeklemmt. */
async function netzWeg(page: Page, context: BrowserContext) {
  const abgeklemmt: string[] = [];
  const abklemmen = (route: Route) => {
    abgeklemmt.push(route.request().url());
    return route.abort('internetdisconnected');
  };
  await context.setOffline(true);
  await context.route('**/*', abklemmen);
  await page.route('**/*', abklemmen);
  expect(await page.evaluate(() => navigator.onLine)).toBe(false);
  expect(
    await page.evaluate(() =>
      fetch('/api/health', { cache: 'no-store' }).then(
        () => 'netz',
        () => 'kein netz',
      ),
    ),
  ).toBe('kein netz');
  return {
    abgeklemmt,
    zurueck: async () => {
      await context.unrouteAll({ behavior: 'ignoreErrors' });
      await page.unrouteAll({ behavior: 'ignoreErrors' });
      await context.setOffline(false);
    },
  };
}

/** Einträge im Speicher `pakete` der lokalen Datenbank: Einheit → offline gespeichert? */
async function paketEintraege(page: Page): Promise<Record<string, boolean>> {
  return page.evaluate(async () => {
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
    return Object.fromEntries(alle.map((e) => [e.einheit, e.offline]));
  });
}

/** Vorräte der Lern-App: Name (ohne Bau-Kennung, wenn `ohneBau`) → Pfade samt Suchteil. */
async function vorraete(page: Page): Promise<Record<string, string[]>> {
  return page.evaluate(async () => {
    const aus: Record<string, string[]> = {};
    for (const name of (await caches.keys()).filter((n) => n.startsWith('igmg-lernapp-')).sort())
      aus[name] = (await (await caches.open(name)).keys()).map((r) => new URL(r.url).pathname + new URL(r.url).search).sort();
    return aus;
  });
}

/** Text einer Vorlage bis zum ersten Platzhalter `mb` (die Größe hängt vom Inhalt ab). */
const bisMb = (vorlage: string, werte: Record<string, string | number> = {}) =>
  formatiere(vorlage, { ...werte, mb: '§' }, 'de').split('§')[0]!;

/** Station des Lernpfads per Tastatur (desktop) oder Tippen (telefon) bedienen. */
async function druecke(page: Page, knopf: import('@playwright/test').Locator, tastatur: boolean) {
  if (tastatur) {
    await knopf.focus();
    await page.keyboard.press('Enter');
  } else await knopf.tap();
}

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

  // Vorrat: Seite der Übung (ohne Suchteil) im Kursvorrat des Baus (seit Stufe C N9a, G-1, nicht mehr in der Hülle) samt
  // Merkzeichen, Paket der Einheit, Bündel der Töne
  const vorrat = await page.evaluate(async () => {
    const aus: string[] = [];
    for (const name of await caches.keys())
      for (const r of await (await caches.open(name)).keys()) aus.push(`${name.replace(/-v[a-z0-9]+$/, '')} ${new URL(r.url).pathname}`);
    return aus;
  });
  expect(vorrat).toEqual(
    expect.arrayContaining([
      `igmg-lernapp-kurse /lern-app/de/${KURS}/ueben`,
      `igmg-lernapp-kurse /lern-app/de/${KURS}`,
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

test('Stufe offline speichern ist abbrechbar: Speicherbedarf vorher, Abbrechen, Gespeichertes bleibt', async ({ page, context }, info) => {
  test.setTimeout(120_000);
  const tastatur = info.project.name === 'desktop';
  await page.goto(`/lern-app/de/${KURS}`);
  await swSteuert(page);
  const v = (await page.evaluate(async (k) => (await fetch(`/lern-app/pakete/${k}`)).json(), KURS)) as Verzeichnis;
  const a1 = v.einheiten.filter((e) => e.stufe === 'a1');
  const stufe = page.locator('section[aria-labelledby="stufe-a1"] [data-stufe-offline]');
  // Speicherbedarf vorher: alle Einheiten der Stufe samt MB
  await expect(stufe).toContainText(bisMb(de.lernpfad.stufeOfflineText, { anzahl: a1.length }));
  await expect(stufe).toContainText(/\d+,\d MB\)/);
  // Pakete langsam ausliefern (auch die Anfragen des Workers), damit der Abbruch mitten im Speichern liegt
  await context.route(`**/lern-app/pakete/${KURS}/*/*`, async (route) => {
    await new Promise((weiter) => setTimeout(weiter, 1_500));
    await route.continue().catch(() => undefined);
  });
  await druecke(
    page,
    stufe.getByRole('button', { name: formatiere(de.lernpfad.stufeOffline, { stufe: 'A1' }, 'de'), exact: true }),
    tastatur,
  );
  const abbrechen = stufe.getByRole('button', { name: de.lernpfad.stufeOfflineAbbrechen, exact: true });
  await expect(abbrechen).toBeVisible();
  await expect(
    stufe.getByRole('progressbar', { name: formatiere(de.lernpfad.stufeOfflineFortschritt, { stufe: 'A1' }, 'de') }),
  ).toBeVisible();
  // Tastatur: der Fokus liegt auf „abbrechen“
  if (tastatur) await expect(abbrechen).toBeFocused();
  await druecke(page, abbrechen, tastatur);
  await expect(stufe.locator('p[role="status"]')).toHaveText(de.lernpfad.stufeOfflineAbgebrochen);
  // der Knopf ist wieder da, nicht alle Einheiten sind gespeichert
  await expect(stufe.getByRole('button', { name: formatiere(de.lernpfad.stufeOffline, { stufe: 'A1' }, 'de'), exact: true })).toBeVisible();
  const gespeichert = Object.entries(await paketEintraege(page)).filter(([e, offline]) => offline && a1.some((x) => x.schluessel === e));
  expect(gespeichert.length).toBeLessThan(a1.length);
  await context.unrouteAll({ behavior: 'ignoreErrors' });
});

test('Stufe offline speichern, Netz weg: Lektion einer anderen Einheit, Hörübung aus dem Bündel, Wiederholen bis fertig, Fortschritt bleibt', async ({
  page,
  context,
}, info) => {
  test.setTimeout(300_000);
  const tastatur = info.project.name === 'desktop';
  const bedienung = tastatur ? 'tastatur' : 'tippen';
  const lernpfad = `/lern-app/de/${KURS}`;
  await beobachteAudio(page);
  await page.goto(lernpfad);
  await swSteuert(page);
  await page.reload();
  const v = (await page.evaluate(async (k) => (await fetch(`/lern-app/pakete/${k}`)).json(), KURS)) as Verzeichnis;
  const a1 = v.einheiten.filter((e) => e.stufe === 'a1');
  // eine Einheit der Stufe, die weder die Testeinheit ist noch automatisch gespeichert wird (aktuelle und nächste)
  const andere = a1.at(-1)!;
  expect(andere.schluessel).not.toBe(EINHEIT);
  expect(a1.findIndex((e) => e.schluessel === andere.schluessel)).toBeGreaterThan(1);
  await expect(page.locator(`main a[href="${lernpfad}/ueben?l=${LEKTION_1}"]`)).toBeVisible({ timeout: 15_000 });
  expect((await paketEintraege(page))[andere.schluessel]).toBeUndefined();

  const stufe = page.locator('section[aria-labelledby="stufe-a1"] [data-stufe-offline]');
  await expect(stufe).toContainText(bisMb(de.lernpfad.stufeOfflineText, { anzahl: a1.length }));
  await druecke(
    page,
    stufe.getByRole('button', { name: formatiere(de.lernpfad.stufeOffline, { stufe: 'A1' }, 'de'), exact: true }),
    tastatur,
  );
  await expect(stufe).toContainText(bisMb(de.lernpfad.stufeOfflineFertig, { stufe: 'A1' }), { timeout: 120_000 });
  await expect(stufe.locator('p[role="status"]')).toContainText(bisMb(de.lernpfad.stufeOfflineFertig, { stufe: 'A1' }));
  // jede Einheit der Stufe bewusst gespeichert (auch die automatisch geladenen), dauerhaft
  const eintraege = await paketEintraege(page);
  for (const e of a1) expect(eintraege[e.schluessel], e.schluessel).toBe(true);
  // Vorrat: Kursseiten samt Merkzeichen im Kursvorrat, Paket der anderen Einheit, Bündel der Testeinheit
  const vorrat = await vorraete(page);
  const kurse = Object.entries(vorrat).find(([n]) => n.startsWith('igmg-lernapp-kurse-v'))?.[1] ?? [];
  expect(kurse).toEqual(
    expect.arrayContaining([
      lernpfad,
      `${lernpfad}/ueben`,
      `${lernpfad}/wiederholen`,
      `${lernpfad}/tipps`,
      `${lernpfad}?vorrat=vollstaendig`,
    ]),
  );
  expect(vorrat['igmg-lernapp-pakete']).toEqual(expect.arrayContaining([`/lern-app/pakete/${KURS}/${andere.schluessel}/${andere.hash}`]));
  const buendel = a1.find((e) => e.schluessel === EINHEIT)!.audio.map((a) => a.adresse);
  expect(buendel.length).toBeGreaterThan(0);
  expect(vorrat['igmg-lernapp-audio']).toEqual(expect.arrayContaining(buendel));

  const netz = await netzWeg(page, context);

  // Lektion einer anderen Einheit der Stufe (nur durch „Stufe offline speichern“ auf dem Gerät): die erste Aufgabe steht
  await page.goto(`${lernpfad}/ueben?l=${KURS}${andere.schluessel.slice(2)}.l01`);
  await expect(page.locator('main form[data-aufgabe]')).toBeVisible({ timeout: 15_000 });

  // Lektion 1 mit einem Fehler (für die Wiederholung), dann Wiederholen bis „fertig“
  await page.goto(`${lernpfad}/ueben?l=${LEKTION_1}`);
  await spieleLektion1(page, bedienung, { ersteFalsch: true });
  await page.goto(`${lernpfad}/wiederholen`);
  await wiederholeBisFertig(page);

  // Lektion mit Hörübungen: Töne aus dem Bündel im Vorrat
  await spieleTurkisch(page, bedienung, { axe: false });

  // Fortschritt bleibt: Lernpfad (aus dem Vorrat) zeigt beide Lektionen als geschafft
  await page.goto(lernpfad);
  for (const l of [LEKTION_1, `${KURS}.a1.test.l03`])
    await expect(page.locator(`main a[href="${lernpfad}/ueben?l=${l}"]`)).toContainText(`(${de.lernpfad.geschafft})`);
  expect(netz.abgeklemmt.length).toBeGreaterThan(0);

  // wieder online: der Stand ist derselbe
  await netz.zurueck();
  await page.reload();
  for (const l of [LEKTION_1, `${KURS}.a1.test.l03`])
    await expect(page.locator(`main a[href="${lernpfad}/ueben?l=${l}"]`)).toContainText(`(${de.lernpfad.geschafft})`);
});

test('Bauwechsel (G-1): gespeicherte Einheit bleibt ohne Netz spielbar – Lektion und Wiederholen –, der Lernpfad sagt ehrlich, was fehlt', async ({
  page,
  context,
}, info) => {
  test.setTimeout(240_000);
  const tastatur = info.project.name === 'desktop';
  const bedienung = tastatur ? 'tastatur' : 'tippen';
  const lernpfad = `/lern-app/de/${KURS}`;
  await page.goto(lernpfad);
  await swSteuert(page);
  await page.reload();
  await druecke(page, testStation(page).getByRole('button', { name: de.lernpfad.offline }), tastatur);
  await expect(testStation(page).getByText(bisMb(de.lernpfad.offlineFertig)).first()).toBeVisible({ timeout: 60_000 });
  const bau = await page.evaluate(() => new URL(navigator.serviceWorker.controller!.scriptURL).searchParams.get('v'));
  expect(bau).toMatch(/^[a-z0-9]+$/);

  // neuer Bau: der Lern-App-Worker mit neuer Kennung übernimmt (skipWaiting, clients.claim)
  await page.evaluate(() => navigator.serviceWorker.register('/lern-app/sw.js?v=n9aneubau1', { scope: '/lern-app/' }));
  await expect
    .poll(() => page.evaluate(() => navigator.serviceWorker.controller?.scriptURL ?? ''), { timeout: 30_000 })
    .toContain('v=n9aneubau1');
  // seine Hülle ist neu, der Kursvorrat des alten Baus bleibt (Merkzeichen)
  await expect
    .poll(async () => Object.keys(await vorraete(page)).filter((n) => /-(schale|kurse)-v/.test(n)), { timeout: 15_000 })
    .toEqual(expect.arrayContaining([`igmg-lernapp-kurse-v${bau}`, 'igmg-lernapp-schale-vn9aneubau1']));
  expect(Object.keys(await vorraete(page))).not.toContain(`igmg-lernapp-schale-v${bau}`);

  const netz = await netzWeg(page, context);
  // Lernpfad ohne Netz: die Einheit ist gespeichert, aber die Seiten fehlen im Vorrat des neuen Baus – ehrlich gesagt
  await page.goto(lernpfad);
  await expect(testStation(page).getByText(de.lernpfad.offlineUnvollstaendig).first()).toBeVisible({ timeout: 30_000 });
  await expect(testStation(page).getByRole('button', { name: de.lernpfad.offlineErneut, exact: true })).toBeVisible();
  // Lektion und Wiederholen spielbar (Seiten und Programmteile des alten Baus)
  await page.goto(`${lernpfad}/ueben?l=${LEKTION_1}`);
  await spieleLektion1(page, bedienung, { ersteFalsch: true });
  await page.goto(`${lernpfad}/wiederholen`);
  await wiederholeBisFertig(page);
  await netz.zurueck();

  // mit Netz: die nächste Seite bittet um die Hülle – der neue Worker holt den Kurs in seinen Vorrat, der alte geht
  const antwort = await page.evaluate(
    () =>
      new Promise((fertig) => {
        const kanal = new MessageChannel();
        kanal.port1.onmessage = (e) => fertig(e.data);
        navigator.serviceWorker.controller!.postMessage({ art: 'schale', ui: 'de' }, [kanal.port2]);
      }),
  );
  expect(antwort).toEqual({ fertig: true });
  const nachher = await vorraete(page);
  expect(nachher['igmg-lernapp-kurse-vn9aneubau1']).toEqual(
    expect.arrayContaining([lernpfad, `${lernpfad}/ueben`, `${lernpfad}/wiederholen`, `${lernpfad}?vorrat=vollstaendig`]),
  );
  expect(Object.keys(nachher)).not.toContain(`igmg-lernapp-kurse-v${bau}`);

  // wieder ohne Netz: aus dem eigenen Kursvorrat; der Lernpfad zeigt „offline gespeichert“
  const nochmal = await netzWeg(page, context);
  await page.goto(`${lernpfad}/ueben?l=${LEKTION_1}`);
  await spieleLektion1(page, bedienung);
  await page.goto(lernpfad);
  await expect(testStation(page).getByText(bisMb(de.lernpfad.offlineFertig)).first()).toBeVisible({ timeout: 30_000 });
  await expect(page.locator(`main a[href="${lernpfad}/ueben?l=${LEKTION_1}"]`)).toContainText(`(${de.lernpfad.geschafft})`);
  await nochmal.zurueck();
});
