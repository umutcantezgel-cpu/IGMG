import { REGELN_AR } from './ar';
import { REGELN_DE } from './de';
import {
  APOSTROPH_LOCKERUNG,
  AUSKUNFT_HINWEISE,
  bereite,
  HINWEIS_SCHLUESSEL,
  type HinweisSchluessel,
  type Lockerung,
  normalisiereMit,
  type Sprache,
  type SprachRegeln,
  woerter,
} from './normalisiere';
import { imTippfehlerBereich, maxTippfehlerWoerter } from './toleranz';
import { REGELN_TR } from './tr';

/**
 * Antwortabgleich (PLAN §4.1): vergleicht eine Antwort mit allen angenommenen Lösungen und liefert das beste Urteil.
 *
 * - `richtig`: gleich nach Normalisierung (Satzzeichen, Leerraum, Apostrophe, Kleinschreibung, stille Regeln der Sprache);
 *   reine Auskunft-Hinweise (Apostroph) mindern das Urteil nicht.
 * - `tippfehler`: „Tippfehler, trotzdem richtig“ – angenommen mit Hinweis (Lockerung der Sprache, Tippfehler innerhalb der
 *   Grenze je Wortlänge, Leerzeichen). Für die Wiederholung zählt das als „schwer“ (srs.ts).
 * - `falsch`: sonst; ein anderes gültiges Kurswort ist nie ein Tippfehler (Lexikonschutz).
 *
 * Der Abgleich rät keine Morphologie: Varianten (Wortstellung, Klitika, Synonyme) liefert der Inhalt als weitere Lösungen.
 */

export type { HinweisSchluessel, Sprache } from './normalisiere';
export { bereite, HINWEIS_SCHLUESSEL, SPRACHEN } from './normalisiere';

export const REGELN: Readonly<Record<Sprache, SprachRegeln>> = { de: REGELN_DE, tr: REGELN_TR, ar: REGELN_AR };

export type Urteil = 'richtig' | 'tippfehler' | 'falsch';
export const URTEILE: readonly Urteil[] = ['richtig', 'tippfehler', 'falsch'];

export type Ergebnis = {
  urteil: Urteil;
  /** Hinweise in fester Reihenfolge (HINWEIS_SCHLUESSEL), ohne Doppelte. */
  hinweise: HinweisSchluessel[];
  /** Anzeigeform der passenden Lösung (bei `falsch` die erste Lösung). */
  loesung: string;
  /** Index der passenden Lösung, −1 bei `falsch`. */
  index: number;
};

/** Gültige Kurswörter in Vergleichsform (für den Lexikonschutz), einmal je Lektion vorbereitet. */
export type Lexikon = { sprache: Sprache; woerter: ReadonlySet<string> };

export type AbgleichOptionen = {
  /** Tippfehler-Toleranz (Standard an; aus für Wortbank und Satzbau, wo nur Kacheln gewählt werden). */
  toleranz?: boolean;
  /** Strenger Modus der Übung `harakat`: Vokalzeichen und Hamza-Formen zählen, keine Lockerungen, keine Tippfehler. */
  streng?: boolean;
  lexikon?: Lexikon;
};

/** Vergleichsform eines Textes in einer Sprache (idempotent). */
export function normalisiere(text: string, sprache: Sprache, streng = false): string {
  return normalisiereMit(text, REGELN[sprache], streng);
}

/** Lexikon aus Wörtern oder Wendungen des Kurses (jedes Wort einer Wendung zählt). */
export function bereiteLexikon(eintraege: Iterable<string>, sprache: Sprache): Lexikon {
  const menge = new Set<string>();
  for (const e of eintraege) for (const w of woerter(normalisiere(e, sprache))) menge.add(w);
  return { sprache, woerter: menge };
}

type WortVergleich = { ok: boolean; hinweise: HinweisSchluessel[]; tipp: boolean };
const NEIN: WortVergleich = { ok: false, hinweise: [], tipp: false };

const wendeAlle = (lockerungen: readonly Lockerung[], w: string) => lockerungen.reduce((s, l) => l.wende(s), w);

function vergleicheWort(
  a: string,
  b: string,
  lockerungen: readonly Lockerung[],
  toleranz: boolean,
  lexikon: ReadonlySet<string> | undefined,
): WortVergleich {
  if (a === b) return { ok: true, hinweise: [], tipp: false };
  if (lexikon?.has(a)) return NEIN;
  const la = wendeAlle(lockerungen, a);
  const lb = wendeAlle(lockerungen, b);
  if (la === lb) {
    // nötig ist jede Lockerung, ohne die die Wörter verschieden blieben
    let noetig = lockerungen.filter((l) => {
      const ohne = lockerungen.filter((x) => x !== l);
      return wendeAlle(ohne, a) !== wendeAlle(ohne, b);
    });
    if (!noetig.length) noetig = lockerungen.filter((l) => l.wende(a) !== a || l.wende(b) !== b).slice(0, 1);
    return { ok: true, hinweise: noetig.map((l) => l.hinweis), tipp: false };
  }
  if (toleranz && imTippfehlerBereich(a, b, [[la, lb]])) return { ok: true, hinweise: ['tippfehler'], tipp: true };
  return NEIN;
}

