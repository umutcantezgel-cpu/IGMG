import { existsSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, type Locator, type Page, test } from '@playwright/test';
import ar from '../../../messages/lernapp/ar.json';
import de from '../../../messages/lernapp/de.json';
import { formatiere } from '../../../src/lib/lernapp/format';
import { ernsteBefunde, ergebnisText, liveRegion } from './hilfen';

/**
 * Übungstypen aus L2-02 im Lektionsspieler (PLAN §4, KERN 4.0 §4 und §8): Lektion l04 des Testkurses mit dialog, geschichte,
 * lesen_fragen, grammatik_tipp, schrift_tr bzw. schrift_ar (auch Nachspuren), sprechen und schreiben – auf dem Desktop nur
 * mit der Tastatur, auf dem Telefon per Tippen; Deutsch-Oberfläche mit `tr-aus-de`, arabische Oberfläche (RTL) mit
 * `ar-aus-de`. axe ohne ernste oder kritische Befunde je Übungstyp (Desktop).
 *
 * Sprechen: Mikrofon über das Testgerät von Chromium mit einer synthetischen Tonfolge (keine Sprache); die Spracherkennung
 * läuft im Testbau mit dem Attrappen-Worker (`E2E_ATTRAPPEN=1` beim Bau, `scripts/lernapp-modelle.mjs`) und nur mit dem
 * Schalter `FUNKTION_LERNAPP_SPRECHEN=an`; sonst prüft der Test den Weg ohne Sprachprüfung (eigene Aufnahme, Selbstvergleich).
 * Der Gerätecheck sieht ein ausreichendes Gerät (Arbeitsspeicher und freier Platz sind im Test festgelegt), damit der Ablauf
 * nicht vom Testrechner abhängt; der Rückfall bei zu wenig Speicher hat einen eigenen Test.
 *
 * Testdaten: neutrale Alltagssätze des Testkurses (`drizzle/seeds/lernapp-test.ts`); Arabisch nur als Codepunkt-Escapes.
 */

type Bedienung = 'tastatur' | 'tippen';
type Texte = typeof de;

/** Arabische Testsätze und -wörter des Testkurses (Codepunkt-Escapes wie im Seed). */
const AR = {
  w001: '\u0645\u064E\u0627\u0621',
  w004: '\u0643\u0650\u062A\u064E\u0627\u0628',
  s0001:
    '\u0623\u064E\u0646\u064E\u0627 \u0623\u064E\u0634\u0652\u0631\u064E\u0628\u064F \u0627\u0644\u0652\u0645\u064E\u0627\u0621\u064E.',
  s0007: '\u0628\u0650\u062E\u064E\u064A\u0652\u0631\u064D\u060C \u0634\u064F\u0643\u0652\u0631\u064B\u0627.',
};

/** Synthetische Tonfolge (Grundton mit Obertönen, 0,3 s an / 0,3 s aus) als WAV für das Testmikrofon – keine Sprache. */
function schreibeTon(pfad: string) {
  const rate = 16_000;
  const n = rate * 3;
  const b = Buffer.alloc(44 + n * 2);
  b.write('RIFF', 0);
  b.writeUInt32LE(36 + n * 2, 4);
  b.write('WAVEfmt ', 8);
  b.writeUInt32LE(16, 16);
  b.writeUInt16LE(1, 20);
  b.writeUInt16LE(1, 22);
  b.writeUInt32LE(rate, 24);
  b.writeUInt32LE(rate * 2, 28);
  b.writeUInt16LE(2, 32);
  b.writeUInt16LE(16, 34);
  b.write('data', 36);
  b.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) {
    const t = i / rate;
    const an = Math.floor(t / 0.3) % 2 === 0;
    const f = 180 + 60 * (Math.floor(t / 0.6) % 3);
    const w = (k: number) => Math.sin(2 * Math.PI * k * f * t);
    b.writeInt16LE(an ? Math.round((0.25 * w(1) + 0.12 * w(2) + 0.06 * w(3)) * 32_767) : 0, 44 + i * 2);
  }
  writeFileSync(pfad, b);
}
const TON = join(tmpdir(), `igmg-lernapp-e2e-ton-${process.pid}.wav`);
schreibeTon(TON);

test.use({
  permissions: ['microphone'],
  launchOptions: {
    args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream', `--use-file-for-fake-audio-capture=${TON}`],
  },
});

