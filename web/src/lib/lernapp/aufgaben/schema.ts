import { SPRACHEN } from '../kurse';
import type { HinweisSchluessel, Lexikon, Urteil } from '../abgleich';
import { fehlendeKacheln } from '../abgleich/tokens';
import { LEKTIONS_ARTEN } from '../engine/xp';
import { SchluesselSchema } from '../ereignisse/typen';
import * as z from '../z';

/**
 * Aufgaben und Lektionen der Lern-App (PLAN §4, ADR 0039 Nr. 1). Zod-Union (`zod/mini`, `../z.ts`) über alle Übungstypen aus §4 als Gerüst:
 * L1 implementiert `auswahl`, `wortbank` und `paare` (Bewertung in auswahl.ts, wortbank.ts, paare.ts), L2 die übrigen.
 *
 * ## Lektionsformat (Eingabe des Spielers `<Spieler lektion={…} />`)
 *
 * Eine Lektion ist ein Ausschnitt aus dem Einheitenpaket einer Richtung (ADR 0039: kanonisches JSON je Richtung und
 * Einheit, adressiert über den Inhalts-Hash). Der Paketbau (L1-05) legt je Lektion genau dieses Objekt ab:
 *
 * ```json
 * {
 *   "schluessel": "tr-aus-de.a1.e01.l01",
 *   "kurs": "tr-aus-de",
 *   "art": "lektion",
 *   "zielsprache": "tr",
 *   "ausgangssprache": "de",
 *   "titel": "[Titel der Lektion]",
 *   "aufgaben": [
 *     { "typ": "auswahl", "schluessel": "tr.a1.e01.a001", "karten": ["tr.a1.l0001"], "anweisung": "waehleUebersetzung",
 *       "vorgabe": { "text": "Wasser", "sprache": "de" },
 *       "optionen": [{ "text": "su", "sprache": "tr" }, { "text": "ekmek", "sprache": "tr" }], "richtig": 0 },
 *     { "typ": "wortbank", "schluessel": "tr.a1.e01.a002", "anweisung": "uebersetze",
 *       "vorgabe": { "text": "Ich trinke Wasser.", "sprache": "de" }, "sprache": "tr",
 *       "loesungen": ["Su içiyorum.", "Ben su içiyorum."], "kacheln": ["Su", "içiyorum", "Ben", "ekmek"] },
 *     { "typ": "paare", "schluessel": "tr.a1.e01.a003", "anweisung": "findePaare",
 *       "paare": [{ "links": { "text": "su", "sprache": "tr" }, "rechts": { "text": "Wasser", "sprache": "de" }, "karte": "tr.a1.l0001" },
 *                 { "links": { "text": "ekmek", "sprache": "tr" }, "rechts": { "text": "Brot", "sprache": "de" }, "karte": "tr.a1.l0002" }] }
 *   ],
 *   "lexikon": ["su", "ekmek", "içiyorum"]
 * }
 * ```
 *
 * - Jeder Text trägt seine Sprache (`lang`/`dir` in der Anzeige); Audio-Verweise zeigen in ein Bündel `.lpa`.
 * - `karten` nennt die Wiederholungskarten (Lemma oder Satz), die die Aufgabe bewertet; bei `paare` je Paar.
 * - `loesungen[0]` ist die Hauptlösung; weitere sind angenommene Varianten (der Abgleich rät keine Morphologie).
 * - `lexikon`: gültige Kurswörter der Zielsprache für den Lexikonschutz des Tippfehler-Abgleichs.
 * - Quelle, Lizenz und Namensnennung je Eintrag stehen im Einheitenpaket (ADR 0039 Nr. 9), nicht in der Lektion.
 */

export const SpracheSchema = z.enum(SPRACHEN);

/** Verweis auf einen Clip im Audio-Bündel (ADR 0039 Nr. 3, Fortschreibung S4/S5). */
export const AudioSchema = z.strictObject({
  buendel: z.string().check(z.minLength(1), z.maxLength(200)),
  versatz: z.int().check(z.minimum(0)),
  laenge: z.int().check(z.minimum(1), z.maximum(16_777_216)),
  dauerMs: z.optional(z.int().check(z.minimum(1))),
});

