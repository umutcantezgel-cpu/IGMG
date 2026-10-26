import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import { feldKlasse } from '@/components/lernapp/aufgaben/schreibmarke';

/**
 * Sichtbarer Fokus (WCAG 2.4.7, KERN 4.0 §8; Stufe C N9b): In Tailwind 4 setzt `outline-none` die Variable
 * `--tw-outline-style` auf `none`; `focus-visible:outline-2` übernimmt sie (`outline-style: var(--tw-outline-style)`). Steht
 * beides an einem Element, bleibt der Fokusring unsichtbar – so war es bei allen Antwortfeldern (`feldKlasse`). Erlaubt bleibt
 * `outline-none` nur ohne eigenen Fokusring (programmatisch fokussierte Überschriften und Zeilen mit `tabIndex={-1}`).
 */
const WURZEL = join(import.meta.dirname, '..', '..', '..', 'src', 'components', 'lernapp');
const dateien = (ordner: string): string[] =>
  readdirSync(ordner).flatMap((n) => {
    const p = join(ordner, n);
    return statSync(p).isDirectory() ? dateien(p) : /\.(tsx?|mts)$/.test(n) ? [p] : [];
  });

/**
 * Klassenlisten eines Quelltexts über den TypeScript-Parser (statt eines regulären Ausdrucks, der an `${…}` mit eigenen
 * Anführungszeichen scheiterte): jedes Zeichenketten-Literal; ein Template-Literal als seine statischen Teile (Ausdrücke als
 * Leerzeichen) und zusätzlich je Zeichenkette in einem seiner Ausdrücke zusammen mit den statischen Teilen (ein Zweig einer
 * Bedingung). Ergebnis: die Listen mit `outline-none` und einem eigenen Fokusring zugleich.
 */
function widersprueche(datei: string, text: string): string[] {
  const art = datei.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const quelle = ts.createSourceFile(datei, text, ts.ScriptTarget.Latest, false, art);
  const widerspruch = (liste: string) => {
    const klassen = liste.split(/\s+/);
    return klassen.includes('outline-none') && klassen.some((k) => k.startsWith('focus-visible:outline') || k.startsWith('focus:outline'));
  };
  const zeichenketten = (knoten: ts.Node): string[] => {
    const gefunden: string[] = [];
    const geh = (n: ts.Node): void => {
      if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) gefunden.push(n.text);
      n.forEachChild(geh);
    };
    geh(knoten);
    return gefunden;
  };
  const funde: string[] = [];
  const geh = (n: ts.Node): void => {
    if ((ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) && widerspruch(n.text)) funde.push(n.text);
    else if (ts.isTemplateExpression(n)) {
      const statisch = [n.head.text, ...n.templateSpans.map((t) => t.literal.text)].join(' ');
      const zweige = n.templateSpans.flatMap((t) => zeichenketten(t.expression)).map((z) => `${statisch} ${z}`);
      if ([statisch, ...zweige].some(widerspruch)) funde.push(statisch);
    }
    n.forEachChild(geh);
  };
  geh(quelle);
  return funde;
}

describe('Fokusring der Lern-App', () => {
  it('Antwortfelder: kein outline-none neben dem eigenen Fokusring', () => {
    for (const status of [null, 'angenommen', 'nicht'] as const) {
      const k = feldKlasse('de', status).split(/\s+/);
      expect(k).toContain('focus-visible:outline-2');
      expect(k).not.toContain('outline-none');
    }
  });

  it('keine Klassenliste mit outline-none und focus-visible:outline-* zugleich', () => {
    const funde = dateien(WURZEL).flatMap((datei) =>
      widersprueche(datei, readFileSync(datei, 'utf8')).map((k) => `${relative(WURZEL, datei)}: ${k.slice(0, 80)}`),
    );
    expect(funde).toEqual([]);
  });

  it('die Suche erkennt auch Template-Literale mit ${…} (Gegenprüfung 2 N9b) und trennt Zweige einer Bedingung', () => {
    const probe = (quelltext: string) => widersprueche('probe.tsx', quelltext);
    // statische Teile um einen Ausdruck mit eigenen Anführungszeichen
    expect(probe('const k = `rounded outline-none ${an ? "a" : \'b\'} focus-visible:outline-2`;')).toHaveLength(1);
    // der Fokusring kommt aus dem Zweig einer Bedingung
    expect(probe("const k = `outline-none ${fokus ? 'focus-visible:outline-2' : ''}`;")).toHaveLength(1);
    // JSX-Attribut und ein Apostroph in einer anderen Zeichenkette davor
    expect(probe(`const a = "it's"; const b = <p className="outline-none focus:outline-2" />;`)).toHaveLength(1);
    // einander ausschließende Zweige sind kein Widerspruch, ebenso wenig outline-none allein
    expect(probe("const k = `p-2 ${an ? 'outline-none' : 'focus-visible:outline-2'}`;")).toEqual([]);
    expect(probe("const k = 'outline-none'; const h = <h3 tabIndex={-1} className={`text-20 ${k}`} />;")).toEqual([]);
  });
});
