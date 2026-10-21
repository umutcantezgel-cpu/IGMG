import { TAG } from '@/lib/cache/tags';
import { istSchluesselVon } from '@/lib/lernapp/kurse';
import { istBedeutungsSprache } from '@/lib/lernapp/koran/typen';
import { istHash } from '@/lib/lernapp/paket/hash';
import { ladeKoranEinheitJson, ladeKoranPaketParameter } from '@/server/queries/lernapp/koran';

/**
 * Einheitenpaket des Koran-Arabisch-Pfads (L6-05): kanonisches JSON unter seinem SHA-256, unveränderlich. Ein alter Hash ergibt
 * 404 (das Verzeichnis nennt den aktuellen). Bedeutungen nur mit zwei Freigaben, Lektionen nur vollständig freigegeben, kein
 * Audio außer Wortzeiten geprüfter Rezitationen (`paket/koran.ts`). Der Kurs-Tag im CDN sorgt dafür, dass ein Zurückziehen
 * sofort wirkt (wie bei den Sprachkursen). Keine Cookies; Schalter `lernapp` aus → 404.
 */
export function generateStaticParams() {
  return ladeKoranPaketParameter();
}

const NICHT_DA = { status: 404, headers: { 'Cache-Control': 'no-store' } };

export async function GET(_anfrage: Request, { params }: RouteContext<'/lern-app/pakete/koran/[sprache]/[einheit]/[hash]'>) {
  const { sprache, einheit, hash } = await params;
  if (!istBedeutungsSprache(sprache) || !istSchluesselVon('koran', einheit) || !istHash(hash)) return new Response(null, NICHT_DA);
  const paket = await ladeKoranEinheitJson(sprache, einheit);
  if (!paket || paket.hash !== hash) return new Response(null, NICHT_DA);
  return new Response(paket.json, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Vercel-CDN-Cache-Control': 'max-age=31536000',
      'Vercel-Cache-Tag': `${TAG.lernapp},${TAG.lernappKurs('koran')},${TAG.einstellungen}`,
    },
  });
}
