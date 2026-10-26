import { expect, type Locator, type Page } from '@playwright/test';
import de from '../../../messages/lernapp/de.json';
import { formatiere } from '../../../src/lib/lernapp/format';
import { type Bedienung, ernsteBefunde, liveRegion } from './hilfen';

/**
 * Lektion l03 des Testkurses (L2-01: Bildkarte, Freitext, Hörübung ohne Ton, Hören und wählen, Diktat, Minimalpaar, Lücke,
 * Satzbau, Formen) und die Hilfen dazu – gemeinsam für `typen-a.spec.ts` und `offline.spec.ts` (Hörübung aus dem Bündel ohne
 * Netz, Stufe C N9a).
 */

export type Texte = typeof de;

/**
 * Wiedergabe beobachten (nur im Test): jedes `play()` mit Rate und Tonhöhe, jedes `ended`. Optional erzwungener Medienfehler
 * für WebM/Opus (Rückfallstufe 2 nach ADR 0039, Fortschreibung Nr. 4).
 */
export function beobachteAudio(page: Page, { webmFehler = false } = {}) {
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

export const gehoert = (page: Page) =>
  page.evaluate(
    () => (window as unknown as { __hoeren: { gespielt: { rate: number; tonhoehe: boolean; typ: string }[]; enden: number } }).__hoeren,
  );

/** Aktuelle Übung: Formular des Spielers mit dem Typ. */
export const uebung = (page: Page, typ: string) => page.locator(`main form[data-aufgabe="${typ}"]`);

export async function druecke(page: Page, ziel: Locator, art: Bedienung) {
  if (art === 'tippen') await ziel.tap();
  else {
    await ziel.focus();
    await page.keyboard.press('Enter');
  }
}

export async function pruefen(page: Page, t: Texte, art: Bedienung) {
  await druecke(page, page.getByRole('button', { name: t.spieler.pruefen, exact: true }), art);
}

export async function weiter(page: Page, t: Texte, art: Bedienung) {
  const knopf = page.getByRole('button', { name: t.spieler.weiter, exact: true });
  await expect(knopf).toBeVisible();
  if (art === 'tastatur') await expect(knopf).toBeFocused();
  await druecke(page, knopf, art);
}

export async function richtig(page: Page, t: Texte, art: Bedienung) {
  await expect(liveRegion(page)).toContainText(t.spieler.richtig);
  await weiter(page, t, art);
}

/** Option einer Radiogruppe wählen und prüfen (Tastatur: Fokus, Leertaste, Enter prüft). */
export async function waehle(page: Page, t: Texte, art: Bedienung, name: string) {
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
export async function schreibe(page: Page, t: Texte, art: Bedienung, feld: Locator, text: string) {
  if (art === 'tippen') await feld.tap();
  else await feld.focus();
  await page.keyboard.insertText(text);
  await expect(feld).toHaveValue(text);
  if (art === 'tastatur') await page.keyboard.press('Enter');
  else await pruefen(page, t, art);
}

export async function anhoeren(page: Page, t: Texte, art: Bedienung, { langsam = false } = {}) {
  const vorher = (await gehoert(page)).enden;
  await druecke(
    page,
    page.getByRole('button', { name: langsam ? t.aufgaben.hoeren.langsam : t.aufgaben.hoeren.anhoeren, exact: true }),
    art,
  );
  await expect.poll(async () => (await gehoert(page)).enden, { timeout: 15_000 }).toBe(vorher + 1);
}

export async function wortbank(page: Page, t: Texte, art: Bedienung, woerter: string[], ui: 'de' | 'ar') {
  const kachel = (w: string) =>
    page.getByRole('button', { name: formatiere(t.aufgaben.wortbank.hinzufuegen, { wort: w }, ui), exact: true });
  for (const w of woerter) {
    await druecke(page, kachel(w), art);
    await expect(kachel(w)).toHaveCount(0);
    await page.evaluate(() => new Promise<void>((fertig) => requestAnimationFrame(() => requestAnimationFrame(() => fertig()))));
  }
  await pruefen(page, t, art);
}

/**
 * Lektion l03 in der deutschen Oberfläche (Türkisch lernen), alle Typen bis zum Ende – mit `axe` (Standard bei der Tastatur)
 * zusätzlich die axe-Prüfung von Bildkarte und Formen. Auch ohne Netz (offline gespeichert, `offline.spec.ts`).
 */
export async function spieleTurkisch(page: Page, art: Bedienung, { axe = art === 'tastatur' } = {}) {
  const t = de;
  await page.goto('/lern-app/de/tr-aus-de/ueben?l=tr-aus-de.a1.test.l03');

  // 1 Bildkarte: vor der Antwort nur der Hinweis „Bildübung“, danach die Beschreibung (erstes Laden mit Verzeichnis und Paket)
  await expect(page.getByRole('heading', { name: t.aufgaben.bild_wort.waehleWort })).toBeVisible({ timeout: 15_000 });
  const bild = uebung(page, 'bild_wort').locator('figure');
  await expect(bild).toHaveAccessibleName(t.aufgaben.bild_wort.bild);
  await expect(bild.locator('svg path').first()).toBeAttached();
  if (axe) expect(await ernsteBefunde(page, 'tr bild_wort')).toEqual([]);
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
  if (axe) expect(await ernsteBefunde(page, 'tr formen')).toEqual([]);
  if (art === 'tastatur') await page.keyboard.press('Enter');
  else await pruefen(page, t, art);
  await richtig(page, t, art);

  // Ende: acht gespielte Aufgaben (die ohne Ton zählt nicht), XP statisch
  await expect(page.getByRole('heading', { name: t.spieler.fertigTitel })).toBeVisible();
  await expect(page.getByText(formatiere(t.spieler.fertigText, { richtig: 8, gesamt: 8 }, 'de'), { exact: true })).toBeVisible();
}
