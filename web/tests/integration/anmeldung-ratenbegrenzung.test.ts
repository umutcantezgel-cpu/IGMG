import { eq } from 'drizzle-orm';
import { afterAll, describe, expect, it } from 'vitest';
import { schema } from '@/lib/db';
import { formular, verwaltungsUmgebung } from './hilfen/verwaltung';

/** S3 / SP-P3 H2: Die Anmeldung bremst je IP und je Konto, bevor Better Auth überhaupt gefragt wird. */
const { client, db } = await verwaltungsUmgebung();
const { anmelden } = await import('@/server/actions/anmeldung');
afterAll(() => client.close());

describe('Anmeldung – Ratenbegrenzung', () => {
  it('nach 8 Versuchen für dasselbe Konto: „zu viele“, ohne Passwortprüfung', async () => {
    const fd = () => formular({ email: 'testperson.eins@example.test', passwort: 'falsches-passwort-123' });
    const ergebnisse = [];
    for (let i = 0; i < 9; i++) ergebnisse.push(await anmelden({}, fd()));
    expect(ergebnisse.slice(0, 8).every((e) => e.fehler === 'anmelden.fehler')).toBe(true);
    expect(ergebnisse[8]?.fehler).toBe('anmelden.zuViele');
    const audit = await db.select().from(schema.auditEintrag).where(eq(schema.auditEintrag.aktion, 'anmeldung.fehlgeschlagen'));
    expect(audit.some((a) => (a.details as { grund?: string } | null)?.grund === 'ratenbegrenzung')).toBe(true);
  });

  it('je IP: nach 10 Versuchen mit wechselnden Konten ebenfalls gesperrt', async () => {
    let letzte = {};
    for (let i = 0; i < 12; i++)
      letzte = await anmelden({}, formular({ email: `testperson.${i}@example.test`, passwort: 'falsches-passwort-123' }));
    expect(letzte).toMatchObject({ fehler: 'anmelden.zuViele' });
  });
});
