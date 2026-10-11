import { connection } from 'next/server';
import { pruefeSchluessel, speicher } from '@/lib/storage';
import { ladeMediumNachSchluessel } from '@/server/queries/verwaltung/medien';

/**
 * Auslieferung der Medien (C11, ADR 0007): nur bekannte Einträge außerhalb des Papierkorbs, Typ aus der Datenbank
 * (beim Upload über Magic Bytes bestimmt). Gecacht für 1 Tag, nicht „immutable“: Der Schlüssel enthält zwar den
 * Inhalts-Hash, nach Papierkorb oder Löschung sollen Kopien verfallen (K-05, Tor B/C SP-C2 B7). Die Bildoptimierung
 * (`/_next/image`) übernimmt dieses Höchstalter für ihre Kopien und kennt keine Invalidierung (C11b). PDF in einer Sandbox.
 */
export async function GET(_anfrage: Request, { params }: RouteContext<'/medien/[...schluessel]'>) {
  await connection();
  const { schluessel: teile } = await params;
  let schluessel: string;
  try {
    schluessel = pruefeSchluessel(teile.join('/'));
  } catch {
    return new Response(null, { status: 404 });
  }
  const medium = await ladeMediumNachSchluessel(schluessel);
  if (!medium || medium.imPapierkorbSeit) return new Response(null, { status: 404 });
  const strom = await speicher().lies(schluessel);
  if (!strom) return new Response(null, { status: 404 });
  const kopf: Record<string, string> = {
    'Content-Type': medium.typ,
    'Content-Length': String(medium.groesse),
    'Cache-Control': 'public, max-age=86400',
    'X-Content-Type-Options': 'nosniff',
    'Content-Disposition': 'inline',
  };
  if (medium.typ === 'application/pdf') kopf['Content-Security-Policy'] = "sandbox; default-src 'none'";
  return new Response(strom, { headers: kopf });
}
