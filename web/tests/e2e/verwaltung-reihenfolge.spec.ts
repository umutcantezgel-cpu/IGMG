import { mkdirSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect as basisExpect, test, type Page } from '@playwright/test';
import menueTexte from '../../messages/verwaltung/menues.json';
import seitenTexte from '../../messages/verwaltung/seiten.json';
import startseiteTexte from '../../messages/verwaltung/startseite.json';
import wissenTexte from '../../messages/verwaltung/wissen.json';
import { angemeldetesKonto } from './hilfen/konto';

/**
 * Reihenfolge per Tastatur in der Verwaltung und WCAG 2.4.11 „Fokus nicht verdeckt“ (Stufe-C-Nachprüfung 2, Z-07): Nach
 * jedem Verschieben liegt der fokussierte Knopf vollständig im Fenster und über der klebenden Speicherleiste
 * (Rechtecke gegen die Leiste, dazu die Mitte nicht verdeckt). Vorher wanderte er mit seinem Eintrag aus dem Bild.
 * - Startseite und Islamisches Wissen: ersten Eintrag per Enter bis ans Ende und zurück, Ansage der Live-Region je
 *   Schritt, Speichern, nach dem Neuladen dieselbe Ordnung; danach der Ausgangsstand (Standard bzw. alte Ordnung).
 * - Menü-Editor (Kopfmenü) und Bausteine im Seiten-Editor: kurzer Fall ohne Speichern.
 * Beide Breiten (390 und 1440 px). Startseite und Wissen sind eine gemeinsame Einstellung: Die Projekte „telefon“ und
 * „desktop“ können parallel laufen, deshalb gilt je Editor eine Sperre über beide Worker (`mitSperre`).
 */
const expect = basisExpect.configure({ timeout: 15_000 });
const st = startseiteTexte.startseite;
const wt = wissenTexte.wissen;
const mt = menueTexte.menues;
const bt = seitenTexte.seiten.baustein;

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => window.localStorage.setItem('igmg-konzepthinweis-gesehen', '1'));
});