const an = (w?: string) => ['an', 'true', '1'].includes((w ?? '').trim().toLowerCase());
/** Spracherkennung im Testbau: Schalter an und der Attrappen-Worker liegt bereit (der echte Worker ist ≈ 690 KB). */
const SCHALTER_SPRECHEN = an(process.env.FUNKTION_LERNAPP_SPRECHEN);
const ARBEITER = join(__dirname, '../../../public/lern-app/modelle/sprechen/whisper.worker.mjs');
const ATTRAPPE = existsSync(ARBEITER) && statSync(ARBEITER).size < 100_000;

/** Gerät für den Gerätecheck: 8 GB Arbeitsspeicher, 10 GB frei (bzw. zu wenig Speicher für den Rückfall-Test). */
async function geraet(page: Page, speicherGb = 8) {
  await page.addInitScript((gb) => {
    Object.defineProperty(navigator, 'deviceMemory', { configurable: true, get: () => gb });
    if (navigator.storage) navigator.storage.estimate = async () => ({ quota: 10_000_000_000, usage: 0 });
  }, speicherGb);
}

/** Text als wörtliches Muster für einen regulären Ausdruck. */
const roh = (x: string) => x.replace(/[.*+?^$()|[\]\\{}]/g, '\\$&');

const ueberlauf = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

async function druecke(page: Page, art: Bedienung, knopf: Locator) {
  await expect(knopf).toBeVisible();
  await expect(knopf).toBeEnabled();
  if (art === 'tippen') await knopf.tap();
  else {
    await knopf.focus();
    await page.keyboard.press('Enter');
  }
}

/** Optionsfeld wählen (Tastatur: Leertaste auf dem Feld; Tippen: auf die Beschriftung). */
async function waehle(page: Page, art: Bedienung, radio: Locator) {
  await expect(radio).toBeAttached();
  if (art === 'tippen') await page.locator('main label').filter({ has: radio }).tap();
  else {
    await radio.focus();
    await page.keyboard.press('Space');
  }
  await expect(radio).toBeChecked();
}

/** „Prüfen“ des Spielers (Tastatur: Enter im Optionsfeld schickt das Formular ab), dann „Richtig!“ und „Weiter“. */
async function pruefenUndWeiter(page: Page, art: Bedienung, t: Texte) {
  if (art === 'tippen') await page.getByRole('button', { name: t.spieler.pruefen, exact: true }).tap();
  else await page.keyboard.press('Enter');
  await expect(liveRegion(page)).toHaveText(t.spieler.richtig);
  await weiter(page, art, t);
}

async function weiter(page: Page, art: Bedienung, t: Texte) {
  const knopf = page.getByRole('button', { name: t.spieler.weiter, exact: true });
  await expect(knopf).toBeVisible();
  if (art === 'tippen') await knopf.tap();
  else {
    await expect(knopf).toBeFocused();
    await page.keyboard.press('Enter');
  }
}

const ueberschrift = (page: Page, text: string) => expect(page.getByRole('heading', { level: 2, name: text, exact: true })).toBeVisible();

/** Dialog: Verlauf als Liste (Person A am Zeilenanfang, B eingerückt – in RTL gespiegelt), Antwort als Radiogruppe. */
async function dialog(page: Page, art: Bedienung, t: Texte, antwort: string, rtl: boolean) {
  await ueberschrift(page, t.aufgaben2.dialog.anweisung);
  const zeilen = page.getByRole('list', { name: t.aufgaben2.dialog.verlauf }).getByRole('listitem');
  await expect(zeilen).toHaveCount(2);
  const a = (await zeilen.nth(0).boundingBox())!;
  const b = (await zeilen.nth(1).boundingBox())!;
  if (rtl) expect(a.x + a.width).toBeGreaterThan(b.x + b.width);
  else expect(a.x).toBeLessThan(b.x);
  await expect(page.getByText(formatiere(t.aufgaben2.dialog.duAntwortest, { person: t.aufgaben2.gemeinsam.person.a }, 'de'))).toBeVisible();
  await waehle(page, art, page.getByRole('radio', { name: antwort, exact: true }));
  await pruefenUndWeiter(page, art, t);
}

