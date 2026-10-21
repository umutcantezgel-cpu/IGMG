import { existsSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { expect, type Page, test } from '@playwright/test';
import pg from 'pg';
import kinderTexte from '../../../messages/bereiche/kinder.json';
import unterrichtTexte from '../../../messages/bereiche/unterricht.json';
import de from '../../../messages/lernapp/de.json';
import { beispielkonten, kindAnmelden, leitungAnmelden } from '../hilfen/gemeinde';
import { eigeneAbsenderAdresse } from '../hilfen/konto';
import { KURS, LEKTION_1, spieleLektion1 } from './hilfen';

/**
 * Lehrkraft → Schüler*in → Lehrkraft (Tor L7; L7-02; PLAN §3.1; ADR 0043 Nr. 7/8; KERN 4.0 §5): Die Lehrkraft weist in
 * „Mein Bereich“ eine Lektion der Lern-App zu und schaltet die Bestenliste der Gruppe ein; das Kind sieht die Aufgabe im
 * Schüler-Start, verbindet die Lern-App mit seinem Zugang (Einwilligung der Eltern), lernt die Lektion und gleicht ab –
 * eine Bestenliste sieht es nie. Danach sieht die Lehrkraft „erledigt“ und den Stand der Woche. Dazu das JS-Budget der
 * Lehrkraft-Seite (Mein Bereich ≤ 230 KB, KERN 4.0 §9). Braucht `FUNKTION_LERNAPP_SYNC=an`, `FUNKTION_LERNAPP_GRUPPEN=an`
 * und `FUNKTION_LERNAPP_RANGLISTE=an` beim Bau und beim Lauf (tests/e2e/LIESMICH.md); sonst übersprungen.
 */
const u = unterrichtTexte.de.unterricht.lernapp;
const s = kinderTexte.de.lernweg.lernapp;
const an = (f: string) => ['an', 'true', '1'].includes(String(process.env[f] ?? '').toLowerCase());

/** Testdaten (G-04): Einwilligung `lernapp` der Eltern für ihr Kind, wie sie die Eltern später selbst erteilen. */
async function elternEinwilligung(elternEmail: string, lernendeId: string) {
  if (!process.env.DATABASE_URL && existsSync('.env')) process.loadEnvFile('.env');
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    const { rows } = await client.query<{ id: string }>('select id from "user" where email = $1', [elternEmail]);
    const eltern = rows[0]?.id;
    if (!eltern) throw new Error('Elternkonto fehlt');
    await client.query(
      `insert into konto_einwilligung (lernende_id, art, text_version, erteilt_von) values ($1, 'lernapp', 'e2e-testdaten', $2)`,
      [lernendeId, eltern],
    );
  } finally {
    await client.end();
  }
}

/**
 * JavaScript, das die Seite beim Laden holt, in KB gzip – wie `scripts/lernapp-budget.mjs` (je Datei gzip -9; der
 * Standalone-Server liefert unkomprimiert, die Kompression macht im Betrieb der Proxy).
 */
async function jsKb(page: Page): Promise<number> {
  await page.waitForLoadState('networkidle');
  const adressen = await page.evaluate(() => [
    ...new Set(
      performance
        .getEntriesByType('resource')
        .map((e) => e as PerformanceResourceTiming)
        .filter((e) => e.initiatorType === 'script' || new URL(e.name).pathname.endsWith('.js'))
        .map((e) => e.name),
    ),
  ]);
  let bytes = 0;
  for (const a of adressen) bytes += gzipSync(await (await page.request.get(a)).body(), { level: 9 }).length;
  return bytes / 1024;
}

async function abgleichen(page: Page) {
  await page.goto('/lern-app/de/einstellungen');
  const knopf = page.getByRole('button', { name: de.konto.jetzt });
  await expect(knopf).toBeVisible();
  await knopf.click();
  await expect(page.getByText(de.konto.fertig, { exact: true })).toBeVisible({ timeout: 30_000 });
}

