import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { connection } from 'next/server';
import { DIREKT_MAX_BYTES, istEingangsSchluessel } from '@/lib/medien/direkt';
import { direktUploadAktiv } from '@/lib/medien/eingang';
import { KeinRecht, verlangeRecht } from '@/lib/rechte/pruefe';

/**
 * Berechtigung für den Direkt-Upload großer PDF-Dateien (ADR 0020, AUFTRAG V-05): Nur mit Sitzung, zweitem Faktor und
 * Recht `medium.hochladen` stellt der Server ein kurzlebiges Upload-Token für genau einen Eingangsschlüssel aus (nur PDF,
 * höchstens 10 MB, kein Überschreiben). Übernahme und Prüfung der Datei folgen in der Server Action `hochladen`.
 * Kein Rückruf von Vercel Blob (`onUploadCompleted` entfällt): Die Route nimmt nur Token-Anfragen an.
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
    await verlangeRecht('medium.hochladen');
  } catch (f) {
    if (f instanceof KeinRecht) return new Response(null, { status: 403 });
    throw f;
  }
  try {
    const antwort = await handleUpload({
      body,
      request: anfrage,
      onBeforeGenerateToken: async (pfad) => {
        if (!istEingangsSchluessel(pfad)) throw new Error('Ungültiger Eingangsschlüssel.');
        return {
          allowedContentTypes: ['application/pdf'],
          maximumSizeInBytes: DIREKT_MAX_BYTES,
          addRandomSuffix: false,
          allowOverwrite: false,
          validUntil: Date.now() + 10 * 60_000,
        };
      },
    });
    return Response.json(antwort, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return Response.json({ fehler: 'abgelehnt' }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
  }
}
