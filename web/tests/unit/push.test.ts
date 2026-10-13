import { createDecipheriv, createECDH, createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { erlaubterEndpunkt } from '@/lib/push/senden';
import { erzeugeVapid, pruefeVapid, vapidAusUmgebung, vapidKopf } from '@/lib/push/vapid';
import { ausBase64url, base64url, verschluesselePush } from '@/lib/push/verschluesselung';

/** RFC 8291, Abschnitt 5 und Anhang A (wörtlich). */
const RFC = {
  klartext: 'When I grow up, I want to be a watermelon',
  asPrivat: 'yfWPiYE-n46HLnH0KqZOF1fJJU3MYrct3AELtAQ-oRw',
  uaOeffentlich: 'BCVxsr7N_eNgVRqvHtD0zTZsEc6-VV-JvLexhqUzORcxaOzi6-AYWXvTBHm4bjyPjs7Vd8pZGH6SRpkNtoIAiw4',
  uaPrivat: 'q1dXpw3UpT5VOmu_cf_v6ih07Aems3njxI-JWgLcM94',
  salz: 'DGv6ra1nlYgDCS1FRnbzlw',
  auth: 'BTBZMqHH6r4Tts7J_aSIgg',
  ecdh: 'kyrL1jIIOHEzg3sM2ZWRHDRB62YACZhhSlknJ672kSs',
  prkKey: 'Snr3JMxaHVDXHWJn5wdC52WjpCtd2EIEGBykDcZW32k',
  ikm: 'S4lYMb_L0FxCeq0WhDx813KgSYqU26kOyzWUdsXYyrg',
  prk: '09_eUZGrsvxChDCGRCdkLiDXrReGOEVeSCdCcPBSJSc',
  cek: 'oIhVW04MRdy2XN9CiKLxTg',
  nonce: '4h_95klXJ5E_qnoN',
  rumpf:
    'DGv6ra1nlYgDCS1FRnbzlwAAEABBBP4z9KsN6nGRTbVYI_c7VJSPQTBtkgcy27mlmlMoZIIgDll6e3vCYLocInmYWAmS6TlzAC8wEqKK6PBru3jl7A_yl95bQpu6cVPTpK4Mqgkf1CXztLVBSt2Ks3oZwbuwXPXLWyouBWLVWGNWQexSgSxsj_Qulcy4a-fN',
};

describe('Web Push RFC 8291 (ADR 0034)', () => {
  const { rumpf, zwischen } = verschluesselePush({
    klartext: Buffer.from(RFC.klartext),
    uaOeffentlich: ausBase64url(RFC.uaOeffentlich),
    authGeheimnis: ausBase64url(RFC.auth),
    asPrivat: ausBase64url(RFC.asPrivat),
    salz: ausBase64url(RFC.salz),
  });

  it('Zwischenwerte wie in Anhang A', () => {
    expect(base64url(zwischen.ecdh)).toBe(RFC.ecdh);
    expect(base64url(zwischen.prkKey)).toBe(RFC.prkKey);
    expect(base64url(zwischen.ikm)).toBe(RFC.ikm);
    expect(base64url(zwischen.prk)).toBe(RFC.prk);
    expect(base64url(zwischen.cek)).toBe(RFC.cek);
    expect(base64url(zwischen.nonce)).toBe(RFC.nonce);
  });

  it('Nachrichtenrumpf wie in Abschnitt 5', () => {
    expect(base64url(rumpf)).toBe(RFC.rumpf);
  });

  it('Empfänger entschlüsselt eine zufällige Nachricht', () => {
    const empfaenger = createECDH('prime256v1');
    empfaenger.generateKeys();
    const auth = Buffer.alloc(16, 7);
    const { rumpf: r } = verschluesselePush({
      klartext: Buffer.from('{"art":"probe"}'),
      uaOeffentlich: empfaenger.getPublicKey(),
      authGeheimnis: auth,
    });
    const salz = r.subarray(0, 16);
    const asOeffentlich = r.subarray(21, 86);
    const h = (k: Buffer, d: Buffer) => createHmac('sha256', k).update(d).digest();
    const ecdh = empfaenger.computeSecret(asOeffentlich);
    const ikm = h(
      h(auth, ecdh),
      Buffer.concat([Buffer.from('WebPush: info\0'), empfaenger.getPublicKey(), asOeffentlich, Buffer.from([1])]),
    );
    const prk = h(salz, ikm);
    const cek = h(prk, Buffer.from('Content-Encoding: aes128gcm\0\x01')).subarray(0, 16);
    const nonce = h(prk, Buffer.from('Content-Encoding: nonce\0\x01')).subarray(0, 12);
    const daten = r.subarray(86);
    const d = createDecipheriv('aes-128-gcm', cek, nonce);
    d.setAuthTag(daten.subarray(daten.length - 16));
    const klar = Buffer.concat([d.update(daten.subarray(0, daten.length - 16)), d.final()]);
    expect(klar.subarray(0, -1).toString()).toBe('{"art":"probe"}');
    expect(klar.at(-1)).toBe(2);
  });

  it('VAPID: JWT ES256 mit aud = Ursprung, Ablauf ≤ 24 h, prüfbar', () => {
    const paar = erzeugeVapid();
    const s = vapidAusUmgebung({
      VAPID_OEFFENTLICH: paar.oeffentlich,
      VAPID_PRIVAT: paar.privat,
      VAPID_KONTAKT: 'mailto:technik@example.org',
    })!;
    expect(s).not.toBeNull();
    const kopf = vapidKopf('https://fcm.googleapis.com/fcm/send/abc', s, 1_800_000_000);
    const [, t, k] = kopf.match(/^vapid t=([^,]+), k=(.+)$/)!;
    expect(k).toBe(paar.oeffentlich);
    const nutz = pruefeVapid(t, paar.oeffentlich);
    expect(nutz).toEqual({ aud: 'https://fcm.googleapis.com', exp: 1_800_000_000 + 43_200, sub: 'mailto:technik@example.org' });
  });

  it('VAPID fehlt oder ist kaputt → aus', () => {
    expect(vapidAusUmgebung({})).toBeNull();
    expect(vapidAusUmgebung({ VAPID_PRIVAT: 'def', VAPID_KONTAKT: 'mailto:x@y' })).toBeNull();
    expect(vapidAusUmgebung({ VAPID_PRIVAT: erzeugeVapid().privat, VAPID_KONTAKT: 'kein-kontakt' })).toBeNull();
  });

  it('nur bekannte Push-Dienste als Endpunkt', () => {
    expect(erlaubterEndpunkt('https://fcm.googleapis.com/fcm/send/x')).toBe(true);
    expect(erlaubterEndpunkt('https://updates.push.services.mozilla.com/wpush/v2/x')).toBe(true);
    expect(erlaubterEndpunkt('https://web.push.apple.com/x')).toBe(true);
    expect(erlaubterEndpunkt('http://fcm.googleapis.com/x')).toBe(false);
    expect(erlaubterEndpunkt('https://evil.example/x')).toBe(false);
    expect(erlaubterEndpunkt('https://fcm.googleapis.com:8443/x')).toBe(false);
    expect(erlaubterEndpunkt('https://169.254.169.254/latest')).toBe(false);
  });
});
