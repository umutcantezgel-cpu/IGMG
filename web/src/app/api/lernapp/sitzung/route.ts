import { connection } from 'next/server';
import { datenbankVerfuegbar } from '@/lib/db/verfuegbar';
import { funktionAn } from '@/lib/funktionen';
import { hatZugang } from '@/lib/konto/zugang';
import type { SitzungAntwort } from '@/lib/lernapp/sync/protokoll';
import { lernappEinwilligung } from '@/lib/lernapp/sync/server';
import { ladeKontoMitFaktor } from '@/lib/rechte/gemeinde';

/**
 * Sitzung der Lern-App (ADR 0038 Nr. 5 und 7): `GET /api/lernapp/sitzung` sagt nur, ob jemand angemeldet ist, unter
 * welchem Konto (für die Bindung des Lernprofils, ein Profil gehört zu genau einem Konto) und wie die Einwilligung
 * `lernapp` steht. Schalter `lernapp_sync` aus (bzw. ohne Datenbank) → 404: Der Client bietet dann keinen Abgleich an.
 * Nie zwischengespeichert. Die Lern-App fragt sie nur, wenn ein Profil an ein Konto gebunden ist oder die Person die
 * Anmeldung öffnet – ohne Konto entsteht keine Anfrage.
 */
const KOPF = { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex', 'X-Content-Type-Options': 'nosniff' };

export async function GET() {
  await connection();
  if (!datenbankVerfuegbar() || !(await funktionAn('lernapp_sync'))) return new Response(null, { status: 404, headers: KOPF });
  const konto = await ladeKontoMitFaktor();
  const inhalt: SitzungAntwort =
    konto && hatZugang(konto)
      ? {
          angemeldet: true,
          konto: konto.benutzerId,
          einwilligung: await lernappEinwilligung(konto.benutzerId, { istKind: konto.istKind }),
        }
      : { angemeldet: false };
  return Response.json(inhalt, { headers: KOPF });
}
