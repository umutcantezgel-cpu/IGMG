import * as z from '../z';
import { ab, basis, InhaltSchema, mitOptionen, Optionen } from './grundlagen';

/**
 * Übungstyp `hoeren_waehlen` (PLAN §4): Ein Clip wird abgespielt (normal oder langsam, ADR 0039 Fortschreibung Nr. 3);
 * gewählt wird, was zu hören war (`waehleGehoertes`, Optionen in der Zielsprache) oder was es bedeutet
 * (`waehleBedeutung`, Optionen in der Ausgangssprache). Bewertung nach Index (`auswertung/hoeren_waehlen.ts`).
 *
 * Ohne Audio (Sprache noch ohne Stimme, KERN 4.0 §4: „Audio folgt“), mit der Einstellung „Hörübungen aus“ oder nach
 * „Ich kann gerade nicht hören“ wird die Aufgabe übersprungen – ohne Bewertung, keine Sackgasse (`engine/sitzung.ts`
 * `ueberspringe`; Hörtypen in `hilfen.ts`). Nach der Antwort steht die Abschrift.
 */

export const HoerenWaehlenSchema = z
  .strictObject({
    ...basis,
    typ: z.literal('hoeren_waehlen'),
    anweisung: z.enum(['waehleGehoertes', 'waehleBedeutung']),
    /** Text der Zielsprache mit Clip (ohne Clip: „Audio folgt“) */
    hoeren: InhaltSchema,
    optionen: Optionen,
    richtig: ab(0),
  })
  .check(z.superRefine(mitOptionen));

export type HoerenWaehlenAufgabe = z.infer<typeof HoerenWaehlenSchema>;
export type HoerenWaehlenAntwort = { typ: 'hoeren_waehlen'; wahl: number };
