import { vapidKopf, type VapidSchluessel } from './vapid';
import { ausBase64url, verschluesselePush } from './verschluesselung';

/**
 * Versand an einen Push-Dienst (RFC 8030, ADR 0034). Die Nutzlast enthält nur Art, Schlüssel und Zeiten – keine Namen,
 * keine Nachrichtentexte (S-16); den Wortlaut baut der Service Worker aus `/push-texte/<sprache>.json`.
 */
export type PushZiel = { endpoint: string; p256dh: string; auth: string };
export type PushNutzlast = (
  | { art: 'gebet'; gebet: string; zeit: string; minuten: number }
  | { art: 'ankuendigung'; pfad: string }
  | { art: 'chat'; pfad: string }
  | { art: 'unterricht'; pfad: string }
  | { art: 'probe' }
) & { sprache?: string };

/** Bekannte Push-Dienste der Browser; andere Endpunkte werden abgewiesen (kein Server-Side Request Forgery). */
const DIENSTE = [
  /^fcm\.googleapis\.com$/,
  /^updates\.push\.services\.mozilla\.com$/,
  /^(.+\.)?push\.apple\.com$/,
  /^(.+\.)?notify\.windows\.com$/,
  /^(.+\.)?push\.services\.mozilla\.com$/,
];

export function erlaubterEndpunkt(endpoint: string): boolean {
  try {
    const url = new URL(endpoint);
    return url.protocol === 'https:' && !url.port && DIENSTE.some((d) => d.test(url.hostname)) && endpoint.length <= 1024;
  } catch {
    return false;
  }
}

export type VersandErgebnis = { ok: boolean; status: number; entfernen: boolean };

export async function sendePush(
  ziel: PushZiel,
  nutzlast: PushNutzlast,
  vapid: VapidSchluessel,
  optionen: { ttlSek?: number; dringlichkeit?: 'very-low' | 'low' | 'normal' | 'high'; thema?: string } = {},
): Promise<VersandErgebnis> {
  if (!erlaubterEndpunkt(ziel.endpoint)) return { ok: false, status: 0, entfernen: true };
  const { rumpf } = verschluesselePush({
    klartext: Buffer.from(JSON.stringify(nutzlast), 'utf8'),
    uaOeffentlich: ausBase64url(ziel.p256dh),
    authGeheimnis: ausBase64url(ziel.auth),
  });
  const kopf: Record<string, string> = {
    TTL: String(optionen.ttlSek ?? 60 * 60),
    'Content-Encoding': 'aes128gcm',
    'Content-Type': 'application/octet-stream',
    Authorization: vapidKopf(ziel.endpoint, vapid),
    Urgency: optionen.dringlichkeit ?? 'normal',
  };
  // Topic ersetzt eine noch nicht zugestellte Nachricht gleichen Themas (max. 32 Zeichen base64url)
  if (optionen.thema) kopf.Topic = optionen.thema.replace(/[^A-Za-z0-9_-]/g, '').slice(0, 32);
  try {
    const antwort = await fetch(ziel.endpoint, {
      method: 'POST',
      headers: kopf,
      body: new Uint8Array(rumpf),
      signal: AbortSignal.timeout(10_000),
    });
    return { ok: antwort.ok, status: antwort.status, entfernen: antwort.status === 404 || antwort.status === 410 };
  } catch {
    return { ok: false, status: 0, entfernen: false };
  }
}
