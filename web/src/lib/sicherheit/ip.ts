import 'server-only';

/**
 * Adresse der anfragenden Person für Ratenbegrenzungen (S3, Tor B/C H1, E-041). Next.js setzt `X-Forwarded-For` nur,
 * wenn der Header fehlt – einen vom Client mitgeschickten Wert reicht es unverändert durch. Header werden deshalb nur
 * ausgewertet, wenn ein vertrauenswürdiger Proxy davor sitzt (`PROXY_VERTRAUEN=1`, BETRIEB.md 5a): dann zuerst
 * `X-Real-IP` (vom Proxy überschrieben), sonst der letzte `X-Forwarded-For`-Eintrag (vom Proxy angehängt).
 * Ohne vertrauten Proxy: ein gemeinsamer Schlüssel – lieber strenger als umgehbar; der Start meldet den Zustand.
 * Die Adresse wird nie gespeichert, nur als HMAC (src/lib/validierung/ratenbegrenzung.ts).
 */
export const OHNE_PROXY = 'ohne-proxy';

export function proxyVertraut(): boolean {
  return process.env.PROXY_VERTRAUEN === '1';
}

export function clientAdresse(h: Headers): string {
  if (!proxyVertraut()) return OHNE_PROXY;
  const echt = h.get('x-real-ip')?.trim();
  if (echt) return echt;
  const letzte = h
    .get('x-forwarded-for')
    ?.split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .at(-1);
  return letzte || OHNE_PROXY;
}
