import { normalisiere } from '../abgleich';
import { woerter } from '../abgleich/normalisiere';
import type { Note } from '../bewertung';
import type { Sprache } from '../kurse';
import * as z from '../z';
import { ab, basis, InhaltSchema, liste, text } from './grundlagen';
import { kartenMit } from './hilfen';
import type { Auswertung } from './schema';

/**
 * Übungstyp `schreiben` (PLAN §4.3, ADR 0042 Nr. 11, B1–C1): Aufgabe in der Zielsprache, Wortzahlbereich, Pflichtwörter.
 * Automatisch geprüft werden nur Länge und Pflichtwörter (dazu die Rechtschreibprüfung des Browsers über `spellcheck`);
 * keine KI-Bewertung. Danach 1–2 Musterantworten, die Prüfliste nach GER (Aufgabe, Zusammenhang, Wortschatz, Grammatik;
 * je 4 Stufen, eigene Formulierungen in `messages/lernapp` Namensraum `schreiben`) und die Selbsteinschätzung.
 *
 * Der Text bleibt auf dem Gerät: Er steht in keinem Ereignis (die Bewertung trägt nur Karte und Note). Die Abgabe an die
 * Lehrkraft der eigenen Gruppe folgt in L7 (`lib/lernapp/schreiben/abgabe.ts` bereitet die Nutzlast vor).
 * Schreiben wird nicht wiederholt: Jede Selbsteinschätzung nimmt die Aufgabe an; die Note geht an die Karten.
 */

export const SchreibenSchema = z
  .strictObject({
    ...basis,
    typ: z.literal('schreiben'),
    /** Aufgabe in der Zielsprache */
    aufgabe: InhaltSchema,
    /** Übersetzung der Aufgabe in die Ausgangssprache (nur auf frühen Stufen) */
    uebersetzung: z.optional(InhaltSchema),
    woerter: z.strictObject({ min: ab(1), max: ab(1) }),
    pflichtwoerter: z.optional(liste(text(60), 1, 10)),
    /** 1–2 Musterantworten in der Zielsprache */
    muster: liste(InhaltSchema, 1, 2),
  })
  .check(
    z.superRefine((a, ctx) => {
      if (a.woerter.max < a.woerter.min || a.woerter.max > 600)
        ctx.addIssue({ code: 'custom', message: 'Wortzahl: min ≤ max ≤ 600', path: ['woerter'] });
      if (a.muster.some((m) => m.sprache !== a.aufgabe.sprache))
        ctx.addIssue({ code: 'custom', message: 'Musterantwort in anderer Sprache', path: ['muster'] });
    }),
  );

export type SchreibenAufgabe = z.infer<typeof SchreibenSchema>;

/** Kriterien der Prüfliste nach GER (Texte in `schreiben.pruefliste.<kriterium>`), je 4 Stufen (0–3). */
export const KRITERIEN = ['aufgabe', 'zusammenhang', 'wortschatz', 'grammatik'] as const;
export type Kriterium = (typeof KRITERIEN)[number];
export type Pruefliste = Partial<Record<Kriterium, 0 | 1 | 2 | 3>>;

/** Selbsteinschätzung (Note) – ohne den Text. */
export type SchreibenAntwort = { typ: 'schreiben'; selbst: Note };

/** Wörter eines Textes (wie die Zählung im Formular). */
export function wortzahl(text: string, sprache: Sprache): number {
  return woerter(normalisiere(text, sprache)).length;
}

export type Pruefung = {
  woerter: number;
  /** im Bereich min…max */
  laengeOk: boolean;
  /** zu kurz bzw. zu lang (für den Hinweis) */
  laenge: 'kurz' | 'passt' | 'lang';
  /** je Pflichtwort: kommt vor (Vergleichsform der Sprache; ein Wort auch mit Endung, mehrere als Wortfolge) */
  pflicht: boolean[];
};

/** Automatische Prüfung: nur Länge und Pflichtwörter. */
export function pruefeText(a: Pick<SchreibenAufgabe, 'woerter' | 'pflichtwoerter' | 'aufgabe'>, eingabe: string): Pruefung {
  const sprache = a.aufgabe.sprache;
  const w = woerter(normalisiere(eingabe, sprache));
  const n = w.length;
  const laenge = n < a.woerter.min ? 'kurz' : n > a.woerter.max ? 'lang' : 'passt';
  const kette = ` ${w.join(' ')} `;
  const pflicht = (a.pflichtwoerter ?? []).map((p) => {
    const teile = woerter(normalisiere(p, sprache));
    if (teile.length !== 1) return teile.length > 0 && kette.includes(` ${teile.join(' ')} `);
    const form = teile[0] as string;
    // ein Wort: gleich, oder (ab 3 Zeichen) mit Endung bzw. – im Arabischen – mit angehängten Klitika
    return w.some((x) => x === form || (form.length >= 3 && (x.startsWith(form) || (sprache === 'ar' && x.includes(form)))));
  });
  return { woerter: n, laengeOk: laenge === 'passt', laenge, pflicht };
}

export function bewerteSchreiben(a: SchreibenAufgabe, antwort: SchreibenAntwort): Auswertung {
  return { urteil: 'richtig', hinweise: [], loesung: null, karten: kartenMit(a.karten, 'richtig'), selbst: antwort.selbst };
}
