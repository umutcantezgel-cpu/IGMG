import { eq } from 'drizzle-orm';
import { afterAll, describe, expect, it } from 'vitest';
import { schema, type Datenbank } from '@/lib/db';
import { darf, ROLLEN } from '@/lib/rechte/matrix';
import { angemeldetAls, aufrufe, formular, verwaltungsUmgebung } from '../hilfen/verwaltung';

/**
 * Startklar-Cockpit (AUFTRAG V-11, MENSCHEN ML-03): Konzept-Hinweis schalten. Geprüft werden das Recht der Seite und der
 * Aktion (nur Administration hat `einstellung.bearbeiten`), das Zusammenführen der Einstellung `allgemein` ohne Verlust
 * anderer Felder, der Audit-Eintrag ohne Personendaten, der Cache-Tag `einstellungen` und dass das Cockpit den neuen
 * Wert sieht. Die Seite selbst wird nicht gerendert (wie verwaltung-audit.test.ts). Testdaten sind fiktiv (G-04).
 */
const { client, db } = await verwaltungsUmgebung();
const { verlangeSeitenRecht } = await import('@/lib/rechte/pruefe');
const { setzeKonzepthinweis } = await import('@/server/actions/startklar');
const { fuehreStartklarAus } = await import('@/lib/startklar/pruefungen');
afterAll(() => client.close());

const allgemein = async () =>
  (await db.select({ wert: schema.einstellung.wert }).from(schema.einstellung).where(eq(schema.einstellung.schluessel, 'allgemein')))[0]
    ?.wert as Record<string, unknown> | undefined;
const auditZumHinweis = () => db.select().from(schema.auditEintrag).where(eq(schema.auditEintrag.aktion, 'einstellung.geaendert'));
const konzeptStatus = async () => {
  const ergebnis = await fuehreStartklarAus({ env: { SITE_MODE: 'entwicklung' }, db: db as unknown as Datenbank, dnsPruefen: false });
  return ergebnis.pruefungen.find((p) => p.id === 'inhalte.konzepthinweis')?.status;
};
const organisationFuer = (rolle: (typeof ROLLEN)[number]) => (rolle === 'organisationsredaktion' ? 'gt' : null);

describe('Startklar › Seite › Recht', () => {
  it('ohne Anmeldung: Umleitung zur Anmeldung', async () => {
    await angemeldetAls(null);
    await expect(verlangeSeitenRecht('einstellung.bearbeiten')).rejects.toMatchObject({ ziel: '/verwaltung/anmelden' });
  });

  it('ohne zweiten Faktor: Umleitung zur Einrichtung, auch mit Administrationsrolle', async () => {
    await angemeldetAls([{ rolle: 'administration' }], false);
    await expect(verlangeSeitenRecht('einstellung.bearbeiten')).rejects.toMatchObject({ ziel: '/verwaltung/zwei-faktor' });
  });

  it('nur die Administration hat das Recht (Matrix unverändert)', () => {
    const mitRecht = ROLLEN.filter((rolle) => darf([{ rolle, organisation: organisationFuer(rolle) }], 'einstellung.bearbeiten'));
    expect(mitRecht).toEqual(['administration']);
  });

  for (const rolle of ROLLEN.filter((r) => r !== 'administration')) {
    it(`Rolle ${rolle}: kein Zugriff auf die Seite`, async () => {
      await angemeldetAls([{ rolle, organisation: organisationFuer(rolle) }]);
      await expect(verlangeSeitenRecht('einstellung.bearbeiten')).rejects.toMatchObject({ ziel: '/verwaltung/kein-zugriff' });
    });
  }

  it('Administration darf die Seite betreten', async () => {
    await angemeldetAls([{ rolle: 'administration' }]);
    await expect(verlangeSeitenRecht('einstellung.bearbeiten')).resolves.toMatchObject({ rollen: [{ rolle: 'administration' }] });
  });
});