/** Gegenseitiger Ausschluss über Worker hinweg (atomares mkdir); eine liegen gebliebene Sperre gilt nach 5 Minuten als frei. */
async function mitSperre<T>(name: string, f: () => Promise<T>): Promise<T> {
  const pfad = join(tmpdir(), `igmg-e2e-sperre-${name}`);
  const ende = Date.now() + 240_000;
  for (;;) {
    try {
      mkdirSync(pfad);
      break;
    } catch {
      try {
        if (Date.now() - statSync(pfad).mtimeMs > 300_000) rmSync(pfad, { recursive: true, force: true });
      } catch {
        // Sperre inzwischen frei
      }
      if (Date.now() > ende) throw new Error(`Sperre ${name} nicht frei`);
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  try {
    return await f();
  } finally {
    rmSync(pfad, { recursive: true, force: true });
  }
}

type Lage = { name: string; oben: number; unten: number; fenster: number; leisteOben: number | null; mitteFrei: boolean };

/** Lage des fokussierten Elements; die Leiste ist das Elternelement des Speichern-Knopfs (`speichern`: dessen Text). */
function fokusLage(page: Page, speichern: string): Promise<Lage> {
  return page.evaluate((text) => {
    const el = document.activeElement as HTMLElement;
    const r = el.getBoundingClientRect();
    const knopf = [...document.querySelectorAll('button[type="submit"]')].find((b) => b.textContent?.trim() === text);
    const leiste = knopf?.parentElement?.getBoundingClientRect() ?? null;
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const oben = y >= 0 && y < window.innerHeight ? document.elementFromPoint(x, y) : null;
    return {
      name: el.getAttribute('aria-label') ?? el.textContent?.trim() ?? el.tagName,
      oben: Math.round(r.top),
      unten: Math.round(r.bottom),
      fenster: window.innerHeight,
      leisteOben: leiste ? Math.round(leiste.top) : null,
      mitteFrei: !!oben && (oben === el || el.contains(oben)),
    };
  }, speichern);
}

const ganzSichtbar = (l: Lage) => l.oben >= 0 && l.unten <= l.fenster && (l.leisteOben === null || l.unten <= l.leisteOben) && l.mitteFrei;

/** Nach einem Schritt: Fokus auf `name` und – nach dem (weichen) Scrollen – ganz im Fenster über der Leiste. */
async function fokusSichtbar(page: Page, name: string, speichern: string, schritt: string) {
  await expect.poll(() => page.evaluate(() => document.activeElement?.getAttribute('aria-label') ?? ''), { message: schritt }).toBe(name);
  await expect
    .poll(async () => ganzSichtbar(await fokusLage(page, speichern)), {
      message: `${schritt}: Fokus ganz sichtbar über der Leiste`,
      timeout: 3000,
    })
    .toBe(true);
}

const ansage = (page: Page) => page.locator('form p[role="status"][aria-live="polite"]');

/** Verschiebbare Einträge (ohne festen Kopf) in der Reihenfolge der Liste, ohne den Vorsatz „Stelle n von m:“. */
async function eintraege(page: Page): Promise<string[]> {
  const items = page.locator('form ol[aria-labelledby] > li').filter({ has: page.getByRole('button', { name: /^Nach oben: / }) });
  return (await items.locator('h3').allInnerTexts()).map((t) => t.replace(/^Stelle \d+ von \d+:\s*/, '').trim());
}

type EditorTexte = { nachOben: string; nachUnten: string; verschoben: string; speichern: string; gespeichert: string };

/**
 * Reihenfolge-Editor (Startseite, Wissen): ersten Eintrag per Enter ganz nach unten, zweimal nach oben; je Schritt Ansage,
 * Ordnung und Fokuslage. Speichern, neu laden, Ordnung bleibt. Liefert Ausgangs- und gespeicherte Ordnung.
 */
async function verschiebeUndSpeichere(page: Page, texte: EditorTexte, versatz: number) {
  const vorher = await eintraege(page);
  expect(vorher.length).toBeGreaterThan(3);
  const anzahl = vorher.length + versatz;
  const x = vorher[0];
  const runter = texte.nachUnten.replace('{name}', x);
  const hoch = texte.nachOben.replace('{name}', x);
  const verschoben = (stelle: number) =>
    texte.verschoben
      .replace('{name}', x)
      .replace('{nr}', String(stelle + 1 + versatz))
      .replace('{anzahl}', String(anzahl));
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.getByRole('button', { name: runter, exact: true }).focus();
  for (let i = 1; i < vorher.length; i++) {
    await page.keyboard.press('Enter');
    await expect(ansage(page)).toHaveText(verschoben(i));
    await expect.poll(async () => (await eintraege(page))[i]).toBe(x);
    // Am Ende ist „Nach unten“ gesperrt: Der Fokus wechselt auf den Gegenknopf
    await fokusSichtbar(page, i < vorher.length - 1 ? runter : hoch, texte.speichern, `Enter ${i} nach unten`);
  }
  for (let j = 1; j <= 2; j++) {
    await page.keyboard.press('Enter');
    const stelle = vorher.length - 1 - j;
    await expect(ansage(page)).toHaveText(verschoben(stelle));
    await expect.poll(async () => (await eintraege(page))[stelle]).toBe(x);
    await fokusSichtbar(page, hoch, texte.speichern, `Enter ${j} nach oben`);
  }
  const erwartet = await eintraege(page);
  expect(erwartet).not.toEqual(vorher);
  await page.getByRole('button', { name: texte.speichern, exact: true }).click();
  await expect(page.getByText(texte.gespeichert, { exact: true })).toBeVisible();
  await page.reload();
  await expect.poll(() => eintraege(page)).toEqual(erwartet);
  return { vorher, x, hoch };
}

test('Startseite: Abschnitte per Tastatur verschieben – Fokus bleibt über der Speicherleiste, Ansage, Ordnung bleibt nach dem Neuladen', async ({
  page,
}) => {
  test.setTimeout(300_000);
  await angemeldetesKonto(page, 'redaktion');
  await mitSperre('startseite', async () => {
    await page.goto('/verwaltung/startseite');
    await expect(page.getByRole('heading', { level: 1, name: st.titel })).toBeVisible();
    await expect(page.getByRole('button', { name: st.editor.speichern })).toBeEnabled();
    await verschiebeUndSpeichere(page, st.editor, 1);
    // Ausgangsstand: Standardreihenfolge
    await page.getByText(st.zuruecksetzen, { exact: true }).first().click();
    await page.getByRole('button', { name: st.zuruecksetzen, exact: true }).click();
    await expect(page.getByText(st.zurueckgesetzt, { exact: true })).toBeVisible();
  });
});

test('Islamisches Wissen: Themen per Tastatur verschieben – Fokus bleibt über der Speicherleiste, Ansage, Ordnung bleibt nach dem Neuladen', async ({
  page,
}) => {
  test.setTimeout(300_000);
  await angemeldetesKonto(page, 'redaktion');
  await mitSperre('wissen', async () => {
    await page.goto('/verwaltung/wissen?ansicht=reihenfolge');
    await expect(page.getByRole('heading', { level: 1, name: wt.titel })).toBeVisible();
    await expect(page.getByRole('button', { name: wt.editor.speichern })).toBeEnabled();
    const { vorher, x, hoch } = await verschiebeUndSpeichere(page, wt.editor, 0);
    // Ausgangsstand: das Thema per Tastatur wieder ganz nach oben (Fokus je Schritt sichtbar), speichern
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.getByRole('button', { name: hoch, exact: true }).focus();
    for (let stelle = (await eintraege(page)).indexOf(x) - 1; stelle >= 0; stelle--) {
      await page.keyboard.press('Enter');
      await expect.poll(async () => (await eintraege(page))[stelle]).toBe(x);
      await fokusSichtbar(
        page,
        stelle > 0 ? hoch : wt.editor.nachUnten.replace('{name}', x),
        wt.editor.speichern,
        `zurück an Stelle ${stelle + 1}`,
      );
    }
    await page.getByRole('button', { name: wt.editor.speichern, exact: true }).click();
    await expect(page.getByText(wt.editor.gespeichert, { exact: true })).toBeVisible();
    await page.reload();
    await expect.poll(() => eintraege(page)).toEqual(vorher);
  });
});

test('Menü-Editor: Eintrag per Tastatur verschieben – Fokus bleibt über der Speicherleiste (ohne Speichern)', async ({ page }) => {
  test.setTimeout(180_000);
  await angemeldetesKonto(page, 'redaktion');
  await page.goto('/verwaltung/menues');
  await expect(page.getByRole('heading', { level: 1, name: mt.titel })).toBeVisible();
  // Erster Eintrag der ersten Gruppe; die Beschriftung nennt die Stelle („Eintrag 1: …“) und ändert sich beim Verschieben
  const erster = page.getByRole('button', { name: /^Nach unten: Eintrag 1: / }).first();
  const beschriftung = (await erster.getAttribute('aria-label')) ?? '';
  const titel = beschriftung.replace(/^Nach unten: Eintrag 1: /, '');
  const name = (nr: number) => mt.eintragName.replace('{nr}', String(nr)).replace('{titel}', titel);
  await page.evaluate(() => window.scrollTo(0, 0));
  await erster.focus();
  let schritte = 0;
  for (let nr = 1; nr <= 6; nr++) {
    const knopf = page.getByRole('button', { name: mt.nachUnten.replace('{name}', name(nr)), exact: true });
    if (await knopf.isDisabled()) break;
    await page.keyboard.press('Enter');
    schritte++;
    await expect(ansage(page)).toHaveText(mt.verschoben.replace('{name}', name(nr)).replace('{nr}', String(nr + 1)));
    const weiter = page.getByRole('button', { name: mt.nachUnten.replace('{name}', name(nr + 1)), exact: true });
    const ziel = (await weiter.isDisabled()) ? mt.nachOben.replace('{name}', name(nr + 1)) : mt.nachUnten.replace('{name}', name(nr + 1));
    await fokusSichtbar(page, ziel, mt.speichern, `Menü: Enter ${nr}`);
  }
  expect(schritte, 'mindestens zwei Schritte im Kopfmenü').toBeGreaterThanOrEqual(2);
});

test('Seiten-Editor: Baustein per Tastatur verschieben – Fokus bleibt über der Speicherleiste (ohne Speichern)', async ({ page }) => {
  test.setTimeout(180_000);
  await angemeldetesKonto(page, 'redaktion');
  await page.goto('/verwaltung/seiten/neu');
  await expect(page.getByRole('heading', { level: 1, name: seitenTexte.seiten.neu })).toBeVisible();
  // Der Texteditor entsteht erst im Browser: sichtbar = Formular ist hydriert
  await expect(page.getByRole('textbox', { name: 'Text', exact: true })).toBeVisible();
  const typ = bt.typ.faq.name;
  for (let n = 0; n < 3; n++) {
    await page.getByRole('button', { name: bt.hinzufuegen, exact: true }).click();
    await page.getByRole('button', { name: new RegExp(`^${typ}`) }).click();
  }
  const text = bt.typ.text.name;
  const name = (nr: number) => bt.bausteinName.replace('{nr}', String(nr)).replace('{typ}', text);
  const speichern = seitenTexte.seiten.formular.erstellen;
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.getByRole('button', { name: bt.nachUntenName.replace('{name}', name(1)), exact: true }).focus();
  for (let nr = 1; nr <= 3; nr++) {
    await page.keyboard.press('Enter');
    const erwartet = bt.verschoben
      .replace('{typ}', text)
      .replace('{nr}', String(nr + 1))
      .replace('{anzahl}', '4');
    await expect(page.locator('p[role="status"][aria-live="polite"]').filter({ hasText: erwartet })).toHaveCount(1);
    // Am Ende ist „Nach unten“ gesperrt: Der Fokus geht auf den Kopf des Bausteins (ohne aria-label, Name aus dem Text)
    if (nr < 3) await fokusSichtbar(page, bt.nachUntenName.replace('{name}', name(nr + 1)), speichern, `Baustein: Enter ${nr}`);
    else
      await expect
        .poll(async () => ganzSichtbar(await fokusLage(page, speichern)), { message: 'Baustein: Kopf ganz sichtbar', timeout: 3000 })
        .toBe(true);
  }
});
