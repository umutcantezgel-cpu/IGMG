import 'server-only';
import { createHash, randomBytes } from 'node:crypto';

/**
 * Signierte Vorschau (ADR 0032): Der Link enthält ein zufälliges Token (32 Byte, base64url); gespeichert wird nur sein
 * SHA-256 (`vorschau_token.token_hash`). Gültig 24 Stunden. Wer den Link hat, sieht die Seite im aktuellen Stand –
 * auch als Entwurf –, sonst nichts.
 */
export const VORSCHAU_DAUER_MS = 24 * 60 * 60 * 1000;
export const TOKEN_MUSTER = /^[A-Za-z0-9_-]{43}$/;

export function hashVonToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function neuesVorschauToken(): { token: string; hash: string } {
  const token = randomBytes(32).toString('base64url');
  return { token, hash: hashVonToken(token) };
}
