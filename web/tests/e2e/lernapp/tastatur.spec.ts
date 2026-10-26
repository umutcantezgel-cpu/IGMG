import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, type Locator, type Page, test } from '@playwright/test';
import ar from '../../../messages/lernapp/ar.json';
import de from '../../../messages/lernapp/de.json';
import { startFolge, verschiebe } from '../../../src/lib/lernapp/aufgaben/auswertung/reihenfolge';
import type { AufgabeVon } from '../../../src/lib/lernapp/aufgaben/schema';
import { formatiere } from '../../../src/lib/lernapp/format';
import { ernsteBefunde, KURS, LEKTION_1, liveRegion, PAARE, testStation } from './hilfen';
import { leseLernstandEin } from './lernstand';
import { bietePaketeAn, lektion } from './synthetisch';
import { MIKROFON } from './ton';
import { fokus, pruefeSchritte, tabUndEnter, tabZu, waehleMitTasten, zumInhalt, type FokusSchritt } from './tastatur';

/**
 * Echte Tastaturwege (Stufe C N9b, ABNAHME Z-L06, KERN 4.0 §8): je Typgruppe eine Lektion nur mit Tab, Umschalt+Tab, Enter,
 * Leertaste und Pfeilen – ohne `locator.focus()` und ohne Zeiger. Jeder Tab-Schritt muss sichtbar fokussiert sein und der
 * Leserichtung folgen (`tastatur.ts`), auch von rechts nach links in der arabischen Oberfläche.
 * - L1: Lernpfad → Lektion 1 des Testkurses (auswahl, paare, wortbank)
 * - L2-01: Lektion l03 (bild_wort, frei, Hörübung ohne Ton, hoeren_waehlen, hoeren_schreiben, minimalpaare, luecke, satzbau,
 *   formen mit Sonderzeichenleiste)
 * - L2-02: Lektion l04 in de (dialog, geschichte, lesen_fragen, grammatik_tipp, schrift_tr, sprechen, schreiben) und in ar
 *   (schrift_ar erkennen und nachspuren mit „auf Papier geschrieben“ per Tastatur)
 * - Vorkurs: schrift_latein einer echten Lektion (de-aus-ar, Oberfläche ar)
 * - L2-03: wahr_falsch, zuordnen, reihenfolge, fallfrage, koran_wort (synthetisches Paket, Platzhalter)
 * - Wiederholen mit fälligen Karten bis „fertig“, mit axe vor und nach jeder Antwort
 * - Fokusreihenfolge über ganze Seiten (Start, Spieler) in de und ar, auf beiden Breiten
 * Sprechen nimmt mit dem Testmikrofon von Chromium auf (synthetische Tonfolge wie typen-b.spec.ts).
 */

test.use(MIKROFON());

type Texte = typeof de;

/** Arabische Testsätze und -wörter des Testkurses (Codepunkt-Escapes wie im Seed und in typen-b.spec.ts). */
const AR = {
  w001: '\u0645\u064E\u0627\u0621',
  w004: '\u0643\u0650\u062A\u064E\u0627\u0628',
  s0001:
    '\u0623\u064E\u0646\u064E\u0627 \u0623\u064E\u0634\u0652\u0631\u064E\u0628\u064F \u0627\u0644\u0652\u0645\u064E\u0627\u0621\u064E.',
  s0007: '\u0628\u0650\u062E\u064E\u064A\u0652\u0631\u064D\u060C \u0634\u064F\u0643\u0652\u0631\u064B\u0627.',
};

const nurDesktop = (name: string) =>
  test.skip(name !== 'desktop', 'Tastaturwege auf dem Desktop; die Fokusreihenfolge prüft beide Breiten');

/** Gerät für den Gerätecheck der Sprechübung und Zählung der beendeten Wiedergaben (Hörübungen). */
async function vorbereiten(page: Page) {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'deviceMemory', { configurable: true, get: () => 8 });
    if (navigator.storage) navigator.storage.estimate = async () => ({ quota: 10_000_000_000, usage: 0 });
    const w = window as unknown as { __enden: number };
    w.__enden = 0;
    const spiele = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function (this: HTMLMediaElement & { __gezaehlt?: boolean }) {
      if (!this.__gezaehlt) {
        this.__gezaehlt = true;
        this.addEventListener('ended', () => w.__enden++);
      }
      return spiele.call(this);
    };
  });
}
const enden = (page: Page) => page.evaluate(() => (window as unknown as { __enden: number }).__enden);

