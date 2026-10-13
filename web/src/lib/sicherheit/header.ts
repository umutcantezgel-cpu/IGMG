/**
 * Sicherheits-Header (K-13, ADR 0012). Reine Funktionen ohne Laufzeitabhängigkeiten,
 * damit next.config.ts (Buildzeit) und proxy.ts (Laufzeit) dieselben Regeln nutzen.
 */
import { betriebsart, oeffentlicheAdresse } from '../umgebung';

const istEntwicklung = process.env.NODE_ENV !== 'production';
/** HTTPS-Betrieb: erst dann HSTS und upgrade-insecure-requests (lokal läuft http://localhost; Vorschau über VERCEL_BRANCH_URL). */
const istHttps = oeffentlicheAdresse(process.env).startsWith('https://');

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

/** Strikte CSP der Verwaltung mit Nonce (Verwaltung wird ohnehin je Anfrage gerendert). Mit Vercel Blob darf der
 * Browser große PDF-Dateien direkt zur Blob-Schnittstelle laden (ADR 0020, V-05) – nur in der Verwaltung.
 * `weitereVerbindungen`: z. B. der Echtzeit-Server (wss://) nur für Mein Bereich (ADR 0027). */
export function cspVerwaltung(nonce: string, weitereVerbindungen: readonly string[] = []): string {
  const verbindungen = ["'self'", ...(process.env.SPEICHER === 'blob' ? ['https://vercel.com'] : []), ...weitereVerbindungen];
  return richtlinie({
    ...gemeinsam,
    'connect-src': verbindungen,
    'script-src': ["'self'", `'nonce-${nonce}'`, "'strict-dynamic'", ...(istEntwicklung ? ["'unsafe-eval'"] : [])],
    'style-src': ["'self'", "'unsafe-inline'"],
  });
}

/** Geräte-Berechtigungen; standardmäßig alles gesperrt außer Bewegungssensoren (Qibla-Kompass, ADR 0012). */
export type Berechtigung = 'camera' | 'microphone' | 'geolocation';

export function permissionsPolicy(erlaubt: readonly Berechtigung[] = []): string {
  const an = (b: Berechtigung) => (erlaubt.includes(b) ? '(self)' : '()');
  return `camera=${an('camera')}, microphone=${an('microphone')}, geolocation=${an('geolocation')}, payment=(), usb=(), browsing-topics=(), accelerometer=(self), gyroscope=(self), magnetometer=(self)`;
}

/**
 * Berechtigungen je Pfad (ADR 0028, ADR 0029): Standort nur auf den Gebetszeiten-Seiten (Berechnung im Browser,
 * nie an den Server), Mikrofon und Kamera nur in der Verwaltung (Rezitations-Aufnahme, Einlass-Scan).
 * In next.config.ts nach `grundHeader` eingetragen – spätere Regeln überschreiben frühere.
 */
export const PFAD_BERECHTIGUNGEN: readonly { source: string; erlaubt: readonly Berechtigung[] }[] = [
  { source: '/gebetszeiten', erlaubt: ['geolocation'] },
  { source: '/de/gebetszeiten', erlaubt: ['geolocation'] },
  { source: '/tr/namaz-vakitleri', erlaubt: ['geolocation'] },
  { source: '/en/prayer-times', erlaubt: ['geolocation'] },
  { source: '/verwaltung/:pfad*', erlaubt: ['microphone', 'camera'] },
  { source: '/de/verwaltung/:pfad*', erlaubt: ['microphone', 'camera'] },
];

/**
 * Erste Pfadsegmente der Konto-Seiten (Anmeldung, Registrierung, Mein Bereich) in allen Sprachen. Diese Seiten sind
 * dynamisch und bekommen im Proxy die strikte Nonce-CSP der Verwaltung, `noindex` und `no-store` (ADR 0026).
 */
export const KONTO_SEGMENTE = [
  'anmelden',
  'registrieren',
  'konto',
  'einladung',
  'passwort-vergessen',
  'passwort-neu',
  'mein-bereich',
  'giris',
  'kayit',
  'hesap',
  'davet',
  'sifremi-unuttum',
  'yeni-sifre',
  'hesabim',
  'sign-in',
  'register',
  'account',
  'invitation',
  'forgot-password',
  'new-password',
  'my-account',
] as const;

/** true, wenn der Pfad (mit oder ohne Sprachpräfix) eine Konto-Seite ist. */
export function istKontoPfad(pfad: string): boolean {
  const teile = pfad.split('/').filter(Boolean);
  const erstes = teile[0] === 'de' || teile[0] === 'tr' || teile[0] === 'en' ? teile[1] : teile[0];
  return erstes !== undefined && (KONTO_SEGMENTE as readonly string[]).includes(erstes);
}

/** Header für alle Antworten (ohne CSP). */
export function grundHeader(): { key: string; value: string }[] {
  return [
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
    { key: 'Permissions-Policy', value: permissionsPolicy() },
    ...(istHttps ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' }] : []),
  ];
}

/** Vorschauen werden nicht indexiert (ADR 0022, V-09): `X-Robots-Tag` für alle Antworten, nur in der Betriebsart „vorschau“. */
export function noindexHeader(): { key: string; value: string }[] {
  return betriebsart(process.env) === 'vorschau' ? [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] : [];
}
