import { audioFormat } from '@/lib/audio/format';
import { webmDauer } from '@/lib/audio/webm';
import { istSchluesselVon, istSprache, type Sprache } from '../kurse';

/**
 * Audio-Bündel `.lpa` der Lern-App (ADR 0039 Nr. 3, Fortschreibung S4/S5): je Zielsprache und Einheit eine Datei, beide
 * Richtungen derselben Zielsprache teilen sie. Rein und ohne Abhängigkeiten von Node – Werkzeuge bauen, der Client liest.
 *
 * Aufbau (alle Versätze ab Dateianfang, damit der Client direkt mit `Blob.slice` schneidet):
 *
 * | Bytes        | Inhalt                                                                                       |
 * | ------------ | -------------------------------------------------------------------------------------------- |
 * | 0–3          | Kennung `LPA1` (ASCII)                                                                       |
 * | 4–7          | Länge n des Kopfs (uint32, big-endian)                                                       |
 * | 8 … 8+n−1    | Kopf als UTF-8-JSON `{ format, version, sprache, einheit, clips: [{ textHash, versatz, laenge, format, dauerMs }] }`, mit Leerzeichen aufgefüllt |
 * | ab 8+n       | die Clips hintereinander, jeder eine vollständige WebM/Opus-Datei mit Dauer                   |
 *
 * - Clips nach `textHash` sortiert (gleiche Eingabe → gleiche Bytes → gleicher Name).
 * - Höchstens 16 MB je Bündel (`BUENDEL_MAX_BYTES`): das Vercel-CDN hält gestreamte Antworten nur bis 20 MB vor (S5).
 * - Dateiname `<einheit>-<sha16>.lpa` (die ersten 16 Hex-Zeichen des SHA-256 der Bytes), Ablage im Blob unter
 *   `lernapp/audio/<sprache>/<datei>`, Adresse für den Client `/lern-app/audio/<sprache>/<datei>`.
 * - Abspielen: `schneideClip(blob, clip)` → `URL.createObjectURL` → ein wiederverwendetes `<audio>`; „langsam“ über
 *   `playbackRate = 0.75` mit `preservesPitch` (ADR 0039, Fortschreibung S4 Nr. 3).
 */

export const BUENDEL_KENNUNG = 'LPA1';
export const BUENDEL_FORMAT = 'igmg-lernapp-buendel';
export const BUENDEL_VERSION = 1;
/** Regelgrenze je Bündel (S5: CDN-Grenze 20 MB für gestreamte Antworten). */
export const BUENDEL_MAX_BYTES = 16 * 1024 * 1024;
/** Obergrenze des Kopfs (Schutz beim Lesen fremder Dateien). */
export const KOPF_MAX_BYTES = 4 * 1024 * 1024;
export const CLIP_FORMATE = ['webm-opus'] as const;
export type ClipFormat = (typeof CLIP_FORMATE)[number];
/** MIME-Typ der Clips beim Schneiden. */
export const CLIP_MIME: Record<ClipFormat, string> = { 'webm-opus': 'audio/webm' };

export type BuendelClip = { textHash: string; versatz: number; laenge: number; format: ClipFormat; dauerMs: number };
export type BuendelKopf = {
  format: typeof BUENDEL_FORMAT;
  version: typeof BUENDEL_VERSION;
  sprache: Sprache;
  einheit: string;
  clips: BuendelClip[];
};

export type ClipEingabe = { textHash: string; daten: Uint8Array; dauerMs?: number };

const HEX64 = /^[0-9a-f]{64}$/;

export class BuendelFehler extends Error {}

function kopfBytes(kopf: BuendelKopf, laenge?: number): Uint8Array {
  const json = JSON.stringify(kopf);
  const text = laenge === undefined ? json : json.padEnd(laenge, ' ');
  return new TextEncoder().encode(text);
}

/**
 * Bündel aus Clips bauen. Prüft Format (WebM über die Magic Bytes), Dauer (aus dem Kopf der Datei, falls nicht
 * angegeben), eindeutige Text-Hashes und die Größengrenze.
 */
