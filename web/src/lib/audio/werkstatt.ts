/**
 * Reine Hilfen der Rezitations-Werkstatt (ADR 0029, O-Q02): Grenzen verschieben (Ziehen und Tastatur), Zeitraster und
 * Spitzen der Wellenform, Wortzeiten aus dem Mitklopfen und die Prüfung der Zeiten. Browser und Server nutzen dieselben
 * Regeln – der Server prüft jede gespeicherte Zeit erneut. Zeiten in Millisekunden innerhalb der Audiodatei.
 */

/** Schritt der Tastatur (Pfeiltasten) und mit Umschalt (zehnfach). */
export const SCHRITT_MS = 50;
export const SCHRITT_GROSS_MS = 500;
/** Kleinste Verslänge und kleinster Wortabstand – verhindert übereinanderliegende Grenzen. */
export const MIN_VERS_MS = 200;
export const MIN_WORT_MS = 40;
/** Toleranz am Dateiende (Rundung der Dauer im Browser). */
export const DAUER_TOLERANZ_MS = 250;

/** Vers mit Start und Ende: [Vers, Start, Ende]. */
export type VersTripel = [number, number, number];

/**
 * Verschiebt einen Punkt einer aufsteigenden Punktliste auf `zielMs`, begrenzt durch die Nachbarn (mit Mindestabstand)
 * und die Ränder `minMs`/`maxMs`. Ist zwischen den Nachbarn kein Platz, bleibt der Punkt stehen.
 */
export function verschiebeGrenze(
  punkte: readonly number[],
  index: number,
  zielMs: number,
  grenzen: { minMs?: number; maxMs: number; abstandMs?: number },
): number[] {
  if (index < 0 || index >= punkte.length || !Number.isFinite(zielMs)) return [...punkte];
  const abstand = grenzen.abstandMs ?? MIN_VERS_MS;
  const unten = index === 0 ? (grenzen.minMs ?? 0) : punkte[index - 1] + abstand;
  const oben = index === punkte.length - 1 ? grenzen.maxMs : punkte[index + 1] - abstand;
  const neu = [...punkte];
  if (oben < unten) return neu;
  neu[index] = Math.round(Math.min(Math.max(zielMs, unten), oben));
  return neu;
}

/**
 * Versgrenzen als Punktliste: Anfang von Vers 1, die Grenzen zwischen den Versen, Ende des letzten Verses (n + 1 Punkte).
 * Lücken zwischen gespeicherten Versen schließt die Liste (Ende = Anfang des nächsten Verses). Fehlt ein Vers: null.
 */
export function punkteAusVerszeiten(verse: readonly VersTripel[], anzahl: number): number[] | null {
  if (anzahl < 1) return null;
  const je = new Map(verse.map((v) => [v[0], v]));
  const punkte: number[] = [];
  for (let n = 1; n <= anzahl; n++) {
    const v = je.get(n);
    if (!v) return null;
    punkte.push(v[1]);
  }
  punkte.push(je.get(anzahl)![2]);
  for (let i = 1; i < punkte.length; i++) if (punkte[i] <= punkte[i - 1]) return null;
  return punkte;
}

export function verszeitenAusPunkten(punkte: readonly number[]): VersTripel[] {
  return punkte.slice(0, -1).map((start, i) => [i + 1, Math.round(start), Math.round(punkte[i + 1])]);
}

/** Wortzeiten eines Verses aus den Wortanfängen: Ende = Anfang des nächsten Wortes, das letzte Wort endet mit dem Vers. */
export function wortzeitenAusAnfaengen(anfaenge: readonly number[], versEndeMs: number): [number, number][] {
  return anfaenge.map((a, i) => [Math.round(a), Math.round(i + 1 < anfaenge.length ? anfaenge[i + 1] : versEndeMs)]);
}

export type VerszeitenFehler = 'anzahl' | 'reihenfolge' | 'dauer';

/** Verszeiten einer Sure-Datei: genau die Verse 1…n, je Start < Ende, aufsteigend ohne Überlappung, innerhalb der Datei. */
export function pruefeVerszeiten(verse: readonly VersTripel[], anzahl: number, dauerMs: number | null): VerszeitenFehler | null {
  if (verse.length !== anzahl || anzahl < 1) return 'anzahl';
  const sortiert = [...verse].sort((a, b) => a[0] - b[0]);
  for (let i = 0; i < sortiert.length; i++) {
    const [nr, start, ende] = sortiert[i];
    if (nr !== i + 1) return 'anzahl';
    if (![start, ende].every((z) => Number.isInteger(z)) || start < 0 || ende - start < MIN_VERS_MS) return 'reihenfolge';
    if (i > 0 && start < sortiert[i - 1][2]) return 'reihenfolge';
  }
  if (dauerMs !== null && sortiert[sortiert.length - 1][2] > dauerMs + DAUER_TOLERANZ_MS) return 'dauer';
  return null;
}

export type WortzeitenFehler = 'anzahl' | 'reihenfolge' | 'fenster';

/** Wortanfänge eines Verses: genau ein Anfang je Wort, streng steigend mit Mindestabstand, alle im Versfenster. */
export function pruefeWortanfaenge(
  anfaenge: readonly number[],
  anzahl: number,
  fenster: { startMs: number; endeMs: number },
): WortzeitenFehler | null {
  if (anfaenge.length !== anzahl || anzahl < 1) return 'anzahl';
  for (let i = 0; i < anfaenge.length; i++) {
    const a = anfaenge[i];
    if (!Number.isInteger(a)) return 'reihenfolge';
    if (a < fenster.startMs || a >= fenster.endeMs) return 'fenster';
    if (i > 0 && a - anfaenge[i - 1] < MIN_WORT_MS) return 'reihenfolge';
  }
  if (fenster.endeMs - anfaenge[anfaenge.length - 1] < MIN_WORT_MS) return 'fenster';
  return null;
}

