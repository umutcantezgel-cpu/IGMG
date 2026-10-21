import { normalisiere, REGELN } from '../abgleich/vergleichsform';
import { APOSTROPH_LOCKERUNG, type Sprache, woerter } from '../abgleich/normalisiere';
import { zerlege } from '../abgleich/tokens';
import { laenge, tippAbstand } from '../abgleich/toleranz';

/**
 * Auswertung der Sprechübung (ADR 0042 Nr. 6 mit Fortschreibung S2 Nr. 1–2, Beleg S2 §2 und §4). Rein, ohne
 * Abhängigkeiten zum Browser: läuft im Worker (`whisper.worker.ts`) und in Unit-Tests.
 *
 * - Geprüft werden nur die Wörter des Zielsatzes, nie die Vokalisierung. Die Abschrift wird wie Antworten normalisiert
 *   (PLAN §4.1) und zusätzlich „mild“ (alle Lockerungen der Sprache angewandt, z. B. ß = ss, türkische Sonderbuchstaben,
 *   arabische Tāʾ marbūṭa/Alif maqṣūra am Wortende). „Tolerant“: Wörter ab 4 Zeichen dürfen 1 Zeichen abweichen.
 * - Trefferanteil S = gefundene Zielwörter / Zielwörter (Wortausrichtung in Reihenfolge). Ab der Schwelle der Sprache
 *   „gut verständlich“, darunter „teilweise verstanden“; Kurzsatzregel: bei höchstens 4 Wörtern darf eines fehlen.
 * - Schwellen für whisper-base: de 0,6, tr 0,5; ar ohne automatische Rückmeldung (Selbstvergleich).
 * - Schutz vor Halluzination: Längenkappe `max_new_tokens`, Wiederholungsprüfung (ein 4-Gramm ≥ 4-mal oder mehr als
 *   doppelt so viele Wörter wie das Ziel → „nicht verstanden“), Pegelprüfung vor der Erkennung (`pegel`).
 * - Die freie Abschrift verlässt den Worker nie; die App zeigt nur die Wörter des Zielsatzes mit Markierung.
 */

/** Schwellen je Sprache für whisper-base (Fortschreibung S2 Nr. 2); `null` = keine automatische Rückmeldung. */
export const SCHWELLEN: Readonly<Record<Sprache, number | null>> = { de: 0.6, tr: 0.5, ar: null };

/** Kurzsatzregel: bis zu so vielen Zielwörtern darf eines fehlen. */
export const KURZSATZ = 4;

/** Ergebnis, wie es der Worker meldet (ohne Abschrift). */
export type SprechStatus = 'gut' | 'teilweise' | 'nichtVerstanden';
export type SprechErgebnis = {
  status: SprechStatus;
  /** je Wort des Zielsatzes (Reihenfolge von {@link zielWoerter}): erkannt? */
  treffer: boolean[];
  anteil: number;
};

/** Automatische Rückmeldung in dieser Sprache (mit whisper-base)? */
export const mitErkennung = (sprache: Sprache): boolean => SCHWELLEN[sprache] !== null;

const mild = (wort: string, sprache: Sprache): string =>
  [APOSTROPH_LOCKERUNG, ...REGELN[sprache].lockerungen].reduce((w, l) => l.wende(w), wort);

/** Vergleichsform eines Wortes (normalisiert und mild, ohne Leerraum). */
export const vergleichsWort = (wort: string, sprache: Sprache): string =>
  woerter(normalisiere(wort, sprache))
    .map((w) => mild(w, sprache))
    .join('');

/** Wörter eines Textes in Vergleichsform. */
export const vergleichsWoerter = (text: string, sprache: Sprache): string[] =>
  woerter(normalisiere(text, sprache))
    .map((w) => mild(w, sprache))
    .filter(Boolean);

/** Wörter des Zielsatzes in Anzeigeform (für die Markierung) und Vergleichsform. */
export function zielWoerter(ziel: string, sprache: Sprache): { anzeige: string[]; vergleich: string[] } {
  const anzeige = zerlege(ziel);
  return { anzeige, vergleich: anzeige.map((w) => vergleichsWort(w, sprache)) };
}