/** Text mit Länge (getrimmt, dann geprüft). */
const text = (max: number, min = 1) => z.string().check(z.trim(), z.minLength(min), z.maxLength(max));
/** Ungetrimmter Text mit Länge. */
const roh = (max: number, min = 1) => z.string().check(z.minLength(min), z.maxLength(max));
/** Liste mit Länge. */
const liste = <T extends z.ZodMiniType>(e: T, min: number, max: number) => z.array(e).check(z.minLength(min), z.maxLength(max));
/** Ganzzahl ≥ min. */
const ab = (min: number) => z.int().check(z.minimum(min));

/** Ein Text mit Sprache (und optional Audio). */
export const InhaltSchema = z.strictObject({
  text: text(600),
  sprache: SpracheSchema,
  audio: z.optional(AudioSchema),
});
export type Inhalt = z.infer<typeof InhaltSchema>;

const basis = {
  schluessel: SchluesselSchema,
  karten: z.optional(z.array(SchluesselSchema).check(z.maxLength(12))),
};

const Loesungen = liste(text(600), 1, 30);
const Optionen = liste(InhaltSchema, 2, 6);

const eindeutig = (texte: readonly string[]) => new Set(texte.map((t) => t.trim().toLocaleLowerCase())).size === texte.length;

/** Index der richtigen Option liegt im Bereich, Optionen sind verschieden. */
function mitOptionen<T extends { optionen: { text: string }[]; richtig: number }>(a: T, ctx: z.RefinementCtx<T>) {
  if (a.richtig >= a.optionen.length) ctx.addIssue({ code: 'custom', message: 'richtig außerhalb der Optionen', path: ['richtig'] });
  if (!eindeutig(a.optionen.map((o) => o.text))) ctx.addIssue({ code: 'custom', message: 'Optionen doppelt', path: ['optionen'] });
}

// ——— L1: implementiert ———

export const AuswahlSchema = z
  .strictObject({
    ...basis,
    typ: z.literal('auswahl'),
    anweisung: z.enum(['waehleUebersetzung', 'waehleWort', 'waehleBedeutung', 'waehleAntwort']),
    vorgabe: z.optional(InhaltSchema),
    optionen: Optionen,
    richtig: ab(0),
  })
  .check(z.superRefine(mitOptionen));

export const WortbankSchema = z
  .strictObject({
    ...basis,
    typ: z.literal('wortbank'),
    anweisung: z.enum(['uebersetze', 'schreibeGehoertes']),
    vorgabe: InhaltSchema,
    /** Sprache der Antwort */
    sprache: SpracheSchema,
    loesungen: Loesungen,
    /** Kacheltexte: die Wörter der Hauptlösung und Ablenker (Reihenfolge des Inhalts, gemischt wird in der Anzeige) */
    kacheln: liste(text(60), 2, 24),
  })
  .check(
    z.superRefine((a, ctx) => {
      const fehlt = fehlendeKacheln(a.loesungen[0] ?? '', a.kacheln, a.sprache);
      if (fehlt.length) ctx.addIssue({ code: 'custom', message: `Kacheln fehlen: ${fehlt.join(' ')}`, path: ['kacheln'] });
    }),
  );

export const PaarSchema = z.strictObject({ links: InhaltSchema, rechts: InhaltSchema, karte: z.optional(SchluesselSchema) });

export const PaareSchema = z
  .strictObject({
    ...basis,
    typ: z.literal('paare'),
    anweisung: z.enum(['findePaare']),
    paare: liste(PaarSchema, 2, 6),
  })
  .check(
    z.superRefine((a, ctx) => {
      if (!eindeutig(a.paare.map((p) => p.links.text)) || !eindeutig(a.paare.map((p) => p.rechts.text)))
        ctx.addIssue({ code: 'custom', message: 'Paare mit gleichem Text', path: ['paare'] });
    }),
  );

// ——— L2: Gerüst (Felder nach PLAN §4; Bewertung und Anzeige folgen in L2) ———

const MitAudio = z.extend(InhaltSchema, { audio: AudioSchema });
const Frage = z.strictObject({ frage: InhaltSchema, optionen: Optionen, richtig: ab(0) }).check(z.superRefine(mitOptionen));

