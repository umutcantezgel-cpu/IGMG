import { describe, expect, it } from 'vitest';
import { benachrichtigungMail, bestaetigungMail } from '@/lib/mail/vorlagen';
import { MAILFARBE } from '@/lib/mail/vorlagen/farben';

/**
 * Mailvorlagen (H-W01): Bestätigung an die absendende Person, Benachrichtigung an die zuständige Rolle.
 * Geprüft wird das Ergebnis der Bausteine: Sprache und Farbschema, Tabellen-Layout ohne Variablen, Bilder, SVG und Webfonts,
 * der unsichtbare Vorschautext, der Knopf und die Textfassung (kein doppelter Link, kein Vorschautext, kein Stilrest).
 */

const LINK = 'https://beispiel.example/verwaltung/eingaenge/abc123';

const BESTAETIGUNG = {
  betreff: 'Ihre Nachricht an die IGMG Wetzlar',
  anrede: 'Guten Tag,',
  text: 'Vielen Dank für Ihre Nachricht. Wir haben sie am 11.10.2026 erhalten und melden uns bei Ihnen.',
  hinweis: 'Diese E-Mail wurde automatisch erstellt. Bitte antworten Sie nicht direkt auf diese Nachricht.',
  gruss: 'Ihre IGMG Wetzlar',
  kontakt: '[Adresse] · [E-Mail-Adresse]',
};

const BENACHRICHTIGUNG = {
  betreff: 'Neuer Eingang: Nachricht',
  text: 'In der Verwaltung ist ein neuer Eingang (Nachricht) eingegangen. Aus Datenschutzgründen enthält diese E-Mail keine Formulardaten.',
  knopf: 'In der Verwaltung ansehen',
  hinweis: 'Sie erhalten diese Nachricht, weil Ihre Aufgabe in der Verwaltung diese Eingänge umfasst.',
  link: LINK,
};

/** Anzahl der Vorkommen eines Teiltexts. */
const oft = (text: string, teil: string) => text.split(teil).length - 1;

/** Inhalt des unsichtbaren Vorschautexts (vor dem Fülltext). */
const vorschauText = (html: string) => /<div data-skip-in-text="true" style="display:none[^"]*">([^<]*)<!-- -->/.exec(html)?.[1];

describe('Mailvorlage Bestätigung', () => {
  it('nennt Sprache und helles Farbschema und enthält alle Texte in HTML und Textfassung', async () => {
    const mail = await bestaetigungMail('tr', BESTAETIGUNG);
    expect(mail.betreff).toBe(BESTAETIGUNG.betreff);
    expect(mail.html).toContain('<html lang="tr">');
    expect(mail.html).toMatch(/<meta name="color-scheme" content="light"\s*\/?>/);
    expect(mail.html).toMatch(/<meta name="supported-color-schemes" content="light"\s*\/?>/);
    for (const teil of [BESTAETIGUNG.anrede, BESTAETIGUNG.text, BESTAETIGUNG.gruss, BESTAETIGUNG.kontakt, BESTAETIGUNG.hinweis]) {
      expect(mail.html).toContain(teil);
      expect(mail.text).toContain(teil);
    }
  });

  it('ist ein Tabellen-Layout ohne CSS-Variablen, Bilder, SVG, Webfonts und Stylesheet-Links', async () => {
    const { html } = await bestaetigungMail('de', BESTAETIGUNG);
    expect(html).not.toContain('var(--');
    expect(html).not.toMatch(/<img[\s>]/);
    expect(html).not.toMatch(/<svg[\s>]/);
    expect(html).not.toMatch(/<link[\s>]/);
    expect(html).not.toContain('fonts.googleapis');
    // jede Layout-Tabelle trägt role=presentation (auch die Outlook-Tabelle in den Kommentaren)
    expect(oft(html, '<table')).toBe(oft(html, '<table role="presentation"'));
  });

  it('hat keinen Link-Knopf', async () => {
    const { html, text } = await bestaetigungMail('de', BESTAETIGUNG);
    expect(html).not.toMatch(/<a[\s>]/);
    expect(text).not.toContain('http');
  });

  it('stellt den ersten Satz als unsichtbaren Vorschautext voran, der in der Textfassung nicht erscheint', async () => {
    const { html, text } = await bestaetigungMail('de', BESTAETIGUNG);
    expect(vorschauText(html)).toBe('Vielen Dank für Ihre Nachricht.');
    expect(html).toContain('mso-hide:all');
    expect(html).toContain('max-height:0px');
    expect(oft(text, 'Vielen Dank für Ihre Nachricht.')).toBe(1);
    expect(text).not.toMatch(/display:|mso-|@media/);
  });
});

