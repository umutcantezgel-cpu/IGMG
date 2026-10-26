import { expect, type Page, test } from '@playwright/test';
import ar from '../../../messages/lernapp/ar.json';
import de from '../../../messages/lernapp/de.json';
import { type Bedienung, ernsteBefunde, liveRegion } from './hilfen';
import {
  anhoeren,
  beobachteAudio,
  druecke,
  gehoert,
  pruefen,
  richtig,
  schreibe,
  spieleTurkisch,
  type Texte,
  uebung,
  waehle,
  wortbank,
} from './l03';

/**
 * Übungstypen aus L2-01 (PLAN §4, §14 Tor L2; KERN 4.0 §4, §7, §8) mit Lektion l03 des Testkurses: Bildkarte, Freitext,
 * Hörübung ohne Ton („Audio folgt“, übersprungen), Hören und wählen, Diktat, Minimalpaar, Lücke, Satzbau, Formen und im
 * Arabischen Harakat – je Typ per Tastatur (desktop) und per Tippen (telefon), in der deutschen Oberfläche (tr-aus-de) und in
 * der arabischen Oberfläche von rechts nach links (ar-aus-de: harakat, frei mit Bildschirmtastatur, luecke als Freitext).
 * Dazu: Wiedergabe normal und langsam bis `ended`, Rückfall über WAV bei Medienfehler, „Ich kann gerade nicht hören“, axe.
 * Arabische Testdaten nur als Codepunkt-Escapes (neutrale Alltagswörter aus dem Seed).
 */

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
