/**
 * Deterministischer Zufall für die Anzeige (Mischen von Optionen, Kacheln, Paaren): gleicher Schlüssel ergibt dieselbe
 * Reihenfolge – stabil über Neuzeichnen, Neuladen und Geräte, prüfbar im Test. Kein `Math.random` im Spieler.
 */

/** 32-Bit-Hash (FNV-1a) eines Textes als Startwert. */
export function saatAus(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Zufallsfolge (mulberry32) in [0, 1). */
export function zufallAus(saat: number): () => number {
  let a = saat >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher-Yates mit festem Startwert. */
export function mische<T>(liste: readonly T[], saat: number | string): T[] {
  const z = zufallAus(typeof saat === 'string' ? saatAus(saat) : saat);
  const a = [...liste];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(z() * (i + 1));
    [a[i], a[j]] = [a[j] as T, a[i] as T];
  }
  return a;
}

/** Gemischte Indizes 0…n−1; bei mehr als einem Element nie die Ausgangsreihenfolge (sonst wäre die Lösung sichtbar). */
export function gemischteIndizes(n: number, saat: number | string): number[] {
  const basis = Array.from({ length: n }, (_, i) => i);
  if (n < 2) return basis;
  const m = mische(basis, saat);
  return m.every((x, i) => x === i) ? [...m.slice(1), m[0] as number] : m;
}
