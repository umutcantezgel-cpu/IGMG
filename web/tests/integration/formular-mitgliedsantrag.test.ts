import { deriveKey } from 'altcha-lib/algorithms/pbkdf2';
import { solveChallenge } from 'altcha-lib';
import { eq } from 'drizzle-orm';
import type { ReactElement } from 'react';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { schema } from '@/lib/db';
import { entschluessele, sha256 } from '@/lib/krypto';
import { angemeldetAls, formular, verwaltungsUmgebung } from './hilfen/verwaltung';

/**
 * B06 (Z-05, G-07, E-028): Mitgliedsantrag im FormWizard – Schritte nur prüfen (nichts gespeichert, keine
 * Ratenbegrenzung), letzter Schritt über `verarbeiteFormular` mit der Datenschutz-Einwilligung und zwei Mails.
 */
vi.mock('next-intl/server', () => ({ getTranslations: async () => (k: string) => `[${k}]` }));

const { client, db } = await verwaltungsUmgebung();
const { sendeMitgliedsantrag } = await import('@/server/actions/formulare/mitgliedsantrag');
const { neueChallenge } = await import('@/lib/validierung/altcha');
afterAll(() => client.close());
beforeEach(async () => {
  // Jeder Test beginnt ohne Eingänge und Mails (die Datenbank teilt sich die Tests einer Datei)
  await db.delete(schema.mailAusgang);
  await db.delete(schema.einwilligung);
  await db.delete(schema.eingang);
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

const KONTAKT = {
  vorname: 'Testperson',
  nachname: 'Sieben',
  email: 'testperson.sieben@example.test',
  telefon: '+49 000 000000',
  adresse: 'Teststraße 3',
  stadt: 'Testort',
  altersgruppe: '20-30',
  geschlecht: 'w',
};
const INTERESSEN = { interessen: ['prayer', 'youth'], erfahrung: '' };
const MOTIVATION = { motivation: 'Testmotivation', newsletter: 'ja', datenschutz: 'ja' };
const alle = (zusatz: Record<string, string | string[]> = {}) => ({ sprache: 'tr', ...KONTAKT, ...INTERESSEN, ...MOTIVATION, ...zusatz });

describe('Mitgliedsantrag', () => {
  it('Schritt 1 leer → Fehler nur für Vorname, Nachname und E-Mail; nichts gespeichert, kein Ratenzähler', async () => {
    const r = await sendeMitgliedsantrag(null, formular({ sprache: 'de', schritt: '0', richtung: 'weiter' }));
    expect(r.status).toBe('fehler');
    expect(Object.keys(r.feldFehler ?? {}).sort()).toEqual(['email', 'nachname', 'vorname']);
    expect(r.feldFehler).toMatchObject({ email: 'pflicht' });
    expect((r.ansicht as Ansicht).props.schritt).toBe(0);
    expect(await db.select().from(schema.eingang)).toHaveLength(0);
    expect(await db.select().from(schema.ratenbegrenzung)).toHaveLength(0);
  });

  it('ungültige E-Mail und Telefonnummer in Schritt 1 → „email“ und „telefon“; leere optionale Felder sind erlaubt', async () => {
    const r = await sendeMitgliedsantrag(
      null,
      formular({
        sprache: 'de',
        schritt: '0',
        richtung: 'weiter',
        vorname: 'Testperson',
        nachname: 'Sieben',
        email: 'kein-at',
        telefon: 'abc',
      }),
    );
    expect(r.feldFehler).toEqual({ email: 'email', telefon: 'telefon' });
    const ok = await sendeMitgliedsantrag(
      null,
      formular({ sprache: 'de', schritt: '0', richtung: 'weiter', vorname: 'Testperson', nachname: 'Sieben', email: KONTAKT.email }),
    );
    expect(ok).toMatchObject({ status: 'schritt' });
    expect((ok.ansicht as Ansicht).props).toMatchObject({ schritt: 1, werte: { vorname: 'Testperson' } });
  });

  it('Weiter und Zurück: Schritt wechselt, Werte und Mehrfachauswahl bleiben erhalten', async () => {
    const vor = await sendeMitgliedsantrag(null, formular({ sprache: 'de', schritt: '0', richtung: 'weiter', ...KONTAKT }));
    expect(vor).toMatchObject({ status: 'schritt' });
    expect((vor.ansicht as Ansicht).props).toMatchObject({ schritt: 1, werte: { vorname: 'Testperson' } });
    const zurueck = await sendeMitgliedsantrag(
      null,
      formular({
        sprache: 'de',
        schritt: '1',
        richtung: 'zurueck',
        ...KONTAKT,
        interessen: ['prayer', 'youth'],
        erfahrung: 'Testerfahrung',
      }),
    );
    expect((zurueck.ansicht as Ansicht).props).toMatchObject({
      schritt: 0,
      werte: { vorname: 'Testperson', interessen: ['prayer', 'youth'], erfahrung: 'Testerfahrung' },
    });
    expect((zurueck.ansicht as Ansicht).props.ergebnis).toBeUndefined();
  });

  it('Mehrfachauswahl: eine Auswahl ist eine Liste, keine Auswahl und unbekannte Werte werden abgewiesen', async () => {
    const eineWahl = await sendeMitgliedsantrag(null, formular({ sprache: 'de', schritt: '1', richtung: 'weiter', interessen: 'prayer' }));
    expect(eineWahl).toMatchObject({ status: 'schritt' });
    expect((eineWahl.ansicht as Ansicht).props).toMatchObject({ schritt: 2, werte: { interessen: ['prayer'] } });
    const keine = await sendeMitgliedsantrag(null, formular({ sprache: 'de', schritt: '1', richtung: 'weiter' }));
    expect(keine).toMatchObject({ status: 'fehler', feldFehler: { interessen: 'pflicht' } });
    expect((keine.ansicht as Ansicht).props.schritt).toBe(1);
    const unbekannt = await sendeMitgliedsantrag(null, formular({ sprache: 'de', schritt: '1', richtung: 'weiter', interessen: ['xyz'] }));
    expect(unbekannt.feldFehler).toEqual({ interessen: 'ungueltig' });
  });

  it('Schritt 3 ohne Motivation oder Datenschutz-Einwilligung → Fehler am Feld; Newsletter bleibt optional', async () => {
    const r = await sendeMitgliedsantrag(null, formular({ sprache: 'de', schritt: '2', richtung: 'weiter', ...INTERESSEN }));
    expect(r).toMatchObject({ status: 'fehler', feldFehler: { motivation: 'pflicht', datenschutz: 'einwilligung' } });
    expect((r.ansicht as Ansicht).props.schritt).toBe(2);
    const ohneNewsletter = await sendeMitgliedsantrag(
      null,
      formular({ sprache: 'de', schritt: '2', richtung: 'weiter', ...INTERESSEN, motivation: 'Testmotivation', datenschutz: 'ja' }),
    );
    expect(ohneNewsletter).toMatchObject({ status: 'fehler', fehler: 'altcha' });
  });

  it('letzter Schritt ohne ALTCHA → Fehler „altcha“, Werte und letzter Schritt bleiben, neuer ALTCHA-Schlüssel', async () => {
    const r = await sendeMitgliedsantrag(null, formular({ ...alle(), schritt: '2' }));
    expect(r).toMatchObject({ status: 'fehler', fehler: 'altcha' });
    const a = r.ansicht as Ansicht;
    expect(a.props).toMatchObject({ schritt: 2, werte: { vorname: 'Testperson', interessen: ['prayer', 'youth'] } });
    expect(a.props.altchaSchluessel).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('manipuliertes Absenden mit ungültiger Altersgruppe → Fehler „ungueltig“ und zurück in Schritt 1', async () => {
    const r = await sendeMitgliedsantrag(null, formular({ ...alle({ altersgruppe: 'unbekannt' }), schritt: '2', altcha: await altcha() }));
    expect(r).toMatchObject({ status: 'fehler', fehler: 'pruefen', feldFehler: { altersgruppe: 'ungueltig' } });
    expect((r.ansicht as Ansicht).props.schritt).toBe(0);
  });

  it('Honigtopf ausgefüllt → scheinbarer Erfolg, nichts gespeichert', async () => {
    const r = await sendeMitgliedsantrag(null, formular({ ...alle(), schritt: '2', website: 'Bot' }));
    expect(r.status).toBe('erfolg');
    expect(await db.select().from(schema.eingang)).toHaveLength(0);
  });

  it('Erfolg: Eingang verschlüsselt, Newsletter als Wunsch gespeichert, Datenschutz-Einwilligung mit Textversion, zwei Mails', async () => {
    const r = await sendeMitgliedsantrag(null, formular({ ...alle(), schritt: '2', altcha: await altcha() }));
    expect(r.status).toBe('erfolg');
    const [eingang] = await db.select().from(schema.eingang).where(eq(schema.eingang.art, 'mitgliedsantrag'));
    expect(eingang).toMatchObject({ sprache: 'tr', status: 'neu' });
    expect(eingang.datenVerschluesselt.toString('utf8')).not.toContain('Testperson');
    expect(entschluessele<Record<string, unknown>>(eingang.datenVerschluesselt, eingang.schluesselId)).toMatchObject({
      vorname: 'Testperson',
      altersgruppe: '20-30',
      geschlecht: 'w',
      interessen: ['prayer', 'youth'],
      newsletter: true,
      datenschutz: 'ja',
    });
    const einw = await db.select().from(schema.einwilligung).where(eq(schema.einwilligung.eingangId, eingang.id));
    expect(einw.map((e) => e.textSchluessel)).toEqual(['mitgliedsantrag.einwilligung.datenschutz']);
    expect(einw[0].textVersion).toBe(sha256('[einwilligung.datenschutzText]'));
    const mails = await db.select().from(schema.mailAusgang).where(eq(schema.mailAusgang.bezugEingangId, eingang.id));
    const empfaenger = mails.map((m) => entschluessele<{ an: string }>(m.datenVerschluesselt, m.schluesselId).an).sort();
    expect(empfaenger).toEqual(['rolle:mitgliedsantrag', 'testperson.sieben@example.test']);
  });

  it('Erfolg ohne Newsletter: Häkchen fehlt, Wert ist „nicht gewünscht“ (false)', async () => {
    const ohne = { sprache: 'tr', ...KONTAKT, ...INTERESSEN, motivation: 'Testmotivation', datenschutz: 'ja' };
    const r = await sendeMitgliedsantrag(null, formular({ ...ohne, schritt: '2', altcha: await altcha() }));
    expect(r.status).toBe('erfolg');
    const [eingang] = await db.select().from(schema.eingang).where(eq(schema.eingang.art, 'mitgliedsantrag'));
    expect(entschluessele<{ newsletter: boolean }>(eingang.datenVerschluesselt, eingang.schluesselId).newsletter).toBe(false);
  });
});
