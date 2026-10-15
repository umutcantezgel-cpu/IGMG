import { randomUUID } from 'node:crypto';
import { eq, like } from 'drizzle-orm';
import { afterAll, describe, expect, it } from 'vitest';
import { schema } from '@/lib/db';
import { entschluessele } from '@/lib/krypto';
import { formular, kontoUmgebung, nachDerAntwort, umleitung } from './hilfen/konto';

/**
 * Regressionstests der Sicherheitsprüfung S3 (Betrieb) gegen PGlite mit echtem Better Auth:
 * - Passwort-Links liegen nur als SHA-256 in `verification` (das Präfix bleibt für gezieltes Verwerfen lesbar)
 * - „Passwort vergessen“ und Anmeldung der Verwaltung nur für Konten der Verwaltung, nie für Gemeinde- oder
 *   Kinderkonten (Schalter `konten` nicht umgehbar)
 * Testdaten fiktiv (G-04).
 */
const { client, db } = await kontoUmgebung();
const { auth } = await import('@/lib/auth/server');
const anmeldung = await import('@/server/actions/anmeldung');
const { beendeSitzungen } = await import('@/lib/konto/loeschen');
const { db: appDb } = await import('@/lib/db');
afterAll(() => client.close());

const PASSWORT = 'Ein-langes-Testpasswort-2026';

async function konto(name: string, o: { verwaltung?: boolean; gemeinde?: boolean; kind?: boolean } = {}) {
  const email = o.kind ? `k-${randomUUID().slice(0, 12)}@konto.invalid` : `${randomUUID().slice(0, 8)}@example.test`;
  const r = await auth.api.signUpEmail({ body: { email, password: PASSWORT, name } });
  await db.update(schema.user).set({ emailVerified: true }).where(eq(schema.user.id, r.user.id));
  await db.insert(schema.kontoProfil).values({ benutzerId: r.user.id, anzeigename: name, istKind: o.kind ?? false });
  if (o.verwaltung) await db.insert(schema.rolleZuweisung).values({ benutzerId: r.user.id, rolle: 'redaktion' });
  if (o.gemeinde || o.kind) await db.insert(schema.gemeindeRolle).values({ benutzerId: r.user.id, rolle: o.kind ? 'schueler' : 'eltern' });
  return { id: r.user.id, email };
}

const resetZeilen = (benutzerId: string) => db.select().from(schema.verification).where(eq(schema.verification.value, benutzerId));
const sitzungen = (benutzerId: string) => db.select().from(schema.session).where(eq(schema.session.userId, benutzerId));

/** Link aus der geplanten Passwort-Mail (verschlüsselt im Mail-Ausgang). */
async function linkAusMail(email: string): Promise<string | null> {
  const mails = (await db.select().from(schema.mailAusgang).where(eq(schema.mailAusgang.vorlage, 'passwort'))).map((m) =>
    entschluessele<{ an: string; daten: { link: string } }>(m.datenVerschluesselt, m.schluesselId),
  );
  return mails.filter((m) => m.an === email).at(-1)?.daten.link ?? null;
}

describe('S3: Passwort-Links nur gehasht in der Datenbank', () => {
  it('der Token aus der Mail steht nicht in `verification`; mit ihm lässt sich das Passwort trotzdem setzen', async () => {
    const k = await konto('Testperson Redaktion', { verwaltung: true });
    expect(await anmeldung.passwortVergessen({}, formular({ email: k.email }))).toEqual({ ok: true });
    await nachDerAntwort();
    const link = await linkAusMail(k.email);
    expect(link).toContain('/reset-password/');
    const token = new URL(link!).pathname.split('/').at(-1)!;
    const zeilen = await resetZeilen(k.id);
    expect(zeilen).toHaveLength(1);
    expect(zeilen[0].identifier.startsWith('reset-password:')).toBe(true);
    expect(zeilen[0].identifier).not.toContain(token);
    // Wer nur lesen kann, findet den Token nicht: Suche nach dem Klartext ergibt nichts
    expect(
      await db
        .select()
        .from(schema.verification)
        .where(eq(schema.verification.identifier, `reset-password:${token}`)),
    ).toHaveLength(0);

    const ziel = await umleitung(
      anmeldung.passwortNeuSetzen({}, formular({ token, passwort: 'Ein-neues-Passwort-2026', wiederholung: 'Ein-neues-Passwort-2026' })),
    );
    expect(ziel).toBe('/verwaltung/anmelden?passwort=neu');
    const r = await auth.api.signInEmail({ body: { email: k.email, password: 'Ein-neues-Passwort-2026' } });
    expect(r.user.id).toBe(k.id);
  });

  it('Sperren verwirft offene Passwort-Links weiterhin gezielt (Präfix lesbar)', async () => {
    const k = await konto('Testperson Sperre', { verwaltung: true });
    await anmeldung.passwortVergessen({}, formular({ email: k.email }));
    await nachDerAntwort();
    expect(await resetZeilen(k.id)).toHaveLength(1);
    await beendeSitzungen(appDb, [k.id]);
    expect(await db.select().from(schema.verification).where(like(schema.verification.identifier, 'reset-password:%'))).not.toContainEqual(
      expect.objectContaining({ value: k.id }),
    );
  });
});

describe('S3: Verwaltungs-Anmeldung und -Passwortlink nur für Konten der Verwaltung', () => {
  it('Gemeinde- und Kinderkonto: kein Passwort-Link über die Verwaltung (gleiche Antwort)', async () => {
    for (const k of [await konto('Testperson Eltern', { gemeinde: true }), await konto('Testkind', { kind: true })]) {
      expect(await anmeldung.passwortVergessen({}, formular({ email: k.email }))).toEqual({ ok: true });
      await nachDerAntwort();
      expect(await resetZeilen(k.id)).toHaveLength(0);
      expect(await linkAusMail(k.email)).toBeNull();
    }
  });

  it('Gemeinde- und Kinderkonto: keine Sitzung über /verwaltung/anmelden; Verwaltungskonto weiter', async () => {
    for (const k of [await konto('Testperson Eltern Zwei', { gemeinde: true }), await konto('Testkind Zwei', { kind: true })]) {
      expect(await anmeldung.anmelden({}, formular({ email: k.email, passwort: PASSWORT }))).toMatchObject({ fehler: 'anmelden.fehler' });
      expect(await sitzungen(k.id)).toHaveLength(0);
    }
    const v = await konto('Testperson Verwaltung', { verwaltung: true });
    expect(await umleitung(anmeldung.anmelden({}, formular({ email: v.email, passwort: PASSWORT })))).toBe('/verwaltung/zwei-faktor');
    expect(await sitzungen(v.id)).toHaveLength(1);
  });
});
