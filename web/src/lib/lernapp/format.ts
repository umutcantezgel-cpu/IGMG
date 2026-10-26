/**
 * Kleiner ICU-Teilformatierer für den Client der Lern-App (ADR 0037 Nr. 5, PLAN §3.3; < 1 KB gz): `{name}`,
 * `{n, number}`, `{n, plural, =0 {…} one {…} other {…}}` mit `#` und `{x, select, … other {…}}`, verschachtelt. Wie
 * intl-messageformat schreibt `{n}` die Zahl unverändert; Ziffern der Oberfläche nur über `{n, number}` und `#`. Plural
 * über `Intl.PluralRules` (Arabisch: zero, one, two, few, many, other). Apostroph-Regel wie ICU („'{'“, „''“).
 * Ziffern der arabischen Oberfläche östlich-arabisch, umschaltbar auf westliche (O-5). Im Client der Lern-App gibt es
 * kein next-intl; der Unit-Test vergleicht mit `createTranslator`.
 */

export type Ziffern = 'oestlich' | 'westlich';
export type Werte = Readonly<Record<string, string | number>>;

/** Sprachkennung für Intl: Arabisch mit gewähltem Zahlensystem. */
export const intlSprache = (sprache: string, ziffern: Ziffern = 'oestlich'): string =>
  sprache === 'ar' ? `ar-u-nu-${ziffern === 'westlich' ? 'latn' : 'arab'}` : sprache;

/**
 * Intl-Objekte je Sprachkennung (und Nachkommastellen) gemerkt: Ein neues `Intl.NumberFormat` bzw. `Intl.PluralRules` kostet
 * ≈ 30–50 µs, und der Lernpfad formatiert je Einheit mehrere Zahlen (Stufe C N8, TBT).
 */
const zahlFormate = new Map<string, Intl.NumberFormat>();
const pluralRegeln = new Map<string, Intl.PluralRules>();

function zahlFormat(loc: string, stellen?: number): Intl.NumberFormat {
  const schluessel = stellen === undefined ? loc : `${loc}|${stellen}`;
  let f = zahlFormate.get(schluessel);
  if (!f) {
    f = new Intl.NumberFormat(loc, stellen === undefined ? undefined : { maximumFractionDigits: stellen });
    zahlFormate.set(schluessel, f);
  }
  return f;
}

function pluralRegel(loc: string): Intl.PluralRules {
  let r = pluralRegeln.get(loc);
  if (!r) {
    r = new Intl.PluralRules(loc);
    pluralRegeln.set(loc, r);
  }
  return r;
}

const zahlIn = (n: number, loc: string) => zahlFormat(loc).format(n);

/** Zahl in der Schreibweise der Oberfläche. */
export const zahl = (n: number, sprache: string, ziffern?: Ziffern): string => zahlIn(n, intlSprache(sprache, ziffern));

/** Dezimalzahl mit höchstens `stellen` Nachkommastellen in der Schreibweise der Oberfläche (z. B. MB im Ring „offline speichern“). */
export const dezimal = (n: number, stellen: number, sprache: string, ziffern?: Ziffern): string =>
  zahlFormat(intlSprache(sprache, ziffern), stellen).format(n);

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
        aus += teile(z.get(`=${n}`) ?? z.get(pluralRegel(loc).select(n)) ?? z.get('other') ?? '', w, loc, n);
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
