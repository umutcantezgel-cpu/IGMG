import { connection } from 'next/server';
import { ladeKanal, leseLage } from '@/lib/chat/dienst';
import { echtzeitAusUmgebung, echtzeitTokens } from '@/lib/echtzeit/centrifugo';
import { funktionAn } from '@/lib/funktionen';
import { ladeGruppenKontext, ladeKontoMitFaktor } from '@/lib/rechte/gemeinde';

/**
 * Tokens für das Echtzeit-Signal eines Kanals (ADR 0027): `GET /api/mein/echtzeit?kanal=<id>`. Nur mit Sitzung und
 * Leserecht; 404, wenn Echtzeit aus ist – der Browser bleibt dann beim Abruf.
 */
const KOPF = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' };

export async function GET(anfrage: Request) {
  await connection();
  const konfig = echtzeitAusUmgebung();
  if (!konfig || !(await funktionAn('echtzeit')) || !(await funktionAn('chat')) || !(await funktionAn('konten')))
    return new Response(null, { status: 404, headers: KOPF });
  const konto = await ladeKontoMitFaktor();
  if (!konto) return new Response(null, { status: 401, headers: KOPF });
  const kanal = await ladeKanal(new URL(anfrage.url).searchParams.get('kanal') ?? '');
  if (!kanal) return new Response(null, { status: 404, headers: KOPF });
  // Nur wer lesen darf (Gruppenrecht, Einwilligung, keine Notfall-Pause) bekommt ein Signal-Token (H-1 der Prüfung S1)
  if ((await leseLage(kanal, await ladeGruppenKontext(konto.benutzerId))) !== 'ok')
    return new Response(null, { status: 404, headers: KOPF });
  return Response.json(echtzeitTokens(konfig, konto.benutzerId, kanal.kanalId), { headers: KOPF });
}
