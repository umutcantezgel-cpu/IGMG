import { LektionSchema } from '../aufgaben/schema';
import { KURS_SLUGS, KURSE, PAKET_KURSE, SPRACHEN, STUFEN } from '../kurse';
import * as z from '../z';
import { INHALT_LIZENZ, PAKET_FORMAT, VERZEICHNIS_FORMAT } from './kennungen';

/**
 * Formate der Auslieferung (ADR 0039 Nr. 1/2): Kursverzeichnis je Kurs-Slug und Einheitenpaket je Richtung und Einheit.
 * Server (Paketbau, Routen) und Client (lokal/pakete.ts) prüfen gegen dieselben Schemas.
 *
 * - Adresse eines Pakets: `/lern-app/pakete/<kurs>/<einheit>/<hash>`, `hash` = SHA-256 der ausgelieferten Bytes (kanonisches
 *   JSON, UTF-8). Unter einem Hash ändert sich nichts; ein neuer Stand bekommt eine neue Adresse.
 * - Das Verzeichnis `/lern-app/pakete/<kurs>` nennt je Einheit Hash und Größe (Bytes) des Pakets und des Audio-Bündels,
 *   damit der Client den Ring „offline speichern“ nach Bytes zeichnet (B-27).
 * - Quelle, Lizenz und Namensnennung stehen je Eintrag im Paket (`eintraege`), auch offline lesbar (ADR 0039 Nr. 9).
 * - Wissenskurs (`kurs: 'islam'`, Inhalt nur Deutsch: Ziel- und Ausgangssprache `de`): dazu je Lektion der Prüfvermerk ohne
 *   Namen (Datum, an dem alle Bausteine der Lektion zwei Freigaben hatten), „für Kinder geeignet“ und alle Aussagen der Lektion
 *   mit ihrer Quellenzeile (KERN 4.0 §2.3 „Kennzeichnung“, PLAN §6.7 Nr. 7). Keine Einträge, keine Tipps, kein Audio.
 * - Vorschau des Wissenskurses (Schalter `lernapp_wissen_vorschau`, L3-E22): Eine Lektion ohne zwei Freigaben trägt statt des
 *   Prüfvermerks `entwurf: true` (nie beides); ein Paket mit mindestens einer solchen Lektion trägt `vorschau: true`, ebenso
 *   seine Einheit im Verzeichnis. Ohne Vorschau fehlen beide Felder – das Paket ist byte-gleich wie zuvor.
 */

export { INHALT_LIZENZ, PAKET_FORMAT, paketAdresse, VERZEICHNIS_FORMAT, verzeichnisAdresse } from './kennungen';

const LernText = z.strictObject({ de: z.optional(z.string()), tr: z.optional(z.string()), ar: z.optional(z.string()) });
const Hash = z.string().check(z.regex(/^[0-9a-f]{64}$/));
const Anzahl = (min: number) => z.int().check(z.minimum(min));

/** Herkunft je Eintrag (Zieltext `<schluessel>` bzw. Übersetzung `<schluessel>@<ausgang>`). */
export const EintragHerkunftSchema = z.strictObject({
  text: z.string(),
  sprache: z.enum(SPRACHEN),
  quelle: z.string(),
  lizenz: z.string(),
  namensnennung: z.optional(z.string()),
  /** Stimme des Clips (`tts:<modell>@<sha>`, `mensch:<id>`, im Testkurs `test:ton`) */
  stimme: z.optional(z.string()),
  /** noch nicht von Muttersprachlern geprüft (ADR 0041 Nr. 8) */
  hinweis: z.optional(z.literal(true)),
});
export type EintragHerkunft = z.infer<typeof EintragHerkunftSchema>;

