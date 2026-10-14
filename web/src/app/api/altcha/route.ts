import { connection } from 'next/server';
import { altchaBereit, neueChallenge } from '@/lib/validierung/altcha';

/**
 * ALTCHA-Challenge für öffentliche Formulare (ADR 0005). Je Anfrage neu, nie zwischenspeichern. Ohne Geheimnis
 * (Beispielmodus, ADR 0019) 503 statt Absturz: Formulare lassen sich dort ohnehin nicht absenden.
 */
export async function GET() {
  await connection();
  if (!altchaBereit()) return Response.json({ fehler: 'nicht_eingerichtet' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  const challenge = await neueChallenge();
  return Response.json(challenge, { headers: { 'Cache-Control': 'no-store' } });
}
