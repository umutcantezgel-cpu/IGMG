import { z } from 'zod';
import { mehrsprachig, mehrsprachigOptional } from '../mehrsprachig';
import { datumIso, igmgUrl } from '../url';

/**
 * Seiteninhalt „dachverband“ (Plan Marktstart P3, E-044 Nr. 2, ADR 0046): Einträge „Aus dem Dachverband“ für Startseite,
 * Nachrichten, Islamisches Wissen und Organisationsseiten. Nur Links zur IGMG, keine Bilder und keine Anfragen beim
 * Seitenaufruf (K-14). Freitagspredigten (Hutba) kommen aus dem RSS-Feed der IGMG (`lib/dachverband/feed.ts`) oder von
 * der Redaktion; Gemeinschaftsthemen pflegt die Redaktion mit eigenen Kurztexten.
 *
 * Regeln (G-06, E-044 Nr. 2):
 * - Es gibt bewusst keine Art „pressemitteilung“ – politische Pressemitteilungen erscheinen nicht.
 * - Freitagspredigten haben keinen Kurztext: nur Titel, Datum und Link, kein Auszug (die Predigten zitieren Koran und
 *   Hadith).
 * - Titel und Kurztexte enthalten keine Versangaben (z. B. „49:6“) und keine Anführungszeichen (keine Zitate).
 * Standardwert ist die leere Liste; der Seed bringt die Beispielinhalte (`drizzle/seeds/bereiche/dachverband.ts`).
 */

/** Arten der Einträge; Bezeichnungen unter `dachverband.arten` (messages/bereiche/dachverband.json). */
export const DACHVERBAND_ARTEN = ['hutba', 'kampagne', 'bildung', 'jugend', 'frauen', 'frauenjugend'] as const;
export type DachverbandArt = (typeof DACHVERBAND_ARTEN)[number];

/** Herkunft: aus dem Feed (darf beim Abgleich als ältester Eintrag wegfallen) oder von der Redaktion (bleibt immer). */
export const DACHVERBAND_HERKUENFTE = ['feed', 'redaktion'] as const;
export type DachverbandHerkunft = (typeof DACHVERBAND_HERKUENFTE)[number];

/** Höchstzahl der Einträge; der Abgleich hält sie ein, indem er die ältesten Feed-Einträge entfernt. */
export const DACHVERBAND_MAX = 60;

/** Kennung eines Eintrags (aus dem Adressteil der IGMG-Seite oder von der Verwaltung erzeugt). */
export const SCHLUESSEL_MUSTER = /^[a-z0-9-]{3,80}$/;

/**
 * Versangabe wie „49:6“ oder „2 : 255“ (G-06: nur, wenn die verlinkte Quelle sie nennt – hier nie). Eine Uhrzeit mit
 * „Uhr“ dahinter („19:30 Uhr“) ist keine; ohne „Uhr“ bleibt die Zahl gesperrt, weil sie sich nicht unterscheiden lässt.
 */
export const VERSANGABE = /\b\d{1,3}\s?:\s?\d{1,3}\b(?!\s?Uhr\b)/;
/** Anführungszeichen (Zitate gehören nicht in Titel und Kurztexte). Apostrophe (’) bleiben erlaubt. */
export const ZITATZEICHEN = /[„“”"«»‚]/;

/** Text ohne Versangabe und ohne Anführungszeichen. */
export function ohneZitat(text: string): boolean {
  return !VERSANGABE.test(text) && !ZITATZEICHEN.test(text);
}

type Texte = { de: string; tr?: string | undefined; en?: string | undefined };
const SPRACHEN = ['de', 'tr', 'en'] as const;
/** Sprachen eines mehrsprachigen Felds mit Text (für Fehler am genauen Feld, z. B. `titel.tr`). */
const texteVon = (m: Texte | undefined): [(typeof SPRACHEN)[number], string][] =>
  m ? SPRACHEN.flatMap((s) => (m[s]?.trim() ? [[s, m[s] ?? ''] as [(typeof SPRACHEN)[number], string]] : [])) : [];

/** Datum des Eintrags: Kalendertag JJJJ-MM-TT oder nur Monat JJJJ-MM (wenn die Quelle nur den Monat belegt, G-05). */
export const dachverbandDatum = z.union([datumIso, z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/)]);

export const dachverbandEintrag = z
  .object({
    schluessel: z.string().regex(SCHLUESSEL_MUSTER),
    art: z.enum(DACHVERBAND_ARTEN),
    datum: dachverbandDatum,
    titel: mehrsprachig(200),
    kurztext: mehrsprachigOptional(400).optional(),
    /** Seite bei der IGMG (deutsche Fassung); nur https und Hosts aus dem IGMG-Netzwerk */
    url: igmgUrl,
    urlTr: igmgUrl.optional(),
    urlEn: igmgUrl.optional(),
    sichtbar: z.boolean().default(true),
    /** Letzter Tag der Anzeige (inklusive); danach blendet die Seite den Eintrag aus */
    gueltigBis: datumIso.optional(),
    herkunft: z.enum(DACHVERBAND_HERKUENFTE).default('redaktion'),
  })
  .superRefine((e, ctx) => {
    for (const [sprache] of e.art === 'hutba' ? texteVon(e.kurztext) : [])
      ctx.addIssue({ code: 'custom', path: ['kurztext', sprache], message: 'hutbaOhneKurztext' });
    for (const feld of ['titel', 'kurztext'] as const)
      for (const [sprache, text] of texteVon(e[feld]))
        if (!ohneZitat(text)) ctx.addIssue({ code: 'custom', path: [feld, sprache], message: 'ohneZitat' });
  });
export type DachverbandEintrag = z.infer<typeof dachverbandEintrag>;

export const schema = z.object({
  eintraege: z
    .array(dachverbandEintrag)
    .max(DACHVERBAND_MAX)
    .superRefine((liste, ctx) => {
      const gesehen = new Set<string>();
      liste.forEach((e, i) => {
        if (gesehen.has(e.schluessel)) ctx.addIssue({ code: 'custom', path: [i, 'schluessel'], message: 'doppelt' });
        gesehen.add(e.schluessel);
      });
    })
    .default([]),
});

export type DachverbandInhalt = z.infer<typeof schema>;
