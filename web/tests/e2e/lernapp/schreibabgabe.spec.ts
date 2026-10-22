import { existsSync } from 'node:fs';
import { expect, type Page, test } from '@playwright/test';
import pg from 'pg';
import unterrichtTexte from '../../../messages/bereiche/unterricht.json';
import de from '../../../messages/lernapp/de.json';
import { beispielkonten, kindAnmelden, leitungAnmelden } from '../hilfen/gemeinde';
import { eigeneAbsenderAdresse } from '../hilfen/konto';
import { ernsteBefunde, KURS, liveRegion } from './hilfen';

/**
 * Korrekturweg der Lehrkraft (Tor L5 „Schreibabläufe in E2E“; L5-03; PLAN §3.1, §4.3; ADR 0042 Nr. 11; KERN 4.0 §5):
 * Die Lehrkraft weist Lektion 4 (mit der Schreibaufgabe) zu; das Kind (Einwilligung der Eltern) verbindet die Lern-App mit
 * seinem Zugang, schreibt den Text, prüft ihn und sendet ihn an die Lehrkraft; die Lehrkraft sieht die Abgabe nur in ihrer
 * Gruppe, gibt eine Rückmeldung (Prüfliste, Einstufung ohne Note, Kommentar) zurück; das Kind sieht die Rückmeldung unter
 * „Gruppe“. axe (WCAG 2.2 AA, ernste und kritische Befunde) auf der Übung nach dem Senden, der Korrektur und der Gruppe.
 * Braucht `FUNKTION_LERNAPP_SYNC=an` und `FUNKTION_LERNAPP_GRUPPEN=an` beim Bau und beim Lauf (tests/e2e/LIESMICH.md);
 * sonst übersprungen. Testtexte: neutrale Alltagssätze des Testkurses.
 */
const u = unterrichtTexte.de.unterricht.lernapp;
const s = de.schreibabgabe;
const an = (f: string) => ['an', 'true', '1'].includes(String(process.env[f] ?? '').toLowerCase());
const LEKTION_4 = `${KURS}.a1.e01.l04`;
const TEXT = 'Ben su içiyorum. Kitap yeni.';
const KOMMENTAR = '[Kommentar] Schöne Sätze. Schreibe beim nächsten Mal noch einen dritten Satz.';

/** Testdaten (G-04): Einwilligung `lernapp` der Eltern für ihr Kind – nur, wenn sie noch nicht vorliegt (gruppe.spec.ts). */
async function elternEinwilligung(elternEmail: string, lernendeId: string) {
  if (!process.env.DATABASE_URL && existsSync('.env')) process.loadEnvFile('.env');
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await client.query(
      `insert into konto_einwilligung (lernende_id, art, text_version, erteilt_von)
       select $1, 'lernapp', 'e2e-testdaten', u.id from "user" u
       where u.email = $2 and not exists (
         select 1 from konto_einwilligung e where e.lernende_id = $1 and e.art = 'lernapp' and e.widerrufen_am is null)`,
      [lernendeId, elternEmail],
    );
  } finally {
    await client.end();
  }
}

const ueberschrift = (page: Page, text: string) => expect(page.getByRole('heading', { level: 2, name: text, exact: true })).toBeVisible();

async function waehle(page: Page, name: string) {
  const radio = page.getByRole('radio', { name, exact: true });
  await page.locator('main label').filter({ has: radio }).click();
  await expect(radio).toBeChecked();
}

async function pruefenUndWeiter(page: Page) {
  await page.getByRole('button', { name: de.spieler.pruefen, exact: true }).click();
  await expect(liveRegion(page)).toHaveText(de.spieler.richtig);
  await page.getByRole('button', { name: de.spieler.weiter, exact: true }).click();
}

