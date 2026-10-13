import { eq, sql } from 'drizzle-orm';
import { afterAll, describe, expect, it } from 'vitest';
import { schema } from '@/lib/db';
import { verwaltungsUmgebung } from './hilfen/verwaltung';

/** Newsletter mit Double-Opt-in: Adresse verschlüsselt, Bestätigung 48 h, Abmeldung löscht, keine Auskunft über Adressen. */
const { client, db } = await verwaltungsUmgebung();
const nl = await import('@/lib/newsletter/dienst');
afterAll(() => client.close());

describe('Newsletter', () => {
  it('Anmeldung → Bestätigung → zählt; Adresse nie im Klartext', async () => {
    const token = (await nl.meldeAn('Person.Eins@Example.test', 'de', ['veranstaltungen'], 'Einwilligung v1'))!;
    expect(token).toBeTruthy();
    expect(await nl.empfaengerZahl()).toBe(0);
    const [z] = await db.select().from(schema.newsletterAbo);
    expect(Buffer.from(z.emailVerschluesselt).toString('utf8')).not.toContain('example');
    expect(await nl.bestaetige(token)).toBe(true);
    expect(await nl.bestaetige(token)).toBe(false);
    expect(await nl.empfaengerZahl('veranstaltungen')).toBe(1);
    expect(await nl.empfaengerZahl('ramadan')).toBe(0);
  });

  it('bestätigte Adresse: erneute Anmeldung ohne neuen Link', async () => {
    expect(await nl.meldeAn('person.eins@example.test', 'de', [], 'Einwilligung v1')).toBeNull();
  });

  it('Bestätigung nach 48 h ungültig, Aufräumen entfernt unbestätigte', async () => {
    const token = (await nl.meldeAn('zwei@example.test', 'tr', [], 'v1'))!;
    await db.execute(sql`update newsletter_abo set erstellt_am = now() - interval '49 hours' where bestaetigt_am is null`);
    expect(await nl.bestaetige(token)).toBe(false);
    expect(await nl.raeumeNewsletterAuf()).toBe(1);
  });

  it('Abmeldung löscht die Adresse', async () => {
    const token = (await nl.meldeAn('drei@example.test', 'en', ['allgemein'], 'v1'))!;
    await nl.bestaetige(token);
    expect(await nl.meldeAb(token)).toBe(true);
    expect(await db.select().from(schema.newsletterAbo).where(eq(schema.newsletterAbo.sprache, 'en'))).toHaveLength(0);
    expect(await nl.meldeAb('x'.repeat(30))).toBe(false);
  });
});