export const GERUEST = {
  bild_wort: z.strictObject({
    ...basis,
    typ: z.literal('bild_wort'),
    symbol: roh(200),
    optionen: Optionen,
    richtig: ab(0),
  }),
  frei: z.strictObject({ ...basis, typ: z.literal('frei'), vorgabe: InhaltSchema, sprache: SpracheSchema, loesungen: Loesungen }),
  hoeren_waehlen: z.strictObject({
    ...basis,
    typ: z.literal('hoeren_waehlen'),
    hoeren: MitAudio,
    optionen: Optionen,
    richtig: ab(0),
  }),
  hoeren_schreiben: z.strictObject({
    ...basis,
    typ: z.literal('hoeren_schreiben'),
    hoeren: MitAudio,
    sprache: SpracheSchema,
    loesungen: Loesungen,
  }),
  minimalpaare: z.strictObject({ ...basis, typ: z.literal('minimalpaare'), hoeren: MitAudio, optionen: Optionen, richtig: ab(0) }),
  luecke: z.strictObject({
    ...basis,
    typ: z.literal('luecke'),
    vor: roh(600, 0),
    nach: roh(600, 0),
    sprache: SpracheSchema,
    optionen: z.optional(z.array(roh(60)).check(z.maxLength(6))),
    loesungen: Loesungen,
  }),
  satzbau: z.strictObject({
    ...basis,
    typ: z.literal('satzbau'),
    sprache: SpracheSchema,
    kacheln: liste(roh(60), 2, 24),
    loesungen: Loesungen,
  }),
  formen: z.strictObject({
    ...basis,
    typ: z.literal('formen'),
    sprache: SpracheSchema,
    zeilen: liste(roh(60), 1, 12),
    spalten: liste(roh(60), 1, 8),
    zellen: z
      .array(z.strictObject({ zeile: ab(0), spalte: ab(0), loesungen: Loesungen, vorgabe: z.optional(z.boolean()) }))
      .check(z.minLength(1)),
  }),
  harakat: z.strictObject({ ...basis, typ: z.literal('harakat'), optionen: Optionen, richtig: ab(0) }),
  dialog: z.strictObject({
    ...basis,
    typ: z.literal('dialog'),
    verlauf: liste(z.strictObject({ sprecher: roh(40), zeile: InhaltSchema }), 1, 20),
    optionen: Optionen,
    richtig: ab(0),
  }),
  geschichte: z.strictObject({
    ...basis,
    typ: z.literal('geschichte'),
    zeilen: liste(z.strictObject({ sprecher: z.optional(roh(40, 0)), zeile: InhaltSchema }), 1, 60),
    fragen: z.array(Frage).check(z.maxLength(10)),
  }),
  lesen_fragen: z.strictObject({
    ...basis,
    typ: z.literal('lesen_fragen'),
    text: liste(InhaltSchema, 1, 40),
    fragen: liste(Frage, 1, 10),
  }),
  grammatik_tipp: z.strictObject({
    ...basis,
    typ: z.literal('grammatik_tipp'),
    titel: roh(200),
    abschnitte: z
      .array(
        z.strictObject({
          ueberschrift: z.optional(roh(200, 0)),
          text: roh(2000),
          beispiele: z.optional(z.array(InhaltSchema).check(z.maxLength(10))),
        }),
      )
      .check(z.minLength(1)),
  }),
  schrift_ar: z.strictObject({
    ...basis,
    typ: z.literal('schrift_ar'),
    art: z.enum(['erkennen', 'zuordnen', 'lesen', 'nachspuren']),
    ziel: z.string().check(z.regex(/^[a-z]+$/)),
  }),
  schrift_tr: z.strictObject({
    ...basis,
    typ: z.literal('schrift_tr'),
    optionen: Optionen,
    richtig: ab(0),
    hoeren: z.optional(MitAudio),
  }),
  schrift_latein: z.strictObject({
    ...basis,
    typ: z.literal('schrift_latein'),
    optionen: Optionen,
    richtig: ab(0),
    hoeren: z.optional(MitAudio),
  }),
  sprechen: z.strictObject({ ...basis, typ: z.literal('sprechen'), vorgabe: InhaltSchema, loesungen: Loesungen }),
  schreiben: z.strictObject({
    ...basis,
    typ: z.literal('schreiben'),
    aufgabe: InhaltSchema,
    pruefliste: liste(roh(200), 1, 12),
    muster: InhaltSchema,
    woerter: z.optional(z.strictObject({ min: ab(0), max: ab(1) })),
  }),
  /** Koran-Arabisch: nur Verweise (`sure:vers:wort`) und freigegebene Bedeutungen über Kennungen – kein Text (ADR 0040). */
  koran_wort: z.strictObject({
    ...basis,
    typ: z.literal('koran_wort'),
    art: z.enum(['bedeutung', 'wurzel']),
    verweis: z.string().check(z.regex(/^\d{1,3}:\d{1,3}:\d{1,3}$/)),
    optionen: liste(SchluesselSchema, 2, 6),
    richtig: ab(0),
  }),
  // Wissenskurs (nur Deutsch; jede Aufgabe aus einer Aussage, zwei Freigaben)
  wahr_falsch: z.strictObject({
    ...basis,
    typ: z.literal('wahr_falsch'),
    aussage: InhaltSchema,
    wahr: z.boolean(),
    begruendung: roh(1000),
  }),
  zuordnen: z.strictObject({
    ...basis,
    typ: z.literal('zuordnen'),
    kategorien: liste(roh(80), 2, 6),
    eintraege: liste(z.strictObject({ text: roh(300), kategorie: ab(0) }), 2, 12),
  }),
  reihenfolge: z.strictObject({ ...basis, typ: z.literal('reihenfolge'), schritte: liste(roh(300), 2, 12) }),
  fallfrage: z.strictObject({ ...basis, typ: z.literal('fallfrage'), fall: InhaltSchema, optionen: Optionen, richtig: ab(0) }),
} as const;

