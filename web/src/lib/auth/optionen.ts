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
    ipAddress: { ipAddressHeaders: ['x-forwarded-for', 'x-real-ip'] },
  },
  user: { deleteUser: { enabled: false } },
  plugins: [
    twoFactor({ issuer: 'IGMG Wetzlar', backupCodeOptions: { amount: 10, length: 10 } }),
    passkey({ rpID: new URL(appUrl).hostname, rpName: 'IGMG Wetzlar Verwaltung', origin: new URL(appUrl).origin }),
  ],
  hooks: {
    // Konten nur per Einladung (K-06): Registrierung über HTTP gesperrt; die Server Action
    // „Einladung annehmen“ ruft auth.api.signUpEmail serverseitig (ohne Request) auf.
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === '/sign-up/email' && ctx.request) {
        throw new APIError('FORBIDDEN', { message: 'Registrierung nur per Einladung.' });
      }
    }),
  },
} satisfies Omit<BetterAuthOptions, 'database'>;
