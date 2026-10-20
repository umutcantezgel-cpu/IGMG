import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import {
  type AbgleichOptionen,
  angenommen,
  bereiteLexikon,
  gleicheAb,
  type HinweisSchluessel,
  normalisiere,
  type Urteil,
} from '@/lib/lernapp/abgleich';
import { fehlendeKacheln, kachelnMitId, satzAus, zerlege } from '@/lib/lernapp/abgleich/tokens';

/**
 * Antwortabgleich Deutsch (PLAN §4.1, Tor L1: ≥ 150 Fälle je Sprache). Tabelle: Antwort, Lösung(en), Urteil, Hinweise,
 * Optionen. Inhalte sind neutrale Alltagssätze.
 */
type Fall = [antwort: string, loesung: string | string[], urteil: Urteil, hinweise?: HinweisSchluessel[], optionen?: AbgleichOptionen];

const lex = (...w: string[]) => ({ lexikon: bereiteLexikon(w, 'de') });

const HANDARBEIT: Fall[] = [
  // gleich, Satzzeichen, Leerraum
  ['Ich trinke Wasser.', 'Ich trinke Wasser.', 'richtig'],
  ['Ich trinke Wasser', 'Ich trinke Wasser.', 'richtig'],
  ['ich trinke Wasser!', 'Ich trinke Wasser.', 'richtig'],
  ['  Ich   trinke  Wasser ', 'Ich trinke Wasser.', 'richtig'],
  ['Ich\ttrinke\nWasser', 'Ich trinke Wasser.', 'richtig'],
  ['Ich\u00A0trinke\u202FWasser', 'Ich trinke Wasser.', 'richtig'],
  ['Ich trinke Wasser?!', 'Ich trinke Wasser.', 'richtig'],
  ['„Ich trinke Wasser“', 'Ich trinke Wasser.', 'richtig'],
  ['«Ich trinke Wasser»', 'Ich trinke Wasser.', 'richtig'],
  ['(Ich trinke Wasser)', 'Ich trinke Wasser.', 'richtig'],
  ['Ich trinke Wasser …', 'Ich trinke Wasser.', 'richtig'],
  ['Ich, trinke, Wasser', 'Ich trinke Wasser.', 'richtig'],
  ['ICH TRINKE WASSER', 'Ich trinke Wasser.', 'richtig'],
  ['Ich Trinke Wasser', 'Ich trinke Wasser.', 'richtig'],
  ['\u200BIch trinke Wasser\u200E', 'Ich trinke Wasser.', 'richtig'],
  // Apostrophe
  ['Wie geht’s?', "Wie geht's?", 'richtig'],
  ['Wie geht`s?', "Wie geht's?", 'richtig'],
  ['Wie geht´s?', "Wie geht's?", 'richtig'],
  ['Wie gehts?', "Wie geht's?", 'richtig', ['apostroph']],
  ["'Wasser'", 'Wasser', 'richtig'],
  // ß und ss
  ['Die Strasse ist lang.', 'Die Straße ist lang.', 'tippfehler', ['eszett']],
  ['Ich heisse Anna.', 'Ich heiße Anna.', 'tippfehler', ['eszett']],
  ['Der Fluß ist breit.', 'Der Fluss ist breit.', 'tippfehler', ['eszett']],
  ['DIE STRASSE IST LANG', 'Die Straße ist lang.', 'tippfehler', ['eszett']],
  ['Die STRAẞE ist lang', 'Die Straße ist lang.', 'richtig'],
  ['Die Straße ist lang', 'Die Strasse ist lang.', 'tippfehler', ['eszett']],
  // Umlaut-Ersatz
  ['Die Tuer ist offen.', 'Die Tür ist offen.', 'tippfehler', ['umlaut']],
  ['Das ist schoen.', 'Das ist schön.', 'tippfehler', ['umlaut']],
  ['Die Baeume sind gross.', 'Die Bäume sind groß.', 'tippfehler', ['eszett', 'umlaut']],
  ['Ich hoere dich nicht.', 'Ich höre dich nicht.', 'tippfehler', ['umlaut']],
  ['Die Strasse ist schoen', 'Die Straße ist schön.', 'tippfehler', ['eszett', 'umlaut']],
  ['Die Tu\u0308r ist offen', 'Die Tür ist offen.', 'richtig'],
  ['Die Tur ist offen', 'Die Tür ist offen.', 'falsch'],
  ['Das ist schon', 'Das ist schön.', 'tippfehler', ['tippfehler']],
  ['Das ist schon', 'Das ist schön.', 'falsch', [], lex('schön', 'schon')],
  // Großschreibung
  ['Ich trinke wasser.', 'Ich trinke Wasser.', 'tippfehler', ['grossschreibung']],
  ['Das ist mein buch', 'Das ist mein Buch.', 'tippfehler', ['grossschreibung']],
  ['Wasser ist kalt', 'Wasser ist kalt.', 'richtig'],
  ['wasser ist kalt', 'Wasser ist kalt.', 'richtig'],
  ['Kommen sie morgen?', 'Kommen Sie morgen?', 'tippfehler', ['grossschreibung']],
  ['Die tuer ist offen', 'Die Tür ist offen.', 'tippfehler', ['grossschreibung', 'umlaut']],
  ['Meine schwester liest', 'Meine Schwester liest.', 'tippfehler', ['grossschreibung']],
  // Tippfehler
  ['Ich trinke Wassr', 'Ich trinke Wasser.', 'tippfehler', ['tippfehler']],
  ['Ich gehe in die Schulle', 'Ich gehe in die Schule.', 'tippfehler', ['tippfehler']],
  ['Ich gehe in die Shcule', 'Ich gehe in die Schule.', 'tippfehler', ['tippfehler']],
  ['Das Huas ist alt', 'Das Haus ist alt.', 'tippfehler', ['tippfehler']],
  ['Heute ist mein Geburstag', 'Heute ist mein Geburtstag.', 'tippfehler', ['tippfehler']],
  ['Heute ist mein Geburtsdak', 'Heute ist mein Geburtstag.', 'tippfehler', ['tippfehler']],
  ['Heute ist mein Geburtstga', 'Heute ist mein Geburtstag.', 'tippfehler', ['tippfehler']],
  ['Heute ist mein Gebrtstga', 'Heute ist mein Geburtstag.', 'falsch'],
  ['Der Bus ist da', 'Der Bus ist da.', 'richtig'],
  ['Der Bas ist da', 'Der Bus ist da.', 'falsch'],
  ['Der Hund schläft', 'Der Hund schläft.', 'richtig'],
  ['Der Mund schläft', 'Der Hund schläft.', 'tippfehler', ['tippfehler']],
  ['Der Mund schläft', 'Der Hund schläft.', 'falsch', [], lex('Hund', 'Mund', 'schläft')],
  ['Der Hnud schläft', 'Der Hund schläft.', 'tippfehler', ['tippfehler'], lex('Hund', 'Mund', 'schläft')],
  ['Meine Schwster trinkt Wasser', 'Meine Schwester trinkt Wasser.', 'tippfehler', ['tippfehler']],
  ['Meine Schwster trinkt Wassr', 'Meine Schwester trinkt Wasser.', 'falsch'],
  ['Meine Schwster trinkt jeden Tag Wassr', 'Meine Schwester trinkt jeden Tag Wasser.', 'tippfehler', ['tippfehler']],
  ['Ich trinke Wassr', 'Ich trinke Wasser.', 'falsch', [], { toleranz: false }],
  // falsch
  ['Ich trinke Milch.', 'Ich trinke Wasser.', 'falsch'],
  ['Wasser trinke ich.', 'Ich trinke Wasser.', 'falsch'],
  ['Ich trinke', 'Ich trinke Wasser.', 'falsch'],
  ['Ich trinke kaltes Wasser', 'Ich trinke Wasser.', 'falsch'],
  ['Ich esse Brot', 'Ich trinke Wasser.', 'falsch'],
  ['drei', '3', 'falsch'],
  ['', 'Ich trinke Wasser.', 'falsch', ['leer']],
  ['   ', 'Ich trinke Wasser.', 'falsch', ['leer']],
  ['?!', 'Ich trinke Wasser.', 'falsch', ['leer']],
  // mehrere Lösungen
  ['Wasser trinke ich.', ['Ich trinke Wasser.', 'Wasser trinke ich.'], 'richtig'],
  ['Ich trinke Wassr', ['Ich trinke Wasser.', 'Wasser trinke ich.'], 'tippfehler', ['tippfehler']],
  ['Ich bin zu Hause', ['Ich bin zu Hause.', 'Ich bin zuhause.'], 'richtig'],
  ['Ich bin zuhause', ['Ich bin zu Hause.', 'Ich bin zuhause.'], 'richtig'],
  ['Ich heisse Anna', ['Ich heiße Anna.', 'Mein Name ist Anna.'], 'tippfehler', ['eszett']],
  ['Mein Name ist Anna', ['Ich heiße Anna.', 'Mein Name ist Anna.'], 'richtig'],
  // Leerzeichen und Bindestrich
  ['Ich bin zuhause', 'Ich bin zu Hause.', 'tippfehler', ['leerzeichen']],
  ['Ich bin zu hause', 'Ich bin zuhause.', 'tippfehler', ['leerzeichen']],
  ['Ich schreibe eine E-Mail', 'Ich schreibe eine E-Mail.', 'richtig'],
  ['Ich schreibe eine E Mail', 'Ich schreibe eine E-Mail.', 'richtig'],
  ['Ich schreibe eine Email', 'Ich schreibe eine E-Mail.', 'tippfehler', ['leerzeichen']],
  ['Ich schreibe eine E\u2013Mail', 'Ich schreibe eine E-Mail.', 'richtig'],
  // Ziffern
  ['Ich habe 3 Bücher', 'Ich habe 3 Bücher.', 'richtig'],
  ['Ich habe \u0663 Bücher', 'Ich habe 3 Bücher.', 'richtig'],
  ['Ich habe 4 Bücher', 'Ich habe 3 Bücher.', 'falsch'],
  ['Es ist 10 Uhr', 'Es ist 10 Uhr.', 'richtig'],
];

