/**
 * Kleiner ICU-Teilformatierer für den Client der Lern-App (ADR 0037 Nr. 5, PLAN §3.3; < 1 KB gz, seit Stufe C N8 mit eigenen
 * kleinen Zahlen ≤ 1,25 KB): `{name}`, `{n, number}`, `{n, plural, =0 {…} one {…} other {…}}` mit `#` und
 * `{x, select, … other {…}}`, verschachtelt. Wie intl-messageformat schreibt `{n}` die Zahl unverändert; Ziffern der
 * Oberfläche nur über `{n, number}` und `#`. Plural für ganze Zahlen nach CLDR, sonst über `Intl.PluralRules` (Arabisch: zero,
 * one, two, few, many, other). Apostroph-Regel wie ICU („'{'“, „''“). Ziffern der arabischen Oberfläche östlich-arabisch,
 * umschaltbar auf westliche (O-5). Im Client der Lern-App gibt es kein next-intl; der Unit-Test vergleicht mit
 * `createTranslator` und mit Intl.
 */

export type Ziffern = 'oestlich' | 'westlich';
export type Werte = Readonly<Record<string, string | number>>;

/** Sprachkennung für Intl: Arabisch mit gewähltem Zahlensystem. */
export const intlSprache = (sprache: string, ziffern: Ziffern = 'oestlich'): string =>
  sprache === 'ar' ? `ar-u-nu-${ziffern === 'westlich' ? 'latn' : 'arab'}` : sprache;

/**
 * Kleine Zahlen ohne Intl (Stufe C N8): Das erste `Intl.NumberFormat` bzw. `Intl.PluralRules` einer Seite kostet ≈ 20 ms
 * (ICU). Zahlen von 0 bis unter 1000 in de, tr und ar schreibt `klein` selbst (Komma wie Intl, östlich-arabisch mit U+066B),
 * die Pluralkategorie ganzer Zahlen ≥ 0 kommt nach CLDR aus `kategorie`; alles andere über Intl.
 */
const EIGEN = /^(de|tr|ar-u-nu-)/;
function klein(n: number, loc: string, stellen: number): string | null {
  if (!(n >= 0 && n < 1e3 && EIGEN.test(loc))) return null;
  const s = n.toFixed(stellen).replace(/\.?0+$/, (r) => (stellen ? '' : r));
  const arab = loc.endsWith('arab');
  const t = s.replace('.', loc[0] !== 'a' ? ',' : arab ? '\u066B' : '.');
  return arab ? t.replace(/\d/g, (d) => String.fromCharCode(1632 + +d)) : t;
}

function kategorie(n: number, loc: string): string {
  const h = n % 100;
  if (!(Number.isInteger(n) && n >= 0 && EIGEN.test(loc))) return new Intl.PluralRules(loc).select(n);
  if (loc[0] !== 'a') return n === 1 ? 'one' : 'other';
  return n < 3 ? ['zero', 'one', 'two'][n]! : h > 10 ? 'many' : h > 2 ? 'few' : 'other';
}

const zahlIn = (n: number, loc: string) => klein(n, loc, 3) ?? new Intl.NumberFormat(loc).format(n);

/** Zahl in der Schreibweise der Oberfläche. */
export const zahl = (n: number, sprache: string, ziffern?: Ziffern): string => zahlIn(n, intlSprache(sprache, ziffern));

/** Dezimalzahl mit höchstens `stellen` Nachkommastellen in der Schreibweise der Oberfläche (MB im Ring „offline speichern“). */
export function dezimal(n: number, stellen: number, sprache: string, ziffern?: Ziffern): string {
  const loc = intlSprache(sprache, ziffern);
  return klein(n, loc, stellen) ?? new Intl.NumberFormat(loc, { maximumFractionDigits: stellen }).format(n);
}

/** Position der schließenden Klammer zur `{` an `i`. */
function ende(t: string, i: number): number {
  for (let tiefe = 0; i < t.length; i++) {
    if (t[i] === '{') tiefe++;
    else if (t[i] === '}' && !--tiefe) return i;
  }
  return t.length;
}

/** Zweige `schluessel {text}` eines plural/select. */
function zweige(r: string): Map<string, string> {
  const m = new Map<string, string>();
  for (let i = 0, k: number; (k = r.indexOf('{', i)) >= 0;) {
    const e = ende(r, k);
    m.set(r.slice(i, k).trim(), r.slice(k + 1, e));
    i = e + 1;
  }
  return m;
}

function teile(t: string, w: Werte, loc: string, nr?: number): string {
  let aus = '';
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (c === "'" && /[{}#|']/.test(t[i + 1] ?? '')) {
      if (t[i + 1] === "'") {
        aus += "'";
        i++;
        continue;
      }
      const j = t.indexOf("'", i + 1);
      aus += t.slice(i + 1, j < 0 ? t.length : j);
      i = j < 0 ? t.length : j;
    } else if (c === '#' && nr !== undefined) aus += zahlIn(nr, loc);
    else if (c !== '{') aus += c;
    else {
      const e = ende(t, i);
      const [, name = '', art, rest = ''] = /^\s*(\w+)\s*(?:,\s*(\w+)\s*,?([\s\S]*))?$/.exec(t.slice(i + 1, e)) ?? [];
      const wert = w[name];
      if (art === 'plural') {
        const n = Number(wert);
        const z = zweige(rest);
        aus += teile(z.get(`=${n}`) ?? z.get(kategorie(n, loc)) ?? z.get('other') ?? '', w, loc, n);
      } else if (art === 'select') {
        const z = zweige(rest);
        aus += teile(z.get(String(wert)) ?? z.get('other') ?? '', w, loc, nr);
      } else aus += art === 'number' ? zahlIn(Number(wert), loc) : String(wert ?? '');
      i = e;
    }
  }
  return aus;
}

/** Vorlage aus `messages/lernapp/<sprache>.json` mit Werten füllen. */
export function formatiere(vorlage: string, werte: Werte = {}, sprache = 'de', ziffern: Ziffern = 'oestlich'): string {
  return teile(vorlage, werte, intlSprache(sprache, ziffern));
}
