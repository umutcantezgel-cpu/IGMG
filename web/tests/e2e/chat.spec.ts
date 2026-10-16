import { randomBytes } from 'node:crypto';
import { expect as basisExpect, test, type Page } from '@playwright/test';
import chatTexte from '../../messages/bereiche/chat-fenster.json';
import { beispielkonten, kindAnmelden, leitungAnmelden } from './hilfen/gemeinde';
import { eigeneAbsenderAdresse } from './hilfen/konto';

/** Der Chat holt neue Nachrichten im Takt (4 s bei Aktivität, ADR 0027 ohne Echtzeit) – großzügig warten. */
const expect = basisExpect.configure({ timeout: 20_000 });

/**
 * Gruppenchat mit zwei Browsern (F-36, S-01…S-18; Nacharbeit 2, P4): Lehrkraft (Leitung) und Kind in getrennten
 * Kontexten derselben Beispielgruppe. Die Nachricht der Leitung kommt beim Kind über den Abruf an (ohne Echtzeit-Dienst);
 * das Kind meldet sie in zwei Schritten. Im Chatfenster (08–20 Uhr Serverzeit, S-05) schreibt auch das Kind: Die Leitung
 * sieht die Nachricht und entfernt sie mit Begründung, das Kind sieht danach den Platzhalter. Außerhalb des Fensters
 * prüft der Test den gesperrten Zustand beim Kind und überspringt den Rest mit Begründung. Nur Desktop (Anmeldungen).
 */
const c = chatTexte.de.chatFenster;

async function chatOeffnen(page: Page, gruppeId: string) {
  await page.goto(`/mein-bereich/gruppen/${gruppeId}/chat`);
  await expect(page.getByRole('log')).toBeVisible();
  await expect(page.getByRole('log').getByText(c.laedt)).toHaveCount(0);
}

test.beforeEach(async ({ request }, info) => {
  test.skip(info.project.name !== 'desktop', 'Abläufe mit Anmeldung nur einmal je Lauf');
  test.skip((await request.get('/anmelden')).status() === 404, 'Funktion „konten“ ist aus – Server mit FUNKTION_KONTEN=an starten');
});

test('Leitung und Kind in zwei Browsern: Nachricht kommt an, Melden; im Chatfenster Kind schreibt, Leitung entfernt', async ({
  browser,
  baseURL,
}) => {
  test.setTimeout(240_000);
  const z = beispielkonten();
  const lp = z.lernplattform;
  // Eigene Kontexte erben die Projekt-Einstellungen nicht: Adresse, Sprache, Zeitzone und Breite wie „desktop“
  const optionen = { baseURL, locale: 'de-DE', timezoneId: 'Europe/Berlin', viewport: { width: 1440, height: 900 } };
  const leitungKontext = await browser.newContext(optionen);
  const kindKontext = await browser.newContext(optionen);
  try {
    const leitung = await leitungKontext.newPage();
    const kind = await kindKontext.newPage();
    for (const p of [leitung, kind]) {
      await p.addInitScript(() => window.localStorage.setItem('igmg-konzepthinweis-gesehen', '1'));
      await eigeneAbsenderAdresse(p);
    }
    await leitungAnmelden(leitung, z.lehrkraft);
    const chatAn = await leitung.request.get(`/mein-bereich/gruppen/${lp.gruppeId}/chat`);
    test.skip(chatAn.status() === 404, 'Funktion „chat“ ist aus – Server mit FUNKTION_CHAT=an starten');
    await kindAnmelden(kind, z.kind);
    await chatOeffnen(leitung, lp.gruppeId);
    await chatOeffnen(kind, lp.gruppeId);

    // Kind bestätigt die Regeln (S-15), falls sie offen sind – den Knopf gibt es nur im Chatfenster (außerhalb geht
    // „geschlossen“ vor, schreibGrund) und nur bis zur ersten Bestätigung
    const regeln = kind.getByRole('button', { name: c.regelnBestaetigen });
    if (await regeln.count()) {
      await regeln.click();
      await expect(regeln).toHaveCount(0);
    }

    // Leitung schreibt (auch außerhalb der Chatzeiten) → beim Kind über den Abruf sichtbar
    const vonLeitung = `Leitung ${randomBytes(3).toString('hex')}`;
    await leitung.getByRole('textbox', { name: c.eingabe }).fill(vonLeitung);
    await leitung.getByRole('button', { name: c.senden, exact: true }).click();
    await expect(leitung.getByRole('log').getByText(vonLeitung)).toBeVisible();
    const beimKind = kind.getByRole('log').getByRole('listitem').filter({ hasText: vonLeitung });
    await expect(beimKind).toBeVisible();
    await expect(beimKind.getByText(c.lehrkraft, { exact: true })).toBeVisible();

    // Kind meldet die Nachricht in zwei Schritten (S-08): Grund wählen, senden → Dank im Status
    await beimKind.getByRole('button', { name: /^Melden: / }).click();
    const dialog = kind.getByRole('dialog', { name: c.meldenTitel });
    await expect(dialog).toBeVisible();
    await dialog.getByRole('radio', { name: c.gruende.sonstiges }).check();
    await dialog.getByRole('button', { name: c.meldenSenden }).click();
    await expect(dialog).toBeHidden();
    await expect(kind.getByRole('status').filter({ hasText: c.gemeldet })).toBeVisible();

    // Kind schreibt – nur im Chatfenster der Gruppe (S-05)
    const geschlossen = kind.getByText(c.grund.geschlossen);
    const feld = kind.getByRole('textbox', { name: c.eingabe });
    await expect(feld.or(geschlossen).first()).toBeVisible();
    if (await geschlossen.isVisible()) {
      await expect(feld).toBeDisabled();
      test.skip(true, 'Chatfenster der Gruppe geschlossen (Kinder schreiben 08–20 Uhr Serverzeit, S-05) – Kind-Senden nicht prüfbar');
    }
    const vomKind = `Kind ${randomBytes(3).toString('hex')}`;
    await feld.fill(vomKind);
    await kind.keyboard.press('Enter');
    await expect(kind.getByRole('log').getByText(vomKind)).toBeVisible();
    const beiLeitung = leitung.getByRole('log').getByRole('listitem').filter({ hasText: vomKind });
    await expect(beiLeitung).toBeVisible();

    // Leitung entfernt die Nachricht mit Begründung (S-09) → beim Kind steht der Platzhalter
    leitung.once('dialog', (d) => void d.accept('E2E-Probe: Entfernen'));
    await beiLeitung.getByRole('button', { name: c.moderation.entfernen, exact: true }).click();
    await expect(leitung.getByRole('log').getByText(vomKind)).toHaveCount(0);
    await expect(kind.getByRole('log').getByText(vomKind)).toHaveCount(0);
    await expect(kind.getByRole('log').getByText(c.entfernt).last()).toBeVisible();
  } finally {
    await leitungKontext.close();
    await kindKontext.close();
  }
});
