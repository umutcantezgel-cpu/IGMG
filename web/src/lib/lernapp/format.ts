/**
 * Kleiner ICU-Teilformatierer für den Client der Lern-App (ADR 0037 Nr. 5, PLAN §3.3): `{name}`, `{n, number}` und
 * `{n, plural, =0 {…} one {…} other {…}}` mit `#`, verschachtelt. Arabisch kennt zero/one/two/few/many/other
 * (`Intl.PluralRules`). Im Client der Lern-App gibt es kein next-intl (KERN 4.0 §9); der Unit-Test `lernapp/format`
 * vergleicht jede Nachricht aus `messages/lernapp/*.json` mit `createTranslator`. Apostroph wie ICU: `''` ist ein
 * Apostroph, sonst steht er für sich (Texte der Lern-App setzen keine Klammern in Anführung).
 */
import type { Oberflaeche } from './kurse';

export type Werte = Record<string, string | number>;
/** Ziffern der arabischen Oberfläche: östlich-arabisch (Standard, O-5) oder westlich (LM-18). */
export type Ziffern = 'arab' | 'latn';

/** Sprachkennung für `Intl` und `createTranslator`: in `ar` mit ausdrücklichem Zahlensystem (ADR 0044 Fortschreibung Nr. 4). */
export function intlSprache(ui: Oberflaeche, ziffern: Ziffern = 'arab'): string {
  return ui === 'ar' ? `ar-u-nu-${ziffern}` : ui;
}

/** Index der schließenden Klammer zur öffnenden an `start`. */
function ende(text: string, start: number): number {
  let tiefe = 0;
  for (let i = start; i < text.length; i++) {
    if (text[i] === '{') tiefe++;
    else if (text[i] === '}' && --tiefe === 0) return i;
  }
  return text.length;
}

function zahl(wert: number, sprache: string): string {
  return new Intl.NumberFormat(sprache).format(wert);
}

/** Zweige eines Plurals: `=0 {…} one {…} other {…}` → Liste aus Auswahl und Text. */
function zweige(rest: string): [string, string][] {
  const aus: [string, string][] = [];
  let i = 0;
  while (i < rest.length) {
    const auf = rest.indexOf('{', i);
    if (auf < 0) break;
    const zu = ende(rest, auf);
    aus.push([rest.slice(i, auf).trim(), rest.slice(auf + 1, zu)]);
    i = zu + 1;
  }
  return aus;
}

function argument(inhalt: string, werte: Werte, sprache: string): string {
  const [name, art = '', ...teile] = inhalt.split(',');
  const wert = werte[name.trim()];
  const typ = art.trim();
  if (typ === 'number') return zahl(Number(wert), sprache);
  if (typ !== 'plural') return String(wert ?? '');
  const n = Number(wert);
  const liste = zweige(teile.join(','));
  const genau = liste.find(([k]) => k === `=${n}`);
  const kategorie = new Intl.PluralRules(sprache).select(n);
  const zweig = genau ?? liste.find(([k]) => k === kategorie) ?? liste.find(([k]) => k === 'other');
  return zweig ? formatiere(zweig[1], werte, sprache, zahl(n, sprache)) : '';
}

/** Formatiert eine Nachricht; `raute` ersetzt `#` innerhalb eines Pluralzweigs (nicht in verschachtelten Argumenten). */
export function formatiere(nachricht: string, werte: Werte = {}, sprache = 'de', raute?: string): string {
  let aus = '';
  for (let i = 0; i < nachricht.length; i++) {
    const z = nachricht[i];
    if (z === '{') {
      const zu = ende(nachricht, i);
      aus += argument(nachricht.slice(i + 1, zu), werte, sprache);
      i = zu;
    } else if (z === '#' && raute !== undefined) aus += raute;
    else if (z === "'" && nachricht[i + 1] === "'") {
      aus += "'";
      i++;
    } else aus += z;
  }
  return aus;
}
