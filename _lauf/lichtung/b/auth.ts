import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { twoFactor } from 'better-auth/plugins/two-factor';
import { createAuthMiddleware, APIError } from 'better-auth/api';
import { db } from './db.ts';
import * as schema from './schema.ts';

export const auth = betterAuth({
  appName: 'IGMG Wetzlar Verwaltung',
  baseURL: 'http://localhost:3000',
  secret: 'lichtung-b-nur-lokal-0123456789abcdef0123456789abcdef',
  database: drizzleAdapter(db, { provider: 'pg', schema }),
  emailAndPassword: { enabled: true, minPasswordLength: 12 },
  plugins: [twoFactor({ issuer: 'IGMG Wetzlar' })],
  hooks: {
    // Konten nur per Einladung: öffentliche HTTP-Registrierung sperren; serverseitige Aufrufe (ohne Request) bleiben erlaubt
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === '/sign-up/email' && ctx.request) {
        throw new APIError('FORBIDDEN', { message: 'Registrierung nur per Einladung' });
      }
    }),
  },
});
