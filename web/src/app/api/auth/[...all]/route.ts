import { toNextJsHandler } from 'better-auth/next-js';
import { auth } from '@/lib/auth/server';
import { datenbankVerfuegbar } from '@/lib/db/verfuegbar';

/** Better-Auth-Endpunkte (Anmeldung, Zwei-Faktor, Passkey). Registrierung ist per Hook gesperrt (ADR 0003). */
const endpunkte = toNextJsHandler(auth);

/** Beispielmodus ohne Datenbank (ADR 0019): keine Anmeldung möglich – 404 statt Fehler. */
function ohneDatenbank(): Response | null {
  return datenbankVerfuegbar() ? null : new Response(null, { status: 404, headers: { 'Cache-Control': 'no-store' } });
}

export async function GET(anfrage: Request): Promise<Response> {
  return ohneDatenbank() ?? endpunkte.GET(anfrage);
}

export async function POST(anfrage: Request): Promise<Response> {
  return ohneDatenbank() ?? endpunkte.POST(anfrage);
}
