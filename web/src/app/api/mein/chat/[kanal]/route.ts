import { connection } from 'next/server';
import { ladeKanal, ladeNachrichten } from '@/lib/chat/dienst';
import { funktionAn } from '@/lib/funktionen';
import { ladeGruppenKontext, ladeKontoMitFaktor } from '@/lib/rechte/gemeinde';

/**
 * Abruf des Gruppenchats (ADR 0027, Pflichtweg ohne Echtzeitserver): `GET /api/mein/chat/<kanal>?nach=<id>&ab=<id>` liefert
 * neue Nachrichten und die seit `ab` entfernten (S-09); der Browser fragt adaptiv (4 s nach Aktivität, dann 15/30 s, Pause
 * im Hintergrund). Nur mit Sitzung und Gruppenrecht; nie zwischengespeichert.
 */
const KOPF = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' };

export async function GET(anfrage: Request, { params }: { params: Promise<{ kanal: string }> }) {
  await connection();
  if (!(await funktionAn('chat')) || !(await funktionAn('konten'))) return new Response(null, { status: 404, headers: KOPF });
  // Lehrkräfte und Aufsicht nur mit zweitem Faktor (M-1 der Sicherheitsprüfung S1)
  const konto = await ladeKontoMitFaktor();
  if (!konto) return new Response(null, { status: 401, headers: KOPF });
  const { kanal: kanalId } = await params;
  const kanal = await ladeKanal(kanalId);
  if (!kanal) return new Response(null, { status: 404, headers: KOPF });
  const parameter = new URL(anfrage.url).searchParams;
  const id = (wert: string | null) => (wert && /^\d{1,18}$/.test(wert) ? Number(wert) : undefined);
  const ergebnis = await ladeNachrichten(
    kanal,
    await ladeGruppenKontext(konto.benutzerId),
    id(parameter.get('nach')),
    id(parameter.get('ab')),
  );
  // Kein Unterschied zwischen „gibt es nicht“ und „darfst du nicht“
  if (!ergebnis) return new Response(null, { status: 404, headers: KOPF });
  return Response.json(ergebnis, { headers: KOPF });
}
