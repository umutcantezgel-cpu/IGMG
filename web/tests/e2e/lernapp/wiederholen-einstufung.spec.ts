import { expect, type Page, test } from '@playwright/test';
import de from '../../../messages/lernapp/de.json';
import type { AufgabeVon } from '../../../src/lib/lernapp/aufgaben/schema';
import { formatiere } from '../../../src/lib/lernapp/format';
import { ernsteBefunde, KURS, LEKTION_1, liveRegion, PAARE, spieleLektion1 } from './hilfen';
import { bietePaketeAn, lektion, sammleSkripte, ZOD_MARKE } from './synthetisch';

/**
 * Wiederholen und Einstufung (PLAN §3.1, §14 L2-04; ADR 0043 Nr. 6; Befund TBT der L1-Gegenprüfung):
 * - Einstufung über zwei Stufen (synthetisches Paket mit Platzhaltern): A1 zweimal richtig → A2, dort zweimal falsch →
 *   Vorschlag A2 mit ihrer ersten Einheit; Ereignis `einstufung` auf dem Gerät, „Weiter lernen“ zeigt dorthin. Zod kommt
 *   erst mit „Test beginnen“.
 * - Wiederholen mit dem Testkurs: ohne Karten ein freundlicher Leerzustand ohne Zod; nach einer Lektion mit einem Fehler
 *   eine Runde aus den Paketen, bis zum Ende gespielt.
 * Der Service Worker ist gesperrt, damit jede Anfrage (und jedes Skript) im Test sichtbar ist.
 */

test.use({ serviceWorkers: 'block' });

const t = de;
const STUFEN = ['a1', 'a2'] as const;
const aufgabe = (stufe: string, i: number): AufgabeVon<'auswahl'> => ({
  typ: 'auswahl',
  schluessel: `tr.${stufe}.e01.l01.a0${i}`,
  anweisung: 'waehleAntwort',
  vorgabe: { text: `[Frage ${stufe} ${i}]`, sprache: 'de' },
  optionen: [
    { text: `[richtig ${stufe} ${i}]`, sprache: 'de' },
    { text: `[anders ${stufe} ${i}]`, sprache: 'de' },
  ],
  richtig: 0,
});

async function ruhig(page: Page) {
  await page.waitForLoadState('networkidle');
}

/** Ereignisse einer Art aus der lokalen Datenbank `igmg-lernapp`. */
async function ereignisse(page: Page, art: string): Promise<{ daten: Record<string, unknown> }[]> {
  return page.evaluate(async (a) => {
    const db = await new Promise<IDBDatabase>((ok, f) => {
      const r = indexedDB.open('igmg-lernapp');
      r.onsuccess = () => ok(r.result);
      r.onerror = () => f(r.error);
    });
    const alle = await new Promise<{ art: string; daten: Record<string, unknown> }[]>((ok, f) => {
      const r = db.transaction('ereignisse').objectStore('ereignisse').getAll();
      r.onsuccess = () => ok(r.result as { art: string; daten: Record<string, unknown> }[]);
      r.onerror = () => f(r.error);
    });
    db.close();
    return alle.filter((e) => e.art === a).map((e) => ({ daten: e.daten }));
  }, art);
}

