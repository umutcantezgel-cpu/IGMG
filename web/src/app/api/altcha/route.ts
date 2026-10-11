import { connection } from 'next/server';
import { neueChallenge } from '@/lib/validierung/altcha';

/** ALTCHA-Challenge für öffentliche Formulare (ADR 0005). Je Anfrage neu, nie zwischenspeichern. */
export async function GET() {
  await connection();
  const challenge = await neueChallenge();
  return Response.json(challenge, { headers: { 'Cache-Control': 'no-store' } });
}
