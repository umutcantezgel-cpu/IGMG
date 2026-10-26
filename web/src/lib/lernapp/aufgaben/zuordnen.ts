import * as z from '../z';
import { ab, basis, eindeutig, liste, text } from './grundlagen';
import { wissen } from './wissen';

/**
 * Übungstyp `zuordnen` (Wissenskurs, PLAN §4): Einträge den Kategorien zuordnen – etwa Handlungen den Kategorien der
 * Rechtsschule. Die Kategorien sind Inhalt (Text der Aufgabe aus geprüften Aussagen), nie fest in der Oberfläche. Je Eintrag
 * eine Radiogruppe mit den Kategorien; Ziehen ist nie nötig (WCAG 2.5.7). Bewertung als Paarmenge: richtig nur, wenn jeder
 * Eintrag stimmt (`auswertung/zuordnen.ts`).
 *
 * `frage`: die inhaltliche Frage der Quizfrage (in der Inhaltsdatei `anweisung`, z. B. nach welchem Maßstab zugeordnet wird) –
 * im Wissenskurs immer gesetzt (`paket/wissen.ts`), denn ohne sie fehlt der Maßstab; die Überschrift bleibt die feste
 * Anweisung `ordneZu` in der Sprache der Oberfläche.
 */

export const ZuordnenSchema = z
  .strictObject({
    ...basis,
    ...wissen,
    typ: z.literal('zuordnen'),
    anweisung: z.enum(['ordneZu']),
    frage: z.optional(text(300)),
    /** Kategorien (bis 120 Zeichen wie `rechts` in den Inhaltsdateien des Wissenskurses) */
    kategorien: liste(text(120), 2, 6),
    /** Einträge mit dem Index ihrer Kategorie (Anzeige gemischt) */
    eintraege: liste(z.strictObject({ text: text(300), kategorie: ab(0) }), 2, 12),
  })
  .check(
    z.superRefine((a, ctx) => {
      if (!eindeutig(a.kategorien)) ctx.addIssue({ code: 'custom', message: 'Kategorien doppelt', path: ['kategorien'] });
      if (!eindeutig(a.eintraege.map((e) => e.text))) ctx.addIssue({ code: 'custom', message: 'Einträge doppelt', path: ['eintraege'] });
      a.eintraege.forEach((e, i) => {
        if (e.kategorie >= a.kategorien.length)
          ctx.addIssue({ code: 'custom', message: 'Kategorie außerhalb der Liste', path: ['eintraege', i, 'kategorie'] });
      });
    }),
  );

export type ZuordnenAufgabe = z.infer<typeof ZuordnenSchema>;
/** Kategorie je Eintrag (Index wie `eintraege`, Inhaltsreihenfolge). */
export type ZuordnenAntwort = { typ: 'zuordnen'; zuordnung: number[] };
