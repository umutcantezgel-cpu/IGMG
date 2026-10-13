import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { connection } from 'next/server';
import { AUDIO_EINGANG_TYP, istAudioEingang } from '@/lib/audio/direkt';
import { AUDIO_MAX_BYTES } from '@/lib/audio/format';
import { direktUploadAktiv } from '@/lib/medien/eingang';
import { KeinRecht, verlangeRecht } from '@/lib/rechte/pruefe';

/**
 * Berechtigung für den Direkt-Upload einer Rezitations-Audiodatei (ADR 0029): Nur mit Sitzung, zweitem Faktor und Recht
 * `rezitation.bearbeiten` stellt der Server ein kurzlebiges Upload-Token für genau einen Eingangsschlüssel aus (höchstens
 * 60 MB, kein Überschreiben). Typ und Inhalt prüft danach die Server Action `audioUebernehmen` an den Bytes.
 * Kein Rückruf von Vercel Blob: Die Route nimmt nur Token-Anfragen an (wie `/verwaltung/medien/direkt`).
 */
export async function POST(anfrage: Request) {
  await connection();
  if (!direktUploadAktiv()) return new Response(null, { status: 404 });
  let body: HandleUploadBody;
  try {
    body = (await anfrage.json()) as HandleUploadBody;
  } catch {
    return new Response(null, { status: 400 });
  }
  if (body?.type !== 'blob.generate-client-token') return new Response(null, { status: 400 });
  try {
    await verlangeRecht('rezitation.bearbeiten');
  } catch (f) {
    if (f instanceof KeinRecht) return new Response(null, { status: 403 });
    throw f;
  }
  try {
    const antwort = await handleUpload({
      body,
      request: anfrage,
      onBeforeGenerateToken: async (pfad) => {
        if (!istAudioEingang(pfad)) throw new Error('Ungültiger Eingangsschlüssel.');
        return {
          allowedContentTypes: [AUDIO_EINGANG_TYP],
          maximumSizeInBytes: AUDIO_MAX_BYTES,
          addRandomSuffix: false,
          allowOverwrite: false,
          validUntil: Date.now() + 15 * 60_000,
        };
      },
    });
    return Response.json(antwort, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return Response.json({ fehler: 'abgelehnt' }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
  }
}
