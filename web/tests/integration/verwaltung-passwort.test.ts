import { eq } from 'drizzle-orm';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { schema } from '@/lib/db';
import { entschluessele } from '@/lib/krypto';
import { angemeldetAls, aufrufe, formular, verwaltungsUmgebung } from './hilfen/verwaltung';

/**
 * Passwort vergessen (C12, M-092): gleiche Antwort mit und ohne Konto, Link nur für nicht gesperrte Konten über den
 * Mail-Ausgang (verschlüsselt), neues Passwort nur mit gültigem Link, Audit nach dem Zurücksetzen.
 */
const { client, db } = await verwaltungsUmgebung();
const actions = await import('@/server/actions/anmeldung');
const { planePasswortMail, protokolliereZuruecksetzen } = await import('@/lib/auth/passwort');
const { auth } = await import('@/lib/auth/server');
afterAll(() => client.close());
const api = auth.api as unknown as Record<string, (o: unknown) => Promise<unknown>>;

beforeEach(async () => {
  await db.delete(schema.ratenbegrenzung);
  await angemeldetAls(null);
});

describe('Passwort vergessen', () => {
  it('ungültige Adresse am Feld; gültige: immer dieselbe Antwort, auch wenn Better Auth scheitert', async () => {
    expect((await actions.passwortVergessen({}, formular({ email: 'keine' }))).feldFehler).toEqual({
      email: 'passwortVergessen.fehlerEmail',
    });
    let aufruf: unknown = null;
    api.requestPasswordReset = async (o) => {
      aufruf = o;
      return { status: true };
    };
    expect(await actions.passwortVergessen({}, formular({ email: 'Testperson.Eins@Example.test' }))).toEqual({ ok: true });
    // Erst nach der Antwort (N1: gleiche Antwortzeit mit und ohne Konto)
    expect(aufruf).toBeNull();
    expect(aufrufe.nachher).toHaveLength(1);
    await aufrufe.nachher[0]();
    expect(aufruf).toMatchObject({
      body: { email: 'testperson.eins@example.test', redirectTo: expect.stringMatching(/\/verwaltung\/passwort-neu$/) },
    });
    api.requestPasswordReset = async () => {
      throw new Error('kaputt');
    };
    expect(await actions.passwortVergessen({}, formular({ email: 'unbekannt@example.test' }))).toEqual({ ok: true });
    await expect(aufrufe.nachher[1]()).resolves.toBeUndefined();
  });

  it('Link-Mail: verschlüsselt im Ausgang für aktive Konten, keine für gesperrte', async () => {
    const id = (await angemeldetAls([{ rolle: 'redaktion' }]))!;
    const [u] = await db.select().from(schema.user).where(eq(schema.user.id, id));
    await planePasswortMail(u, 'http://localhost/api/auth/reset-password/abc?callbackURL=x');
    const [m] = await db.select().from(schema.mailAusgang).where(eq(schema.mailAusgang.vorlage, 'passwort'));
    expect(m.datenVerschluesselt.toString('utf8')).not.toContain(u.email);
    expect(entschluessele<{ an: string; daten: { link: string } }>(m.datenVerschluesselt, m.schluesselId)).toMatchObject({
      an: u.email,
      daten: { link: expect.stringContaining('reset-password/abc') },
    });
    await db.update(schema.user).set({ gesperrtAm: new Date() }).where(eq(schema.user.id, id));
    await planePasswortMail(u, 'http://localhost/x');
    expect(await db.select().from(schema.mailAusgang).where(eq(schema.mailAusgang.vorlage, 'passwort'))).toHaveLength(1);
  });

  it('neues Passwort: Prüfung, ungültiger Link, Erfolg → Anmeldung; Audit nach dem Zurücksetzen', async () => {
    expect(
      (await actions.passwortNeuSetzen({}, formular({ token: 'x'.repeat(24), passwort: 'kurz', wiederholung: 'kurz' }))).feldFehler,
    ).toMatchObject({ passwort: 'passwortNeu.fehlerKurz' });
    expect(
      (await actions.passwortNeuSetzen({}, formular({ token: 'x', passwort: 'neues-passwort-123', wiederholung: 'neues-passwort-123' })))
        .fehler,
    ).toBe('passwortNeu.ungueltig');
    api.resetPassword = async () => {
      throw new Error('INVALID_TOKEN');
    };
    expect(
      (
        await actions.passwortNeuSetzen(
          {},
          formular({ token: 'x'.repeat(24), passwort: 'neues-passwort-123', wiederholung: 'neues-passwort-123' }),
        )
      ).fehler,
    ).toBe('passwortNeu.ungueltig');
    api.resetPassword = async () => ({ status: true });
    await expect(
      actions.passwortNeuSetzen(
        {},
        formular({ token: 'x'.repeat(24), passwort: 'neues-passwort-123', wiederholung: 'neues-passwort-123' }),
      ),
    ).rejects.toMatchObject({
      ziel: '/verwaltung/anmelden?passwort=neu',
    });
    await protokolliereZuruecksetzen('konto-1');
    const [a] = await db.select().from(schema.auditEintrag).where(eq(schema.auditEintrag.aktion, 'konto.passwort_zurueckgesetzt'));
    expect(a).toMatchObject({ benutzerId: 'konto-1', details: null });
  });
});
