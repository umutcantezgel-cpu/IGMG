import { fehlendeKacheln } from '../abgleich/tokens';
import { LEKTIONS_ARTEN } from '../engine/xp';
import { SchluesselSchema } from '../ereignisse/typen';
import * as z from '../z';
import { type BildWortAntwort, BildWortSchema } from './bild_wort';
import { type DialogAntwort, DialogSchema } from './dialog';
import { type FallfrageAntwort, FallfrageSchema } from './fallfrage';
import { type FormenAntwort, FormenSchema } from './formen';
import { type FreiAntwort, FreiSchema } from './frei';
import { type GeschichteAntwort, GeschichteSchema } from './geschichte';
import { type GrammatikTippAntwort, GrammatikTippSchema } from './grammatik_tipp';
import { ab, basis, eindeutig, InhaltSchema, liste, Loesungen, mitOptionen, Optionen, roh, SpracheSchema, text } from './grundlagen';
import { type HarakatAntwort, HarakatSchema } from './harakat';
import type { ImplementierterTyp } from './hilfen';
import { type HoerenSchreibenAntwort, HoerenSchreibenSchema } from './hoeren_schreiben';
import { type HoerenWaehlenAntwort, HoerenWaehlenSchema } from './hoeren_waehlen';
import { type KoranWortAntwort, KoranWortSchema } from './koran_wort';
import { type LesenFragenAntwort, LesenFragenSchema } from './lesen_fragen';
import { type LueckeAntwort, LueckeSchema } from './luecke';
import { type MinimalpaareAntwort, MinimalpaareSchema } from './minimalpaare';
import { type ReihenfolgeAntwort, ReihenfolgeSchema } from './reihenfolge';
import { type SatzbauAntwort, SatzbauSchema } from './satzbau';
import { type SchreibenAntwort, SchreibenSchema } from './schreiben';
import { type SchriftArAntwort, SchriftArSchema } from './schrift_ar';
import { type SchriftLateinAntwort, SchriftLateinSchema } from './schrift_latein';
import { type SchriftTrAntwort, SchriftTrSchema } from './schrift_tr';
import { type SprechenAntwort, SprechenSchema } from './sprechen';
import { type WahrFalschAntwort, WahrFalschSchema } from './wahr_falsch';
import { type ZuordnenAntwort, ZuordnenSchema } from './zuordnen';

/**
 * Aufgaben und Lektionen der Lern-App (PLAN §4, ADR 0039 Nr. 1). Zod-Union (`zod/mini`, `../z.ts`) über alle Übungstypen aus §4:
 * L1 implementiert `auswahl`, `wortbank` und `paare` (Bewertung in auswahl.ts, wortbank.ts, paare.ts); L2-01 `bild_wort`, `frei`,
 * `hoeren_waehlen`, `hoeren_schreiben`, `minimalpaare`, `luecke`, `satzbau`, `formen` und `harakat` – je Typ eine Datei mit
 * der Zod-Nutzlast (`<typ>.ts`, gemeinsame Bausteine in `grundlagen.ts`) und eine ohne Zod mit Bewertung und reinen
 * Hilfen (`auswertung/<typ>.ts`, nur in den Übungs-Chunks geladen; gemeinsame Hilfen in `hilfen.ts`). L2-03 ergänzt den
 * Wissenskurs (`wahr_falsch`, `zuordnen`, `reihenfolge`, `fallfrage`; gemeinsame Felder in `wissen.ts`) und `koran_wort` nach
 * demselben Muster; ihre Sichtbarkeit entscheidet nur `freigabe.ts` (zwei Freigaben). L2-02 bringt `dialog`, `geschichte`,
 * `lesen_fragen`, `grammatik_tipp`, die Schrift-Vorkurse (`schrift_ar`, `schrift_tr`, `schrift_latein`), `sprechen` und
 * `schreiben` (Zod und Bewertung je Typ in `<typ>.ts`). Seit der Zusammenführung von L2 sind alle Typen aus §4 spielbar.
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

// ——— L2-02: implementiert (je Typ eine Datei mit Zod und Bewertung) ———

/** Übungstypen aus L2-02 (PLAN §4, §4.2–§4.4): Zod je Typ in `aufgaben/<typ>.ts`. */
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
  ...Object.values(L2_TYPEN),
  ...Object.values(L2_02),
  ...Object.values(WISSEN_TYPEN),
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
  ...Object.keys(L2_02),
  ...Object.keys(WISSEN_TYPEN),
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
  | DialogAntwort
  | GeschichteAntwort
  | LesenFragenAntwort
  | GrammatikTippAntwort
  | SchriftArAntwort
  | SchriftTrAntwort
  | SchriftLateinAntwort
  | SprechenAntwort
  | SchreibenAntwort
  | WahrFalschAntwort
  | ZuordnenAntwort
  | ReihenfolgeAntwort
  | FallfrageAntwort
  | KoranWortAntwort;
export type AntwortVon<T extends ImplementierterTyp> = Extract<Antwort, { typ: T }>;
