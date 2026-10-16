import { randomBytes } from 'node:crypto';
import { expect as basisExpect, test, type Browser, type Page } from '@playwright/test';
import chatTexte from '../../messages/bereiche/chat-fenster.json';
import formulare from '../../messages/bereiche/formulare.json';
import kinderTexte from '../../messages/bereiche/kinder.json';
import kontoTexte from '../../messages/bereiche/konto.json';
import meinBereichTexte from '../../messages/bereiche/mein-bereich.json';
import unterrichtTexte from '../../messages/bereiche/unterricht.json';
import voranmeldung from '../../messages/bereiche/voranmeldung.json';
import lernenTexte from '../../messages/verwaltung/lernen.json';
import { ALTCHA_MS } from './hilfen/altcha';
import { beispielkonten, emailAnmelden, kindAnmelden, leitungAnmelden } from './hilfen/gemeinde';
import { angemeldetesKonto, eigeneAbsenderAdresse } from './hilfen/konto';

/** Mails gehen nach der Antwort – großzügig warten (ALTCHA: hilfen/altcha.ts). */
const expect = basisExpect.configure({ timeout: 20_000 });

/**
 * Lernkette im Browser (Z-17, Nacharbeit 2, P4) – das Gegenstück zu tests/integration/lernkette.test.ts über die
 * Oberflächen: Voranmeldung (öffentliches Formular, ALTCHA) → Bildung nimmt sie in der Verwaltung in die Beispielgruppe
 * auf und lädt Elternteil 1 ein → Eltern nehmen die Einladung aus der Mail (Mailpit) an, melden sich an, willigen in den
 * eigenen Zugang ein und legen ihn an → das Kind meldet sich an und sieht seine Gruppe → die Lehrkraft erfasst die
 * Anwesenheit „Heute“ → die Eltern sehen sie. Getrennte Browser-Kontexte je Person, Testdaten fiktiv (G-04). Nur Desktop.
 */
const MAILPIT = process.env.MAILPIT_URL ?? 'http://127.0.0.1:8025';
const v = voranmeldung.de.voranmeldung;
const fw = formulare.de.formulare;
const k = kontoTexte.de.konto;
const d = kinderTexte.de.kinder;
const u = unterrichtTexte.de.unterricht;
const a = lernenTexte.aufnahme;
const c = chatTexte.de.chatFenster;
const mb = meinBereichTexte.de.meinBereich;
const PASSWORT = 'Lernkette-Testpasswort-2026';

/** Nur Buchstaben (Namensfelder der Voranmeldung): eindeutiger Vorname je Lauf. */
const buchstaben = (n: number) =>
  Array.from(randomBytes(n))
    .map((b) => String.fromCharCode(97 + (b % 26)))
    .join('');

async function neueSeite(browser: Browser, baseURL: string | undefined): Promise<Page> {
  const kontext = await browser.newContext({
    baseURL,
    locale: 'de-DE',
    timezoneId: 'Europe/Berlin',
    viewport: { width: 1440, height: 900 },
  });
  const seite = await kontext.newPage();
  await seite.addInitScript(() => window.localStorage.setItem('igmg-konzepthinweis-gesehen', '1'));
  await eigeneAbsenderAdresse(seite);
  return seite;
}

/** Link aus der Einladungsmail an `an` (Mailpit). */
async function einladungsLink(an: string): Promise<string> {
  let link = '';
  await expect(async () => {
    const r = await fetch(`${MAILPIT}/api/v1/search?query=${encodeURIComponent(`to:"${an}"`)}`);
    const treffer = ((await r.json()) as { messages?: { ID: string; Subject: string }[] }).messages ?? [];
    const mail = treffer.find((m) => m.Subject === k.mails.einladung.betreff);
    expect(mail).toBeTruthy();
    const text = ((await (await fetch(`${MAILPIT}/api/v1/message/${mail!.ID}`)).json()) as { Text: string }).Text;
    link = text.match(/https?:\/\/\S+\/einladung\/[A-Za-z0-9_-]+/)?.[0] ?? '';
    expect(link).not.toBe('');
  }).toPass({ timeout: 30_000, intervals: [500, 1000, 2000] });
  return link;
}

test.beforeEach(async ({ request }, info) => {
  test.skip(info.project.name !== 'desktop', 'Abläufe mit Anmeldung nur einmal je Lauf');
  test.skip((await request.get('/anmelden')).status() === 404, 'Funktion „konten“ ist aus – Server mit FUNKTION_KONTEN=an starten');
});