export function baueBuendel(eingabe: { sprache: Sprache; einheit: string; clips: readonly ClipEingabe[] }): {
  bytes: Uint8Array;
  kopf: BuendelKopf;
} {
  if (!istSprache(eingabe.sprache)) throw new BuendelFehler('Sprache unbekannt');
  if (!istSchluesselVon(eingabe.sprache, eingabe.einheit)) throw new BuendelFehler('Einheit gehört nicht zur Sprache');
  const clips = [...eingabe.clips].sort((a, b) => (a.textHash < b.textHash ? -1 : a.textHash > b.textHash ? 1 : 0));
  const gesehen = new Set<string>();
  const angaben = clips.map((c) => {
    if (!HEX64.test(c.textHash)) throw new BuendelFehler(`textHash ungültig: ${c.textHash}`);
    if (gesehen.has(c.textHash)) throw new BuendelFehler(`textHash doppelt: ${c.textHash}`);
    gesehen.add(c.textHash);
    if (audioFormat(c.daten)?.art !== 'webm') throw new BuendelFehler(`Clip ist kein WebM: ${c.textHash}`);
    const dauerMs = c.dauerMs ?? webmDauer(c.daten);
    if (!dauerMs || dauerMs <= 0) throw new BuendelFehler(`Clip ohne Dauer: ${c.textHash}`);
    return { textHash: c.textHash, laenge: c.daten.length, format: 'webm-opus' as const, dauerMs: Math.round(dauerMs) };
  });

  // Die Versätze hängen von der Kopflänge ab und umgekehrt: so lange rechnen, bis sie zusammenpassen; ein kürzerer Kopf
  // wird mit Leerzeichen auf die angenommene Länge aufgefüllt (JSON erlaubt Leerraum am Ende).
  let annahme = 0;
  let kopf: BuendelKopf;
  let bytesKopf: Uint8Array;
  for (;;) {
    let p = 8 + annahme;
    kopf = {
      format: BUENDEL_FORMAT,
      version: BUENDEL_VERSION,
      sprache: eingabe.sprache,
      einheit: eingabe.einheit,
      clips: angaben.map((a) => {
        const c = { textHash: a.textHash, versatz: p, laenge: a.laenge, format: a.format, dauerMs: a.dauerMs };
        p += a.laenge;
        return c;
      }),
    };
    const roh = kopfBytes(kopf);
    if (roh.length === annahme) {
      bytesKopf = roh;
      break;
    }
    if (roh.length < annahme) {
      bytesKopf = kopfBytes(kopf, annahme);
      break;
    }
    annahme = roh.length;
  }

  const gesamt = 8 + bytesKopf.length + clips.reduce((s, c) => s + c.daten.length, 0);
  if (gesamt > BUENDEL_MAX_BYTES) throw new BuendelFehler(`Bündel zu groß: ${gesamt} Bytes (höchstens ${BUENDEL_MAX_BYTES})`);
  const bytes = new Uint8Array(gesamt);
  bytes.set(new TextEncoder().encode(BUENDEL_KENNUNG), 0);
  new DataView(bytes.buffer).setUint32(4, bytesKopf.length, false);
  bytes.set(bytesKopf, 8);
  let p = 8 + bytesKopf.length;
  for (const c of clips) {
    bytes.set(c.daten, p);
    p += c.daten.length;
  }
  return { bytes, kopf };
}

/** Länge des Kopfs aus den ersten 8 Bytes (Kennung geprüft). */
export function kopfLaenge(anfang: Uint8Array): number {
  if (anfang.length < 8) throw new BuendelFehler('Bündel zu kurz');
  if (new TextDecoder().decode(anfang.subarray(0, 4)) !== BUENDEL_KENNUNG) throw new BuendelFehler('Kennung fehlt');
  const n = new DataView(anfang.buffer, anfang.byteOffset, 8).getUint32(4, false);
  if (n < 2 || n > KOPF_MAX_BYTES) throw new BuendelFehler('Kopflänge ungültig');
  return n;
}

/**
 * Kopf eines Bündels lesen und prüfen: Kennung, Format, Sprache, Einheit, Clips innerhalb der Datei (bei bekannter Größe),
 * lückenlos, ohne Überlappung. `bytes` muss mindestens den Kopf enthalten.
 */
