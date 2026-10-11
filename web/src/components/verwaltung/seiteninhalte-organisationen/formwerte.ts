/**
 * Formwerte der Seiteninhalte: Zeichenketten im Formular, Schema-Form beim Speichern. Leere Übersetzungen
 * und Angaben entfallen (Rückfall auf Deutsch, ADR 0002). Reine Funktionen, ohne Oberfläche.
 */
export type MehrText = { de: string; tr: string; en: string };

export function leerMehr(): MehrText {
  return { de: '', tr: '', en: '' };
}

export function ausMehr(m: { de: string; tr?: string; en?: string } | null | undefined): MehrText {
  return { de: m?.de ?? '', tr: m?.tr ?? '', en: m?.en ?? '' };
}

export function zuMehr(m: MehrText): { de: string; tr?: string; en?: string } {
  const tr = m.tr.trim();
  const en = m.en.trim();
  return { de: m.de.trim(), ...(tr ? { tr } : {}), ...(en ? { en } : {}) };
}

/** Leeres Feld → undefined (das Feld fehlt im JSON), sonst der getrimmte Text. */
export function optionalText(wert: string): string | undefined {
  const t = wert.trim();
  return t === '' ? undefined : t;
}

/**
 * Zahl aus einem Textfeld: leer → undefined (fehlt), Dezimalkomma erlaubt. Unlesbares bleibt Text und
 * ergibt im Schema den Fehler „zahl“ (Koordinaten nur als Zahlen).
 */
export function zahlZuJson(wert: string): number | string | undefined {
  const t = wert.trim();
  if (t === '') return undefined;
  const zahl = Number(t.replace(',', '.'));
  return Number.isFinite(zahl) ? zahl : t;
}

/** Enthält ein Textwert noch einen Platzhalter in eckigen Klammern (G-05)? Listen und Objekte werden durchsucht. */
export function hatPlatzhalter(wert: unknown): boolean {
  if (typeof wert === 'string') return /\[[^\]]+\]/.test(wert);
  if (Array.isArray(wert)) return wert.some((w) => hatPlatzhalter(w));
  if (wert && typeof wert === 'object') return Object.values(wert).some((w) => hatPlatzhalter(w));
  return false;
}

/** Kennung eines Feldes für Sprungverweise und die Zuordnung der Fehler. */
export function feldId(pfad: string): string {
  return `feld-${pfad.replaceAll('.', '-')}`;
}
