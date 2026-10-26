import { existsSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import AxeBuilder from '@axe-core/playwright';
import { type Browser, expect, type Page, test } from '@playwright/test';
import pg from 'pg';
import fehlerTexte from '../../../messages/bereiche/fehlerseiten.json';
import kinderTexte from '../../../messages/bereiche/kinder.json';
import meinBereichTexte from '../../../messages/bereiche/mein-bereich.json';
import unterrichtTexte from '../../../messages/bereiche/unterricht.json';
import de from '../../../messages/lernapp/de.json';
import { beispielkonten, emailAnmelden, kindAnmelden, leitungAnmelden, passwort } from '../hilfen/gemeinde';
import { eigeneAbsenderAdresse } from '../hilfen/konto';
import { ernsteBefunde, KURS, LEKTION_1, liveRegion, spieleLektion1 } from './hilfen';

/**
 * Lehrkraft → Schüler*in → Lehrkraft (Tor L7; L7-02; PLAN §3.1; ADR 0043 Nr. 7/8; KERN 4.0 §5): Die Lehrkraft weist in
 * „Mein Bereich“ eine Lektion der Lern-App zu und schaltet die Bestenliste der Gruppe ein; das Kind sieht die Aufgabe im
 * Schüler-Start, verbindet die Lern-App mit seinem Zugang (Einwilligung der Eltern), lernt die Lektion und gleicht ab –
 * eine Bestenliste sieht es nie. Danach sieht die Lehrkraft „erledigt“ und den Stand der Woche. Dazu das JS-Budget der
 * Lehrkraft-Seite (Mein Bereich ≤ 230 KB, KERN 4.0 §9) und axe mit Daten (KERN 4.0 §8): Lehrkraft-Seite in de/tr/en,
 * Gruppe der Lern-App in de/tr/ar, je bei 390 und 1440 px. Braucht `FUNKTION_LERNAPP_SYNC=an`,
 * `FUNKTION_LERNAPP_GRUPPEN=an` und `FUNKTION_LERNAPP_RANGLISTE=an` beim Bau und beim Lauf (tests/e2e/LIESMICH.md); sonst
 * übersprungen.
 *
 * Danach der Korrekturweg (Tor L5 „Schreibabläufe in E2E“; L5-03; PLAN §4.3; ADR 0042 Nr. 11): Die Lehrkraft weist
 * Lektion 4 (mit der Schreibaufgabe) zu; das Kind schreibt den Text, prüft ihn und sendet ihn an die Lehrkraft – ohne
 * verbundenes Gerät über „Mit meinem Konto prüfen“ (die Abgabe braucht keinen Abgleich); die Lehrkraft gibt eine
 * Rückmeldung (Prüfliste, Einstufung ohne Note) zurück – einen Kommentar an Kinder gibt es nicht, solange D-L16 offen ist
 * (S-L2 M-1: das Feld fehlt, ein Hinweis sagt warum); die Aufsicht derselben Gruppe sieht weder Liste noch Text (ADR 0042
 * „Folgen“); das Kind sieht die Rückmeldung unter „Gruppe“ und löscht seine Abgaben unter „Mein Bereich › Konto“ (S-L2 N-2).
 *
 * Zu Beginn des ersten Ablaufs willigen die Eltern in „Mein Bereich › Meine Kinder“ für ihr Kind in die Lern-App ein (S-L3
 * N-2: Text als Entwurf gekennzeichnet, Einvernehmen); unter „Mein Bereich › Konto“ erteilen und widerrufen sie die eigene
 * Einwilligung „Lern-App“ (EL1) – mit axe auf beiden Seiten.
 * Beide Abläufe teilen Gruppe und Kind und laufen deshalb in dieser Datei nacheinander (nie parallel in zwei Dateien).
 */
const u = unterrichtTexte.de.unterricht.lernapp;
const s = kinderTexte.de.lernweg.lernapp;
const an = (f: string) => ['an', 'true', '1'].includes(String(process.env[f] ?? '').toLowerCase());

const kd = kinderTexte.de.kinder.detail;
const kl = meinBereichTexte.de.meinBereich.konto.lernapp;

/**
 * Eltern in „Mein Bereich“ (S-L3 N-2): Einwilligung „Lern-App mit Konto“ für das Kind erteilen (mit Einvernehmen), dann
 * die eigene Einwilligung „Lern-App“ unter „Konto“ erteilen und widerrufen. Rückgabe: ernste axe-Befunde.
 */
async function elternWilligenEin(browser: Browser, eltern: { email: string; passwort: string | null }, kindId: string) {
  const befunde: string[] = [];
  const kontext = await browser.newContext();
  try {
    const e = await kontext.newPage();
    await eigeneAbsenderAdresse(e);
    await emailAnmelden(e, eltern.email, passwort(eltern.passwort));
    await e.goto(`/mein-bereich/kinder/${kindId}`);
    const karte = e.locator('#einwilligung-lernapp');
    await expect(karte.getByRole('heading', { level: 3, name: kd.einwilligung.lernapp.titel })).toBeVisible();
    await expect(karte).toContainText(kd.einwilligung.lernapp.entwurf);
    befunde.push(...(await ernsteBefunde(e, 'Kind mit Einwilligung Lern-App')));
    await karte.getByLabel(kd.einvernehmen, { exact: true }).check();
    await karte.getByRole('button', { name: kd.erteilenAria.replace('{titel}', kd.einwilligung.lernapp.titel), exact: true }).click();
    await expect(e.locator('#einwilligung-lernapp')).toContainText(kd.ok.erteilt);

    await e.goto('/mein-bereich/konto');
    const lernapp = e.locator('#lern-app');
    await expect(lernapp.getByRole('heading', { level: 2, name: kl.titel, exact: true })).toBeVisible();
    await expect(lernapp).toContainText(kl.entwurf);
    befunde.push(...(await ernsteBefunde(e, 'Konto mit Einwilligung Lern-App')));
    await lernapp.getByLabel(kl.haken, { exact: true }).check();
    await lernapp.getByRole('button', { name: kl.erteilen, exact: true }).click();
    await expect(e.getByText(kl.ok.erteilt, { exact: true })).toBeVisible();
    await expect(e.locator('#lern-app')).toContainText(kl.aktiv);
    await e.locator('#lern-app').getByRole('button', { name: kl.widerrufen, exact: true }).click();
    await expect(e.getByText(kl.ok.widerrufen, { exact: true })).toBeVisible();
    await expect(e.locator('#lern-app')).toContainText(kl.inaktiv);
  } finally {
    await kontext.close();
  }
  return befunde;
}

/**
 * Testdaten (G-04): Einwilligung `lernapp` der Eltern für ihr Kind, wie sie die Eltern selbst erteilen (erster Ablauf über
 * „Mein Bereich“) – nur, wenn sie noch nicht vorliegt (der Korrekturweg läuft auch ohne den ersten Ablauf).
 */
async function elternEinwilligung(elternEmail: string, lernendeId: string) {
  if (!process.env.DATABASE_URL && existsSync('.env')) process.loadEnvFile('.env');
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    const { rows } = await client.query<{ id: string }>('select id from "user" where email = $1', [elternEmail]);
    const eltern = rows[0]?.id;
    if (!eltern) throw new Error('Elternkonto fehlt');
    await client.query(
      `insert into konto_einwilligung (lernende_id, art, text_version, erteilt_von)
       select $1, 'lernapp', 'e2e-testdaten', $2
       where not exists (select 1 from konto_einwilligung where lernende_id = $1 and art = 'lernapp' and widerrufen_am is null)`,
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

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

/** axe (WCAG 2.2 AA) bei 390 und 1440 px; gezählt werden ernste und kritische Befunde, als lesbare Zeilen. */
async function axeBeideBreiten(page: Page, kennzeichen: string): Promise<string[]> {
  const befunde: string[] = [];
  const vorher = page.viewportSize();
  for (const breite of [390, 1440]) {
    await page.setViewportSize({ width: breite, height: 900 });
    const ergebnis = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
    for (const v of ergebnis.violations)
      if (v.impact === 'serious' || v.impact === 'critical')
        befunde.push(
          `${kennzeichen} ${breite}px ${v.id} (${v.impact}): ${v.nodes
            .slice(0, 3)
            .map((n) => n.target.join(' '))
            .join(' ; ')}`,
        );
  }
  if (vorher) await page.setViewportSize(vorher);
  return befunde;
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
  // 0. Eltern willigen in „Mein Bereich“ ein (S-L3 N-2)
  expect(await elternWilligenEin(browser, z.eltern, emre.id)).toEqual([]);
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

    await l.getByLabel(u.zuweisen.einheit, { exact: true }).selectOption(`${KURS}|tr.a1.test`);
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

    // 4. axe mit Daten: Lehrkraft-Seite in de/tr/en, Gruppe der Lern-App (Kind, verbundenes Gerät) in de/tr/ar
    const befunde: string[] = [];
    const lehrkraftSeiten = {
      de: seite,
      tr: `/tr/hesabim/derslerim/${gruppe}/ogrenme-uygulamasi`,
      en: `/en/my-account/teaching/${gruppe}/learning-app`,
    };
    for (const [sprache, pfad] of Object.entries(lehrkraftSeiten)) {
      await l.goto(pfad);
      await expect(l.locator('#zuweisungen')).toBeVisible();
      befunde.push(...(await axeBeideBreiten(l, `Lehrkraft ${sprache}`)));
    }
    for (const ui of ['de', 'tr', 'ar']) {
      await k.goto(`/lern-app/${ui}/gruppe`);
      await expect(k.locator('#zuweisungen')).toBeVisible();
      befunde.push(...(await axeBeideBreiten(k, `Lern-App ${ui}/gruppe`)));
    }
    // Budget und axe zuletzt prüfen, damit der Ablauf auch bei einer Abweichung vollständig belegt ist
    expect(befunde).toEqual([]);
    expect(kb).toBeLessThanOrEqual(230);
  } finally {
    await lehrkraft.close();
    await kind.close();
  }
});

// ——— Korrekturweg (L5-03) ———

const sa = de.schreibabgabe;
const kontoAbgaben = meinBereichTexte.de.meinBereich.konto.abgaben;
const LEKTION_4 = `${KURS}.a1.test.l04`;
const TEXT = 'Ben su içiyorum. Kitap yeni.';
/** Darf nirgends erscheinen: Das Kommentarfeld fehlt bei Kindern (S-L2 M-1). */
const KOMMENTAR = '[Kommentar] Schöne Sätze. Schreibe beim nächsten Mal noch einen dritten Satz.';

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
  // Ohne `lernapp_sync`: Die Abgabe geht mit der Anmeldung der Website, ohne verbundenes Gerät (Gegenprüfung L5-03)
  test.skip(!an('FUNKTION_LERNAPP_GRUPPEN'), 'Schalter der Lern-App-Gruppen aus (LIESMICH)');
  test.setTimeout(300_000);
  const z = beispielkonten();
  const gruppe = z.lernplattform.gruppeId;
  const emre = z.lernplattform.kinder.emre;
  await elternEinwilligung(z.eltern.email, emre.id);
  const seite = `/mein-bereich/unterricht/${gruppe}/lern-app`;
  const befunde: string[] = [];

  const lehrkraft = await browser.newContext();
  const kind = await browser.newContext();
  const aufsicht = await browser.newContext();
  try {
    // 1. Lehrkraft weist Lektion 4 (mit der Schreibaufgabe) zu
    const l = await lehrkraft.newPage();
    await eigeneAbsenderAdresse(l);
    await leitungAnmelden(l, z.lehrkraft);
    await l.goto(seite);
    await l.getByLabel(u.zuweisen.einheit, { exact: true }).selectOption(`${KURS}|tr.a1.test`);
    await l.getByRole('button', { name: u.zuweisen.waehlen }).click();
    await l.getByRole('radio', { name: u.zuweisen.lektion.replace('{nr}', '4'), exact: true }).check();
    await l.getByRole('button', { name: u.zuweisen.knopf }).click();
    await expect(l.getByText(u.ok.zugewiesen, { exact: true })).toBeVisible();
    await expect(l.locator('#abgaben')).toContainText(u.abgaben.leer);

    // 2. Kind: angemeldet, die Lern-App aber nicht mit dem Zugang verbunden; Lektion 4 bis zum Schreiben, Text prüfen,
    //    „Mit meinem Konto prüfen“ (erst jetzt fragt die Übung den Server) und an die Lehrkraft senden
    const k = await kind.newPage();
    await eigeneAbsenderAdresse(k);
    await kindAnmelden(k, z.kind);

    await k.goto(`/lern-app/de/${KURS}/ueben?l=${LEKTION_4}`);
    await bisZumSchreiben(k);
    await k.getByRole('textbox', { name: de.schreiben.text, exact: true }).fill(TEXT);
    await k.getByRole('button', { name: de.schreiben.pruefen, exact: true }).click();
    await expect(k.getByRole('heading', { level: 3, name: de.schreiben.laengePasst, exact: true })).toBeFocused();
    for (const kriterium of ['aufgabe', 'zusammenhang', 'wortschatz', 'grammatik'] as const)
      await waehle(k, de.schreiben.pruefliste[kriterium].s2);
    const abgabe = k.getByRole('region', { name: sa.titel, exact: true });
    await expect(abgabe).toContainText(sa.ohneKonto);
    await abgabe.getByRole('button', { name: sa.kontoPruefen, exact: true }).click();
    await expect(abgabe).toContainText(z.lernplattform.gruppe);
    await expect(abgabe.getByRole('button', { name: sa.senden, exact: true })).toBeFocused();
    const anfragen: string[] = [];
    k.on('request', (r) => {
      if (r.url().includes('/api/lernapp/schreiben')) anfragen.push(`${r.method()} ${r.postData() ?? ''}`);
    });
    await abgabe.getByRole('button', { name: sa.senden, exact: true }).click();
    await expect(abgabe.getByText(sa.gesendet, { exact: true })).toBeVisible();
    await expect(abgabe.getByText(sa.gesendet, { exact: true })).toBeFocused();
    expect(anfragen.filter((a) => a.startsWith('POST'))).toHaveLength(1);
    expect(anfragen[0]).toContain(TEXT);
    befunde.push(...(await ernsteBefunde(k, 'Übung nach dem Senden')));
    await k.getByRole('button', { name: de.schreiben.selbst.gut, exact: true }).click();

    // 3. Lehrkraft: Abgabe in der eigenen Gruppe, Rückmeldung mit Prüfliste und Einstufung zurückgeben – ohne Kommentarfeld,
    //    weil die Abgabe von einem Kind kommt (S-L2 M-1, D-L16 offen)
    await l.goto(seite);
    const liste = l.locator('#abgaben');
    await expect(liste).toContainText(emre.name);
    await expect(liste).toContainText(u.abgaben.offen);
    await liste.getByRole('link', { name: u.abgaben.oeffnenAria.replace('{name}', emre.name), exact: true }).click();
    await expect(l).toHaveURL(/[?&]abgabe=[0-9a-f-]{36}/);
    const abgabeId = new URL(l.url()).searchParams.get('abgabe')!;
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
    await expect(korrektur.getByLabel(u.korrektur.kommentar, { exact: true })).toHaveCount(0);
    await expect(korrektur.getByText(u.korrektur.kommentarKind, { exact: true })).toBeVisible();
    befunde.push(...(await ernsteBefunde(l, 'Korrektur')));
    await korrektur.getByRole('button', { name: u.korrektur.zurueckgeben, exact: true }).click();
    await expect(l.getByText(u.ok.zurueckgegeben, { exact: true })).toBeVisible();
    await expect(l.locator('#abgaben')).toContainText(u.abgaben.zurueckgegeben);

    // 4. Aufsicht derselben Gruppe (ADR 0042 „Folgen“: nur die Lehrkraft der Gruppe sieht den Text): weder die Liste noch
    //    die Abgabe – „nicht gefunden“ wie bei einer erfundenen Adresse (200 als Soft-404 oder 404, wie
    //    mein-bereich-lernen.spec.ts), ohne Text und Kommentar
    const a = await aufsicht.newPage();
    await eigeneAbsenderAdresse(a);
    await leitungAnmelden(a, z.aufsicht);
    for (const pfad of [seite, `${seite}?abgabe=${abgabeId}`]) {
      const antwort = await a.goto(pfad);
      expect([200, 404]).toContain(antwort?.status());
      await expect(a.getByRole('heading', { level: 1, name: fehlerTexte.de.fehlerseiten.nichtGefunden.titel })).toBeVisible();
      await expect(a.locator('body')).not.toContainText(TEXT);
      await expect(a.locator('body')).not.toContainText(KOMMENTAR);
      await expect(a.locator('#abgaben')).toHaveCount(0);
    }

    // 5. Kind: Rückmeldung unter „Gruppe“ (Kommentar, Prüfliste, Einstufung ohne Note); ohne verbundenes Gerät erst nach
    //    „Meine Gruppe anzeigen“
    await k.goto('/lern-app/de/gruppe');
    await k.getByRole('button', { name: de.gruppe.laden, exact: true }).click();
    const meine = k.getByRole('region', { name: sa.liste.titel, exact: true });
    await expect(meine.getByRole('heading', { level: 2, name: sa.liste.titel })).toBeVisible();
    await expect(meine).toContainText(sa.liste.zurueck);
    await expect(meine).toContainText(TEXT);
    await expect(meine).not.toContainText(KOMMENTAR);
    await expect(meine.getByText(sa.liste.kommentar, { exact: true })).toHaveCount(0);
    await expect(meine).toContainText(sa.einstufung.unterwegs);
    // Prüfliste der Lehrkraft: „Aufgabe – sicher“ (die eigene Einschätzung war überall „überwiegend“)
    await expect(meine.locator('dd').filter({ hasText: sa.stufe.s3 })).toHaveCount(1);
    befunde.push(...(await ernsteBefunde(k, 'Gruppe mit Rückmeldung')));

    // 6. Kind: „Mein Bereich › Konto“ zeigt die gespeicherten Schreibabgaben und löscht sie nach Bestätigung (S-L2 N-2,
    //    geht auch ohne den Schalter der Gruppen); danach ist die Liste in der Lern-App leer
    await k.goto('/mein-bereich/konto');
    const konto = k.locator('#schreibabgaben');
    await expect(konto.getByRole('heading', { name: kontoAbgaben.titel })).toBeVisible();
    befunde.push(...(await ernsteBefunde(k, 'Konto mit Schreibabgaben')));
    await konto.getByLabel(kontoAbgaben.bestaetigt, { exact: true }).check();
    await konto.getByRole('button', { name: kontoAbgaben.knopf, exact: true }).click();
    await expect(k.getByText(kontoAbgaben.geloescht, { exact: true })).toBeVisible();
    await k.goto('/lern-app/de/gruppe');
    await k.getByRole('button', { name: de.gruppe.laden, exact: true }).click();
    await expect(k.getByRole('region', { name: sa.liste.titel, exact: true })).toContainText(sa.liste.leer);
    expect(befunde).toEqual([]);
  } finally {
    await lehrkraft.close();
    await kind.close();
    await aufsicht.close();
  }
});
