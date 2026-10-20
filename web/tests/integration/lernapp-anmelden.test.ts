import { eq } from 'drizzle-orm';
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { schema } from '@/lib/db';
import { textVersion } from '@/lib/konto/einwilligung';
import { verschluessele } from '@/lib/krypto';
import { formular, kontoUmgebung, nachher, umleitung } from './hilfen/konto';

/**
 * Anmeldung im Scope der Lern-App (ADR 0037 Nr. 4, O-7; L1-03): Die Konto-Actions der Website führen mit `weiter`
 * zurück in die Lern-App – nach E-Mail und Passwort, Kinderzugang, Passkey und zweitem Faktor; der zweite Faktor bleibt
 * auf der Anmeldeseite der Lern-App (installierte iOS-PWA mit eigener Cookie-Ablage). Rücksprünge sind geprüft (nur
 * Lern-App-Pfade, nie die Anmeldung selbst, keine fremden Ziele). Abmelden aus der Lern-App bleibt im Scope.
 * Die Seite `/lern-app/[ui]/anmelden`: Schalter `lernapp` oder `konten` aus → 404. Mit echtem Better Auth auf PGlite.
 */
vi.mock('next/root-params', () => ({ ui: async () => 'tr', locale: async () => undefined }));

const { client, db } = await kontoUmgebung();
const aktionen = await import('@/server/actions/konto');
const { legeKinderkontoAn } = await import('@/lib/konto/kinderkonto');
const { auth } = await import('@/lib/auth/server');
const seite = await import('@/app/lern-app/[ui]/anmelden/page');
afterAll(() => client.close());

const PASSWORT = 'Ein-langes-Testpasswort-2026';
const api = auth.api as unknown as Record<string, unknown>;
const echteSitzung = api.getSession;

beforeEach(async () => {
  await db.delete(schema.ratenbegrenzung);
});
afterEach(() => {
  api.getSession = echteSitzung;
  delete process.env.FUNKTION_KONTEN;
  delete process.env.FUNKTION_LERNAPP;
  nachher.length = 0;
});

async function legeKontoAn(email: string, zweiFaktor = false) {
  const r = await auth.api.signUpEmail({ body: { email, password: PASSWORT, name: 'Testperson Lernen' } });
  await db.update(schema.user).set({ emailVerified: true, twoFactorEnabled: zweiFaktor }).where(eq(schema.user.id, r.user.id));
  await db.insert(schema.gemeindeRolle).values({ benutzerId: r.user.id, rolle: 'gemeinde' });
  return { id: r.user.id, email };
}

const sitzungenVon = (benutzerId: string) => db.select().from(schema.session).where(eq(schema.session.userId, benutzerId));

