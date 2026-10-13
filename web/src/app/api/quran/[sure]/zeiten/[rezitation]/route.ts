import { ladeRezitationsSuren, ladeZeiten } from '@/server/queries/quran';

/**
 * Audio und Zeiten einer Sure für eine aktive Rezitation als statische JSON-Datei (Player, ADR 0029): Dateien,
 * Versgrenzen und geprüfte Wortzeiten. Erzeugt für jede Sure mit Aufnahme; ohne aktive Rezitation ein Platzhalter.
 */
export async function generateStaticParams() {
  const paare = await ladeRezitationsSuren();
  return paare.length ? paare.map((p) => ({ sure: String(p.sure), rezitation: p.rezitation })) : [{ sure: '_', rezitation: '_' }];
}

export async function GET(_anfrage: Request, ctx: RouteContext<'/api/quran/[sure]/zeiten/[rezitation]'>) {
  const { sure, rezitation } = await ctx.params;
  if (!/^[1-9]\d{0,2}$/.test(sure)) return new Response(null, { status: 404 });
  const daten = await ladeZeiten(Number(sure), rezitation);
  if (!daten) return new Response(null, { status: 404 });
  return Response.json(daten);
}