/** Lektion 4 des Testkurses bis zur Schreibaufgabe (Reihenfolge wie `typen-b.spec.ts`), Sprechen ausgelassen. */
async function bisZumSchreiben(page: Page) {
  const t = de.aufgaben2;
  await ueberschrift(page, t.dialog.anweisung);
  await waehle(page, 'İyiyim, teşekkürler.');
  await pruefenUndWeiter(page);

  await ueberschrift(page, t.geschichte.anweisung);
  for (let i = 0; i < 3; i++) await page.getByRole('button', { name: t.geschichte.weiterLesen, exact: true }).click();
  await waehle(page, 'kitap');
  await page.getByRole('button', { name: t.geschichte.fragePruefen, exact: true }).click();
  await page.getByRole('button', { name: t.geschichte.abschliessen, exact: true }).click();
  await expect(liveRegion(page)).toHaveText(de.spieler.richtig);
  await page.getByRole('button', { name: de.spieler.weiter, exact: true }).click();

  await ueberschrift(page, t.lesenFragen.anweisung);
  await waehle(page, t.lesenFragen.rfn.richtig);
  await waehle(page, 'kitap');
  await pruefenUndWeiter(page);

  await ueberschrift(page, t.grammatikTipp.anweisung);
  await page.getByRole('button', { name: t.grammatikTipp.verstanden, exact: true }).click();

  await ueberschrift(page, t.schriftWahl.grossKlein);
  await waehle(page, 'Ş');
  await pruefenUndWeiter(page);

  await ueberschrift(page, de.sprechen.anweisung);
  await page.getByRole('button', { name: de.sprechen.kannNicht, exact: true }).click();
  await ueberschrift(page, de.schreiben.anweisung);
}