/** Alltagswörter (Nomen, ≥ 4 Buchstaben) für generierte Fälle. */
const WOERTER = [
  'Wasser',
  'Schule',
  'Fenster',
  'Garten',
  'Küche',
  'Straße',
  'Bahnhof',
  'Zeitung',
  'Freund',
  'Familie',
  'Lehrerin',
  'Fahrrad',
  'Tasche',
  'Apfel',
  'Brot',
  'Milch',
  'Stuhl',
  'Tisch',
  'Wolke',
  'Blume',
  'Stadt',
  'Arbeit',
  'Frühstück',
  'Kalender',
  'Bleistift',
  'Schrank',
  'Teller',
  'Löffel',
  'Fußball',
  'Nachbar',
];

const loescheMitte = (w: string) => w.slice(0, Math.floor(w.length / 2)) + w.slice(Math.floor(w.length / 2) + 1);
function vertausche(w: string): string {
  const z = Array.from(w);
  for (let i = 1; i < z.length - 1; i++) {
    if (z[i]!.toLowerCase() !== z[i + 1]!.toLowerCase()) {
      [z[i], z[i + 1]] = [z[i + 1]!, z[i]!];
      return z.join('');
    }
  }
  return w;
}
const umgedreht = (w: string) => Array.from(w.toLowerCase()).reverse().join('');

