import { neueChallenge } from '@/lib/validierung/altcha';

/** ALTCHA-Challenge für öffentliche Formulare (ADR 0005). Nie zwischenspeichern. */
export async function GET() {
  const challenge = await neueChallenge();
  return Response.json(challenge, { headers: { 'Cache-Control': 'no-store' } });
}
