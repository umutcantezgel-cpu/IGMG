import type { core } from 'zod/mini';

/**
 * Zod für die gemeinsamen Schemas der Lern-App (Aufgaben, Ereignisse, Pakete, Abgleich, Profil, Export), die auch im
 * Browser laufen (KERN 4.0 §9, JS-Budget): `zod/mini` mit genau den Bausteinen, die diese Schemas brauchen – als benannte
 * Exporte, damit jeder Bündler nur das Genutzte mitnimmt. Gemessen (esbuild, gz): ≈ 10 KB statt ≈ 28 KB mit `zod`
 * (Baumschütteln ideal) bzw. ≈ 90 KB, wenn der Namensraum `z` des Pakets samt Sprachdateien mitkommt.
 *
 * Laufzeitgleich mit `zod` (gemeinsamer Kern): Server-Code nutzt dieselben Schemas mit `parse`/`safeParse`. Schreibweise
 * funktional: `z.optional(x)`, `z.string().check(z.minLength(1))`, `x.check(z.superRefine(…))`, `z.extend(a, {…})`.
 * Nur in Server-Modulen (z. B. `inhalt/schema.ts`) bleibt das volle `zod`.
 *
 * Aufruf: `import * as z from '../z'`.
 */
export {
  array,
  boolean,
  discriminatedUnion,
  enum,
  extend,
  int,
  iso,
  literal,
  looseObject,
  maxLength,
  maximum,
  minLength,
  minimum,
  null,
  nullable,
  number,
  optional,
  record,
  refine,
  regex,
  strictObject,
  string,
  superRefine,
  trim,
  union,
  unknown,
  uuid,
} from 'zod/mini';
export type { infer, input, output, ZodMiniType } from 'zod/mini';

/** Kontext einer Prüfung mit `z.superRefine` (Fehler über `ctx.addIssue`). */
export type RefinementCtx<T = unknown> = core.$RefinementCtx<T>;
