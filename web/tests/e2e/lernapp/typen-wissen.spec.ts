import { expect, type Locator, type Page, test } from '@playwright/test';
import ar from '../../../messages/lernapp/ar.json';
import de from '../../../messages/lernapp/de.json';
import { startFolge, verschiebe } from '../../../src/lib/lernapp/aufgaben/auswertung/reihenfolge';
import type { AufgabeVon } from '../../../src/lib/lernapp/aufgaben/schema';
import { formatiere } from '../../../src/lib/lernapp/format';
import { ernsteBefunde, liveRegion } from './hilfen';
import { bietePaketeAn, lektion } from './synthetisch';

/**
 * Übungstypen aus L2-03 (PLAN §4 „Wissenskurs“, Koran-Arabisch; KERN 4.0 §7–§8): `wahr_falsch`, `zuordnen`, `reihenfolge`,
 * `fallfrage` und `koran_wort` je per Tastatur (desktop) und per Tippen (telefon), dazu die arabische Oberfläche von rechts
 * nach links mit deutschem Inhalt. Die Inhalte sind Platzhalter (KI-Regel 2) in einem synthetischen Paket, das der Test
 * selbst ausliefert: Wissenskurs und Koran-Pfad bekommen echte Pakete erst mit geprüften Bausteinen (L6, `paket/wissen.ts`).
 */

test.use({ serviceWorkers: 'block' });

type Bedienung = 'tastatur' | 'tippen';
type Texte = typeof de;

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
const L01 = 'tr-aus-de.a1.e09.l01';
const L02 = 'tr-aus-de.a1.e09.l02';
const umbenannt = <T extends { schluessel: string }>(a: T, l: string): T => ({ ...a, schluessel: a.schluessel.replace('.l01.', `.${l}.`) });

test.beforeEach(async ({ page }) => {
  await bietePaketeAn(page, [
    {
      schluessel: 'tr.a1.e09',
      stufe: 'a1',
      thema: '[Testeinheit Wissen]',
      lektionen: [
        lektion(L01, [WF, ZO, RF, FF, KW]),
        lektion(
          L02,
          [WF, ZO, RF, FF].map((a) => umbenannt(a, 'l02')),
        ),
      ],
    },
  ]);
});

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

/** Option einer Radiogruppe wählen (Tastatur: Leertaste, `abgeben` = Enter prüft). */
async function waehle(page: Page, t: Texte, art: Bedienung, radio: Locator, { abgeben = true } = {}) {
  await expect(radio).toBeAttached();
  if (art === 'tippen') {
    await page.locator('main label').filter({ has: radio }).tap();
    await expect(radio).toBeChecked();
    if (abgeben) await pruefen(page, t, art);
  } else {
    await radio.focus();
    await page.keyboard.press('Space');
    await expect(radio).toBeChecked();
    if (abgeben) await page.keyboard.press('Enter');
  }
}

const radio = (scope: Page | Locator, name: string) => scope.getByRole('radio', { name, exact: true });

/** Schritte sortieren: je Ziel-Stelle den Schritt nach oben schieben (Tastatur: Alt + Pfeil, Tippen: Knopf). */
async function sortiere(page: Page, t: Texte, art: Bedienung, ui: 'de' | 'ar') {
  let folge = startFolge(RF);
  for (let ziel = 0; ziel < folge.length; ziel++) {
    while (folge.indexOf(ziel) > ziel) {
      const pos = folge.indexOf(ziel);
      const text = RF.schritte[ziel]!;
      const hoch = page.getByRole('button', { name: formatiere(t.aufgaben.reihenfolge.hoch, { text }, ui), exact: true });
      if (art === 'tippen') await hoch.tap();
      else {
        await hoch.focus();
        await page.keyboard.press('Alt+ArrowUp');
      }
      folge = verschiebe(folge, pos, -1);
      await expect(liveRegion(page)).toHaveText(formatiere(t.aufgaben.reihenfolge.verschoben, { text, nr: pos, anzahl: folge.length }, ui));
      if (art === 'tastatur') {
        // der Fokus bleibt beim verschobenen Schritt (am oberen Rand auf „nach unten“)
        const knopf =
          pos - 1 === 0 ? formatiere(t.aufgaben.reihenfolge.runter, { text }, ui) : formatiere(t.aufgaben.reihenfolge.hoch, { text }, ui);
        await expect(page.getByRole('button', { name: knopf, exact: true })).toBeFocused();
      }
    }
  }
  const reihe = await uebung(page, 'reihenfolge').locator('ol > li span[lang="de"]').allInnerTexts();
  expect(reihe).toEqual(RF.schritte);
}

async function richtig(page: Page, t: Texte, art: Bedienung) {
  await expect(liveRegion(page)).toContainText(t.spieler.richtig);
  await weiter(page, t, art);
}

