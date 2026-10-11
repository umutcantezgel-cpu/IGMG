import { deriveKey } from 'altcha-lib/algorithms/pbkdf2';
import { solveChallenge } from 'altcha-lib';
import { desc, eq } from 'drizzle-orm';
import type { ReactElement } from 'react';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { schema } from '@/lib/db';
import { entschluessele, sha256 } from '@/lib/krypto';
import { melderSchema } from '@/lib/validierung/ticket';
import { angemeldetAls, aufrufe, formular, verwaltungsUmgebung } from './hilfen/verwaltung';

/**
 * C10b (E-034, E-037, ADR 0005, K-07, G-07): öffentliche Meldung über `pruefeEinsendung` – Reihenfolge Rate → Honigtopf →
 * ALTCHA (einmalig) → Zod → Transaktion (Ticket mit verschlüsselten Melderangaben, Audit, Mail-Ausgang) → Versand.
 */
vi.mock('next-intl/server', () => ({ getTranslations: async () => (k: string) => `[${k}]` }));

const { client, db } = await verwaltungsUmgebung();
const { sendeMeldung } = await import('@/server/actions/formulare/meldung');
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

const NACHRICHT = 'Dies ist eine Testmeldung ohne echte Personendaten.';

const werte = (zusatz: Record<string, string> = {}): Record<string, string> => ({
  sprache: 'tr',
  typ: 'wunsch',
  organisation: 'kt',
  betreff: 'Testbetreff',
  beschreibung: NACHRICHT,
  vorname: 'Testperson',
  nachname: 'Eins',
  telefon: '',
  email: 'testperson.eins@example.test',
  rueckmeldung: 'ja',
  rueckmeldeArt: 'email',
  einwilligung: 'ja',
  ...zusatz,
});

/** Werte ohne ein Feld (ein Feld, das der Browser gar nicht sendet, etwa das ungewählte Auswahlfeld). */
const ohne = (feld: string, w: Record<string, string>): Record<string, string> =>
  Object.fromEntries(Object.entries(w).filter(([k]) => k !== feld));

/** Gespeicherte Melderangaben entschlüsselt (verschlüsselt im Ticket, E-037). */
function melderAus(ticket: { melderVerschluesselt: Buffer | null; schluesselId: number | null }) {
  return entschluessele<Record<string, unknown>>(ticket.melderVerschluesselt!, ticket.schluesselId!);
}

/** Zuletzt angelegtes Ticket (Betreff und Text stehen nur verschlüsselt, SP-B B1). */
async function letztesTicket() {
  const [t] = await db.select().from(schema.ticket).orderBy(desc(schema.ticket.nummer)).limit(1);
  return t;
}

/** Mail-Ausgang-Zeilen, die nach diesem Zeitpunkt (Kennungen) entstanden sind – unabhängig von der Reihenfolge. */
async function mailsSeit(vorherIds: Set<string>) {
  return (await db.select().from(schema.mailAusgang)).filter((m) => !vorherIds.has(m.id));
}
async function mailKennungen(): Promise<Set<string>> {
  return new Set((await db.select({ id: schema.mailAusgang.id }).from(schema.mailAusgang)).map((m) => m.id));
}

