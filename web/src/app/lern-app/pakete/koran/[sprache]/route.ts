import { BEDEUTUNGS_SPRACHEN, istBedeutungsSprache } from '@/lib/lernapp/koran/typen';
import { ladeKoranVerzeichnisJson } from '@/server/queries/lernapp/koran';

/**
 * Verzeichnis des Koran-Arabisch-Pfads je Sprache der Bedeutungen (L6-05, `lib/lernapp/koran/typen.ts`): Einheiten mit Hash
 * und Größe der Pakete, Zahl der Wortformen, der freigegebenen Bedeutungen und der spielbaren Lektionen. Gecacht (Tags
 * `lernapp`, `lernapp-kurs-koran`, `quran`, `rezitationen`, `einstellungen`); jede Freigabe erneuert es. Ohne Cookies und
 * ohne Kopfzeilen der Anfrage; der Service Worker fragt es „Netz zuerst“ ab. Schalter `lernapp` aus → 404.
 */
export function generateStaticParams() {
  return BEDEUTUNGS_SPRACHEN.map((sprache) => ({ sprache }));
}

export async function GET(_anfrage: Request, { params }: RouteContext<'/lern-app/pakete/koran/[sprache]'>) {
  const { sprache } = await params;
  const json = istBedeutungsSprache(sprache) ? await ladeKoranVerzeichnisJson(sprache) : null;
  if (!json) return new Response(null, { status: 404, headers: { 'Cache-Control': 'no-store' } });
  return new Response(json, { headers: { 'Content-Type': 'application/json; charset=utf-8', 'X-Content-Type-Options': 'nosniff' } });
}
