import { expect, type Locator, type Page, test } from '@playwright/test';
import ar from '../../../messages/lernapp/ar.json';
import de from '../../../messages/lernapp/de.json';
import { formatiere } from '../../../src/lib/lernapp/format';
import { ernsteBefunde, liveRegion } from './hilfen';

/**
 * Übungstypen aus L2-01 (PLAN §4, §14 Tor L2; KERN 4.0 §4, §7, §8) mit Lektion l03 des Testkurses: Bildkarte, Freitext,
 * Hörübung ohne Ton („Audio folgt“, übersprungen), Hören und wählen, Diktat, Minimalpaar, Lücke, Satzbau, Formen und im
 * Arabischen Harakat – je Typ per Tastatur (desktop) und per Tippen (telefon), in der deutschen Oberfläche (tr-aus-de) und in
 * der arabischen Oberfläche von rechts nach links (ar-aus-de: harakat, frei mit Bildschirmtastatur, luecke als Freitext).
 * Dazu: Wiedergabe normal und langsam bis `ended`, Rückfall über WAV bei Medienfehler, „Ich kann gerade nicht hören“, axe.
 * Arabische Testdaten nur als Codepunkt-Escapes (neutrale Alltagswörter aus dem Seed).
 */

type Bedienung = 'tastatur' | 'tippen';
type Texte = typeof de;

const AR = {
  bayt: '\u0628\u064E\u064A\u0652\u062A',
  kitab: '\u0643\u0650\u062A\u064E\u0627\u0628',
  kitabOhne: '\u0643\u062A\u0627\u0628',
  hal: '\u062D\u064E\u0627\u0644',
  albaytu: '\u0627\u0644\u0652\u0628\u064E\u064A\u0652\u062A\u064F',
  kabirun: '\u0643\u064E\u0628\u0650\u064A\u0631\u064C',
  ashrab: '\u0627\u0634\u0631\u0628',
  tashrab: '\u062A\u0634\u0631\u0628',
  yashrab: '\u064A\u0634\u0631\u0628',
  /** Tasten für \u062E\u0628\u0632 (Brot) */
  khubz: ['\u062E', '\u0628', '\u0632'],
};

/** Zeichen-Schlüssel der Namen (`u062E`). */
const schluessel = (c: string) => `u${(c.codePointAt(0) ?? 0).toString(16).toUpperCase().padStart(4, '0')}`;

/**
 * Wiedergabe beobachten (nur im Test): jedes `play()` mit Rate und Tonhöhe, jedes `ended`. Optional erzwungener Medienfehler
 * für WebM/Opus (Rückfallstufe 2 nach ADR 0039, Fortschreibung Nr. 4).
 */
function beobachteAudio(page: Page, { webmFehler = false } = {}) {
  return page.addInitScript((fehler: boolean) => {
    const w = window as unknown as { __hoeren: { gespielt: { rate: number; tonhoehe: boolean; typ: string }[]; enden: number } };
    w.__hoeren = { gespielt: [], enden: 0 };
    const typen = new Map<string, string>();
    const erzeuge = URL.createObjectURL.bind(URL);
    URL.createObjectURL = (o: Blob | MediaSource) => {
      const u = erzeuge(o);
      if (o instanceof Blob) typen.set(u, o.type);
      return u;
    };
    const spiele = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function (this: HTMLMediaElement & { __beobachtet?: boolean }) {
      const typ = typen.get(this.src) ?? '';
      w.__hoeren.gespielt.push({ rate: this.playbackRate, tonhoehe: this.preservesPitch, typ });
      if (!this.__beobachtet) {
        this.__beobachtet = true;
        this.addEventListener('ended', () => w.__hoeren.enden++);
      }
      if (fehler && typ === 'audio/webm') return Promise.reject(new DOMException('Format nicht abspielbar', 'NotSupportedError'));
      return spiele.call(this);
    };
  }, webmFehler);
}

