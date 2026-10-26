import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { createTranslator } from 'next-intl';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import ar from '../../../messages/lernapp/ar.json';
import de from '../../../messages/lernapp/de.json';
import tr from '../../../messages/lernapp/tr.json';
import { dezimal, formatiere, intlSprache, zahl, type Werte, type Ziffern } from '@/lib/lernapp/format';

/**
 * Teilformatierer der Lern-App (ADR 0037 Nr. 5): gleiche Ausgabe wie `createTranslator` von next-intl (nur im Test) für
 * `{name}`, Zahlen, plural mit `#` und `=n`, select, Verschachtelung und Apostroph-Regel; Arabisch mit sechs
 * Pluralkategorien und östlichen bzw. westlichen Ziffern (O-5). Größe < 1 KB gz.
 */
function vergleiche(vorlage: string, werte: Werte, sprache: 'de' | 'tr' | 'ar', ziffern: Ziffern = 'oestlich') {
  const t = createTranslator({ locale: intlSprache(sprache, ziffern), messages: { m: vorlage } });
  return { eigen: formatiere(vorlage, werte, sprache, ziffern), referenz: t('m' as never, werte as never) as string };
}

const VORLAGEN: [string, Werte][] = [
  ['Aufgabe {nr} von {anzahl}', { nr: 3, anzahl: 12 }],
  ['Hallo {name}!', { name: '[Name]' }],
  ['{n} XP', { n: 1234 }],
  ['{n, number} Karten', { n: 1234567 }],
  ['{n, plural, one {# Paar} other {# Paare}} gefunden', { n: 1 }],
  ['{n, plural, one {# Paar} other {# Paare}} gefunden', { n: 4 }],
  ['{n, plural, =0 {Keine Karte fällig} one {Eine Karte fällig} other {# Karten fällig}}', { n: 0 }],
  ['{n, plural, =0 {Keine Karte fällig} one {Eine Karte fällig} other {# Karten fällig}}', { n: 1 }],
  ['{n, plural, =0 {Keine Karte fällig} one {Eine Karte fällig} other {# Karten fällig}}', { n: 1500 }],
  ['{richtig} von {gesamt}: {gesamt, plural, one {eine Aufgabe} other {# Aufgaben}}, {name}', { richtig: 2, gesamt: 3, name: '[Name]' }],
  ['{n, plural, one {{name} hat # Stern} other {{name} hat # Sterne}}', { n: 2, name: '[Name]' }],
  [
    '{art, select, xp {{n} XP am Tag} lektionen {{n, plural, one {# Lektion} other {# Lektionen}}} other {Kein Ziel}}',
    { art: 'lektionen', n: 2 },
  ],
  ['{art, select, xp {{n} XP am Tag} lektionen {# Lektionen} other {Kein Ziel}}', { art: 'kein', n: 2 }],
  ["Türkiye'de {n} kişi", { n: 3 }],
  ["Klammern: '{'name'}' und ''", { name: 'x' }],
  ["{n, plural, one {# ''Paar''} other {# '#' Paare}}", { n: 5 }],
  ['Ohne Platzhalter.', {}],
];

describe('Gleich wie createTranslator', () => {
  it.each(VORLAGEN)('de: %s', (vorlage, werte) => {
    const { eigen, referenz } = vergleiche(vorlage, werte, 'de');
    expect(eigen).toBe(referenz);
  });

  it.each(VORLAGEN)('tr: %s', (vorlage, werte) => {
    const { eigen, referenz } = vergleiche(vorlage, werte, 'tr');
    expect(eigen).toBe(referenz);
  });

  const AR = '{n, plural, zero {Z #} one {O #} two {T #} few {F #} many {M #} other {X #}}';
  const ZAHLEN = [0, 1, 2, 3, 7, 10, 11, 26, 99, 100, 101, 102, 103, 111, 1000, 1001, 1002, 1011, 2.5];

  it.each(ZAHLEN)('ar: sechs Pluralkategorien, östliche Ziffern (n = %d)', (n) => {
    const { eigen, referenz } = vergleiche(AR, { n }, 'ar', 'oestlich');
    expect(eigen).toBe(referenz);
  });

  it.each(ZAHLEN)('ar: westliche Ziffern (n = %d)', (n) => {
    const { eigen, referenz } = vergleiche(AR, { n }, 'ar', 'westlich');
    expect(eigen).toBe(referenz);
  });

  it('ar: alle sechs Kategorien kommen vor', () => {
    expect(new Set(ZAHLEN.map((n) => formatiere(AR, { n }, 'ar')[0]))).toEqual(new Set(['Z', 'O', 'T', 'F', 'M', 'X']));
  });

  it.each(VORLAGEN)('ar (westlich): %s', (vorlage, werte) => {
    const { eigen, referenz } = vergleiche(vorlage, werte, 'ar', 'westlich');
    expect(eigen).toBe(referenz);
  });
});

describe('Zahlen und Ziffern', () => {
  it('östlich-arabisch als Standard der arabischen Oberfläche, umschaltbar', () => {
    expect(zahl(1234, 'ar')).toBe('\u0661\u066C\u0662\u0663\u0664');
    expect(zahl(1234, 'ar', 'westlich')).toBe('1,234');
    expect(zahl(1234, 'de')).toBe('1.234');
    expect(zahl(1234, 'tr')).toBe('1.234');
    expect(intlSprache('de', 'westlich')).toBe('de');
  });

  it('fehlender Wert ergibt leeren Text statt Ausnahme', () => {
    expect(formatiere('A{x}B', {})).toBe('AB');
  });
});

