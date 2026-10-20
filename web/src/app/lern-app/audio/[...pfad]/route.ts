import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { join } from 'node:path';
import { Readable } from 'node:stream';
import { connection } from 'next/server';
import { leseBereich } from '@/lib/audio/bereich';
import { TAG } from '@/lib/cache/tags';
import { funktionAn } from '@/lib/funktionen';
import { buendelBlobSchluessel, leseBuendelPfad } from '@/lib/lernapp/paket/buendel';

/**
 * Audio-Bündel `.lpa` der Lern-App (ADR 0039 Nr. 4, Fortschreibung S5 Nr. 5, Weg A2) unter
 * `/lern-app/audio/<sprache>/<einheit>-<sha16>.lpa`, nach dem Muster `liefereAudio` mit fünf Änderungen:
 * 1. `Cache-Control: public, max-age=31536000, immutable` plus `Vercel-CDN-Cache-Control` und `Vercel-Cache-Tag` – das CDN
 *    hält ganze Antworten (200) vor. Tags: `lernapp-audio`, `lernapp-audio-<sprache>`, `lernapp` (Import),
 *    `lernapp-kurs-<sprache>` (Zurückziehen im Kurs der Zielsprache) und `einstellungen` (Schalter `lernapp`), damit keine
 *    Jahreskopie das Abschalten oder Zurückziehen überdauert (S-L1 N-3). Ein zurückgezogener Clip verschwindet aus dem
 *    Bündel erst mit dessen Neubau in der Audio-Kette (neue Adresse, L3-05); bis dahin verweist kein Paket mehr darauf.
 *    Teilantworten (206) hält das CDN nie vor (`Vercel-CDN-Cache-Control: no-store`, S-L1 N-4), 416 niemand.
 * 2. Kein `head()` je Anfrage: Die Adresse entsteht aus der festen Basis `LERNAPP_BLOB_BASIS` (öffentlicher Speicher
 *    `lernapp`) und dem geprüften Schlüssel `lernapp/audio/<sprache>/<datei>`; Blob-404 → 404.
 * 3. Der Antwortkörper ist ein Strom, nie gepuffert (4,5-MB-Grenze der Funktionsantworten).
 * 4. Bündel ≤ 16 MB (Regeltest in `buendel`, CDN-Grenze 20 MB).
 * 5. Keine Cookies, kein `Vary: Cookie`: Die Route liest weder Sitzung noch Cookies.
 * Byte-Bereiche bleiben möglich (200/206/416); der Client lädt Bündel aber ganz und ohne `Range` (S4/S5).
 *
 * Ohne Blob-Speicher (Beispielmodus, E2E, Entwicklung) liefert die Route die synthetischen Testbündel des Testkurses aus
 * dem Dateisystem (`drizzle/seeds/lernapp-testaudio/`, ADR 0039 Nr. 11) – Töne, nie Rezitationen. Schalter `lernapp`
 * aus → 404. Der Proxy läuft hier nicht (Matcher-Ausschluss aus L1-02).
 */
const TESTAUDIO = join(process.cwd(), 'drizzle', 'seeds', 'lernapp-testaudio');
const NICHT_DA = { status: 404, headers: { 'Cache-Control': 'no-store' } };

/** CDN-Tags eines Bündels (siehe oben). */
const cdnTags = (sprache: string) =>
  ['lernapp-audio', `lernapp-audio-${sprache}`, TAG.lernapp, TAG.lernappKurs(sprache), TAG.einstellungen].join(',');

/**
 * Kopfzeilen der Antwort: Nur ganze Antworten (200) sind für Browser und CDN unveränderlich. Eine Teilantwort (206) darf der
 * Browser behalten, das CDN nie – sonst bekämen alle ein abgeschnittenes Bündel; 416 wird nicht vorgehalten.
 */
function kopfzeilen(sprache: string, quelle: Headers | Record<string, string>, status: number): Headers {
  const h = new Headers({
    'Content-Type': 'application/octet-stream',
    'X-Content-Type-Options': 'nosniff',
    'Accept-Ranges': 'bytes',
    ...(status === 416
      ? { 'Cache-Control': 'no-store' }
      : status === 206
        ? { 'Cache-Control': 'public, max-age=31536000, immutable', 'Vercel-CDN-Cache-Control': 'no-store' }
        : {
            'Cache-Control': 'public, max-age=31536000, immutable',
            'Vercel-CDN-Cache-Control': 'max-age=31536000',
            'Vercel-Cache-Tag': cdnTags(sprache),
          }),
  });
  const q = quelle instanceof Headers ? quelle : new Headers(quelle);
  for (const k of ['content-length', 'content-range']) {
    const w = q.get(k);
    if (w) h.set(k, w);
  }
  return h;
}

export async function GET(anfrage: Request, { params }: RouteContext<'/lern-app/audio/[...pfad]'>) {
  await connection();
  const pfad = leseBuendelPfad((await params).pfad.join('/'));
  if (!pfad || !(await funktionAn('lernapp'))) return new Response(null, NICHT_DA);
  const range = anfrage.headers.get('range');

  const basis = process.env.LERNAPP_BLOB_BASIS?.replace(/\/+$/, '');
  if (basis) {
    const antwort = await fetch(`${basis}/${buendelBlobSchluessel(pfad.sprache, pfad.datei)}`, {
      headers: range ? { range } : {},
      cache: 'no-store',
    });
    if (antwort.status === 404 || (!antwort.ok && antwort.status !== 416) || (antwort.ok && !antwort.body))
      return new Response(null, NICHT_DA);
    return new Response(antwort.body, { status: antwort.status, headers: kopfzeilen(pfad.sprache, antwort.headers, antwort.status) });
  }

  // Beispielmodus und Tests: synthetische Testbündel aus dem Dateisystem
  const datei = join(TESTAUDIO, pfad.sprache, pfad.datei);
  let groesse: number;
  try {
    groesse = (await stat(datei)).size;
  } catch {
    return new Response(null, NICHT_DA);
  }
  const bereich = leseBereich(range, groesse);
  if (bereich === 'ungueltig')
    return new Response(null, { status: 416, headers: kopfzeilen(pfad.sprache, { 'content-range': `bytes */${groesse}` }, 416) });
  const { start, ende } = bereich ?? { start: 0, ende: groesse - 1 };
  const strom = Readable.toWeb(createReadStream(datei, { start, end: ende })) as ReadableStream<Uint8Array>;
  return new Response(strom, {
    status: bereich ? 206 : 200,
    headers: kopfzeilen(
      pfad.sprache,
      { 'content-length': String(ende - start + 1), ...(bereich ? { 'content-range': `bytes ${start}-${ende}/${groesse}` } : {}) },
      bereich ? 206 : 200,
    ),
  });
}
