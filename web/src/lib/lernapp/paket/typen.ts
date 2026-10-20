import { z } from 'zod';
import { LektionSchema } from '../aufgaben/schema';
import { KURS_SLUGS, KURSE, RICHTUNGEN, SPRACHEN, STUFEN } from '../kurse';

/**
 * Formate der Auslieferung (ADR 0039 Nr. 1/2): Kursverzeichnis je Kurs-Slug und Einheitenpaket je Richtung und Einheit.
 * Server (Paketbau, Routen) und Client (lokal/pakete.ts) prüfen gegen dieselben Schemas.
 *
 * - Adresse eines Pakets: `/lern-app/pakete/<kurs>/<einheit>/<hash>`, `hash` = SHA-256 der ausgelieferten Bytes (kanonisches
 *   JSON, UTF-8). Unter einem Hash ändert sich nichts; ein neuer Stand bekommt eine neue Adresse.
 * - Das Verzeichnis `/lern-app/pakete/<kurs>` nennt je Einheit Hash und Größe (Bytes) des Pakets und des Audio-Bündels,
 *   damit der Client den Ring „offline speichern“ nach Bytes zeichnet (B-27).
 * - Quelle, Lizenz und Namensnennung stehen je Eintrag im Paket (`eintraege`), auch offline lesbar (ADR 0039 Nr. 9).
 */

export const PAKET_FORMAT = 'igmg-lernapp-paket';
export const VERZEICHNIS_FORMAT = 'igmg-lernapp-verzeichnis';
/** Lizenz der eigenen Lerninhalte (L0-E02). */
export const INHALT_LIZENZ = 'CC-BY-SA-4.0';

const LernText = z.strictObject({ de: z.string().optional(), tr: z.string().optional(), ar: z.string().optional() });
const Hash = z.string().regex(/^[0-9a-f]{64}$/);

/** Herkunft je Eintrag (Zieltext `<schluessel>` bzw. Übersetzung `<schluessel>@<ausgang>`). */
export const EintragHerkunftSchema = z.strictObject({
  text: z.string(),
  sprache: z.enum(SPRACHEN),
  quelle: z.string(),
  lizenz: z.string(),
  namensnennung: z.string().optional(),
  /** Stimme des Clips (`tts:<modell>@<sha>`, `mensch:<id>`, im Testkurs `test:ton`) */
  stimme: z.string().optional(),
  /** noch nicht von Muttersprachlern geprüft (ADR 0041 Nr. 8) */
  hinweis: z.literal(true).optional(),
});
export type EintragHerkunft = z.infer<typeof EintragHerkunftSchema>;

/** Verweis auf ein Audio-Bündel mit seiner Größe (Ring „offline speichern“ nach Bytes). */
export const BuendelVerweisSchema = z.strictObject({ adresse: z.string().regex(/^\/lern-app\/audio\//), bytes: z.int().min(1) });
export type BuendelVerweis = z.infer<typeof BuendelVerweisSchema>;

export const PaketTippSchema = z.strictObject({
  schluessel: z.string(),
  titel: z.string().optional(),
  inhalt: z.looseObject({ type: z.literal('doc') }),
});

export const PaketSchema = z.strictObject({
  format: z.literal(PAKET_FORMAT),
  version: z.literal(1),
  kurs: z.enum(RICHTUNGEN),
  zielsprache: z.enum(SPRACHEN),
  ausgangssprache: z.enum(SPRACHEN),
  einheit: z.strictObject({
    schluessel: z.string(),
    stufe: z.enum(STUFEN),
    reihenfolge: z.int(),
    thema: LernText,
    symbol: z.string().optional(),
  }),
  /** Mindestens ein Eintrag ist noch nicht von Muttersprachlern geprüft (Hinweis in der Einheit). */
  hinweis: z.boolean(),
  lektionen: z.array(LektionSchema).min(1),
  eintraege: z.record(z.string(), EintragHerkunftSchema),
  tipps: z.array(PaketTippSchema),
  /** Audio-Bündel, auf die das Paket verweist (meist das der Einheit; Wiederholungen früherer Wörter auch frühere); leer = „Audio folgt“ */
  audio: z.array(BuendelVerweisSchema).max(40),
  lizenz: z.literal(INHALT_LIZENZ),
});
export type Paket = z.infer<typeof PaketSchema>;

export const VerzeichnisEinheitSchema = z.strictObject({
  schluessel: z.string(),
  stufe: z.enum(STUFEN),
  reihenfolge: z.int(),
  thema: LernText,
  symbol: z.string().optional(),
  hash: Hash,
  bytes: z.int().min(1),
  lektionen: z.int().min(1),
  hinweis: z.boolean(),
  audio: z.array(BuendelVerweisSchema).max(40),
});
export type VerzeichnisEinheit = z.infer<typeof VerzeichnisEinheitSchema>;

export const VerzeichnisSchema = z.strictObject({
  format: z.literal(VERZEICHNIS_FORMAT),
  version: z.literal(1),
  kurs: z.enum(KURS_SLUGS),
  kursId: z.enum(KURSE),
  zielsprache: z.enum(SPRACHEN),
  ausgangssprache: z.enum(SPRACHEN).nullable(),
  /** `lernapp_kurs.version` (steigt mit jeder Veröffentlichung) */
  stand: z.int().min(0),
  einheiten: z.array(VerzeichnisEinheitSchema),
});
export type Verzeichnis = z.infer<typeof VerzeichnisSchema>;

/** Adresse eines Einheitenpakets. */
export function paketAdresse(kurs: string, einheit: string, hash: string): string {
  return `/lern-app/pakete/${kurs}/${einheit}/${hash}`;
}

/** Adresse des Kursverzeichnisses. */
export function verzeichnisAdresse(kurs: string): string {
  return `/lern-app/pakete/${kurs}`;
}
