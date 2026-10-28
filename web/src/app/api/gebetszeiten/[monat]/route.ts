import { API_KOPFZEILEN, apiAntwort, monatErlaubt, vorgerenderteMonate } from '@/lib/gebetszeiten/lese-api';
import { heuteBerlin } from '@/lib/zeit/heute';
import { ladeEinstellung } from '@/server/queries/einstellungen';
import { ladeGebetszeitenMonat } from '@/server/queries/gebetszeiten';

/**
 * Lese-API der Gebetszeiten (ADR 0048, ADR 0008 „Monatsdaten als statisches JSON“): `/api/gebetszeiten/2026-11` liefert
 * alle Tage des Monats mit Herkunft je Tag, Quelle und Stand. Statisch (Vormonat bis +12 Monate beim Bau vorgerendert,
 * weitere Monate bis ±12 bei Bedarf), erneuert über die Tags der Monatsabfrage; sonst 404. Ohne Cookies und ohne
 * Personendaten; CORS `*` nur für GET.
 */
export async function generateStaticParams() {
  const { datum } = await heuteBerlin();
  return vorgerenderteMonate(datum).map((monat) => ({ monat }));
}

export async function GET(_anfrage: Request, ctx: RouteContext<'/api/gebetszeiten/[monat]'>) {
  const { monat } = await ctx.params;
  const { datum } = await heuteBerlin();
  if (!monatErlaubt(monat, datum)) return new Response(null, { status: 404, headers: { 'Cache-Control': 'no-store' } });
  const [daten, einstellung] = await Promise.all([ladeGebetszeitenMonat(monat), ladeEinstellung('gebetszeiten')]);
  return Response.json(apiAntwort(daten, einstellung.abgleich.stadtName), { headers: API_KOPFZEILEN });
}
