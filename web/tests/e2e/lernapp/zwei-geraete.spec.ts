import { existsSync } from 'node:fs';
import { type BrowserContext, expect, type Page, test } from '@playwright/test';
import pg from 'pg';
import de from '../../../messages/lernapp/de.json';
import { beispielkonten, passwort } from '../hilfen/gemeinde';
import { eigeneAbsenderAdresse } from '../hilfen/konto';
import { KARTE_WASSER, KURS, LEKTION_1, spieleLektion1 } from './hilfen';

/**
 * Zwei Geräte, ein Konto (ADR 0038 Nr. 3–7, AUFTRAG §6 Station 8): zwei Browser-Kontexte melden sich im Scope der Lern-App
 * an, verbinden ihr Lernprofil (Schalter `lernapp_sync`, Einwilligung `lernapp`), bewerten dieselbe Karte unterschiedlich
 * (A richtig, B zuerst daneben) und zeigen nach dem Abgleich denselben Kartenstand – die Bewertungen beider Geräte werden
 * nach (am, gerät, nummer) nachgespielt, keine geht verloren. Braucht `FUNKTION_LERNAPP_SYNC=an` (tests/e2e/LIESMICH.md).
 */

/** Testdaten (G-04): Einwilligung `lernapp` für ein erwachsenes Testkonto, wie sie das Konto später selbst erteilt. */
async function erteileEinwilligung(email: string) {
  if (!process.env.DATABASE_URL && existsSync('.env')) process.loadEnvFile('.env');
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    const { rows } = await client.query<{ id: string }>('select id from "user" where email = $1', [email]);
    const id = rows[0]?.id;
    if (!id) throw new Error(`Testkonto ${email} fehlt`);
    await client.query(
      `insert into konto_einwilligung (benutzer_id, art, text_version, erteilt_von) values ($1, 'lernapp', 'e2e-testdaten', $1)`,
      [id],
    );
  } finally {
    await client.end();
  }
}

async function anmeldenUndVerbinden(context: BrowserContext, konto: { email: string; passwort: string | null }): Promise<Page> {
  const page = await context.newPage();
  await eigeneAbsenderAdresse(page);
  const zurueck = encodeURIComponent('/lern-app/de/einstellungen?konto=verbinden');
  await page.goto(`/lern-app/de/anmelden?weiter=${zurueck}`);
  await page.getByLabel(de.anmelden.email).fill(konto.email);
  await page.locator('#anmelden-passwort').fill(passwort(konto.passwort));
  await page.getByRole('button', { name: de.anmelden.absenden, exact: true }).first().click();
  await expect(page).toHaveURL((u) => u.pathname === '/lern-app/de/einstellungen');
  // Rückkehr setzt das Verbinden fort: neues Profil ohne Fortschritt wird ohne Frage gebunden und gleicht ab
  await expect(page.getByText(de.konto.verbunden)).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText(de.konto.fertig, { exact: true })).toBeVisible();
  return page;
}

async function jetztAbgleichen(page: Page) {
  await page.goto('/lern-app/de/einstellungen');
  const knopf = page.getByRole('button', { name: de.konto.jetzt });
  await expect(knopf).toBeVisible();
  await knopf.click();
  await expect(page.getByText(de.konto.fertig, { exact: true })).toBeVisible({ timeout: 30_000 });
}

async function kartenstandVon(page: Page) {
  return page.evaluate(async (k) => {
    const db = await new Promise<IDBDatabase>((ok, f) => {
      const r = indexedDB.open('igmg-lernapp');
      r.onsuccess = () => ok(r.result);
      r.onerror = () => f(r.error);
    });
    const alle = await new Promise<Record<string, unknown>[]>((ok, f) => {
      const r = db.transaction('karten').objectStore('karten').getAll();
      r.onsuccess = () => ok(r.result as Record<string, unknown>[]);
      r.onerror = () => f(r.error);
    });
    db.close();
    const s = alle.find((x) => x.karte === k);
    if (!s) return null;
    const { profil: _profil, ...rest } = s;
    return rest;
  }, KARTE_WASSER);
}

test('dieselbe Karte auf zwei Geräten unterschiedlich bewertet: nach dem Abgleich gleicher Kartenstand', async ({ browser }, info) => {
  test.skip(info.project.name !== 'desktop', 'einmal je Lauf genügt');
  test.setTimeout(240_000);
  const konten = beispielkonten() as unknown as { gemeinde: { email: string; passwort: string | null } };
  await erteileEinwilligung(konten.gemeinde.email);

  const a = await browser.newContext();
  const b = await browser.newContext();
  try {
    const seiteA = await anmeldenUndVerbinden(a, konten.gemeinde);
    const seiteB = await anmeldenUndVerbinden(b, konten.gemeinde);

    // A: alles richtig; B: die Karte „su/Wasser“ zuerst daneben
    await seiteA.goto(`/lern-app/de/${KURS}/ueben?l=${LEKTION_1}`);
    await spieleLektion1(seiteA, 'tastatur');
    await seiteB.goto(`/lern-app/de/${KURS}/ueben?l=${LEKTION_1}`);
    await spieleLektion1(seiteB, 'tastatur', { ersteFalsch: true });

    // die Karte wird in der Auswahl und in den Paaren bewertet: A gut/gut, B nochmal/gut (Ableitung nach dem Ende)
    for (const s of [seiteA, seiteB])
      await expect.poll(async () => ((await kartenstandVon(s)) as { wiederholungen?: number } | null)?.wiederholungen ?? 0).toBe(2);
    const vorherA = (await kartenstandVon(seiteA)) as { wiederholungen: number; fehler: number } | null;
    const vorherB = (await kartenstandVon(seiteB)) as { wiederholungen: number; fehler: number } | null;
    expect(vorherA).not.toBeNull();
    expect(vorherB).not.toBeNull();
    expect(vorherA).not.toEqual(vorherB);

    await jetztAbgleichen(seiteA);
    await jetztAbgleichen(seiteB);
    await jetztAbgleichen(seiteA);

    const nachA = await kartenstandVon(seiteA);
    const nachB = await kartenstandVon(seiteB);
    expect(nachA).not.toBeNull();
    expect(nachA).toEqual(nachB);
    // die Bewertungen beider Geräte sind nachgespielt, keine geht verloren
    expect(nachA).toMatchObject({ wiederholungen: vorherA!.wiederholungen + vorherB!.wiederholungen });
    // die Startseite beider Geräte zeigt dieselben geschafften Lektionen
    for (const s of [seiteA, seiteB]) {
      await s.goto(`/lern-app/de/${KURS}`);
      await expect(s.locator(`main a[href="/lern-app/de/${KURS}/ueben?l=${LEKTION_1}"]`)).toContainText(`(${de.lernpfad.geschafft})`);
    }
  } finally {
    await a.close();
    await b.close();
  }
});