/** Verweis auf ein Audio-Bündel mit seiner Größe (Ring „offline speichern“ nach Bytes). */
export const BuendelVerweisSchema = z.strictObject({ adresse: z.string().check(z.regex(/^\/lern-app\/audio\//)), bytes: Anzahl(1) });
export type BuendelVerweis = z.infer<typeof BuendelVerweisSchema>;

export const PaketTippSchema = z.strictObject({
  schluessel: z.string(),
  titel: z.optional(z.string()),
  inhalt: z.looseObject({ type: z.literal('doc') }),
});

/** Aussage einer Lektion des Wissenskurses mit ihrer Quellenzeile (Werk, Kapitel, Ausgabe, Band, Seite – aus den Belegen). */
export const WissensAussageSchema = z.strictObject({
  schluessel: z.string(),
  text: z.string().check(z.minLength(1), z.maxLength(800)),
  quelle: z.string().check(z.minLength(1), z.maxLength(1200)),
  /** Thema als strittig ausgewiesen (ADR 0040 Nr. 4) */
  strittig: z.optional(z.literal(true)),
});

const WissensLektionKennzeichnung = {
  kinderGeeignet: z.boolean(),
  aussagen: z.array(WissensAussageSchema).check(z.minLength(1), z.maxLength(40)),
};

/**
 * Prüfvermerk und Kennzeichnung einer Lektion des Wissenskurses (ohne Namen der Prüfenden, LM-20): entweder geprüft
 * (`geprueftAm`) oder – nur mit der Vorschau (L3-E22) – ein ungeprüfter Entwurf (`entwurf: true`), nie beides.
 */
export const WissensLektionSchema = z.union([
  z.strictObject({
    /** Tag (UTC), an dem der letzte Baustein der Lektion seine zweite Freigabe zum aktuellen Hash bekam */
    geprueftAm: z.string().check(z.regex(/^\d{4}-\d{2}-\d{2}$/)),
    ...WissensLektionKennzeichnung,
  }),
  z.strictObject({
    /** Entwurf zur Prüfung: noch nicht von zwei Gelehrten geprüft (Vorschau, L3-E22) */
    entwurf: z.literal(true),
    ...WissensLektionKennzeichnung,
  }),
]);
export type WissensLektionVermerk = z.infer<typeof WissensLektionSchema>;

const PaketGrundSchema = z.strictObject({
  format: z.literal(PAKET_FORMAT),
  version: z.literal(1),
  kurs: z.enum(PAKET_KURSE),
  zielsprache: z.enum(SPRACHEN),
  ausgangssprache: z.enum(SPRACHEN),
  einheit: z.strictObject({
    schluessel: z.string(),
    stufe: z.enum(STUFEN),
    reihenfolge: z.int(),
    thema: LernText,
    symbol: z.optional(z.string()),
  }),
  /** Mindestens ein Eintrag ist noch nicht von Muttersprachlern geprüft (Hinweis in der Einheit). */
  hinweis: z.boolean(),
  lektionen: z.array(LektionSchema).check(z.minLength(1)),
  eintraege: z.record(z.string(), EintragHerkunftSchema),
  tipps: z.array(PaketTippSchema),
  /** Audio-Bündel, auf die das Paket verweist (meist das der Einheit; Wiederholungen früherer Wörter auch frühere); leer = „Audio folgt“ */
  audio: z.array(BuendelVerweisSchema).check(z.maxLength(40)),
  lizenz: z.literal(INHALT_LIZENZ),
  /** nur Wissenskurs: Prüfvermerk, Kennzeichnung und Aussagen je Lektion (Schlüssel wie `lektionen[].schluessel`) */
  wissen: z.optional(z.record(z.string(), WissensLektionSchema)),
  /** nur Wissenskurs mit Vorschau: mindestens eine Lektion ist ein ungeprüfter Entwurf (L3-E22) */
  vorschau: z.optional(z.literal(true)),
});

export const PaketSchema = PaketGrundSchema.check(
  z.superRefine((p, ctx) => {
    if (p.kurs !== 'islam') {
      if (p.wissen) ctx.addIssue({ code: 'custom', message: 'wissen nur im Wissenskurs', path: ['wissen'] });
      if (p.vorschau) ctx.addIssue({ code: 'custom', message: 'vorschau nur im Wissenskurs', path: ['vorschau'] });
      return;
    }
    // Wissenskurs: Inhalt Deutsch, je Lektion ein Prüfvermerk, nichts aus den Sprachkursen
    if (p.zielsprache !== 'de' || p.ausgangssprache !== 'de')
      ctx.addIssue({ code: 'custom', message: 'Wissenskurs nur auf Deutsch', path: ['zielsprache'] });
    if (Object.keys(p.eintraege).length || p.tipps.length || p.audio.length)
      ctx.addIssue({ code: 'custom', message: 'Wissenskurs ohne Einträge, Tipps und Audio', path: ['eintraege'] });
    const vermerke = p.wissen ?? {};
    if (p.lektionen.some((l) => !vermerke[l.schluessel]) || Object.keys(vermerke).length !== p.lektionen.length)
      ctx.addIssue({ code: 'custom', message: 'Prüfvermerk je Lektion fehlt', path: ['wissen'] });
    // `vorschau` genau dann, wenn eine Lektion ein Entwurf ist
    if (Object.values(vermerke).some((v) => 'entwurf' in v) !== (p.vorschau === true))
      ctx.addIssue({ code: 'custom', message: 'vorschau genau mit einer Lektion im Entwurf', path: ['vorschau'] });
  }),
);
export type Paket = z.infer<typeof PaketSchema>;

export const VerzeichnisEinheitSchema = z.strictObject({
  schluessel: z.string(),
  stufe: z.enum(STUFEN),
  reihenfolge: z.int(),
  thema: LernText,
  symbol: z.optional(z.string()),
  hash: Hash,
  bytes: Anzahl(1),
  lektionen: Anzahl(1),
  hinweis: z.boolean(),
  audio: z.array(BuendelVerweisSchema).check(z.maxLength(40)),
  /** nur Wissenskurs mit Vorschau: das Paket enthält ungeprüfte Entwürfe (L3-E22) */
  vorschau: z.optional(z.literal(true)),
});
export type VerzeichnisEinheit = z.infer<typeof VerzeichnisEinheitSchema>;

export const VerzeichnisSchema = z.strictObject({
  format: z.literal(VERZEICHNIS_FORMAT),
  version: z.literal(1),
  kurs: z.enum(KURS_SLUGS),
  kursId: z.enum(KURSE),
  zielsprache: z.enum(SPRACHEN),
  ausgangssprache: z.nullable(z.enum(SPRACHEN)),
  /** `lernapp_kurs.version` (steigt mit jeder Veröffentlichung) */
  stand: Anzahl(0),
  einheiten: z.array(VerzeichnisEinheitSchema),
});
export type Verzeichnis = z.infer<typeof VerzeichnisSchema>;
