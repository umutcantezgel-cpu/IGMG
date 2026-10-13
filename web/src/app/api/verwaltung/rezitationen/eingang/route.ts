import { connection } from 'next/server';
import { istAudioEingang, neuerAudioEingang } from '@/lib/audio/direkt';
import { AUDIO_MAX_BYTES, audioFormat } from '@/lib/audio/format';
import { direktUploadAktiv } from '@/lib/medien/eingang';
import { KeinRecht, verlangeRecht } from '@/lib/rechte/pruefe';
import { speicher } from '@/lib/storage';

const KEIN_CACHE = { 'Cache-Control': 'no-store' };

/**
 * Eingang einer Rezitations-Audiodatei ohne Vercel Blob (lokal, Docker, ADR 0029): Der Browser schickt die Datei als
 * Rohdaten. Die Route liegt unter `/api`, damit der Proxy den Körper nicht auf 11 MB puffert (Sure bis 60 MB). Nur mit
 * `rezitation.bearbeiten` und nur vom eigenen Ursprung (Fetch-Metadaten; Sitzungs-Cookie ist zusätzlich SameSite=Lax).
 * Schreibt die Datei unter einen neuen Eingangsschlüssel; Prüfung und Ablage macht die Server Action `audioUebernehmen`.
 */
export async function POST(anfrage: Request) {
  await connection();
  if (direktUploadAktiv()) return new Response(null, { status: 404 });
  const herkunft = anfrage.headers.get('sec-fetch-site');
  if (herkunft && herkunft !== 'same-origin') return new Response(null, { status: 403 });
  try {
    await verlangeRecht('rezitation.bearbeiten');
  } catch (f) {
    if (f instanceof KeinRecht) return new Response(null, { status: 403 });
    throw f;
  }
  const laenge = Number(anfrage.headers.get('content-length') ?? '0');
  if (laenge > AUDIO_MAX_BYTES) return Response.json({ fehler: 'audio_zuGross' }, { status: 413, headers: KEIN_CACHE });
  if (!anfrage.body) return Response.json({ fehler: 'audio_leer' }, { status: 400, headers: KEIN_CACHE });
  const teile: Uint8Array[] = [];
  let gelesen = 0;
  const leser = anfrage.body.getReader();
  for (;;) {
    const { done, value } = await leser.read();
    if (done) break;
    gelesen += value.length;
    if (gelesen > AUDIO_MAX_BYTES) {
      await leser.cancel();
      return Response.json({ fehler: 'audio_zuGross' }, { status: 413, headers: KEIN_CACHE });
    }
    teile.push(value);
  }
  const daten = Buffer.concat(teile);
  if (!daten.length) return Response.json({ fehler: 'audio_leer' }, { status: 400, headers: KEIN_CACHE });
  // Früh ablehnen, was sicher kein Audio ist (die Action prüft dieselben Bytes erneut)
  if (!audioFormat(daten.subarray(0, 16))) return Response.json({ fehler: 'audio_format' }, { status: 415, headers: KEIN_CACHE });
  const eingang = neuerAudioEingang();
  if (!istAudioEingang(eingang)) return new Response(null, { status: 500 });
  await speicher().schreibe(eingang, daten, 'application/octet-stream');
  return Response.json({ eingang }, { headers: KEIN_CACHE });
}
