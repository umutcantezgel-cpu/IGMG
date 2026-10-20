import { gemischteIndizes } from '../engine/zufall';
import { SchluesselSchema } from '../ereignisse/typen';
import * as z from '../z';
import { ab, basis, InhaltSchema, type KartenUrteil, kartenMit, liste, mitOptionen, Optionen } from './bausteine';
import type { Auswertung } from './schema';

/**
 * Übungstyp `geschichte` (PLAN §4 „Geschichten“): eine kurze Geschichte, Zeile für Zeile aufgedeckt (mit Audio, wo es
 * eines gibt), dazwischen Fragen. Jede Frage steht nach der Zeile `nach` und wird sofort geprüft (Rückmeldung in der
 * Live-Region); erst danach geht es weiter. Am Ende gibt die Komponente alle ersten Antworten ab.
 *
 * Urteil wie bei `paare`: alle Fragen im ersten Versuch richtig → richtig, sonst falsch (die Geschichte kommt am Ende der
 * Lektion noch einmal). Karten einer Frage (`karte`) bekommen ihr eigenes Urteil, die Karten der Aufgabe das Gesamturteil.
 */

export const GeschichteFrageSchema = z
  .strictObject({
    /** steht nach dieser Zeile (Index in `zeilen`) */
    nach: ab(0),
    frage: InhaltSchema,
    optionen: Optionen,
    richtig: ab(0),
    karte: z.optional(SchluesselSchema),
  })
  .check(z.superRefine(mitOptionen));

export const GeschichteZeileSchema = z.strictObject({
  /** Person der Zeile (Texte „Person A“ …); ohne Angabe Erzähltext */
  sprecher: z.optional(z.enum(['a', 'b', 'c'])),
  zeile: InhaltSchema,
  /** Übersetzung in die Ausgangssprache (aufklappbar) */
  uebersetzung: z.optional(InhaltSchema),
});

export const GeschichteSchema = z
  .strictObject({
    ...basis,
    typ: z.literal('geschichte'),
    titel: z.optional(InhaltSchema),
    zeilen: liste(GeschichteZeileSchema, 1, 60),
    fragen: z.array(GeschichteFrageSchema).check(z.maxLength(10)),
  })
  .check(
    z.superRefine((a, ctx) => {
      a.fragen.forEach((f, i) => {
        if (f.nach >= a.zeilen.length) ctx.addIssue({ code: 'custom', message: 'Frage nach dem Ende', path: ['fragen', i, 'nach'] });
        const vorige = a.fragen[i - 1];
        if (vorige && vorige.nach > f.nach)
          ctx.addIssue({ code: 'custom', message: 'Fragen nicht in Reihenfolge', path: ['fragen', i, 'nach'] });
      });
    }),
  );

export type GeschichteAufgabe = z.infer<typeof GeschichteSchema>;
/** Erste Antwort je Frage (Index in den Optionen der Frage, Reihenfolge wie `fragen`). */
export type GeschichteAntwort = { typ: 'geschichte'; wahlen: number[] };

/** Ein Schritt des Ablaufs: Zeile aufdecken oder Frage stellen. */
export type GeschichteSchritt = { art: 'zeile'; index: number } | { art: 'frage'; index: number };

/** Ablauf der Geschichte: jede Zeile, danach die Fragen, die nach ihr stehen. */
export function ablauf(a: Pick<GeschichteAufgabe, 'zeilen' | 'fragen'>): GeschichteSchritt[] {
  const schritte: GeschichteSchritt[] = [];
  a.zeilen.forEach((_, i) => {
    schritte.push({ art: 'zeile', index: i });
    a.fragen.forEach((f, j) => {
      if (f.nach === i) schritte.push({ art: 'frage', index: j });
    });
  });
  return schritte;
}

/** Anzeigereihenfolge der Optionen einer Frage (deterministisch je Aufgabe und Frage). */
export const frageReihenfolge = (a: Pick<GeschichteAufgabe, 'fragen' | 'schluessel'>, frage: number): number[] =>
  gemischteIndizes(a.fragen[frage]?.optionen.length ?? 0, `${a.schluessel}#${frage}`);

export function bewerteGeschichte(a: GeschichteAufgabe, antwort: GeschichteAntwort): Auswertung {
  const richtigJe = a.fragen.map((f, i) => antwort.wahlen[i] === f.richtig);
  const vollstaendig = antwort.wahlen.length === a.fragen.length;
  const urteil = vollstaendig && richtigJe.every(Boolean) ? 'richtig' : 'falsch';
  const karten: KartenUrteil[] = a.fragen.flatMap((f, i) =>
    f.karte ? [{ karte: f.karte, urteil: richtigJe[i] ? 'richtig' : 'falsch' } as const] : [],
  );
  karten.push(...kartenMit(a.karten, urteil));
  return { urteil, hinweise: [], loesung: null, karten };
}