/** Schrittweiten des Zeitrasters (ms): von 50 ms bis 5 min. */
const STUFEN_MS = [50, 100, 250, 500, 1000, 2000, 5000, 10_000, 15_000, 30_000, 60_000, 120_000, 300_000];

/**
 * Zeitraster der Wellenform: kleinste Schrittweite, bei der zwei Striche mindestens `minAbstandPx` auseinanderliegen,
 * und die Striche (Vielfache der Schrittweite) im sichtbaren Ausschnitt.
 */
export function zeitRaster(vonMs: number, bisMs: number, breitePx: number, minAbstandPx = 88): { schrittMs: number; striche: number[] } {
  const spanne = Math.max(1, bisMs - vonMs);
  const schrittMs = STUFEN_MS.find((s) => (s / spanne) * breitePx >= minAbstandPx) ?? STUFEN_MS[STUFEN_MS.length - 1];
  const striche: number[] = [];
  for (let t = Math.ceil(vonMs / schrittMs) * schrittMs; t <= bisMs; t += schrittMs) striche.push(t);
  return { schrittMs, striche };
}

/** Zeit für Menschen: „m:ss,cc“ (Hundertstel; mit `stellen` = 1 Zehntel, 0 ohne). Deutsches Komma, nie negativ. */
export function formatZeit(ms: number, stellen: 0 | 1 | 2 = 2): string {
  const teiler = stellen === 2 ? 10 : stellen === 1 ? 100 : 1000;
  const ganz = Math.max(0, Math.round(ms / teiler));
  const proSekunde = 1000 / teiler;
  const sekunden = Math.floor(ganz / proSekunde);
  const rest = ganz % proSekunde;
  const text = `${Math.floor(sekunden / 60)}:${String(sekunden % 60).padStart(2, '0')}`;
  return stellen === 0 ? text : `${text},${String(rest).padStart(stellen, '0')}`;
}

/** Zeit für Hilfstechnik: „12,35 Sekunden“ bzw. „1 Minute 2,5 Sekunden“ (aria-valuetext). */
export function zeitVorlesen(ms: number): string {
  const s = Math.max(0, Math.round(ms / 10) / 100);
  const minuten = Math.floor(s / 60);
  const sekunden = (s - minuten * 60).toFixed(2).replace(/\.?0+$/, '').replace('.', ',');
  const teil = `${sekunden} Sekunden`;
  return minuten ? `${minuten} ${minuten === 1 ? 'Minute' : 'Minuten'} ${teil}` : teil;
}

/** Spitzen (Minimum/Maximum je Fenster) eines Mono-Signals für die Zeichnung der Wellenform. */
export type Spitzen = { min: Float32Array; max: Float32Array; fensterMs: number };

export function spitzen(samples: Float32Array, abtastrate: number, fensterMs = 5): Spitzen {
  const groesse = Math.max(1, Math.round((abtastrate * fensterMs) / 1000));
  const anzahl = Math.ceil(samples.length / groesse);
  const min = new Float32Array(anzahl);
  const max = new Float32Array(anzahl);
  for (let f = 0; f < anzahl; f++) {
    let lo = 0;
    let hi = 0;
    const ende = Math.min(samples.length, (f + 1) * groesse);
    for (let i = f * groesse; i < ende; i++) {
      const s = samples[i];
      if (s < lo) lo = s;
      if (s > hi) hi = s;
    }
    min[f] = lo;
    max[f] = hi;
  }
  return { min, max, fensterMs: (groesse * 1000) / abtastrate };
}

/** Spitzen für `anzahl` Spalten im Ausschnitt [vonMs, bisMs): je Spalte Minimum und Maximum der überdeckten Fenster. */
export function spalten(sp: Spitzen, vonMs: number, bisMs: number, anzahl: number): { min: Float32Array; max: Float32Array } {
  const min = new Float32Array(anzahl);
  const max = new Float32Array(anzahl);
  const breite = (bisMs - vonMs) / Math.max(1, anzahl);
  for (let s = 0; s < anzahl; s++) {
    const a = Math.floor((vonMs + s * breite) / sp.fensterMs);
    const b = Math.max(a + 1, Math.ceil((vonMs + (s + 1) * breite) / sp.fensterMs));
    let lo = 0;
    let hi = 0;
    for (let f = Math.max(0, a); f < Math.min(sp.min.length, b); f++) {
      if (sp.min[f] < lo) lo = sp.min[f];
      if (sp.max[f] > hi) hi = sp.max[f];
    }
    min[s] = lo;
    max[s] = hi;
  }
  return { min, max };
}

/** Mono aus allen Kanälen (Mittelwert) – für Lautstärke, Einsätze und Spitzen. */
export function mono(kanaele: readonly Float32Array[]): Float32Array {
  if (kanaele.length === 1) return kanaele[0];
  const laenge = Math.min(...kanaele.map((k) => k.length));
  const m = new Float32Array(laenge);
  for (const k of kanaele) for (let i = 0; i < laenge; i++) m[i] += k[i] / kanaele.length;
  return m;
}
