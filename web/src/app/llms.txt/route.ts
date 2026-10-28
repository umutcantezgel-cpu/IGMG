import { indexierungGesperrt } from '@/lib/seo/indexierung';
import { llmsText } from '@/lib/seo/llms';
import { basisUrl } from '@/lib/seo/metadaten';
import { ladeEinstellung } from '@/server/queries/einstellungen';

/**
 * `/llms.txt` für Antwortmaschinen (ADR 0049): Entität, Fakten mit Quelle und die wichtigsten Seiten in drei Sprachen
 * (`src/lib/seo/llms.ts`). Statisch vorgerendert (K-01): nur die gecachte Einstellung „allgemein“, keine Anfrage-Daten;
 * Änderungen in der Verwaltung erneuern den Tag „einstellungen“. Unter derselben Schranke wie `noindex`: Solange der
 * Konzept-Hinweis auf Vercel eingeschaltet ist, antwortet die Route mit 404. Der Proxy lässt Pfade mit Punkt aus
 * (`src/proxy.ts`), die Datei liegt deshalb ohne Sprachpräfix an der Wurzel.
 */
export async function GET() {
  const { konzepthinweis } = await ladeEinstellung('allgemein');
  if (indexierungGesperrt(konzepthinweis)) return new Response(null, { status: 404 });
  return new Response(llmsText(basisUrl()), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
