import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Bewegungsregister B-01 (Kern K-007, Stufe C Z-05): Bei reduzierter Bewegung gibt es keine Größen- oder Lageänderung auf
 * Hover und Druck – die Rückmeldung bleibt allein die Farbe. Die Druck-Skalierung kommt nur aus der Utility `druck`
 * (globals.css, nur bei `prefers-reduced-motion: no-preference`); Skalieren über die active-Variante und Verschieben auf
 * Hover ohne `motion-safe:` sind im Quelltext verboten.
 */
const WURZEL = join(import.meta.dirname, '..', '..', 'src');
const CSS = readFileSync(join(WURZEL, 'app', 'globals.css'), 'utf8');

function dateien(ordner: string): string[] {
  return readdirSync(ordner).flatMap((n) => {
    const p = join(ordner, n);
    return statSync(p).isDirectory() ? dateien(p) : /\.tsx?$/.test(n) ? [p] : [];
  });
}
const quellen = dateien(WURZEL).map((p) => ({ name: p.slice(WURZEL.length + 1), text: readFileSync(p, 'utf8') }));

/** Klassen-Token (durch Leerraum, Anführungszeichen oder Backticks getrennt) mit Zustand und Bewegung. */
const BEWEGUNG_AUF_ZUSTAND = /(?:^|:)(?:group-|peer-)?(?:hover|active|focus|focus-visible|focus-within):-?(?:scale|translate|rotate)-/;

