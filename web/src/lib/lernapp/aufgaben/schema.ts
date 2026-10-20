import { fehlendeKacheln } from '../abgleich/tokens';
import { LEKTIONS_ARTEN } from '../engine/xp';
import { SchluesselSchema } from '../ereignisse/typen';
import * as z from '../z';
import { type BildWortAntwort, BildWortSchema } from './bild_wort';
import { type FallfrageAntwort, FallfrageSchema } from './fallfrage';
import { type FormenAntwort, FormenSchema } from './formen';
import { type FreiAntwort, FreiSchema } from './frei';
import {
  ab,
  AudioSchema,
  basis,
  eindeutig,
  InhaltSchema,
  liste,
  Loesungen,
  mitOptionen,
  Optionen,
  roh,
  SpracheSchema,
  text,
} from './grundlagen';
import { type HarakatAntwort, HarakatSchema } from './harakat';
import type { ImplementierterTyp } from './hilfen';
import { type HoerenSchreibenAntwort, HoerenSchreibenSchema } from './hoeren_schreiben';
import { type HoerenWaehlenAntwort, HoerenWaehlenSchema } from './hoeren_waehlen';
import { type KoranWortAntwort, KoranWortSchema } from './koran_wort';
import { type LueckeAntwort, LueckeSchema } from './luecke';
import { type MinimalpaareAntwort, MinimalpaareSchema } from './minimalpaare';
import { type ReihenfolgeAntwort, ReihenfolgeSchema } from './reihenfolge';
import { type SatzbauAntwort, SatzbauSchema } from './satzbau';
import { type WahrFalschAntwort, WahrFalschSchema } from './wahr_falsch';
import { type ZuordnenAntwort, ZuordnenSchema } from './zuordnen';

/**
 * Aufgaben und Lektionen der Lern-App (PLAN §4, ADR 0039 Nr. 1). Zod-Union (`zod/mini`, `../z.ts`) über alle Übungstypen aus §4 als Gerüst:
 * L1 implementiert `auswahl`, `wortbank` und `paare` (Bewertung in auswahl.ts, wortbank.ts, paare.ts); L2-01 `bild_wort`, `frei`,
 * `hoeren_waehlen`, `hoeren_schreiben`, `minimalpaare`, `luecke`, `satzbau`, `formen` und `harakat` – je Typ eine Datei mit
 * der Zod-Nutzlast (`<typ>.ts`, gemeinsame Bausteine in `grundlagen.ts`) und eine ohne Zod mit Bewertung und reinen
 * Hilfen (`auswertung/<typ>.ts`, nur in den Übungs-Chunks geladen; gemeinsame Hilfen in `hilfen.ts`). L2-03 ergänzt den
 * Wissenskurs (`wahr_falsch`, `zuordnen`, `reihenfolge`, `fallfrage`; gemeinsame Felder in `wissen.ts`) und `koran_wort` nach
 * demselben Muster; ihre Sichtbarkeit entscheidet nur `freigabe.ts` (zwei Freigaben).
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

export { AudioSchema, type Inhalt, InhaltSchema, SpracheSchema } from './grundlagen';
export {
  type Auswertung,
  type Bewerter,
  type BewertungsKontext,
  IMPLEMENTIERT,
  type ImplementierterTyp,
  istImplementiert,
  type KartenUrteil,
  kartenMit,
} from './hilfen';

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

// ——— L2-01: implementiert (je Typ eine Datei) ———

/** Übungstypen aus L2-01 mit eigener Datei (Nutzlast; Bewertung und Hilfen in `auswertung/`). */
export const L2_TYPEN = {
  bild_wort: BildWortSchema,
  frei: FreiSchema,
  hoeren_waehlen: HoerenWaehlenSchema,
  hoeren_schreiben: HoerenSchreibenSchema,
  minimalpaare: MinimalpaareSchema,
  luecke: LueckeSchema,
  satzbau: SatzbauSchema,
  formen: FormenSchema,
  harakat: HarakatSchema,
} as const;

// ——— L2-03: Wissenskurs und Koran-Arabisch (je Typ eine Datei; sichtbar nur mit zwei Freigaben, `freigabe.ts`) ———

/** Übungstypen aus L2-03 mit eigener Datei (Nutzlast; Bewertung und Hilfen in `auswertung/`). */
export const WISSEN_TYPEN = {
  wahr_falsch: WahrFalschSchema,
  zuordnen: ZuordnenSchema,
  reihenfolge: ReihenfolgeSchema,
  fallfrage: FallfrageSchema,
  koran_wort: KoranWortSchema,
} as const;

// ——— L2: Gerüst (Felder nach PLAN §4; Bewertung und Anzeige folgen in L2-02) ———

const MitAudio = z.extend(InhaltSchema, { audio: AudioSchema });
const Frage = z.strictObject({ frage: InhaltSchema, optionen: Optionen, richtig: ab(0) }).check(z.superRefine(mitOptionen));

export const GERUEST = {
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
} as const;

export const AufgabeSchema = z.discriminatedUnion('typ', [
  AuswahlSchema,
  WortbankSchema,
  PaareSchema,
  ...Object.values(L2_TYPEN),
  ...Object.values(WISSEN_TYPEN),
  ...Object.values(GERUEST),
]);

export type Aufgabe = z.infer<typeof AufgabeSchema>;
export type AufgabenTyp = Aufgabe['typ'];
export type AufgabeVon<T extends AufgabenTyp> = Extract<Aufgabe, { typ: T }>;
export type AuswahlAufgabe = AufgabeVon<'auswahl'>;
export type WortbankAufgabe = AufgabeVon<'wortbank'>;
export type PaareAufgabe = AufgabeVon<'paare'>;

/** Alle Typen aus PLAN §4 (einschließlich Wissenskurs). */
export const AUFGABEN_TYPEN = [
  'auswahl',
  'wortbank',
  'paare',
  ...Object.keys(L2_TYPEN),
  ...Object.keys(WISSEN_TYPEN),
  ...Object.keys(GERUEST),
] as AufgabenTyp[];

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
  | BildWortAntwort
  | FreiAntwort
  | HoerenWaehlenAntwort
  | HoerenSchreibenAntwort
  | MinimalpaareAntwort
  | LueckeAntwort
  | SatzbauAntwort
  | FormenAntwort
  | HarakatAntwort
  | WahrFalschAntwort
  | ZuordnenAntwort
  | ReihenfolgeAntwort
  | FallfrageAntwort
  | KoranWortAntwort;
export type AntwortVon<T extends ImplementierterTyp> = Extract<Antwort, { typ: T }>;