test('Einstufung: adaptiv über zwei Stufen, Vorschlag mit Einheit, Ereignis und „Weiter lernen“; Zod erst beim Start', async ({
  page,
}, info) => {
  test.setTimeout(120_000);
  const tastatur = info.project.name === 'desktop';
  await bietePaketeAn(
    page,
    STUFEN.map((stufe) => ({
      schluessel: `tr.${stufe}.e01`,
      stufe,
      thema: `[Thema ${stufe.toUpperCase()}]`,
      lektionen: [
        lektion(
          `tr-aus-de.${stufe}.e01.l01`,
          [1, 2, 3, 4].map((i) => aufgabe(stufe, i)),
        ),
      ],
    })),
  );
  const skripte = sammleSkripte(page);
  await page.goto(`/lern-app/de/${KURS}/einstufung`);
  await expect(page.getByText(t.einstufung.hinweis)).toBeVisible();
  const start = page.getByRole('button', { name: t.einstufung.start, exact: true });
  await ruhig(page);
  expect(skripte.texte.some((s) => s.includes(ZOD_MARKE))).toBe(false);
  if (tastatur) expect(await ernsteBefunde(page, 'einstufung start')).toEqual([]);
  await start.click();

  // A1: richtig, richtig → A2: falsch, falsch → Ende
  for (let n = 1; n <= 4; n++) {
    await expect(page.getByText(formatiere(t.einstufung.aufgabeVon, { nr: n, anzahl: 20 }, 'de'), { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: t.aufgaben.auswahl.waehleAntwort })).toBeVisible();
    // die Übung lädt als eigener Chunk (kurz „Aufgabe wird geladen …“): erst lesen, wenn die Optionen stehen
    await expect(page.getByRole('radio')).toHaveCount(2);
    const namen = await page.getByRole('radio').evaluateAll((r) => r.map((x) => x.closest('label')?.textContent ?? ''));
    const stufe = /\[(?:richtig|anders) (a\d)/.exec(namen.join(' '))?.[1];
    expect(stufe).toBe(n <= 2 ? 'a1' : 'a2');
    const wahl = namen
      .find((x) => x.includes(stufe === 'a1' ? '[richtig' : '[anders'))!
      .replace(/^\d+/, '')
      .trim();
    const radio = page.getByRole('radio', { name: wahl, exact: true });
    if (tastatur) {
      await radio.focus();
      await page.keyboard.press('Space');
      await page.keyboard.press('Enter');
    } else {
      await page.locator('main label').filter({ has: radio }).click();
      await page.getByRole('button', { name: t.spieler.pruefen, exact: true }).click();
    }
    await expect(liveRegion(page)).toContainText(stufe === 'a1' ? t.spieler.richtig : t.spieler.falsch);
    // keine Wiederholung im Test
    await expect(liveRegion(page)).not.toContainText(t.spieler.spaeter);
    if (n === 1 && tastatur) expect(await ernsteBefunde(page, 'einstufung frage')).toEqual([]);
    const weiter = page.getByRole('button', { name: t.spieler.weiter, exact: true });
    if (tastatur) {
      await expect(weiter).toBeFocused();
      await page.keyboard.press('Enter');
    } else await weiter.click();
  }

  await expect(page.getByRole('heading', { name: t.einstufung.ergebnisTitel })).toBeVisible();
  await expect(page.getByText(formatiere(t.einstufung.ergebnisStufe, { stufe: 'A2' }, 'de'), { exact: true })).toBeVisible();
  await expect(page.getByText(`${formatiere(t.lernpfad.einheit, { n: 2 }, 'de')}: [Thema A2]`)).toBeVisible();
  await expect(page.getByText(formatiere(t.einstufung.ergebnisText, { richtig: 2, gesamt: 4 }, 'de'), { exact: true })).toBeVisible();
  const einsteigen = page.getByRole('link', { name: t.einstufung.einsteigen });
  await expect(einsteigen).toHaveAttribute('href', `/lern-app/de/${KURS}/ueben?l=tr-aus-de.a2.e01.l01`);
  expect(skripte.texte.some((s) => s.includes(ZOD_MARKE))).toBe(true);
  expect(await ereignisse(page, 'einstufung')).toEqual([
    { daten: { kurs: KURS, stufe: 'a2', einheit: 'tr.a2.e01', richtig: 2, gesamt: 4 } },
  ]);
  // keine Karten-Bewertung und keine XP aus dem Test
  expect(await ereignisse(page, 'bewertung')).toEqual([]);
  expect(await ereignisse(page, 'xp')).toEqual([]);

  await page.goto('/lern-app/de');
  await expect(page.locator(`main a[href="/lern-app/de/${KURS}/ueben?l=tr-aus-de.a2.e01.l01"]`)).toContainText(t.heute.weiter);
});

/** Eine Aufgabe der Wiederholungsrunde (aus Lektion 1 des Testkurses) richtig lösen. */
async function loese(page: Page) {
  const form = page.locator('main form[data-aufgabe]');
  const typ = await form.getAttribute('data-aufgabe');
  if (typ === 'auswahl') {
    const ueberschrift = await page.locator('main form h2').innerText();
    const ziel = ueberschrift === t.aufgaben.auswahl.waehleUebersetzung ? 'Wasser' : 'kitap';
    await page
      .locator('main label')
      .filter({ has: page.getByRole('radio', { name: ziel, exact: true }) })
      .click();
    await page.getByRole('button', { name: t.spieler.pruefen, exact: true }).click();
  } else if (typ === 'paare') {
    for (const [links, rechts] of PAARE) {
      await page.getByRole('button', { name: links, exact: true }).click();
      await page.getByRole('button', { name: rechts, exact: true }).click();
    }
  } else if (typ === 'wortbank') {
    for (const w of ['Su', 'içiyorum']) {
      const kachel = page.getByRole('button', { name: formatiere(t.aufgaben.wortbank.hinzufuegen, { wort: w }, 'de'), exact: true });
      await kachel.click();
      await expect(kachel).toHaveCount(0);
    }
    await page.getByRole('button', { name: t.spieler.pruefen, exact: true }).click();
  } else throw new Error(`unerwarteter Typ ${typ}`);
  await expect(liveRegion(page)).toContainText(t.spieler.richtig);
  await page.getByRole('button', { name: t.spieler.weiter, exact: true }).click();
}

test('Wiederholen: ohne Karten leer und ohne Zod; nach einer Lektion mit Fehler eine Runde bis zum Ende', async ({ page }, info) => {
  test.setTimeout(150_000);
  const skripte = sammleSkripte(page);
  await page.goto(`/lern-app/de/${KURS}/wiederholen`);
  await expect(page.getByText(t.wiederholen.leer, { exact: true })).toBeVisible();
  await ruhig(page);
  expect(skripte.texte.some((s) => s.includes(ZOD_MARKE))).toBe(false);

  await page.goto(`/lern-app/de/${KURS}/ueben?l=${LEKTION_1}`);
  await spieleLektion1(page, info.project.name === 'telefon' ? 'tippen' : 'tastatur', { ersteFalsch: true });

  skripte.texte.length = 0;
  await page.goto(`/lern-app/de/${KURS}/wiederholen`);
  await expect(page.locator('main form[data-aufgabe]')).toBeVisible();
  await expect(page.getByRole('progressbar', { name: t.spieler.fortschritt })).toBeVisible();
  for (let i = 0; i < 8 && (await page.locator('main form[data-aufgabe]').count()) > 0; i++) await loese(page);
  await expect(page.getByRole('heading', { name: t.spieler.fertigTitel })).toBeVisible();
  await expect(page.getByRole('link', { name: t.spieler.zurueck })).toBeVisible();
  expect(skripte.texte.some((s) => s.includes(ZOD_MARKE))).toBe(true);
  const lektionen = await ereignisse(page, 'lektion');
  expect(lektionen.map((l) => l.daten.art)).toEqual(['lektion', 'wiederholung']);
});