/**
 * Stufe C N8: kleine Zahlen (0 bis unter 1000) und die Pluralkategorie ganzer Zahlen ohne Intl – das erste
 * `Intl.NumberFormat`/`Intl.PluralRules` einer Seite kostete im Profil ≈ 80 ms Hauptfaden (CPU ×4). Gleich wie Intl für alle
 * ganzen Zahlen bis 1200, Dezimalzahlen mit einer Stelle und große Zahlen (dort weiter Intl).
 */
describe('Zahlen und Plural ohne Intl gleich wie Intl', () => {
  const LOC: [string, Ziffern, string][] = [
    ['de', 'oestlich', 'de'],
    ['tr', 'oestlich', 'tr'],
    ['ar', 'oestlich', 'ar-u-nu-arab'],
    ['ar', 'westlich', 'ar-u-nu-latn'],
  ];
  it.each(LOC)('%s (%s): ganze Zahlen 0–1200, Plural 0–1200', (sprache, ziffern, loc) => {
    const nf = new Intl.NumberFormat(loc);
    const pr = new Intl.PluralRules(loc);
    const KAT = '{n, plural, zero {zero} one {one} two {two} few {few} many {many} other {other}}';
    for (let n = 0; n <= 1200; n++) {
      expect(zahl(n, sprache, ziffern)).toBe(nf.format(n));
      // Kategorien, die es in der Sprache nicht gibt, fallen wie bei createTranslator auf other
      expect(formatiere(KAT, { n }, sprache, ziffern)).toBe(pr.select(n));
    }
  });
  it.each(LOC)('%s (%s): Dezimalzahlen mit einer Stelle (MB) und große Zahlen', (sprache, ziffern, loc) => {
    const eine = new Intl.NumberFormat(loc, { maximumFractionDigits: 1 });
    for (const x of [0.1, 0.2, 0.9, 1, 1.26, 2.5, 9.94, 12.34, 99.96, 115.2, 999.9, 1234.5, 10_000])
      expect(dezimal(x, 1, sprache, ziffern)).toBe(eine.format(x));
    for (const x of [1000, 1234, 1_234_567, 2.25, 3.125]) expect(zahl(x, sprache, ziffern)).toBe(new Intl.NumberFormat(loc).format(x));
  });
});

describe('Größe', () => {
  it('höchstens 1,25 KB gz (übersetzt, ohne Kommentare, nicht minifiziert; < 1 KB bis Stufe C N8, dazu die Zahlen ohne Intl)', () => {
    const quelle = readFileSync(join(import.meta.dirname, '..', '..', '..', 'src', 'lib', 'lernapp', 'format.ts'), 'utf8');
    const js = ts.transpileModule(quelle, {
      compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext, removeComments: true },
    }).outputText;
    expect(gzipSync(js, { level: 9 }).length).toBeLessThanOrEqual(1280);
  });
});

/**
 * Jede Nachricht aus `messages/lernapp/*.json` ergibt mit `formatiere` denselben Text wie `createTranslator` – mit Zahlen
 * für alle Pluralkategorien und in der arabischen Oberfläche mit östlich-arabischen und westlichen Ziffern.
 */
type Baum = { [k: string]: string | Baum };
function flach(baum: Baum, praefix = ''): [string, string][] {
  return Object.entries(baum).flatMap(([k, v]) =>
    typeof v === 'string' ? [[`${praefix}${k}`, v] as [string, string]] : flach(v, `${praefix}${k}.`),
  );
}

/** Argumente einer Nachricht: Name → Zahl (plural, number) oder Text. */
function argumente(nachricht: string): Map<string, 'zahl' | 'text'> {
  const aus = new Map<string, 'zahl' | 'text'>();
  for (const m of nachricht.matchAll(/\{\s*(\w+)\s*(?:,\s*(\w+))?/g)) {
    const art = m[2] === 'plural' || m[2] === 'number' ? 'zahl' : 'text';
    if (aus.get(m[1]) !== 'zahl') aus.set(m[1], art);
  }
  return aus;
}

describe('Alle Nachrichten der Lern-App gleich createTranslator', () => {
  const NACHRICHTEN: ['de' | 'tr' | 'ar', Ziffern, Baum][] = [
    ['de', 'oestlich', de],
    ['tr', 'oestlich', tr],
    ['ar', 'oestlich', ar],
    ['ar', 'westlich', ar],
  ];
  const ZAHLEN_ALLE = [0, 1, 2, 3, 11, 100, 1234];

  it('die Prüfung greift (Nachrichten mit Plural und Zahl vorhanden)', () => {
    const alle = flach(de as Baum).map(([, v]) => v);
    expect(alle.length).toBeGreaterThan(100);
    expect(alle.some((v) => v.includes(', plural,'))).toBe(true);
    expect(alle.some((v) => v.includes(', number}'))).toBe(true);
  });

  it.each(NACHRICHTEN)('%s (%s): jede Nachricht, jede Zahl', (sprache, ziffern, nachrichten) => {
    const t = createTranslator({ locale: intlSprache(sprache, ziffern), messages: nachrichten });
    for (const [schluessel, nachricht] of flach(nachrichten)) {
      const args = argumente(nachricht);
      const varianten = [...args.values()].includes('zahl') ? ZAHLEN_ALLE : [1];
      for (const n of varianten) {
        const werte = Object.fromEntries([...args].map(([name, art]) => [name, art === 'zahl' ? n : 'Probe']));
        expect(formatiere(nachricht, werte, sprache, ziffern), `${sprache} ${schluessel} n=${n}`).toBe(
          t(schluessel as never, werte as never),
        );
      }
    }
  });
});