/** Geschichte: Zeile für Zeile („Weiter lesen“, der Fokus springt auf die neue Zeile), Frage mit sofortiger Rückmeldung. */
async function geschichte(page: Page, art: Bedienung, t: Texte, antwort: string) {
  await ueberschrift(page, t.aufgaben2.geschichte.anweisung);
  const schritte = page.locator('main form ol > li');
  for (let i = 1; i <= 3; i++) {
    await druecke(page, art, page.getByRole('button', { name: t.aufgaben2.geschichte.weiterLesen, exact: true }));
    await expect(schritte).toHaveCount(i + 1);
    await expect(schritte.last()).toBeFocused();
  }
  const radio = page.getByRole('radio', { name: antwort, exact: true });
  await waehle(page, art, radio);
  if (art === 'tippen') await page.getByRole('button', { name: t.aufgaben2.geschichte.fragePruefen, exact: true }).tap();
  else await page.keyboard.press('Enter');
  await expect(schritte.last().getByText(t.aufgaben2.geschichte.richtig, { exact: true })).toBeVisible();
  await expect(liveRegion(page)).toHaveText(t.aufgaben2.geschichte.richtig);
  await expect(page.getByText(t.aufgaben2.geschichte.fertig, { exact: true })).toBeVisible();
  await druecke(page, art, page.getByRole('button', { name: t.aufgaben2.geschichte.abschliessen, exact: true }));
  await expect(liveRegion(page)).toHaveText(t.spieler.richtig);
  await weiter(page, art, t);
}

/** Lesen mit Fragen: unterstrichenes Wort antippen → Glosse (und Ansage); Richtig/Falsch/Steht nicht im Text und Auswahl. */
async function lesen(page: Page, art: Bedienung, t: Texte, glosse: { wort: string; bedeutung: string } | null, auswahl: string) {
  await ueberschrift(page, t.aufgaben2.lesenFragen.anweisung);
  if (glosse) {
    const wort = page.getByRole('button', { name: glosse.wort, exact: true });
    await druecke(page, art, wort);
    await expect(wort).toHaveAttribute('aria-expanded', 'true');
    const kasten = page.locator('main [role="group"]').filter({ hasText: glosse.bedeutung });
    await expect(kasten).toBeVisible();
    await expect(liveRegion(page)).toContainText(glosse.bedeutung);
    await druecke(page, art, kasten.getByRole('button', { name: t.aufgaben2.lesenFragen.glosseSchliessen, exact: true }));
    await expect(kasten).toHaveCount(0);
  }
  await expect(page.getByText(t.aufgaben2.lesenFragen.offen, { exact: true })).toBeVisible();
  await waehle(page, art, page.getByRole('radio', { name: t.aufgaben2.lesenFragen.rfn.richtig, exact: true }));
  await waehle(page, art, page.getByRole('radio', { name: auswahl, exact: true }));
  await expect(page.getByText(t.aufgaben2.lesenFragen.offen, { exact: true })).toHaveCount(0);
  await pruefenUndWeiter(page, art, t);
}

/** Grammatik-Tipp: Karte mit Überschriften und Beispiel in der Zielsprache, „Verstanden – weiter“ ohne Wertung. */
async function tipp(page: Page, art: Bedienung, t: Texte, beispiel: string) {
  await ueberschrift(page, t.aufgaben2.grammatikTipp.anweisung);
  await expect(page.getByRole('heading', { level: 3, name: '[Testtipp]' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 4, name: '[Regel]' })).toBeVisible();
  await expect(page.locator('main article li').filter({ hasText: beispiel })).toBeVisible();
  await druecke(page, art, page.getByRole('button', { name: t.aufgaben2.grammatikTipp.verstanden, exact: true }));
}

/** Nachspuren mit dem Zeiger entlang des grünen Zugs (aus der Geometrie des Pfads, in Bildschirmkoordinaten). */
async function spureNach(page: Page, feld: Locator) {
  await feld.scrollIntoViewIfNeeded();
  for (let zug = 0; zug < 5; zug++) {
    const pfad = feld.locator('path.stroke-gruen-700');
    if (!(await pfad.count())) break;
    const punkte = await pfad.evaluate((p: SVGPathElement) => {
      const m = p.getScreenCTM()!;
      const l = p.getTotalLength();
      return Array.from({ length: 30 }, (_, i) => {
        const q = p.getPointAtLength((l * i) / 29);
        const s = new DOMPoint(q.x, q.y).matrixTransform(m);
        return [s.x, s.y] as const;
      });
    });
    await page.mouse.move(punkte[0]![0], punkte[0]![1]);
    await page.mouse.down();
    for (const [x, y] of punkte.slice(1)) await page.mouse.move(x, y, { steps: 2 });
    await page.mouse.up();
  }
}