export function leseBuendelKopf(bytes: Uint8Array, groesse?: number): BuendelKopf {
  const n = kopfLaenge(bytes);
  if (bytes.length < 8 + n) throw new BuendelFehler('Kopf unvollständig');
  let roh: unknown;
  try {
    roh = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes.subarray(8, 8 + n)));
  } catch {
    throw new BuendelFehler('Kopf ist kein JSON');
  }
  const k = roh as Partial<BuendelKopf>;
  if (k.format !== BUENDEL_FORMAT || k.version !== BUENDEL_VERSION) throw new BuendelFehler('Format oder Version unbekannt');
  if (!istSprache(k.sprache) || !istSchluesselVon(k.sprache, k.einheit)) throw new BuendelFehler('Sprache oder Einheit ungültig');
  if (!Array.isArray(k.clips)) throw new BuendelFehler('Clips fehlen');
  let erwartet = 8 + n;
  for (const c of k.clips as unknown[]) {
    const clip = c as Partial<BuendelClip>;
    if (
      !clip ||
      typeof clip.textHash !== 'string' ||
      !HEX64.test(clip.textHash) ||
      !Number.isInteger(clip.versatz) ||
      !Number.isInteger(clip.laenge) ||
      (clip.laenge ?? 0) <= 0 ||
      !(CLIP_FORMATE as readonly unknown[]).includes(clip.format) ||
      !Number.isInteger(clip.dauerMs) ||
      (clip.dauerMs ?? 0) <= 0
    )
      throw new BuendelFehler('Clip-Angabe ungültig');
    if (clip.versatz !== erwartet) throw new BuendelFehler('Clips nicht lückenlos');
    erwartet += clip.laenge ?? 0;
  }
  if (groesse !== undefined && erwartet !== groesse) throw new BuendelFehler('Größe passt nicht zum Kopf');
  return k as BuendelKopf;
}

/** Clip zu einem Text-Hash (oder null). */
export function findeClip(kopf: Pick<BuendelKopf, 'clips'>, textHash: string): BuendelClip | null {
  return kopf.clips.find((c) => c.textHash === textHash) ?? null;
}

/** Scheibe eines Clips aus dem ganzen Bündel (Client: `Blob.slice`, ohne Kopie). */
export function schneideClip(buendel: Blob, clip: Pick<BuendelClip, 'versatz' | 'laenge'> & { format?: ClipFormat }): Blob {
  return buendel.slice(clip.versatz, clip.versatz + clip.laenge, CLIP_MIME[clip.format ?? 'webm-opus']);
}

/** Dateiname eines Bündels: `<einheit>-<sha16>.lpa`. */
export function buendelDatei(einheit: string, sha256: string): string {
  if (!HEX64.test(sha256)) throw new BuendelFehler('SHA-256 ungültig');
  return `${einheit}-${sha256.slice(0, 16)}.lpa`;
}

const PFAD = /^(de|tr|ar)\/([a-z0-9-]+(?:\.[a-z0-9-]+)+)-([0-9a-f]{16})\.lpa$/;

/** Prüft einen Bündelpfad `<sprache>/<einheit>-<sha16>.lpa` (Route und Blob-Schlüssel); null bei allem anderen. */
export function leseBuendelPfad(pfad: string): { sprache: Sprache; einheit: string; sha16: string; datei: string } | null {
  if (pfad.length > 200) return null;
  const m = PFAD.exec(pfad);
  if (!m) return null;
  const [, sprache, einheit, sha16] = m as unknown as [string, Sprache, string, string];
  if (!istSchluesselVon(sprache, einheit)) return null;
  return { sprache, einheit, sha16, datei: `${einheit}-${sha16}.lpa` };
}

/** Adresse eines Bündels für den Client (gleicher Ursprung, Route `/lern-app/audio/[...pfad]`). */
export function buendelAdresse(sprache: Sprache, datei: string): string {
  return `/lern-app/audio/${sprache}/${datei}`;
}

/** Schlüssel im Blob-Speicher `lernapp` (ADR 0039, Fortschreibung S5 Nr. 5). */
export function buendelBlobSchluessel(sprache: Sprache, datei: string): string {
  return `lernapp/audio/${sprache}/${datei}`;
}