describe('Meldung', () => {
  it('Erfolg: Ticket mit verschlüsselten Melderangaben und Einwilligungsnachweis, Audit ohne Personendaten, Mails ohne Formulardaten', async () => {
    await angemeldetAls(null);
    const vorher = await mailKennungen();
    expect(await sendeMeldung(null, formular({ ...werte(), altcha: await altcha() }))).toMatchObject({ status: 'erfolg' });

    const ticket = await letztesTicket();
    // Betreff und Text nie im Klartext am Ticket (Liste, Übersicht, Zähler zeigen keinen Freitext)
    expect(ticket).toMatchObject({
      titel: 'Öffentliche Meldung',
      beschreibung: '',
      typ: 'wunsch',
      organisation: 'kt',
      status: 'offen',
      kategorie: null,
      erstelltVon: null,
    });
    // Kontaktangaben nur verschlüsselt, Form von melderSchema plus Einwilligung mit Textversion (E-037, K-07)
    expect(ticket.melderVerschluesselt!.toString('utf8')).not.toContain('Testperson');
    expect(ticket.melderVerschluesselt!.toString('utf8')).not.toContain('Testbetreff');
    const melder = melderAus(ticket);
    expect(melder).toEqual({
      betreff: 'Testbetreff',
      nachricht: NACHRICHT,
      vorname: 'Testperson',
      nachname: 'Eins',
      email: 'testperson.eins@example.test',
      rueckmeldung: true,
      rueckmeldeArt: 'email',
      einwilligung: {
        schluessel: 'meldung.einwilligung',
        textVersion: sha256('[einwilligung]'),
        sprache: 'tr',
        erteiltAm: expect.any(String),
      },
    });
    expect(melderSchema.safeParse(melder).success).toBe(true);
    const erteilt = (melder.einwilligung as { erteiltAm: string }).erteiltAm;
    expect(new Date(erteilt).toISOString()).toBe(erteilt);

    // Nachvollziehbarkeit ohne Personendaten (G-07): der Eintrag nennt nur Typ und Kennzeichen „öffentlich“
    const audit = await db.select().from(schema.auditEintrag).where(eq(schema.auditEintrag.zielId, ticket.id));
    expect(audit).toHaveLength(1);
    expect(audit[0]).toMatchObject({
      aktion: 'ticket.angelegt',
      benutzerId: null,
      zielTyp: 'ticket',
      details: { typ: 'wunsch', oeffentlich: true },
    });
    expect(JSON.stringify(audit[0])).not.toMatch(/Testperson|testperson/);

    // Benachrichtigung an die Berechtigten ohne Formulardaten; Bestätigung an die Person in ihrer Sprache
    const neu = await mailsSeit(vorher);
    expect(neu).toHaveLength(2);
    expect(neu.every((m) => m.bezugEingangId === null)).toBe(true);
    const inhalt = neu.map((m) => ({
      vorlage: m.vorlage,
      sprache: m.sprache,
      ...entschluessele<{ an: string; daten: Record<string, string> }>(m.datenVerschluesselt, m.schluesselId),
    }));
    expect(inhalt).toEqual(
      expect.arrayContaining([
        {
          vorlage: 'benachrichtigung',
          sprache: 'de',
          an: 'recht:ticket.bearbeiten',
          daten: { art: 'meldung', pfad: `/verwaltung/tickets/${ticket.id}` },
        },
        {
          vorlage: 'bestaetigung',
          sprache: 'tr',
          an: 'testperson.eins@example.test',
          daten: { art: 'meldung', datum: expect.any(String) },
        },
      ]),
    );
    // Versand nach der Antwort (after) ist eingeplant
    expect(aufrufe.nachher.length).toBeGreaterThanOrEqual(1);
  });

  it('ohne E-Mail-Adresse und ohne Rückmeldung: keine Bestätigung, keine Art der Rückmeldung gespeichert', async () => {
    const text = 'Zweite Testmeldung ohne Rückmeldung.';
    const vorher = await mailKennungen();
    const eingabe = ohne('rueckmeldeArt', werte({ email: '', rueckmeldung: 'nein', beschreibung: text }));
    expect(await sendeMeldung(null, formular({ ...eingabe, altcha: await altcha() }))).toMatchObject({ status: 'erfolg' });

    const ticket = await letztesTicket();
    expect(melderAus(ticket)).toEqual({
      betreff: 'Testbetreff',
      nachricht: text,
      vorname: 'Testperson',
      nachname: 'Eins',
      rueckmeldung: false,
      einwilligung: {
        schluessel: 'meldung.einwilligung',
        textVersion: sha256('[einwilligung]'),
        sprache: 'tr',
        erteiltAm: expect.any(String),
      },
    });
    // Nur die Benachrichtigung; die Bestätigung braucht eine E-Mail-Adresse
    const neu = await mailsSeit(vorher);
    expect(neu.map((m) => m.vorlage)).toEqual(['benachrichtigung']);
  });

  it('Rückmeldung per Telefon mit Telefonnummer: Erfolg, Telefonnummer nur verschlüsselt im Melder', async () => {
    const text = 'Dritte Testmeldung mit Rückruf.';
    const eingabe = ohne('email', werte({ telefon: '+49 000 1234567', rueckmeldeArt: 'telefon', beschreibung: text }));
    expect(await sendeMeldung(null, formular({ ...eingabe, altcha: await altcha() }))).toMatchObject({ status: 'erfolg' });
    const ticket = await letztesTicket();
    expect(melderAus(ticket)).toMatchObject({ nachricht: text, telefon: '+49 000 1234567', rueckmeldung: true, rueckmeldeArt: 'telefon' });
    expect(ticket.melderVerschluesselt!.toString('utf8')).not.toContain('000 1234567');
  });

  it('Bestätigungen je Adresse begrenzt (SP-B B2): ab der vierten innerhalb von 24 h keine Mail mehr, die Meldung gilt', async () => {
    const adresse = 'testperson.vier@example.test';
    const vorher = await mailKennungen();
    const tickets = (await db.select().from(schema.ticket)).length;
    for (let i = 0; i < 4; i++)
      expect(await sendeMeldung(null, formular({ ...werte({ email: adresse }), altcha: await altcha() }))).toMatchObject({
        status: 'erfolg',
      });
    expect((await db.select().from(schema.ticket)).length).toBe(tickets + 4);
    const neu = await mailsSeit(vorher);
    const an = neu.map((m) => ({ vorlage: m.vorlage, an: entschluessele<{ an: string }>(m.datenVerschluesselt, m.schluesselId).an }));
    expect(an.filter((m) => m.vorlage === 'bestaetigung' && m.an === adresse)).toHaveLength(3);
    expect(an.filter((m) => m.vorlage === 'benachrichtigung')).toHaveLength(4);
    // Gezählt wird nur als HMAC – die Adresse steht nicht in der Ratentabelle
    expect(JSON.stringify(await db.select().from(schema.ratenbegrenzung))).not.toContain('testperson');
  });

  it('Honigtopf ausgefüllt: scheinbarer Erfolg, nichts gespeichert', async () => {
    const vorher = (await db.select().from(schema.ticket)).length;
    expect(await sendeMeldung(null, formular({ ...werte(), website: 'https://spam.example', altcha: await altcha() }))).toMatchObject({
      status: 'erfolg',
    });
    expect((await db.select().from(schema.ticket)).length).toBe(vorher);
  });

  it('ohne ALTCHA: Fehler „altcha“, nichts gespeichert', async () => {
    const vorher = (await db.select().from(schema.ticket)).length;
    expect(await sendeMeldung(null, formular(werte()))).toMatchObject({ status: 'fehler', fehler: 'altcha' });
    expect((await db.select().from(schema.ticket)).length).toBe(vorher);
  });

  it('dieselbe ALTCHA-Lösung ein zweites Mal: abgelehnt', async () => {
    const loesung = await altcha();
    expect((await sendeMeldung(null, formular({ ...werte({ email: 'testperson.zwei@example.test' }), altcha: loesung }))).status).toBe(
      'erfolg',
    );
    expect(await sendeMeldung(null, formular({ ...werte({ email: 'testperson.drei@example.test' }), altcha: loesung }))).toMatchObject({
      status: 'fehler',
      fehler: 'altcha',
    });
  });

  it('Pflicht, Auswahl, Länge und Format: jeweils ein Feldfehler mit Schlüssel, nichts gespeichert', async () => {
    const vorher = (await db.select().from(schema.ticket)).length;
    const faelle: [string, Record<string, string>, Record<string, string>][] = [
      [
        'Telefon fehlt bei Rückruf per Telefon',
        ohne('email', werte({ rueckmeldeArt: 'telefon', telefon: '' })),
        { telefon: 'telefonPflicht' },
      ],
      ['E-Mail fehlt bei Rückmeldung per E-Mail', werte({ email: '' }), { email: 'emailPflicht' }],
      ['Ja ohne Art der Rückmeldung', ohne('rueckmeldeArt', werte()), { rueckmeldeArt: 'artPflicht' }],
      ['Meldungstyp „intern“ ist nicht wählbar', werte({ typ: 'intern' }), { typ: 'typPflicht' }],
      ['Meldungstyp fehlt', ohne('typ', werte()), { typ: 'typPflicht' }],
      ['Betreff leer', werte({ betreff: '   ' }), { betreff: 'betreffPflicht' }],
      ['Nachricht leer', werte({ beschreibung: '   ' }), { beschreibung: 'nachrichtPflicht' }],
      ['Nachricht zu lang', werte({ beschreibung: 'x'.repeat(2001) }), { beschreibung: 'zuLang' }],
      ['E-Mail ungültig', werte({ email: 'kein-at-zeichen' }), { email: 'email' }],
      ['Telefon ungültig', werte({ telefon: 'abc', rueckmeldeArt: 'persoenlich' }), { telefon: 'telefon' }],
      ['Einwilligung fehlt', werte({ einwilligung: '' }), { einwilligung: 'einwilligung' }],
      ['Rückmeldung nicht beantwortet', ohne('rueckmeldung', werte()), { rueckmeldung: 'wahlPflicht' }],
      ['Organisation unbekannt', werte({ organisation: 'xy' }), { organisation: 'ungueltig' }],
    ];
    for (const [name, eingabe, feldFehler] of faelle) {
      // Jeder Fall ist ein eigener Versuch: die Ratenbegrenzung (fünf je Fenster) wird je Fall geleert
      await db.delete(schema.ratenbegrenzung);
      const r = await sendeMeldung(null, formular({ ...eingabe, altcha: await altcha() }));
      expect(r, name).toMatchObject({ status: 'fehler', fehler: 'pruefen', feldFehler });
    }
    expect((await db.select().from(schema.ticket)).length).toBe(vorher);
  }, 600_000); // dreizehn ALTCHA-Lösungen (je Fall eine Aufgabe, unter Last bis ≈40 s je Lösung)

  it('Fehler: die Ansicht trägt die Eingaben und einen neuen ALTCHA-Schlüssel (Lösungen sind einmalig)', async () => {
    const r = await sendeMeldung(null, formular({ ...ohne('typ', werte({ betreff: '' })), altcha: await altcha() }));
    expect(r).toMatchObject({ status: 'fehler', fehler: 'pruefen', feldFehler: { typ: 'typPflicht', betreff: 'betreffPflicht' } });
    expect(r).not.toHaveProperty('werte');
    const ansicht = r.ansicht as ReactElement<{ ergebnis: { werte: Record<string, unknown> }; altchaSchluessel: string }>;
    expect(ansicht.props.ergebnis.werte).toMatchObject({ vorname: 'Testperson', betreff: '', rueckmeldeArt: 'email' });
    const zweite = (await sendeMeldung(null, formular({ ...ohne('typ', werte()), altcha: await altcha() }))).ansicht as typeof ansicht;
    expect(zweite.props.altchaSchluessel).toMatch(/^[0-9a-f-]{36}$/);
    expect(zweite.props.altchaSchluessel).not.toBe(ansicht.props.altchaSchluessel);
  });

  it('Ratenbegrenzung: der sechste Versuch im Fenster wird abgewiesen, bevor ALTCHA oder Zod laufen', async () => {
    for (let i = 0; i < 5; i++) expect(await sendeMeldung(null, formular(werte()))).toMatchObject({ fehler: 'altcha' });
    expect(await sendeMeldung(null, formular(werte()))).toMatchObject({ status: 'fehler', fehler: 'zuViele' });
  });

  it('Versand: offene Mails werden zugestellt (Datei-Transport) und als gesendet markiert', async () => {
    // Eine Person mit Rolle Administration: Empfänger der Benachrichtigung (recht:ticket.bearbeiten)
    await angemeldetAls([{ rolle: 'administration' }]);
    const r = await versendeOffeneMails();
    expect(r.fehler).toBe(0);
    expect(r.gesendet).toBeGreaterThanOrEqual(1);
    const offen = (await db.select().from(schema.mailAusgang)).filter((m) => !m.gesendetAm);
    expect(offen).toHaveLength(0);
  });
});