/** Weg mit Mängelliste: alle Tab-Schritte einer Lektion landen in `m`, am Ende muss sie leer sein. */
function weg(page: Page, t: Texte, kennung: string) {
  const m: string[] = [];
  const o = (k: string) => ({ maengel: m, kennung: `${kennung} ${k}` });
  const knopf = (name: string) => page.getByRole('button', { name, exact: true });
  const radio = (name: string, scope: Page | Locator = page) => scope.getByRole('radio', { name, exact: true });
  return {
    m,
    o,
    knopf,
    radio,
    /** Nach dem Prüfen liegt der Fokus auf „Weiter“ (KERN 4.0 §8); Enter. */
    async weiter() {
      const w = knopf(t.spieler.weiter);
      await expect(w).toBeFocused();
      await page.keyboard.press('Enter');
    },
    async richtigWeiter() {
      await expect(liveRegion(page)).toContainText(t.spieler.richtig);
      await this.weiter();
    },
    /** Option wählen und mit Enter prüfen (Enter im Optionsfeld schickt das Formular ab). */
    async waehle(name: string, k: string, scope: Page | Locator = page) {
      await waehleMitTasten(page, radio(name, scope), o(k));
      await page.keyboard.press('Enter');
    },
    async druecke(name: string, k: string) {
      await tabUndEnter(page, knopf(name), o(k));
    },
    /** Text in ein Feld: Tab hinein, tippen, Enter prüft. */
    async schreibe(feld: Locator, text: string, k: string, { enter = true } = {}) {
      await tabZu(page, feld, o(k));
      await page.keyboard.insertText(text);
      await expect(feld).toHaveValue(text);
      if (enter) await page.keyboard.press('Enter');
    },
    /** Kacheln der Wortbank: Tab in die Leiste, Pfeil bis zur Kachel, Enter; danach „Prüfen“. */
    async wortbank(woerter: string[], ui: 'de' | 'ar', k: string) {
      for (const w of woerter) {
        const kachel = knopf(formatiere(t.aufgaben.wortbank.hinzufuegen, { wort: w }, ui));
        await tabZu(page, kachel, { ...o(k), gruppe: page.getByRole('toolbar', { name: t.aufgaben.wortbank.bank }) });
        await page.keyboard.press('Enter');
        await expect(kachel).toHaveCount(0);
        // der Fokus wandert im nächsten Bild zur nächsten Kachel
        await page.evaluate(() => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r()))));
      }
      await tabUndEnter(page, knopf(t.spieler.pruefen), o(`${k} prüfen`));
    },
    async anhoeren(k: string, { langsam = false } = {}) {
      const vorher = await enden(page);
      await tabUndEnter(page, knopf(langsam ? t.aufgaben.hoeren.langsam : t.aufgaben.hoeren.anhoeren), o(k));
      await expect.poll(() => enden(page), { timeout: 15_000 }).toBe(vorher + 1);
    },
  };
}

