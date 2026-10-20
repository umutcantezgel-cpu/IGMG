import { istKursSlug, KURS_SLUGS } from '@/lib/lernapp/kurse';
import { ladeVerzeichnisJson } from '@/server/queries/lernapp/pakete';

/**
 * Kursverzeichnis der Lern-App (ADR 0039 Nr. 2): Stand, Einheiten mit Hash und Größe der Pakete und Audio-Bündel. Statisch
 * vorgerendert und gecacht (`'use cache: remote'`, `cacheLife('max')`, Tag `lernapp-kurs-<id>`); jede Freigabe und jedes
 * Zurückziehen erneuert es über `updateTag`. Schalter `lernapp` aus → 404. Ohne Cookies und ohne Kopfzeilen der Anfrage
 * (öffentlich, KERN 4.0 §6); der Service Worker der Lern-App fragt es „Netz zuerst“ ab (ADR 0039 Nr. 12).
 */
export function generateStaticParams() {
  return KURS_SLUGS.map((kurs) => ({ kurs }));
}

export async function GET(_anfrage: Request, { params }: RouteContext<'/lern-app/pakete/[kurs]'>) {
  const { kurs } = await params;
  const json = istKursSlug(kurs) ? await ladeVerzeichnisJson(kurs) : null;
  if (!json) return new Response(null, { status: 404, headers: { 'Cache-Control': 'no-store' } });
  return new Response(json, {
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'X-Content-Type-Options': 'nosniff' },
  });
}
