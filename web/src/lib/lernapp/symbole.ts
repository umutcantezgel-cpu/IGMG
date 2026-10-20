import daten from '../../../inhalte/lernapp/symbole/symbole.json';
import { type Bild, SymbolElementSchema } from './aufgaben/bild_wort';
import * as z from './z';

/**
 * Register der Bildkarten (KERN 4.0 §5/§7, Inhaltsleitfaden §5): `web/inhalte/lernapp/symbole/symbole.json`, erzeugt aus
 * Lucide (ISC) mit `scripts/lernapp/symbole.mjs`. Je Motiv Name, Gruppe, Quelle, Lizenz, Freigabe der Redaktion (LM-34) und
 * die Geometrie im 24er Raster. Server-Modul für Import und Paketbau; der Client bekommt die Geometrie über das Paket.
 */

const EintragSchema = z.strictObject({
  motiv: z.string().check(z.minLength(1), z.maxLength(80)),
  gruppe: z.string().check(z.regex(/^[a-z]{1,40}$/)),
  quelle: z.string().check(z.regex(/^(lucide:[a-z0-9-]+@[0-9.]+|eigen:[a-z0-9-]+)$/)),
  lizenz: z.enum(['ISC', 'MIT', 'CC0-1.0', 'CC-BY-SA-4.0']),
  freigegeben: z.boolean(),
  elemente: z.array(SymbolElementSchema).check(z.minLength(1), z.maxLength(40)),
});
export type SymbolEintrag = z.infer<typeof EintragSchema>;

const RegisterSchema = z.strictObject({
  _hinweis: z.string(),
  format: z.literal('igmg-lernapp-symbole'),
  version: z.literal(1),
  symbole: z.record(z.string().check(z.regex(/^[a-z0-9-]{1,60}$/)), EintragSchema),
});

/** Motive nach Schlüssel (geprüft beim Laden). */
export const SYMBOLE: ReadonlyMap<string, SymbolEintrag> = new Map(Object.entries(RegisterSchema.parse(daten).symbole));

/** Bildkarte eines Motivs für das Paket (ohne Quelle und Freigabe), oder null. */
export function symbolBild(symbol: string, register: ReadonlyMap<string, SymbolEintrag> = SYMBOLE): Bild | null {
  const e = register.get(symbol);
  return e ? { symbol, elemente: e.elemente } : null;
}

/**
 * Darf ein Lemma dieses Motiv tragen? Unbekannte Motive nie; Motive ohne Freigabe der Redaktion nur im Testkurs
 * (Quelle `test:`). Ergebnis: Fehlertext oder null.
 */
export function symbolFehler(symbol: string, quelle: string, register: ReadonlyMap<string, SymbolEintrag> = SYMBOLE): string | null {
  const e = register.get(symbol);
  if (!e) return `Motiv ${symbol} unbekannt (inhalte/lernapp/symbole/symbole.json)`;
  if (!e.freigegeben && !quelle.startsWith('test:')) return `Motiv ${symbol} ohne Freigabe der Redaktion (LM-34)`;
  return null;
}