const GENERIERT: Fall[] = WOERTER.flatMap((w): Fall[] => [
  [w, w, 'richtig'],
  [w.toLowerCase(), w, 'richtig'],
  [`  ${w}!`, w, 'richtig'],
  [loescheMitte(w), w, 'tippfehler', ['tippfehler']],
  [vertausche(w), w, 'tippfehler', ['tippfehler']],
  [umgedreht(w), w, 'falsch'],
]);

const FAELLE: Fall[] = [...HANDARBEIT, ...GENERIERT];

describe('Abgleich Deutsch: Tabelle', () => {
  it('mindestens 150 Fälle', () => {
    expect(FAELLE.length).toBeGreaterThanOrEqual(150);
  });

  it.each(FAELLE)('„%s“ gegen %j → %s %j', (antwort, loesung, urteil, hinweise = [], optionen = {}) => {
    const e = gleicheAb(antwort, loesung, 'de', optionen);
    expect({ urteil: e.urteil, hinweise: e.hinweise }).toEqual({ urteil, hinweise });
  });
});

describe('Abgleich Deutsch: Ergebnis', () => {
  it('nennt die passende Lösung und ihren Index', () => {
    expect(gleicheAb('Wasser trinke ich', ['Ich trinke Wasser.', 'Wasser trinke ich.'], 'de')).toMatchObject({
      loesung: 'Wasser trinke ich.',
      index: 1,
    });
    expect(gleicheAb('Brot', ['Ich trinke Wasser.', 'Wasser trinke ich.'], 'de')).toMatchObject({
      loesung: 'Ich trinke Wasser.',
      index: -1,
    });
  });

  it('ohne Lösung ist ein Programmfehler', () => {
    expect(() => gleicheAb('x', [], 'de')).toThrow();
  });

  it('Normalisierung: Kleinschreibung, Satzzeichen und Leerraum, ß bleibt', () => {
    expect(normalisiere('  Die STRAẞE, bitte! ', 'de')).toBe('die straße bitte');
  });
});