test.describe('Tastaturwege je Typgruppe (nur Tab, Pfeile, Enter, Leertaste)', () => {
  test.beforeEach(async ({ page }, info) => {
    nurDesktop(info.project.name);
    await vorbereiten(page);
  });

  test('L1: Lernpfad → Lektion 1 (auswahl, paare, wortbank) bis zum Ergebnis', async ({ page }) => {
    test.setTimeout(120_000);
    const t = de;
    const w = weg(page, t, 'L1');
    await page.goto(`/lern-app/de/${KURS}`);
    const link = testStation(page).locator(`a[href="/lern-app/de/${KURS}/ueben?l=${LEKTION_1}"]`);
    await expect(link).toBeVisible({ timeout: 30_000 });
    await zumInhalt(page, t.rahmen.zumInhalt, w.m);
    await tabZu(page, link, { ...w.o('Lernpfad'), hoechstens: 120 });
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL((u) => u.pathname === `/lern-app/de/${KURS}/ueben`);

    await expect(page.getByRole('heading', { name: t.aufgaben.auswahl.waehleUebersetzung })).toBeVisible({ timeout: 15_000 });
    await zumInhalt(page, t.rahmen.zumInhalt, w.m);
    await w.waehle('Wasser', 'auswahl');
    await w.richtigWeiter();

    await expect(page.getByRole('heading', { name: t.aufgaben.paare.findePaare })).toBeVisible();
    for (const [links, rechts] of PAARE) {
      await w.druecke(links, 'paare links');
      await expect(w.knopf(links)).toHaveAttribute('aria-pressed', 'true');
      await w.druecke(rechts, 'paare rechts');
    }
    await w.richtigWeiter();

    await expect(page.getByRole('heading', { name: t.aufgaben.wortbank.uebersetze })).toBeVisible();
    await w.wortbank(['Su', 'içiyorum'], 'de', 'wortbank');
    await w.richtigWeiter();

    await expect(page.getByRole('heading', { name: t.aufgaben.auswahl.waehleWort })).toBeVisible();
    await w.waehle('kitap', 'auswahl 2');
    await w.richtigWeiter();

    await expect(page.getByRole('heading', { name: t.spieler.fertigTitel })).toBeVisible();
    const zurueck = page.getByRole('link', { name: t.spieler.zurueck });
    await expect(zurueck).toBeVisible();
    await tabUndEnter(page, zurueck, w.o('Ergebnis'));
    await expect(page).toHaveURL((u) => u.pathname === `/lern-app/de/${KURS}`);
    expect(w.m).toEqual([]);
  });

  test('L2-01: Lektion l03 (bild_wort, frei, Hörübungen, minimalpaare, luecke, satzbau, formen)', async ({ page }) => {
    test.setTimeout(180_000);
    const t = de;
    const w = weg(page, t, 'l03');
    await page.goto('/lern-app/de/tr-aus-de/ueben?l=tr-aus-de.a1.test.l03');
    await expect(page.getByRole('heading', { name: t.aufgaben.bild_wort.waehleWort })).toBeVisible({ timeout: 15_000 });
    await zumInhalt(page, t.rahmen.zumInhalt, w.m);
    await w.waehle('ev', 'bild_wort');
    await w.richtigWeiter();

    await expect(page.getByRole('heading', { name: t.aufgaben.frei.uebersetze })).toBeVisible();
    await w.schreibe(page.getByRole('textbox', { name: t.aufgaben.frei.eingabe }), 'ekmek', 'frei');
    await w.richtigWeiter();

    // Hörübung ohne Ton: überspringen
    await expect(page.getByText(t.aufgaben.hoeren.audioFolgt, { exact: true })).toBeVisible();
    await w.druecke(t.aufgaben.hoeren.ueberspringen, 'ohne Ton');

    await expect(page.getByRole('heading', { name: t.aufgaben.hoeren_waehlen.waehleBedeutung })).toBeVisible();
    await w.anhoeren('hoeren_waehlen');
    await w.anhoeren('hoeren_waehlen langsam', { langsam: true });
    await w.waehle('Wasser', 'hoeren_waehlen');
    await w.richtigWeiter();

    await expect(page.getByRole('heading', { name: t.aufgaben.hoeren_schreiben.schreibeGehoertes })).toBeVisible();
    await w.anhoeren('hoeren_schreiben');
    await w.schreibe(page.getByRole('textbox', { name: t.aufgaben.hoeren_schreiben.eingabe }), 'kitap', 'hoeren_schreiben');
    await w.richtigWeiter();

    await expect(page.getByRole('heading', { name: t.aufgaben.minimalpaare.waehleGehoertes })).toBeVisible();
    await w.anhoeren('minimalpaare');
    await w.waehle('üç', 'minimalpaare');
    await w.richtigWeiter();

    await expect(page.getByRole('heading', { name: t.aufgaben.luecke.ergaenze })).toBeVisible();
    await w.waehle('içiyorum', 'luecke');
    await w.richtigWeiter();

    await expect(page.getByRole('heading', { name: t.aufgaben.satzbau.ordne })).toBeVisible();
    await w.wortbank(['Ev', 'büyük'], 'de', 'satzbau');
    await w.richtigWeiter();

    // Formen: „ç“ aus der Sonderzeichenleiste (Tab aus dem Feld zur Taste, Umschalt+Tab zurück an die Schreibmarke)
    await expect(page.getByRole('heading', { name: t.aufgaben.formen.ergaenze })).toBeVisible();
    const sen = page.getByRole('textbox', { name: 'sen şimdiki zaman', exact: true });
    const o = page.getByRole('textbox', { name: 'o şimdiki zaman', exact: true });
    await w.schreibe(sen, 'içiyorsun', 'formen sen', { enter: false });
    await tabZu(page, o, w.o('formen o'));
    await page.keyboard.insertText('i');
    const c = w.knopf(formatiere(t.tastatur.einfuegen, { zeichen: 'ç' }, 'de'));
    await expect(c).toBeVisible();
    await tabUndEnter(page, c, w.o('Sonderzeichen'));
    await expect(o).toHaveValue('iç');
    await tabZu(page, o, w.o('zurück ins Feld'));
    await page.keyboard.press('End');
    await page.keyboard.insertText('iyor');
    await expect(o).toHaveValue('içiyor');
    await page.keyboard.press('Enter');
    await w.richtigWeiter();

    await expect(page.getByRole('heading', { name: t.spieler.fertigTitel })).toBeVisible();
    await expect(page.getByText(formatiere(t.spieler.fertigText, { richtig: 8, gesamt: 8 }, 'de'), { exact: true })).toBeVisible();
    expect(w.m).toEqual([]);
  });

  /** Lektion l04 in der Oberfläche `ui` (de: tr-aus-de, ar: ar-aus-de); Sprechen ohne Sprachprüfung mit eigener Aufnahme. */
  async function spieleL04(page: Page, ui: 'de' | 'ar') {
    const t = (ui === 'de' ? de : ar) as unknown as Texte;
    const w = weg(page, t, `l04 ${ui}`);
    const kurs = ui === 'de' ? 'tr-aus-de' : 'ar-aus-de';
    await page.goto(`/lern-app/${ui}/${kurs}/ueben?l=${kurs}.a1.test.l04`);
    await expect(page.locator('html')).toHaveAttribute('dir', ui === 'ar' ? 'rtl' : 'ltr');
    await expect(page.getByRole('heading', { level: 2, name: t.aufgaben2.dialog.anweisung })).toBeVisible({ timeout: 15_000 });
    await zumInhalt(page, t.rahmen.zumInhalt, w.m);

    // dialog
    await w.waehle(ui === 'de' ? 'İyiyim, teşekkürler.' : AR.s0007, 'dialog');
    await w.richtigWeiter();

    // geschichte: Zeile für Zeile, Rest bis zur Frage, Frage, abschließen
    await expect(page.getByRole('heading', { level: 2, name: t.aufgaben2.geschichte.anweisung })).toBeVisible();
    const schritte = page.locator('main form ol > li');
    await w.druecke(t.aufgaben2.geschichte.weiterLesen, 'geschichte weiter lesen');
    await expect(schritte).toHaveCount(2);
    await expect(schritte.last()).toBeFocused();
    await w.druecke(t.ansichten.geschichte.bisZurFrage, 'geschichte bis zur Frage');
    await expect(schritte).toHaveCount(4);
    await w.waehle(ui === 'de' ? 'kitap' : AR.w004, 'geschichte Frage');
    await expect(liveRegion(page)).toHaveText(t.aufgaben2.geschichte.richtig);
    await w.druecke(t.aufgaben2.geschichte.abschliessen, 'geschichte abschließen');
    await w.richtigWeiter();

    // lesen_fragen: Glosse per Enter öffnen, Escape schließt, Fokus zurück; Glossar aufklappen; zwei Fragen
    await expect(page.getByRole('heading', { level: 2, name: t.aufgaben2.lesenFragen.anweisung })).toBeVisible();
    if (ui === 'de') {
      const wort = w.knopf('Ev');
      await tabUndEnter(page, wort, w.o('Glosse'));
      await expect(wort).toHaveAttribute('aria-expanded', 'true');
      await page.keyboard.press('Escape');
      await expect(wort).toBeFocused();
    }
    const glossar = page.locator('main details').filter({ hasText: formatiere(t.ansichten.lesen.woerter, { n: 2 }, ui) });
    await tabUndEnter(page, glossar.locator('summary'), w.o('Glossar'));
    await expect(glossar.locator('dt')).toHaveCount(2);
    await waehleMitTasten(page, w.radio(t.aufgaben2.lesenFragen.rfn.richtig), w.o('lesen rfn'));
    await w.waehle(ui === 'de' ? 'kitap' : AR.w004, 'lesen Auswahl');
    await w.richtigWeiter();

    // grammatik_tipp
    await expect(page.getByRole('heading', { level: 2, name: t.aufgaben2.grammatikTipp.anweisung })).toBeVisible();
    await w.druecke(t.aufgaben2.grammatikTipp.verstanden, 'tipp');

    if (ui === 'de') {
      await expect(page.getByRole('heading', { level: 2, name: t.aufgaben2.schriftWahl.grossKlein })).toBeVisible();
      await w.waehle('Ş', 'schrift_tr');
      await w.richtigWeiter();
    } else {
      await expect(page.getByRole('heading', { level: 2, name: t.aufgaben2.schriftAr.erkennen })).toBeVisible();
      await w.waehle(t.aufgaben2.schriftAr.namen.be, 'schrift_ar erkennen');
      await w.richtigWeiter();
      // Nachspuren ohne Zeiger: „auf Papier geschrieben“ per Tastatur (Ziehen ist nie nötig, WCAG 2.5.7)
      await expect(page.getByRole('heading', { level: 2, name: t.aufgaben2.schriftAr.nachspuren })).toBeVisible();
      await w.druecke(t.aufgaben2.schriftAr.papier, 'nachspuren Papier');
      await expect(liveRegion(page)).toHaveText(t.spieler.richtig);
      await w.weiter();
    }

    // sprechen: ohne Sprachprüfung (de) bzw. ohne Rückmeldung (ar); Aufnahme starten und beenden nur mit Tasten
    await expect(page.getByRole('heading', { level: 2, name: t.sprechen.anweisung })).toBeVisible();
    const grenze = formatiere(t.sprechen.grenze, { s: 15 }, ui);
    await expect(page.getByText(grenze, { exact: true })).toBeVisible();
    if (ui === 'de') {
      const ohne = w.knopf(t.sprechen.ohne);
      if (await ohne.count()) await tabUndEnter(page, ohne, w.o('sprechen ohne Prüfung'));
    }
    const aufnehmen = w.knopf(t.sprechen.aufnehmen);
    await tabUndEnter(page, aufnehmen, w.o('aufnehmen'));
    // der Fokus springt auf „Aufnahme beenden“; die Ansage nennt die Höchstlänge
    const stopp = w.knopf(t.sprechen.stopp);
    await expect(stopp).toBeFocused();
    await expect(stopp).toHaveAccessibleDescription(grenze);
    await expect(liveRegion(page)).toHaveText(formatiere(t.sprechen.laeuftAnsage, { s: 15 }, ui));
    await page.waitForTimeout(2_200);
    await page.keyboard.press('Enter');
    const titel = page.getByRole('heading', { level: 3, name: t.sprechen.selbstVergleich, exact: true });
    await expect(titel).toBeFocused({ timeout: 20_000 });
    await w.druecke(t.sprechen.selbst.gut, 'sprechen selbst');

    // schreiben: Textfeld, Prüfen, Prüfliste (vier Radiogruppen), Selbsteinschätzung
    await expect(page.getByRole('heading', { level: 2, name: t.schreiben.anweisung })).toBeVisible();
    await w.schreibe(
      page.getByRole('textbox', { name: t.schreiben.text, exact: true }),
      ui === 'de' ? 'Ben su içiyorum. Kitap yeni.' : `${AR.w001} ${AR.s0001}`,
      'schreiben',
      { enter: false },
    );
    await w.druecke(t.schreiben.pruefen, 'schreiben prüfen');
    await expect(page.getByRole('heading', { level: 3, name: t.schreiben.laengePasst, exact: true })).toBeFocused();
    for (const k of ['aufgabe', 'zusammenhang', 'wortschatz', 'grammatik'] as const)
      await waehleMitTasten(page, w.radio(t.schreiben.pruefliste[k].s2), w.o(`Prüfliste ${k}`));
    await w.druecke(t.schreiben.selbst.gut, 'schreiben selbst');

    await expect(page.getByRole('heading', { name: t.spieler.fertigTitel })).toBeVisible();
    expect(w.m).toEqual([]);
  }

  test('L2-02 de: Lektion l04 (dialog, geschichte, lesen_fragen, grammatik_tipp, schrift_tr, sprechen, schreiben)', async ({ page }) => {
    test.setTimeout(180_000);
    await spieleL04(page, 'de');
  });

  test('L2-02 ar (RTL): Lektion l04 mit schrift_ar erkennen und nachspuren („auf Papier geschrieben“ per Tastatur)', async ({ page }) => {
    test.setTimeout(180_000);
    await spieleL04(page, 'ar');
  });

  test('Vorkurs schrift_latein (echte Lektion de-aus-ar, Oberfläche ar): Tipp und Buchstaben nur mit Tasten', async ({ page }) => {
    test.setTimeout(120_000);
    const t = ar as unknown as Texte;
    const w = weg(page, t, 'schrift_latein');
    const inhalt = JSON.parse(readFileSync(join(__dirname, '../../../inhalte/lernapp/sprache/de/a1/de.a1.e00-ar.json'), 'utf8')) as {
      lektionen: { aufgaben: { typ: string; optionen?: string[]; richtig?: number }[] }[];
    };
    const aufgaben = inhalt.lektionen[0]!.aufgaben;
    expect(aufgaben[0]!.typ).toBe('grammatik_tipp');
    await page.goto('/lern-app/ar/de-aus-ar/ueben?l=de-aus-ar.a1.e00-ar.l01');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.getByRole('heading', { level: 2, name: t.aufgaben2.grammatikTipp.anweisung })).toBeVisible({ timeout: 20_000 });
    await zumInhalt(page, t.rahmen.zumInhalt, w.m);
    await w.druecke(t.aufgaben2.grammatikTipp.verstanden, 'Tipp');
    // drei Aufgaben schrift_latein: die richtige Option aus dem Inhalt
    for (const [i, a] of aufgaben.slice(1, 4).entries()) {
      expect(a.typ).toBe('schrift_latein');
      await expect(page.locator('main form[data-aufgabe="schrift_latein"]')).toBeVisible();
      await w.waehle(a.optionen![a.richtig!]!, `schrift_latein ${i + 1}`);
      await w.richtigWeiter();
    }
    expect(w.m).toEqual([]);
  });
});

