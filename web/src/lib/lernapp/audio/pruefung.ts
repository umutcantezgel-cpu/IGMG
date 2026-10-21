import { zielWoerter, richteAus, trefferAnteil, vergleichsWoerter } from '../sprechen/auswertung';
import type { Sprache } from '../kurse';

/**
 * Prüfkette der Sprachausgabe (PLAN §6.8 Nr. 6, Beleg S3 §5 „Schwelle“, ADR 0039 Nr. 6.5). Rein, ohne Node: misst an den
 * dekodierten Clips (Mono, Float32) – unabhängig von der Messung beim Erzeugen (`_lernapp/werkzeuge/tts/nachbearbeitung.py`).
 *
 * (a) **Alle Clips physisch:** Netto-Dauer ≥ 0,25 s; Silbenrate 2–8 Silben/s bei Texten ab 3 Silben; Rand-Stille vorn und
 *     hinten ≤ 0,3 s; kein Clipping; Lautheit −23 ± 1 LUFS (ITU-R BS.1770-4). Fehler → einmal neu erzeugen, beim zweiten
 *     Mal hören bzw. aufnehmen.
 * (b) **Sätze ab 4 Wörtern (nur de):** Rückerkennung mit whisper-base, Trefferanteil (mild, wie die Sprechübung) ≥ 0,75 in
 *     Ordnung; 0,6–0,75 einmal neu erzeugen, dann hören; < 0,6 hören bzw. aufnehmen.
 * (c) **Lemma-Clips:** keine Rückerkennung (isolierte Wörter erkennt whisper-base unzuverlässig, S3 §3.5).
 * tr/ar: Schwellen erst mit eigener Stimme (S3 §5 d) – bis dahin nur (a).
 */

export const GRENZEN = {
  nettoMinS: 0.25,
  silbenMin: 2,
  silbenMax: 8,
  /** Silbenrate erst ab so vielen Silben */
  silbenAb: 3,
  randMaxS: 0.3,
  lufsZiel: -23,
  lufsToleranz: 1,
  /** |x| ab hier gilt als Clipping (dekodiertes Opus) */
  clipping: 0.999,
  /** Stille: Rahmen-RMS mehr als so viele dB unter dem lautesten Rahmen */
  stilleDb: 40,
  rueckerkennungAb: 4,
  trefferGut: 0.75,
  trefferNeu: 0.6,
} as const;

/** Sprachen mit Rückerkennung (Schwellen aus S3 nur für de). */
export const MIT_RUECKERKENNUNG: readonly Sprache[] = ['de'];

export type Biquad = { b: [number, number, number]; a: [number, number, number] };

/** K-Bewertung (BS.1770-4) für beliebige Raten, Herleitung wie libebur128: Hochregal, dann Hochpass. */
export function kFilter(rate: number): [Biquad, Biquad] {
  let f0 = 1681.974450955533;
  const g = 3.999843853973347;
  let q = 0.7071752369554196;
  let k = Math.tan((Math.PI * f0) / rate);
  const vh = 10 ** (g / 20);
  const vb = vh ** 0.4996667741545416;
  let a0 = 1 + k / q + k * k;
  const regal: Biquad = {
    b: [(vh + (vb * k) / q + k * k) / a0, (2 * (k * k - vh)) / a0, (vh - (vb * k) / q + k * k) / a0],
    a: [1, (2 * (k * k - 1)) / a0, (1 - k / q + k * k) / a0],
  };
  f0 = 38.13547087602444;
  q = 0.5003270373238773;
  k = Math.tan((Math.PI * f0) / rate);
  a0 = 1 + k / q + k * k;
  const pass: Biquad = { b: [1, -2, 1], a: [1, (2 * (k * k - 1)) / a0, (1 - k / q + k * k) / a0] };
  return [regal, pass];
}

function filtere(x: Float64Array, { b, a }: Biquad): Float64Array<ArrayBuffer> {
  const y = new Float64Array(x.length);
  let z1 = 0;
  let z2 = 0;
  for (let i = 0; i < x.length; i++) {
    const v = x[i]!;
    const o = b[0] * v + z1;
    z1 = b[1] * v - a[1] * o + z2;
    z2 = b[2] * v - a[2] * o;
    y[i] = o;
  }
  return y;
}

