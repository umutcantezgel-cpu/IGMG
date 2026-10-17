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
import { fehlendeKacheln, zerlege } from '@/lib/lernapp/abgleich/tokens';
import { ar, geruest } from './hilfen/buckwalter';

/**
 * Antwortabgleich Arabisch (PLAN §4.1, Tor L1: ≥ 150 Fälle je Sprache). Testdaten in Buckwalter-Umschrift, umgesetzt über
 * eine Tabelle aus Codepunkt-Escapes (KERN §3); weitere Zeichen stehen als `\u`-Escape. Neutrale Alltagswörter.
 */
type Fall = [antwort: string, loesung: string | string[], urteil: Urteil, hinweise?: HinweisSchluessel[], optionen?: AbgleichOptionen];

/** Fall in Umschrift: beide Seiten über `ar()`. */
const u = (
  antwort: string,
  loesung: string | string[],
  urteil: Urteil,
  hinweise?: HinweisSchluessel[],
  optionen?: AbgleichOptionen,
): Fall => [ar(antwort), typeof loesung === 'string' ? ar(loesung) : loesung.map(ar), urteil, hinweise, optionen];
const streng: AbgleichOptionen = { streng: true };
const lex = (...w: string[]) => ({ lexikon: bereiteLexikon(w.map(ar), 'ar') });

const HANDARBEIT: Fall[] = [
  // Harakat und Tatweel still
  u('ktAb', 'kitaAbN', 'richtig'),
  u('kitaAbN', 'ktAb', 'richtig'),
  u('kt_Ab', 'ktAb', 'richtig'),
  u('k_t__Ab', 'kitaAbN', 'richtig'),
  u('Albyt kbyr', 'Albayotu kabiyrN', 'richtig'),
  u('Albyt  kbyr%', 'Albayotu kabiyrN', 'richtig'),
  u('Albyt# kbyr', 'Albayotu kabiyrN', 'richtig'),
  u('Albyt@ kbyr', 'Albayotu kabiyrN', 'richtig'),
  u('AlktAbu jadiyd', 'AlkitaAbu jadiydN', 'richtig'),
  u('Alkitaabu jdyd', 'AlkitaAbu jadiydN', 'tippfehler', ['tippfehler']),
  u('aiu', 'ktAb', 'falsch', ['leer']),
  // Alif-Formen still
  u('>x', 'Ax', 'richtig'),
  u('Ax', '>axN', 'richtig'),
  u('<lY Alswq', '<ilaY Alsuwqi', 'richtig'),
  u('AlY Alswq', '<ilaY Alsuwqi', 'richtig'),
  u('{lbyt', 'Albyt', 'richtig'),
  u('|xr', 'Axr', 'richtig'),
  u('Axr', '|xir', 'richtig'),
  // Alif maqsura und Taa marbuta mit Hinweis
  u('Aly Alswq', '<ilaY Alsuwqi', 'tippfehler', ['alifMaqsura']),
  u('mst$fy', 'musota$ofaY', 'tippfehler', ['alifMaqsura']),
  u('mst$fY', 'musota$ofaY', 'richtig'),
  u('mdrsh', 'madorasapN', 'tippfehler', ['taMarbuta']),
  u('mdrsp', 'madorasapN', 'richtig'),
  u('Almdrsh kbyrp', 'Almadorasapu kabiyrapN', 'tippfehler', ['taMarbuta']),
  u('Almdrsh kbyrh', 'Almadorasapu kabiyrapN', 'tippfehler', ['taMarbuta']),
  u('ElY AlTAwlp', 'EalaY AlTaAwilapi', 'richtig'),
  u('Ely AlTAwlh', 'EalaY AlTaAwilapi', 'tippfehler', ['alifMaqsura', 'taMarbuta']),
  u('hp', 'hp', 'richtig'),
  // Hamza-Träger tolerant
  u('ms}wl', 'mas&uwlN', 'richtig'),
  u('ms&wl', 'ms}wl', 'richtig'),
  u('s&Al', 'su&aAlN', 'richtig'),
  u('s}Al', 'su&aAlN', 'richtig'),
  u('swAl', 'su&aAlN', 'tippfehler', ['tippfehler']),
  // persische Buchstaben, Ziffern, Steuerzeichen
  [ar('kb') + '\u06CC' + ar('r'), ar('kabiyrN'), 'richtig'],
  ['\u06A9' + ar('tAb'), ar('kitaAbN'), 'richtig'],
  ['\u0663 ' + ar('ktb'), '3 ' + ar('ktb'), 'richtig'],
  ['3 ' + ar('ktb'), '\u0663 ' + ar('ktb'), 'richtig'],
  ['\u06F3 ' + ar('ktb'), '3 ' + ar('ktb'), 'richtig'],
  ['\u0664 ' + ar('ktb'), '3 ' + ar('ktb'), 'falsch'],
  ['\u200F' + ar('ktAb') + '\u200E', ar('ktAb'), 'richtig'],
  [ar('kt') + '\u200C' + ar('Ab'), ar('ktAb'), 'richtig'],
  ['\u061C' + ar('ktAb'), ar('ktAb'), 'richtig'],
  // Tippfehler und Lexikonschutz
  u('mdrs', 'madorasapN', 'tippfehler', ['tippfehler']),
  u('mdrs', 'madorasapN', 'falsch', [], lex('mdrs', 'mdrsp')),
  u('mdsrp', 'mdrsp', 'tippfehler', ['tippfehler'], lex('mdrs', 'mdrsp')),
  u('mdrsh', 'madorasapN', 'falsch', [], lex('mdrsh', 'mdrsp')),
  u('mdsrp', 'mdrsp', 'falsch', [], { toleranz: false }),
  u('byt', 'bAb', 'falsch'),
  u('byt kbyr', 'Albyt kbyr', 'falsch'),
  u('Albyt Sgyr', 'Albyt kbyr', 'falsch'),
  u('kbyr Albyt', 'Albyt kbyr', 'falsch'),
  u('Albyt kbyr jdA', 'Albyt kbyr', 'falsch'),
  u(">$rb mA'", ">a$orabu maA'F", 'richtig'),
  u("A$rb mA'", ">a$orabu maA'F", 'richtig'),
  u('>$rb mA', ">a$orabu maA'F", 'falsch'),
  u('>$rb', ">a$orabu maA'F", 'falsch'),
  // mehrere Lösungen, Leerzeichen, leer
  u('kbyr Albyt', ['Albyt kbyr', 'kbyr Albyt'], 'richtig'),
  u('Albyt kbyrp', ['Albyt kbyr', 'Albyt jmyl'], 'tippfehler', ['tippfehler']),
  u('wAlbyt', 'w Albyt', 'tippfehler', ['leerzeichen']),
  u('w Albyt', 'wAlbyt', 'tippfehler', ['leerzeichen']),
  u('', 'ktAb', 'falsch', ['leer']),
  u('%#', 'ktAb', 'falsch', ['leer']),
  // strenger Modus (Übung harakat)
  u('kitaAbN', 'kitaAbN', 'richtig', [], streng),
  u('kataAbN', 'kitaAbN', 'falsch', ['harakat'], streng),
  u('ktAb', 'kitaAbN', 'falsch', ['harakat'], streng),
  u('kitaAbN', 'kitaAbu', 'falsch', ['harakat'], streng),
  u('kitaAbF', 'kitaAbN', 'falsch', ['harakat'], streng),
  u('mudar~isN', 'mudari~sN', 'richtig', [], streng),
  u('mudari~sN', 'mudar~isN', 'richtig', [], streng),
  u('ki_taAbN', 'kitaAbN', 'richtig', [], streng),
  u('>axN', 'AxN', 'falsch', ['harakat'], streng),
  u('qalamN', 'kitaAbN', 'falsch', [], streng),
  u('mdrsh', 'madorasapN', 'falsch', [], streng),
  u('kitaAbN', ['kataAbN', 'kitaAbN'], 'richtig', [], streng),
  u('kitaAbN%', 'kitaAbN', 'richtig', [], streng),
];

