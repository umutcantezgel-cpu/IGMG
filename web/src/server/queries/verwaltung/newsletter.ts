import 'server-only';
import { and, arrayOverlaps, desc, eq, isNotNull, isNull, sql } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { empfaengerZahl, NEWSLETTER_THEMEN, type NewsletterThema } from '@/lib/newsletter/dienst';

/**
 * Newsletter in der Verwaltung (AUFTRAG 3.10, K-B), ohne Cache. Aufrufer prüfen `newsletter.lesen`.
 * Es gibt hier nur Zahlen – nie Adressen (die liegen verschlüsselt und werden erst beim Versand entschlüsselt).
 */
export type Ausgabe = typeof schema.newsletterAusgabe.$inferSelect;

export async function ladeAusgaben(): Promise<Ausgabe[]> {
  return db.select().from(schema.newsletterAusgabe).orderBy(desc(schema.newsletterAusgabe.erstelltAm));
}

export async function ladeAusgabe(id: string): Promise<Ausgabe | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const [a] = await db.select().from(schema.newsletterAusgabe).where(eq(schema.newsletterAusgabe.id, id));
  return a ?? null;
}

/** Bestätigte Empfänger insgesamt und je Thema. */
export async function empfaengerUebersicht(): Promise<{ gesamt: number; je: Record<NewsletterThema, number> }> {
  const [gesamt, ...je] = await Promise.all([empfaengerZahl(), ...NEWSLETTER_THEMEN.map((t) => empfaengerZahl(t))]);
  return { gesamt, je: Object.fromEntries(NEWSLETTER_THEMEN.map((t, i) => [t, je[i]])) as Record<NewsletterThema, number> };
}

/** Bedingung „bestätigt, nicht abgemeldet, mindestens ein Thema der Ausgabe“ (ohne Themen: alle). */
export function empfaengerBedingung(themen: readonly string[]) {
  return and(
    isNotNull(schema.newsletterAbo.bestaetigtAm),
    isNull(schema.newsletterAbo.abgemeldetAm),
    themen.length ? arrayOverlaps(schema.newsletterAbo.themen, [...themen]) : undefined,
  );
}

/** Zahl der Empfänger einer Ausgabe mit diesen Themen. */
export async function empfaengerFuer(themen: readonly string[]): Promise<number> {
  const [z] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(schema.newsletterAbo)
    .where(empfaengerBedingung(themen));
  return z.n;
}
