import { createHmac } from 'node:crypto';
import type { EchtzeitKonfig } from './konfig';

export { echtzeitAusUmgebung, echtzeitUrsprung, type EchtzeitKonfig } from './konfig';

/**
 * Echtzeit-Signal über Centrifugo auf dem lokalen Server (ADR 0027, Kür K-A). Next.js meldet nur „Kanal hat Neues“;
 * Nachrichten holt der Browser weiter über die Abruf-Route (Inhalte berühren den lokalen Server nie). Tokens HS256 mit
 * 10 Minuten Laufzeit; Kanalname `chat:<kanal-id>`. Ohne Konfiguration bleibt es beim adaptiven Abruf.
 */
const b64 = (daten: string | Buffer) => Buffer.from(daten).toString('base64url');

export function jwtHs256(nutzlast: Record<string, unknown>, geheimnis: string): string {
  const kopf = b64(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const rumpf = b64(JSON.stringify(nutzlast));
  const signatur = createHmac('sha256', geheimnis).update(`${kopf}.${rumpf}`).digest('base64url');
  return `${kopf}.${rumpf}.${signatur}`;
}

export const kanalName = (kanalId: string) => `chat:${kanalId}`;

/** Verbindungs- und Abo-Token für eine Person und einen Kanal (Rechte prüft die aufrufende Route). */
export function echtzeitTokens(k: EchtzeitKonfig, benutzerId: string, kanalId: string, jetztSek = Math.floor(Date.now() / 1000)) {
  const exp = jetztSek + 10 * 60;
  return {
    url: k.url,
    kanal: kanalName(kanalId),
    verbindung: jwtHs256({ sub: benutzerId, exp }, k.geheimnis),
    abo: jwtHs256({ sub: benutzerId, channel: kanalName(kanalId), exp }, k.geheimnis),
    gueltigBis: exp,
  };
}

/** Signal „Kanal hat Neues“ – ohne Inhalt, ohne Absender (S-16). Fehler sind still: Der Abruf holt ohnehin nach. */
export async function signalisiere(k: EchtzeitKonfig, kanalId: string): Promise<boolean> {
  try {
    const antwort = await fetch(`${k.apiUrl}/publish`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'X-API-Key': k.apiSchluessel },
      body: JSON.stringify({ channel: kanalName(kanalId), data: { neu: true } }),
      signal: AbortSignal.timeout(3000),
    });
    return antwort.ok;
  } catch {
    return false;
  }
}
