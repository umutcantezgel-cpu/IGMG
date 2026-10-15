import { connection } from 'next/server';
import { funktionAn } from '@/lib/funktionen';
import { fuehreTaktAus, type TaktErgebnis } from '@/lib/push/abo';
import { sendeFaelligeAnkuendigungen } from '@/lib/push/ankuendigung';
import { vapidAusUmgebung } from '@/lib/push/vapid';
import { meldeTakt } from '@/lib/wartung/lokal';
import { mitSperre } from '@/lib/wartung/sperre';
import { cronErlaubt, wartungErlaubt } from '@/lib/wartung/zugang';

/**
 * Minutentakt (ADR 0034, MN-18): fällige Gebetserinnerungen (Schalter `push_gebet`) und Ankündigungen, deren
 * Sichtbarkeit gerade begonnen hat (Schalter `push`; der Cache-Tag `ankuendigungen` verfällt vorher sofort). Aufruf
 * jede Minute vom lokalen Server (`POST`, `Authorization: Bearer <WARTUNG_TOKEN>`) oder – nach Entscheidung – von
 * Vercel Cron (`GET`, CRON_SECRET).
 * Idempotent (Einmal-Schlüssel je Abo und Gebet bzw. Ankündigung); die Sperre verhindert parallele Läufe. Jeder
 * berechtigte Aufruf hinterlässt ein Lebenszeichen für das Startklar-Cockpit (Takt läuft), auch wenn Push aus ist.
 */
const OHNE_GEBET: TaktErgebnis = { gebetsErinnerungen: 0, fehlgeschlagen: 0, geloeschteAbos: 0 };

async function laufe(): Promise<Response> {
  const kopf = { 'Cache-Control': 'no-store' };
  await meldeTakt();
  const vapid = vapidAusUmgebung();
  if (!vapid || !(await funktionAn('push'))) return Response.json({ aus: true }, { headers: kopf });
  const gebet = await funktionAn('push_gebet');
  const lauf = await mitSperre('takt', async () => ({
    ...(gebet ? await fuehreTaktAus(vapid) : OHNE_GEBET),
    ankuendigungen: await sendeFaelligeAnkuendigungen(vapid),
  }));
  return Response.json(lauf.uebersprungen ? { uebersprungen: true } : lauf.ergebnis, { headers: kopf });
}

export async function GET(anfrage: Request) {
  await connection();
  if (!cronErlaubt(anfrage)) return new Response(null, { status: 401 });
  return laufe();
}

export async function POST(anfrage: Request) {
  await connection();
  if (!wartungErlaubt(anfrage)) return new Response(null, { status: 401 });
  return laufe();
}
