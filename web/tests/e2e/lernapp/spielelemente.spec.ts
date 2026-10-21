import { expect, test } from '@playwright/test';
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
  await page.getByRole('radio', { name: formatiere(de.einstellungen.pausetage, { n: 2 }, 'de') }).check();
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