const gehoert = (page: Page) =>
  page.evaluate(
    () => (window as unknown as { __hoeren: { gespielt: { rate: number; tonhoehe: boolean; typ: string }[]; enden: number } }).__hoeren,
  );

/** Aktuelle Übung: Formular des Spielers mit dem Typ. */
const uebung = (page: Page, typ: string) => page.locator(`main form[data-aufgabe="${typ}"]`);

async function druecke(page: Page, ziel: Locator, art: Bedienung) {
  if (art === 'tippen') await ziel.tap();
  else {
    await ziel.focus();
    await page.keyboard.press('Enter');
  }
}

async function pruefen(page: Page, t: Texte, art: Bedienung) {
  await druecke(page, page.getByRole('button', { name: t.spieler.pruefen, exact: true }), art);
}

async function weiter(page: Page, t: Texte, art: Bedienung) {
  const knopf = page.getByRole('button', { name: t.spieler.weiter, exact: true });
  await expect(knopf).toBeVisible();
  if (art === 'tastatur') await expect(knopf).toBeFocused();
  await druecke(page, knopf, art);
}

async function richtig(page: Page, t: Texte, art: Bedienung) {
  await expect(liveRegion(page)).toContainText(t.spieler.richtig);
  await weiter(page, t, art);
}

/** Option einer Radiogruppe wählen und prüfen (Tastatur: Fokus, Leertaste, Enter prüft). */
async function waehle(page: Page, t: Texte, art: Bedienung, name: string) {
  const radio = page.getByRole('radio', { name, exact: true });
  await expect(radio).toBeAttached();
  if (art === 'tippen') {
    await page.locator('main label').filter({ has: radio }).tap();
    await expect(radio).toBeChecked();
    await pruefen(page, t, art);
  } else {
    await radio.focus();
    await page.keyboard.press('Space');
    await expect(radio).toBeChecked();
    await page.keyboard.press('Enter');
  }
}

/** Text in ein Feld schreiben (Tastatur bzw. Tippen ins Feld und Systemtastatur), dann prüfen. */
async function schreibe(page: Page, t: Texte, art: Bedienung, feld: Locator, text: string) {
  if (art === 'tippen') await feld.tap();
  else await feld.focus();
  await page.keyboard.insertText(text);
  await expect(feld).toHaveValue(text);
  if (art === 'tastatur') await page.keyboard.press('Enter');
  else await pruefen(page, t, art);
}

async function anhoeren(page: Page, t: Texte, art: Bedienung, { langsam = false } = {}) {
  const vorher = (await gehoert(page)).enden;
  await druecke(
    page,
    page.getByRole('button', { name: langsam ? t.aufgaben.hoeren.langsam : t.aufgaben.hoeren.anhoeren, exact: true }),
    art,
  );
  await expect.poll(async () => (await gehoert(page)).enden, { timeout: 15_000 }).toBe(vorher + 1);
}

async function wortbank(page: Page, t: Texte, art: Bedienung, woerter: string[], ui: 'de' | 'ar') {
  const kachel = (w: string) =>
    page.getByRole('button', { name: formatiere(t.aufgaben.wortbank.hinzufuegen, { wort: w }, ui), exact: true });
  for (const w of woerter) {
    await druecke(page, kachel(w), art);
    await expect(kachel(w)).toHaveCount(0);
    await page.evaluate(() => new Promise<void>((fertig) => requestAnimationFrame(() => requestAnimationFrame(() => fertig()))));
  }
  await pruefen(page, t, art);
}

