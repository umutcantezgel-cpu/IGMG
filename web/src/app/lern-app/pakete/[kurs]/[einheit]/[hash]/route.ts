import { TAG } from '@/lib/cache/tags';
import { istPaketKurs, istSchluesselVon, kursVonSlug } from '@/lib/lernapp/kurse';
import { istHash } from '@/lib/lernapp/paket/hash';
import { ladeEinheitJson, ladePaketParameter } from '@/server/queries/lernapp/pakete';

/**
 * Einheitenpaket der Lern-App (ADR 0039 Nr. 2, Fortschreibung S5 Nr. 7): kanonisches JSON je Richtung bzw. Wissenskurs und
 * Einheit unter seinem Inhalts-Hash, unveränderlich. Ein alter oder fremder Hash ergibt 404 (das Verzeichnis nennt den
 * aktuellen). Wissenskurs (`islam`): nur Lektionen, deren Bausteine alle zwei religiöse Freigaben zum aktuellen Hash haben
 * (`paket/wissen.ts`); eine Freigabe oder ein Zurückziehen erneuert den Kurs-Tag. Im Beispielmodus ohne Laufzeit-Datenbank
 * sind alle Einheiten vorgerendert, sonst entstehen sie bei Bedarf.
 *
 * Kopfzeilen: `immutable` für Browser und Service Worker, `Vercel-CDN-Cache-Control` für das CDN (S5) und
 * `Vercel-Cache-Tag: lernapp,lernapp-kurs-<id>,einstellungen`: Ein Zurückziehen (KERN 4.0 §2.3) wirkt über den Kurs-Tag,
 * ein Wechsel der Schalter `lernapp`, `lernapp_ungeprueft` bzw. `lernapp_wissen_vorschau` über `einstellungen` – die
 * Jahreskopie im CDN überdauert beides nicht (S-L1 N-3). Keine Cookies.
 * Der Proxy läuft hier nicht (Matcher ohne `lern-app/(pakete|audio|modelle)`); Schalter `lernapp` aus → 404.
 */
export function generateStaticParams() {
  return ladePaketParameter();
}

const NICHT_DA = { status: 404, headers: { 'Cache-Control': 'no-store' } };

export async function GET(_anfrage: Request, { params }: RouteContext<'/lern-app/pakete/[kurs]/[einheit]/[hash]'>) {
  const { kurs, einheit, hash } = await params;
  if (!istPaketKurs(kurs) || !istSchluesselVon(kursVonSlug(kurs), einheit) || !istHash(hash)) return new Response(null, NICHT_DA);
  const paket = await ladeEinheitJson(kurs, einheit);
  if (!paket || paket.hash !== hash) return new Response(null, NICHT_DA);
  return new Response(paket.json, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Vercel-CDN-Cache-Control': 'max-age=31536000',
      'Vercel-Cache-Tag': `${TAG.lernapp},${TAG.lernappKurs(kursVonSlug(kurs))},${TAG.einstellungen}`,
    },
  });
}
