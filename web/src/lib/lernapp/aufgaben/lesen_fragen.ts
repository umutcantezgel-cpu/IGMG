import { normalisiere } from '../abgleich';
import { gemischteIndizes } from '../engine/zufall';
import type { Sprache } from '../kurse';
import * as z from '../z';
import { ab, basis, type Inhalt, InhaltSchema, kartenMit, liste, mitOptionen, Optionen, roh } from './bausteine';
import type { Auswertung } from './schema';

/**
 * Übungstyp `lesen_fragen` (PLAN §4 „Lesen“, ab B1): ein Lesetext, darunter Fragen – Auswahl oder „richtig / falsch /
 * nicht im Text“. Ein Wort im Text antippen (oder mit Tab und Enter wählen) zeigt seine Glosse in der Ausgangssprache
 * (Deckkraft + Skalierung .96 → 1 wie B-14, reduziert nur Deckkraft). Alle Fragen werden zusammen geprüft; danach sind
 * richtige und falsche Antworten je Frage als Text markiert. Urteil: alle richtig → richtig, sonst falsch.
 */

/** Antworten der Aussagen-Fragen (Reihenfolge = Index der Antwort). */
export const RFN = ['richtig', 'falsch', 'nicht_im_text'] as const;
export type Rfn = (typeof RFN)[number];

export const AuswahlFrageSchema = z
  .strictObject({ art: z.literal('auswahl'), frage: InhaltSchema, optionen: Optionen, richtig: ab(0) })
  .check(z.superRefine(mitOptionen));
export const RfnFrageSchema = z.strictObject({ art: z.literal('rfn'), aussage: InhaltSchema, richtig: z.enum(RFN) });
export const LeseFrageSchema = z.discriminatedUnion('art', [AuswahlFrageSchema, RfnFrageSchema]);

export const GlosseSchema = z.strictObject({
  /** Wortform im Text (verglichen in der Vergleichsform der Zielsprache) */
  wort: roh(80),
  /** Bedeutung in der Ausgangssprache */
  glosse: InhaltSchema,
});

export const LesenFragenSchema = z
  .strictObject({
    ...basis,
    typ: z.literal('lesen_fragen'),
    titel: z.optional(InhaltSchema),
    /** Absätze des Lesetexts in der Zielsprache */
    text: liste(InhaltSchema, 1, 40),
    glossen: z.optional(liste(GlosseSchema, 1, 200)),
    fragen: liste(LeseFrageSchema, 1, 10),
  })
  .check(
    z.superRefine((a, ctx) => {
      const sprache = a.text[0]?.sprache;
      if (a.text.some((t) => t.sprache !== sprache))
        ctx.addIssue({ code: 'custom', message: 'Lesetext in mehreren Sprachen', path: ['text'] });
      if (sprache && a.glossen) {
        const formen = a.glossen.map((g) => normalisiere(g.wort, sprache));
        if (new Set(formen).size !== formen.length) ctx.addIssue({ code: 'custom', message: 'Glosse doppelt', path: ['glossen'] });
      }
    }),
  );

export type LesenFragenAufgabe = z.infer<typeof LesenFragenSchema>;
export type LeseFrage = z.infer<typeof LeseFrageSchema>;
/** Antwort je Frage: Index der Option bzw. Index in `RFN`. */
export type LesenFragenAntwort = { typ: 'lesen_fragen'; wahlen: number[] };

/** Zahl der Antwortmöglichkeiten einer Frage. */
export const optionenAnzahl = (f: LeseFrage): number => (f.art === 'auswahl' ? f.optionen.length : RFN.length);
/** Index der richtigen Antwort einer Frage. */
export const richtigerIndex = (f: LeseFrage): number => (f.art === 'auswahl' ? f.richtig : RFN.indexOf(f.richtig));

/** Anzeigereihenfolge der Optionen (Auswahl gemischt, „richtig / falsch / nicht im Text“ fest). */
export function leseReihenfolge(a: Pick<LesenFragenAufgabe, 'fragen' | 'schluessel'>, frage: number): number[] {
  const f = a.fragen[frage];
  if (!f) return [];
  return f.art === 'auswahl' ? gemischteIndizes(f.optionen.length, `${a.schluessel}#${frage}`) : RFN.map((_, i) => i);
}

/** Je Frage: richtig beantwortet? */
export const richtigJeFrage = (a: Pick<LesenFragenAufgabe, 'fragen'>, wahlen: readonly number[]): boolean[] =>
  a.fragen.map((f, i) => wahlen[i] === richtigerIndex(f));

export function bewerteLesenFragen(a: LesenFragenAufgabe, antwort: LesenFragenAntwort): Auswertung {
  const ok = richtigJeFrage(a, antwort.wahlen);
  const urteil = antwort.wahlen.length === a.fragen.length && ok.every(Boolean) ? 'richtig' : 'falsch';
  return { urteil, hinweise: [], loesung: null, karten: kartenMit(a.karten, urteil) };
}

/** Ein Stück eines Absatzes: Wort (antippbar, wenn es eine Glosse hat) oder Zwischenraum/Satzzeichen. */
export type Stueck = { text: string; wort: boolean };

const WORT = /[\p{L}\p{M}\p{N}]+(?:['’-][\p{L}\p{M}\p{N}]+)*/gu;

/** Absatz in Wörter und Zwischenräume zerlegen; zusammengesetzt ergibt sich wieder genau der Text. */
export function stuecke(text: string): Stueck[] {
  const teile: Stueck[] = [];
  let pos = 0;
  for (const m of text.matchAll(WORT)) {
    const i = m.index ?? 0;
    if (i > pos) teile.push({ text: text.slice(pos, i), wort: false });
    teile.push({ text: m[0], wort: true });
    pos = i + m[0].length;
  }
  if (pos < text.length) teile.push({ text: text.slice(pos), wort: false });
  return teile;
}

/** Glossen nach Vergleichsform (einmal je Aufgabe). */
export function glossenVerzeichnis(a: Pick<LesenFragenAufgabe, 'glossen'>, sprache: Sprache): Map<string, Inhalt> {
  return new Map((a.glossen ?? []).map((g) => [normalisiere(g.wort, sprache), g.glosse]));
}

/** Glosse zu einem Wort des Texts, sonst null. */
export function glosseFuer(verzeichnis: ReadonlyMap<string, Inhalt>, wort: string, sprache: Sprache): Inhalt | null {
  return verzeichnis.get(normalisiere(wort, sprache)) ?? null;
}
