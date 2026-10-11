import 'server-only';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';
import { db, schema } from '@/lib/db';
import { authOptionen } from './optionen';

const imBau = process.env.NEXT_PHASE === 'phase-production-build';
if (!process.env.BETTER_AUTH_SECRET && process.env.NODE_ENV === 'production' && !imBau) {
  throw new Error('BETTER_AUTH_SECRET fehlt.');
}

/** Better Auth (Anmeldung, Sitzung, Zwei-Faktor, Passkey). Rechte: src/lib/rechte (ADR 0003). */
export const auth = betterAuth({
  ...authOptionen,
  // Ohne Geheimnis nur in Entwicklung und beim Bau (beim Bau werden keine Anfragen bedient).
  secret: process.env.BETTER_AUTH_SECRET ?? 'nur-entwicklung-unsicheres-geheimnis-0123456789',
  database: drizzleAdapter(db, { provider: 'pg', schema }),
  plugins: [...authOptionen.plugins, nextCookies()],
});

export type Sitzung = typeof auth.$Infer.Session;
