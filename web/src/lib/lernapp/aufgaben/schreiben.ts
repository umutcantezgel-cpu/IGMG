import type { Note } from '../bewertung';
import * as z from '../z';
import { ab, basis, InhaltSchema, liste, text } from './grundlagen';

/**
 * Übungstyp `schreiben` (PLAN §4.3, ADR 0042 Nr. 11, B1–C1): Aufgabe in der Zielsprache, Wortzahlbereich, Pflichtwörter.
 * Automatisch geprüft werden nur Länge und Pflichtwörter (dazu die Rechtschreibprüfung des Browsers über `spellcheck`);
 * keine KI-Bewertung. Danach 1–2 Musterantworten, die Prüfliste nach GER (Aufgabe, Zusammenhang, Wortschatz, Grammatik;
 * je 4 Stufen, eigene Formulierungen in `messages/lernapp` Namensraum `schreiben`) und die Selbsteinschätzung.
 *
 * Der Text bleibt auf dem Gerät: Er steht in keinem Ereignis (die Bewertung trägt nur Karte und Note). Die Abgabe an die
 * Lehrkraft der eigenen Gruppe folgt in L7 (`lib/lernapp/schreiben/abgabe.ts` bereitet die Nutzlast vor).
 * Schreiben wird nicht wiederholt: Jede Selbsteinschätzung nimmt die Aufgabe an; die Note geht an die Karten. Hier nur die
 * Nutzlast (Zod); Prüfliste, Zählung, Prüfung und Bewertung ohne Zod in `auswertung/schreiben.ts`.
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

/** Selbsteinschätzung (Note) – ohne den Text. */
export type SchreibenAntwort = { typ: 'schreiben'; selbst: Note };