describe('Rückkehr in die Lern-App nach der Anmeldung', () => {
  it('E-Mail und Passwort: zurück auf die Seite der Lern-App, von der die Anmeldung kam', async () => {
    const k = await legeKontoAn('testperson.lernapp@example.test');
    expect(
      await umleitung(aktionen.kontoAnmelden({}, formular({ email: k.email, passwort: PASSWORT, weiter: '/lern-app/tr/tr-aus-de' }))),
    ).toBe('/lern-app/tr/tr-aus-de');
    expect(
      await umleitung(
        aktionen.kontoAnmelden(
          {},
          formular({ email: k.email, passwort: PASSWORT, weiter: '/lern-app/ar/de-aus-ar/ueben?l=de.a1.e01.l01' }),
        ),
      ),
    ).toBe('/lern-app/ar/de-aus-ar/ueben?l=de.a1.e01.l01');
    expect(await sitzungenVon(k.id)).toHaveLength(2);
  });

  it('ungeprüfte Ziele zählen nicht: die Anmeldung selbst, fremde Adressen und unbekannte Oberflächen → Mein Bereich', async () => {
    const k = await legeKontoAn('testperson.lernapp-boese@example.test');
    for (const weiter of [
      '/lern-app/de/anmelden',
      'https://boese.example/lern-app/de',
      '//boese.example',
      '/lern-app/xx',
      '/lern-app/de/../verwaltung',
    ])
      expect(await umleitung(aktionen.kontoAnmelden({}, formular({ email: k.email, passwort: PASSWORT, weiter }))), weiter).toBe(
        '/mein-bereich',
      );
  });

  it('zweiter Faktor bleibt auf der Anmeldeseite der Lern-App (mit Rücksprung), die Website wie bisher', async () => {
    const k = await legeKontoAn('testperson.lernapp-faktor@example.test', true);
    expect(
      await umleitung(aktionen.kontoAnmelden({}, formular({ email: k.email, passwort: PASSWORT, weiter: '/lern-app/ar/de-aus-ar' }))),
    ).toBe('/lern-app/ar/anmelden?schritt=zwei-faktor&weiter=%2Flern-app%2Far%2Fde-aus-ar');
    expect(await umleitung(aktionen.kontoAnmelden({}, formular({ email: k.email, passwort: PASSWORT, sprache: 'tr' })))).toBe(
      '/tr/giris?schritt=zwei-faktor',
    );
    expect(await sitzungenVon(k.id)).toHaveLength(0);
  });

  it('Kinderzugang: mit Rücksprung zurück in die Lern-App, ohne wie bisher nach Mein Bereich', async () => {
    const eltern = await legeKontoAn('testperson.lernapp-eltern@example.test');
    await db.insert(schema.gemeindeRolle).values({ benutzerId: eltern.id, rolle: 'eltern' });
    const paket = verschluessele({ vorname: 'Testkind', nachname: 'Lernen' });
    const [l] = await db
      .insert(schema.lernende)
      .values({ datenVerschluesselt: paket.daten, schluesselId: paket.schluesselId, anzeigename: 'Testkind L.' })
      .returning({ id: schema.lernende.id });
    await db.insert(schema.elternKind).values({ elternId: eltern.id, lernendeId: l.id, bestaetigtAm: new Date() });
    await db.insert(schema.kontoEinwilligung).values({
      lernendeId: l.id,
      art: 'kinderkonto',
      textVersion: textVersion('test', 'Einwilligung'),
      erteiltVon: eltern.id,
      einvernehmenBestaetigt: true,
    });
    expect(
      await legeKinderkontoAn({ benutzername: 'kind.lernapp', passwort: PASSWORT, elternBenutzerId: eltern.id, lernendeId: l.id }),
    ).toMatchObject({
      ok: true,
    });
    expect(
      await umleitung(aktionen.kinderAnmelden({}, formular({ benutzername: 'kind.lernapp', passwort: PASSWORT, weiter: '/lern-app/de' }))),
    ).toBe('/lern-app/de');
    expect(await umleitung(aktionen.kinderAnmelden({}, formular({ benutzername: 'kind.lernapp', passwort: PASSWORT })))).toBe(
      '/mein-bereich',
    );
  });

  it('Abmelden aus der Lern-App bleibt im Scope; ohne Konten zum Start der Lern-App; die Website wie bisher', async () => {
    expect(await umleitung(aktionen.kontoAbmelden(formular({ weiter: '/lern-app/tr/einstellungen' })))).toBe(
      '/lern-app/tr/anmelden?hinweis=abgemeldet',
    );
    expect(await umleitung(aktionen.kontoAbmelden(formular({ sprache: 'tr' })))).toBe('/tr/giris?hinweis=abgemeldet');
    process.env.FUNKTION_KONTEN = 'aus';
    expect(await umleitung(aktionen.kontoAbmelden(formular({ weiter: '/lern-app/ar' })))).toBe('/lern-app/ar');
  });

  it('Konten aus: keine Anmeldung über die Actions (auch nicht aus der Lern-App)', async () => {
    process.env.FUNKTION_KONTEN = 'aus';
    await expect(
      aktionen.kontoAnmelden({}, formular({ email: 'x@example.test', passwort: PASSWORT, weiter: '/lern-app/de' })),
    ).rejects.toThrow();
  });
});

describe('Seite /lern-app/[ui]/anmelden', () => {
  const aufruf = (suche: Record<string, string> = {}) =>
    seite.default({ params: Promise.resolve({ ui: 'tr' }), searchParams: Promise.resolve(suche) } as never);

  it('Schalter konten oder lernapp aus → 404', async () => {
    process.env.FUNKTION_KONTEN = 'aus';
    await expect(aufruf()).rejects.toThrow('NEXT_NOT_FOUND');
    delete process.env.FUNKTION_KONTEN;
    process.env.FUNKTION_LERNAPP = 'aus';
    await expect(aufruf()).rejects.toThrow('NEXT_NOT_FOUND');
  });

  it('an: rendert die Anmeldung (ohne Sitzung) bzw. den Hinweis „angemeldet“ (mit Sitzung)', async () => {
    const ohne = JSON.stringify(await aufruf({ weiter: '/lern-app/tr/einstellungen' }));
    expect(ohne).toContain('"weiter":"/lern-app/tr/einstellungen"');
    expect(ohne).toContain('Giriş yap');
    // fremder Rücksprung → Start der Oberfläche
    expect(JSON.stringify(await aufruf({ weiter: 'https://boese.example' }))).toContain('"weiter":"/lern-app/tr"');

    const k = await legeKontoAn('testperson.lernapp-seite@example.test');
    api.getSession = async () => ({
      user: { id: k.id, name: 'Testperson Lernen', email: k.email, twoFactorEnabled: false, gesperrtAm: null },
      session: { id: `s-${k.id}`, createdAt: new Date(), userId: k.id },
    });
    const mit = JSON.stringify(await aufruf());
    expect(mit).toContain('Giriş yaptın');
    expect(mit).toContain('Testperson Lernen olarak giriş yapıldı.');
    expect(mit).toContain('"name":"weiter","value":"/lern-app/tr"');
  });
});
