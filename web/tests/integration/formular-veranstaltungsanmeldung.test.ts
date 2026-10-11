import { deriveKey } from 'altcha-lib/algorithms/pbkdf2';
import { solveChallenge } from 'altcha-lib';
import { eq } from 'drizzle-orm';
import type { ReactElement } from 'react';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { schema } from '@/lib/db';
import { entschluessele, sha256 } from '@/lib/krypto';
import { angemeldetAls, aufrufe, formular, verwaltungsUmgebung } from './hilfen/verwaltung';

/**
 * B02/B04 (ADR 0005, K-07): Veranstaltungsanmeldung über `verarbeiteFormular` – Reihenfolge Rate → Honigtopf →
 * ALTCHA (einmalig) → Zod → Platzprüfung → Transaktion (eingang verschlüsselt, einwilligung, mail_ausgang) → Versand.
 */
vi.mock('next-intl/server', () => ({ getTranslations: async () => (k: string) => `[${k}]` }));
// Veralteter Platzzahl-Cache (bis zu einer Stunde, Tor B/C SP-B B9): bei Bedarf 0 belegte Plätze melden
const cache = vi.hoisted(() => ({ veraltet: false }));
vi.mock('@/server/queries/veranstaltungen', async (original) => {
  const echt = await original<typeof import('@/server/queries/veranstaltungen')>();
  return { ...echt, ladeAnmeldezahl: async (id: string) => (cache.veraltet ? 0 : echt.ladeAnmeldezahl(id)) };
});

const { client, db } = await verwaltungsUmgebung();
const { meldeAn } = await import('@/server/actions/formulare/veranstaltungsanmeldung');
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

const [termin] = await db
  .insert(schema.veranstaltung)
  .values({
    slug: 'testtermin-anmeldung',
    titel: { de: 'Testtermin Anmeldung' },
    kategorie: 'gemeinde',
    organisation: 'gt',
    beginn: new Date(Date.now() + 14 * 86_400_000),
    status: 'veroeffentlicht',
    anmeldungAktiv: true,
    plaetze: 2,
  })
  .returning({ id: schema.veranstaltung.id });

const werte = (zusatz: Record<string, string> = {}) => ({
  veranstaltungId: termin.id,
  sprache: 'tr',
  name: 'Testperson Zwei',
  email: 'testperson.zwei@example.test',
  telefon: '',
  personen: '1',
  einwilligung: 'ja',
  ...zusatz,
});