test('Lehrkraft weist zu, Kind lernt ohne Bestenliste, Lehrkraft sieht „erledigt“ (Mein Bereich ≤ 230 KB)', async ({ browser }, info) => {
  test.skip(info.project.name !== 'desktop', 'einmal je Lauf genügt');
  test.skip(
    !['FUNKTION_LERNAPP_SYNC', 'FUNKTION_LERNAPP_GRUPPEN', 'FUNKTION_LERNAPP_RANGLISTE'].every(an),
    'Schalter der Lern-App-Gruppen aus (LIESMICH)',
  );
  test.setTimeout(300_000);
  const z = beispielkonten();
  const gruppe = z.lernplattform.gruppeId;
  const emre = z.lernplattform.kinder.emre;
  await elternEinwilligung(z.eltern.email, emre.id);
  const seite = `/mein-bereich/unterricht/${gruppe}/lern-app`;

  const lehrkraft = await browser.newContext();
  const kind = await browser.newContext();
  try {
    // 1. Lehrkraft: über die Kachel der Gruppe zur Lern-App, Lektion 1 zuweisen, Bestenliste einschalten
    const l = await lehrkraft.newPage();
    await eigeneAbsenderAdresse(l);
    await leitungAnmelden(l, z.lehrkraft);
    await l.goto(`/mein-bereich/unterricht/${gruppe}`);
    await l.locator(`main a[href="${seite}"]`).click();
    await expect(l.getByRole('heading', { level: 1, name: u.titel })).toBeVisible();
    // Budget beim vollständigen Laden der Seite (nicht nach dem Wechsel im Client)
    await l.goto(seite);
    const kb = await jsKb(l);
    console.log(`Mein Bereich, Lehrkraft › Lern-App: JS ${kb.toFixed(1)} KB gzip (Budget 230 KB)`);

    await l.getByLabel(u.zuweisen.einheit, { exact: true }).selectOption(`${KURS}|tr.a1.e01`);
    await l.getByRole('button', { name: u.zuweisen.waehlen }).click();
    await l.getByRole('radio', { name: u.zuweisen.lektion.replace('{nr}', '1'), exact: true }).check();
    await l.getByRole('button', { name: u.zuweisen.knopf }).click();
    await expect(l.getByText(u.ok.zugewiesen, { exact: true })).toBeVisible();
    const zuweisungen = l.locator('#zuweisungen');
    await expect(zuweisungen).toContainText(u.zuweisungen.erledigt.replace('{anzahl}', '0').replace('{gesamt}', '1'));
    await l.getByRole('button', { name: u.bestenliste.einschalten }).click();
    await expect(l.getByText(u.ok.bestenliste, { exact: true })).toBeVisible();
    await expect(l.locator('#bestenliste')).toContainText(u.bestenliste.an);

    // 2. Kind: Aufgabe im Schüler-Start, Lern-App mit dem Zugang verbinden, Lektion lernen, abgleichen
    const k = await kind.newPage();
    await eigeneAbsenderAdresse(k);
    await kindAnmelden(k, z.kind);
    const aufgaben = k.locator('#lern-app');
    await expect(aufgaben.getByRole('heading', { name: s.titel })).toBeVisible();
    await expect(aufgaben).toContainText(s.offen);
    const link = aufgaben.getByRole('link', { name: s.oeffnen });
    await expect(link).toHaveAttribute('href', `/lern-app/de/${KURS}/ueben?l=${LEKTION_1}`);

    await k.goto('/lern-app/de/einstellungen');
    await k.getByRole('button', { name: de.konto.verbinden }).click();
    await expect(k.getByText(de.konto.verbunden)).toBeVisible({ timeout: 30_000 });
    await expect(k.getByText(de.konto.fertig, { exact: true })).toBeVisible();

    await k.goto(`/lern-app/de/${KURS}/ueben?l=${LEKTION_1}`);
    await spieleLektion1(k, 'tastatur');
    await abgleichen(k);

    // Gruppe in der Lern-App: erledigt, aber nie eine Bestenliste und keine Zustimmung (Kind unter 16)
    await k.goto('/lern-app/de/gruppe');
    const zuweisung = k.locator('main li').filter({ hasText: de.gruppe.zuweisungen.oeffnen });
    await expect(zuweisung).toContainText(de.gruppe.zuweisungen.erledigt);
    await expect(k.getByRole('heading', { name: z.lernplattform.gruppe })).toBeVisible();
    await expect(k.getByText(de.gruppe.bestenliste.gruppe)).toHaveCount(0);
    await expect(k.getByText(de.gruppe.zustimmung.titel)).toHaveCount(0);
    await k.goto('/mein-bereich');
    const aufgabe = k.locator('#lern-app li');
    await expect(aufgabe).toContainText(s.erledigt);
    await expect(aufgabe).not.toContainText(s.offen);

    // 3. Lehrkraft: erledigt und Stand der Woche (mit Einwilligung)
    await l.goto(seite);
    await expect(l.locator('#zuweisungen')).toContainText(u.zuweisungen.erledigt.replace('{anzahl}', '1').replace('{gesamt}', '1'));
    const zeile = l.locator('#stand tbody tr').filter({ hasText: emre.name });
    await expect(zeile).toHaveCount(1);
    await expect(zeile).not.toContainText(u.stand.keineEinwilligung);
    // Lerntage 1, XP aus der Lektion (Zahlen nur mit Einwilligung)
    await expect(zeile.locator('td').first()).toHaveText('1');
    await expect(zeile.locator('td').nth(2)).not.toHaveText('0');
    // Budget zuletzt prüfen, damit der Ablauf auch bei einer Überschreitung vollständig belegt ist
    expect(kb).toBeLessThanOrEqual(230);
  } finally {
    await lehrkraft.close();
    await kind.close();
  }
});
