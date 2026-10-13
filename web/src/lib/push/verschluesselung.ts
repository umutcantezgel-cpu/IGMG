import { createCipheriv, createECDH, createHmac, randomBytes } from 'node:crypto';

/**
 * Web-Push-Verschlüsselung nach RFC 8291 (Inhaltskodierung aes128gcm, RFC 8188) ohne Bibliothek (ADR 0034).
 * Geprüft mit den Zwischenwerten aus RFC 8291 Anhang A (tests/unit/push.test.ts).
 */
export const DATENSATZ_GROESSE = 4096;

const hmac = (schluessel: Buffer, daten: Buffer) => createHmac('sha256', schluessel).update(daten).digest();

export function base64url(daten: Buffer | Uint8Array): string {
  return Buffer.from(daten).toString('base64url');
}

export function ausBase64url(text: string): Buffer {
  return Buffer.from(text.replace(/\s+/g, ''), 'base64url');
}

export type VerschluesselungsEingabe = {
  klartext: Buffer;
  /** Öffentlicher Schlüssel des Browsers (p256dh), 65 Byte unkomprimiert. */
  uaOeffentlich: Buffer;
  /** Authentisierungsgeheimnis des Browsers (auth), 16 Byte. */
  authGeheimnis: Buffer;
  /** Nur für Tests: fester Absenderschlüssel und Salz (sonst zufällig je Nachricht). */
  asPrivat?: Buffer;
  salz?: Buffer;
};

export type Zwischenwerte = { ecdh: Buffer; prkKey: Buffer; ikm: Buffer; prk: Buffer; cek: Buffer; nonce: Buffer };

/** Verschlüsselt eine Nachricht; liefert den fertigen Nachrichtenrumpf (Kopf ‖ Chiffrat) und die Zwischenwerte. */
export function verschluesselePush(e: VerschluesselungsEingabe): { rumpf: Buffer; zwischen: Zwischenwerte } {
  if (e.uaOeffentlich.length !== 65 || e.uaOeffentlich[0] !== 0x04) throw new Error('p256dh ungültig');
  if (e.authGeheimnis.length !== 16) throw new Error('auth ungültig');
  const absender = createECDH('prime256v1');
  if (e.asPrivat) absender.setPrivateKey(e.asPrivat);
  else absender.generateKeys();
  const asOeffentlich = absender.getPublicKey();
  const salz = e.salz ?? randomBytes(16);

  const ecdh = absender.computeSecret(e.uaOeffentlich);
  const prkKey = hmac(e.authGeheimnis, ecdh);
  const keyInfo = Buffer.concat([Buffer.from('WebPush: info\0', 'utf8'), e.uaOeffentlich, asOeffentlich]);
  const ikm = hmac(prkKey, Buffer.concat([keyInfo, Buffer.from([1])]));
  const prk = hmac(salz, ikm);
  const cek = hmac(prk, Buffer.from('Content-Encoding: aes128gcm\0\x01', 'utf8')).subarray(0, 16);
  const nonce = hmac(prk, Buffer.from('Content-Encoding: nonce\0\x01', 'utf8')).subarray(0, 12);

  // Ein Datensatz: Klartext ‖ 0x02 (letzter Datensatz, keine Auffüllung)
  const gepolstert = Buffer.concat([e.klartext, Buffer.from([2])]);
  if (gepolstert.length + 16 > DATENSATZ_GROESSE) throw new Error('Nachricht zu groß');
  const chiffre = createCipheriv('aes-128-gcm', cek, nonce);
  const chiffrat = Buffer.concat([chiffre.update(gepolstert), chiffre.final(), chiffre.getAuthTag()]);

  const kopf = Buffer.alloc(16 + 4 + 1);
  salz.copy(kopf, 0);
  kopf.writeUInt32BE(DATENSATZ_GROESSE, 16);
  kopf.writeUInt8(asOeffentlich.length, 20);
  return { rumpf: Buffer.concat([kopf, asOeffentlich, chiffrat]), zwischen: { ecdh, prkKey, ikm, prk, cek, nonce } };
}
