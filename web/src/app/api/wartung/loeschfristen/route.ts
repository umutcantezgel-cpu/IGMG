import { revalidateTag } from 'next/cache';
import { connection } from 'next/server';
import { TAG } from '@/lib/cache/tags';
import { chatLoeschlauf } from '@/lib/chat/dienst';
import { raeumePushAuf } from '@/lib/push/abo';
import { loescheAbgelaufene } from '@/lib/eingaenge/loeschlauf';
import { gemeindeLoeschlauf } from '@/lib/loeschen/gemeinde';
import { kontenLoeschlauf } from '@/lib/konto/loeschen';
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
    // Gruppenchat (S-12): Nachrichten nach 90 Tagen bzw. 30 Tage nach Gruppenende, erledigte Meldungen nach einem Jahr
    const chat = await chatLoeschlauf();
    // Push-Abos ohne Erfolg seit 12 Monaten (auch wenn der Minutentakt des lokalen Servers ausfällt)
    const push = await raeumePushAuf();
    // Gemeinde-Plattform (DSFA D-04, D-05, D-10, D-13, D-16): Lernende nach Austritt, offene Meldungen nach Höchstfrist,
    // Moderationsprotokoll nach 3 Jahren, nicht zustellbare Mails, Audit-Protokoll
    const gemeinde = await gemeindeLoeschlauf();
    // Platzzählung betroffener Veranstaltungen sofort neu berechnen
    for (const id of ergebnis.betroffeneTermine) revalidateTag(TAG.anmeldungenVon(id), { expire: 0 });
    if (ergebnis.betroffeneTermine.length) revalidateTag(TAG.anmeldungen, { expire: 0 });
    return {
      geloeschteEingaenge: ergebnis.eingaenge,
      geloeschteMails: ergebnis.mails,
      geloeschtAusPapierkorb: ergebnis.papierkorb,
      entfernteMelderdaten: ergebnis.melder,
      geloeschteChatNachrichten: chat.nachrichten,
      geloeschteChatMeldungen: chat.meldungen,
      geloeschtePushAbos: push,
      geloeschteLernende: gemeinde.lernende,
      geloeschteOffeneMeldungen: gemeinde.offeneMeldungen,
      geloeschteProtokolleintraege: gemeinde.protokoll,
      geloeschteUnzustellbareMails: gemeinde.mails,
      geloeschteAuditEintraege: gemeinde.audit,
      // Gemeinde-Konten: Löschanträge nach Frist (Art. 17) und unbestätigte Registrierungen nach 7 Tagen (H-L05)
      ...(await kontenLoeschlauf()),
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