/** Wissenstypen mit Platzhaltern (KI-Regel 2) im synthetischen Paket – wie typen-wissen.spec.ts. */
const WF: AufgabeVon<'wahr_falsch'> = {
  typ: 'wahr_falsch',
  schluessel: 'tr.a1.e09.l01.a01',
  anweisung: 'stimmtDas',
  sprache: 'de',
  aussage: '[Aussage 1]',
  wahr: false,
  begruendung: '[Begründung 1]',
  quelle: '[Werk, Kapitel, Ausgabe]',
};
const ZO: AufgabeVon<'zuordnen'> = {
  typ: 'zuordnen',
  schluessel: 'tr.a1.e09.l01.a02',
  anweisung: 'ordneZu',
  sprache: 'de',
  kategorien: ['[Kategorie A]', '[Kategorie B]', '[Kategorie C]'],
  eintraege: [
    { text: '[Eintrag 1]', kategorie: 0 },
    { text: '[Eintrag 2]', kategorie: 1 },
    { text: '[Eintrag 3]', kategorie: 2 },
  ],
  quelle: '[Werk, Kapitel, Ausgabe]',
};
const RF: AufgabeVon<'reihenfolge'> = {
  typ: 'reihenfolge',
  schluessel: 'tr.a1.e09.l01.a03',
  anweisung: 'ordne',
  sprache: 'de',
  schritte: ['[Schritt 1]', '[Schritt 2]', '[Schritt 3]', '[Schritt 4]'],
};
const FF: AufgabeVon<'fallfrage'> = {
  typ: 'fallfrage',
  schluessel: 'tr.a1.e09.l01.a04',
  anweisung: 'waehleAntwort',
  sprache: 'de',
  fall: '[Fall 1]',
  frage: '[Frage 1]',
  optionen: ['[Antwort A]', '[Antwort B]', '[Antwort C]'],
  richtig: 1,
  begruendung: '[Begründung 2]',
};
const KW: AufgabeVon<'koran_wort'> = {
  typ: 'koran_wort',
  schluessel: 'tr.a1.e09.l01.a05',
  anweisung: 'waehleBedeutung',
  wort: { stelle: '0:0:1', text: '[Wortform 1]', sprache: 'ar' },
  optionen: [
    { kennung: 'test.bedeutung.1', text: '[Bedeutung 1]', sprache: 'de' },
    { kennung: 'test.bedeutung.2', text: '[Bedeutung 2]', sprache: 'de' },
    { kennung: 'test.bedeutung.3', text: '[Bedeutung 3]', sprache: 'de' },
  ],
  richtig: 0,
};

