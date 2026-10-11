import { deriveKey } from 'altcha-lib/algorithms/pbkdf2';
import { solveChallenge } from 'altcha-lib';
import { eq } from 'drizzle-orm';
import type { ReactElement } from 'react';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { schema } from '@/lib/db';
import { entschluessele, sha256 } from '@/lib/krypto';
import { angemeldetAls, formular, verwaltungsUmgebung } from './hilfen/verwaltung';

/**
 * B07 (Z-05, G-07, E-028): Webseite für Moscheen im FormWizard – Schritte nur prüfen (nichts gespeichert, keine
 * Ratenbegrenzung), letzter Schritt über `verarbeiteFormular` mit der Einwilligung und zwei Mails.
 */
vi.mock('next-intl/server', () => ({ getTranslations: async () => (k: string) => `[${k}]` }));

const { client, db } = await verwaltungsUmgebung();
const { sendeMoscheeAnfrage } = await import('@/server/actions/formulare/moschee-anfrage');
const { neueChallenge } = await import('@/lib/validierung/altcha');
afterAll(() => client.close());
beforeEach(async () => {
  // Abhängige Zeilen zuerst: Mail-Ausgang und Einwilligung verweisen auf den Eingang
  await db.delete(schema.ratenbegrenzung);
  await db.delete(schema.mailAusgang);
  await db.delete(schema.einwilligung);
  await db.delete(schema.eingang);
  await angemeldetAls(null);
});

async function altcha(): Promise<string> {
  const challenge = await neueChallenge();
  const solution = await solveChallenge({ challenge, deriveKey });
  return Buffer.from(JSON.stringify({ challenge, solution })).toString('base64');
}

type Ansicht = ReactElement<{
  schritt: number;
  werte: Record<string, unknown>;
  ergebnis?: { feldFehler?: Record<string, string> };
  altchaSchluessel?: string;
}>;

// Fiktive Testdaten (G-04): keine echten Personen- oder Moscheedaten
const SCHRITT1 = {
  mosqueName: 'Testmoschee Eins',
  contactPerson: 'Testperson Sieben',
  email: 'testperson.sieben@example.test',
  phone: '',
  address: 'Teststraße 3',
  city: 'Testort',
  postalCode: '12345',
  country: 'Testland',
};
const SCHRITT2 = { currentWebsite: 'https://www.testmoschee.example.test', memberCount: '500', requirements: ['events', 'news'] };
const SCHRITT3 = { budget: 'b2', timeline: 't1', additionalInfo: 'Testtext', dataProtection: 'ja' };
const alle = (zusatz: Record<string, string | string[]> = {}) => ({
  sprache: 'tr',
  ...SCHRITT1,
  ...SCHRITT2,
  ...SCHRITT3,
  ...zusatz,
});

