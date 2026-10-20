import 'server-only';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { Readable } from 'node:stream';
import { pruefeSchluessel, speicher } from '@/lib/storage';
import { leseBereich } from './bereich';

export { leseBereich };

/**
 * Ablage der Rezitations-Audiodateien (ADR 0029). Schlüssel `audio/<rezitation>/<sure>-<vers>-<hash>.<endung>` (unveränderlich,
 * Inhalts-Hash); die Datenbank speichert die Adresse `/<schlüssel>`, die der Player direkt abspielt.
 *
 * - Vercel Blob mit `AUDIO_BLOB_READ_WRITE_TOKEN`: öffentlicher Speicher „audio“ (fra1). Ausgeliefert immer über die Route
 *   `/audio/[...pfad]` (CSP bleibt `'self'`, Byte-Bereiche werden durchgereicht); kein Rewrite in `vercel.json`, damit
 *   Dateien nicht aktiver Rezitationen nur die Werkstatt erreichen (`_gemeinde/ENTSCHEIDUNGEN.md` L2-E06).
 * - Sonst der allgemeine Speicher (`speicher()`: Dateisystem lokal/Docker, S3, privater Blob) über dieselbe Route.
 *   Im Dateisystem mit echten Byte-Bereichen (Range), sonst als ganze Datei.
 */
const AUDIO_SCHLUESSEL = /^audio\/[a-z0-9-]{2,40}\/\d{3}-\d{3}-[0-9a-f]{16}\.(?:m4a|mp3|ogg|webm)$/;

export function istAudioSchluessel(wert: string): boolean {
  return AUDIO_SCHLUESSEL.test(wert);
}

/** Adresse für Player und Werkstatt (gleicher Ursprung). */
export function audioAdresse(schluessel: string): string {
  return `/${schluessel}`;
}

function oeffentlicherBlob(): string | null {
  return process.env.SPEICHER === 'blob' ? (process.env.AUDIO_BLOB_READ_WRITE_TOKEN ?? null) : null;
}

/** Ablageort für Anzeige und Startklar: öffentlicher Audio-Speicher oder allgemeiner Speicher. */
export function audioAblageArt(): 'blob-audio' | 'allgemein' {
  return oeffentlicherBlob() ? 'blob-audio' : 'allgemein';
}

export async function audioExistiert(schluessel: string): Promise<boolean> {
  const token = oeffentlicherBlob();
  if (!token) return speicher().existiert(schluessel);
  const { BlobNotFoundError, head } = await import('@vercel/blob');
  try {
    await head(pruefeSchluessel(schluessel), { token });
    return true;
  } catch (e) {
    if (e instanceof BlobNotFoundError) return false;
    throw e;
  }
}

export async function schreibeAudio(schluessel: string, daten: Buffer, typ: string): Promise<void> {
  if (await audioExistiert(schluessel)) return;
  const token = oeffentlicherBlob();
  if (!token) return speicher().schreibe(schluessel, daten, typ);
  const { put } = await import('@vercel/blob');
  await put(pruefeSchluessel(schluessel), daten, {
    access: 'public',
    token,
    contentType: typ,
    addRandomSuffix: false,
    allowOverwrite: false,
    cacheControlMaxAge: 86_400,
  });
}

export async function loescheAudio(schluessel: string): Promise<void> {
  const token = oeffentlicherBlob();
  if (!token) return speicher().loesche(schluessel);
  const { del } = await import('@vercel/blob');
  await del(pruefeSchluessel(schluessel), { token });
}

/**
 * Antwort mit Audiodaten (Status 200, 206 oder 416) oder null, wenn die Datei fehlt. Kopfzeilen für Cache und Typ setzt
 * die Route; hier nur Länge und Bereich.
 */
export async function liefereAudio(schluessel: string, range: string | null): Promise<Response | null> {
  pruefeSchluessel(schluessel);
  const token = oeffentlicherBlob();
  if (token) {
    const { BlobNotFoundError, head } = await import('@vercel/blob');
    let url: string;
    try {
      url = (await head(schluessel, { token })).url;
    } catch (e) {
      if (e instanceof BlobNotFoundError) return null;
      throw e;
    }
    const antwort = await fetch(url, { headers: range ? { range } : {} });
    if (!antwort.ok || !antwort.body) return null;
    const kopf = new Headers({ 'Accept-Ranges': 'bytes' });
    for (const k of ['content-length', 'content-range']) {
      const w = antwort.headers.get(k);
      if (w) kopf.set(k, w);
    }
    return new Response(antwort.body, { status: antwort.status, headers: kopf });
  }
  if (!process.env.SPEICHER || process.env.SPEICHER === 'dateisystem') {
    const wurzel = resolve(process.env.MEDIEN_VERZEICHNIS ?? '.medien');
    const pfad = resolve(join(wurzel, schluessel));
    if (!pfad.startsWith(`${wurzel}/`)) return null;
    let groesse: number;
    try {
      groesse = (await stat(pfad)).size;
    } catch {
      return null;
    }
    const bereich = leseBereich(range, groesse);
    if (bereich === 'ungueltig')
      return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${groesse}`, 'Accept-Ranges': 'bytes' } });
    const { start, ende } = bereich ?? { start: 0, ende: groesse - 1 };
    const strom = Readable.toWeb(createReadStream(pfad, { start, end: ende })) as ReadableStream<Uint8Array>;
    return new Response(strom, {
      status: bereich ? 206 : 200,
      headers: {
        'Accept-Ranges': 'bytes',
        'Content-Length': String(ende - start + 1),
        ...(bereich ? { 'Content-Range': `bytes ${start}-${ende}/${groesse}` } : {}),
      },
    });
  }
  // S3 oder privater Blob: ganze Datei (selten; Betrieb nutzt den öffentlichen Audio-Speicher oder das Dateisystem)
  const strom = await speicher().lies(schluessel);
  if (!strom) return null;
  return new Response(strom, { status: 200, headers: { 'Accept-Ranges': 'none' } });
}