describe('Wortbank-Kacheln (tokens.ts)', () => {
  it('zerlegt ohne Satzzeichen und behält die Schreibung', () => {
    expect(zerlege('Ich trinke Wasser.')).toEqual(['Ich', 'trinke', 'Wasser']);
    expect(zerlege('„Wie geht’s?“')).toEqual(['Wie', "geht's"]);
  });

  it('Kacheln mit Kennung; Satz aus Kacheln', () => {
    expect(kachelnMitId(['die', 'Katze', 'die'])).toEqual([
      { id: 0, text: 'die' },
      { id: 1, text: 'Katze' },
      { id: 2, text: 'die' },
    ]);
    expect(satzAus(['Ich', 'trinke', 'Wasser'])).toBe('Ich trinke Wasser');
  });

  it('fehlende Kacheln als Mehrfachmenge', () => {
    expect(fehlendeKacheln('Die Katze sieht die Maus.', ['die', 'Katze', 'sieht', 'Maus', 'Hund'], 'de')).toEqual(['die']);
    expect(fehlendeKacheln('Die Katze sieht die Maus.', ['die', 'Katze', 'sieht', 'die', 'Maus'], 'de')).toEqual([]);
  });
});

/** Eigenschaftstests (ADR 0038 Folgen, PLAN §13). */
const ZEICHEN = [
  ...'abcdefghijklmnopqrstuvwxyzäöüßABCDEÄÖÜẞ',
  ' ',
  '.',
  ',',
  '!',
  '?',
  "'",
  '’',
  '-',
  '\u00A0',
  '\u200B',
  'u\u0308',
  'İ',
  '\u0663',
  '\t',
];
const text = fc.array(fc.constantFrom(...ZEICHEN), { maxLength: 30 }).map((z) => z.join(''));
const wort = fc.array(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzäöüß'), { minLength: 1, maxLength: 12 }).map((z) => z.join(''));

describe('Abgleich Deutsch: Eigenschaften', () => {
  it('Normalisierung ist idempotent', () => {
    fc.assert(
      fc.property(
        fc.oneof(text, fc.string({ unit: 'binary' })),
        (s) => normalisiere(normalisiere(s, 'de'), 'de') === normalisiere(s, 'de'),
      ),
    );
  });

  it('eine Lösung gegen sich selbst ist immer richtig, ohne Hinweis', () => {
    fc.assert(
      fc.property(fc.oneof(text, fc.string({ unit: 'binary' })), (s) => {
        fc.pre(normalisiere(s, 'de') !== '');
        const e = gleicheAb(s, s, 'de');
        return e.urteil === 'richtig' && e.hinweise.length === 0;
      }),
    );
  });

  it('Annahme ist symmetrisch (ohne Lexikon)', () => {
    const paar = fc
      .tuple(fc.array(wort, { minLength: 1, maxLength: 4 }), fc.nat(), fc.constantFrom('x', 'ss', 'ae', ''))
      .map(([w, i, ein]) => {
        const a = w.join(' ');
        const b = [...w];
        const k = i % b.length;
        const z = b[k]!;
        b[k] = z.slice(0, i % (z.length + 1)) + ein + z.slice((i % (z.length + 1)) + 1);
        return [a, b.join(' ')] as const;
      });
    fc.assert(fc.property(paar, ([a, b]) => angenommen(gleicheAb(a, b, 'de')) === angenommen(gleicheAb(b, a, 'de'))));
  });

  it('ein gelöschter Buchstabe in einem Wort ab 4 Zeichen ist ein Tippfehler', () => {
    fc.assert(
      fc.property(fc.array(fc.constantFrom(...'bcdfghklmnprstwz'), { minLength: 4, maxLength: 12 }), fc.nat(), (z, i) => {
        const w = z.join('');
        const k = i % w.length;
        return gleicheAb(w.slice(0, k) + w.slice(k + 1), w, 'de').urteil !== 'falsch';
      }),
    );
  });
});
