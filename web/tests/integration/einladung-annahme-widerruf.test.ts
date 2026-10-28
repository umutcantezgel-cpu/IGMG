import { eq } from 'drizzle-orm';
import { afterAll, afterEach, describe, expect, it } from 'vitest';
import type { Datenbank } from '@/lib/db';
import { schema } from '@/lib/db';
import { fuehreErstbefuellungAus } from '@/lib/wartung/erstbefuellung';
import { formular, kontoUmgebung, umleitung } from './hilfen/konto';

/**
 * Annahme einer Verwaltungs-Einladung gegen einen gleichzeitigen Widerruf (Gegenprüfung E-047): Die Annahme beansprucht
 * die Einladung in ihrer Transaktion, bevor sie Rollen vergibt. Wird die Einladung zwischen Laden und Annahme widerrufen
 * (hier: ein neuer Bau widerruft die Bau-Einladung, während die Person das Formular abschickt), entsteht kein Konto mit
 * Administration, und das eben registrierte Konto verschwindet wieder, damit der neue Link mit derselben Adresse
 * angenommen werden kann. Echtes Better Auth auf PGlite; Daten fiktiv.
 */
const { client, db: pgDb } = await kontoUmgebung();
const db = pgDb as unknown as Datenbank;
const { auth } = await import('@/lib/auth/server');
const anmeldung = await import('@/server/actions/anmeldung');
afterAll(() => client.close());

const api = auth.api as unknown as { signUpEmail: (...a: unknown[]) => Promise<unknown> };
const echteRegistrierung = api.signUpEmail;
afterEach(() => {
  api.signUpEmail = echteRegistrierung;
});

const PASSWORT = 'Ein-langes-Testpasswort-2026';
const PERSON = { email: 'erste-verwaltung@example.test', name: 'Testperson Eins' };
const plan = { seed: false, einladung: PERSON };
const keineSeeds = async () => ({ fehler: [] });

async function bauEinladung(): Promise<string> {
  const e = await fuehreErstbefuellungAus(db, plan, { seeds: keineSeeds, basis: 'https://igmg-test.vercel.app' });
  if (e.einladung.art !== 'angelegt') throw new Error(`erwartet: angelegt, war: ${e.einladung.art}`);
  return e.einladung.link.split('/').at(-1)!;
}

const annehmen = (token: string) => anmeldung.einladungAnnehmen({}, formular({ token, passwort: PASSWORT, wiederholung: PASSWORT }));
const konten = () => db.select().from(schema.user).where(eq(schema.user.email, PERSON.email));
const administration = () => db.select().from(schema.rolleZuweisung).where(eq(schema.rolleZuweisung.rolle, 'administration'));

describe('Annahme gegen gleichzeitigen Widerruf', () => {
  it('Widerruf während der Annahme: keine Rolle, kein Konto; der neue Link funktioniert danach', async () => {
    const alt = await bauEinladung();
    let neu = '';
    // Zwischen Laden und Beanspruchen der Einladung läuft ein neuer Bau (er widerruft die alte Einladung)
    api.signUpEmail = async (...a: unknown[]) => {
      const r = await echteRegistrierung(...a);
      neu = await bauEinladung();
      return r;
    };
    expect(await annehmen(alt)).toEqual({ fehler: 'einladung.ungueltig' });
    expect(await administration()).toEqual([]);
    expect(await konten()).toEqual([]);
    const [alteZeile] = await db.select().from(schema.einladung).where(eq(schema.einladung.erstelltVon, 'bau')).limit(1);
    expect(alteZeile.angenommenAm).toBeNull();

    api.signUpEmail = echteRegistrierung;
    expect(await umleitung(annehmen(neu))).toBe('/verwaltung/anmelden?eingeladen=1');
    const [konto] = await konten();
    expect(await administration()).toMatchObject([{ benutzerId: konto.id }]);
    // Danach legt kein Bau mehr eine Einladung an
    expect((await fuehreErstbefuellungAus(db, plan, { seeds: keineSeeds, basis: 'https://igmg-test.vercel.app' })).einladung).toEqual({
      art: 'konto_vorhanden',
      widerrufen: 0,
    });
  });

  it('angenommene Einladung lässt sich nicht ein zweites Mal annehmen', async () => {
    await db.delete(schema.user);
    await db.delete(schema.einladung);
    const token = await bauEinladung();
    expect(await umleitung(annehmen(token))).toBe('/verwaltung/anmelden?eingeladen=1');
    expect(await annehmen(token)).toEqual({ fehler: 'einladung.ungueltig' });
    expect(await administration()).toHaveLength(1);
  });
});