test('Voranmeldung → Aufnahme → Eltern-Einladung → Kinderzugang → Kind sieht Gruppe → Anwesenheit → Eltern sehen sie', async ({
  browser,
  baseURL,
}) => {
  test.setTimeout(420_000);
  const z = beispielkonten();
  const lp = z.lernplattform;
  const vorname = `Testkind${buchstaben(5)}`;
  const anzeigename = `${vorname[0].toUpperCase()}${vorname.slice(1)} K.`;
  const elternEmail = `testperson.kette.${randomBytes(4).toString('hex')}@example.test`;

  // 1 Voranmeldung über das öffentliche Formular
  const oeffentlich = await neueSeite(browser, baseURL);
  await oeffentlich.goto('/bildung/voranmeldung');
  const form = oeffentlich.locator('main form');
  await form.getByRole('radio', { name: new RegExp(`^${v.klasse.vorbereitung.replace(/[()]/g, '.')}`) }).check();
  await form.getByRole('radio', { name: v.feld.weiblich }).check();
  await form.getByLabel(new RegExp(`^${v.feld.vorname}`)).fill(vorname);
  await form.getByLabel(new RegExp(`^${v.feld.nachname}`)).fill('Kette');
  await form.getByLabel(new RegExp(`^${v.feld.geburtsdatum}`)).fill('2016-04-02');
  await form.getByRole('button', { name: fw.wizard.weiter }).click();
  await form.getByLabel(new RegExp(`^${v.feld.strasse}`)).fill('[Straße 1]');
  await form.getByLabel(new RegExp(`^${v.feld.plz}`)).fill('35578');
  await form.getByLabel(new RegExp(`^${v.feld.ort}`)).fill('Wetzlar');
  await form.getByRole('button', { name: fw.wizard.weiter }).click();
  const eltern1 = form.getByRole('group', { name: v.gruppe.eltern1 });
  await eltern1.getByLabel(new RegExp(`^${v.feld.elternName}`)).fill('Testperson Mutter');
  await eltern1.getByLabel(new RegExp(`^${v.feld.elternTelefon}`)).fill('+49 000 000000');
  await eltern1.getByLabel(new RegExp(`^${v.feld.elternEmail}`)).fill(elternEmail);
  await form.getByRole('button', { name: fw.wizard.weiter }).click();
  await form.getByLabel(new RegExp(`^${v.feld.ausgefuelltVon}`)).fill('Testperson Mutter');
  await form.getByRole('checkbox', { name: new RegExp(`^${v.einwilligung.kontakt}`) }).check();
  await form.getByRole('checkbox', { name: new RegExp(`^${v.einwilligung.datenschutz.slice(0, 30)}`) }).check();
  await expect(form.locator('input[name="altcha"]')).not.toHaveValue('', { timeout: ALTCHA_MS });
  await form.getByRole('button', { name: v.absenden }).click();
  await expect(oeffentlich.getByRole('status').filter({ hasText: v.erfolg.titel })).toBeVisible();
  await oeffentlich.context().close();

  // 2 Bildung: Voranmeldung finden (Liste ohne Personendaten) und in die Beispielgruppe aufnehmen, Eltern einladen
  const bildung = await neueSeite(browser, baseURL);
  await angemeldetesKonto(bildung, 'bildung');
  await bildung.goto('/verwaltung/eingaenge?art=voranmeldung&status=neu');
  const links = bildung.getByRole('link', { name: /^Ansehen: Eingang vom/ });
  const adressen = await links.evaluateAll((l) => l.map((x) => (x as HTMLAnchorElement).getAttribute('href') ?? ''));
  let gefunden = false;
  for (const adresse of adressen) {
    await bildung.goto(adresse);
    if (await bildung.getByText(vorname, { exact: true }).count()) {
      gefunden = true;
      break;
    }
  }
  expect(gefunden, 'Voranmeldung in der Verwaltung').toBe(true);
  const aufnahme = bildung.locator('#aufnahme');
  await aufnahme.getByLabel(a.gruppe).selectOption({ label: lp.gruppe });
  await expect(aufnahme.getByRole('checkbox', { name: new RegExp(elternEmail.replace(/\./g, '\\.')) })).toBeChecked();
  await aufnahme.getByRole('button', { name: a.aufnehmen }).click();
  await expect(bildung).toHaveURL(/aufnahme=angelegt&einladungen=1#aufnahme$/);
  await expect(bildung.getByText(a.aufgenommenAls.replace('{name}', anzeigename))).toBeVisible();
  await bildung.context().close();

  // 3 Eltern: Einladung aus der Mail annehmen, anmelden
  const link = await einladungsLink(elternEmail);
  const eltern = await neueSeite(browser, baseURL);
  await eltern.goto(new URL(link).pathname);
  await eltern.getByLabel(k.felder.passwortNeu, { exact: true }).fill(PASSWORT);
  await eltern.getByLabel(k.felder.passwortWiederholen, { exact: true }).fill(PASSWORT);
  await eltern.locator('#einladung-einwilligung').check();
  await eltern.getByRole('button', { name: k.einladung.absenden }).click();
  await expect(eltern).toHaveURL(/\/anmelden\?hinweis=eingeladen$/);
  await emailAnmelden(eltern, elternEmail, PASSWORT);

  // 4 Eltern: Kind öffnen, in den eigenen Zugang einwilligen und ihn anlegen
  await eltern.goto('/mein-bereich/kinder');
  await eltern.getByRole('link', { name: d.karte.oeffnenAria.replace('{name}', anzeigename) }).click();
  await expect(eltern.getByRole('heading', { level: 1, name: anzeigename })).toBeVisible();
  const zugangTitel = d.detail.einwilligung.kinderkonto.titel;
  await eltern.locator('#einvernehmen-kinderkonto').check();
  await eltern.getByRole('button', { name: d.detail.erteilenAria.replace('{titel}', zugangTitel) }).click();
  await expect(eltern).toHaveURL(/ok=erteilt/);
  const benutzername = `kette.${buchstaben(6)}`;
  await eltern.getByLabel(d.detail.zugang.benutzername, { exact: true }).fill(benutzername);
  await eltern.getByLabel(d.detail.zugang.passwort, { exact: true }).fill(PASSWORT);
  await eltern.getByRole('button', { name: d.detail.zugang.anlegen }).click();
  await expect(eltern.getByText(d.detail.zugang.angelegt)).toBeVisible();
  // … und in den Gruppenchat (Kind unter 16, D-11)
  await eltern.locator('#einvernehmen-gruppenchat').check();
  await eltern.getByRole('button', { name: d.detail.erteilenAria.replace('{titel}', d.detail.einwilligung.gruppenchat.titel) }).click();
  await expect(eltern).toHaveURL(/ok=erteilt/);

  // 5 Kind: anmelden, die Gruppe steht auf der Startseite
  const kind = await neueSeite(browser, baseURL);
  await kindAnmelden(kind, { benutzername, passwort: PASSWORT });
  await expect(kind.getByRole('heading', { level: 1, name: mb.start.titel.replace('{vorname}', vorname) })).toBeVisible();
  await expect(kind.getByText(lp.gruppe, { exact: true }).first()).toBeVisible();
  // Gruppenchat: Ein frischer Zugang bestätigt zuerst die Regeln – per Tastatur; danach steht der Fokus im Feld
  // (Z-07, ChatFenster „fokusNachRegeln“). Außerhalb des Chatfensters (08–20 Uhr, S-05) geht „geschlossen“ den fehlenden
  // Regeln vor (schreibGrund in lib/chat/regeln.ts): Dann gibt es noch nichts zu bestätigen, die Kette läuft weiter.
  await kind.goto(`/mein-bereich/gruppen/${lp.gruppeId}/chat`);
  await expect(kind.getByRole('log').getByText(c.laedt)).toHaveCount(0);
  const regeln = kind.getByRole('button', { name: c.regelnBestaetigen });
  const feld = kind.getByRole('textbox', { name: c.eingabe });
  const geschlossen = kind.getByText(c.grund.geschlossen);
  await expect(regeln.or(geschlossen).first()).toBeVisible();
  if (await geschlossen.isVisible()) {
    await expect(feld).toBeDisabled();
    test.info().annotations.push({
      type: 'grenze',
      description: 'Chatfenster geschlossen (Kinder schreiben 08–20 Uhr, S-05) – Regeln-Bestätigung per Tastatur nicht prüfbar',
    });
  } else {
    await regeln.focus();
    await kind.keyboard.press('Enter');
    await expect(regeln).toHaveCount(0);
    await expect(feld).toBeFocused();
  }
  await kind.context().close();

  // 6 Lehrkraft: „Heute“ → Anwesenheit; das neue Kind steht in der Liste, „anwesend“ speichern
  const lehrkraft = await neueSeite(browser, baseURL);
  await leitungAnmelden(lehrkraft, z.lehrkraft);
  await lehrkraft.goto('/mein-bereich/unterricht');
  await lehrkraft.getByRole('link', { name: `${u.heute.anwesenheit}: ${lp.gruppe}, 16:00–17:30` }).click();
  const zeile = lehrkraft.getByRole('group', { name: anzeigename });
  await zeile.getByText(u.anwesenheit.erfassen.status.anwesend, { exact: true }).click();
  await expect(zeile.getByRole('radio', { name: u.anwesenheit.erfassen.status.anwesend })).toBeChecked();
  await lehrkraft.getByRole('button', { name: u.anwesenheit.erfassen.speichern }).click();
  await expect(lehrkraft.getByRole('status').filter({ hasText: u.anwesenheit.erfassen.gespeichert })).toBeVisible();
  await lehrkraft.context().close();

  // 7 Eltern sehen die erfasste Anwesenheit beim Kind
  await eltern.reload();
  const anwesenheit = eltern.locator('#anwesenheit');
  await expect(anwesenheit.getByText(d.detail.status.anwesend, { exact: true }).first()).toBeVisible();
  await eltern.context().close();
});
