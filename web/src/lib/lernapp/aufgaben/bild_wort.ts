import { gemischteIndizes } from '../engine/zufall';
import * as z from '../z';
import { ab, type Auswertung, basis, InhaltSchema, liste, mitOptionen, nachIndex, Optionen } from './grundlagen';

/**
 * Übungstyp `bild_wort` (PLAN §4, KERN 4.0 §5/§7, Inhaltsleitfaden §5): Eine Bildkarte zeigt ein Symbol; gewählt wird das
 * passende Wort der Zielsprache. Bewertung nach Index.
 *
 * **Stil der Bildkarten (Entscheidung L2):** Linien-Symbole im 24-px-Raster wie die Oberfläche – Lucide (ISC) oder eigene
 * Pfade im selben Raster, ohne Füllung, runde Enden. Nur Gegenstände und Symbole, keine Menschen, Tiere, Gesichter oder
 * religiösen Zeichen; die Motive stehen mit Quelle, Lizenz und Freigabe in `web/inhalte/lernapp/symbole/symbole.json`
 * (Motivliste: Redaktion, LM-34). Der Paketbau legt die Geometrie ins Einheitenpaket – offline lesbar, ohne weitere Anfrage
 * und ohne HTML: nur die Grundformen unten mit Zahlen bzw. geprüften Pfaddaten, gezeichnet über React.
 *
 * **Zugänglichkeit:** Vor der Antwort trägt das Bild nur den Hinweis „Bildübung“ (WCAG 1.1.1, Ausnahme „Test“); die
 * Beschreibung (Übersetzung des Worts) erscheint erst nach der Antwort.
 */

const Zahl = z.number().check(z.minimum(-48), z.maximum(48));
/** Pfaddaten: nur Befehlsbuchstaben, Zahlen, Trenner. */
const PFAD = /^[MmLlHhVvCcSsQqTtAaZz0-9.,\s-]{1,2000}$/;
const PUNKTE = /^[0-9.,\s-]{1,1000}$/;

export const SymbolElementSchema = z.discriminatedUnion('art', [
  z.strictObject({ art: z.literal('path'), d: z.string().check(z.regex(PFAD)) }),
  z.strictObject({ art: z.literal('circle'), cx: Zahl, cy: Zahl, r: Zahl }),
  z.strictObject({ art: z.literal('ellipse'), cx: Zahl, cy: Zahl, rx: Zahl, ry: Zahl }),
  z.strictObject({
    art: z.literal('rect'),
    x: Zahl,
    y: Zahl,
    width: Zahl,
    height: Zahl,
    rx: z.optional(Zahl),
    ry: z.optional(Zahl),
  }),
  z.strictObject({ art: z.literal('line'), x1: Zahl, y1: Zahl, x2: Zahl, y2: Zahl }),
  z.strictObject({ art: z.literal('polyline'), points: z.string().check(z.regex(PUNKTE)) }),
  z.strictObject({ art: z.literal('polygon'), points: z.string().check(z.regex(PUNKTE)) }),
]);
export type SymbolElement = z.infer<typeof SymbolElementSchema>;

/** Bildkarte: Name des Motivs und seine Geometrie im 24er Raster. */
export const BildSchema = z.strictObject({
  symbol: z.string().check(z.regex(/^[a-z0-9-]{1,60}$/)),
  elemente: liste(SymbolElementSchema, 1, 40),
});
export type Bild = z.infer<typeof BildSchema>;

export const BildWortSchema = z
  .strictObject({
    ...basis,
    typ: z.literal('bild_wort'),
    anweisung: z.enum(['waehleWort']),
    bild: BildSchema,
    /** Wörter der Zielsprache */
    optionen: Optionen,
    richtig: ab(0),
    /** Beschreibung des Bilds (Übersetzung), sichtbar erst nach der Antwort */
    beschreibung: z.optional(InhaltSchema),
  })
  .check(z.superRefine(mitOptionen));

export type BildWortAufgabe = z.infer<typeof BildWortSchema>;
export type BildWortAntwort = { typ: 'bild_wort'; wahl: number };

/** Anzeigereihenfolge der Optionen (deterministisch, nie die Inhaltsreihenfolge). */
export const bildWortReihenfolge = (a: Pick<BildWortAufgabe, 'optionen' | 'schluessel'>): number[] =>
  gemischteIndizes(a.optionen.length, a.schluessel);

export const bewerteBildWort = (a: BildWortAufgabe, antwort: BildWortAntwort): Auswertung => nachIndex(a, antwort.wahl);
