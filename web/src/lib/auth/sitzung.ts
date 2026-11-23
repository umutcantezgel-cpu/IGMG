import 'server-only';
import { headers } from 'next/headers';
import { vorfuehrung } from '@/lib/vorfuehrung/modus';
import { vorfuehrungsSitzung, type VorfuehrungsSitzung } from '@/lib/vorfuehrung/sitzung';
import { auth } from './server';

/**
 * Die Sitzung der Anfrage – die eine Stelle, an der sie gelesen wird (Verwaltung, „Mein Bereich“, Konto-Seiten). Im
 * Betrieb die Sitzung von Better Auth; in der Vorführung mit Testzugang (ADR 0052) das Konto aus dem Cookie des
 * Testzugangs. Die Rechte prüfen danach unverändert `src/lib/rechte` und `src/lib/konto/zugang.ts`.
 */
export async function holeSitzung(): Promise<VorfuehrungsSitzung | null> {
  if (vorfuehrung()) return vorfuehrungsSitzung();
  const s = await auth.api.getSession({ headers: await headers() });
  if (!s) return null;
  return {
    user: {
      id: s.user.id,
      name: s.user.name,
      email: s.user.email,
      gesperrtAm: s.user.gesperrtAm ?? null,
      twoFactorEnabled: Boolean(s.user.twoFactorEnabled),
    },
    session: { id: s.session.id, createdAt: new Date(s.session.createdAt) },
  };
}
