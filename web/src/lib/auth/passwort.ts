import 'server-only';
import { eq } from 'drizzle-orm';
import { protokolliere } from '@/lib/audit';
import { db, schema } from '@/lib/db';
import { verschluessele } from '@/lib/krypto';

/**
 * „Passwort vergessen“ (C12, M-092): Better Auth erzeugt den Link, versendet wird über den Mail-Ausgang (verschlüsselt,
 * Wiederholung, ADR 0011). Gesperrte Konten erhalten keinen Link. Der zweite Faktor bleibt nach dem Zurücksetzen Pflicht.
 */
export async function planePasswortMail(user: { id: string; email: string; name: string }, link: string): Promise<void> {
  const [u] = await db.select({ gesperrtAm: schema.user.gesperrtAm }).from(schema.user).where(eq(schema.user.id, user.id)).limit(1);
  if (!u || u.gesperrtAm) return;
  const paket = verschluessele({ an: user.email, daten: { name: user.name, link } });
  await db
    .insert(schema.mailAusgang)
    .values({ vorlage: 'passwort', sprache: 'de', datenVerschluesselt: paket.daten, schluesselId: paket.schluesselId });
}

/** Audit nach erfolgreichem Zurücksetzen (Better Auth `onPasswordReset`); alle Sitzungen enden dort. */
export async function protokolliereZuruecksetzen(benutzerId: string): Promise<void> {
  await protokolliere({ benutzerId, aktion: 'konto.passwort_zurueckgesetzt' });
}
