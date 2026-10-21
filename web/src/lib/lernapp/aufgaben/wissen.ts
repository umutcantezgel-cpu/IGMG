import * as z from '../z';
import { SpracheSchema, text } from './grundlagen';

/**
 * Gemeinsame Felder der Aufgaben des Wissenskurses (PLAN §4 „Wissenskurs“: `wahr_falsch`, `zuordnen`, `reihenfolge`,
 * `fallfrage`; KERN 4.0 §2). Jede dieser Aufgaben entsteht nur aus einer oder mehreren geprüften Aussagen und ist selbst
 * erst mit zwei Freigaben sichtbar – entschieden wird das ausschließlich in `freigabe.ts` (`wissensAufgabeSichtbar`), der
 * Paketbau liefert nur Freigegebenes aus. Die Aufgaben geben keine Auskunft zu persönlichen Fällen (KERN 4.0 §2.2 Nr. 3).
 *
 * - `sprache`: Sprache der Inhalte (der Wissenskurs ist deutsch, die Oberfläche kann tr oder ar sein → `lang`/`dir`).
 * - `quelle`: Quellenzeile der zugrunde liegenden Aussage(n) (Werk, Kapitel, Ausgabe), nach der Antwort aufklappbar
 *   (KERN 4.0 §2.3 „Kennzeichnung“). Der Text kommt aus dem Beleg, nie aus dem Gedächtnis.
 */
export const wissen = {
  sprache: SpracheSchema,
  quelle: z.optional(text(400)),
};