test('Kind sendet einen Text an die Lehrkraft, die Lehrkraft gibt ihn mit Rückmeldung zurück, das Kind sieht sie', async ({
  browser,
}, info) => {
  test.skip(info.project.name !== 'desktop', 'einmal je Lauf genügt');
  test.skip(!['FUNKTION_LERNAPP_SYNC', 'FUNKTION_LERNAPP_GRUPPEN'].every(an), 'Schalter der Lern-App-Gruppen aus (LIESMICH)');
  test.setTimeout(300_000);
  const z = beispielkonten();
  const gruppe = z.lernplattform.gruppeId;
  const emre = z.lernplattform.kinder.emre;
  await elternEinwilligung(z.eltern.email, emre.id);
  const seite = `/mein-bereich/unterricht/${gruppe}/lern-app`;
  const befunde: string[] = [];

  const lehrkraft = await browser.newContext();
  const kind = await browser.newContext();
  try {
    // 1. Lehrkraft weist Lektion 4 (mit der Schreibaufgabe) zu
    const l = await lehrkraft.newPage();
    await eigeneAbsenderAdresse(l);
    await leitungAnmelden(l, z.lehrkraft);
    await l.goto(seite);
    await l.getByLabel(u.zuweisen.einheit, { exact: true }).selectOption(`${KURS}|tr.a1.e01`);
    await l.getByRole('button', { name: u.zuweisen.waehlen }).click();
    await l.getByRole('radio', { name: u.zuweisen.lektion.replace('{nr}', '4'), exact: true }).check();
    await l.getByRole('button', { name: u.zuweisen.knopf }).click();
    await expect(l.getByText(u.ok.zugewiesen, { exact: true })).toBeVisible();
    await expect(l.locator('#abgaben')).toContainText(u.abgaben.leer);

    // 2. Kind: Lern-App mit dem Zugang verbinden, Lektion 4 bis zum Schreiben, Text prüfen und an die Lehrkraft senden
    const k = await kind.newPage();
    await eigeneAbsenderAdresse(k);
    await kindAnmelden(k, z.kind);
    await k.goto('/lern-app/de/einstellungen');
    await k.getByRole('button', { name: de.konto.verbinden }).click();
    await expect(k.getByText(de.konto.verbunden)).toBeVisible({ timeout: 30_000 });

    await k.goto(`/lern-app/de/${KURS}/ueben?l=${LEKTION_4}`);
    await bisZumSchreiben(k);
    await k.getByRole('textbox', { name: de.schreiben.text, exact: true }).fill(TEXT);
    await k.getByRole('button', { name: de.schreiben.pruefen, exact: true }).click();
    await expect(k.getByRole('heading', { level: 3, name: de.schreiben.laengePasst, exact: true })).toBeFocused();
    for (const kriterium of ['aufgabe', 'zusammenhang', 'wortschatz', 'grammatik'] as const)
      await waehle(k, de.schreiben.pruefliste[kriterium].s2);
    const abgabe = k.getByRole('region', { name: s.titel, exact: true });
    await expect(abgabe).toContainText(z.lernplattform.gruppe);
    const anfragen: string[] = [];
    k.on('request', (r) => {
      if (r.url().includes('/api/lernapp/schreiben')) anfragen.push(`${r.method()} ${r.postData() ?? ''}`);
    });
    await abgabe.getByRole('button', { name: s.senden, exact: true }).click();
    await expect(abgabe.getByText(s.gesendet, { exact: true })).toBeVisible();
    await expect(abgabe.getByText(s.gesendet, { exact: true })).toBeFocused();
    expect(anfragen.filter((a) => a.startsWith('POST'))).toHaveLength(1);
    expect(anfragen[0]).toContain(TEXT);
    befunde.push(...(await ernsteBefunde(k, 'Übung nach dem Senden')));
    await k.getByRole('button', { name: de.schreiben.selbst.gut, exact: true }).click();

    // 3. Lehrkraft: Abgabe in der eigenen Gruppe, Rückmeldung mit Prüfliste, Einstufung und Kommentar zurückgeben
    await l.goto(seite);
    const liste = l.locator('#abgaben');
    await expect(liste).toContainText(emre.name);
    await expect(liste).toContainText(u.abgaben.offen);
    await liste.getByRole('link', { name: u.abgaben.oeffnenAria.replace('{name}', emre.name), exact: true }).click();
    const korrektur = l.locator('#korrektur');
    await expect(korrektur).toContainText(TEXT);
    await expect(korrektur).toContainText(u.korrektur.selbst);
    await korrektur
      .getByRole('group', { name: u.korrektur.kriterium.aufgabe, exact: true })
      .getByRole('radio', { name: u.korrektur.stufe.s3, exact: true })
      .check();
    await korrektur
      .getByRole('group', { name: u.korrektur.kriterium.grammatik, exact: true })
      .getByRole('radio', { name: u.korrektur.stufe.s2, exact: true })
      .check();
    await korrektur.getByRole('radio', { name: u.korrektur.einstufungen.unterwegs, exact: true }).check();
    await korrektur.getByLabel(u.korrektur.kommentar, { exact: true }).fill(KOMMENTAR);
    befunde.push(...(await ernsteBefunde(l, 'Korrektur')));
    await korrektur.getByRole('button', { name: u.korrektur.zurueckgeben, exact: true }).click();
    await expect(l.getByText(u.ok.zurueckgegeben, { exact: true })).toBeVisible();
    await expect(l.locator('#abgaben')).toContainText(u.abgaben.zurueckgegeben);

    // 4. Kind: Rückmeldung unter „Gruppe“ (Kommentar, Prüfliste, Einstufung ohne Note)
    await k.goto('/lern-app/de/gruppe');
    const meine = k.getByRole('region', { name: s.liste.titel, exact: true });
    await expect(meine.getByRole('heading', { level: 2, name: s.liste.titel })).toBeVisible();
    await expect(meine).toContainText(s.liste.zurueck);
    await expect(meine).toContainText(TEXT);
    await expect(meine).toContainText(KOMMENTAR);
    await expect(meine).toContainText(s.einstufung.unterwegs);
    // Prüfliste der Lehrkraft: „Aufgabe – sicher“ (die eigene Einschätzung war überall „überwiegend“)
    await expect(meine.locator('dd').filter({ hasText: s.stufe.s3 })).toHaveCount(1);
    befunde.push(...(await ernsteBefunde(k, 'Gruppe mit Rückmeldung')));
    expect(befunde).toEqual([]);
  } finally {
    await lehrkraft.close();
    await kind.close();
  }
});
