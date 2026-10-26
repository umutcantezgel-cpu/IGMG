import { expect, type Page, test } from '@playwright/test';
import ar from '../../../messages/lernapp/ar.json';
import de from '../../../messages/lernapp/de.json';
import tr from '../../../messages/lernapp/tr.json';
import { beantworteErste, ernsteBefunde } from './hilfen';
import { leseLernstandEin } from './lernstand';

/**
 * axe-Matrix der Lern-App (Stufe C N9b, ABNAHME Z-L06, KERN 4.0 §8): alle Lern-App-Routen mit echten Inhalten × Oberfläche
 * de/tr/ar × beide Projekte (telefon 390 px, desktop 1440 px). WCAG 2.0/2.1/2.2 A und AA (`hilfen.ts` `ernsteBefunde`, ohne
 * Ausschlüsse); gezählt werden ernste und kritische Befunde, Ziel 0. Dazu kein waagrechter Überlauf.
 *
 * Je Oberfläche ihr Sprachkurs (Ausgangssprache = Oberfläche) mit der ersten echten Einheit A1 (`<ziel>.a1.e01`):
 * - Rahmen: Auswahl (Kurswahl mit allen aufgeklappten Ausgangssprachen), Start (neues Gerät), Einstellungen, Quellen,
 *   Anmelden, Gruppe (Hülle; mit Daten prüft gruppe.spec.ts), nicht gefunden.
 * - Kurs: Lernpfad mit aufgeklappter Stufe (aktuelle Stufe A1 und von Hand aufgeklappt A2), Spieler einer echten Lektion vor
 *   und nach der Antwort, Tipps der Einheit, Einstufung (Start und erste Frage).
 * - Lernstand (eingelesene Sicherung mit fälligen Karten aus der echten Einheit, `lernstand.ts`): Start mit Stand,
 *   Wiederholen mit fälligen Karten vor und nach der Antwort, Wortschatz (bisher nur die Hülle, siehe Test), Fortschritt.
 * - Wissens- und Koran-Kurs: Lernpfad mit aufgeklapptem Inhalt (Wissen: Testeinheit mit zwei Freigaben aus dem Seed; Koran:
 *   erste Einheit mit Wortformen, nicht in der arabischen Oberfläche – dort gibt es den Pfad nicht, die Adresse ist 404 und
 *   wird als solche geprüft) und die erste Aufgabe der Wissenslektion.
 */

type Ui = 'de' | 'tr' | 'ar';
const TEXTE = { de, tr, ar } as const;
const UIS: Ui[] = ['de', 'tr', 'ar'];
const KURS: Record<Ui, string> = { de: 'tr-aus-de', tr: 'de-aus-tr', ar: 'de-aus-ar' };
const EINHEIT: Record<Ui, string> = { de: 'tr.a1.e01', tr: 'de.a1.e01', ar: 'de.a1.e01' };
const WISSEN = 'islam.grund.test';

const ueberlauf = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

/** Eine Prüfung: Überlauf 0, axe ohne ernste oder kritische Befunde (gesammelt, damit eine Matrix alle Funde zeigt). */
function pruefer(page: Page, ui: Ui, breite: number) {
  const befunde: string[] = [];
  const pruefe = async (name: string) => {
    await page.evaluate(() => document.fonts.ready);
    const ue = await ueberlauf(page);
    if (ue !== 0) befunde.push(`${ui} ${breite} ${name}: waagrechter Überlauf ${ue} px`);
    befunde.push(...(await ernsteBefunde(page, `${ui} ${breite} ${name}`)));
  };
  return { befunde, pruefe };
}