/**
 * Sprechen: Sprachprüfung laden (Attrappe), Probelauf, aufnehmen (Testmikrofon), Ergebnis nur als Markierung der Zielwörter;
 * ohne Erkennung (Arabisch, Schalter aus) eigene Aufnahme anhören und selbst bewerten. Die Aufnahme bleibt im Speicher der
 * Seite: keine Anfrage außer GET, Wiedergabe über eine `blob:`-Adresse.
 */
async function sprechen(page: Page, art: Bedienung, t: Texte, { erkennbar, woerter }: { erkennbar: boolean; woerter: number }) {
  await ueberschrift(page, t.sprechen.anweisung);
  const anfragen: string[] = [];
  const merke = (r: { method: () => string; url: () => string }) => anfragen.push(`${r.method()} ${new URL(r.url()).pathname}`);
  page.on('request', merke);
  const mitErkennung = erkennbar && SCHALTER_SPRECHEN && ATTRAPPE;
  const laden = page.getByRole('button', { name: formatiere(t.sprechen.laden, { mb: 95 }, 'de'), exact: true });
  if (!erkennbar) await expect(page.getByText(t.sprechen.arabisch, { exact: true })).toBeVisible();
  if (mitErkennung) {
    await expect(page.getByText(t.sprechen.ladenText, { exact: true })).toBeVisible();
    await druecke(page, art, laden);
    await expect(liveRegion(page)).toHaveText(t.sprechen.bereit, { timeout: 20_000 });
  } else if (erkennbar && SCHALTER_SPRECHEN) {
    // echter Worker im Bau: ohne Sprachprüfung weiter (kein Download von ≈ 95 MB im E2E)
    await druecke(page, art, page.getByRole('button', { name: t.sprechen.ohne, exact: true }));
  }
  await expect(laden).toHaveCount(0);

  await druecke(page, art, page.getByRole('button', { name: t.sprechen.aufnehmen, exact: true }));
  const stopp = page.getByRole('button', { name: t.sprechen.stopp, exact: true });
  await expect(stopp).toBeVisible();
  await expect(page.locator('main form').getByText(t.sprechen.laeuft, { exact: true })).toBeVisible();
  // gut zwei Sekunden Tonfolge aufnehmen (Pegelprüfung: mindestens 0,3 s über dem Rauschboden)
  await page.waitForTimeout(2_200);
  await druecke(page, art, stopp);

  const titel = page.getByRole('heading', { level: 3, name: mitErkennung ? t.sprechen.gut : t.sprechen.selbstVergleich, exact: true });
  await expect(titel).toBeVisible({ timeout: 20_000 });
  await expect(titel).toBeFocused();
  if (mitErkennung) {
    const liste = page.getByRole('list', { name: t.sprechen.wortListe });
    await expect(liste.getByRole('listitem')).toHaveCount(woerter);
    await expect(liste.getByText(t.sprechen.erkannt, { exact: true })).toHaveCount(woerter);
    await expect(page.getByText(t.sprechen.hinweisMarkierung, { exact: true })).toBeVisible();
  } else await expect(page.getByRole('list', { name: t.sprechen.wortListe })).toHaveCount(0);
  await expect(page.locator('main audio')).toHaveAttribute('src', /^blob:/);
  await druecke(page, art, page.getByRole('button', { name: t.sprechen.selbst.gut, exact: true }));
  page.off('request', merke);
  expect(
    anfragen.filter((a) => !a.startsWith('GET ')),
    'Sprechen: nur GET-Anfragen',
  ).toEqual([]);
}

