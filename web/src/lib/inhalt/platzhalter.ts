/**
 * Platzhalter der Gemeinde (G-05): Fakten, die nur die Gemeinde liefern kann (Adresse, Telefonnummer, Namen, Termine,
 * Bankverbindung), stehen bis zur Lieferung als „[…]“ in den Inhalten – in der Verwaltung bleiben sie so sichtbar und
 * zeigen, was noch fehlt. Auf den öffentlichen Seiten erscheinen sie nicht (Vorstellung 23.11.2026, Auftrag des Nutzers:
 * „ohne Platzhalter“): Eine Angabe, die nur aus einem Platzhalter besteht, entfällt samt ihrer Zeile ({@link angabe});
 * in Fließtext entfällt jeder Satz, der einen Platzhalter enthält ({@link ohnePlatzhalter}). Nichts wird erfunden.
 *
 * Nur dort anwenden, wo eckige Klammern Platzhalter sind: In Übersetzungen (Koran, Hadith) stehen sie für Einschübe, in
 * Lizenztexten für Muster – dort bleiben sie. Die Rechtstexte (Impressum, Datenschutz, Barrierefreiheit) zeigen ihre
 * Platzhalter weiterhin gekennzeichnet (`MitPlatzhaltern`): Dort darf nichts stillschweigend fehlen.
 *
 * Reine Funktionen ohne React und ohne Datenbank (`tests/unit/platzhalter-oeffentlich.test.ts`).
 */

const PLATZHALTER = /\[[^\]]*\]/;
const PLATZHALTER_ALLE = /\[[^\]]*\]/g;
/** Ersatzzeichen für einen Platzhalter beim Zerlegen in Sätze (Platzhalter können selbst Punkte enthalten). */
const MARKE = '\u0000';

/** Enthält der Text einen Platzhalter „[…]“? */
export function hatPlatzhalter(text: string | null | undefined): boolean {
  return Boolean(text) && PLATZHALTER.test(text as string);
}

/** True, wenn der Text nur aus einem Platzhalter besteht, z. B. „[Datum]“. */
export function istNurPlatzhalter(text: string): boolean {
  return /^\s*\[[^\]]*\]\s*$/.test(text);
}

/**
 * Eine einzelne Angabe (Adresse, Telefonnummer, Name, Datum …) für die öffentliche Seite: der Text, oder `null`, wenn sie
 * fehlt, leer ist oder einen Platzhalter enthält – dann zeigt die Seite die Zeile nicht.
 */
export function angabe(text: string | null | undefined): string | null {
  const t = text?.trim();
  if (!t || PLATZHALTER.test(t)) return null;
  return t;
}

/**
 * Abkürzungen, nach deren Punkt kein Satz endet (de, tr, en) – sonst risse „z. B. unter [Telefonnummer]“ mitten im Satz.
 * Kleinschreibung; einzelne Buchstaben gelten immer als Abkürzung.
 */
const ABKUERZUNGEN = new Set([
  'nr',
  'ca',
  'bzw',
  'ggf',
  'inkl',
  'evtl',
  'vgl',
  'std',
  'min',
  'tel',
  'str',
  'st',
  'dr',
  'prof',
  'hz',
  'no',
  'vb',
  'vs',
  'mr',
  'mrs',
  'approx',
]);

/** Endet an dieser Stelle (Index des Satzzeichens) ein Satz? */
function satzende(text: string, i: number): boolean {
  const danach = text.slice(i + 1);
  // Satzzeichen-Folgen („…“, „?!“) zusammen behandeln: Ende erst beim letzten Zeichen der Folge
  if (/^[.!?…]/.test(danach)) return false;
  if (danach.length === 0) return true;
  // Zeilenumbruch beendet den Satz immer; sonst: Leerraum, dann ein Großbuchstabe, eine Ziffer, ein Anführungszeichen
  // oder ein Platzhalter
  if (/^\s*\n/.test(danach)) return true;
  if (!/^\s+[\p{Lu}\d„“"«‚'(\u0000]/u.test(danach)) return false;
  if (text[i] !== '.') return true;
  const davor = text.slice(0, i);
  // Ordnungszahl oder Datum („3. Oktober“, „1. Vorsitzender“): ein- bis zweistellige Zahl vor dem Punkt
  if (/(?:^|\D)\d{1,2}$/.test(davor)) return false;
  const wort = /([\p{L}]+)$/u.exec(davor)?.[1] ?? '';
  return !(wort.length === 1 || ABKUERZUNGEN.has(wort.toLowerCase()));
}

/** Zerlegt in Sätze samt nachfolgendem Leerraum; zusammengesetzt ergeben sie wieder den Text. */
function saetze(text: string): string[] {
  const teile: string[] = [];
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    const z = text[i];
    const umbruch = z === '\n';
    if (!umbruch && !'.!?…'.includes(z)) continue;
    if (!umbruch && !satzende(text, i)) continue;
    let ende = i + 1;
    while (ende < text.length && /\s/.test(text[ende])) ende++;
    teile.push(text.slice(start, ende));
    start = ende;
    i = ende - 1;
  }
  if (start < text.length) teile.push(text.slice(start));
  return teile;
}

/**
 * Fließtext für die öffentliche Seite: Jeder Satz mit einem Platzhalter „[…]“ entfällt, der Rest bleibt wörtlich. Text
 * ohne Platzhalter kommt unverändert zurück; bleibt nichts übrig, ist das Ergebnis leer (die Seite zeigt den Absatz dann
 * nicht).
 */
export function ohnePlatzhalter(text: string | null | undefined): string {
  if (!text) return '';
  if (!PLATZHALTER.test(text)) return text;
  const maskiert = text.replace(PLATZHALTER_ALLE, MARKE);
  return saetze(maskiert)
    .filter((s) => !s.includes(MARKE))
    .join('')
    .trim();
}
