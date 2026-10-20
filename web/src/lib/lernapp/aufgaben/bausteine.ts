import type { Urteil } from '../abgleich';
import { SchluesselSchema } from '../ereignisse/typen';
import { SPRACHEN } from '../kurse';
import * as z from '../z';

/**
 * Gemeinsame Bausteine der Aufgaben-Schemas (`zod/mini`, `../z.ts`). Eigenes Modul ohne Rückgriff auf `schema.ts`, damit
 * die Dateien je Übungstyp (`aufgaben/<typ>.ts`) ihre Schemas bauen können, ohne einen Importkreis mit der Union in
 * `schema.ts` zu bilden: `schema.ts` importiert die Typ-Dateien, die Typ-Dateien importieren zur Laufzeit nur von hier
 * (und aus `schema.ts` höchstens Typen).
 */

export const SpracheSchema = z.enum(SPRACHEN);

/** Verweis auf einen Clip im Audio-Bündel (ADR 0039 Nr. 3, Fortschreibung S4/S5). */
export const AudioSchema = z.strictObject({
  buendel: z.string().check(z.minLength(1), z.maxLength(200)),
  versatz: z.int().check(z.minimum(0)),
  laenge: z.int().check(z.minimum(1), z.maximum(16_777_216)),
  dauerMs: z.optional(z.int().check(z.minimum(1))),
});

/** Text mit Länge (getrimmt, dann geprüft). */
export const text = (max: number, min = 1) => z.string().check(z.trim(), z.minLength(min), z.maxLength(max));
/** Ungetrimmter Text mit Länge. */
export const roh = (max: number, min = 1) => z.string().check(z.minLength(min), z.maxLength(max));
/** Liste mit Länge. */
export const liste = <T extends z.ZodMiniType>(e: T, min: number, max: number) => z.array(e).check(z.minLength(min), z.maxLength(max));
/** Ganzzahl ≥ min. */
export const ab = (min: number) => z.int().check(z.minimum(min));

/** Ein Text mit Sprache (und optional Audio). */
export const InhaltSchema = z.strictObject({
  text: text(600),
  sprache: SpracheSchema,
  audio: z.optional(AudioSchema),
});
export type Inhalt = z.infer<typeof InhaltSchema>;

/** Inhalt mit Pflicht-Audio (Hörübungen). */
export const MitAudio = z.extend(InhaltSchema, { audio: AudioSchema });

/** Felder jeder Aufgabe: stabiler Schlüssel und die Wiederholungskarten, die sie bewertet. */
export const basis = {
  schluessel: SchluesselSchema,
  karten: z.optional(z.array(SchluesselSchema).check(z.maxLength(12))),
};

export const Loesungen = liste(text(600), 1, 30);
export const Optionen = liste(InhaltSchema, 2, 6);

/** Texte paarweise verschieden (ohne Groß/Klein und Rand-Leerraum). */
export const eindeutig = (texte: readonly string[]) => new Set(texte.map((t) => t.trim().toLocaleLowerCase())).size === texte.length;

/** Index der richtigen Option liegt im Bereich, Optionen sind verschieden. */
export function mitOptionen<T extends { optionen: { text: string }[]; richtig: number }>(a: T, ctx: z.RefinementCtx<T>) {
  if (a.richtig >= a.optionen.length) ctx.addIssue({ code: 'custom', message: 'richtig außerhalb der Optionen', path: ['richtig'] });
  if (!eindeutig(a.optionen.map((o) => o.text))) ctx.addIssue({ code: 'custom', message: 'Optionen doppelt', path: ['optionen'] });
}

/** Urteil einer Wiederholungskarte. */
export type KartenUrteil = { karte: string; urteil: Urteil };

/** Alle Karten einer Aufgabe mit demselben Urteil. */
export const kartenMit = (karten: readonly string[] | undefined, urteil: Urteil): KartenUrteil[] =>
  (karten ?? []).map((karte) => ({ karte, urteil }));
