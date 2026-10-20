import { gleicheAb, normalisiere } from '../abgleich';
import { gemischteIndizes } from '../engine/zufall';
import * as z from '../z';
import { ab, type Auswertung, basis, InhaltSchema, kartenMit, liste, mitOptionen } from './grundlagen';

/**
 * Übungstyp `harakat` (Arabisch: Vokalzeichen, Iʿrāb; PLAN §4): Unter Schreibungen mit demselben Buchstabengerüst wird
 * die richtig vokalisierte gewählt. Bewertung im **strengen Modus** des Abgleichs (PLAN §4.1): Vokal- und Hamzazeichen
 * zählen, keine Lockerungen, keine Tippfehler; der Hinweis „harakat“ nennt die Ursache.
 *
 * Screenreader lesen Vokalzeichen oft nicht vor. Jede Option bekommt deshalb eine Beschreibung aus den Namen ihrer Zeichen
 * („Lesen mit Codepunkt-Namen“): je Buchstabe sein Name und die Namen seiner Zeichen (Texte unter
 * `aufgaben.harakat.zeichen.u<Codepunkt>`). Arabische Zeichen stehen hier nur als Codepunkt-Escapes (KERN 4.0 §3).
 */

/** Kombinierende Zeichen der Vokalisierung (Harakat, Schadda, Sukun, Madda, Hamza oben/unten, kleines Alif). */
const KOMBINIEREND = /^[\u064B-\u065F\u0670]$/;

/** Schlüssel eines Zeichens für die Namen: `u` + Codepunkt in vier Hex-Ziffern (z. B. `u0628`). */
export const zeichenSchluessel = (c: string): string => `u${(c.codePointAt(0) ?? 0).toString(16).toUpperCase().padStart(4, '0')}`;

/** Ein Buchstabe mit seinen Zeichen (Schlüssel nach `zeichenSchluessel`). */
export type Zeichen = { buchstabe: string; zeichen: string[] };

/** Wörter eines vokalisierten Texts als Folge von Buchstaben mit ihren Zeichen (NFC, Tatweel und Satzzeichen fallen weg). */
export function zeichenFolge(text: string): Zeichen[][] {
  return text
    .normalize('NFC')
    .split(/\s+/)
    .filter(Boolean)
    .map((wort) => {
      const folge: Zeichen[] = [];
      for (const c of wort) {
        if (KOMBINIEREND.test(c)) folge.at(-1)?.zeichen.push(zeichenSchluessel(c));
        else if (/^[\u0621-\u063A\u0641-\u064A\u0671]$/.test(c)) folge.push({ buchstabe: zeichenSchluessel(c), zeichen: [] });
      }
      return folge;
    })
    .filter((w) => w.length > 0);
}

/**
 * Beschreibung zum Vorlesen: Buchstaben mit ihren Zeichen, Wörter getrennt. Unbekannte Schlüssel erscheinen als
 * Codepunkt (`U+0628`), damit nie ein Zeichen verschwindet.
 */
export function beschreibe(text: string, namen: Readonly<Record<string, string>>, trenner = { zeichen: ' ', buchstabe: ', ', wort: '; ' }) {
  const name = (s: string) => namen[s] ?? `U+${s.slice(1)}`;
  return zeichenFolge(text)
    .map((wort) => wort.map((b) => [name(b.buchstabe), ...b.zeichen.map(name)].join(trenner.zeichen)).join(trenner.buchstabe))
    .join(trenner.wort);
}

export const HarakatSchema = z
  .strictObject({
    ...basis,
    typ: z.literal('harakat'),
    anweisung: z.enum(['waehleVokalisierung']),
    /** Bedeutung als Hilfe (Ausgangssprache) */
    vorgabe: z.optional(InhaltSchema),
    /** Schreibungen (arabisch), gleiches Gerüst, verschiedene Vokalisierung */
    optionen: liste(InhaltSchema, 2, 4),
    richtig: ab(0),
  })
  .check(
    z.superRefine(mitOptionen),
    z.superRefine((a, ctx) => {
      if (a.optionen.some((o) => o.sprache !== 'ar'))
        ctx.addIssue({ code: 'custom', message: 'Optionen nicht arabisch', path: ['optionen'] });
      const geruest = new Set(a.optionen.map((o) => normalisiere(o.text, 'ar')));
      if (geruest.size !== 1) ctx.addIssue({ code: 'custom', message: 'Optionen mit verschiedenem Gerüst', path: ['optionen'] });
      const streng = new Set(a.optionen.map((o) => normalisiere(o.text, 'ar', true)));
      if (streng.size !== a.optionen.length)
        ctx.addIssue({ code: 'custom', message: 'Optionen mit gleicher Vokalisierung', path: ['optionen'] });
    }),
  );

export type HarakatAufgabe = z.infer<typeof HarakatSchema>;
export type HarakatAntwort = { typ: 'harakat'; wahl: number };

export const harakatReihenfolge = (a: Pick<HarakatAufgabe, 'optionen' | 'schluessel'>): number[] =>
  gemischteIndizes(a.optionen.length, a.schluessel);

export function bewerteHarakat(a: HarakatAufgabe, antwort: HarakatAntwort): Auswertung {
  const richtig = a.optionen[a.richtig]?.text ?? '';
  const gewaehlt = a.optionen[antwort.wahl]?.text ?? '';
  const e = gleicheAb(gewaehlt, richtig, 'ar', { streng: true });
  const urteil = e.urteil === 'richtig' ? 'richtig' : 'falsch';
  return {
    urteil,
    hinweise: urteil === 'richtig' ? [] : e.hinweise.filter((h) => h === 'harakat'),
    loesung: richtig,
    karten: kartenMit(a.karten, urteil),
  };
}