async function spiele(page: Page, art: Bedienung) {
  const t = de;
  await page.goto(`/lern-app/de/tr-aus-de/ueben?l=${L01}`);

  // 1 wahr_falsch: Aussage in ihrer Sprache, Urteil, danach Ergebnis in Worten, Begründung, Quelle aufklappbar
  await expect(page.getByRole('heading', { name: t.aufgaben.wahr_falsch.stimmtDas })).toBeVisible();
  await expect(uebung(page, 'wahr_falsch').locator('p[lang="de"]').first()).toHaveText('[Aussage 1]');
  if (art === 'tastatur') expect(await ernsteBefunde(page, 'wahr_falsch')).toEqual([]);
  await waehle(page, t, art, radio(page, t.aufgaben.wahr_falsch.stimmtNicht));
  await expect(liveRegion(page)).toContainText(t.spieler.richtig);
  const weiterKnopf = page.getByRole('button', { name: t.spieler.weiter, exact: true });
  if (art === 'tastatur') await expect(weiterKnopf).toBeFocused();
  await expect(uebung(page, 'wahr_falsch')).toContainText(t.aufgaben.wahr_falsch.ergebnisFalsch);
  await expect(uebung(page, 'wahr_falsch').locator('bdi[lang="de"]').first()).toHaveText('[Begründung 1]');
  // Quellenzeile aufklappen (eigenes Bedienelement, danach weiter mit „Weiter“)
  await druecke(page, page.getByText(t.aufgaben.wissen.quelleZeigen, { exact: true }), art);
  await expect(page.getByText('[Werk, Kapitel, Ausgabe]', { exact: true })).toBeVisible();
  if (art === 'tastatur') expect(await ernsteBefunde(page, 'wahr_falsch nach der Antwort')).toEqual([]);
  await druecke(page, weiterKnopf, art);

  // 2 zuordnen: je Eintrag eine Radiogruppe (Legende = Eintrag)
  await expect(page.getByRole('heading', { name: t.aufgaben.zuordnen.ordneZu })).toBeVisible();
  if (art === 'tastatur') expect(await ernsteBefunde(page, 'zuordnen')).toEqual([]);
  const ziel = ['[Kategorie A]', '[Kategorie B]', '[Kategorie C]'];
  for (const [i, e] of ZO.eintraege.entries())
    await waehle(page, t, art, radio(page.getByRole('group', { name: e.text, exact: true }), ziel[i]!), {
      abgeben: i === ZO.eintraege.length - 1,
    });
  await expect(page.getByText(t.aufgaben.zuordnen.passt)).toHaveCount(3);
  await richtig(page, t, art);

  // 3 reihenfolge: auf dem Desktop zuerst ungeordnet prüfen (Rückmeldung je Stelle, kommt am Ende noch einmal)
  await expect(page.getByRole('heading', { name: t.aufgaben.reihenfolge.ordne })).toBeVisible();
  if (art === 'tastatur') {
    expect(await ernsteBefunde(page, 'reihenfolge')).toEqual([]);
    await pruefen(page, t, art);
    await expect(liveRegion(page)).toContainText(t.spieler.falsch);
    await expect(liveRegion(page)).toContainText(t.spieler.spaeter);
    await expect(uebung(page, 'reihenfolge')).toContainText(formatiere(t.aufgaben.reihenfolge.gehoertAn, { nr: 1 }, 'de'));
    await weiter(page, t, art);
  } else {
    await sortiere(page, t, art, 'de');
    await pruefen(page, t, art);
    await richtig(page, t, art);
  }

  // 4 fallfrage: Hinweis „keine Auskunft für eigene Fälle“
  await expect(page.getByRole('heading', { name: t.aufgaben.fallfrage.waehleAntwort })).toBeVisible();
  await expect(page.getByText(t.aufgaben.fallfrage.hinweis)).toBeVisible();
  if (art === 'tastatur') expect(await ernsteBefunde(page, 'fallfrage')).toEqual([]);
  await waehle(page, t, art, radio(page, '[Antwort B]'));
  await expect(uebung(page, 'fallfrage')).toContainText('[Begründung 2]');
  await richtig(page, t, art);

  // 5 koran_wort: Wortform in der Koranschrift mit Stelle, Bedeutungen als Radiogruppe
  await expect(page.getByRole('heading', { name: t.aufgaben.koran_wort.waehleBedeutung })).toBeVisible();
  await expect(uebung(page, 'koran_wort').locator('p[lang="ar"][dir="rtl"].font-quran')).toHaveText('[Wortform 1]');
  await expect(uebung(page, 'koran_wort')).toContainText(formatiere(t.aufgaben.koran_wort.stelle, { stelle: '0:0:1' }, 'de'));
  if (art === 'tastatur') expect(await ernsteBefunde(page, 'koran_wort')).toEqual([]);
  await waehle(page, t, art, radio(page, '[Bedeutung 1]'));
  await richtig(page, t, art);

  // Desktop: die Reihenfolge kommt noch einmal – jetzt per Tastatur sortieren
  if (art === 'tastatur') {
    await expect(page.getByText(t.spieler.nochEinmal, { exact: true })).toBeVisible();
    await sortiere(page, t, art, 'de');
    await pruefen(page, t, art);
    await richtig(page, t, art);
  }

  await expect(page.getByRole('heading', { name: t.spieler.fertigTitel })).toBeVisible();
  const imErsten = art === 'tastatur' ? 4 : 5;
  await expect(page.getByText(formatiere(t.spieler.fertigText, { richtig: imErsten, gesamt: 5 }, 'de'), { exact: true })).toBeVisible();
  // B-30: der Ring des Abschlusses zeichnet sich (reduziert: Endzustand)
  await expect(page.locator('main svg path.linie-zeichnet')).toHaveCount(1);
}

