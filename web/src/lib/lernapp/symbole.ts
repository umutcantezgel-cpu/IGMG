import daten from '../../../inhalte/lernapp/symbole/symbole.json';
import type { Bild } from './aufgaben/bild_wort';
import * as z from './z';

/**
 * Register der Bildkarten (KERN 4.0 §5/§7, Inhaltsleitfaden §5): `web/inhalte/lernapp/symbole/symbole.json`, erzeugt aus
 * Lucide (ISC) mit `scripts/lernapp/symbole.mjs`. Je Motiv Name, Gruppe, Quelle, Lizenz, Freigabe der Redaktion (LM-34) und
 * die Geometrie im 24er Raster. Server-Modul für Import und Paketbau; der Client bekommt die Geometrie über das Paket –
 * als Pfade (`alsPfad`), damit Schema und Zeichnung im Spieler klein bleiben (KERN 4.0 §9).
 */

const Zahl = z.number().check(z.minimum(-48), z.maximum(48));
/** Pfaddaten: nur Befehlsbuchstaben, Zahlen, Trenner. */
const PFAD = /^[MmLlHhVvCcSsQqTtAaZz0-9.,\s-]{1,2000}$/;
const PUNKTE = /^[0-9.,\s-]{1,1000}$/;

/** Grundformen des Registers (wie Lucide sie liefert), nur Zahlen bzw. geprüfte Pfaddaten. */
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

/** Zahl für Pfaddaten (höchstens drei Nachkommastellen, ohne Exponent). */
const n = (x: number) => String(Math.round(x * 1000) / 1000 || 0);

/** Punkte `x,y x,y …` als Pfad (polyline offen, polygon geschlossen). */
function punktePfad(points: string, zu: boolean): string {
  const z = points
    .trim()
    .split(/[\s,]+/)
    .map(Number);
  const paare: string[] = [];
  for (let i = 0; i + 1 < z.length; i += 2) paare.push(`${n(z[i]!)} ${n(z[i + 1]!)}`);
  return `M${paare.join('L')}${zu ? 'z' : ''}`;
}

/** Grundform als gleichwertiger Pfad (gleiche Linie mit `stroke`, ohne Füllung). */
export function alsPfad(e: SymbolElement): string {
  switch (e.art) {
    case 'path':
      return e.d;
    case 'circle':
    case 'ellipse': {
      const rx = e.art === 'circle' ? e.r : e.rx;
      const ry = e.art === 'circle' ? e.r : e.ry;
      const bogen = (dx: number) => `a${n(rx)} ${n(ry)} 0 1 0 ${n(dx)} 0`;
      return `M${n(e.cx - rx)} ${n(e.cy)}${bogen(2 * rx)}${bogen(-2 * rx)}`;
    }
    case 'rect': {
      const rx = Math.min(e.rx ?? e.ry ?? 0, e.width / 2);
      const ry = Math.min(e.ry ?? e.rx ?? 0, e.height / 2);
      const w = e.width - 2 * rx;
      const h = e.height - 2 * ry;
      if (!rx || !ry) return `M${n(e.x)} ${n(e.y)}h${n(e.width)}v${n(e.height)}h${n(-e.width)}z`;
      const ecke = (dx: number, dy: number) => `a${n(rx)} ${n(ry)} 0 0 1 ${n(dx)} ${n(dy)}`;
      return `M${n(e.x + rx)} ${n(e.y)}h${n(w)}${ecke(rx, ry)}v${n(h)}${ecke(-rx, ry)}h${n(-w)}${ecke(-rx, -ry)}v${n(-h)}${ecke(rx, -ry)}z`;
    }
    case 'line':
      return `M${n(e.x1)} ${n(e.y1)}L${n(e.x2)} ${n(e.y2)}`;
    case 'polyline':
      return punktePfad(e.points, false);
    case 'polygon':
      return punktePfad(e.points, true);
  }
}

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

/** Bildkarte eines Motivs für das Paket (nur Pfade, ohne Quelle und Freigabe), oder null. */
export function symbolBild(symbol: string, register: ReadonlyMap<string, SymbolEintrag> = SYMBOLE): Bild | null {
  const e = register.get(symbol);
  return e ? { symbol, pfade: e.elemente.map(alsPfad) } : null;
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