test.describe('Wissenstypen nur mit Tasten (synthetisches Paket)', () => {
  test.use({ serviceWorkers: 'block' });

  test('L2-03: wahr_falsch (mit Quellenzeile), zuordnen, reihenfolge (Alt+Pfeil), fallfrage, koran_wort', async ({ page }, info) => {
    nurDesktop(info.project.name);
    test.setTimeout(150_000);
    await bietePaketeAn(page, [
      {
        schluessel: 'tr.a1.e09',
        stufe: 'a1',
        thema: '[Testeinheit Wissen]',
        lektionen: [lektion('tr-aus-de.a1.e09.l01', [WF, ZO, RF, FF, KW])],
      },
    ]);
    const t = de;
    const w = weg(page, t, 'wissen');
    await page.goto('/lern-app/de/tr-aus-de/ueben?l=tr-aus-de.a1.e09.l01');
    await expect(page.getByRole('heading', { name: t.aufgaben.wahr_falsch.stimmtDas })).toBeVisible({ timeout: 15_000 });
    await zumInhalt(page, t.rahmen.zumInhalt, w.m);
    await w.waehle(t.aufgaben.wahr_falsch.stimmtNicht, 'wahr_falsch');
    await expect(liveRegion(page)).toContainText(t.spieler.richtig);
    // Quellenzeile: Umschalt+Tab zurück vom „Weiter“ zur Zusammenfassung, aufklappen, dann wieder zu „Weiter“
    await tabUndEnter(page, page.getByText(t.aufgaben.wissen.quelleZeigen, { exact: true }), w.o('Quelle'));
    await expect(page.getByText('[Werk, Kapitel, Ausgabe]', { exact: true })).toBeVisible();
    await tabUndEnter(page, w.knopf(t.spieler.weiter), w.o('weiter nach Quelle'));

    await expect(page.getByRole('heading', { name: t.aufgaben.zuordnen.ordneZu })).toBeVisible();
    const ziel = ['[Kategorie A]', '[Kategorie B]', '[Kategorie C]'];
    for (const [i, e] of ZO.eintraege.entries())
      await waehleMitTasten(page, w.radio(ziel[i]!, page.getByRole('group', { name: e.text, exact: true })), w.o(`zuordnen ${i + 1}`));
    await page.keyboard.press('Enter');
    await w.richtigWeiter();

    await expect(page.getByRole('heading', { name: t.aufgaben.reihenfolge.ordne })).toBeVisible();
    let folge = startFolge(RF);
    for (let stelle = 0; stelle < folge.length; stelle++)
      while (folge.indexOf(stelle) > stelle) {
        const pos = folge.indexOf(stelle);
        const text = RF.schritte[stelle]!;
        const hoch = w.knopf(formatiere(t.aufgaben.reihenfolge.hoch, { text }, 'de'));
        await tabZu(page, hoch, w.o('reihenfolge'));
        await page.keyboard.press('Alt+ArrowUp');
        folge = verschiebe(folge, pos, -1);
        await expect(liveRegion(page)).toHaveText(
          formatiere(t.aufgaben.reihenfolge.verschoben, { text, nr: pos, anzahl: folge.length }, 'de'),
        );
      }
    await tabUndEnter(page, w.knopf(t.spieler.pruefen), w.o('reihenfolge prüfen'));
    await w.richtigWeiter();

    await expect(page.getByRole('heading', { name: t.aufgaben.fallfrage.waehleAntwort })).toBeVisible();
    await w.waehle('[Antwort B]', 'fallfrage');
    await w.richtigWeiter();

    await expect(page.getByRole('heading', { name: t.aufgaben.koran_wort.waehleBedeutung })).toBeVisible();
    await w.waehle('[Bedeutung 1]', 'koran_wort');
    await w.richtigWeiter();
    await expect(page.getByRole('heading', { name: t.spieler.fertigTitel })).toBeVisible();
    expect(w.m).toEqual([]);
  });
});

