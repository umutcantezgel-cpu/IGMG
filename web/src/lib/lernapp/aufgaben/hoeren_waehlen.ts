import { gemischteIndizes } from '../engine/zufall';
import * as z from '../z';
import { ab, type Auswertung, basis, type Inhalt, InhaltSchema, mitOptionen, nachIndex, Optionen } from './grundlagen';

/**
 * Übungstyp `hoeren_waehlen` (PLAN §4): Ein Clip wird abgespielt (normal oder langsam, ADR 0039 Fortschreibung Nr. 3);
 * gewählt wird, was zu hören war (`waehleGehoertes`, Optionen in der Zielsprache) oder was es bedeutet
 * (`waehleBedeutung`, Optionen in der Ausgangssprache). Bewertung nach Index.
 *
 * Ohne Audio (Sprache noch ohne Stimme, KERN 4.0 §4: „Audio folgt“), mit der Einstellung „Hörübungen aus“ oder nach
 * „Ich kann gerade nicht hören“ wird die Aufgabe übersprungen – ohne Bewertung, keine Sackgasse (`engine/sitzung.ts`
 * `ueberspringe`). Nach der Antwort steht die Abschrift.
 */

/** Übungstypen mit Hören: übersprungen ohne Audio, bei „Hörübungen aus“ und nach „Ich kann gerade nicht hören“. */
export const HOER_TYPEN = ['hoeren_waehlen', 'hoeren_schreiben', 'minimalpaare'] as const;
export type HoerTyp = (typeof HOER_TYPEN)[number];
export const istHoerTyp = (typ: string): typ is HoerTyp => (HOER_TYPEN as readonly string[]).includes(typ);

/** Hat der zu hörende Text einen Clip? */
export const hatAudio = (a: { hoeren: Inhalt }): boolean => a.hoeren.audio !== undefined;

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

export const hoerenReihenfolge = (a: { optionen: readonly unknown[]; schluessel: string }): number[] =>
  gemischteIndizes(a.optionen.length, a.schluessel);

export const bewerteHoerenWaehlen = (a: HoerenWaehlenAufgabe, antwort: HoerenWaehlenAntwort): Auswertung => nachIndex(a, antwort.wahl);
