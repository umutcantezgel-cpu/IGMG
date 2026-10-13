import 'server-only';
import { createHash } from 'node:crypto';
import { and, eq, gt, sql } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { AUDIO_MAX_BYTES, audioFormat, audioPfad } from './format';
import { audioAdresse, loescheAudio, schreibeAudio } from './speicher';

/**
 * Audiodatei einer Rezitation ablegen (ADR 0029): Format nur über Magic Bytes, höchstens 60 MB, SHA-256 als Inhalts-Hash
 * im Pfad, Eintrag in `quran_audio`. Gemeinsam für die Werkstatt (Server Action) und den Import (Skript).
 * Eine neue Datei ersetzt die alte derselben Stelle; Vers- und Wortzeiten der alten Datei gelten dann nicht mehr und
 * werden entfernt. Gleiche Datei (gleicher Hash) ändert nichts – der Import ist dadurch wiederholbar.
 */
export class AudioFehler extends Error {
  constructor(public readonly grund: 'leer' | 'zuGross' | 'format' | 'rezitation' | 'sure' | 'vers' | 'modus') {
    super(grund);
    this.name = 'AudioFehler';
  }
}

export type AudioAbgelegt = { pfad: string; sha256: string; mime: string; bytes: number; ergebnis: 'neu' | 'ersetzt' | 'unveraendert' };

export async function legeAudioAb(eingabe: {
  rezitationId: string;
  sure: number;
  vers?: number;
  roh: Buffer;
  dauerMs?: number | null;
}): Promise<AudioAbgelegt> {
  const { rezitationId, sure, roh } = eingabe;
  const vers = eingabe.vers ?? 0;
  if (roh.length === 0) throw new AudioFehler('leer');
  if (roh.length > AUDIO_MAX_BYTES) throw new AudioFehler('zuGross');
  const format = audioFormat(roh.subarray(0, 16));
  if (!format) throw new AudioFehler('format');
  const [rezitation] = await db
    .select({ id: schema.quranRezitation.id })
    .from(schema.quranRezitation)
    .where(eq(schema.quranRezitation.id, rezitationId))
    .limit(1);
  if (!rezitation) throw new AudioFehler('rezitation');
  const [s] = await db.select({ verse: schema.quranSure.verseAnzahl }).from(schema.quranSure).where(eq(schema.quranSure.nr, sure)).limit(1);
  if (!s) throw new AudioFehler('sure');
  if (!Number.isInteger(vers) || vers < 0 || vers > s.verse) throw new AudioFehler('vers');

  const a = schema.quranAudio;
  const stelleDerSure = and(eq(a.rezitationId, rezitationId), eq(a.sure, sure));
  // Eine Sure hat entweder eine Datei je Sure oder Dateien je Vers (Import), nie beides
  const [andererModus] = await db
    .select({ vers: a.vers })
    .from(a)
    .where(and(stelleDerSure, vers === 0 ? gt(a.vers, 0) : eq(a.vers, 0)))
    .limit(1);
  if (andererModus) throw new AudioFehler('modus');

  const sha256 = createHash('sha256').update(roh).digest('hex');
  const [vorher] = await db
    .select({ pfad: a.pfad, sha256: a.sha256 })
    .from(a)
    .where(and(stelleDerSure, eq(a.vers, vers)))
    .limit(1);
  const schluessel = audioPfad(rezitationId, sure, vers, sha256, format);
  const pfad = audioAdresse(schluessel);
  if (vorher?.sha256 === sha256 && vorher.pfad === pfad) {
    if (eingabe.dauerMs)
      await db
        .update(a)
        .set({ dauerMs: eingabe.dauerMs })
        .where(and(stelleDerSure, eq(a.vers, vers)));
    return { pfad, sha256, mime: format.mime, bytes: roh.length, ergebnis: 'unveraendert' };
  }

  await schreibeAudio(schluessel, roh, format.mime);
  try {
    await db.transaction(async (tx) => {
      await tx
        .insert(a)
        .values({ rezitationId, sure, vers, pfad, mime: format.mime, bytes: roh.length, sha256, dauerMs: eingabe.dauerMs ?? null })
        .onConflictDoUpdate({
          target: [a.rezitationId, a.sure, a.vers],
          set: { pfad, mime: format.mime, bytes: roh.length, sha256, dauerMs: eingabe.dauerMs ?? null, erstelltAm: sql`now()` },
        });
      if (vorher) {
        // Zeiten bezogen sich auf die alte Datei
        const zeitStelle = <T extends typeof schema.quranVerszeit | typeof schema.quranWortzeit>(t: T) =>
          and(eq(t.rezitationId, rezitationId), eq(t.sure, sure), ...(vers === 0 ? [] : [eq(t.vers, vers)]));
        await tx.delete(schema.quranWortzeit).where(zeitStelle(schema.quranWortzeit));
        await tx.delete(schema.quranVerszeit).where(zeitStelle(schema.quranVerszeit));
      }
    });
  } catch (e) {
    if (!vorher || vorher.pfad !== pfad) await loescheAudio(schluessel).catch(() => undefined);
    throw e;
  }
  // Alte Datei entfernen (der Pfad gehört genau dieser Stelle: Rezitation, Sure, Vers und Hash)
  if (vorher && vorher.pfad !== pfad) await loescheAudio(vorher.pfad.replace(/^\//, '')).catch(() => undefined);
  return { pfad, sha256, mime: format.mime, bytes: roh.length, ergebnis: vorher ? 'ersetzt' : 'neu' };
}

/** Datei je Sure (vers 0) einer Rezitation, sonst null. */
export async function sureDatei(rezitationId: string, sure: number) {
  const a = schema.quranAudio;
  const [z] = await db
    .select({ pfad: a.pfad, dauerMs: a.dauerMs, sha256: a.sha256 })
    .from(a)
    .where(and(eq(a.rezitationId, rezitationId), eq(a.sure, sure), eq(a.vers, 0)))
    .limit(1);
  return z ?? null;
}