/** Schreiben: Zähler, Pflichtwörter, Prüfung der Länge, Musterantwort, Prüfliste, Selbsteinschätzung (alles lokal). */
async function schreiben(
  page: Page,
  art: Bedienung,
  t: Texte,
  { ui, text, woerter, pflicht, muster }: { ui: 'de' | 'ar'; text: string; woerter: number; pflicht: string; muster: string },
) {
  await ueberschrift(page, t.schreiben.anweisung);
  const feld = page.getByRole('textbox', { name: t.schreiben.text, exact: true });
  await expect(feld).toHaveAttribute('spellcheck', 'true');
  if (art === 'tippen') await feld.fill(text);
  else {
    await feld.focus();
    await page.keyboard.insertText(text);
  }
  // Zähler in der Oberflächensprache (Arabisch je nach Einstellung mit östlichen oder westlichen Ziffern)
  const zaehler = (['oestlich', 'westlich'] as const).map((z) => formatiere(t.schreiben.woerter, { n: woerter, min: 2, max: 30 }, ui, z));
  await expect(page.getByText(new RegExp(`^(?:${zaehler.map(roh).join('|')})$`))).toBeVisible();
  await druecke(page, art, page.getByRole('button', { name: t.schreiben.pruefen, exact: true }));
  const ergebnis = page.getByRole('heading', { level: 3, name: t.schreiben.laengePasst, exact: true });
  await expect(ergebnis).toBeFocused();
  await expect(page.locator('main li').filter({ hasText: pflicht }).getByText(t.schreiben.pflichtDa, { exact: true })).toBeVisible();
  await expect(page.getByText(t.schreiben.muster, { exact: true })).toBeVisible();
  await expect(page.locator('main').getByText(muster, { exact: true })).toBeVisible();
  for (const k of ['aufgabe', 'zusammenhang', 'wortschatz', 'grammatik'] as const)
    await waehle(page, art, page.getByRole('radio', { name: t.schreiben.pruefliste[k].s2, exact: true }));
  await druecke(page, art, page.getByRole('button', { name: t.schreiben.selbst.gut, exact: true }));
}

test.describe('Übungstypen L2-02 – Oberfläche de, Kurs tr-aus-de', () => {
  test('Lektion l04 ganz: dialog, geschichte, lesen_fragen, grammatik_tipp, schrift_tr, sprechen, schreiben', async ({ page }, info) => {
    test.setTimeout(150_000);
    const art: Bedienung = info.project.name === 'desktop' ? 'tastatur' : 'tippen';
    const t = de;
    const befunde: string[] = [];
    const axe = async (name: string) => {
      if (art === 'tastatur') befunde.push(...(await ernsteBefunde(page, `de ${name}`)));
      expect(await ueberlauf(page), `${name}: Überlauf`).toBe(0);
    };
    await geraet(page);
    await page.goto('/lern-app/de/tr-aus-de/ueben?l=tr-aus-de.a1.e01.l04');
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');

    await ueberschrift(page, t.aufgaben2.dialog.anweisung);
    await axe('dialog');
    await dialog(page, art, t, 'İyiyim, teşekkürler.', false);

    await ueberschrift(page, t.aufgaben2.geschichte.anweisung);
    await axe('geschichte');
    await geschichte(page, art, t, 'kitap');

    await ueberschrift(page, t.aufgaben2.lesenFragen.anweisung);
    await axe('lesen_fragen');
    await lesen(page, art, t, { wort: 'Ev', bedeutung: 'Haus' }, 'kitap');

    await ueberschrift(page, t.aufgaben2.grammatikTipp.anweisung);
    await axe('grammatik_tipp');
    await tipp(page, art, t, 'Su içiyorum.');

    await ueberschrift(page, t.aufgaben2.schriftWahl.grossKlein);
    await axe('schrift_tr');
    await expect(page.locator('main p').filter({ hasText: /^ş$/ })).toBeVisible();
    await waehle(page, art, page.getByRole('radio', { name: 'Ş', exact: true }));
    await pruefenUndWeiter(page, art, t);

    await ueberschrift(page, t.sprechen.anweisung);
    await axe('sprechen');
    await sprechen(page, art, t, { erkennbar: true, woerter: 2 });

    await ueberschrift(page, t.schreiben.anweisung);
    await axe('schreiben');
    await schreiben(page, art, t, { ui: 'de', text: 'Ben su içiyorum. Kitap yeni.', woerter: 5, pflicht: 'su', muster: 'Su içiyorum.' });

    await expect(page.getByRole('heading', { name: t.spieler.fertigTitel })).toBeVisible();
    // gewertet: alle außer dem Tipp (ohne Wertung)
    await expect(page.getByText(ergebnisText(6, 6), { exact: true })).toBeVisible();
    expect(befunde).toEqual([]);
  });
});

