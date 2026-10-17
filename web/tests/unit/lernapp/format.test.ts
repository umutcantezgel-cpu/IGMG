import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { createTranslator } from 'next-intl';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import { formatiere, intlSprache, zahl, type Werte, type Ziffern } from '@/lib/lernapp/format';

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

describe('Größe', () => {
  it('unter 1 KB gz (übersetzt, ohne Kommentare, nicht minifiziert)', () => {
    const quelle = readFileSync(join(import.meta.dirname, '..', '..', '..', 'src', 'lib', 'lernapp', 'format.ts'), 'utf8');
    const js = ts.transpileModule(quelle, {
      compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext, removeComments: true },
    }).outputText;
    expect(gzipSync(js, { level: 9 }).length).toBeLessThan(1024);
  });
});
