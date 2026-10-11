import { deriveKey } from 'altcha-lib/algorithms/pbkdf2';
import { solveChallenge } from 'altcha-lib';
import { eq } from 'drizzle-orm';
import type { ReactElement } from 'react';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { schema } from '@/lib/db';
import { entschluessele } from '@/lib/krypto';
import { angemeldetAls, formular, verwaltungsUmgebung } from './hilfen/verwaltung';

/**
 * B05 (Z-05, G-07, E-028): Schüler-Voranmeldung im FormWizard – Schritte nur prüfen (nichts gespeichert, keine
 * Ratenbegrenzung), letzter Schritt über `verarbeiteFormular` mit zwei Einwilligungen und zwei Mails.
 */
vi.mock('next-intl/server', () => ({ getTranslations: async () => (k: string) => `[${k}]` }));

const { client, db } = await verwaltungsUmgebung();
const { sendeVoranmeldung } = await import('@/server/actions/formulare/voranmeldung');
const { neueChallenge } = await import('@/lib/validierung/altcha');
afterAll(() => client.close());
beforeEach(async () => {
  await db.delete(schema.ratenbegrenzung);
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

const KIND = { klasse: 'vorbereitung', geschlecht: 'weiblich', vorname: 'Testkind', nachname: 'Eins', geburtsdatum: '2018-05-04' };
const ADRESSE = { strasse: 'Teststraße 1', plz: '12345', ort: 'Testort' };
const ELTERN = {
  eltern1Name: 'Testperson Fünf',
  eltern1Telefon: '+49 000 000000',
  eltern1Email: 'testperson.fuenf@example.test',
  eltern2Name: '',
  eltern2Telefon: '',
  eltern2Email: '',
};
const ZUSATZ = { geschwister: '', ausgefuelltVon: 'Testperson Fünf', einwilligungKontakt: 'ja', einwilligungDatenschutz: 'ja' };
const alle = (zusatz: Record<string, string> = {}) => ({ sprache: 'tr', ...KIND, ...ADRESSE, ...ELTERN, ...ZUSATZ, ...zusatz });

describe('Schüler-Voranmeldung', () => {
  it('Schritt 1 leer → Fehler nur für Felder des Schritts, nichts gespeichert, kein Ratenzähler', async () => {
    const r = await sendeVoranmeldung(null, formular({ sprache: 'de', schritt: '0', richtung: 'weiter' }));
    expect(r.status).toBe('fehler');
    expect(Object.keys(r.feldFehler ?? {}).sort()).toEqual(['geburtsdatum', 'geschlecht', 'klasse', 'nachname', 'vorname']);
    expect((r.ansicht as Ansicht).props.schritt).toBe(0);
    expect(await db.select().from(schema.eingang)).toHaveLength(0);
    expect(await db.select().from(schema.ratenbegrenzung)).toHaveLength(0);
  });

  it('Geburtsdatum in der Zukunft oder unmöglich → „datum“; PLZ vierstellig → „plz“', async () => {
    for (const geburtsdatum of ['2099-01-01', '2019-02-30', '1990-01-01']) {
      const r = await sendeVoranmeldung(null, formular({ sprache: 'de', schritt: '0', ...KIND, geburtsdatum }));
      expect(r.feldFehler).toEqual({ geburtsdatum: 'datum' });
    }
    const r = await sendeVoranmeldung(null, formular({ sprache: 'de', schritt: '1', ...KIND, ...ADRESSE, plz: '1234' }));
    expect(r.feldFehler).toEqual({ plz: 'plz' });
  });

  it('Weiter und Zurück: Schritt wechselt, Werte bleiben erhalten, Status „schritt“', async () => {
    const vor = await sendeVoranmeldung(null, formular({ sprache: 'de', schritt: '0', richtung: 'weiter', ...KIND }));
    expect(vor).toMatchObject({ status: 'schritt' });
    expect((vor.ansicht as Ansicht).props).toMatchObject({ schritt: 1, werte: { vorname: 'Testkind' } });
    const zurueck = await sendeVoranmeldung(null, formular({ sprache: 'de', schritt: '2', richtung: 'zurueck', ...KIND, strasse: '' }));
    expect((zurueck.ansicht as Ansicht).props).toMatchObject({ schritt: 1, werte: { vorname: 'Testkind', strasse: '' } });
    expect((zurueck.ansicht as Ansicht).props.ergebnis).toBeUndefined();
  });

  it('Elternteil 2 freiwillig, aber geprüft, wenn angegeben', async () => {
    const r = await sendeVoranmeldung(
      null,
      formular({ sprache: 'de', schritt: '2', ...KIND, ...ADRESSE, ...ELTERN, eltern2Email: 'kein-at' }),
    );
    expect(r.feldFehler).toEqual({ eltern2Email: 'email' });
  });

  it('letzter Schritt ohne ALTCHA → Fehler „altcha“, Werte und letzter Schritt bleiben, neuer ALTCHA-Schlüssel', async () => {
    const r = await sendeVoranmeldung(null, formular({ ...alle(), schritt: '3' }));
    expect(r).toMatchObject({ status: 'fehler', fehler: 'altcha' });
    const a = r.ansicht as Ansicht;
    expect(a.props).toMatchObject({ schritt: 3, werte: { vorname: 'Testkind' } });
    expect(a.props.altchaSchluessel).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('manipuliertes Absenden mit ungültigem Feld aus Schritt 1 → zurück in Schritt 1', async () => {
    const r = await sendeVoranmeldung(null, formular({ ...alle({ klasse: 'unbekannt' }), schritt: '3', altcha: await altcha() }));
    expect(r).toMatchObject({ status: 'fehler', fehler: 'pruefen', feldFehler: { klasse: 'pflicht' } });
    expect((r.ansicht as Ansicht).props.schritt).toBe(0);
  });

  it('Erfolg: Eingang verschlüsselt (Kinderdaten nie im Klartext), zwei Einwilligungen, zwei Mails', async () => {
    const r = await sendeVoranmeldung(null, formular({ ...alle(), schritt: '3', altcha: await altcha() }));
    expect(r.status).toBe('erfolg');
    const [eingang] = await db.select().from(schema.eingang).where(eq(schema.eingang.art, 'voranmeldung'));
    expect(eingang).toMatchObject({ sprache: 'tr', status: 'neu' });
    expect(eingang.datenVerschluesselt.toString('utf8')).not.toContain('Testkind');
    expect(entschluessele<Record<string, string>>(eingang.datenVerschluesselt, eingang.schluesselId)).toMatchObject({
      vorname: 'Testkind',
      klasse: 'vorbereitung',
      plz: '12345',
    });
    const einw = await db.select().from(schema.einwilligung).where(eq(schema.einwilligung.eingangId, eingang.id));
    expect(einw.map((e) => e.textSchluessel).sort()).toEqual([
      'voranmeldung.einwilligung.datenschutz',
      'voranmeldung.einwilligung.kontakt',
    ]);
    const mails = await db.select().from(schema.mailAusgang).where(eq(schema.mailAusgang.bezugEingangId, eingang.id));
    const inhalte = mails.map((m) => entschluessele<{ an: string }>(m.datenVerschluesselt, m.schluesselId).an).sort();
    expect(inhalte).toEqual(['rolle:voranmeldung', 'testperson.fuenf@example.test']);
  });
});