export const AufgabeSchema = z.discriminatedUnion('typ', [AuswahlSchema, WortbankSchema, PaareSchema, ...Object.values(GERUEST)]);

export type Aufgabe = z.infer<typeof AufgabeSchema>;
export type AufgabenTyp = Aufgabe['typ'];
export type AufgabeVon<T extends AufgabenTyp> = Extract<Aufgabe, { typ: T }>;
export type AuswahlAufgabe = AufgabeVon<'auswahl'>;
export type WortbankAufgabe = AufgabeVon<'wortbank'>;
export type PaareAufgabe = AufgabeVon<'paare'>;

/** Alle Typen aus PLAN §4 (einschließlich Wissenskurs). */
export const AUFGABEN_TYPEN = ['auswahl', 'wortbank', 'paare', ...Object.keys(GERUEST)] as AufgabenTyp[];

/** In L1 spielbar (Bewertung und Anzeige vorhanden). */
export const IMPLEMENTIERT = ['auswahl', 'wortbank', 'paare'] as const satisfies readonly AufgabenTyp[];
export type ImplementierterTyp = (typeof IMPLEMENTIERT)[number];
export const istImplementiert = (typ: AufgabenTyp): typ is ImplementierterTyp => (IMPLEMENTIERT as readonly string[]).includes(typ);

export const LektionSchema = z
  .strictObject({
    schluessel: SchluesselSchema,
    kurs: SchluesselSchema,
    art: z.enum(LEKTIONS_ARTEN),
    zielsprache: SpracheSchema,
    ausgangssprache: SpracheSchema,
    titel: z.optional(roh(200, 0)),
    aufgaben: liste(AufgabeSchema, 1, 40),
    lexikon: z.optional(z.array(roh(80)).check(z.maxLength(10_000))),
  })
  .check(
    z.superRefine((l, ctx) => {
      if (new Set(l.aufgaben.map((a) => a.schluessel)).size !== l.aufgaben.length)
        ctx.addIssue({ code: 'custom', message: 'Aufgabenschlüssel doppelt', path: ['aufgaben'] });
    }),
  );

export type Lektion = z.infer<typeof LektionSchema>;

/** Antworten der implementierten Typen (Indizes beziehen sich auf die Reihenfolge des Inhalts, nicht der Anzeige). */
export type Antwort =
  | { typ: 'auswahl'; wahl: number }
  | { typ: 'wortbank'; kacheln: number[] }
  | { typ: 'paare'; versuche: Array<readonly [links: number, rechts: number]> };
export type AntwortVon<T extends ImplementierterTyp> = Extract<Antwort, { typ: T }>;

export type KartenUrteil = { karte: string; urteil: Urteil };

export type Auswertung = {
  urteil: Urteil;
  hinweise: HinweisSchluessel[];
  /** richtige Lösung zur Anzeige (bei `tippfehler` und `falsch`; bei `richtig` die getroffene Lösung) */
  loesung: string | null;
  karten: KartenUrteil[];
};

export type BewertungsKontext = { lexikon?: Lexikon };

/** Alle Karten einer Aufgabe mit demselben Urteil. */
export const kartenMit = (karten: readonly string[] | undefined, urteil: Urteil): KartenUrteil[] =>
  (karten ?? []).map((karte) => ({ karte, urteil }));