/** Trifft ein gehörtes Wort das Zielwort? Gleich, oder bei Zielwörtern ab 4 Zeichen höchstens 1 Zeichen Abstand. */
export function wortTrifft(ziel: string, gehoert: string): boolean {
  if (ziel === gehoert) return true;
  return laenge(ziel) >= 4 && tippAbstand(ziel, gehoert) <= 1;
}

/**
 * Wortausrichtung (längste gemeinsame Folge mit tolerantem Wortvergleich): je Zielwort, ob es in der Abschrift in
 * passender Reihenfolge vorkommt. Getrennt oder zusammen gehörte Wörter (z. B. „kız kardeşim“ ↔ „kızkardeşim“) gelten
 * über die Verbindung benachbarter Wörter als getroffen.
 */
export function richteAus(ziel: readonly string[], gehoert: readonly string[]): boolean[] {
  const n = ziel.length;
  const m = gehoert.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--)
      dp[i]![j] = wortTrifft(ziel[i]!, gehoert[j]!) ? 1 + dp[i + 1]![j + 1]! : Math.max(dp[i + 1]![j]!, dp[i]![j + 1]!);
  const treffer = Array<boolean>(n).fill(false);
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (wortTrifft(ziel[i]!, gehoert[j]!) && dp[i]![j] === 1 + dp[i + 1]![j + 1]!) {
      treffer[i] = true;
      i++;
      j++;
    } else if (dp[i + 1]![j]! >= dp[i]![j + 1]!) i++;
    else j++;
  }
  // Wortgrenzen: zwei Zielwörter als ein gehörtes Wort bzw. ein Zielwort als zwei gehörte Wörter
  const gehoertMenge = new Set(gehoert);
  for (let k = 0; k + 1 < n; k++) {
    if (treffer[k] && treffer[k + 1]) continue;
    if (gehoertMenge.has(ziel[k]! + ziel[k + 1]!)) treffer[k] = treffer[k + 1] = true;
  }
  for (let k = 0; k < n; k++) {
    if (treffer[k]) continue;
    for (let g = 0; g + 1 < m; g++)
      if (wortTrifft(ziel[k]!, gehoert[g]! + gehoert[g + 1]!)) {
        treffer[k] = true;
        break;
      }
  }
  return treffer;
}

/** Anteil gefundener Zielwörter (0…1). */
export const trefferAnteil = (treffer: readonly boolean[]): number =>
  treffer.length ? treffer.filter(Boolean).length / treffer.length : 0;

/** „Gut verständlich“ nach Schwelle und Kurzsatzregel. */
export function gutVerstaendlich(treffer: readonly boolean[], schwelle: number): boolean {
  if (!treffer.length) return false;
  const fehlend = treffer.filter((t) => !t).length;
  if (treffer.length <= KURZSATZ) return fehlend <= 1 && fehlend < treffer.length;
  return trefferAnteil(treffer) >= schwelle;
}

/**
 * Wiederholungsprüfung (Fortschreibung S2 Nr. 2): ein 4-Gramm kommt ≥ 4-mal vor, oder die Abschrift hat mehr als doppelt
 * so viele Wörter wie das Ziel → erfundener Text (Schleife, Videofloskel), „nicht verstanden“.
 */
export function istWiederholung(gehoert: readonly string[], zielAnzahl: number): boolean {
  if (gehoert.length > 2 * Math.max(1, zielAnzahl)) return true;
  const zaehler = new Map<string, number>();
  for (let i = 0; i + 4 <= gehoert.length; i++) {
    const k = gehoert.slice(i, i + 4).join(' ');
    const n = (zaehler.get(k) ?? 0) + 1;
    if (n >= 4) return true;
    zaehler.set(k, n);
  }
  return false;
}

