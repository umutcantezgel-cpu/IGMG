import * as z from '../z';
import { ab, basis, InhaltSchema, liste, mitOptionen, Optionen } from './grundlagen';

/**
 * Übungstyp `bild_wort` (PLAN §4, KERN 4.0 §5/§7, Inhaltsleitfaden §5): Eine Bildkarte zeigt ein Symbol; gewählt wird das
 * passende Wort der Zielsprache. Bewertung nach Index (`auswertung/bild_wort.ts`).
 *
 * **Stil der Bildkarten (Entscheidung L2):** Linien-Symbole im 24-px-Raster wie die Oberfläche – Lucide (ISC) oder eigene
 * Pfade im selben Raster, ohne Füllung, runde Enden. Nur Gegenstände und Symbole, keine Menschen, Tiere, Gesichter oder
 * religiösen Zeichen; die Motive stehen mit Quelle, Lizenz und Freigabe in `web/inhalte/lernapp/symbole/symbole.json`
 * (Motivliste: Redaktion, LM-34). Der Paketbau legt die Geometrie ins Einheitenpaket – offline lesbar, ohne weitere Anfrage
 * und ohne HTML: nur geprüfte Pfaddaten (Kreise, Rechtecke, Linien … wandelt `symbole.ts` in Pfade), gezeichnet über React.
 *
 * **Zugänglichkeit:** Vor der Antwort trägt das Bild nur den Hinweis „Bildübung“ (WCAG 1.1.1, Ausnahme „Test“); die
 * Beschreibung (Übersetzung des Worts) erscheint erst nach der Antwort.
 */

/** Pfaddaten: nur Befehlsbuchstaben, Zahlen, Trenner. */
const PFAD = /^[MmLlHhVvCcSsQqTtAaZz0-9.,\s-]{1,2000}$/;

/** Bildkarte: Name des Motivs und seine Pfade im 24er Raster (Grundformen wandelt der Paketbau in Pfade, `symbole.ts`). */
export const BildSchema = z.strictObject({
  symbol: z.string().check(z.regex(/^[a-z0-9-]{1,60}$/)),
  pfade: liste(z.string().check(z.regex(PFAD)), 1, 40),
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