describe('Mailvorlage Benachrichtigung', () => {
  it('enthält den Link als Knopf und als Text, in der Textfassung genau einmal', async () => {
    const mail = await benachrichtigungMail(BENACHRICHTIGUNG);
    expect(mail.betreff).toBe(BENACHRICHTIGUNG.betreff);
    expect(mail.html).toContain('<html lang="de">');
    expect(oft(mail.html, `href="${LINK}"`)).toBe(2);
    expect(oft(mail.text, LINK)).toBe(1);
    for (const teil of [BENACHRICHTIGUNG.knopf, BENACHRICHTIGUNG.text, BENACHRICHTIGUNG.hinweis]) {
      expect(mail.text).toContain(teil);
    }
    expect(oft(mail.text, 'In der Verwaltung ist ein neuer Eingang (Nachricht) eingegangen.')).toBe(1);
  });

  it('zeigt den Knopf kugelsicher: Hintergrund in der Zelle, 14 × 24 px Innenabstand, Mindesthöhe 48 px, weiße Schrift auf Grün', async () => {
    const { html } = await benachrichtigungMail(BENACHRICHTIGUNG);
    expect(html).toContain(`bgcolor="${MAILFARBE.gruen}"`);
    expect(html).toContain(`background:${MAILFARBE.gruen}`);
    expect(html).toContain('padding:14px 24px');
    expect(html).toContain('min-height:48px');
    expect(html).toContain('border-radius:8px');
    expect(html).toContain(`color:${MAILFARBE.weiss}`);
    expect(html).toContain('font-weight:700');
  });

  it('zeigt den Link darunter als umbrechenden Text in Tinte-2', async () => {
    const { html } = await benachrichtigungMail(BENACHRICHTIGUNG);
    expect(html).toContain(`color:${MAILFARBE.tinte2};word-break:break-all`);
  });

  it('nennt den ersten Satz als Vorschautext, höchstens 140 Zeichen in ganzen Wörtern', async () => {
    const langerText = 'Lorem ipsum dolor sit amet '.repeat(10).trim();
    const { html } = await benachrichtigungMail({ ...BENACHRICHTIGUNG, text: langerText });
    const vorschau = vorschauText(html) ?? '';
    expect(vorschau.length).toBeGreaterThan(0);
    expect(vorschau.length).toBeLessThanOrEqual(140);
    expect(langerText.startsWith(vorschau)).toBe(true);
    expect(vorschau.endsWith(' ')).toBe(false);
  });
});

describe('Rahmen gemeinsam', () => {
  it('hat den tiefgrünen Kopf mit Georgia, die Akzentlinie, die Fußzeile auf Sand und die Mobilregel', async () => {
    const { html } = await benachrichtigungMail(BENACHRICHTIGUNG);
    expect(html).toContain(`bgcolor="${MAILFARBE.tiefgruen}"`);
    expect(html).toContain('Georgia');
    expect(html).toContain('height:2px');
    expect(html).toContain(`background:${MAILFARBE.gruen};padding:0`);
    expect(html).toContain(`background:${MAILFARBE.sand}`);
    expect(html).toContain('max-width:600px');
    expect(html).toContain('border-radius:12px');
    expect(html).toContain('@media (max-width: 480px)');
    expect(html).toContain('.igmg-innen { padding: 24px !important; }');
  });
});
