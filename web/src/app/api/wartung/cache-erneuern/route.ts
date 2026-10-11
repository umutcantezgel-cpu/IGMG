import { revalidateTag } from 'next/cache';
import { START_TAGS } from '@/lib/cache/tags';
import { wartungErlaubt } from '@/lib/wartung/zugang';

/**
 * Lässt alle Inhalts-Tags sofort verfallen (ADR 0017): Nach dem Start eines Images, das gegen die
 * Bau-Datenbank vorgerendert wurde, rendert die erste Anfrage je Seite aus der echten Datenbank neu.
 * Aufruf: beim Start durch `src/instrumentation.ts`, sonst manuell (BETRIEB.md).
 */
export async function POST(anfrage: Request) {
  if (!wartungErlaubt(anfrage)) return new Response(null, { status: 401 });
  for (const tag of START_TAGS) revalidateTag(tag, { expire: 0 });
  return Response.json({ erneuert: START_TAGS.length }, { headers: { 'Cache-Control': 'no-store' } });
}