/** Längenkappe: `max_new_tokens = ⌈1,5 × Zieltokens⌉ + 8` (nur die Länge des Ziels, kein Prompt mit der Lösung). */
export const maxNeueTokens = (zielTokens: number): number => Math.ceil(1.5 * Math.max(0, zielTokens)) + 8;

/** Abschrift gegen den Zielsatz auswerten (im Worker; die Abschrift selbst geht nicht hinaus). */
export function werteAus(abschrift: string, ziel: string, sprache: Sprache): SprechErgebnis {
  const { vergleich } = zielWoerter(ziel, sprache);
  const gehoert = vergleichsWoerter(abschrift, sprache);
  const leer = Array<boolean>(vergleich.length).fill(false);
  const schwelle = SCHWELLEN[sprache];
  if (schwelle === null || !gehoert.length || istWiederholung(gehoert, vergleich.length))
    return { status: 'nichtVerstanden', treffer: leer, anteil: 0 };
  const treffer = richteAus(vergleich, gehoert);
  const anteil = trefferAnteil(treffer);
  if (!treffer.some(Boolean)) return { status: 'nichtVerstanden', treffer, anteil };
  return { status: gutVerstaendlich(treffer, schwelle) ? 'gut' : 'teilweise', treffer, anteil };
}

// ——— Pegel (vor der Erkennung, im Hauptprozess) ———

/** Pegelprüfung: Rahmen von 30 ms, Sprache = Rahmen über Rauschboden + 12 dB, mindestens 0,3 s (Fortschreibung S2 Nr. 2). */
export const PEGEL = { rahmenMs: 30, abstandDb: 12, mindestSprecheS: 0.3, bodenQuantil: 0.1, stilleDb: -100 } as const;

/** Höchstdauer einer Aufnahme (Fortschreibung S2 Nr. 2). */
export const MAX_AUFNAHME_MS = 15_000;

export type PegelErgebnis = { ok: boolean; spracheS: number; bodenDb: number; spitzeDb: number };

/** Effektivwert eines Rahmens in dBFS (Stille → −100). */
export function rahmenDb(pcm: Float32Array, von: number, bis: number): number {
  let summe = 0;
  for (let i = von; i < bis; i++) summe += (pcm[i] ?? 0) ** 2;
  const rms = Math.sqrt(summe / Math.max(1, bis - von));
  return rms > 0 ? Math.max(PEGEL.stilleDb, 20 * Math.log10(rms)) : PEGEL.stilleDb;
}

/**
 * Relative Pegelprüfung (keine feste Schwelle – leise menschliche Aufnahmen bleiben gültig): Rauschboden = 10-%-Quantil der
 * Rahmenpegel; Sprache = Rahmen mindestens 12 dB darüber. Ein gleichmäßiges Signal (Rauschen, Brummen, Stille) hat keine
 * Rahmen über dem Boden und gilt nicht als Sprache.
 */
export function pruefePegel(pcm: Float32Array, rate: number): PegelErgebnis {
  const rahmen = Math.max(1, Math.round((rate * PEGEL.rahmenMs) / 1000));
  const pegel: number[] = [];
  for (let i = 0; i + rahmen <= pcm.length; i += rahmen) pegel.push(rahmenDb(pcm, i, i + rahmen));
  if (!pegel.length) return { ok: false, spracheS: 0, bodenDb: PEGEL.stilleDb, spitzeDb: PEGEL.stilleDb };
  const sortiert = [...pegel].sort((a, b) => a - b);
  const bodenDb = sortiert[Math.floor((sortiert.length - 1) * PEGEL.bodenQuantil)] ?? PEGEL.stilleDb;
  const spitzeDb = sortiert.at(-1) ?? PEGEL.stilleDb;
  const sprachRahmen = pegel.filter((p) => p >= bodenDb + PEGEL.abstandDb && p > PEGEL.stilleDb).length;
  const spracheS = (sprachRahmen * rahmen) / rate;
  return { ok: spracheS >= PEGEL.mindestSprecheS, spracheS, bodenDb, spitzeDb };
}