function funde(muster: (token: string) => boolean): string[] {
  return quellen.flatMap(({ name, text }) =>
    text.split('\n').flatMap((zeile, i) =>
      zeile
        .split(/[\s'"`{}()]+/)
        .filter(muster)
        .map((t) => `${name}:${i + 1} ${t}`),
    ),
  );
}

describe('B-01 Druck-Rückmeldung und reduzierte Bewegung', () => {
  it('die Prüfung greift (Quelltext gelesen, `druck` im Einsatz)', () => {
    expect(quellen.length).toBeGreaterThan(300);
    expect(funde((t) => t === 'druck').length).toBeGreaterThan(100);
  });

  it('keine Skalierung über die active-Variante im Quelltext – stattdessen die Utility `druck`', () => {
    expect(funde((t) => /(?:^|:)active:scale-/.test(t))).toEqual([]);
  });

  it('keine Größe oder Lage auf Hover, Fokus oder Druck ohne `motion-safe:`', () => {
    expect(funde((t) => BEWEGUNG_AUF_ZUSTAND.test(t) && !t.startsWith('motion-safe:'))).toEqual([]);
  });

  it('`druck` skaliert nur ohne Wunsch nach reduzierter Bewegung', () => {
    const block = /@utility druck \{([\s\S]*?)\n\}/.exec(CSS)?.[1] ?? '';
    expect(block).toMatch(/@media \(prefers-reduced-motion: no-preference\) \{\s*&:active \{\s*scale: 98%;\s*\}\s*\}/);
    // außerhalb der Medienabfrage keine Skalierung
    expect(block.replace(/@media[\s\S]*$/, '')).not.toMatch(/scale/);
  });
});

/**
 * Bewegungsregister der Lern-App (KERN 4.0 §10, B-28 … B-35; ADR 0043 Nr. 11): nur CSS, jede Bewegung mit reduzierter
 * Variante – entweder als `motion-reduce:`-Klasse an der Stelle oder über eine Klasse aus globals.css, die im Block
 * `prefers-reduced-motion: reduce` steht. Eigene `@keyframes` nur im Register (globals.css), keine Bewegung per Skript
 * (Web Animations API, Bibliotheken). B-35 (`sprechen/Pegel.tsx`) bringt L2-02 mit; die Prüfung greift nach der
 * Zusammenführung.
 */
const LERNAPP = join(WURZEL, 'components', 'lernapp');
const REDUZIERT = [...CSS.matchAll(/@media \(prefers-reduced-motion: reduce\) \{([\s\S]*?)\n\}/g)].map((m) => m[1] ?? '').join('\n');
/** Klasse aus globals.css hat eine reduzierte Variante (Animation aus bzw. nur Überblendung). */
const reduziertInCss = (klasse: string) => new RegExp(`\\.${klasse}(?![\\w-])`).test(REDUZIERT);

type Eintrag = { id: string; datei: string; bewegung: RegExp; reduziert: RegExp | { css: string }; paket?: string };
const REGISTER: Eintrag[] = [
  { id: 'B-28', datei: 'Fortschrittsleiste.tsx', bewegung: /transition-transform/, reduziert: /motion-reduce:transition-none/ },
  { id: 'B-29', datei: 'Rueckmeldung.tsx', bewegung: /translate-y-6/, reduziert: /motion-reduce:translate-y-0/ },
  { id: 'B-29 (Stern)', datei: 'Rueckmeldung.tsx', bewegung: /stern-fuellt/, reduziert: { css: 'stern-fuellt' } },
  { id: 'B-30', datei: 'Abschluss.tsx', bewegung: /linie-zeichnet/, reduziert: { css: 'linie-zeichnet' } },
  { id: 'B-31', datei: join('aufgaben', 'Wortbank.tsx'), bewegung: /tritt-auf/, reduziert: { css: 'tritt-auf' } },
  { id: 'B-32', datei: join('aufgaben', 'Paare.tsx'), bewegung: /linie-zeichnet/, reduziert: { css: 'linie-zeichnet' } },
  { id: 'B-33', datei: 'Serie.tsx', bewegung: /stern-fuellt/, reduziert: { css: 'stern-fuellt' } },
  { id: 'B-34', datei: 'Abzeichen.tsx', bewegung: /starting:scale-96/, reduziert: /motion-reduce:starting:scale-100/ },
  { id: 'B-35', datei: join('sprechen', 'Pegel.tsx'), bewegung: /scale/, reduziert: /motion-reduce:/, paket: 'L2-02' },
];

describe('Lern-App: Bewegungsregister B-28 … B-35', () => {
  it('die Prüfung greift (reduzierter Block gelesen, Register vollständig)', () => {
    expect(REDUZIERT).toMatch(/animation: none/);
    expect(new Set(REGISTER.map((e) => e.id.slice(0, 4)))).toEqual(
      new Set(['B-28', 'B-29', 'B-30', 'B-31', 'B-32', 'B-33', 'B-34', 'B-35']),
    );
  });

  it.each(REGISTER.map((e) => [e.id, e] as const))('%s: Bewegung nur in CSS, mit reduzierter Variante', (_id, e) => {
    const pfad = join(LERNAPP, e.datei);
    if (e.paket && !existsSync(pfad)) return; // kommt mit e.paket
    const text = readFileSync(pfad, 'utf8');
    expect(text, `${e.id} in ${e.datei}`).toMatch(e.bewegung);
    if (e.reduziert instanceof RegExp) expect(text, `${e.id} reduziert`).toMatch(e.reduziert);
    else expect(reduziertInCss(e.reduziert.css), `${e.id}: .${e.reduziert.css} im reduzierten Block`).toBe(true);
  });

  it('keine eigenen @keyframes und keine Bewegung per Skript in components/lernapp', () => {
    const funde = dateien(LERNAPP).flatMap((p) => {
      const t = readFileSync(p, 'utf8');
      return [
        /@keyframes/.test(t) && `${p}: @keyframes`,
        /\.animate\(/.test(t) && `${p}: Web Animations API`,
        /from '(?:framer-motion|motion|motion\/react|react-spring|gsap)'/.test(t) && `${p}: Bewegungsbibliothek`,
      ].filter(Boolean);
    });
    expect(funde).toEqual([]);
  });

  it('@keyframes nur aus dem Register (neue Bewegung = neuer Registereintrag)', () => {
    const namen = [...CSS.matchAll(/@keyframes ([a-z-]+)/g)].map((m) => m[1]);
    expect(namen).toEqual([
      'einblenden',
      'ausblenden',
      'auftritt',
      'auftritt-mitte',
      'zeichnen',
      'enthuellen',
      'schiebefenster',
      'schiebefenster-gegen',
      'wachsen',
      'aufziehen',
      'hervortreten',
      'schublade',
      'seite-von-rechts',
      'seite-von-links',
      'seite-nach-links',
      'seite-nach-rechts',
      'schreiben',
    ]);
  });
});

/**
 * Keine hochzählenden Zahlen (KERN 4.0 §1 und §10, ADR 0043 Nr. 1 und 9, Tor L7): XP, Tagesziel, Serie, Kennzahlen und
 * Abzeichen stehen sofort mit ihrem Endwert da. Die Bausteine der Spielelemente haben darum keine Zeitgeber und keine
 * Bildschleife; in der ganzen Lern-App gibt es keine Intervall-Uhr außerhalb der Aufnahme (B-35, funktional) und keine
 * CSS-Zähler. Animierbare Zahlen über `@property` (Typ `<integer>` oder `<number>`) gibt es in globals.css nicht.
 */
const SPIELELEMENTE = [
  'Abschluss.tsx',
  'Serie.tsx',
  'Abzeichen.tsx',
  join('inseln', 'FortschrittInsel.tsx'),
  join('inseln', 'HeuteInsel.tsx'),
];

describe('Lern-App: keine hochzählenden Zahlen', () => {
  it.each(SPIELELEMENTE)('%s: ohne Zeitgeber und Bildschleife', (datei) => {
    const text = readFileSync(join(LERNAPP, datei), 'utf8');
    expect(text, datei).not.toMatch(/\b(?:setInterval|setTimeout|requestAnimationFrame|requestIdleCallback)\s*\(/);
    expect(text, datei).not.toMatch(/\b(?:counter-(?:reset|increment|set)|@property)\b/);
  });

  it('keine Intervall-Uhr in components/lernapp außer der Aufnahme (sprechen/)', () => {
    const funde = dateien(LERNAPP)
      .filter((p) => !p.includes(`${join('lernapp', 'sprechen')}`))
      .filter((p) => /\bsetInterval\s*\(/.test(readFileSync(p, 'utf8')));
    expect(funde).toEqual([]);
  });

  it('keine animierbaren Zahlen und keine CSS-Zähler im Designsystem', () => {
    expect(CSS).not.toMatch(/@property[^{]*\{[^}]*syntax:\s*['"]<(?:integer|number)>/);
    expect(CSS).not.toMatch(/counter-increment/);
  });

  it('die Prüfung greift (Gegenprobe)', () => {
    const zaehlt = 'useEffect(() => { const id = setInterval(() => setN((n) => n + 1), 16); }, []);';
    expect(/\b(?:setInterval|setTimeout|requestAnimationFrame|requestIdleCallback)\s*\(/.test(zaehlt)).toBe(true);
    expect(/@property[^{]*\{[^}]*syntax:\s*['"]<(?:integer|number)>/.test("@property --n { syntax: '<integer>'; }")).toBe(true);
  });
});
