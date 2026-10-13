import { connection } from 'next/server';
import { funktionAn } from '@/lib/funktionen';
import { fuehreTaktAus } from '@/lib/push/abo';
import { vapidAusUmgebung } from '@/lib/push/vapid';
import { mitSperre } from '@/lib/wartung/sperre';
import { cronErlaubt, wartungErlaubt } from '@/lib/wartung/zugang';

/**
 * Minutentakt (ADR 0034, MN-18): fällige Gebetserinnerungen senden. Aufruf jede Minute vom lokalen Server
 * (`POST`, `Authorization: Bearer <WARTUNG_TOKEN>`) oder – nach Entscheidung – von Vercel Cron (`GET`, CRON_SECRET).
 * Idempotent (Einmal-Schlüssel je Abo, Tag und Gebet); die Sperre verhindert parallele Läufe.
 */
async function laufe(): Promise<Response> {
  const kopf = { 'Cache-Control': 'no-store' };
  const vapid = vapidAusUmgebung();
  if (!vapid || !(await funktionAn('push')) || !(await funktionAn('push_gebet'))) return Response.json({ aus: true }, { headers: kopf });
  const lauf = await mitSperre('takt', () => fuehreTaktAus(vapid));
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
