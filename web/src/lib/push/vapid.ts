import { createECDH, createPrivateKey, createPublicKey, generateKeyPairSync, sign, verify, type KeyObject } from 'node:crypto';
import { ausBase64url, base64url } from './verschluesselung';

/**
 * VAPID (RFC 8292): Der Server weist sich beim Push-Dienst mit einem ES256-JWT aus. Geheimer Schlüssel aus der Umgebung
 * (`VAPID_PRIVAT`, 32 Byte base64url, erzeugt mit `pnpm geheimnisse:erzeugen`), Kontakt `VAPID_KONTAKT` (mailto:/https:,
 * MENSCHEN MN-17). Der öffentliche Schlüssel (65 Byte unkomprimiert) wird daraus berechnet. Ohne beides bleibt Push aus.
 */
export type VapidSchluessel = { oeffentlich: string; privat: string; kontakt: string };

/** Öffentlicher Schlüssel (base64url, 65 Byte) zum geheimen Skalar; null bei ungültigem Schlüssel. */
export function oeffentlichAusPrivat(privat: string): string | null {
  try {
    const roh = ausBase64url(privat);
    if (roh.length !== 32) return null;
    const ecdh = createECDH('prime256v1');
    ecdh.setPrivateKey(roh);
    return base64url(ecdh.getPublicKey());
  } catch {
    return null;
  }
}

export function vapidAusUmgebung(env: Record<string, string | undefined> = process.env): VapidSchluessel | null {
  const privat = env.VAPID_PRIVAT?.trim();
  const kontakt = env.VAPID_KONTAKT?.trim();
  if (!privat || !kontakt || !/^(mailto:|https:\/\/)/.test(kontakt)) return null;
  const oeffentlich = oeffentlichAusPrivat(privat);
  return oeffentlich ? { oeffentlich, privat, kontakt } : null;
}

/** Schlüsselpaar für `.env` (base64url). */
export function erzeugeVapid(): { oeffentlich: string; privat: string } {
  const { publicKey, privateKey } = generateKeyPairSync('ec', { namedCurve: 'P-256' });
  const jwk = privateKey.export({ format: 'jwk' });
  const pub = publicKey.export({ format: 'jwk' });
  const oeffentlich = Buffer.concat([Buffer.from([4]), ausBase64url(pub.x!), ausBase64url(pub.y!)]);
  return { oeffentlich: base64url(oeffentlich), privat: jwk.d! };
}

function privaterSchluessel(s: VapidSchluessel): KeyObject {
  const roh = ausBase64url(s.oeffentlich);
  return createPrivateKey({
    key: { kty: 'EC', crv: 'P-256', d: s.privat, x: base64url(roh.subarray(1, 33)), y: base64url(roh.subarray(33, 65)) },
    format: 'jwk',
  });
}

export function oeffentlicherSchluessel(oeffentlich: string): KeyObject {
  const roh = ausBase64url(oeffentlich);
  return createPublicKey({
    key: { kty: 'EC', crv: 'P-256', x: base64url(roh.subarray(1, 33)), y: base64url(roh.subarray(33, 65)) },
    format: 'jwk',
  });
}

/** Authorization-Kopf `vapid t=<JWT>, k=<öffentlicher Schlüssel>` für einen Push-Endpunkt (gültig 12 h). */
export function vapidKopf(endpunkt: string, s: VapidSchluessel, jetztSek = Math.floor(Date.now() / 1000)): string {
  const aud = new URL(endpunkt).origin;
  const kopf = base64url(Buffer.from(JSON.stringify({ typ: 'JWT', alg: 'ES256' })));
  const nutz = base64url(Buffer.from(JSON.stringify({ aud, exp: jetztSek + 12 * 60 * 60, sub: s.kontakt })));
  const daten = Buffer.from(`${kopf}.${nutz}`);
  const signatur = sign('sha256', daten, { key: privaterSchluessel(s), dsaEncoding: 'ieee-p1363' });
  return `vapid t=${kopf}.${nutz}.${base64url(signatur)}, k=${s.oeffentlich}`;
}

/** Prüft ein VAPID-JWT (für Tests). */
export function pruefeVapid(jwt: string, oeffentlich: string): { aud: string; exp: number; sub: string } | null {
  const [kopf, nutz, sig] = jwt.split('.');
  const ok = verify(
    'sha256',
    Buffer.from(`${kopf}.${nutz}`),
    { key: oeffentlicherSchluessel(oeffentlich), dsaEncoding: 'ieee-p1363' },
    ausBase64url(sig),
  );
  return ok ? (JSON.parse(ausBase64url(nutz).toString('utf8')) as { aud: string; exp: number; sub: string }) : null;
}