/** Lektion l03 in der deutschen Oberfläche (Türkisch lernen). */
async function spieleTurkisch(page: Page, art: Bedienung) {
  const t = de;
  await page.goto('/lern-app/de/tr-aus-de/ueben?l=tr-aus-de.a1.test.l03');

  // 1 Bildkarte: vor der Antwort nur der Hinweis „Bildübung“, danach die Beschreibung (erstes Laden mit Verzeichnis und Paket)
  await expect(page.getByRole('heading', { name: t.aufgaben.bild_wort.waehleWort })).toBeVisible({ timeout: 15_000 });
  const bild = uebung(page, 'bild_wort').locator('figure');
  await expect(bild).toHaveAccessibleName(t.aufgaben.bild_wort.bild);
  await expect(bild.locator('svg path').first()).toBeAttached();
  if (art === 'tastatur') expect(await ernsteBefunde(page, 'tr bild_wort')).toEqual([]);
  await waehle(page, t, art, 'ev');
  await expect(bild.locator('figcaption')).toHaveText('Bild: Haus');
  await richtig(page, t, art);

  // 2 Freitext mit Sonderzeichenleiste
  await expect(page.getByRole('heading', { name: t.aufgaben.frei.uebersetze })).toBeVisible();
  const frei = page.getByRole('textbox', { name: t.aufgaben.frei.eingabe });
  await expect(frei).toHaveAttribute('lang', 'tr');
  await expect(page.getByRole('toolbar', { name: t.tastatur.sonderzeichen })).toBeVisible();
  await schreibe(page, t, art, frei, 'ekmek');
  await richtig(page, t, art);

  // 3 Hörübung ohne Ton: „Audio folgt“, kein „Prüfen“, weiter ohne Bewertung
  await expect(page.getByRole('heading', { name: t.aufgaben.hoeren_waehlen.waehleGehoertes })).toBeVisible();
  await expect(page.getByText(t.aufgaben.hoeren.audioFolgt, { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: t.spieler.pruefen, exact: true })).toHaveCount(0);
  await druecke(page, page.getByRole('button', { name: t.aufgaben.hoeren.ueberspringen, exact: true }), art);

  // 4 Hören und wählen: normal und langsam (0,75, gleiche Tonhöhe) bis zum Ende, dann die Bedeutung
  await expect(page.getByRole('heading', { name: t.aufgaben.hoeren_waehlen.waehleBedeutung })).toBeVisible();
  await anhoeren(page, t, art);
  await anhoeren(page, t, art, { langsam: true });
  const g = await gehoert(page);
  expect(g.gespielt.slice(-2).map((x) => [x.rate, x.tonhoehe, x.typ])).toEqual([
    [1, true, 'audio/webm'],
    [0.75, true, 'audio/webm'],
  ]);
  await waehle(page, t, art, 'Wasser');
  await expect(uebung(page, 'hoeren_waehlen')).toContainText(`${t.aufgaben.hoeren.abschrift} su`);
  await richtig(page, t, art);

  // 5 Diktat
  await expect(page.getByRole('heading', { name: t.aufgaben.hoeren_schreiben.schreibeGehoertes })).toBeVisible();
  await anhoeren(page, t, art);
  await schreibe(page, t, art, page.getByRole('textbox', { name: t.aufgaben.hoeren_schreiben.eingabe }), 'kitap');
  await expect(uebung(page, 'hoeren_schreiben')).toContainText(`${t.aufgaben.hoeren.abschrift} kitap`);
  await richtig(page, t, art);

  // 6 Minimalpaar
  await expect(page.getByRole('heading', { name: t.aufgaben.minimalpaare.waehleGehoertes })).toBeVisible();
  await anhoeren(page, t, art);
  await waehle(page, t, art, 'üç');
  await richtig(page, t, art);

  // 7 Lücke mit Optionen
  await expect(page.getByRole('heading', { name: t.aufgaben.luecke.ergaenze })).toBeVisible();
  await expect(uebung(page, 'luecke').locator('p[lang="tr"]').first()).toContainText('Su');
  await waehle(page, t, art, 'içiyorum');
  await richtig(page, t, art);

  // 8 Satzbau
  await expect(page.getByRole('heading', { name: t.aufgaben.satzbau.ordne })).toBeVisible();
  await wortbank(page, t, art, ['Ev', 'büyük'], 'de');
  await richtig(page, t, art);

  // 9 Formen: Felder mit Kopfbezug; „ç“ aus der Sonderzeichenleiste an der Schreibmarke (die Leiste lädt mit dem ersten
  // Fokus in einem Feld, Stufe C N6)
  await expect(page.getByRole('heading', { name: t.aufgaben.formen.ergaenze })).toBeVisible();
  const sen = page.getByRole('textbox', { name: 'sen şimdiki zaman', exact: true });
  const o = page.getByRole('textbox', { name: 'o şimdiki zaman', exact: true });
  const cZeichen = page.getByRole('button', { name: formatiere(t.tastatur.einfuegen, { zeichen: 'ç' }, 'de'), exact: true });
  if (art === 'tippen') {
    await o.tap();
    await page.keyboard.insertText('i');
    await cZeichen.tap();
    await expect(o).toHaveValue('iç');
    await o.press('End');
    await page.keyboard.insertText('iyor');
    await sen.tap();
    await page.keyboard.insertText('içiyorsun');
  } else {
    await o.focus();
    await page.keyboard.insertText('i');
    await expect(cZeichen).toBeVisible();
    await page.keyboard.press('Tab');
    await expect(cZeichen).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(o).toHaveValue('iç');
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('End');
    await page.keyboard.insertText('iyor');
    await sen.focus();
    await page.keyboard.insertText('içiyorsun');
  }
  await expect(o).toHaveValue('içiyor');
  await expect(sen).toHaveValue('içiyorsun');
  if (art === 'tastatur') expect(await ernsteBefunde(page, 'tr formen')).toEqual([]);
  if (art === 'tastatur') await page.keyboard.press('Enter');
  else await pruefen(page, t, art);
  await richtig(page, t, art);

  // Ende: acht gespielte Aufgaben (die ohne Ton zählt nicht), XP statisch
  await expect(page.getByRole('heading', { name: t.spieler.fertigTitel })).toBeVisible();
  await expect(page.getByText(formatiere(t.spieler.fertigText, { richtig: 8, gesamt: 8 }, 'de'), { exact: true })).toBeVisible();
}