/**
 * Integrierte Lautheit (LUFS, ein Kanal): 400-ms-Blöcke mit 75 % Überlappung, absolutes Gate −70 LUFS, relatives Gate
 * −10 LU. Kürzer als 0,5 s: mit Stille auf 0,5 s aufgefüllt (wie beim Erzeugen). −Infinity bei Stille.
 */
export function lautheit(signal: Float32Array, rate: number): number {
  const n = Math.max(signal.length, Math.round(0.5 * rate));
  let x: Float64Array<ArrayBuffer> = new Float64Array(n);
  x.set(signal);
  for (const f of kFilter(rate)) x = filtere(x, f);
  const summe = new Float64Array(n + 1);
  for (let i = 0; i < n; i++) summe[i + 1] = summe[i]! + x[i]! * x[i]!;
  const block = Math.round(0.4 * rate);
  const schritt = Math.round(0.1 * rate);
  const z: number[] = [];
  for (let s = 0; s + block <= n; s += schritt) {
    const m = (summe[s + block]! - summe[s]!) / block;
    if (m > 0 && -0.691 + 10 * Math.log10(m) > -70) z.push(m);
  }
  if (!z.length) return -Infinity;
  const mittel = (w: number[]) => w.reduce((s, v) => s + v, 0) / w.length;
  const grenze = -0.691 + 10 * Math.log10(mittel(z)) - 10;
  const rest = z.filter((m) => -0.691 + 10 * Math.log10(m) > grenze);
  return -0.691 + 10 * Math.log10(mittel(rest));
}

/** Erster und letzter Abtastwert außerhalb der Stille (Rahmen ≈ 93 ms, Schritt ≈ 23 ms, wie librosa.effects.trim). */
export function nichtStill(signal: Float32Array, rate: number, stilleDb: number = GRENZEN.stilleDb): { start: number; ende: number } {
  const rahmen = Math.max(2, Math.round(0.0929 * rate));
  const schritt = Math.max(1, Math.round(0.0232 * rate));
  const halb = Math.floor(rahmen / 2);
  const anzahl = 1 + Math.floor(signal.length / schritt);
  const mse = new Float64Array(anzahl);
  let max = 0;
  for (let i = 0; i < anzahl; i++) {
    let s = 0;
    for (let j = i * schritt - halb; j < i * schritt - halb + rahmen; j++) if (j >= 0 && j < signal.length) s += signal[j]! * signal[j]!;
    mse[i] = s / rahmen;
    if (mse[i]! > max) max = mse[i]!;
  }
  if (max <= 0) return { start: 0, ende: 0 };
  const schwelle = max * 10 ** (-stilleDb / 10);
  let erst = -1;
  let letzt = -1;
  for (let i = 0; i < anzahl; i++)
    if (mse[i]! > schwelle) {
      if (erst < 0) erst = i;
      letzt = i;
    }
  return { start: erst * schritt, ende: Math.min(signal.length, (letzt + 1) * schritt) };
}

/** Silben eines Texts (Vokalgruppen; de mit ä/ö/ü/y, tr mit ı/ö/ü); `null` bei Ziffern oder ohne Regel (ar). */
export function silben(text: string, sprache: Sprache): number | null {
  if (/\d/.test(text)) return null;
  const klein = text.normalize('NFC').toLocaleLowerCase(sprache === 'tr' ? 'tr' : 'de');
  if (sprache === 'de') return (klein.match(/[aeiouyäöü]+/g) ?? []).length;
  if (sprache === 'tr') return (klein.match(/[aeıioöuüâîû]/g) ?? []).length;
  return null;
}

export type Messwerte = {
  dauerS: number;
  nettoS: number;
  randVornS: number;
  randHintenS: number;
  lufs: number | null;
  spitze: number;
  clipping: number;
  silben: number | null;
  silbenProS: number | null;
};

