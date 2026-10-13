import nachrichten from '../../../../../../messages/bereiche/benachrichtigungen.json';
import de from '../../../../../../messages/de.json';
import en from '../../../../../../messages/en.json';
import tr from '../../../../../../messages/tr.json';
import { GEBETE } from '@/lib/gebetszeiten/typen';

/**
 * Wortlaut der Benachrichtigungen je Sprache für den Service Worker (ADR 0034): Die Push-Nachricht selbst trägt nur
 * Art, Gebet und Uhrzeit; Titel und Text setzt der Worker hieraus zusammen. Statisch beim Bau erzeugt.
 */
const SPRACHEN = { de, tr, en } as const;
type Sprache = keyof typeof SPRACHEN;

export function generateStaticParams() {
  return (['de', 'tr', 'en'] as const).map((sprache) => ({ sprache }));
}

export async function GET(_anfrage: Request, { params }: { params: Promise<{ sprache: string }> }) {
  const { sprache } = await params;
  if (!(sprache in SPRACHEN)) return new Response(null, { status: 404 });
  const s = sprache as Sprache;
  const leiste = (SPRACHEN[s] as { leiste?: Record<string, string> }).leiste ?? {};
  const gebete = Object.fromEntries(GEBETE.map((g) => [g, leiste[g] ?? g]));
  return Response.json(
    { ...nachrichten[s].push.sw, gebete },
    { headers: { 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400' } },
  );
}
