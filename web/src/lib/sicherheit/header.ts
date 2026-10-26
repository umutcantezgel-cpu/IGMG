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

/**
 * CSP der Lern-App (ADR 0042 Nr. 9 mit Fortschreibung S2 Nr. 3, KERN 4.0 §6): die öffentliche CSP plus
 * `'wasm-unsafe-eval'` (Whisper/ONNX im Worker), `worker-src 'self'` ohne `blob:` und `media-src 'self' blob:` (eigene
 * Aufnahme und Scheiben der Lern-Audio-Bündel abspielen). Kein `blob:` in `script-src`, kein `'unsafe-eval'` in der
 * Produktion. Nur unter `/lern-app` (außer der Anmeldung, die die Nonce-CSP im Proxy bekommt); die Website bleibt unverändert.
 */
export function cspLernApp(): string {
  return richtlinie({
    ...gemeinsam,
    'script-src': ["'self'", "'unsafe-inline'", "'wasm-unsafe-eval'", ...(istEntwicklung ? ["'unsafe-eval'"] : [])],
    'style-src': ["'self'", "'unsafe-inline'"],
    'worker-src': ["'self'"],
    'media-src': ["'self'", 'blob:'],
  });
}

/** Strikte CSP der Verwaltung mit Nonce (Verwaltung wird ohnehin je Anfrage gerendert). Mit Vercel Blob darf der
 * Browser große PDF-Dateien direkt zur Blob-Schnittstelle laden (ADR 0020, V-05) – nur in der Verwaltung.
 * `weitereVerbindungen`: z. B. der Echtzeit-Server (wss://) nur für Mein Bereich (ADR 0027).
 * `medienBlob`: `media-src 'self' blob:` nur für die Verwaltung der Lern-App (L3-06): Clips aus den Lern-Audio-Bündeln, die
 * Probe einer Aufnahme im Audio-Studio und die Vorschau im echten Spieler spielen Scheiben eigener Dateien als `blob:` ab –
 * wie die Lern-App selbst (`cspLernApp`); Skripte bleiben unverändert. */
export function cspVerwaltung(nonce: string, weitereVerbindungen: readonly string[] = [], { medienBlob = false } = {}): string {
  const verbindungen = ["'self'", ...(process.env.SPEICHER === 'blob' ? ['https://vercel.com'] : []), ...weitereVerbindungen];
  return richtlinie({
    ...gemeinsam,
    'connect-src': verbindungen,
    'script-src': ["'self'", `'nonce-${nonce}'`, "'strict-dynamic'", ...(istEntwicklung ? ["'unsafe-eval'"] : [])],
    'style-src': ["'self'", "'unsafe-inline'"],
    ...(medienBlob ? { 'media-src': ["'self'", 'blob:'] } : {}),
  });
}

/** Verwaltung der Lern-App (`/verwaltung/lernapp/**`, auch mit `/de`): bekommt `media-src 'self' blob:` (siehe oben). */
export function istLernappVerwaltung(pfad: string): boolean {
  return /^(?:\/de)?\/verwaltung\/lernapp(?:\/|$)/.test(pfad);
}

/** Geräte-Berechtigungen; standardmäßig alles gesperrt außer Bewegungssensoren (Qibla-Kompass, ADR 0012). */
export type Berechtigung = 'camera' | 'microphone' | 'geolocation';

export function permissionsPolicy(erlaubt: readonly Berechtigung[] = []): string {
  const an = (b: Berechtigung) => (erlaubt.includes(b) ? '(self)' : '()');
  return `camera=${an('camera')}, microphone=${an('microphone')}, geolocation=${an('geolocation')}, payment=(), usb=(), browsing-topics=(), accelerometer=(self), gyroscope=(self), magnetometer=(self)`;
}

