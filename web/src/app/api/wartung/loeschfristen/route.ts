import { revalidateTag } from 'next/cache';
import { connection } from 'next/server';
import { TAG } from '@/lib/cache/tags';
import { loescheAbgelaufene } from '@/lib/eingaenge/loeschlauf';
import { mitSperre } from '@/lib/wartung/sperre';
import { cronErlaubt, wartungErlaubt } from '@/lib/wartung/zugang';

/**
 * Löschfristen (C16, G-07): löscht Eingänge nach Ablauf ihrer Frist, leert den Papierkorb nach 30 Tagen (K-05) und
 * räumt Mail-Ausgang, ALTCHA und Ratenfenster auf.
 *
 * Aufruf: täglich per Vercel Cron als `GET` mit `Authorization: Bearer <CRON_SECRET>`; von Hand als `POST` mit
 * `Authorization: Bearer <WARTUNG_TOKEN>`. Beide Wege laufen durch dieselbe Funktion `laufe()`.
 * Idempotent: Ein zweiter Lauf findet nichts mehr Fälliges. Die Sperre verhindert parallele Läufe; ist sie belegt,
 * antwortet die Route mit `{ uebersprungen: true }` und tut nichts.
 */
async function laufe(): Promise<Response> {
  const lauf = await mitSperre('loeschfristen', async () => {
    const ergebnis = await loescheAbgelaufene();
    // Platzzählung betroffener Veranstaltungen sofort neu berechnen
    for (const id of ergebnis.betroffeneTermine) revalidateTag(TAG.anmeldungenVon(id), { expire: 0 });
    if (ergebnis.betroffeneTermine.length) revalidateTag(TAG.anmeldungen, { expire: 0 });
    return {
      geloeschteEingaenge: ergebnis.eingaenge,
      geloeschteMails: ergebnis.mails,
      geloeschtAusPapierkorb: ergebnis.papierkorb,
      entfernteMelderdaten: ergebnis.melder,
    };
  });
  return Response.json(lauf.uebersprungen ? { uebersprungen: true } : lauf.ergebnis, {
    headers: { 'Cache-Control': 'no-store' },
  });
}

/** Vercel Cron (CRON_SECRET). */
export async function GET(anfrage: Request) {
  await connection();
  if (!cronErlaubt(anfrage)) return new Response(null, { status: 401 });
  return laufe();
}

/** Handaufruf (WARTUNG_TOKEN). */
export async function POST(anfrage: Request) {
  await connection();
  if (!wartungErlaubt(anfrage)) return new Response(null, { status: 401 });
  return laufe();
}