/** Alltagswörter (vokalisiert); keine Palindrome im Gerüst. */
const WOERTER = [
  'kitaAbN',
  'baytN',
  'madorasapN',
  'mudar~isN',
  'TaAlibN',
  'say~aArapN',
  'madiynapN',
  'qalamN',
  'TabiybN',
  'jadiydN',
  'kabiyrN',
  'SagiyrN',
  'jamiylN',
  'TawiylN',
  '$ub~aAkN',
  'maTobaxN',
  'TifolN',
  'yawomN',
  '$amosN',
  'tuf~aAHapN',
  'xubozN',
  'HaliybN',
  'kurosiy~N',
  'daftarN',
  'SadiyqN',
  'maktabN',
  'naAfi*apN',
  'Hadiyqap',
  'sariyrN',
];

const loescheMitte = (w: string) => w.slice(0, Math.floor(w.length / 2)) + w.slice(Math.floor(w.length / 2) + 1);
const umgedreht = (w: string) => Array.from(w).reverse().join('');

const GENERIERT: Fall[] = WOERTER.flatMap((w): Fall[] => {
  const g = geruest(w);
  const faelle: Fall[] = [
    u(w, w, 'richtig'),
    u(g, w, 'richtig'),
    u(g.slice(0, 1) + '_' + g.slice(1), w, 'richtig'),
    ['\u200F' + ar(g) + ar('%'), ar(w), 'richtig'],
    u(umgedreht(g), w, 'falsch'),
    u(g, w, 'falsch', ['harakat'], streng),
  ];
  if (g.length >= 4) faelle.push(u(loescheMitte(g), w, 'tippfehler', ['tippfehler']));
  if (g.endsWith('p')) faelle.push(u(g.slice(0, -1) + 'h', w, 'tippfehler', ['taMarbuta']));
  return faelle;
});