/** Lektion l03 in der arabischen Oberfläche (Arabisch lernen aus dem Deutschen), von rechts nach links. */
async function spieleArabisch(page: Page, art: Bedienung) {
  const t = ar as unknown as Texte;
  await page.goto('/lern-app/ar/ar-aus-de/ueben?l=ar-aus-de.a1.test.l03');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');

  // 1 Bildkarte (erstes Laden: Kursverzeichnis und Paket)
  await expect(page.getByRole('heading', { name: t.aufgaben.bild_wort.waehleWort })).toBeVisible({ timeout: 15_000 });
  await waehle(page, t, art, AR.bayt);
  await expect(uebung(page, 'bild_wort').locator('figcaption bdi[lang="de"]')).toHaveText('Haus');
  await richtig(page, t, art);

  // 2 Freitext auf Arabisch mit der Bildschirmtastatur (eigener Chunk, erst hier geladen)
  await expect(page.getByRole('heading', { name: t.aufgaben.frei.uebersetze })).toBeVisible();
  const feld = page.getByRole('textbox', { name: t.aufgaben.frei.eingabe });
  await expect(feld).toHaveAttribute('dir', 'rtl');
  const schalter = page.getByRole('button', { name: t.tastatur.arabisch, exact: true });
  await druecke(page, schalter, art);
  await expect(schalter).toHaveAttribute('aria-expanded', 'true');
  const tastatur = page.getByRole('toolbar', { name: t.tastatur.arabisch });
  await expect(tastatur).toHaveAttribute('dir', 'rtl');
  const taste = (c: string) =>
    tastatur.getByRole('button', {
      name: ar.aufgaben.harakat.zeichen[schluessel(c) as keyof typeof ar.aufgaben.harakat.zeichen],
      exact: true,
    });
  if (art === 'tastatur') {
    // wandernder Tabindex: Pfeil links ist in RTL die nächste Taste
    await tastatur.getByRole('button').first().focus();
    await page.keyboard.press('ArrowLeft');
    await expect(tastatur.getByRole('button').nth(1)).toBeFocused();
    for (const c of AR.khubz) {
      await taste(c).focus();
      await page.keyboard.press('Enter');
    }
  } else for (const c of AR.khubz) await taste(c).tap();
  await expect(feld).toHaveValue(AR.khubz.join(''));
  if (art === 'tastatur') expect(await ernsteBefunde(page, 'ar frei Tastatur')).toEqual([]);
  await pruefen(page, t, art);
  await richtig(page, t, art);

  // 3 ohne Ton
  await expect(page.getByText(t.aufgaben.hoeren.audioFolgt, { exact: true })).toBeVisible();
  await druecke(page, page.getByRole('button', { name: t.aufgaben.hoeren.ueberspringen, exact: true }), art);

  // 4 Hören und wählen (Bedeutung auf Deutsch)
  await expect(page.getByRole('heading', { name: t.aufgaben.hoeren_waehlen.waehleBedeutung })).toBeVisible();
  await anhoeren(page, t, art);
  await waehle(page, t, art, 'Wasser');
  await richtig(page, t, art);

  // 5 Diktat (ohne Harakat angenommen)
  await anhoeren(page, t, art);
  await schreibe(page, t, art, page.getByRole('textbox', { name: t.aufgaben.hoeren_schreiben.eingabe }), AR.kitabOhne);
  await richtig(page, t, art);

  // 6 Minimalpaar ḥāʾ/hāʾ
  await anhoeren(page, t, art);
  await waehle(page, t, art, AR.hal);
  await richtig(page, t, art);

  // 7 Lücke als Freitext von rechts nach links
  await expect(page.getByRole('heading', { name: t.aufgaben.luecke.ergaenze })).toBeVisible();
  const luecke = page.getByRole('textbox', { name: t.aufgaben.luecke.luecke, exact: true });
  await expect(luecke).toHaveAttribute('dir', 'rtl');
  await schreibe(page, t, art, luecke, AR.ashrab);
  await richtig(page, t, art);

  // 8 Satzbau
  await wortbank(page, t, art, [AR.albaytu, AR.kabirun], 'ar');
  await richtig(page, t, art);

  // 9 Formen (Köpfe arabisch, Felder von rechts nach links)
  await expect(page.getByRole('heading', { name: t.aufgaben.formen.ergaenze })).toBeVisible();
  const felder = uebung(page, 'formen').getByRole('textbox');
  await expect(felder).toHaveCount(2);
  for (const [i, wert] of [AR.tashrab, AR.yashrab].entries()) {
    const f = felder.nth(i);
    await expect(f).toHaveAttribute('dir', 'rtl');
    if (art === 'tippen') await f.tap();
    else await f.focus();
    await page.keyboard.insertText(wert);
  }
  if (art === 'tastatur') await page.keyboard.press('Enter');
  else await pruefen(page, t, art);
  await richtig(page, t, art);

  // 10 Harakat: Optionen mit den Namen ihrer Zeichen
  await expect(page.getByRole('heading', { name: t.aufgaben.harakat.waehleVokalisierung })).toBeVisible();
  const kitab = page.getByRole('radio', { name: AR.kitab, exact: true });
  await expect(kitab).toHaveAccessibleDescription(
    `${ar.aufgaben.harakat.zeichen.u0643} ${ar.aufgaben.harakat.zeichen.u0650}, ${ar.aufgaben.harakat.zeichen.u062A} ${ar.aufgaben.harakat.zeichen.u064E}, ${ar.aufgaben.harakat.zeichen.u0627}, ${ar.aufgaben.harakat.zeichen.u0628}`,
  );
  if (art === 'tastatur') expect(await ernsteBefunde(page, 'ar harakat')).toEqual([]);
  await waehle(page, t, art, AR.kitab);
  await richtig(page, t, art);

  await expect(page.getByRole('heading', { name: t.spieler.fertigTitel })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
}

test.describe('Übungstypen aus L2-01', () => {
  test.beforeEach(async ({ page }) => {
    await beobachteAudio(page);
  });

  test('Deutsch: alle Typen nur mit der Tastatur', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'Tastatur auf dem Desktop, Tippen auf dem Telefon');
    test.setTimeout(180_000);
    await spieleTurkisch(page, 'tastatur');
  });

  test('Deutsch: alle Typen per Tippen', async ({ page }, info) => {
    test.skip(info.project.name !== 'telefon', 'Tippen auf dem Telefon, Tastatur auf dem Desktop');
    test.setTimeout(180_000);
    await spieleTurkisch(page, 'tippen');
  });

  test('Arabisch (RTL): harakat, frei mit Bildschirmtastatur, luecke als Freitext – Tastatur', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'Tastatur auf dem Desktop, Tippen auf dem Telefon');
    test.setTimeout(180_000);
    await spieleArabisch(page, 'tastatur');
  });

  test('Arabisch (RTL): alle Typen per Tippen', async ({ page }, info) => {
    test.skip(info.project.name !== 'telefon', 'Tippen auf dem Telefon, Tastatur auf dem Desktop');
    test.setTimeout(180_000);
    await spieleArabisch(page, 'tippen');
  });

  test('„Ich kann gerade nicht hören“ überspringt alle Hörübungen der Lektion', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'einmal genügt');
    test.setTimeout(90_000);
    const t = de;
    await page.goto('/lern-app/de/tr-aus-de/ueben?l=tr-aus-de.a1.test.l03');
    await waehle(page, t, 'tastatur', 'ev');
    await richtig(page, t, 'tastatur');
    await schreibe(page, t, 'tastatur', page.getByRole('textbox', { name: t.aufgaben.frei.eingabe }), 'ekmek');
    await richtig(page, t, 'tastatur');
    await druecke(page, page.getByRole('button', { name: t.aufgaben.hoeren.ueberspringen, exact: true }), 'tastatur');
    await druecke(page, page.getByRole('button', { name: t.aufgaben.hoeren.nichtHoeren, exact: true }), 'tastatur');
    await expect(liveRegion(page)).toHaveText(t.aufgaben.hoeren.uebersprungen);
    // Diktat und Minimalpaar fallen weg: weiter mit der Lücke, Fokus auf der Überschrift
    const ueberschrift = page.getByRole('heading', { name: t.aufgaben.luecke.ergaenze });
    await expect(ueberschrift).toBeFocused();
    expect((await gehoert(page)).gespielt).toEqual([]);
  });
});