test('Wiederholen mit fälligen Karten nur mit der Tastatur bis „fertig“, axe vor und nach jeder Antwort', async ({ page }, info) => {
  nurDesktop(info.project.name);
  test.setTimeout(150_000);
  const t = de;
  // fällige Karten des Testkurses (Wörter aus Lektion 1): Runde aus Auswahl und Paaren
  await leseLernstandEin(
    page,
    'de',
    KURS,
    'tr.a1.test',
    PAARE.map((_, i) => `tr.a1.test.w00${i + 1}`),
  );
  const w = weg(page, t, 'wiederholen');
  const befunde: string[] = [];
  await page.goto(`/lern-app/de/${KURS}/wiederholen`);
  await expect(page.locator('main form[data-aufgabe]')).toBeVisible({ timeout: 30_000 });
  await zumInhalt(page, t.rahmen.zumInhalt, w.m);
  for (let i = 0; i < 8 && (await page.locator('main form[data-aufgabe]').count()) > 0; i++) {
    const typ = await page.locator('main form[data-aufgabe]').getAttribute('data-aufgabe');
    befunde.push(...(await ernsteBefunde(page, `wiederholen ${i + 1} ${typ}`)));
    if (typ === 'auswahl') {
      const ueberschrift = await page.locator('main form h2').innerText();
      await w.waehle(ueberschrift === t.aufgaben.auswahl.waehleUebersetzung ? 'Wasser' : 'kitap', `auswahl ${i + 1}`);
    } else if (typ === 'paare') {
      for (const [links, rechts] of PAARE) {
        await w.druecke(links, 'paare links');
        await w.druecke(rechts, 'paare rechts');
      }
    } else if (typ === 'wortbank') await w.wortbank(['Su', 'içiyorum'], 'de', 'wortbank');
    else throw new Error(`unerwarteter Typ ${typ}`);
    await expect(liveRegion(page)).toContainText(t.spieler.richtig);
    befunde.push(...(await ernsteBefunde(page, `wiederholen ${i + 1} ${typ} nach der Antwort`)));
    await w.weiter();
  }
  await expect(page.getByRole('heading', { name: t.spieler.fertigTitel })).toBeVisible();
  befunde.push(...(await ernsteBefunde(page, 'wiederholen fertig')));
  const zurueck = page.getByRole('link', { name: t.spieler.zurueck });
  await expect(zurueck).toBeVisible();
  await tabUndEnter(page, zurueck, w.o('fertig'));
  await expect(page).toHaveURL((u) => u.pathname === `/lern-app/de/${KURS}`);
  expect(befunde).toEqual([]);
  expect(w.m).toEqual([]);
});