const FAELLE: Fall[] = [...HANDARBEIT, ...GENERIERT];

describe('Abgleich Arabisch: Tabelle', () => {
  it('mindestens 150 Fälle', () => {
    expect(FAELLE.length).toBeGreaterThanOrEqual(150);
  });

  it.each(FAELLE.map((f, i) => [i, ...f] as const))('Fall %i', (_i, antwort, loesung, urteil, hinweise = [], optionen = {}) => {
    const e = gleicheAb(antwort, loesung, 'ar', optionen);
    expect({ urteil: e.urteil, hinweise: e.hinweise }).toEqual({ urteil, hinweise });
  });
});

describe('Abgleich Arabisch: Normalisierung', () => {
  it('ohne Harakat und Tatweel, Alif vereinheitlicht, Hamza-Träger gleich', () => {
    expect(normalisiere(ar('>a_kala'), 'ar')).toBe(ar('Akl'));
    expect(normalisiere(ar('mas&uwlN'), 'ar')).toBe(normalisiere(ar('ms}wl'), 'ar'));
  });
  it('streng: Vokalzeichen bleiben, Reihenfolge Vokal/Schadda kanonisch (NFC)', () => {
    expect(normalisiere(ar('mudar~isN'), 'ar', true)).toBe(normalisiere(ar('mudari~sN'), 'ar', true));
    expect(normalisiere(ar('kitaAbN'), 'ar', true)).not.toBe(normalisiere(ar('ktAb'), 'ar', true));
  });
  it('Kacheln arabischer Sätze ohne Satzzeichen', () => {
    expect(zerlege(ar('Albyt# kbyr%'))).toEqual([ar('Albyt'), ar('kbyr')]);
    expect(fehlendeKacheln(ar('Albayotu kabiyrN'), [ar('Albyt'), ar('kbyr'), ar('Sgyr')], 'ar')).toEqual([]);
  });
});

const ZEICHEN = [
  ...Array.from({ length: 0x064a - 0x0621 + 1 }, (_, i) => String.fromCharCode(0x0621 + i)),
  ...Array.from({ length: 0x065f - 0x064b + 1 }, (_, i) => String.fromCharCode(0x064b + i)),
  '\u0670',
  '\u0671',
  '\u0640',
  '\u06CC',
  '\u06A9',
  '\u0660',
  '\u0669',
  '\u060C',
  '\u061F',
  '\u061C',
  '\u200C',
  '\u200F',
  ' ',
  '.',
];
const text = fc.array(fc.constantFrom(...ZEICHEN), { maxLength: 30 }).map((z) => z.join(''));
const BUCHSTABEN = Array.from('btvjHxd*rzs$SDTZEgfqklmnhwyAp');
const wort = fc.array(fc.constantFrom(...BUCHSTABEN), { minLength: 1, maxLength: 8 }).map((z) => z.join(''));

describe('Abgleich Arabisch: Eigenschaften', () => {
  it('Normalisierung ist idempotent (auch streng)', () => {
    fc.assert(
      fc.property(fc.oneof(text, fc.string({ unit: 'binary' })), fc.boolean(), (s, st) => {
        const n = normalisiere(s, 'ar', st);
        return normalisiere(n, 'ar', st) === n;
      }),
    );
  });

  it('eine Lösung gegen sich selbst ist immer richtig, ohne Hinweis (auch streng)', () => {
    fc.assert(
      fc.property(text, fc.boolean(), (s, st) => {
        fc.pre(normalisiere(s, 'ar', st) !== '');
        const e = gleicheAb(s, s, 'ar', { streng: st });
        return e.urteil === 'richtig' && e.hinweise.length === 0;
      }),
    );
  });

  it('Urteil ist symmetrisch (ohne Lexikon)', () => {
    const paar = fc
      .tuple(fc.array(wort, { minLength: 1, maxLength: 3 }), fc.nat(), fc.constantFrom('p', 'h', 'Y', 'y', '', 'A', '>'))
      .map(([w, i, ein]) => {
        const b = [...w];
        const k = i % b.length;
        const z = b[k]!;
        const p = i % (z.length + 1);
        b[k] = z.slice(0, p) + ein + z.slice(p + 1);
        return [ar(w.join(' ')), ar(b.join(' '))] as const;
      });
    fc.assert(
      fc.property(paar, ([a, b]) => {
        const hin = gleicheAb(a, b, 'ar');
        const her = gleicheAb(b, a, 'ar');
        return angenommen(hin) === angenommen(her) && hin.urteil === her.urteil;
      }),
    );
  });
});
