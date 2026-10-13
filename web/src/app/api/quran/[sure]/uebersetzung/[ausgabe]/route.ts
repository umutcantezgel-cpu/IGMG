import { betriebsart } from '@/lib/umgebung';
import { ladeAusgaben, ladeQuranStand, ladeUebersetzungstext } from '@/server/queries/quran';

/**
 * Text einer Übersetzungsausgabe je Sure als statische JSON-Datei (Ausgabewechsel im Leser). Nur sichtbare Ausgaben:
 * freigegebene immer, nicht freigegebene nur in Entwicklung und Vorschau (lib/quran/ausgaben.ts).
 */
const vorschau = () => betriebsart(process.env) !== 'produktion';

export async function generateStaticParams() {
  const [{ suren }, ausgaben] = await Promise.all([ladeQuranStand(), ladeAusgaben(vorschau())]);
  const paare = suren.flatMap((s) => ausgaben.map((a) => ({ sure: String(s.nr), ausgabe: a.id })));
  return paare.length ? paare : [{ sure: '_', ausgabe: '_' }];
}

export async function GET(_anfrage: Request, ctx: RouteContext<'/api/quran/[sure]/uebersetzung/[ausgabe]'>) {
  const { sure, ausgabe } = await ctx.params;
  if (!/^[1-9]\d{0,2}$/.test(sure)) return new Response(null, { status: 404 });
  const daten = await ladeUebersetzungstext(Number(sure), ausgabe, vorschau());
  if (!daten || !daten.verse.length) return new Response(null, { status: 404 });
  return Response.json(daten);
}