test.describe('Wiedergabe: Rückfall bei Medienfehler', () => {
  test('WebM/Opus nicht abspielbar → Dekodieren und WAV, Weg auf dem Gerät gemerkt', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'einmal genügt');
    test.setTimeout(90_000);
    await beobachteAudio(page, { webmFehler: true });
    const t = de;
    await page.goto('/lern-app/de/tr-aus-de/ueben?l=tr-aus-de.a1.test.l03');
    await waehle(page, t, 'tastatur', 'ev');
    await richtig(page, t, 'tastatur');
    await schreibe(page, t, 'tastatur', page.getByRole('textbox', { name: t.aufgaben.frei.eingabe }), 'ekmek');
    await richtig(page, t, 'tastatur');
    await druecke(page, page.getByRole('button', { name: t.aufgaben.hoeren.ueberspringen, exact: true }), 'tastatur');
    await anhoeren(page, t, 'tastatur');
    const g = await gehoert(page);
    expect(g.gespielt.map((x) => x.typ)).toEqual(['audio/webm', 'audio/wav']);
    expect(await page.evaluate(() => localStorage.getItem('igmg-lernapp-audioweg'))).toBe('wav');
    // der nächste Clip nimmt gleich den gemerkten Weg
    await anhoeren(page, t, 'tastatur', { langsam: true });
    expect((await gehoert(page)).gespielt.at(-1)).toEqual({ rate: 0.75, tonhoehe: true, typ: 'audio/wav' });
  });
});
