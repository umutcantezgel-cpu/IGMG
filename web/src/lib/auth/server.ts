import 'server-only';
import { randomBytes } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';
import { db, schema } from '@/lib/db';
import { authOptionen } from './optionen';
import { planePasswortMail, protokolliereZuruecksetzen } from './passwort';

const imBau = process.env.NEXT_PHASE === 'phase-production-build';
if (!process.env.BETTER_AUTH_SECRET && process.env.NODE_ENV === 'production' && !imBau) {
  throw new Error('BETTER_AUTH_SECRET fehlt.');
}

/** Better Auth (Anmeldung, Sitzung, Zwei-Faktor, Passkey). Rechte: src/lib/rechte (ADR 0003). */
export const auth = betterAuth({
  ...authOptionen,
  // Ohne Geheimnis nur in Entwicklung und beim Bau: zufällig je Prozess (kein Geheimnis im Quelltext, G-03)
  secret: process.env.BETTER_AUTH_SECRET ?? randomBytes(32).toString('base64'),
  database: drizzleAdapter(db, { provider: 'pg', schema }),
  emailAndPassword: {
    ...authOptionen.emailAndPassword,
    // Passwort vergessen (C12): Link 60 Minuten gültig, Versand über den Mail-Ausgang, Audit nach dem Zurücksetzen
    resetPasswordTokenExpiresIn: 60 * 60,
    sendResetPassword: async ({ user, url }) => planePasswortMail(user, url),
    onPasswordReset: async ({ user }) => protokolliereZuruecksetzen(user.id),
  },
  plugins: [...authOptionen.plugins, nextCookies()],
  databaseHooks: {
    session: {
      create: {
        // Gesperrte Konten (C12): keine neue Sitzung – die Anmeldung scheitert mit der allgemeinen Fehlermeldung
        before: async (sitzung) => {
          const [u] = await db
            .select({ gesperrtAm: schema.user.gesperrtAm })
            .from(schema.user)
            .where(eq(schema.user.id, sitzung.userId))
            .limit(1);
          return u?.gesperrtAm ? false : undefined;
        },
      },
    },
  },
});

export type Sitzung = typeof auth.$Infer.Session;