test.describe('Übungstypen L2-02 – Oberfläche ar (RTL), Kurs ar-aus-de', () => {
  test('Lektion l04 ganz: dialog und geschichte gespiegelt, schrift_ar erkennen und nachspuren, sprechen ohne Rückmeldung', async ({
    page,
  }, info) => {
    test.setTimeout(150_000);
    const art: Bedienung = info.project.name === 'desktop' ? 'tastatur' : 'tippen';
    const t = ar as unknown as Texte;
    const befunde: string[] = [];
    const axe = async (name: string) => {
      if (art === 'tastatur') befunde.push(...(await ernsteBefunde(page, `ar ${name}`)));
      expect(await ueberlauf(page), `${name}: Überlauf`).toBe(0);
    };
    await geraet(page);
    await page.goto('/lern-app/ar/ar-aus-de/ueben?l=ar-aus-de.a1.e01.l04');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');

    await ueberschrift(page, t.aufgaben2.dialog.anweisung);
    await axe('dialog');
    await dialog(page, art, t, AR.s0007, true);

    await ueberschrift(page, t.aufgaben2.geschichte.anweisung);
    await axe('geschichte');
    await geschichte(page, art, t, AR.w004);

    // Glossen im arabischen Text: die Wörter stehen mit Artikel, die Glossen gelten der Grundform (Inhalte ab L3)
    await lesen(page, art, t, null, AR.w004);
    await tipp(page, art, t, AR.s0001);

    // schrift_ar erkennen: Glyphe mit neutraler Beschriftung, Antworten sind Buchstabennamen
    await ueberschrift(page, t.aufgaben2.schriftAr.erkennen);
    await expect(page.getByRole('img', { name: t.aufgaben2.schriftAr.zeichen, exact: true })).toBeVisible();
    await axe('schrift_ar erkennen');
    await waehle(page, art, page.getByRole('radio', { name: t.aufgaben2.schriftAr.namen.be, exact: true }));
    await pruefenUndWeiter(page, art, t);

    // schrift_ar nachspuren: Desktop mit dem Zeiger, Telefon „auf Papier geschrieben“ (Ziehen ist nie nötig)
    await ueberschrift(page, t.aufgaben2.schriftAr.nachspuren);
    const feld = page.getByRole('img', {
      name: formatiere(t.aufgaben2.schriftAr.zeichenfeld, { name: t.aufgaben2.schriftAr.namen.elif }, 'ar'),
      exact: true,
    });
    await expect(feld).toBeVisible();
    await axe('schrift_ar nachspuren');
    if (art === 'tastatur') {
      await spureNach(page, feld);
      await expect(page.getByText(t.aufgaben2.schriftAr.geschafft, { exact: true })).toBeVisible();
      await expect(liveRegion(page)).toHaveText(t.spieler.richtig);
      await weiter(page, art, t);
    } else {
      await druecke(page, art, page.getByRole('button', { name: t.aufgaben2.schriftAr.papier, exact: true }));
      await expect(liveRegion(page)).toHaveText(t.spieler.richtig);
      await weiter(page, art, t);
    }

    // sprechen: Arabisch ohne automatische Rückmeldung; Telefon: „Ich kann gerade nicht sprechen“ überspringt ohne Wertung
    await ueberschrift(page, t.sprechen.anweisung);
    await axe('sprechen');
    if (art === 'tastatur') await sprechen(page, art, t, { erkennbar: false, woerter: 3 });
    else {
      await expect(page.getByText(t.sprechen.arabisch, { exact: true })).toBeVisible();
      await druecke(page, art, page.getByRole('button', { name: t.sprechen.kannNicht, exact: true }));
    }

    await schreiben(page, art, t, { ui: 'ar', text: `${AR.w001} ${AR.s0001}`, woerter: 4, pflicht: AR.w001, muster: AR.s0001 });
    await expect(page.getByRole('heading', { name: t.spieler.fertigTitel })).toBeVisible();
    expect(befunde).toEqual([]);
  });
});