describe('Startklar › Aktion › Recht', () => {
  it('ohne Anmeldung: keinRecht, nichts gespeichert', async () => {
    await angemeldetAls(null);
    const vorher = await allgemein();
    expect(await setzeKonzepthinweis({}, formular({ konzepthinweis: 'false' }))).toEqual({ fehler: 'keinRecht' });
    expect(await allgemein()).toEqual(vorher);
  });

  it('ohne zweiten Faktor: keinRecht, auch mit Administrationsrolle', async () => {
    await angemeldetAls([{ rolle: 'administration' }], false);
    const vorher = await allgemein();
    expect(await setzeKonzepthinweis({}, formular({ konzepthinweis: 'false' }))).toEqual({ fehler: 'keinRecht' });
    expect(await allgemein()).toEqual(vorher);
  });

  for (const rolle of ROLLEN.filter((r) => r !== 'administration')) {
    it(`Rolle ${rolle}: keinRecht, Einstellung und Audit bleiben unverändert`, async () => {
      await angemeldetAls([{ rolle, organisation: organisationFuer(rolle) }]);
      const vorher = await allgemein();
      const auditVorher = (await auditZumHinweis()).length;
      expect(await setzeKonzepthinweis({}, formular({ konzepthinweis: 'false' }))).toEqual({ fehler: 'keinRecht' });
      expect(await allgemein()).toEqual(vorher);
      expect((await auditZumHinweis()).length).toBe(auditVorher);
      expect(aufrufe.refresh).toBe(0);
    });
  }
});

describe('Startklar › Aktion › Schreiben', () => {
  it('Hinweis ausschalten: schreibt false, verfällt den Cache-Tag, Seite wird neu gelesen, Cockpit meldet ok', async () => {
    const ich = (await angemeldetAls([{ rolle: 'administration' }]))!;
    const ergebnis = await setzeKonzepthinweis({}, formular({ konzepthinweis: 'false' }));
    expect(ergebnis).toEqual({ gespeichert: expect.any(Number), wert: false });
    expect(await allgemein()).toEqual({ konzepthinweis: false });
    expect(aufrufe.updateTag).toEqual(expect.arrayContaining(['einstellungen']));
    expect(aufrufe.refresh).toBe(1);
    expect(await konzeptStatus()).toBe('ok');

    const eintrag = (await auditZumHinweis()).at(-1);
    expect(eintrag).toMatchObject({
      benutzerId: ich,
      zielTyp: 'einstellung',
      zielId: 'allgemein',
      details: { feld: 'konzepthinweis', wert: false },
    });
  });

  it('Hinweis einschalten: schreibt true, Cockpit meldet wieder eine Warnung', async () => {
    await angemeldetAls([{ rolle: 'administration' }]);
    expect(await setzeKonzepthinweis({}, formular({ konzepthinweis: 'true' }))).toEqual({ gespeichert: expect.any(Number), wert: true });
    expect(await allgemein()).toEqual({ konzepthinweis: true });
    expect(await konzeptStatus()).toBe('warnung');
  });

  it('führt die Einstellung zusammen: andere Felder bleiben erhalten', async () => {
    await angemeldetAls([{ rolle: 'administration' }]);
    const andere = { konzepthinweis: true, anderesFeld: 'bleibt' };
    await db
      .insert(schema.einstellung)
      .values({ schluessel: 'allgemein', wert: andere })
      .onConflictDoUpdate({ target: schema.einstellung.schluessel, set: { wert: andere } });

    expect(await setzeKonzepthinweis({}, formular({ konzepthinweis: 'false' }))).toMatchObject({ wert: false });
    expect(await allgemein()).toEqual({ konzepthinweis: false, anderesFeld: 'bleibt' });
  });

  it('ungültiger oder fehlender Wert: pruefen, nichts gespeichert', async () => {
    await angemeldetAls([{ rolle: 'administration' }]);
    const vorher = await allgemein();
    expect(await setzeKonzepthinweis({}, formular({ konzepthinweis: 'vielleicht' }))).toEqual({ fehler: 'pruefen' });
    expect(await setzeKonzepthinweis({}, formular({}))).toEqual({ fehler: 'pruefen' });
    expect(await allgemein()).toEqual(vorher);
  });
});
