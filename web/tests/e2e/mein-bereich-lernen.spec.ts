import { execFileSync } from 'node:child_process';
import { randomBytes, randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { expect as basisExpect, test, type Page } from '@playwright/test';
import * as OTPAuth from 'otpauth';
import kinderTexte from '../../messages/bereiche/kinder.json';
import kontoTexte from '../../messages/bereiche/konto.json';
import meinTexte from '../../messages/bereiche/mein-bereich.json';
import unterrichtTexte from '../../messages/bereiche/unterricht.json';
import { eigeneAbsenderAdresse } from './hilfen/konto';

/** Gegen den Entwicklungsserver kompiliert jede Seite beim ersten Aufruf noch (oft über 5 s) – großzügiger warten. */
const expect = basisExpect.configure({ timeout: 15_000 });

/**
 * Lernplattform in „Mein Bereich“ (Paket O-L02-UI, H-L06): Lehrkraft erfasst die Anwesenheit von „Heute“ auf einem
 * Bildschirm (Abmeldung der Eltern vorbelegt, B-23), Eltern melden ihr Kind ab – unter der strikten Nonce-CSP der
 * Konto-Seiten, mit Gruppenisolation (fremde Gruppe/fremdes Kind → 404).
 *
 * Voraussetzung: Funktionen `konten` und `lernplattform` an (FUNKTION_KONTEN=an FUNKTION_LERNPLATTFORM=an), sonst werden
 * die Tests übersprungen. Zugänge: `scripts/beispielkonten.ts --praefix <zufall> --json` (Beispielgruppe mit Termin heute
 * und Abmeldung für heute). Gegen einen Entwicklungsserver mit PGlite (ein Prozess) legt man sie vorher an und übergibt
 * die Datei mit E2E_BEISPIELKONTEN=<pfad>; die Lehrkraft dieser Zugänge darf noch keinen zweiten Faktor haben.
 */
const k = kontoTexte.de.konto;
const m = meinTexte.de.meinBereich;
const u = unterrichtTexte.de.unterricht;
const d = kinderTexte.de.kinder;

type Zugaenge = {
  lehrkraft: { email: string; passwort: string };
  eltern: { email: string; passwort: string };
  lernplattform: { gruppeId: string; gruppe: string; kinder: Record<'emre' | 'zeynep' | 'yunus', { id: string; name: string }> };
};

function beispielkonten(): Zugaenge {
  if (process.env.E2E_BEISPIELKONTEN) return JSON.parse(readFileSync(process.env.E2E_BEISPIELKONTEN, 'utf8')) as Zugaenge;
  const ausgabe = execFileSync(
    'pnpm',
    [
      '-s',
      'exec',
      'tsx',
      '--conditions=react-server',
      '--env-file-if-exists=.env',
      'scripts/beispielkonten.ts',
      '--praefix',
      randomBytes(4).toString('hex'),
      '--json',
    ],
    { cwd: process.cwd(), encoding: 'utf8' },
  );
  return JSON.parse(ausgabe.trim().split('\n').pop() ?? '{}') as Zugaenge;
}

let vorhanden: Zugaenge | null = null;
/** Erst im Test anlegen (übersprungene Projekte legen nichts an); je Lauf einmal. */
const zugaenge = () => (vorhanden ??= beispielkonten());
const passwort = (p: string | null) => p ?? process.env.BEISPIEL_PASSWORT ?? '';

function sammleKonsolenfehler(page: Page): string[] {
  const fehler: string[] = [];
  page.on('console', (n) => n.type() === 'error' && fehler.push(n.text()));
  page.on('pageerror', (e) => fehler.push(String(e)));
  return fehler;
}

async function emailAnmelden(page: Page, email: string, pw: string) {
  await page.goto('/anmelden');
  await page.getByLabel(k.felder.email).fill(email);
  await page.getByLabel(k.felder.passwort, { exact: true }).filter({ visible: true }).fill(pw);
  await page.getByRole('button', { name: k.anmelden.absenden, exact: true }).filter({ visible: true }).click();
  await expect(page).toHaveURL(/\/mein-bereich/);
}

/** Berliner Kalendertag in n Tagen (JJJJ-MM-TT). */
function tag(n: number): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Berlin' }).format(new Date(Date.now() + n * 86_400_000));
}

test.beforeEach(async ({ page, request }, info) => {
  test.skip(info.project.name !== 'desktop', 'Abläufe mit Anmeldung nur einmal je Lauf');
  test.skip((await request.get('/anmelden')).status() === 404, 'Funktion „konten“ ist aus – Server mit FUNKTION_KONTEN=an starten');
  const kinder = await request.get('/mein-bereich/kinder', { maxRedirects: 0 });
  test.skip(kinder.status() === 404, 'Funktion „lernplattform“ ist aus – Server mit FUNKTION_LERNPLATTFORM=an starten');
  await eigeneAbsenderAdresse(page);
});