describe('Veranstaltungsanmeldung', () => {
  it('Erfolg: Eingang verschlüsselt, Einwilligung mit Textversion, zwei Mails, Platzzahl-Cache erneuert', async () => {
    await angemeldetAls(null);
    expect(await meldeAn(null, formular({ ...werte(), altcha: await altcha() }))).toMatchObject({ status: 'erfolg' });
    const [eingang] = await db.select().from(schema.eingang).where(eq(schema.eingang.bezugId, termin.id));
    expect(eingang).toMatchObject({ art: 'veranstaltungsanmeldung', sprache: 'tr', anzahl: 1 });
    // Löschfrist 30 Tage nach dem (einmaligen) Termin (M-050), Audit ohne Personendaten (Tor A SP-A-01/-07)
    const [t0] = await db
      .select({ beginn: schema.veranstaltung.beginn })
      .from(schema.veranstaltung)
      .where(eq(schema.veranstaltung.id, termin.id));
    expect(eingang.loeschenAb?.getTime()).toBe(t0.beginn.getTime() + 30 * 86_400_000);
    const audit = await db.select().from(schema.auditEintrag).where(eq(schema.auditEintrag.zielId, eingang.id));
    expect(audit).toHaveLength(1);
    expect(audit[0]).toMatchObject({ aktion: 'eingang.angelegt', benutzerId: null, details: { art: 'veranstaltungsanmeldung' } });
    expect(JSON.stringify(audit[0])).not.toContain('Testperson');
    expect(entschluessele<{ name: string; email: string }>(eingang.datenVerschluesselt, eingang.schluesselId)).toMatchObject({
      name: 'Testperson Zwei',
      email: 'testperson.zwei@example.test',
    });
    expect(eingang.datenVerschluesselt.toString('utf8')).not.toContain('Testperson');
    const [einw] = await db.select().from(schema.einwilligung).where(eq(schema.einwilligung.eingangId, eingang.id));
    expect(einw).toMatchObject({
      textSchluessel: 'veranstaltung.formular.einwilligung',
      textVersion: sha256('[einwilligung]'),
      sprache: 'tr',
    });
    const mails = await db.select().from(schema.mailAusgang).where(eq(schema.mailAusgang.bezugEingangId, eingang.id));
    expect(mails.map((m) => m.vorlage).sort()).toEqual(['benachrichtigung', 'bestaetigung']);
    const benachrichtigung = mails.find((m) => m.vorlage === 'benachrichtigung')!;
    expect(
      entschluessele<{ an: string; daten: Record<string, string> }>(benachrichtigung.datenVerschluesselt, benachrichtigung.schluesselId),
    ).toEqual({
      an: 'rolle:veranstaltungsanmeldung:gt',
      daten: { art: 'veranstaltungsanmeldung' },
    });
    expect(aufrufe.updateTag).toContain(`anmeldungen:${termin.id}`);
    expect(aufrufe.nachher.length).toBeGreaterThanOrEqual(1);
  });

  it('dieselbe ALTCHA-Lösung ein zweites Mal: abgelehnt', async () => {
    const loesung = await altcha();
    expect((await meldeAn(null, formular({ ...werte({ email: 'testperson.drei@example.test' }), altcha: loesung }))).status).toBe('erfolg');
    expect(await meldeAn(null, formular({ ...werte({ email: 'testperson.vier@example.test' }), altcha: loesung }))).toMatchObject({
      status: 'fehler',
      fehler: 'altcha',
    });
  });

  it('ohne ALTCHA: Fehler „altcha“, nichts gespeichert', async () => {
    const vorher = (await db.select().from(schema.eingang)).length;
    expect(await meldeAn(null, formular(werte()))).toMatchObject({ status: 'fehler', fehler: 'altcha' });
    expect((await db.select().from(schema.eingang)).length).toBe(vorher);
  });

  it('Honigtopf ausgefüllt: scheinbarer Erfolg, nichts gespeichert', async () => {
    const vorher = (await db.select().from(schema.eingang)).length;
    expect(await meldeAn(null, formular({ ...werte(), website: 'https://spam.example', altcha: await altcha() }))).toMatchObject({
      status: 'erfolg',
    });
    expect((await db.select().from(schema.eingang)).length).toBe(vorher);
  });

  it('ausgebucht: mehr Personen als freie Plätze → „ausgebucht“', async () => {
    // belegt: 2 (zwei Anmeldungen à 1 Person) bei 2 Plätzen
    expect(await meldeAn(null, formular({ ...werte({ personen: '1' }), altcha: await altcha() }))).toMatchObject({
      status: 'fehler',
      fehler: 'ausgebucht',
    });
  });

  it('veralteter Cache meldet freie Plätze: die Prüfung in der Transaktion lehnt trotzdem ab, nichts gespeichert (B9)', async () => {
    const vorher = (await db.select().from(schema.eingang)).length;
    cache.veraltet = true;
    try {
      expect(await meldeAn(null, formular({ ...werte({ personen: '1' }), altcha: await altcha() }))).toMatchObject({
        status: 'fehler',
        fehler: 'ausgebucht',
      });
    } finally {
      cache.veraltet = false;
    }
    expect((await db.select().from(schema.eingang)).length).toBe(vorher);
  });

  it('Validierung: E-Mail ungültig und fehlende Einwilligung → Feldfehler, Eingaben in werte', async () => {
    const r = await meldeAn(null, formular({ ...werte({ email: 'kein-at-zeichen', einwilligung: '' }), altcha: await altcha() }));
    expect(r).toMatchObject({ status: 'fehler', fehler: 'pruefen', feldFehler: { email: 'email', einwilligung: 'einwilligung' } });
    expect(r).not.toHaveProperty('werte');
    // Die Ansicht (Server-Komponente) bekommt Werte, Fehler und einen neuen ALTCHA-Schlüssel (E-028)
    const ansicht = r.ansicht as ReactElement<{
      ergebnis: { werte: Record<string, unknown> };
      altchaSchluessel: string;
      veranstaltungId: string;
      verfuegbar: number;
    }>;
    expect(ansicht.props.ergebnis.werte).toMatchObject({ email: 'kein-at-zeichen', name: 'Testperson Zwei' });
    expect(ansicht.props).toMatchObject({ veranstaltungId: termin.id, verfuegbar: 0 });
    const zweite = (await meldeAn(null, formular(werte()))).ansicht as typeof ansicht;
    expect(zweite.props.altchaSchluessel).toMatch(/^[0-9a-f-]{36}$/);
    expect(zweite.props.altchaSchluessel).not.toBe(ansicht.props.altchaSchluessel);
  });

  it('Ratenbegrenzung: der sechste Versuch im Fenster wird abgewiesen, bevor ALTCHA oder Zod laufen', async () => {
    for (let i = 0; i < 5; i++) expect(await meldeAn(null, formular(werte()))).toMatchObject({ fehler: 'altcha' });
    expect(await meldeAn(null, formular(werte()))).toMatchObject({ status: 'fehler', fehler: 'zuViele' });
  });

  it('Versand: offene Mails werden zugestellt (Datei-Transport) und als gesendet markiert', async () => {
    const r = await versendeOffeneMails();
    expect(r.fehler).toBe(0);
    expect(r.gesendet).toBeGreaterThanOrEqual(2);
    const offen = (await db.select().from(schema.mailAusgang)).filter((m) => !m.gesendetAm);
    expect(offen).toHaveLength(0);
  });
});
