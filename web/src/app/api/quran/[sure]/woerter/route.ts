import { ladeQuranStand, ladeWortDaten } from '@/server/queries/quran';

/**
 * Wortdaten einer Sure als statische JSON-Datei (O-Q01): Wortformen mit Vorkommen, geprüfte Bedeutungen, Tajwid je
 * Vers und die Regeln. Lädt die Wortkarte erst bei Bedarf. Beim Bau für alle 114 Suren erzeugt, ohne Cookies.
 */
export async function generateStaticParams() {
  const { suren } = await ladeQuranStand();
  return suren.length ? suren.map((s) => ({ sure: String(s.nr) })) : [{ sure: '_' }];
}

export async function GET(_anfrage: Request, ctx: RouteContext<'/api/quran/[sure]/woerter'>) {
  const roh = (await ctx.params).sure;
  const daten = await ladeWortDaten(/^[1-9]\d{0,2}$/.test(roh) ? Number(roh) : Number.NaN);
  if (!daten) return new Response(null, { status: 404 });
  return Response.json(daten);
}
