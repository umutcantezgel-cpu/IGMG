import { passkey } from '@better-auth/passkey';
import type { BetterAuthOptions } from 'better-auth';
import { APIError, createAuthMiddleware } from 'better-auth/api';
import { twoFactor } from 'better-auth/plugins/two-factor';

/**
 * Gemeinsame Better-Auth-Optionen (ohne Datenbank), damit Laufzeit-Konfiguration und
 * Schema-Erzeugung (`pnpm auth:schema`) dieselben Plugins nutzen. ADR 0003, Lichtung (b).
 */
const appUrl = process.env.BETTER_AUTH_URL ?? process.env.APP_URL ?? 'http://localhost:3000';
const istHttps = appUrl.startsWith('https://');

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
    expiresIn: 60 * 60 * 8,
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
    ipAddress: { ipAddressHeaders: ['x-real-ip', 'x-forwarded-for'] },
  },
  user: {
    deleteUser: { enabled: false },
    // Gesperrte Konten (C12): Zeitpunkt der Sperre, nur serverseitig gesetzt; Anmeldung und Sitzung werden verweigert
    additionalFields: { gesperrtAm: { type: 'date', required: false, input: false } },
  },
  plugins: [
    twoFactor({ issuer: 'IGMG Wetzlar', backupCodeOptions: { amount: 10, length: 10 } }),
    passkey({ rpID: new URL(appUrl).hostname, rpName: 'IGMG Wetzlar Verwaltung', origin: new URL(appUrl).origin }),
  ],
  hooks: {
    // Über HTTP gesperrt (ctx.request vorhanden); die Server Actions rufen auth.api serverseitig ohne Request auf:
    // - Registrierung: Konten nur per Einladung (K-06)
    // - Anmeldung und Zwei-Faktor: nur über die Server Actions mit eigener Ratenbegrenzung je IP und Konto
    //   (Befund SP-P3 H2: auth.api umgeht die Begrenzung von Better Auth; ein offener HTTP-Weg wäre die Lücke)
    // - Passkeys: bis zur gesicherten Einführung in C12 gesperrt (Befund SP-P3 H1)
    before: createAuthMiddleware(async (ctx) => {
      if (!ctx.request) return;
      if (ctx.path === '/sign-up/email') throw new APIError('FORBIDDEN', { message: 'Registrierung nur per Einladung.' });
      if (ctx.path === '/sign-in/email' || ctx.path.startsWith('/two-factor/') || ctx.path.startsWith('/passkey/')) {
        throw new APIError('FORBIDDEN', { message: 'Nur über die Anmeldeseite.' });
      }
    }),
  },
} satisfies Omit<BetterAuthOptions, 'database'>;