test('Lehrkraft: Heute → Anwesenheit auf einem Bildschirm, Abmeldung vorbelegt, speichern (B-23)', async ({ page }) => {
  test.setTimeout(180_000);
  const fehler = sammleKonsolenfehler(page);
  const { lehrkraft, lernplattform: lp } = zugaenge();
  await emailAnmelden(page, lehrkraft.email, passwort(lehrkraft.passwort));

  // Lehrkraft: zweiter Faktor ist Pflicht – erst einrichten, dann geht es in den Unterricht
  await expect(page).toHaveURL(/\/mein-bereich\/konto\?faktor=pflicht$/);
  await page.getByLabel(m.konto.zweiFaktor.schritt1).fill(passwort(lehrkraft.passwort));
  await page.getByRole('button', { name: m.konto.zweiFaktor.weiter }).click();
  const geheimnis = (await page.getByTestId('totp-geheimnis').innerText()).trim();
  const totp = new OTPAuth.TOTP({ secret: OTPAuth.Secret.fromBase32(geheimnis), digits: 6, period: 30 });
  await page.getByLabel(m.konto.zweiFaktor.code).fill(totp.generate());
  await page.getByRole('button', { name: m.konto.zweiFaktor.bestaetigen }).click();
  await expect(page).toHaveURL(/faktor=eingerichtet/);

  await page.goto('/mein-bereich/unterricht');
  await expect(page.getByRole('heading', { level: 1, name: u.titel })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: u.heute.titel })).toBeVisible();
  // Fremde oder erfundene Gruppe: 404 (kein Unterschied zu „gibt es nicht“)
  expect((await page.request.get(`/mein-bereich/unterricht/${randomUUID()}`)).status()).toBe(404);

  await page.getByRole('link', { name: `${u.heute.anwesenheit}: ${lp.gruppe}, 16:00–17:30` }).click();
  await expect(page.getByRole('heading', { level: 2, name: u.anwesenheit.erfassen.titel })).toBeVisible();
  const status = u.anwesenheit.erfassen.status;
  // Zeynep ist von den Eltern für heute abgemeldet → „entschuldigt“ vorbelegt
  const zeynep = page.getByRole('group', { name: lp.kinder.zeynep.name });
  await expect(zeynep.getByRole('radio', { name: status.entschuldigt })).toBeChecked();
  await expect(page.getByText(u.anwesenheit.erfassen.fehlmeldung)).toBeVisible();
  await expect(page.getByRole('group', { name: lp.kinder.emre.name }).getByRole('radio', { name: status.anwesend })).toBeChecked();

  // Yunus fehlt – ein Druck, dann ein Knopf für alle
  const yunus = page.getByRole('group', { name: lp.kinder.yunus.name });
  await yunus.getByText(status.fehlt, { exact: true }).click();
  await expect(yunus.getByRole('radio', { name: status.fehlt })).toBeChecked();
  await expect(page.getByText(u.anwesenheit.erfassen.zaehler.replace('{anwesend}', '1').replace('{gesamt}', '3'))).toBeVisible();
  await page.getByRole('button', { name: u.anwesenheit.erfassen.speichern }).click();
  await expect(page.getByRole('status').filter({ hasText: u.anwesenheit.erfassen.gespeichert })).toBeVisible();

  // Gespeichert: nach dem Neuladen steht „fehlt“ (erfasst) statt der Vorbelegung
  await page.reload();
  await expect(page.getByRole('group', { name: lp.kinder.yunus.name }).getByRole('radio', { name: status.fehlt })).toBeChecked();
  await page.goto(`/mein-bereich/unterricht/${lp.gruppeId}`);
  await expect(page.getByText(u.gruppe.erfasst.replace('{anzahl}', '3')).first()).toBeVisible();

  expect(fehler.filter((f) => /Content Security Policy|Refused to/.test(f))).toEqual([]);
});

test('Eltern: Kind fehlt melden → erscheint als abgemeldet; fremde Kinder und Lehrkraft-Seiten bleiben zu', async ({ page }) => {
  test.setTimeout(120_000);
  const fehler = sammleKonsolenfehler(page);
  const { eltern, lernplattform: lp } = zugaenge();
  await emailAnmelden(page, eltern.email, passwort(eltern.passwort));

  await page.goto('/mein-bereich/kinder');
  await expect(page.getByRole('heading', { level: 1, name: d.titel })).toBeVisible();
  await page.getByRole('link', { name: d.karte.oeffnenAria.replace('{name}', lp.kinder.emre.name) }).click();
  await expect(page.getByRole('heading', { level: 1, name: lp.kinder.emre.name })).toBeVisible();

  const fehlen = page.getByRole('region', { name: d.detail.fehlenTitel });
  // EK-1: die nächsten Termine als Radiogruppe (deutsches Datum vom Server, kein natives Datumsfeld mehr)
  const termine = fehlen.getByRole('group', { name: d.detail.fehlen.datum });
  await expect(fehlen.locator('input[type=date]')).toHaveCount(0);
  const kurz = new Intl.DateTimeFormat('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit', timeZone: 'UTC' });
  const wahl = termine.getByRole('radio').nth(1);
  const tagWahl = (await wahl.getAttribute('value')) ?? '';
  expect(tagWahl >= tag(0)).toBe(true);
  const datum = kurz.format(new Date(`${tagWahl}T12:00:00Z`));
  await expect(termine.getByText(datum, { exact: true })).toBeVisible();
  await wahl.check();
  await fehlen.getByText(d.detail.fehlen.gruende.familie, { exact: true }).click();
  await fehlen.getByRole('button', { name: d.detail.fehlen.senden }).click();
  await expect(fehlen.getByRole('status').filter({ hasText: d.detail.fehlen.gesendet })).toBeVisible();
  await expect(fehlen.getByText(`${datum} – ${d.detail.fehlen.gruende.familie}`)).toBeVisible();
  // Der gemeldete Termin ist danach gesperrt
  await expect(termine.locator(`input[value="${tagWahl}"]`)).toBeDisabled();

  // Gruppenisolation: fremdes Kind 404, Lehrkraft-Seiten führen zurück nach Mein Bereich
  expect((await page.request.get(`/mein-bereich/kinder/${randomUUID()}`)).status()).toBe(404);
  await page.goto(`/mein-bereich/unterricht/${lp.gruppeId}`);
  await expect(page).toHaveURL(/\/mein-bereich$/);

  expect(fehler.filter((f) => /Content Security Policy|Refused to/.test(f))).toEqual([]);
});