const ordne = (hinweise: Iterable<HinweisSchluessel>) => HINWEIS_SCHLUESSEL.filter((h) => new Set(hinweise).has(h));

function urteilAus(hinweise: readonly HinweisSchluessel[]): Urteil {
  return hinweise.some((h) => !AUSKUNFT_HINWEISE.has(h)) ? 'tippfehler' : 'richtig';
}

/** Abgleich mit genau einer Lösung. */
function gleicheMitEiner(
  antwort: string,
  loesung: string,
  regeln: SprachRegeln,
  optionen: AbgleichOptionen,
): Omit<Ergebnis, 'loesung' | 'index'> {
  const streng = optionen.streng ?? false;
  const lockerungen = streng ? [] : [APOSTROPH_LOCKERUNG, ...regeln.lockerungen];
  const toleranz = !streng && (optionen.toleranz ?? true);
  const lexikon = optionen.lexikon?.sprache === regeln.sprache ? optionen.lexikon.woerter : undefined;
  const a = woerter(normalisiereMit(antwort, regeln, streng));
  const b = woerter(normalisiereMit(loesung, regeln, streng));
  if (!a.length) return { urteil: 'falsch', hinweise: ['leer'] };

  let hinweise: HinweisSchluessel[] | null = null;
  if (a.length === b.length) {
    const gesammelt: HinweisSchluessel[] = [];
    let tippWoerter = 0;
    for (let i = 0; i < a.length; i++) {
      const v = vergleicheWort(a[i] as string, b[i] as string, lockerungen, toleranz, lexikon);
      if (!v.ok) {
        tippWoerter = Infinity;
        break;
      }
      gesammelt.push(...v.hinweise);
      if (v.tipp) tippWoerter++;
    }
    if (tippWoerter <= maxTippfehlerWoerter(b.length)) hinweise = gesammelt;
  }
  if (!hinweise && a.length !== b.length) {
    // anders getrennt oder zusammengeschrieben: gleich ohne Leerzeichen (nur Lockerungen, keine Tippfehler)
    const v = vergleicheWort(a.join(''), b.join(''), lockerungen, false, undefined);
    if (v.ok) hinweise = ['leerzeichen', ...v.hinweise];
  }
  if (!hinweise) {
    // streng: ohne Vokal- und Hamzazeichen gleich → der Fehler liegt genau in diesen Zeichen
    if (streng && normalisiereMit(antwort, regeln) === normalisiereMit(loesung, regeln)) return { urteil: 'falsch', hinweise: ['harakat'] };
    return { urteil: 'falsch', hinweise: [] };
  }
  if (regeln.pruefeSchreibung && a.length === b.length) {
    const ao = woerter(bereite(antwort));
    const bo = woerter(bereite(loesung));
    if (ao.length === a.length && bo.length === b.length) hinweise.push(...regeln.pruefeSchreibung(ao, bo));
  }
  const geordnet = ordne(hinweise);
  return { urteil: urteilAus(geordnet), hinweise: geordnet };
}

const RANG: Record<Urteil, number> = { richtig: 0, tippfehler: 1, falsch: 2 };

/**
 * Antwort gegen alle Lösungen (die erste ist die Hauptlösung). Gewählt wird das beste Urteil, dann die wenigsten Hinweise,
 * dann die frühere Lösung.
 */
export function gleicheAb(
  antwort: string,
  loesungen: string | readonly string[],
  sprache: Sprache,
  optionen: AbgleichOptionen = {},
): Ergebnis {
  const liste = typeof loesungen === 'string' ? [loesungen] : loesungen;
  if (!liste.length) throw new Error('gleicheAb: keine Lösung angegeben');
  const regeln = REGELN[sprache];
  let bestes: Ergebnis | undefined;
  for (let index = 0; index < liste.length; index++) {
    const loesung = liste[index] as string;
    const e = gleicheMitEiner(antwort, loesung, regeln, optionen);
    const kandidat: Ergebnis = e.urteil === 'falsch' ? { ...e, loesung: liste[0] as string, index: -1 } : { ...e, loesung, index };
    const gleichRang = bestes !== undefined && RANG[kandidat.urteil] === RANG[bestes.urteil];
    // bei „falsch“ zählt der aussagekräftigere Hinweis (z. B. „harakat“), sonst die wenigsten Hinweise
    const besser =
      bestes === undefined ||
      RANG[kandidat.urteil] < RANG[bestes.urteil] ||
      (gleichRang &&
        (kandidat.urteil === 'falsch'
          ? kandidat.hinweise.length > bestes.hinweise.length
          : kandidat.hinweise.length < bestes.hinweise.length));
    if (besser) bestes = kandidat;
  }
  return bestes as Ergebnis;
}

/** Angenommen heißt `richtig` oder `tippfehler`. */
export const angenommen = (e: Pick<Ergebnis, 'urteil'>) => e.urteil !== 'falsch';