/** Alle Tab-Halte einer Seite vom Anfang bis zum letzten Element (höchstens `n`): sichtbar, mit Ring, in Leserichtung. */
async function ganzeSeite(page: Page, kennung: string, n = 80): Promise<{ schritte: FokusSchritt[]; maengel: string[] }> {
  const schritte: FokusSchritt[] = [];
  for (let i = 0; i < n; i++) {
    await page.keyboard.press('Tab');
    const f = await fokus(page);
    if (!f) break;
    // wieder am Anfang (Sprunglink): Runde beendet
    if (schritte.length && f.dom <= schritte[0]!.dom) break;
    schritte.push(f);
  }
  // rückwärts wie vorwärts: Umschalt+Tab vom letzten Halt zurück bis zum ersten (nach dem letzten Halt steht der Fokus auf
  // dem Dokument oder wieder am Anfang; Umschalt+Tab führt zurück zum letzten)
  const letzter = schritte.at(-1)!.dom;
  for (let i = 0; i < 3 && (await fokus(page))?.dom !== letzter; i++) await page.keyboard.press('Shift+Tab');
  const zurueck: FokusSchritt[] = [];
  for (let i = 0; i < schritte.length; i++) {
    const f = await fokus(page);
    if (f) zurueck.push(f);
    if (i < schritte.length - 1) await page.keyboard.press('Shift+Tab');
  }
  expect(zurueck.map((z) => z.dom)).toEqual(schritte.map((z) => z.dom).reverse());
  const maengel = [
    ...pruefeSchritte(schritte, { kennung }),
    ...pruefeSchritte(zurueck, { kennung: `${kennung} rückwärts`, rueckwaerts: true }),
  ];
  return { schritte, maengel };
}

