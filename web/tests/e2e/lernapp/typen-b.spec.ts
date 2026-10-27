import { existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { expect, type Locator, type Page, test } from '@playwright/test';
import ar from '../../../messages/lernapp/ar.json';
import de from '../../../messages/lernapp/de.json';
import { entscheide } from '../../../src/lib/funktionen-regeln';
import { formatiere } from '../../../src/lib/lernapp/format';
import { ernsteBefunde, ergebnisText, liveRegion } from './hilfen';
import { MIKROFON } from './ton';

/**
 * Übungstypen aus L2-02 im Lektionsspieler (PLAN §4, KERN 4.0 §4 und §8): Lektion l04 des Testkurses mit dialog, geschichte,
 * lesen_fragen, grammatik_tipp, schrift_tr bzw. schrift_ar (auch Nachspuren), sprechen und schreiben – auf dem Desktop nur
 * mit der Tastatur, auf dem Telefon per Tippen; Deutsch-Oberfläche mit `tr-aus-de`, arabische Oberfläche (RTL) mit
 * `ar-aus-de`. axe ohne ernste oder kritische Befunde je Übungstyp auf beiden Breiten (seit Stufe C N9b auch auf dem Telefon).
 *
 * Sprechen: Mikrofon über das Testgerät von Chromium mit einer synthetischen Tonfolge (keine Sprache); die Spracherkennung
 * läuft im Testbau mit dem Attrappen-Worker (`E2E_ATTRAPPEN=1` beim Bau, `scripts/lernapp-modelle.mjs`). Der Schalter
 * `lernapp_sprechen` ist seit L3-E23 (27.10.2026) auch in der Produktion standardmäßig an; der Test liest ihn wie der Bau
 * (Umgebung, sonst Standard) und prüft nur bei `FUNKTION_LERNAPP_SPRECHEN=aus` den Weg ohne Angebot. Mit dem echten Worker
 * (ohne Attrappe) wählt er „Ohne Sprachprüfung üben“ (kein Download von ≈ 95 MB im E2E).
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

test.use(MIKROFON());

/**
 * Spracherkennung im Testbau: Schalter wie beim Bau entschieden (Umgebung, sonst Standard – in der Produktion an seit L3-E23;
 * die Einstellung „funktionen“ setzt der E2E-Seed nicht) und der Attrappen-Worker liegt bereit (der echte ist ≈ 690 KB).
 */
const SCHALTER_SPRECHEN = entscheide('lernapp_sprechen', process.env, null);
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

/**
 * Geschichte: Zeile für Zeile („Weiter lesen“, der Fokus springt auf die neue Zeile), dann der Rest des Abschnitts auf
 * einmal („Bis zur nächsten Frage lesen“, L4-03: Fokus auf die erste neue Zeile, Stand „Zeile n von m“), Frage mit
 * sofortiger Rückmeldung.
 */
async function geschichte(page: Page, art: Bedienung, t: Texte, antwort: string, ui: 'de' | 'ar') {
  await ueberschrift(page, t.aufgaben2.geschichte.anweisung);
  const schritte = page.locator('main form ol > li');
  const stand = (n: number) => page.getByText(formatiere(t.ansichten.geschichte.stand, { n, gesamt: 3 }, ui), { exact: true });
  await expect(stand(1)).toBeVisible();
  await druecke(page, art, page.getByRole('button', { name: t.aufgaben2.geschichte.weiterLesen, exact: true }));
  await expect(schritte).toHaveCount(2);
  await expect(schritte.last()).toBeFocused();
  await expect(stand(2)).toBeVisible();
  // Rest des Abschnitts: die dritte Zeile und die Frage danach
  await druecke(page, art, page.getByRole('button', { name: t.ansichten.geschichte.bisZurFrage, exact: true }));
  await expect(schritte).toHaveCount(4);
  await expect(schritte.nth(2)).toBeFocused();
  await expect(stand(3)).toBeVisible();
  await expect(page.getByRole('button', { name: t.ansichten.geschichte.bisZurFrage, exact: true })).toHaveCount(0);
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

/**
 * Lesen mit Fragen: unterstrichenes Wort antippen → Glosse (und Ansage); schließen mit Escape (Tastatur) bzw. „Schließen“
 * (Tippen), der Fokus kehrt auf das Wort zurück (L4-03). Das Glossar unter dem Text nennt alle Wörter mit Bedeutung.
 * Dann Richtig/Falsch/Steht nicht im Text und Auswahl.
 */
async function lesen(
  page: Page,
  art: Bedienung,
  t: Texte,
  glosse: { wort: string; bedeutung: string } | null,
  auswahl: string,
  { ui, glossen }: { ui: 'de' | 'ar'; glossen: number },
) {
  await ueberschrift(page, t.aufgaben2.lesenFragen.anweisung);
  if (glosse) {
    const wort = page.getByRole('button', { name: glosse.wort, exact: true });
    await druecke(page, art, wort);
    await expect(wort).toHaveAttribute('aria-expanded', 'true');
    const kasten = page.locator('main [role="group"]').filter({ hasText: glosse.bedeutung });
    await expect(kasten).toBeVisible();
    await expect(wort).toHaveAttribute('aria-controls', (await kasten.getAttribute('id'))!);
    await expect(liveRegion(page)).toContainText(glosse.bedeutung);
    if (art === 'tastatur') await page.keyboard.press('Escape');
    else await druecke(page, art, kasten.getByRole('button', { name: t.aufgaben2.lesenFragen.glosseSchliessen, exact: true }));
    await expect(kasten).toHaveCount(0);
    await expect(wort).toBeFocused();
    await expect(wort).toHaveAttribute('aria-expanded', 'false');
  }
  // Glossar: aufklappbar, alle Wörter mit Bedeutung
  const glossar = page.locator('main details').filter({ hasText: formatiere(t.ansichten.lesen.woerter, { n: glossen }, ui) });
  await druecke(page, art, glossar.locator('summary'));
  await expect(glossar.locator('dt')).toHaveCount(glossen);
  if (glosse) await expect(glossar.locator('dd').filter({ hasText: glosse.bedeutung })).toBeVisible();
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
 * Ohne Sprachprüfung weiter, wo der Test nicht der Erkennung gilt (de/tr, ausreichendes Gerät): Mit dem Schalter an
 * (Standard seit L3-E23) erscheint das Angebot erst nach dem Gerätecheck – abwarten und „Ohne Sprachprüfung üben“ wählen
 * statt nur zu klicken, wenn es zufällig schon da ist. Danach kein Download-Angebot mehr.
 */
async function ohneSprachpruefung(page: Page, art: Bedienung, t: Texte) {
  if (SCHALTER_SPRECHEN) await druecke(page, art, page.getByRole('button', { name: t.sprechen.ohne, exact: true }));
  await expect(page.getByRole('button', { name: formatiere(t.sprechen.laden, { mb: 95 }, 'de'), exact: true })).toHaveCount(0);
}

/**
 * Sprechen: Sprachprüfung laden (Attrappe), Probelauf, aufnehmen (Testmikrofon), Ergebnis nur als Markierung der Zielwörter;
 * mit dem echten Worker „Ohne Sprachprüfung üben“; ohne Erkennung (Arabisch, Schalter aus) eigene Aufnahme anhören und
 * selbst bewerten. Die Aufnahme bleibt im Speicher der
 * Seite: keine Anfrage außer GET, Wiedergabe über eine `blob:`-Adresse.
 */
async function sprechen(page: Page, art: Bedienung, t: Texte, { erkennbar, woerter }: { erkennbar: boolean; woerter: number }) {
  await ueberschrift(page, t.sprechen.anweisung);
  // alle Anfragen des Kontexts (Seite, Worker, Service Worker) mit Methode und Ursprung (Stufe C N9b)
  const ursprung = new URL(page.url()).origin;
  const anfragen: string[] = [];
  const merke = (r: { method: () => string; url: () => string }) => {
    const u = new URL(r.url());
    anfragen.push(`${r.method()} ${['blob:', 'data:'].includes(u.protocol) ? u.protocol : u.origin}${u.pathname}`);
  };
  page.context().on('request', merke);
  const mitErkennung = erkennbar && SCHALTER_SPRECHEN && ATTRAPPE;
  const laden = page.getByRole('button', { name: formatiere(t.sprechen.laden, { mb: 95 }, 'de'), exact: true });
  if (!erkennbar) await expect(page.getByText(t.sprechen.arabisch, { exact: true })).toBeVisible();
  if (mitErkennung) {
    await expect(page.getByText(t.sprechen.ladenText, { exact: true })).toBeVisible();
    await druecke(page, art, laden);
    await expect(liveRegion(page)).toHaveText(t.sprechen.bereit, { timeout: 20_000 });
  } else if (erkennbar) {
    // echter Worker im Bau: ohne Sprachprüfung weiter (kein Download von ≈ 95 MB im E2E)
    await ohneSprachpruefung(page, art, t);
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
  page.context().off('request', merke);
  expect(
    anfragen.filter((a) => !a.startsWith('GET ')),
    'Sprechen: nur GET-Anfragen',
  ).toEqual([]);
  expect(
    anfragen.filter((a) => !a.startsWith(`GET ${ursprung}/`) && !/^GET (blob|data):/.test(a)),
    'Sprechen: nur der eigene Ursprung',
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
      befunde.push(...(await ernsteBefunde(page, `de ${art} ${name}`)));
      expect(await ueberlauf(page), `${name}: Überlauf`).toBe(0);
    };
    await geraet(page);
    await page.goto('/lern-app/de/tr-aus-de/ueben?l=tr-aus-de.a1.test.l04');
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');

    await ueberschrift(page, t.aufgaben2.dialog.anweisung);
    await axe('dialog');
    await dialog(page, art, t, 'İyiyim, teşekkürler.', false);

    await ueberschrift(page, t.aufgaben2.geschichte.anweisung);
    await axe('geschichte');
    await geschichte(page, art, t, 'kitap', 'de');

    await ueberschrift(page, t.aufgaben2.lesenFragen.anweisung);
    await axe('lesen_fragen');
    await lesen(page, art, t, { wort: 'Ev', bedeutung: 'Haus' }, 'kitap', { ui: 'de', glossen: 2 });

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
      befunde.push(...(await ernsteBefunde(page, `ar ${art} ${name}`)));
      expect(await ueberlauf(page), `${name}: Überlauf`).toBe(0);
    };
    await geraet(page);
    await page.goto('/lern-app/ar/ar-aus-de/ueben?l=ar-aus-de.a1.test.l04');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');

    await ueberschrift(page, t.aufgaben2.dialog.anweisung);
    await axe('dialog');
    await dialog(page, art, t, AR.s0007, true);

    await ueberschrift(page, t.aufgaben2.geschichte.anweisung);
    await axe('geschichte');
    await geschichte(page, art, t, AR.w004, 'ar');

    // Glossen im arabischen Text: die Wörter stehen mit Artikel, die Glossen gelten der Grundform (Inhalte ab L3)
    await ueberschrift(page, t.aufgaben2.lesenFragen.anweisung);
    await axe('lesen_fragen');
    await lesen(page, art, t, null, AR.w004, { ui: 'ar', glossen: 2 });
    await ueberschrift(page, t.aufgaben2.grammatikTipp.anweisung);
    await axe('grammatik_tipp');
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

    await ueberschrift(page, t.schreiben.anweisung);
    await axe('schreiben');
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
    await page.goto('/lern-app/de/tr-aus-de/ueben?l=tr-aus-de.a1.test.l04');
    await dialog(page, 'tastatur', t, 'İyiyim, teşekkürler.', false);
    await geschichte(page, 'tastatur', t, 'kitap', 'de');
    await lesen(page, 'tastatur', t, null, 'kitap', { ui: 'de', glossen: 2 });
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

  test('Fokus bleibt nach „zu leise“ und „kein Mikrofon“ (Stufe C, WCAG 2.4.3)', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'einmal genügt');
    test.setTimeout(120_000);
    const t = de;
    await geraet(page);
    // erste Aufnahme: stummer Strom (Oszillator mit Lautstärke 0) → „zu leise“; danach verweigert der Browser das Mikrofon
    await page.addInitScript(() => {
      let aufrufe = 0;
      navigator.mediaDevices.getUserMedia = async () => {
        aufrufe += 1;
        if (aufrufe > 1) throw new DOMException('verweigert', 'NotAllowedError');
        const ctx = new AudioContext();
        const ton = ctx.createOscillator();
        const stumm = ctx.createGain();
        stumm.gain.value = 0;
        const ziel = ctx.createMediaStreamDestination();
        ton.connect(stumm).connect(ziel);
        ton.start();
        return ziel.stream;
      };
    });
    await page.goto('/lern-app/de/tr-aus-de/ueben?l=tr-aus-de.a1.test.l04');
    await dialog(page, 'tastatur', t, 'İyiyim, teşekkürler.', false);
    await geschichte(page, 'tastatur', t, 'kitap', 'de');
    await lesen(page, 'tastatur', t, null, 'kitap', { ui: 'de', glossen: 2 });
    await tipp(page, 'tastatur', t, 'Su içiyorum.');
    await waehle(page, 'tastatur', page.getByRole('radio', { name: 'Ş', exact: true }));
    await pruefenUndWeiter(page, 'tastatur', t);
    await ueberschrift(page, t.sprechen.anweisung);
    await ohneSprachpruefung(page, 'tastatur', t);
    const aufnehmen = page.getByRole('button', { name: t.sprechen.aufnehmen, exact: true });
    await druecke(page, 'tastatur', aufnehmen);
    const stopp = page.getByRole('button', { name: t.sprechen.stopp, exact: true });
    await expect(stopp).toBeFocused();
    await page.waitForTimeout(1_500);
    await page.keyboard.press('Enter');
    // „zu leise“: „Aufnahme beenden“ verschwindet, der Fokus steht wieder auf „Aufnehmen“
    await expect(liveRegion(page)).toHaveText(t.sprechen.zuLeise);
    await expect(aufnehmen).toBeFocused();
    // „kein Mikrofon“: „Aufnehmen“ verschwindet, der Fokus steht auf der Selbstbewertung
    await page.keyboard.press('Enter');
    await expect(liveRegion(page)).toHaveText(t.sprechen.keinMikrofon);
    await expect(aufnehmen).toHaveCount(0);
    await expect(page.getByRole('heading', { level: 3, name: t.sprechen.selbstVergleich, exact: true })).toBeFocused();
    await druecke(page, 'tastatur', page.getByRole('button', { name: t.sprechen.selbst.gut, exact: true }));
  });

  for (const mitPruefung of [false, true])
    test(`Höchstlänge 15 s: vorher sichtbar und angesagt, die Aufnahme endet von selbst mit Ansage (N9b)${
      mitPruefung ? ', mit Sprachprüfung: die Ansage steht vor dem Ergebnis' : ''
    }`, async ({ page }, info) => {
      test.skip(info.project.name !== 'desktop', 'einmal genügt');
      // die Sprachprüfung läuft im E2E nur mit dem Attrappen-Worker (der echte lädt ≈ 95 MB)
      test.skip(mitPruefung && !(SCHALTER_SPRECHEN && ATTRAPPE), 'Sprachprüfung nur im Testbau mit Attrappen-Worker');
      test.setTimeout(120_000);
      const t = de;
      await geraet(page);
      await page.goto('/lern-app/de/tr-aus-de/ueben?l=tr-aus-de.a1.test.l04');
      await dialog(page, 'tastatur', t, 'İyiyim, teşekkürler.', false);
      await geschichte(page, 'tastatur', t, 'kitap', 'de');
      await lesen(page, 'tastatur', t, null, 'kitap', { ui: 'de', glossen: 2 });
      await tipp(page, 'tastatur', t, 'Su içiyorum.');
      await waehle(page, 'tastatur', page.getByRole('radio', { name: 'Ş', exact: true }));
      await pruefenUndWeiter(page, 'tastatur', t);
      await ueberschrift(page, t.sprechen.anweisung);
      if (mitPruefung) {
        await druecke(page, 'tastatur', page.getByRole('button', { name: formatiere(t.sprechen.laden, { mb: 95 }, 'de'), exact: true }));
        await expect(liveRegion(page)).toHaveText(t.sprechen.bereit, { timeout: 20_000 });
      } else await ohneSprachpruefung(page, 'tastatur', t);
      const grenze = formatiere(t.sprechen.grenze, { s: 15 }, 'de');
      const aufnehmen = page.getByRole('button', { name: t.sprechen.aufnehmen, exact: true });
      // vorher: sichtbar unter dem Knopf und als seine Beschreibung
      await expect(page.getByText(grenze, { exact: true })).toBeVisible();
      await expect(aufnehmen).toHaveAccessibleDescription(grenze);
      await druecke(page, 'tastatur', aufnehmen);
      await expect(liveRegion(page)).toHaveText(formatiere(t.sprechen.laeuftAnsage, { s: 15 }, 'de'));
      const stopp = page.getByRole('button', { name: t.sprechen.stopp, exact: true });
      await expect(stopp).toBeFocused();
      const beginn = Date.now();
      // nicht beenden: nach 15 s endet die Aufnahme von selbst und sagt es an – mit Sprachprüfung in derselben Ansage vor dem
      // Ergebnis (sonst überschriebe das Ergebnis sie sofort, Gegenprüfung 2 N9b)
      const ende = formatiere(t.sprechen.grenzeErreicht, { s: 15 }, 'de');
      const ergebnis = `(${[t.sprechen.gut, t.sprechen.teilweise].map(roh).join('|')})`;
      if (mitPruefung) await expect(liveRegion(page)).toHaveText(new RegExp(`^${roh(ende)} ${ergebnis}$`), { timeout: 25_000 });
      else await expect(liveRegion(page)).toHaveText(ende, { timeout: 25_000 });
      expect(Date.now() - beginn).toBeGreaterThanOrEqual(14_000);
      const titel = mitPruefung ? new RegExp(`^${ergebnis}$`) : t.sprechen.selbstVergleich;
      await expect(page.getByRole('heading', { level: 3, name: titel, exact: true })).toBeFocused();
      await expect(page.locator('main form').getByText(ende, { exact: true })).toBeVisible();
      await expect(page.getByRole('button', { name: t.sprechen.nochmal, exact: true })).toBeEnabled();
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
