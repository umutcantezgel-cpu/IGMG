import 'server-only';
import { createChallenge, randomInt, verifySolution, type Challenge, type Payload } from 'altcha-lib';
import { deriveKey } from 'altcha-lib/algorithms/pbkdf2';
import { lt, sql } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { sha256 } from '@/lib/krypto';

/**
 * ALTCHA, selbst gehostet (K-07, ADR 0005): Proof-of-Work ohne Drittanbieter und ohne Cookies.
 * Wiederverwendung wird über `verbrauchte_challenge` verhindert (atomar per Primärschlüssel).
 */
const GUELTIG_MINUTEN = 10;
const KOSTEN = 5_000;

function geheimnisse(): { signatur: string; schluessel: string } {
  const g = process.env.ALTCHA_GEHEIMNIS;
  if (!g) throw new Error('ALTCHA_GEHEIMNIS fehlt.');
  return { signatur: sha256(`signatur|${g}`), schluessel: sha256(`schluessel|${g}`) };
}

export async function neueChallenge(): Promise<Challenge> {
  const g = geheimnisse();
  return createChallenge({
    algorithm: 'PBKDF2/SHA-256',
    cost: KOSTEN,
    counter: randomInt(KOSTEN, KOSTEN * 2),
    deriveKey,
    expiresAt: new Date(Date.now() + GUELTIG_MINUTEN * 60_000),
    hmacSignatureSecret: g.signatur,
    hmacKeySignatureSecret: g.schluessel,
  });
}

function leseNutzlast(roh: unknown): Payload | null {
  if (typeof roh !== 'string' || roh.length === 0 || roh.length > 10_000) return null;
  try {
    const p = JSON.parse(Buffer.from(roh, 'base64').toString('utf8')) as Payload;
    return p && typeof p === 'object' && 'challenge' in p && 'solution' in p ? p : null;
  } catch {
    return null;
  }
}

/** Prüft die Lösung und markiert sie als verbraucht. true = gültig und erstmals verwendet. */
export async function pruefeAltcha(roh: unknown): Promise<boolean> {
  const nutzlast = leseNutzlast(roh);
  if (!nutzlast) return false;
  const g = geheimnisse();
  const ergebnis = await verifySolution({
    challenge: nutzlast.challenge,
    solution: nutzlast.solution,
    deriveKey,
    hmacSignatureSecret: g.signatur,
    hmacKeySignatureSecret: g.schluessel,
  });
  if (!ergebnis.verified) return false;
  const kennung = sha256(nutzlast.challenge.signature ?? nutzlast.challenge.parameters.nonce);
  const ablauf = new Date((nutzlast.challenge.parameters.expiresAt ?? Math.floor(Date.now() / 1000) + GUELTIG_MINUTEN * 60) * 1000);
  const eingefuegt = await db
    .insert(schema.verbrauchteChallenge)
    .values({ signaturHash: kennung, laeuftAb: ablauf })
    .onConflictDoNothing()
    .returning({ k: schema.verbrauchteChallenge.signaturHash });
  return eingefuegt.length === 1;
}

/** Abgelaufene Einträge entfernen (Wartungsroute). */
export async function raeumeAltchaAuf(): Promise<void> {
  await db.delete(schema.verbrauchteChallenge).where(lt(schema.verbrauchteChallenge.laeuftAb, sql`now()`));
}
