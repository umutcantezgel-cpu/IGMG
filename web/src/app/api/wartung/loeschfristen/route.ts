import { revalidateTag } from 'next/cache';
import { connection } from 'next/server';
import { TAG } from '@/lib/cache/tags';
import { loescheAbgelaufene } from '@/lib/eingaenge/loeschlauf';
import { wartungErlaubt } from '@/lib/wartung/zugang';

/**
 * Löschfristen (C16, G-07): löscht Eingänge nach Ablauf ihrer Frist und räumt Mail-Ausgang, ALTCHA und Ratenfenster
 * auf. Nur mit `Authorization: Bearer <WARTUNG_TOKEN>`; täglich per Cron aufrufen (BETRIEB.md 4).
 */
export async function POST(anfrage: Request) {
  await connection();
  if (!wartungErlaubt(anfrage)) return new Response(null, { status: 401 });
  const ergebnis = await loescheAbgelaufene();
  // Platzzählung betroffener Veranstaltungen sofort neu berechnen
  for (const id of ergebnis.betroffeneTermine) revalidateTag(TAG.anmeldungenVon(id), { expire: 0 });
  if (ergebnis.betroffeneTermine.length) revalidateTag(TAG.anmeldungen, { expire: 0 });
  return Response.json(
    { geloeschteEingaenge: ergebnis.eingaenge, geloeschteMails: ergebnis.mails },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
