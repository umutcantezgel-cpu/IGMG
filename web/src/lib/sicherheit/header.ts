/**
 * Sicherheits-Header (K-13, ADR 0012). Reine Funktionen ohne Laufzeitabhängigkeiten,
 * damit next.config.ts (Buildzeit) und proxy.ts (Laufzeit) dieselben Regeln nutzen.
 */

const istEntwicklung = process.env.NODE_ENV !== 'production';
/** HTTPS-Betrieb: erst dann HSTS und upgrade-insecure-requests (lokal läuft http://localhost). */
const istHttps = (process.env.APP_URL ?? '').startsWith('https://');

function richtlinie(teile: Record<string, string[]>): string {
  return Object.entries(teile)
    .map(([name, werte]) => (werte.length ? `${name} ${werte.join(' ')}` : name))
    .join('; ');
}

const gemeinsam: Record<string, string[]> = {
  'default-src': ["'self'"],
  'img-src': ["'self'", 'data:', 'blob:'],
  'font-src': ["'self'"],
  'connect-src': ["'self'"],
  'media-src': ["'self'"],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'worker-src': ["'self'"],
  'manifest-src': ["'self'"],
  ...(istHttps ? { 'upgrade-insecure-requests': [] } : {}),
};

/** Statische CSP der öffentlichen Seiten – ohne Nonce, damit die Seiten statisch bleiben. */
export function cspOeffentlich(): string {
  return richtlinie({
    ...gemeinsam,
    'script-src': ["'self'", "'unsafe-inline'", ...(istEntwicklung ? ["'unsafe-eval'"] : [])],
    'style-src': ["'self'", "'unsafe-inline'"],
  });
}

/** Strikte CSP der Verwaltung mit Nonce (Verwaltung wird ohnehin je Anfrage gerendert). */
export function cspVerwaltung(nonce: string): string {
  return richtlinie({
    ...gemeinsam,
    'script-src': ["'self'", `'nonce-${nonce}'`, "'strict-dynamic'", ...(istEntwicklung ? ["'unsafe-eval'"] : [])],
    'style-src': ["'self'", "'unsafe-inline'"],
  });
}

/** Header für alle Antworten (ohne CSP). */
export function grundHeader(): { key: string; value: string }[] {
  return [
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
    {
      key: 'Permissions-Policy',
      value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=(), accelerometer=(self), gyroscope=(self), magnetometer=(self)',
    },
    ...(istHttps ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' }] : []),
  ];
}
