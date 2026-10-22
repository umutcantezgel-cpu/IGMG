import { expect, test } from '@playwright/test';
import ar from '../../../messages/lernapp/ar.json';
import de from '../../../messages/lernapp/de.json';
import { ABZEICHEN } from '../../../src/lib/lernapp/ereignisse/abzeichen';
import { formatiere } from '../../../src/lib/lernapp/format';
import { ernsteBefunde, KURS, LEKTION_1, spieleLektion1 } from './hilfen';

/**
 * Spielelemente ohne Konto (L7-01, ADR 0043, PLAN §8): Nach der ersten Lektion zeigt „Fortschritt“ Kennzahlen, Serie und
 * das erste Abzeichen aus dem Protokoll des Geräts; die übrigen Abzeichen stehen zugeklappt mit ihrer Bedingung (ohne
 * Gruppenziel). In den Einstellungen lassen sich Pausetage je Woche wählen und eine Ruhezeit eintragen; Fehler stehen als
 * Text am Feld, und der Fokus geht auf das erste betroffene Feld; jede Meldung ist ein neuer Knoten der Live-Region (auch
 * dieselbe ein zweites Mal). Die Startseite nennt danach die gewählten Pausetage. axe ohne ernste oder kritische Befunde.
 */

/** Lerntag in `tage` Tagen (Ortszeit der Testmaschine = des Browsers), `JJJJ-MM-TT`. */
function tagIn(tage: number): string {
  const d = new Date();
  d.setDate(d.getDate() + tage);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
const datum = (tag: string) =>
  new Intl.DateTimeFormat('de', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${tag}T00:00:00Z`));

test('Fortschritt, Serie und Abzeichen aus dem Protokoll; Pausetage und Ruhezeit', async ({ page }, info) => {
  test.setTimeout(120_000);
  const befunde: string[] = [];

  await page.goto('/lern-app/de/fortschritt');
  await expect(page.getByText(de.fortschritt.leer)).toBeVisible();

  await page.goto(`/lern-app/de/${KURS}/ueben?l=${LEKTION_1}`);
  await spieleLektion1(page, info.project.name === 'telefon' ? 'tippen' : 'tastatur');

  // Fortschritt: Kennzahlen statisch, Serie, erstes Abzeichen; weitere zugeklappt (ohne Gruppenziel)
  await page.goto('/lern-app/de/fortschritt');
  const stand = page.locator('#fortschritt-stand');
  await expect(stand.getByRole('heading', { name: de.fortschritt.bisher })).toBeVisible();
  const kennzahlen = stand.locator('dl > div');
  await expect(kennzahlen.filter({ hasText: de.fortschritt.lerntage })).toContainText('1');
  await expect(kennzahlen.filter({ hasText: de.fortschritt.xp }).first()).toContainText('10');
  await expect(stand).toContainText(formatiere(de.serie.laenge, { n: 1 }, 'de'));
  const erstes = stand.locator('[data-abzeichen="lektionen-1"]');
  await expect(erstes).toContainText(formatiere(de.abzeichen.arten.lektionen.name, { n: 1 }, 'de'));
  await expect(erstes).toContainText(formatiere(de.abzeichen.arten.lektionen.text, { n: 1 }, 'de'));
  const offen = ABZEICHEN.filter((a) => a.id !== 'lektionen-1' && a.gruppe !== 'gruppe').length;
  const weitere = stand.locator('details > summary');
  await expect(weitere).toHaveText(formatiere(de.abzeichen.weitere, { n: offen }, 'de'));
  await weitere.click();
  await expect(stand.locator('details [data-abzeichen]')).toHaveCount(offen);
  await expect(stand.locator('[data-abzeichen="gruppe-ziel"]')).toHaveCount(0);
  befunde.push(...(await ernsteBefunde(page, 'Fortschritt')));

  // Einstellungen: ein Pausetag je Woche, Ruhezeit (Fehler als Text, dann eingetragen)
  await page.goto('/lern-app/de/einstellungen');
  const gespeichert = page.getByText(de.einstellungen.gespeichert, { exact: true });
  // Standard sind 2 Pausetage: erst 3, dann 1 wählen (zwei Speicherungen mit derselben Meldung)
  await page.getByRole('radio', { name: formatiere(de.einstellungen.pausetage, { n: 3 }, 'de') }).check();
  await expect(gespeichert).toBeVisible();
  // dieselbe Meldung noch einmal: neuer Knoten in der Live-Region, damit sie wieder angesagt wird
  const ersteMeldung = await gespeichert.elementHandle();
  await page.getByRole('radio', { name: formatiere(de.einstellungen.pausetage, { n: 1 }, 'de') }).check();
  await expect.poll(() => ersteMeldung!.evaluate((n) => n.isConnected)).toBe(false);
  await expect(gespeichert).toBeVisible();
  const von = page.getByLabel(de.einstellungen.ruhezeitVon);
  const bis = page.getByLabel(de.einstellungen.ruhezeitBis);
  const eintragen = page.getByRole('button', { name: de.einstellungen.ruhezeitEintragen });
  // Fehler: Text am Feld, Fokus auf das erste betroffene Feld (bei fehlendem Datum genau dieses)
  await von.fill(tagIn(12));
  await eintragen.click();
  await expect(page.getByText(de.einstellungen.ruhezeitFehler.form)).toBeVisible();
  await expect(bis).toBeFocused();
  await expect(bis).toHaveAttribute('aria-invalid', 'true');
  await expect(von).not.toHaveAttribute('aria-invalid', 'true');
  await bis.fill(tagIn(10));
  await eintragen.click();
  await expect(page.getByText(de.einstellungen.ruhezeitFehler.reihenfolge)).toBeVisible();
  await expect(von).toBeFocused();
  await expect(von).toHaveAttribute('aria-invalid', 'true');
  await expect(von).toHaveAccessibleDescription(de.einstellungen.ruhezeitFehler.reihenfolge);
  await bis.fill(tagIn(14));
  await eintragen.click();
  await expect(page.getByText(de.einstellungen.ruhezeitEingetragen, { exact: true })).toBeVisible();
  await expect(page.getByText(de.einstellungen.ruhezeitFehler.reihenfolge)).toHaveCount(0);
  await expect(page.getByRole('listitem').filter({ hasText: datum(tagIn(12)) })).toHaveText(
    formatiere(de.einstellungen.ruhezeitZeitraum, { von: datum(tagIn(12)), bis: datum(tagIn(14)) }, 'de'),
  );
  befunde.push(...(await ernsteBefunde(page, 'Einstellungen')));

  // Start: Serie mit dem gewählten Pausetag
  await page.goto('/lern-app/de');
  await expect(page.getByText(formatiere(de.serie.pausetage, { n: 1 }, 'de'))).toBeVisible();
  expect(befunde).toEqual([]);
});

/**
 * Stufe je Kurs abgeschlossen (L4-03, ADR 0043 Nr. 5): Ein Protokoll mit den Prüfsteinen aller zwölf A1-Einheiten von
 * `tr-aus-de` (synthetisch, als Sicherungsdatei eingelesen – ohne Konto, nur auf dem Gerät) ergibt das Abzeichen „Stufe
 * A1“, auf „Fortschritt“ den Kurs mit seiner abgeschlossenen Stufe (auch in der arabischen Oberfläche, RTL) und im Lernpfad
 * „Stufe abgeschlossen“ an der Stufe A1. Kein Zertifikat; axe ohne ernste oder kritische Befunde.
 */
test('Stufe abgeschlossen: Abzeichen, Fortschritt je Kurs und Lernpfad', async ({ page }) => {
  test.setTimeout(90_000);
  const befunde: string[] = [];
  const geraet = '00000000-0000-4000-8000-0000000000e3';
  const ereignisse = Array.from({ length: 12 }, (_, i) => {
    const tag = tagIn(i - 12);
    const einheit = `e${String(i + 1).padStart(2, '0')}`;
    return {
      geraet,
      seq: i,
      am: `${tag}T10:00:00.000Z`,
      tag,
      art: 'lektion',
      daten: { kurs: KURS, lektion: `${KURS}.a1.${einheit}.l08`, art: 'pruefstein', richtig: 9, gesamt: 10 },
    };
  });
  const datei = {
    format: 'igmg-lernapp-export',
    version: 1,
    erstellt: new Date().toISOString(),
    profil: { name: '[Testprofil]', oberflaeche: 'de', angelegt: new Date().toISOString() },
    ereignisse,
  };

  await page.goto('/lern-app/de/einstellungen');
  const [auswahl] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.getByRole('button', { name: de.einstellungen.einlesen }).click(),
  ]);
  await auswahl.setFiles({ name: 'stufe-a1.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(datei)) });
  await expect(page.getByText(formatiere(de.einstellungen.eingelesen, { n: 12 }, 'de'), { exact: true })).toBeVisible({ timeout: 30_000 });

  // Fortschritt: Abzeichen „Stufe A1“ (erhalten, nicht zugeklappt) und der Kurs mit seiner Stufe
  await page.goto('/lern-app/de/fortschritt');
  const stand = page.locator('#fortschritt-stand');
  const stufeA1 = stand.locator('[data-abzeichen="stufe-a1"]');
  await expect(stufeA1).toBeVisible();
  await expect(stufeA1).toContainText(formatiere(de.abzeichen.arten.stufe.name, { stufe: 'A1' }, 'de'));
  // A2 ist noch offen: nur im zugeklappten Teil „weitere Abzeichen“
  await expect(stand.locator('[data-abzeichen="stufe-a2"]')).toBeHidden();
  await expect(stand.getByRole('heading', { level: 2, name: de.ansichten.stufen.titel })).toBeVisible();
  const kurs = stand.locator(`li[data-kurs="${KURS}"]`);
  await expect(kurs).toContainText(formatiere(de.ansichten.stufen.kurs, { ziel: de.kurse.ziel.tr, fuer: de.kurse.fuer.de }, 'de'));
  await expect(kurs.locator('[data-stufe]')).toHaveText([de.lernpfad.stufe.a1]);
  await expect(stand).not.toContainText(/Zertifikat erhalten|Urkunde/);
  befunde.push(...(await ernsteBefunde(page, 'Fortschritt Stufen')));

  // Lernpfad: „Stufe abgeschlossen“ an A1
  await page.goto(`/lern-app/de/${KURS}`);
  const marke = page.locator('[data-stufe-abgeschlossen="a1"]');
  await expect(marke).toHaveText(de.ansichten.stufen.abgeschlossen);
  await expect(page.getByRole('heading', { level: 3, name: de.lernpfad.stufe.a1, exact: true })).toBeVisible();
  befunde.push(...(await ernsteBefunde(page, 'Lernpfad Stufe')));

  // arabische Oberfläche (RTL): derselbe Stand des Geräts, Texte auf Arabisch
  await page.goto('/lern-app/ar/fortschritt');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator(`#fortschritt-stand li[data-kurs="${KURS}"]`)).toContainText(ar.kurse.ziel.tr);
  await expect(page.locator('#fortschritt-stand').getByRole('heading', { level: 2, name: ar.ansichten.stufen.titel })).toBeVisible();
  befunde.push(...(await ernsteBefunde(page, 'Fortschritt Stufen ar')));
  expect(befunde).toEqual([]);
});