for (const ui of ['de', 'ar'] as const) {
  test(`Fokusreihenfolge ${ui}: Start und Spieler ganz mit Tab und Umschalt+Tab, sichtbar und in Leserichtung`, async ({ page }, info) => {
    test.setTimeout(150_000);
    const t = (ui === 'de' ? de : ar) as unknown as Texte;
    const kurs = ui === 'de' ? 'tr-aus-de' : 'de-aus-ar';
    const breite = info.project.name === 'telefon' ? 390 : 1440;
    await page.goto(`/lern-app/${ui}`);
    await expect(page.getByText(t.heute.nochNichts)).toBeVisible();
    const start = await ganzeSeite(page, `${ui} ${breite} Start`);
    expect(start.schritte.length).toBeGreaterThan(10);
    expect(start.schritte[0]!.was).toContain(t.rahmen.zumInhalt);

    await page.goto(`/lern-app/${ui}/${kurs}/ueben?l=${kurs}.a1.test.l01`);
    await expect(page.getByRole('radio').first()).toBeAttached({ timeout: 15_000 });
    const spieler = await ganzeSeite(page, `${ui} ${breite} Spieler`);
    expect(spieler.schritte.some((s) => s.was.startsWith('input[radio]'))).toBe(true);
    expect([...start.maengel, ...spieler.maengel]).toEqual([]);
  });
}