/**
 * Berechtigungen je Pfad (ADR 0028, ADR 0029): Standort nur auf den Gebetszeiten-Seiten (Berechnung im Browser,
 * nie an den Server), Mikrofon nur in der Rezitations-Werkstatt der Verwaltung (Aufnahme, ADR 0029) und in der Lern-App
 * auf den Übungs- und Wiederholungsseiten sowie im Audio-Studio der Verwaltung (ADR 0042 Nr. 9; die Aufnahme verlässt das
 * Gerät nie). Kamera nirgends (kein Einlass-Scan gebaut – bei Bedarf hier nur für dessen Pfad freigeben).
 * In next.config.ts nach `grundHeader` eingetragen – spätere Regeln überschreiben frühere. Die Berechtigung gilt je
 * Dokument: Links auf `…/ueben` und `…/wiederholen` laden die Seite deshalb neu (kein clientseitiger Wechsel).
 */
export const PFAD_BERECHTIGUNGEN: readonly { source: string; erlaubt: readonly Berechtigung[] }[] = [
  { source: '/gebetszeiten', erlaubt: ['geolocation'] },
  { source: '/de/gebetszeiten', erlaubt: ['geolocation'] },
  { source: '/tr/namaz-vakitleri', erlaubt: ['geolocation'] },
  { source: '/en/prayer-times', erlaubt: ['geolocation'] },
  { source: '/verwaltung/rezitationen/:pfad*', erlaubt: ['microphone'] },
  { source: '/de/verwaltung/rezitationen/:pfad*', erlaubt: ['microphone'] },
  { source: '/lern-app/:ui/:kurs/ueben', erlaubt: ['microphone'] },
  { source: '/lern-app/:ui/:kurs/wiederholen', erlaubt: ['microphone'] },
  { source: '/verwaltung/lernapp/audio/:pfad*', erlaubt: ['microphone'] },
  { source: '/de/verwaltung/lernapp/audio/:pfad*', erlaubt: ['microphone'] },
];

/**
 * Kopfzeilen-Regeln der Lern-App für next.config.ts (ADR 0042 Fortschreibung S2 Nr. 3, ADR 0039 und 0042 Fortschreibung
 * S5, ADR 0037 Fortschreibung S1). Reihenfolge wie eingetragen; spätere Regeln überschreiben frühere.
 * - Ganz `/lern-app/…`: `Cross-Origin-Opener-Policy: same-origin` und `Cross-Origin-Embedder-Policy: require-corp`
 *   (Threads für Whisper; nur Übungsseiten reichen nicht, weil ein clientseitiger Wechsel kein isoliertes Dokument erzeugt).
 *   Voraussetzung: nur eigener Ursprung; der Service Worker der Lern-App speichert Originalantworten samt Kopfzeilen.
 * - CSP `cspLernApp()` für alles unter `/lern-app/` außer `/lern-app/(de|tr|ar)/anmelden…` ohne Punkt im Pfad (Nonce-CSP im
 *   Proxy). Pfade mit Punkt erreichen den Proxy nicht und behalten deshalb die CSP der Lern-App (S-L1 N-2).
 * - Modelle (statisch unter `public/lern-app/modelle/`): ein Jahr unveränderlich, `nosniff`.
 * - Service Worker `/lern-app/sw.js`: immer neu prüfen (`no-cache`); `Service-Worker-Allowed` ist nicht nötig, weil der
 *   Scope `/lern-app/` dem Ordner der Datei entspricht. Ebenso der Abmelde-Worker `/lern-app/sw-abmelden.js`, den der Proxy
 *   bei „aus“ unter der Adresse `/lern-app/sw.js` ausliefert (S-L3 N-4).
 */
export function lernAppHeaderRegeln(): { source: string; headers: { key: string; value: string }[] }[] {
  return [
    {
      source: '/lern-app/:pfad*',
      headers: [
        { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
        { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
      ],
    },
    {
      source: '/lern-app/:pfad((?!(?:de|tr|ar)/anmelden(?:/[^.]*)?$).*)',
      headers: [{ key: 'Content-Security-Policy', value: cspLernApp() }],
    },
    {
      source: '/lern-app/modelle/:pfad*',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
      ],
    },
    { source: '/lern-app/sw.js', headers: [{ key: 'Cache-Control', value: 'no-cache' }] },
    { source: '/lern-app/sw-abmelden.js', headers: [{ key: 'Cache-Control', value: 'no-cache' }] },
  ];
}

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