/** Physische Messung eines dekodierten Clips. */
export function miss(signal: Float32Array, rate: number, text: string, sprache: Sprache): Messwerte {
  const { start, ende } = nichtStill(signal, rate);
  const nettoS = Math.max(0, ende - start) / rate;
  let spitze = 0;
  let clipping = 0;
  for (const v of signal) {
    const b = Math.abs(v);
    if (b > spitze) spitze = b;
    if (b >= GRENZEN.clipping) clipping++;
  }
  const l = lautheit(signal, rate);
  const s = silben(text, sprache);
  const runde = (v: number, st = 3) => Math.round(v * 10 ** st) / 10 ** st;
  return {
    dauerS: runde(signal.length / rate),
    nettoS: runde(nettoS),
    randVornS: runde(start / rate),
    randHintenS: runde(Math.max(0, signal.length - ende) / rate),
    lufs: Number.isFinite(l) ? runde(l, 2) : null,
    spitze: runde(spitze, 4),
    clipping,
    silben: s,
    silbenProS: s !== null && nettoS > 0 ? runde(s / nettoS, 2) : null,
  };
}

/** Gründe, aus denen die physische Prüfung scheitert (leer: bestanden). */
export function physischeFehler(m: Messwerte): string[] {
  const f: string[] = [];
  if (m.nettoS < GRENZEN.nettoMinS) f.push('netto_kurz');
  if (m.silben !== null && m.silben >= GRENZEN.silbenAb && m.silbenProS !== null)
    if (m.silbenProS < GRENZEN.silbenMin || m.silbenProS > GRENZEN.silbenMax) f.push('silbenrate');
  if (m.randVornS > GRENZEN.randMaxS) f.push('rand_vorn');
  if (m.randHintenS > GRENZEN.randMaxS) f.push('rand_hinten');
  if (m.clipping > 0) f.push('clipping');
  if (m.lufs === null || Math.abs(m.lufs - GRENZEN.lufsZiel) > GRENZEN.lufsToleranz) f.push('lautheit');
  return f;
}

/** Wird der Clip zurückerkannt? Nur Sätze ab 4 Wörtern in Sprachen mit Schwellen. */
export const mitRueckerkennung = (e: { sprache: Sprache; art: 'lemma' | 'satz'; woerter: number }): boolean =>
  MIT_RUECKERKENNUNG.includes(e.sprache) && e.art === 'satz' && e.woerter >= GRENZEN.rueckerkennungAb;

/** Trefferanteil einer Abschrift gegen den Text (mild normalisiert, Wortausrichtung wie in der Sprechübung). */
export function treffer(abschrift: string, text: string, sprache: Sprache): number {
  const ziel = zielWoerter(text, sprache).vergleich;
  return trefferAnteil(richteAus(ziel, vergleichsWoerter(abschrift, sprache)));
}

export type Urteil = 'ok' | 'neu_erzeugen' | 'hoeren';

/**
 * Urteil je Clip. `versuch`: wie oft der Text schon erzeugt wurde (1 = erster Versuch). Physische Fehler und ein
 * Trefferanteil von 0,6–0,75 führen beim ersten Versuch zur Neuerzeugung, danach zum Hören; unter 0,6 immer zum Hören.
 */
export function urteile(o: { physisch: readonly string[]; treffer: number | null; versuch: number }): {
  urteil: Urteil;
  gruende: string[];
} {
  const gruende = [...o.physisch];
  let urteil: Urteil = 'ok';
  const eskaliere = (u: Urteil) => {
    if (u === 'hoeren' || urteil === 'ok') urteil = u;
  };
  if (gruende.length) eskaliere(o.versuch <= 1 ? 'neu_erzeugen' : 'hoeren');
  if (o.treffer !== null) {
    if (o.treffer < GRENZEN.trefferNeu) {
      gruende.push('rueckerkennung_schwach');
      eskaliere('hoeren');
    } else if (o.treffer < GRENZEN.trefferGut) {
      gruende.push('rueckerkennung_mittel');
      eskaliere(o.versuch <= 1 ? 'neu_erzeugen' : 'hoeren');
    }
  }
  return { urteil, gruende };
}
