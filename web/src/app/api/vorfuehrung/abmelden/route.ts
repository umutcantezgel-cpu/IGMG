import { connection, NextResponse } from 'next/server';
import { VORFUEHRUNG_COOKIE } from '@/lib/vorfuehrung/konten';
import { vorfuehrung } from '@/lib/vorfuehrung/modus';

/**
 * Abmelden auf der Anmeldeseite der Vorführung (ADR 0052): Cookie des Testzugangs löschen und zurück zur Anmeldeseite.
 * Ein gewöhnlicher Link wie die Anmeldung (`../anmelden/route.ts`); außerhalb der Vorführung 404.
 */
export async function GET() {
  // Je Anfrage beantwortet, nie beim Bau vorab erzeugt (sonst läge die Antwort samt Cookie fest im Bau)
  await connection();
  if (!vorfuehrung()) return new Response(null, { status: 404, headers: { 'Cache-Control': 'no-store' } });
  const antwort = new NextResponse(null, {
    status: 303,
    headers: { Location: '/verwaltung/anmelden?abgemeldet=1', 'Cache-Control': 'no-store' },
  });
  antwort.cookies.delete(VORFUEHRUNG_COOKIE);
  return antwort;
}
