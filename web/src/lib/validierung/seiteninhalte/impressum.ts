import { z } from 'zod';
import { mehrsprachig } from '../mehrsprachig';

/**
 * Seiteninhalt „impressum“ (Blatt S23, Gliederung Impressum; Welle A). Entwurf nach G-08.
 * Angaben zur Gemeinde sind Platzhalter in eckigen Klammern, bis die Gemeinde sie liefert (G-05): Vereinsname, Register,
 * Vertretung, Anschrift, Telefon, E-Mail. Die Angaben zur verantwortlichen Stelle nutzt auch die Datenschutzerklärung
 * (eine Quelle, kein Doppel). Überschriften und Entwurfshinweis stehen in messages/bereiche/rechtliches.json.
 */

/** Angabe zur verantwortlichen Stelle; nicht mehrsprachig, ein Platzhalter bis zur Lieferung. */
const angabe = (platzhalter: string, max = 300) => z.string().trim().max(max).default(platzhalter);

/** E-Mail der verantwortlichen Stelle: gültige Adresse, leer oder der Platzhalter (G-05). */
const mailAngabe = (platzhalter: string) =>
  z
    .string()
    .trim()
    .pipe(z.union([z.email().max(200), z.literal(''), z.literal(platzhalter)]))
    .default(platzhalter);

/** Baustein eines Rechtstextes: Absatz oder Liste mit optionaler Überschrift. Deutsch Pflicht, tr/en optional (K-02). */
export const baustein = z.discriminatedUnion('art', [
  z.object({ art: z.literal('absatz'), text: mehrsprachig(4000) }),
  z.object({
    art: z.literal('liste'),
    titel: mehrsprachig(200).optional(),
    punkte: z.array(mehrsprachig(500)).min(1).max(40),
  }),
]);
export type Baustein = z.infer<typeof baustein>;

/** Liste von Rechtsbausteinen (höchstens 40 je Abschnitt). */
export const bausteine = z.array(baustein).max(40);

export const schema = z.object({
  verantwortlich: z
    .object({
      name: angabe('[Name und Rechtsform – Vorstand]', 200),
      anschrift: angabe('[Anschrift]'),
      telefon: angabe('[Telefonnummer]', 60),
      email: mailAngabe('[E-Mail-Adresse]'),
      vertretung: angabe('[Vertretungsberechtigte – Vorstand]'),
      register: angabe('[Registergericht und Registernummer]'),
    })
    .default({
      name: '[Name und Rechtsform – Vorstand]',
      anschrift: '[Anschrift]',
      telefon: '[Telefonnummer]',
      email: '[E-Mail-Adresse]',
      vertretung: '[Vertretungsberechtigte – Vorstand]',
      register: '[Registergericht und Registernummer]',
    }),
  weitere: bausteine.default([{ art: 'absatz', text: { de: '[Text fehlt: weitere Angaben]' } }]),
});

export type ImpressumInhalt = z.infer<typeof schema>;