test.describe('Übungstypen aus L2-03 (Wissenskurs, Koran-Arabisch)', () => {
  test('Deutsch: alle fünf Typen nur mit der Tastatur', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'Tastatur auf dem Desktop, Tippen auf dem Telefon');
    test.setTimeout(150_000);
    await spiele(page, 'tastatur');
  });

  test('Deutsch: alle fünf Typen per Tippen', async ({ page }, info) => {
    test.skip(info.project.name !== 'telefon', 'Tippen auf dem Telefon, Tastatur auf dem Desktop');
    test.setTimeout(150_000);
    await spiele(page, 'tippen');
  });

  test('Arabische Oberfläche (RTL), deutscher Inhalt (LTR): wahr_falsch, zuordnen, reihenfolge, fallfrage', async ({ page }, info) => {
    test.setTimeout(150_000);
    const art: Bedienung = info.project.name === 'telefon' ? 'tippen' : 'tastatur';
    const t = ar as unknown as Texte;
    await page.goto(`/lern-app/ar/tr-aus-de/ueben?l=${L02}`);
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');

    await expect(page.getByRole('heading', { name: t.aufgaben.wahr_falsch.stimmtDas })).toBeVisible();
    await expect(uebung(page, 'wahr_falsch').locator('p[lang="de"][dir="ltr"]')).toHaveText('[Aussage 1]');
    await waehle(page, t, art, radio(page, t.aufgaben.wahr_falsch.stimmtNicht));
    await expect(uebung(page, 'wahr_falsch')).toContainText(t.aufgaben.wahr_falsch.ergebnisFalsch);
    await richtig(page, t, art);

    await expect(page.getByRole('heading', { name: t.aufgaben.zuordnen.ordneZu })).toBeVisible();
    await expect(uebung(page, 'zuordnen').locator('legend[lang="de"][dir="ltr"]').first()).toBeAttached();
    const ziel = ['[Kategorie A]', '[Kategorie B]', '[Kategorie A]'];
    for (const [i, e] of ZO.eintraege.entries())
      await waehle(page, t, art, radio(page.getByRole('group', { name: e.text, exact: true }), ziel[i]!), {
        abgeben: i === ZO.eintraege.length - 1,
      });
    // der dritte Eintrag gehört woandershin: Hinweis mit deutscher Kategorie, isoliert in der arabischen Zeile
    await expect(liveRegion(page)).toContainText(t.spieler.falsch);
    await expect(uebung(page, 'zuordnen').locator('bdi[lang="de"][dir="ltr"]', { hasText: '[Kategorie C]' })).toBeVisible();
    if (art === 'tastatur') expect(await ernsteBefunde(page, 'ar zuordnen')).toEqual([]);
    await weiter(page, t, art);

    await expect(page.getByRole('heading', { name: t.aufgaben.reihenfolge.ordne })).toBeVisible();
    await sortiere(page, t, art, 'ar');
    await pruefen(page, t, art);
    await richtig(page, t, art);

    await expect(page.getByRole('heading', { name: t.aufgaben.fallfrage.waehleAntwort })).toBeVisible();
    await waehle(page, t, art, radio(page, '[Antwort B]'));
    await richtig(page, t, art);

    // zuordnen kommt noch einmal (ohne Strafe)
    await expect(page.getByText(t.spieler.nochEinmal, { exact: true })).toBeVisible();
    for (const [i, e] of ZO.eintraege.entries())
      await waehle(
        page,
        t,
        art,
        radio(page.getByRole('group', { name: e.text, exact: true }), ['[Kategorie A]', '[Kategorie B]', '[Kategorie C]'][i]!),
        {
          abgeben: i === ZO.eintraege.length - 1,
        },
      );
    await richtig(page, t, art);
    await expect(page.getByRole('heading', { name: t.spieler.fertigTitel })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
  });
});
