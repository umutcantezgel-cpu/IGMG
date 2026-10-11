import { deriveKey } from 'altcha-lib/algorithms/pbkdf2';
import { solveChallenge } from 'altcha-lib';
import { eq } from 'drizzle-orm';
import type { ReactElement } from 'react';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { schema } from '@/lib/db';
import { entschluessele, sha256 } from '@/lib/krypto';
import { angemeldetAls, aufrufe, formular, verwaltungsUmgebung } from './hilfen/verwaltung';

/**
 * B03 (ADR 0005, K-07, G-07): Kontaktformular über `verarbeiteFormular` – Reihenfolge Rate → Honigtopf →
 * ALTCHA (einmalig) → Zod → Transaktion (eingang verschlüsselt, einwilligung, mail_ausgang) → Versand.
 */
vi.mock('next-intl/server', () => ({ getTranslations: async () => (k: string) => `[${k}]` }));

const { client, db } = await verwaltungsUmgebung();
const { sendeKontakt } = await import('@/server/actions/formulare/kontakt');
const { neueChallenge } = await import('@/lib/validierung/altcha');
const { versendeOffeneMails } = await import('@/lib/mail/ausgang');
afterAll(() => client.close());
// Alle Aufrufe kommen von derselben „IP“ (Header gemockt): Zähler je Test leeren, die Grenze prüft ein eigener Test.
beforeEach(async () => {
  await db.delete(schema.ratenbegrenzung);
});

async function altcha(): Promise<string> {
  const challenge = await neueChallenge();
  const solution = await solveChallenge({ challenge, deriveKey });
  return Buffer.from(JSON.stringify({ challenge, solution })).toString('base64');
}

const NACHRICHT = 'Dies ist eine Testnachricht ohne Personendaten.';

const werte = (zusatz: Record<string, string> = {}) => ({
  sprache: 'tr',
  name: 'Testperson Zwei',
  email: 'testperson.zwei@example.test',
  telefon: '',
  betreff: 'Testanfrage',
  nachricht: NACHRICHT,
  einwilligung: 'ja',
  ...zusatz,
});

