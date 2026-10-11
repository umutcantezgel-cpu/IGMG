import 'server-only';
import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

/**
 * Verschlüsselung schutzwürdiger Daten (ADR 0005): AES-256-GCM, Schlüssel aus EINGANG_SCHLUESSEL,
 * Format: 12 Byte IV ‖ 16 Byte Auth-Tag ‖ Chiffrat. Schlüssel-ID ermöglicht Rotation.
 */
const IV_LAENGE = 12;
const TAG_LAENGE = 16;

function schluessel(): { id: number; key: Buffer } {
  const roh = process.env.EINGANG_SCHLUESSEL;
  if (!roh) throw new Error('EINGANG_SCHLUESSEL fehlt.');
  const key = Buffer.from(roh, 'base64');
  if (key.length !== 32) throw new Error('EINGANG_SCHLUESSEL muss 32 Byte (Base64) lang sein.');
  return { id: Number(process.env.EINGANG_SCHLUESSEL_ID ?? '1'), key };
}

/** Alte Schlüssel für die Rotation: EINGANG_SCHLUESSEL_ALT_<ID>=<base64>. */
function schluesselFuerId(id: number): Buffer {
  const aktuell = schluessel();
  if (id === aktuell.id) return aktuell.key;
  const alt = process.env[`EINGANG_SCHLUESSEL_ALT_${id}`];
  if (!alt) throw new Error(`Schlüssel ${id} nicht verfügbar.`);
  return Buffer.from(alt, 'base64');
}

export function verschluessele(daten: unknown): { daten: Buffer; schluesselId: number } {
  const { id, key } = schluessel();
  const iv = randomBytes(IV_LAENGE);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const klar = Buffer.from(JSON.stringify(daten), 'utf8');
  const chiffrat = Buffer.concat([cipher.update(klar), cipher.final()]);
  return { daten: Buffer.concat([iv, cipher.getAuthTag(), chiffrat]), schluesselId: id };
}

export function entschluessele<T = unknown>(paket: Buffer, schluesselId: number): T {
  const key = schluesselFuerId(schluesselId);
  const iv = paket.subarray(0, IV_LAENGE);
  const tag = paket.subarray(IV_LAENGE, IV_LAENGE + TAG_LAENGE);
  const chiffrat = paket.subarray(IV_LAENGE + TAG_LAENGE);
  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const klar = Buffer.concat([decipher.update(chiffrat), decipher.final()]);
  return JSON.parse(klar.toString('utf8')) as T;
}

/** SHA-256 als Hex (Token-Hashes, Textversionen der Einwilligungen). */
export function sha256(text: string): string {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

/** HMAC-SHA-256 als Hex mit einem Geheimnis aus der Umgebung (Ratenbegrenzung: IP nie im Klartext). */
export function hmac(text: string, geheimnisVariable: 'RATE_GEHEIMNIS' | 'ALTCHA_GEHEIMNIS'): string {
  const geheimnis = process.env[geheimnisVariable];
  if (!geheimnis || geheimnis.length < 32) throw new Error(`${geheimnisVariable} fehlt oder ist kürzer als 32 Zeichen.`);
  return createHmac('sha256', geheimnis).update(text, 'utf8').digest('hex');
}

/** Zufälliges Token (Einladungen) in URL-sicherer Form. */
export function zufallsToken(bytes = 32): string {
  return randomBytes(bytes).toString('base64url');
}

/** Zeitkonstanter Vergleich zweier Zeichenketten – auch die Länge verrät nichts (beide Seiten erst gehasht). */
export function gleich(a: string, b: string): boolean {
  const pa = createHash('sha256').update(a, 'utf8').digest();
  const pb = createHash('sha256').update(b, 'utf8').digest();
  return timingSafeEqual(pa, pb);
}
