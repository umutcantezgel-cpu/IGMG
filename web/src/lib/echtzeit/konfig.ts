/**
 * Konfiguration des Echtzeit-Signals (ADR 0027) ohne Node-Abhängigkeiten – auch im Proxy nutzbar (CSP der Konto-Seiten).
 * Variablen: ECHTZEIT_URL (wss://…/connection/websocket), ECHTZEIT_GEHEIMNIS (HMAC, ≥ 32 Zeichen),
 * ECHTZEIT_API_URL (https://…/api), ECHTZEIT_API_SCHLUESSEL.
 */
export type EchtzeitKonfig = { url: string; geheimnis: string; apiUrl: string; apiSchluessel: string };

export function echtzeitAusUmgebung(env: Record<string, string | undefined> = process.env): EchtzeitKonfig | null {
  const url = env.ECHTZEIT_URL?.trim();
  const geheimnis = env.ECHTZEIT_GEHEIMNIS?.trim();
  const apiUrl = env.ECHTZEIT_API_URL?.trim();
  const apiSchluessel = env.ECHTZEIT_API_SCHLUESSEL?.trim();
  if (!url?.startsWith('wss://') || !geheimnis || geheimnis.length < 32 || !apiUrl?.startsWith('https://') || !apiSchluessel) return null;
  return { url, geheimnis, apiUrl: apiUrl.replace(/\/$/, ''), apiSchluessel };
}

/** Ursprung der WebSocket-Adresse für die CSP (`connect-src`) der Konto-Seiten. */
export function echtzeitUrsprung(env: Record<string, string | undefined> = process.env): string | null {
  const k = echtzeitAusUmgebung(env);
  return k ? new URL(k.url).origin.replace(/^https:/, 'wss:') : null;
}