test.describe('Sprechen: Rückfall und Grenzen', () => {
  test('zu wenig Arbeitsspeicher: kein Download-Angebot, Hinweis mit Grund, eigene Aufnahme bleibt möglich', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'einmal genügt');
    test.skip(!SCHALTER_SPRECHEN, 'Schalter lernapp_sprechen ist im Testbau aus');
    test.setTimeout(120_000);
    const t = de;
    await geraet(page, 2);
    await page.goto('/lern-app/de/tr-aus-de/ueben?l=tr-aus-de.a1.e01.l04');
    await dialog(page, 'tastatur', t, 'İyiyim, teşekkürler.', false);
    await geschichte(page, 'tastatur', t, 'kitap');
    await lesen(page, 'tastatur', t, null, 'kitap');
    await tipp(page, 'tastatur', t, 'Su içiyorum.');
    await waehle(page, 'tastatur', page.getByRole('radio', { name: 'Ş', exact: true }));
    await pruefenUndWeiter(page, 'tastatur', t);
    await ueberschrift(page, t.sprechen.anweisung);
    await expect(page.getByText(t.sprechen.nichtVerfuegbar, { exact: true })).toBeVisible();
    await expect(page.getByText(t.sprechen.geraet.speicher, { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: formatiere(t.sprechen.laden, { mb: 95 }, 'de'), exact: true })).toHaveCount(0);
    await expect(page.getByRole('button', { name: t.sprechen.aufnehmen, exact: true })).toBeEnabled();
    await druecke(page, 'tastatur', page.getByRole('button', { name: t.sprechen.kannNicht, exact: true }));
    await ueberschrift(page, t.schreiben.anweisung);
  });

  test('Mikrofon nur auf …/ueben und …/wiederholen; Modelldateien vom eigenen Ursprung mit den Kopfzeilen der Lern-App', async ({
    request,
  }, info) => {
    test.skip(info.project.name !== 'desktop', 'Kopfzeilen sind geräteunabhängig');
    for (const [pfad, mikrofon] of [
      ['/lern-app/de', false],
      ['/lern-app/de/tr-aus-de', false],
      ['/lern-app/de/tr-aus-de/ueben', true],
      ['/lern-app/ar/ar-aus-de/wiederholen', true],
    ] as const) {
      const r = await request.get(pfad);
      expect(r.status(), pfad).toBe(200);
      expect(r.headers()['permissions-policy'], pfad).toContain(mikrofon ? 'microphone=(self)' : 'microphone=()');
    }
    const kopf = async (pfad: string) => {
      const r = await request.head(pfad);
      return { status: r.status(), h: r.headers() };
    };
    const arbeiter = await kopf('/lern-app/modelle/sprechen/whisper.worker.mjs?v=e2e');
    expect(arbeiter.status).toBe(200);
    expect(arbeiter.h['content-type']).toMatch(/javascript/);
    expect(arbeiter.h['content-security-policy']).toContain("'wasm-unsafe-eval'");
    expect(arbeiter.h['cross-origin-embedder-policy']).toBe('require-corp');
    const wasm = await kopf('/lern-app/modelle/ort-1.31.0-dev.20260914-8d85527a0/ort-wasm-simd-threaded.wasm');
    expect(wasm.status).toBe(200);
    expect(wasm.h['content-type']).toBe('application/wasm');
    const modell = await kopf('/lern-app/modelle/whisper-base-64da572/onnx/encoder_model_quantized.onnx');
    expect(modell.status).toBe(200);
    expect(modell.h['cache-control']).toContain('immutable');
    expect((await kopf('/lern-app/modelle/ort-1.31.0-dev.20260914-8d85527a0/ort-wasm-simd-threaded.asyncify.wasm')).status).toBe(404);
    // Lizenztexte neben den Gewichten (ADR 0042 Nr. 3, Fortschreibung Nr. 11) und die Spracherkennung auf der Seite „Quellen“
    for (const [datei, kennung] of [
      ['LIZENZ-whisper-MIT.txt', 'Copyright (c) 2022 OpenAI'],
      ['LIZENZ-Apache-2.0.txt', 'Apache License'],
    ] as const) {
      const r = await request.get(`/lern-app/modelle/whisper-base-64da572/${datei}`);
      expect(r.status(), datei).toBe(200);
      expect(await r.text(), datei).toContain(kennung);
    }
    const quellen = await (await request.get('/lern-app/de/quellen')).text();
    for (const name of ['Transformers.js', 'ONNX Runtime Web', 'Whisper (base)', 'Apache License 2.0', de.quellen.spracherkennungTitel])
      expect(quellen, name).toContain(name);
  });
});
