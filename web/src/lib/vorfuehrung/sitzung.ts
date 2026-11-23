import 'server-only';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { db, schema } from '@/lib/db';
import { VORFUEHRUNG_COOKIE, kontoZuSchluessel, type VorfuehrungsKonto } from './konten';
import { vorfuehrung } from './modus';

/** Sitzung der Vorführung in der Form, die die Rechteprüfung braucht (wie der Kern einer Better-Auth-Sitzung). */
export type VorfuehrungsSitzung = {
  user: { id: string; name: string; email: string; gesperrtAm: Date | null; twoFactorEnabled: boolean };
  session: { id: string; createdAt: Date };
};

/** Der Testzugang aus dem Cookie – nur in der Vorführung, sonst immer `null`. */
export async function gewaehlterTestzugang(): Promise<VorfuehrungsKonto | null> {
  if (!vorfuehrung()) return null;
  return kontoZuSchluessel((await cookies()).get(VORFUEHRUNG_COOKIE)?.value);
}

/**
 * Sitzung der Vorführung (ADR 0052): kein Eintrag in der Datenbank – jede Instanz hat ihre eigene Kopie, eine dort
 * gespeicherte Sitzung gälte in der nächsten nicht. Das Cookie nennt den Testzugang, das Konto dazu steht in jedem
 * Schnappschuss. Der zweite Faktor gilt als erfüllt: Der Testzugang soll ohne Einrichtung in alle Bereiche führen.
 */
export async function vorfuehrungsSitzung(): Promise<VorfuehrungsSitzung | null> {
  const konto = await gewaehlterTestzugang();
  if (!konto) return null;
  const [u] = await db
    .select({ id: schema.user.id, name: schema.user.name, email: schema.user.email, gesperrtAm: schema.user.gesperrtAm })
    .from(schema.user)
    .where('kindername' in konto ? eq(schema.user.username, konto.kindername) : eq(schema.user.email, konto.email))
    .limit(1);
  if (!u) return null;
  return { user: { ...u, twoFactorEnabled: true }, session: { id: `vorfuehrung-${konto.schluessel}`, createdAt: new Date() } };
}

/** Abmelden in der Vorführung: das Cookie des Testzugangs löschen. */
export async function beendeTestzugang(): Promise<void> {
  (await cookies()).delete(VORFUEHRUNG_COOKIE);
}
