import { passkey } from '@better-auth/passkey';
import type { BetterAuthOptions } from 'better-auth';
import { APIError, createAuthMiddleware } from 'better-auth/api';
import { twoFactor } from 'better-auth/plugins/two-factor';
import { username } from 'better-auth/plugins/username';
import { oeffentlicheAdresse } from '../umgebung';

/**
 * Gemeinsame Better-Auth-Optionen (ohne Datenbank), damit Laufzeit-Konfiguration und
 * Schema-Erzeugung (`pnpm auth:schema`) dieselben Plugins nutzen. ADR 0003, Lichtung (b).
 */
// Vorschauen ohne APP_URL melden sich unter ihrer Branch-Adresse an (ADR 0022); Passkey-rpID folgt dieser Adresse.
// Ein leer angelegtes BETTER_AUTH_URL gilt als nicht gesetzt (sonst wäre die baseURL leer).
const appUrl = process.env.BETTER_AUTH_URL || oeffentlicheAdresse(process.env);
const istHttps = appUrl.startsWith('https://');

/**
 * Kennungen in `verification` nur als SHA-256 (S3): Ein Passwort-Link (`reset-password:<token>`) und andere Einmal-Werte
 * stehen nicht im Klartext in der Datenbank – wer nur lesen kann (Leserolle der Sicherung, ein Abzug), übernimmt damit
 * kein Konto. Das Präfix bis zum ersten Doppelpunkt bleibt lesbar, damit Sperren und Löschen die Links eines Kontos
 * weiter gezielt verwerfen (`reset-password:%`). Web Crypto: läuft in Node und überall sonst.
 */
export async function verifikationsKennung(kennung: string): Promise<string> {
  const ende = kennung.indexOf(':');
  const praefix = ende >= 0 ? kennung.slice(0, ende + 1) : '';
  const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(kennung)));
  return `${praefix}${Buffer.from(hash).toString('base64url')}`;
}

export const authOptionen = {
  appName: 'IGMG Wetzlar Verwaltung',
  baseURL: appUrl,
  basePath: '/api/auth',
  telemetry: { enabled: false },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 12,
    maxPasswordLength: 128,
    autoSignIn: false,
    revokeSessionsOnPasswordReset: true,
  },
  session: {
    // Höchstdauer für Gemeinde-Konten (30 Tage gleitend). Kürzere, absolute Grenzen je Kontoart setzt
    // `sitzungsGrenzeMs` (src/lib/rechte/sitzung.ts): Verwaltung 8 h, Lehrkraft und Kinder 12 h (ADR 0026).
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 30,
    cookieCache: { enabled: false },
  },
  rateLimit: {
    enabled: true,
    storage: 'database',
    window: 60,
    max: 60,
    customRules: {
      '/sign-in/email': { window: 60, max: 5 },
      '/two-factor/*': { window: 60, max: 5 },
      '/request-password-reset': { window: 300, max: 3 },
    },
  },
  advanced: {
    cookiePrefix: 'igmg',
    useSecureCookies: istHttps,
    // Keine IP-Adressen in Sitzungen und Ratenzählern (Tor B/C M6, E-041): Anmeldung, Zwei-Faktor und „Passwort
    // vergessen“ laufen über Server Actions mit eigener Begrenzung (HMAC der Adresse vom vertrauten Proxy)
    ipAddress: { disableIpTracking: true },
  },
  verification: { storeIdentifier: { hash: verifikationsKennung } },
  user: {
    deleteUser: { enabled: false },
    // Gesperrte Konten (C12): Zeitpunkt der Sperre, nur serverseitig gesetzt; Anmeldung und Sitzung werden verweigert
    additionalFields: { gesperrtAm: { type: 'date', required: false, input: false } },
  },
  plugins: [
    twoFactor({ issuer: 'IGMG Wetzlar', backupCodeOptions: { amount: 10, length: 10 } }),
    // Kinderkonten ohne E-Mail melden sich mit Benutzernamen an (ADR 0026); nur über die Server Action.
    username({ minUsernameLength: 4, maxUsernameLength: 32 }),
    passkey({ rpID: new URL(appUrl).hostname, rpName: 'IGMG Wetzlar Verwaltung', origin: new URL(appUrl).origin }),
  ],
  hooks: {
    // Über HTTP gesperrt (ctx.request vorhanden); die Server Actions rufen auth.api serverseitig ohne Request auf:
    // - Registrierung: nur per Einladung (K-06) bzw. Gemeinde-Selbstregistrierung über die Server Action mit ALTCHA
    // - Anmeldung und Zwei-Faktor: nur über die Server Actions mit eigener Ratenbegrenzung je IP und Konto
    //   (Befund SP-P3 H2: auth.api umgeht die Begrenzung von Better Auth; ein offener HTTP-Weg wäre die Lücke)
    // - Passkeys: bis zur gesicherten Einführung gesperrt (Befund SP-P3 H1)
    // - Passwort anfordern/setzen/ändern und Kontodaten: nur über die Server Actions (Tor B/C M1)
    before: createAuthMiddleware(async (ctx) => {
      if (!ctx.request) return;
      if (ctx.path === '/sign-up/email') throw new APIError('FORBIDDEN', { message: 'Registrierung nur per Einladung.' });
      if (
        ctx.path === '/sign-in/email' ||
        ctx.path === '/sign-in/username' ||
        ctx.path === '/is-username-available' ||
        ctx.path.startsWith('/two-factor/') ||
        ctx.path.startsWith('/passkey/') ||
        // Tor B/C M1: Passwort-Abläufe nur über die Server Actions (Begrenzung je Konto, gleiche Antwort für alle)
        ctx.path === '/request-password-reset' ||
        ctx.path === '/reset-password' ||
        ctx.path === '/change-password' ||
        ctx.path === '/update-user'
      ) {
        throw new APIError('FORBIDDEN', { message: 'Nur über die Anmeldeseite.' });
      }
    }),
  },
} satisfies Omit<BetterAuthOptions, 'database'>;
