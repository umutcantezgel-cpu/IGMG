import * as z from '../z';
import { basis, liste } from './grundlagen';

/**
 * Übungstyp `schrift_ar` (PLAN §4.4, Vorkurs Arabisch für de/tr): die Elifbe-Logik aus `web/src/lib/elifbe/` – Buchstaben
 * aus Codepunkten (`alphabet.ts`), Formen über ZWJ, Silben aus Buchstabe × Haraka (`silben.ts`), Schreibweg und
 * Nachspuren (`zuege.ts`, `uebung.ts` `bewerteSpur`, Komponente `Schreibweg.tsx`, B-17). Keine Wörter, keine Beispiele aus
 * Texten – nur Buchstaben und Silben (KI-Regel 2). Buchstabennamen kommen aus `messages/lernapp` (`aufgaben2.schriftAr.namen`).
 *
 * Arten:
 * - `erkennen`: Buchstabe sehen, Namen wählen (Radiogruppe).
 * - `zuordnen`: Buchstabe in einer verbundenen Form (Anfang/Mitte/Ende) sehen, die Einzelform wählen.
 * - `lesen`: Silbe (Buchstabe mit Vokalzeichen) sehen, die Umschrift wählen.
 * - `nachspuren`: Buchstaben Zug für Zug nachspuren; ohne Zeiger „auf Papier geschrieben“ (WCAG 2.5.1, 2.5.7).
 *
 * Die Optionen sind `[ziel, ...ablenker]` (Index 0 richtig), gemischt angezeigt. Hier Nutzlast (Zod) und die Regeln, die das
 * Schema braucht; Optionen, Reihenfolge und Bewertung ohne Zod in `auswertung/schrift_ar.ts`.
 */

/** Buchstaben in der Reihenfolge des Elifbe (`web/src/lib/elifbe/alphabet.ts` `SLUGS`; ein Unit-Test hält beide gleich). */
export const BUCHSTABEN = [
  'elif',
  'be',
  'te',
  'se',
  'cim',
  'ha',
  'hi',
  'dal',
  'zel',
  'ra',
  'ze',
  'sin',
  'shin',
  'sad',
  'dad',
  'ti',
  'zi',
  'ayin',
  'gayin',
  'fe',
  'kaf',
  'kef',
  'lam',
  'mim',
  'nun',
  'vav',
  'he',
  'ye',
  'hemze',
] as const;
export type BuchstabeSlug = (typeof BUCHSTABEN)[number];

export const SCHRIFT_AR_ARTEN = ['erkennen', 'zuordnen', 'lesen', 'nachspuren'] as const;
export const VERBUNDENE_FORMEN = ['anfang', 'mitte', 'ende'] as const;
/** Silbenarten (`silben.ts` `SilbenArt`). */
export const SILBEN_ARTEN = [
  'fatha',
  'kasra',
  'damma',
  'sukun',
  'shadda',
  'fathatan',
  'kasratan',
  'dammatan',
  'med-fatha',
  'med-kasra',
  'med-damma',
] as const;

/** Buchstaben ohne verbundene Formen (Hamza) bzw. ohne Verbindung nach links (nur Endform). */
const OHNE_FORMEN: ReadonlySet<string> = new Set(['hemze']);
const NUR_RECHTS: ReadonlySet<string> = new Set(['elif', 'dal', 'zel', 'ra', 'ze', 'vav']);
/** Träger ohne Sukun, Schadda und Dehnung (`silben.ts` `erlaubt`). */
const NUR_KURZ: ReadonlySet<string> = new Set(['elif', 'hemze']);

/** Kann der Buchstabe in dieser Form stehen (`zuordnen`)? */
export function formMoeglich(slug: string, form: (typeof VERBUNDENE_FORMEN)[number]): boolean {
  if (OHNE_FORMEN.has(slug)) return false;
  return form === 'ende' || !NUR_RECHTS.has(slug);
}

/** Kann der Buchstabe diese Silbenart tragen (`lesen`)? Wie `silben.ts` `erlaubt`. */
export function silbeMoeglich(slug: string, art: (typeof SILBEN_ARTEN)[number]): boolean {
  return !NUR_KURZ.has(slug) || !['sukun', 'shadda', 'med-fatha', 'med-kasra', 'med-damma'].includes(art);
}

const Slug = z.enum(BUCHSTABEN);

export const SchriftArSchema = z
  .strictObject({
    ...basis,
    typ: z.literal('schrift_ar'),
    art: z.enum(SCHRIFT_AR_ARTEN),
    ziel: Slug,
    /** Ablenker (nicht bei `nachspuren`) */
    ablenker: z.optional(liste(Slug, 1, 5)),
    /** nur `zuordnen`: gezeigte Form */
    form: z.optional(z.enum(VERBUNDENE_FORMEN)),
    /** nur `lesen`: Vokalzeichen der Silbe (gleich für Ziel und Ablenker) */
    vokal: z.optional(z.enum(SILBEN_ARTEN)),
  })
  .check(
    z.superRefine((a, ctx) => {
      const fehler = (message: string, feld: string) => ctx.addIssue({ code: 'custom', message, path: [feld] });
      if (a.art === 'nachspuren') {
        if (a.ablenker || a.form || a.vokal) fehler('nachspuren ohne Ablenker, Form und Vokal', 'art');
        return;
      }
      const alle = [a.ziel, ...(a.ablenker ?? [])];
      if (!a.ablenker) fehler('Ablenker fehlen', 'ablenker');
      else if (new Set(alle).size !== alle.length) fehler('Ablenker doppelt oder gleich dem Ziel', 'ablenker');
      if (a.art === 'zuordnen') {
        if (!a.form) fehler('Form fehlt', 'form');
        else if (alle.some((s) => !formMoeglich(s, a.form!))) fehler('Form nicht möglich', 'form');
      } else if (a.form) fehler('Form nur bei zuordnen', 'form');
      if (a.art === 'lesen') {
        if (!a.vokal) fehler('Vokal fehlt', 'vokal');
        else if (alle.some((s) => !silbeMoeglich(s, a.vokal!))) fehler('Silbe nicht möglich', 'vokal');
      } else if (a.vokal) fehler('Vokal nur bei lesen', 'vokal');
    }),
  );

export type SchriftArAufgabe = z.infer<typeof SchriftArSchema>;
/** Auswahl (Index in `[ziel, ...ablenker]`) bzw. Nachspuren: gezeichnet oder auf Papier geschrieben. */
export type SchriftArAntwort = { typ: 'schrift_ar'; wahl: number } | { typ: 'schrift_ar'; spur: 'gezeichnet' | 'papier' };