describe('Webseite für Moscheen', () => {
  it('Schritt 1 leer → Fehler nur für die Pflichtfelder des Schritts, nichts gespeichert, kein Ratenzähler', async () => {
    const r = await sendeMoscheeAnfrage(null, formular({ sprache: 'de', schritt: '0', richtung: 'weiter' }));
    expect(r.status).toBe('fehler');
    expect(Object.keys(r.feldFehler ?? {}).sort()).toEqual([
      'address',
      'city',
      'contactPerson',
      'country',
      'email',
      'mosqueName',
      'postalCode',
    ]);
    expect((r.ansicht as Ansicht).props.schritt).toBe(0);
    expect(await db.select().from(schema.eingang)).toHaveLength(0);
    expect(await db.select().from(schema.ratenbegrenzung)).toHaveLength(0);
  });

  it('Schritt 1: PLZ mit vier Ziffern und ungültige E-Mail; Felder späterer Schritte werden nicht gemeldet', async () => {
    const r = await sendeMoscheeAnfrage(
      null,
      formular({
        ...alle({ postalCode: '1234', email: 'kein-at', currentWebsite: 'http://unsicher.example.test' }),
        sprache: 'de',
        schritt: '0',
        richtung: 'weiter',
      }),
    );
    expect(r.feldFehler).toEqual({ postalCode: 'plz', email: 'email' });
    expect((r.ansicht as Ansicht).props.schritt).toBe(0);
  });

  it('Schritt 2: Webseite nur https, Mitgliederzahl nur Ziffern, Anforderungen nur aus der Liste', async () => {
    const web = await sendeMoscheeAnfrage(
      null,
      formular({ ...alle({ currentWebsite: 'http://unsicher.example.test', memberCount: 'viele' }), schritt: '1', richtung: 'weiter' }),
    );
    expect(web.feldFehler).toEqual({ currentWebsite: 'ungueltig', memberCount: 'ungueltig' });
    expect((web.ansicht as Ansicht).props.schritt).toBe(1);
    const anforderung = await sendeMoscheeAnfrage(
      null,
      formular({ ...alle({ requirements: ['unbekannt'] }), schritt: '1', richtung: 'weiter' }),
    );
    expect(anforderung.feldFehler).toEqual({ requirements: 'ungueltig' });
  });

  it('Weiter und Zurück: Schritt wechselt, Werte bleiben erhalten, kein Fehler', async () => {
    const vor = await sendeMoscheeAnfrage(null, formular({ ...alle(), schritt: '0', richtung: 'weiter' }));
    expect(vor).toMatchObject({ status: 'schritt' });
    expect((vor.ansicht as Ansicht).props).toMatchObject({ schritt: 1, werte: { mosqueName: 'Testmoschee Eins' } });
    const zurueck = await sendeMoscheeAnfrage(
      null,
      formular({ ...SCHRITT1, sprache: 'de', schritt: '2', richtung: 'zurueck', budget: 'b3' }),
    );
    expect((zurueck.ansicht as Ansicht).props).toMatchObject({
      schritt: 1,
      werte: { mosqueName: 'Testmoschee Eins', budget: 'b3' },
    });
    expect((zurueck.ansicht as Ansicht).props.ergebnis).toBeUndefined();
  });

  it('letzter Schritt ohne ALTCHA → Fehler „altcha“, Werte bleiben, neuer ALTCHA-Schlüssel', async () => {
    const r = await sendeMoscheeAnfrage(null, formular({ ...alle(), schritt: '2', richtung: 'weiter' }));
    expect(r).toMatchObject({ status: 'fehler', fehler: 'altcha' });
    const a = r.ansicht as Ansicht;
    expect(a.props).toMatchObject({ schritt: 2, werte: { mosqueName: 'Testmoschee Eins' } });
    expect(a.props.altchaSchluessel).toMatch(/^[0-9a-f-]{36}$/);
    expect(await db.select().from(schema.eingang)).toHaveLength(0);
  });

  it('Honigtopf ausgefüllt → scheinbarer Erfolg, nichts gespeichert und nichts versendet', async () => {
    const r = await sendeMoscheeAnfrage(
      null,
      formular({ ...alle(), website: 'https://spam.example.test', schritt: '2', richtung: 'weiter', altcha: await altcha() }),
    );
    expect(r.status).toBe('erfolg');
    expect(await db.select().from(schema.eingang)).toHaveLength(0);
    expect(await db.select().from(schema.mailAusgang)).toHaveLength(0);
  });

  it('ungültige Auswahl im letzten Schritt → zurück in Schritt 3 mit Feldfehler, ohne ALTCHA-Prüfung', async () => {
    const r = await sendeMoscheeAnfrage(null, formular({ ...alle({ budget: 'x' }), schritt: '2', richtung: 'weiter' }));
    expect(r).toMatchObject({ status: 'fehler', feldFehler: { budget: 'ungueltig' } });
    expect((r.ansicht as Ansicht).props.schritt).toBe(2);
  });

  it('manipulierte Anforderung beim Absenden → Prüfung mit ALTCHA, zurück in Schritt 2 mit Feldfehler', async () => {
    const r = await sendeMoscheeAnfrage(
      null,
      formular({ ...alle({ requirements: ['unbekannt'] }), schritt: '2', richtung: 'weiter', altcha: await altcha() }),
    );
    expect(r).toMatchObject({ status: 'fehler', fehler: 'pruefen', feldFehler: { requirements: 'ungueltig' } });
    expect((r.ansicht as Ansicht).props.schritt).toBe(1);
    expect(await db.select().from(schema.eingang)).toHaveLength(0);
  });

  it('Erfolg: Eingang verschlüsselt, Einwilligung mit Textversion, zwei Mails', async () => {
    const r = await sendeMoscheeAnfrage(null, formular({ ...alle(), schritt: '2', richtung: 'weiter', altcha: await altcha() }));
    expect(r.status).toBe('erfolg');
    const [eingang] = await db.select().from(schema.eingang).where(eq(schema.eingang.art, 'moschee_anfrage'));
    expect(eingang).toMatchObject({ sprache: 'tr', status: 'neu' });
    expect(eingang.datenVerschluesselt.toString('utf8')).not.toContain('Testmoschee Eins');
    expect(entschluessele<Record<string, unknown>>(eingang.datenVerschluesselt, eingang.schluesselId)).toMatchObject({
      mosqueName: 'Testmoschee Eins',
      postalCode: '12345',
      requirements: ['events', 'news'],
      budget: 'b2',
      dataProtection: 'ja',
    });
    const einw = await db.select().from(schema.einwilligung).where(eq(schema.einwilligung.eingangId, eingang.id));
    expect(einw).toEqual([
      expect.objectContaining({
        textSchluessel: 'moscheeAnfrage.feld.einwilligung',
        textVersion: sha256('[feld.einwilligung]'),
      }),
    ]);
    const mails = await db.select().from(schema.mailAusgang).where(eq(schema.mailAusgang.bezugEingangId, eingang.id));
    const an = mails.map((m) => entschluessele<{ an: string }>(m.datenVerschluesselt, m.schluesselId).an).sort();
    expect(an).toEqual(['rolle:moschee_anfrage', 'testperson.sieben@example.test']);
    // Benachrichtigung der Rolle enthält keine Formulardaten (ADR 0005, G-07)
    const benachrichtigung = mails.find((m) => m.vorlage === 'benachrichtigung');
    expect(entschluessele<{ daten: unknown }>(benachrichtigung!.datenVerschluesselt, benachrichtigung!.schluesselId).daten).toEqual({
      art: 'moschee_anfrage',
    });
  });

  it('ALTCHA wiederverwendet → Fehler „altcha“ (Lösungen sind einmalig)', async () => {
    const token = await altcha();
    const erster = await sendeMoscheeAnfrage(null, formular({ ...alle(), schritt: '2', richtung: 'weiter', altcha: token }));
    expect(erster.status).toBe('erfolg');
    const zweiter = await sendeMoscheeAnfrage(
      null,
      formular({ ...alle({ mosqueName: 'Testmoschee Zwei' }), schritt: '2', richtung: 'weiter', altcha: token }),
    );
    expect(zweiter).toMatchObject({ status: 'fehler', fehler: 'altcha' });
    expect(await db.select().from(schema.eingang)).toHaveLength(1);
  });
});
