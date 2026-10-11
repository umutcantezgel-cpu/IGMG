// Nur für `pnpm auth:schema`: erzeugt das Drizzle-Schema der Better-Auth-Tabellen aus denselben Plugins.
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { authOptionen } from '../src/lib/auth/optionen';

export const auth = betterAuth({
  ...authOptionen,
  database: drizzleAdapter({} as never, { provider: 'pg' }),
});
