import type { HinweisSchluessel, Lexikon, Urteil } from '../abgleich';
import { fehlendeKacheln } from '../abgleich/tokens';
import type { Note } from '../bewertung';
import { LEKTIONS_ARTEN } from '../engine/xp';
import { SchluesselSchema } from '../ereignisse/typen';
import * as z from '../z';
import {
  ab,
  basis,
  eindeutig,
  InhaltSchema,
  type KartenUrteil,
  liste,
  Loesungen,
  MitAudio,
  mitOptionen,
  Optionen,
  roh,
  SpracheSchema,
  text,
} from './bausteine';
import { DialogSchema, type DialogAntwort } from './dialog';
import { GeschichteSchema, type GeschichteAntwort } from './geschichte';
import { GrammatikTippSchema, type GrammatikTippAntwort } from './grammatik_tipp';
import { LesenFragenSchema, type LesenFragenAntwort } from './lesen_fragen';
import { SchreibenSchema, type SchreibenAntwort } from './schreiben';
import { SchriftArSchema, type SchriftArAntwort } from './schrift_ar';
import { SchriftLateinSchema, type SchriftLateinAntwort } from './schrift_latein';
import { SchriftTrSchema, type SchriftTrAntwort } from './schrift_tr';
import { SprechenSchema, type SprechenAntwort } from './sprechen';

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

/** Bausteine liegen in `bausteine.ts` (ohne Importkreis mit den Typ-Dateien); hier für bestehende Aufrufer weitergereicht. */
export { AudioSchema, type Inhalt, InhaltSchema, kartenMit, type KartenUrteil, SpracheSchema } from './bausteine';

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

/** L2-02 (PLAN §4, §4.2–§4.4): Zod je Typ in `aufgaben/<typ>.ts`. */
export const L2_02 = {
  dialog: DialogSchema,
  geschichte: GeschichteSchema,
  lesen_fragen: LesenFragenSchema,
  grammatik_tipp: GrammatikTippSchema,
  schrift_ar: SchriftArSchema,
  schrift_tr: SchriftTrSchema,
  schrift_latein: SchriftLateinSchema,
  sprechen: SprechenSchema,
  schreiben: SchreibenSchema,
} as const;

export const AufgabeSchema = z.discriminatedUnion('typ', [
  AuswahlSchema,
  WortbankSchema,
  PaareSchema,
  ...Object.values(L2_02),
  ...Object.values(GERUEST),
]);

export type Aufgabe = z.infer<typeof AufgabeSchema>;
export type AufgabenTyp = Aufgabe['typ'];
export type AufgabeVon<T extends AufgabenTyp> = Extract<Aufgabe, { typ: T }>;
export type AuswahlAufgabe = AufgabeVon<'auswahl'>;
export type WortbankAufgabe = AufgabeVon<'wortbank'>;
export type PaareAufgabe = AufgabeVon<'paare'>;

/** Alle Typen aus PLAN §4 (einschließlich Wissenskurs). */
export const AUFGABEN_TYPEN = ['auswahl', 'wortbank', 'paare', ...Object.keys(L2_02), ...Object.keys(GERUEST)] as AufgabenTyp[];

/** Spielbar (Bewertung und Anzeige vorhanden): L1 und L2-02. */
export const IMPLEMENTIERT = [
  'auswahl',
  'wortbank',
  'paare',
  'dialog',
  'geschichte',
  'lesen_fragen',
  'grammatik_tipp',
  'schrift_ar',
  'schrift_tr',
  'schrift_latein',
  'sprechen',
  'schreiben',
] as const satisfies readonly AufgabenTyp[];
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
  | { typ: 'paare'; versuche: Array<readonly [links: number, rechts: number]> }
  | DialogAntwort
  | GeschichteAntwort
  | LesenFragenAntwort
  | GrammatikTippAntwort
  | SchriftArAntwort
  | SchriftTrAntwort
  | SchriftLateinAntwort
  | SprechenAntwort
  | SchreibenAntwort;
export type AntwortVon<T extends ImplementierterTyp> = Extract<Antwort, { typ: T }>;

export type Auswertung = {
  urteil: Urteil;
  hinweise: HinweisSchluessel[];
  /** richtige Lösung zur Anzeige (bei `tippfehler` und `falsch`; bei `richtig` die getroffene Lösung) */
  loesung: string | null;
  karten: KartenUrteil[];
  /**
   * Selbstbewertung (nur `sprechen` und `schreiben`, ADR 0042 Nr. 6, ADR 0038 Nr. 3): Note aller Karten der Aufgabe;
   * das Ereignis `bewertung` trägt dann `selbst: true`.
   */
  selbst?: Note;
};

export type BewertungsKontext = { lexikon?: Lexikon };
