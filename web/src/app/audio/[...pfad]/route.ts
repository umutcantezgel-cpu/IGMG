import { and, eq } from 'drizzle-orm';
import { connection } from 'next/server';
import { audioAdresse, istAudioSchluessel, liefereAudio } from '@/lib/audio/speicher';
import { db, schema } from '@/lib/db';
import { datenbankVerfuegbar } from '@/lib/db/verfuegbar';
import { KeinRecht, verlangeRecht } from '@/lib/rechte/pruefe';

/**
 * Auslieferung der Rezitationen (ADR 0029) unter `/audio/<rezitation>/<sure>-<vers>-<hash>.<endung>` mit Byte-Bereichen
 * (Springen an Versanfänge). Nur Dateien mit Eintrag in `quran_audio`; Dateien einer nicht aktiven Rezitation nur für
 * die Werkstatt (`rezitation.bearbeiten`), sonst 404. Mit öffentlichem Audio-Speicher übernimmt im Betrieb der Rewrite
 * `/audio/*` in `vercel.json`; diese Route ist dann der Rückfall. Gleicher Ursprung: die CSP bleibt `'self'`.
 */
export async function GET(anfrage: Request, { params }: RouteContext<'/audio/[...pfad]'>) {
  await connection();
  const { pfad } = await params;
  const schluessel = `audio/${pfad.join('/')}`;
  // Beispielmodus ohne Datenbank (ADR 0019): keine Rezitationen
  if (!istAudioSchluessel(schluessel) || !datenbankVerfuegbar()) return new Response(null, { status: 404 });
  const [eintrag] = await db
    .select({ mime: schema.quranAudio.mime, aktiv: schema.quranRezitation.aktiv })
    .from(schema.quranAudio)
    .innerJoin(schema.quranRezitation, and(eq(schema.quranRezitation.id, schema.quranAudio.rezitationId)))
    .where(eq(schema.quranAudio.pfad, audioAdresse(schluessel)))
    .limit(1);
  if (!eintrag) return new Response(null, { status: 404 });
  if (!eintrag.aktiv) {
    try {
      await verlangeRecht('rezitation.bearbeiten');
    } catch (f) {
      if (f instanceof KeinRecht) return new Response(null, { status: 404 });
      throw f;
    }
  }
  const antwort = await liefereAudio(schluessel, anfrage.headers.get('range'));
  if (!antwort) return new Response(null, { status: 404 });
  const kopf = new Headers(antwort.headers);
  kopf.set('Content-Type', eintrag.mime);
  kopf.set('X-Content-Type-Options', 'nosniff');
  // Inhalts-Hash im Pfad, aber nicht „immutable“: nach dem Abschalten sollen öffentliche Kopien verfallen (wie /medien)
  kopf.set('Cache-Control', eintrag.aktiv ? 'public, max-age=86400' : 'private, no-store');
  return new Response(antwort.body, { status: antwort.status, headers: kopf });
}
