import { connection } from 'next/server';
import { ladeKanal } from '@/lib/chat/dienst';
import { echtzeitAusUmgebung, echtzeitTokens } from '@/lib/echtzeit/centrifugo';
import { funktionAn } from '@/lib/funktionen';
import { darfInGruppe } from '@/lib/rechte/gruppen';
import { ladeGruppenKontext, ladeKonto } from '@/lib/rechte/gemeinde';

/**
 * Tokens für das Echtzeit-Signal eines Kanals (ADR 0027): `GET /api/mein/echtzeit?kanal=<id>`. Nur mit Sitzung und
 * Leserecht; 404, wenn Echtzeit aus ist – der Browser bleibt dann beim Abruf.
 */
const KOPF = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' };

export async function GET(anfrage: Request) {
  await connection();
  const konfig = echtzeitAusUmgebung();
  if (!konfig || !(await funktionAn('echtzeit')) || !(await funktionAn('chat'))) return new Response(null, { status: 404, headers: KOPF });
  const konto = await ladeKonto();
  if (!konto) return new Response(null, { status: 401, headers: KOPF });
  const kanal = await ladeKanal(new URL(anfrage.url).searchParams.get('kanal') ?? '');
  if (!kanal) return new Response(null, { status: 404, headers: KOPF });
  const kontext = await ladeGruppenKontext(konto.benutzerId);
  if (!darfInGruppe(kontext, kanal.art === 'gruppe' ? 'chat.gruppe.lesen' : 'chat.eltern.lesen', kanal.gruppeId))
    return new Response(null, { status: 404, headers: KOPF });
  return Response.json(echtzeitTokens(konfig, konto.benutzerId, kanal.kanalId), { headers: KOPF });
}