describe('Kontaktformular', () => {
  it('Erfolg: Eingang verschlüsselt, Einwilligung mit Textversion, Bestätigung und Benachrichtigung, nur die Formularfelder', async () => {
    await angemeldetAls(null);
    expect(await sendeKontakt(null, formular({ ...werte(), altcha: await altcha() }))).toMatchObject({ status: 'erfolg' });
    const [eingang] = await db.select().from(schema.eingang).where(eq(schema.eingang.art, 'kontakt'));
    expect(eingang).toMatchObject({ art: 'kontakt', sprache: 'tr', anzahl: 1, bezugId: null });
    // Höchstfrist ab Eingang (Tor B/C SP-B B4): nichts bleibt unbegrenzt liegen
    expect(Math.round((eingang.loeschenAb!.getTime() - eingang.erstelltAm.getTime()) / 86_400_000)).toBe(365);
    // Datensparsam (G-07): gespeichert sind nur die Felder des Formulars – keine Schutz- oder Steuerfelder
    const daten = entschluessele<Record<string, string>>(eingang.datenVerschluesselt, eingang.schluesselId);
    expect(daten).toEqual({
      name: 'Testperson Zwei',
      email: 'testperson.zwei@example.test',
      telefon: '',
      betreff: 'Testanfrage',
      nachricht: NACHRICHT,
      einwilligung: 'ja',
    });
    expect(eingang.datenVerschluesselt.toString('utf8')).not.toContain('Testperson');
    // Nachvollziehbarkeit ohne Personendaten (Tor A SP-A-01/-07)
    const audit = await db.select().from(schema.auditEintrag).where(eq(schema.auditEintrag.zielId, eingang.id));
    expect(audit).toHaveLength(1);
    expect(audit[0]).toMatchObject({ aktion: 'eingang.angelegt', benutzerId: null, details: { art: 'kontakt' } });
    expect(JSON.stringify(audit[0])).not.toContain('Testperson');
    // Einwilligung mit Zeitpunkt und Textversion (K-07): Text aus messages, hier als Platzhalter gemockt
    const [einw] = await db.select().from(schema.einwilligung).where(eq(schema.einwilligung.eingangId, eingang.id));
    expect(einw).toMatchObject({
      textSchluessel: 'kontaktformular.einwilligung',
      textVersion: sha256('[einwilligung]'),
      sprache: 'tr',
    });
    // Zwei Mails: Bestätigung an die Person (ihre Sprache, ohne Formulardaten), Benachrichtigung an die Rolle (Deutsch)
    const mails = await db.select().from(schema.mailAusgang).where(eq(schema.mailAusgang.bezugEingangId, eingang.id));
    expect(mails.map((m) => m.vorlage).sort()).toEqual(['benachrichtigung', 'bestaetigung']);
    const benachrichtigung = mails.find((m) => m.vorlage === 'benachrichtigung')!;
    expect(benachrichtigung).toMatchObject({ sprache: 'de' });
    expect(
      entschluessele<{ an: string; daten: Record<string, string> }>(benachrichtigung.datenVerschluesselt, benachrichtigung.schluesselId),
    ).toEqual({ an: 'rolle:kontakt', daten: { art: 'kontakt' } });
    const bestaetigung = mails.find((m) => m.vorlage === 'bestaetigung')!;
    expect(bestaetigung).toMatchObject({ sprache: 'tr' });
    expect(
      entschluessele<{ an: string; daten: Record<string, string> }>(bestaetigung.datenVerschluesselt, bestaetigung.schluesselId),
    ).toEqual({ an: 'testperson.zwei@example.test', daten: { art: 'kontakt', datum: expect.any(String) } });
    // Versand nach der Antwort (after) ist eingeplant
    expect(aufrufe.nachher.length).toBeGreaterThanOrEqual(1);
  });

  it('dieselbe ALTCHA-Lösung ein zweites Mal: abgelehnt', async () => {
    const loesung = await altcha();
    expect((await sendeKontakt(null, formular({ ...werte({ email: 'testperson.drei@example.test' }), altcha: loesung }))).status).toBe(
      'erfolg',
    );
    expect(await sendeKontakt(null, formular({ ...werte({ email: 'testperson.vier@example.test' }), altcha: loesung }))).toMatchObject({
      status: 'fehler',
      fehler: 'altcha',
    });
  });

  it('ohne ALTCHA: Fehler „altcha“, nichts gespeichert', async () => {
    const vorher = (await db.select().from(schema.eingang)).length;
    expect(await sendeKontakt(null, formular(werte()))).toMatchObject({ status: 'fehler', fehler: 'altcha' });
    expect((await db.select().from(schema.eingang)).length).toBe(vorher);
  });

  it('Honigtopf ausgefüllt: scheinbarer Erfolg, nichts gespeichert', async () => {
    const vorher = (await db.select().from(schema.eingang)).length;
    expect(await sendeKontakt(null, formular({ ...werte(), website: 'https://spam.example', altcha: await altcha() }))).toMatchObject({
      status: 'erfolg',
    });
    expect((await db.select().from(schema.eingang)).length).toBe(vorher);
  });

  it('Validierung: E-Mail ungültig und fehlende Einwilligung → Feldfehler, Eingaben in der Ansicht, neuer ALTCHA-Schlüssel', async () => {
    const r = await sendeKontakt(null, formular({ ...werte({ email: 'kein-at-zeichen', einwilligung: '' }), altcha: await altcha() }));
    expect(r).toMatchObject({ status: 'fehler', fehler: 'pruefen', feldFehler: { email: 'email', einwilligung: 'einwilligung' } });
    expect(r).not.toHaveProperty('werte');
    // Die Ansicht (Server-Komponente) bekommt Werte, Fehler und einen neuen ALTCHA-Schlüssel (E-028)
    const ansicht = r.ansicht as ReactElement<{
      ergebnis: { werte: Record<string, unknown> };
      altchaSchluessel: string;
    }>;
    expect(ansicht.props.ergebnis.werte).toMatchObject({ email: 'kein-at-zeichen', name: 'Testperson Zwei', betreff: 'Testanfrage' });
    const zweite = (await sendeKontakt(null, formular(werte()))).ansicht as typeof ansicht;
    expect(zweite.props.altchaSchluessel).toMatch(/^[0-9a-f-]{36}$/);
    expect(zweite.props.altchaSchluessel).not.toBe(ansicht.props.altchaSchluessel);
  });

  it('Pflicht, Länge und Telefon: leere Nachricht „pflicht“, ungültige Telefonnummer „telefon“, zu lange Texte „zuLang“', async () => {
    expect(await sendeKontakt(null, formular({ ...werte({ nachricht: '   ' }), altcha: await altcha() }))).toMatchObject({
      status: 'fehler',
      fehler: 'pruefen',
      feldFehler: { nachricht: 'pflicht' },
    });
    expect(await sendeKontakt(null, formular({ ...werte({ telefon: 'abc' }), altcha: await altcha() }))).toMatchObject({
      feldFehler: { telefon: 'telefon' },
    });
    expect(await sendeKontakt(null, formular({ ...werte({ nachricht: 'x'.repeat(2001) }), altcha: await altcha() }))).toMatchObject({
      feldFehler: { nachricht: 'zuLang' },
    });
    expect(await sendeKontakt(null, formular({ ...werte({ betreff: 'x'.repeat(101) }), altcha: await altcha() }))).toMatchObject({
      feldFehler: { betreff: 'zuLang' },
    });
  });

  it('Ratenbegrenzung: der sechste Versuch im Fenster wird abgewiesen, bevor ALTCHA oder Zod laufen', async () => {
    for (let i = 0; i < 5; i++) expect(await sendeKontakt(null, formular(werte()))).toMatchObject({ fehler: 'altcha' });
    expect(await sendeKontakt(null, formular(werte()))).toMatchObject({ status: 'fehler', fehler: 'zuViele' });
  });

  it('Versand: offene Mails werden zugestellt (Datei-Transport) und als gesendet markiert', async () => {
    const r = await versendeOffeneMails();
    expect(r.fehler).toBe(0);
    expect(r.gesendet).toBeGreaterThanOrEqual(2);
    const offen = (await db.select().from(schema.mailAusgang)).filter((m) => !m.gesendetAm);
    expect(offen).toHaveLength(0);
  });
});
