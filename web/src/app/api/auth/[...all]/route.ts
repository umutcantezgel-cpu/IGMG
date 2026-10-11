import { toNextJsHandler } from 'better-auth/next-js';
import { auth } from '@/lib/auth/server';

/** Better-Auth-Endpunkte (Anmeldung, Zwei-Faktor, Passkey). Registrierung ist per Hook gesperrt (ADR 0003). */
export const { GET, POST } = toNextJsHandler(auth);
