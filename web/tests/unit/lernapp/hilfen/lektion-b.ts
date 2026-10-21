import type { Aufgabe, Lektion } from '@/lib/lernapp/aufgaben/schema';

/**
 * Beispielaufgaben der Übungstypen aus L2-02 (Deutsch für Türkischsprachige): neutrale Alltagssätze, je Typ eine Aufgabe.
 * Keine echten Kursdaten, kein Religionsbezug; Arabisch kommt in diesen Daten nicht vor (Buchstaben über Schlüssel).
 */
const de = (text: string) => ({ text, sprache: 'de' as const });
const tr = (text: string) => ({ text, sprache: 'tr' as const });

export const DIALOG = {
  typ: 'dialog',
  schluessel: 'de.a1.e02.a001',
  karten: ['de-aus-tr:de.a1.e02.s0001'],
  verlauf: [
    { sprecher: 'a', zeile: de('Guten Morgen!'), uebersetzung: tr('Günaydın!') },
    { sprecher: 'b', zeile: de('Guten Morgen! Wie geht es dir?') },
  ],
  optionen: [de('Danke, gut.'), de('Das Haus ist groß.'), de('Ich trinke Wasser.')],
  richtig: 0,
} as const satisfies Aufgabe;

export const GESCHICHTE = {
  typ: 'geschichte',
  schluessel: 'de.a1.e02.a002',
  karten: ['de-aus-tr:de.a1.e02.s0002'],
  titel: de('Am Morgen'),
  zeilen: [
    { zeile: de('Das Kind steht früh auf.') },
    { sprecher: 'a', zeile: de('Ich trinke Wasser.') },
    { zeile: de('Dann liest es ein Buch.') },
  ],
  fragen: [
    { nach: 1, frage: de('Was trinkt das Kind?'), optionen: [de('Wasser'), de('Brot')], richtig: 0, karte: 'de-aus-tr:de.a1.e01.w001' },
    { nach: 2, frage: de('Was liest es?'), optionen: [de('ein Haus'), de('ein Buch')], richtig: 1 },
  ],
} as const satisfies Aufgabe;

export const LESEN = {
  typ: 'lesen_fragen',
  schluessel: 'de.b1.e01.a001',
  text: [de('Das Haus ist groß. Im Garten steht ein Tisch.'), de('Am Abend trinken alle Tee.')],
  glossen: [
    { wort: 'Haus', glosse: tr('ev') },
    { wort: 'Garten', glosse: tr('bahçe') },
  ],
  fragen: [
    { art: 'auswahl', frage: de('Was steht im Garten?'), optionen: [de('ein Tisch'), de('ein Bett'), de('ein Auto')], richtig: 0 },
    { art: 'rfn', aussage: de('Das Haus ist klein.'), richtig: 'falsch' },
    { art: 'rfn', aussage: de('Alle trinken Kaffee.'), richtig: 'nicht_im_text' },
  ],
} as const satisfies Aufgabe;

export const TIPP = {
  typ: 'grammatik_tipp',
  schluessel: 'de.a1.e02.a003',
  sprache: 'tr',
  titel: 'Almancada isimler büyük harfle yazılır',
  abschnitte: [
    {
      ueberschrift: 'Kural',
      absaetze: ['Almancada her isim büyük harfle başlar.'],
      beispiele: [{ ziel: de('das Haus'), uebersetzung: tr('ev') }],
    },
  ],
} as const satisfies Aufgabe;

export const SCHRIFT_AR = {
  typ: 'schrift_ar',
  schluessel: 'ar.v.e01.a001',
  art: 'erkennen',
  ziel: 'be',
  ablenker: ['te', 'se'],
} as const satisfies Aufgabe;

export const SCHRIFT_TR = {
  typ: 'schrift_tr',
  schluessel: 'tr.v.e01.a001',
  anweisung: 'grossKlein',
  vorgabe: tr('ş'),
  optionen: [tr('Ş'), tr('S'), tr('Ç')],
  richtig: 0,
} as const satisfies Aufgabe;

export const SCHRIFT_LATEIN = {
  typ: 'schrift_latein',
  schluessel: 'de.v.e01.a001',
  anweisung: 'waehleBuchstabe',
  vorgabe: de('H_us'),
  optionen: [de('a'), de('ä'), de('o')],
  richtig: 0,
} as const satisfies Aufgabe;

export const SPRECHEN = {
  typ: 'sprechen',
  schluessel: 'de.a1.e02.a004',
  karten: ['de-aus-tr:de.a1.e01.s0001'],
  vorgabe: de('Ich trinke Wasser.'),
  uebersetzung: tr('Su içiyorum.'),
} as const satisfies Aufgabe;

export const SCHREIBEN = {
  typ: 'schreiben',
  schluessel: 'de.b1.e01.a002',
  karten: ['de-aus-tr:de.b1.e01.s0001'],
  aufgabe: de('Schreibe über deinen Morgen.'),
  woerter: { min: 5, max: 40 },
  pflichtwoerter: ['Wasser', 'Buch'],
  muster: [de('Am Morgen trinke ich Wasser. Dann lese ich ein Buch.')],
} as const satisfies Aufgabe;

export const LEKTION_B: Lektion = {
  schluessel: 'de-aus-tr.a1.e02.l01',
  kurs: 'de-aus-tr',
  art: 'lektion',
  zielsprache: 'de',
  ausgangssprache: 'tr',
  aufgaben: [DIALOG, GESCHICHTE, LESEN, TIPP, SCHRIFT_AR, SCHRIFT_TR, SCHRIFT_LATEIN, SPRECHEN, SCHREIBEN] as unknown as Aufgabe[],
};