for (const ui of UIS) {
  const t = TEXTE[ui] as unknown as typeof de;
  const kurs = KURS[ui];
  const einheit = EINHEIT[ui];
  const [, stufe, teil] = einheit.split('.');
  const lektion = `${kurs}.${stufe}.${teil}.l01`;

  test.describe(`axe-Matrix ${ui}`, () => {
    test(`${ui} Rahmen: Auswahl, Start, Einstellungen, Quellen, Anmelden, Gruppe, nicht gefunden`, async ({ page }, info) => {
      test.setTimeout(150_000);
      const { befunde, pruefe } = pruefer(page, ui, info.project.name === 'telefon' ? 390 : 1440);

      await page.goto(`/lern-app/${ui}`);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(t.start.titel);
      await expect(page.getByText(t.heute.nochNichts)).toBeVisible();
      await pruefe('Start');
      // Auswahl: die Kurse der übrigen Ausgangssprachen aufgeklappt
      const andere = page.locator('main details[id^="kurse-aus-"]');
      await expect(andere).toHaveCount(2);
      for (const d of await andere.all()) {
        await d.locator('summary').click();
        await expect(d.locator('a').first()).toBeVisible();
      }
      await pruefe('Auswahl (alle Ausgangssprachen aufgeklappt)');

      for (const [name, pfad, warte] of [
        ['Einstellungen', '/einstellungen', 'main fieldset'],
        ['Quellen', '/quellen', 'main h1'],
        ['Anmelden', '/anmelden', 'main form'],
        ['Gruppe', '/gruppe', 'main h1'],
      ] as const) {
        await page.goto(`/lern-app/${ui}${pfad}`);
        await expect(page.locator(warte).first()).toBeVisible();
        await pruefe(name);
      }
      const antwort = await page.goto(`/lern-app/${ui}/gibt-es-nicht`);
      expect(antwort?.status()).toBe(404);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(t.nichtGefunden.titel);
      await pruefe('nicht gefunden');
      expect(befunde).toEqual([]);
    });

    test(`${ui} Kurs ${kurs}: Lernpfad (aufgeklappte Stufe), Spieler vor/nach der Antwort, Tipps, Einstufung`, async ({ page }, info) => {
      test.setTimeout(180_000);
      const { befunde, pruefe } = pruefer(page, ui, info.project.name === 'telefon' ? 390 : 1440);

      await page.goto(`/lern-app/${ui}/${kurs}`);
      // aktuelle Stufe A1 mit den Stationen (erstes Laden baut das Kursverzeichnis); die erste echte Einheit zeigt ihre
      // Lektionen auf Wunsch („Lektionen zeigen“)
      const zeigen = page
        .locator('main section[aria-labelledby^="einheit-"]')
        .getByRole('button', { name: t.lernpfad.lektionenZeigen, exact: true })
        .first();
      await expect(zeigen).toBeVisible({ timeout: 30_000 });
      await zeigen.click();
      await expect(page.locator(`main a[href="/lern-app/${ui}/${kurs}/ueben?l=${lektion}"]`)).toBeVisible();
      // A2 von Hand aufklappen: Stationen erscheinen erst dann
      const a2 = page.locator('main details[data-stufe-zu="a2"]');
      await a2.locator('summary').click();
      await expect(a2.locator('section[aria-labelledby^="einheit-"]').first()).toBeVisible({ timeout: 15_000 });
      await pruefe('Lernpfad (A1 und aufgeklappt A2)');

      await page.goto(`/lern-app/${ui}/${kurs}/ueben?l=${lektion}`);
      await expect(page.locator('main form[data-aufgabe]')).toBeVisible({ timeout: 20_000 });
      await expect(page.getByRole('radio').first()).toBeAttached();
      await pruefe(`Spieler ${lektion} vor der Antwort`);
      await beantworteErste(page, t);
      await pruefe(`Spieler ${lektion} nach der Antwort`);

      await page.goto(`/lern-app/${ui}/${kurs}/tipps?e=${einheit}`);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(t.tipps.titel);
      await expect(page.locator('main h2').first()).toBeVisible({ timeout: 20_000 });
      await pruefe(`Tipps ${einheit}`);

      await page.goto(`/lern-app/${ui}/${kurs}/einstufung`);
      const start = page.getByRole('button', { name: t.einstufung.start, exact: true });
      await expect(start).toBeVisible({ timeout: 20_000 });
      await pruefe('Einstufung (Start)');
      await start.click();
      await expect(page.locator('main form[data-aufgabe]')).toBeVisible({ timeout: 30_000 });
      await pruefe('Einstufung (erste Frage)');
      expect(befunde).toEqual([]);
    });

    test(`${ui} Lernstand: Start, Wiederholen mit fälligen Karten (vor/nach der Antwort), Wortschatz, Fortschritt`, async ({
      page,
    }, info) => {
      test.setTimeout(180_000);
      const { befunde, pruefe } = pruefer(page, ui, info.project.name === 'telefon' ? 390 : 1440);
      await leseLernstandEin(page, ui, kurs, einheit);

      await page.goto(`/lern-app/${ui}`);
      await expect(page.getByText(t.heute.nochNichts)).toHaveCount(0);
      await expect(page.locator(`main a[href="/lern-app/${ui}/${kurs}/wiederholen"]`).first()).toBeVisible({ timeout: 15_000 });
      await pruefe('Start mit Lernstand (fällige Karten)');

      await page.goto(`/lern-app/${ui}/${kurs}/wiederholen`);
      await expect(page.getByRole('progressbar', { name: t.spieler.fortschritt })).toBeVisible({ timeout: 30_000 });
      await pruefe('Wiederholen vor der Antwort');
      await beantworteErste(page, t);
      await pruefe('Wiederholen nach der Antwort');

      // Wortschatz: statische Hülle; die Insel mit den gelernten Wörtern ist noch nicht eingehängt (Seite wortschatz/page.tsx),
      // die Seite zeigt also auch mit Lernstand den Leerzustand
      await page.goto(`/lern-app/${ui}/wortschatz`);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(t.wortschatz.titel);
      await pruefe('Wortschatz (mit Lernstand)');

      await page.goto(`/lern-app/${ui}/fortschritt`);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(t.fortschritt.titel);
      await expect(page.getByText(t.fortschritt.leer)).toHaveCount(0);
      await pruefe('Fortschritt mit Lernstand');
      expect(befunde).toEqual([]);
    });

    test(`${ui} Wissens- und Koran-Kurs: Lernpfad mit aufgeklapptem Inhalt, erste Aufgabe der Wissenslektion`, async ({ page }, info) => {
      test.setTimeout(150_000);
      const { befunde, pruefe } = pruefer(page, ui, info.project.name === 'telefon' ? 390 : 1440);

      await page.goto(`/lern-app/${ui}/islam`);
      const link = page.locator(`main a[href="/lern-app/${ui}/islam/ueben?l=${WISSEN}.l01"]`);
      await expect(link).toBeVisible({ timeout: 30_000 });
      const inhalt = page.locator(`[data-lektionsinhalt="${WISSEN}.l01"]`);
      await inhalt.locator('summary').click();
      await expect(inhalt.locator('p[lang="de"]').first()).toBeVisible();
      await pruefe('Wissenskurs Lernpfad (Inhalt aufgeklappt)');

      await page.goto(`/lern-app/${ui}/islam/ueben?l=${WISSEN}.l01`);
      await expect(page.locator('main form[data-aufgabe]')).toBeVisible({ timeout: 20_000 });
      await pruefe('Wissenslektion vor der Antwort');
      await beantworteErste(page, t);
      await pruefe('Wissenslektion nach der Antwort');

      if (ui === 'ar') {
        const antwort = await page.goto('/lern-app/ar/koran');
        expect(antwort?.status(), 'Koran-Arabisch gibt es in der arabischen Oberfläche nicht').toBe(404);
        await expect(page.getByRole('heading', { level: 1 })).toHaveText(t.nichtGefunden.titel);
        await pruefe('Koran (404 in ar)');
      } else {
        await page.goto(`/lern-app/${ui}/koran`);
        const e01 = page.locator('details[data-einheit="koran.grund.e01"]');
        await expect(e01).toBeVisible({ timeout: 30_000 });
        await e01.locator('summary').click();
        await expect(e01.locator('li[data-stelle]').first()).toBeVisible();
        await pruefe('Koran-Kurs Lernpfad (erste Einheit aufgeklappt)');
      }
      expect(befunde).toEqual([]);
    });
  });
}
