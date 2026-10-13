import { deriveKey } from 'altcha-lib/algorithms/pbkdf2';
import { solveChallenge } from 'altcha-lib';
import { eq } from 'drizzle-orm';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { schema } from '@/lib/db';
import { entschluessele } from '@/lib/krypto';
import { angemeldetAls, aufrufe, formular, verwaltungsUmgebung } from './hilfen/verwaltung';

/**
 * Newsletter (AUFTRAG 3.10, K-B): öffentliche Anmeldung mit Double-Opt-in (Rate → Honigtopf → ALTCHA → Zod), Mail
 * „Anmeldung bestätigen“ über den Mail-Ausgang, Bestätigen und Abmelden über die Route Handler, Versand einer
 * Ausgabe aus der Verwaltung (Recht, genau einmal, ohne Adressen im Ausgang, Abmeldelink in jeder Mail) und
 * Datensparsamkeit (Antwort verrät nie, ob die Adresse bekannt ist).
 */
vi.mock('next-intl/server', () => ({
  getTranslations: async () => Object.assign((k: string) => `[${k}]`, { raw: (k: string) => `[${k}]` }),
}));
const gesendet: { an: string; betreff: string; html: string; text: string }[] = [];
vi.mock('@/lib/mail/transport', () => ({
  versende: async (m: { an: string; betreff: string; html: string; text: string }) => {
    gesendet.push(m);
  },
}));

const { client, db } = await verwaltungsUmgebung();
const { meldeNewsletterAn } = await import('@/server/actions/formulare/newsletter');
const { speichereAusgabe, versendeAusgabe, loescheAusgabe } = await import('@/server/actions/newsletter');
const { neueChallenge } = await import('@/lib/validierung/altcha');
const { versendeOffeneMails } = await import('@/lib/mail/ausgang');
const bestaetigenRoute = await import('@/app/api/newsletter/bestaetigen/route');
const abmeldenRoute = await import('@/app/api/newsletter/abmelden/route');
afterAll(() => client.close());
beforeEach(async () => {
  await db.delete(schema.ratenbegrenzung);
});

async function altcha(): Promise<string> {
  const challenge = await neueChallenge();
  const solution = await solveChallenge({ challenge, deriveKey });
  return Buffer.from(JSON.stringify({ challenge, solution })).toString('base64');
}

const werte = (zusatz: Record<string, string | string[]> = {}) => ({
  sprache: 'tr',
  email: 'testperson.newsletter@example.test',
  mailSprache: 'tr',
  themen: ['veranstaltungen', 'ramadan'],
  einwilligung: 'ja',
  ...zusatz,
});

/** Link aus einer gesendeten Mail (Bestätigen oder Abmelden). */
function link(html: string, art: 'bestaetigen' | 'abmelden'): string {
  const treffer = new RegExp(`https?://[^"\\s]*?/api/newsletter/${art}\\?[^"\\s]+`).exec(html);
  if (!treffer) throw new Error(`Kein ${art}-Link`);
  return treffer[0].replaceAll('&amp;', '&');
}

describe('Anmeldung (öffentlich)', () => {
  it('Erfolg: Anmeldung verschlüsselt, unbestätigt; Bestätigungsmail im Ausgang ohne Klartext', async () => {
    await angemeldetAls(null);
    expect(await meldeNewsletterAn(null, formular({ ...werte(), altcha: await altcha() }))).toMatchObject({ status: 'erfolg' });
    const abos = await db.select().from(schema.newsletterAbo);
    expect(abos).toHaveLength(1);
    expect(abos[0]).toMatchObject({ sprache: 'tr', themen: ['veranstaltungen', 'ramadan'], bestaetigtAm: null });
    expect(abos[0].einwilligungVersion).toMatch(/^newsletter-[0-9a-f]{16}$/);
    expect(abos[0].emailVerschluesselt.toString('utf8')).not.toContain('testperson');
    const mails = await db.select().from(schema.mailAusgang);
    expect(mails).toHaveLength(1);
    expect(mails[0]).toMatchObject({ vorlage: 'newsletter_bestaetigen', sprache: 'tr' });
    const inhalt = entschluessele<{ an: string; daten: Record<string, string> }>(mails[0].datenVerschluesselt, mails[0].schluesselId);
    expect(inhalt.an).toBe('testperson.newsletter@example.test');
    expect(Object.keys(inhalt.daten)).toEqual(['token']);
    expect(aufrufe.nachher.length).toBeGreaterThanOrEqual(1);
  });

  it('Mail „Anmeldung bestätigen“: in der gewählten Sprache, mit Link; der Link bestätigt und leitet auf #bestaetigt', async () => {
    gesendet.length = 0;
    expect(await versendeOffeneMails()).toMatchObject({ gesendet: 1, fehler: 0 });
    expect(gesendet[0].an).toBe('testperson.newsletter@example.test');
    expect(gesendet[0].html).toContain('lang="tr"');
    const url = link(gesendet[0].html, 'bestaetigen');
    expect(url).toContain('sprache=tr');
    const antwort = await bestaetigenRoute.GET(new Request(url));
    expect(antwort.status).toBe(303);
    expect(antwort.headers.get('location')).toBe('/tr/bulten#bestaetigt');
    const [abo] = await db.select().from(schema.newsletterAbo);
    expect(abo.bestaetigtAm).not.toBeNull();
    // Zweites Mal: der Link ist verbraucht
    expect((await bestaetigenRoute.GET(new Request(url))).headers.get('location')).toBe('/tr/bulten#ungueltig');
  });

  it('erneute Anmeldung einer bestätigten Adresse: dieselbe Antwort, keine neue Mail, nichts geändert', async () => {
    const vorher = (await db.select().from(schema.mailAusgang)).length;
    expect(
      await meldeNewsletterAn(null, formular({ ...werte({ email: 'TestPerson.Newsletter@example.test' }), altcha: await altcha() })),
    ).toMatchObject({ status: 'erfolg' });
    expect((await db.select().from(schema.mailAusgang)).length).toBe(vorher);
    expect(await db.select().from(schema.newsletterAbo)).toHaveLength(1);
  });

  it('Honigtopf: scheinbarer Erfolg, nichts gespeichert; ohne ALTCHA: Fehler „altcha“', async () => {
    const neu = werte({ email: 'testperson.honig@example.test' });
    expect(await meldeNewsletterAn(null, formular({ ...neu, website: 'https://spam.example', altcha: await altcha() }))).toMatchObject({
      status: 'erfolg',
    });
    expect(await meldeNewsletterAn(null, formular(neu))).toMatchObject({ status: 'fehler', fehler: 'altcha' });
    expect(await db.select().from(schema.newsletterAbo)).toHaveLength(1);
  });

  it('Zod: ungültige E-Mail, fremdes Thema, fehlende Einwilligung → Feldfehler', async () => {
    const r = await meldeNewsletterAn(
      null,
      formular({ ...werte({ email: 'kein-at', themen: ['werbung'], einwilligung: '' }), altcha: await altcha() }),
    );
    expect(r).toMatchObject({ status: 'fehler', fehler: 'pruefen' });
    // Fehler im Listenfeld tragen den Index (themen.0); Formular und Zusammenfassung lesen den Feldnamen davor
    expect(Object.keys(r.feldFehler ?? {}).sort()).toEqual(['einwilligung', 'email', 'themen.0']);
  });

  it('Ratenbegrenzung: der sechste Versuch im Fenster wird abgewiesen', async () => {
    for (let i = 0; i < 5; i++) expect(await meldeNewsletterAn(null, formular(werte()))).toMatchObject({ fehler: 'altcha' });
    expect(await meldeNewsletterAn(null, formular(werte()))).toMatchObject({ status: 'fehler', fehler: 'zuViele' });
  });
});

describe('Ausgabe (Verwaltung)', () => {
  const doc = (text: string) => JSON.stringify({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text }] }] });
  let ausgabeId = '';

  it('ohne Recht „newsletter.senden“ (Leitung, ohne Rolle, ohne zweiten Faktor): keinRecht', async () => {
    for (const rollen of [[{ rolle: 'leitung' as const }], []]) {
      await angemeldetAls(rollen);
      expect(await speichereAusgabe({}, formular({ betreffDe: 'Test', inhaltDe: doc('Hallo') }))).toEqual({ fehler: 'keinRecht' });
    }
    await angemeldetAls([{ rolle: 'redaktion' }], false);
    expect(await versendeAusgabe({}, formular({ id: crypto.randomUUID(), bestaetigt: 'ja' }))).toEqual({ fehler: 'keinRecht' });
  });

  it('anlegen: Pflicht Betreff und Inhalt, halbe Übersetzung abgelehnt; danach Entwurf mit Themen', async () => {
    await angemeldetAls([{ rolle: 'redaktion' }]);
    expect(await speichereAusgabe({}, formular({ betreffDe: '', inhaltDe: '', betreffTr: 'Yalnız konu' }))).toMatchObject({
      fehler: 'pruefen',
      feldFehler: { betreffDe: 'pflicht', inhaltDe: 'pflicht', inhaltTr: 'pflicht' },
    });
    const weiter = await speichereAusgabe(
      {},
      formular({
        betreffDe: 'Einladung zum Iftar',
        inhaltDe: doc('Herzliche Einladung.'),
        betreffTr: 'İftar daveti',
        inhaltTr: doc('Davetlisiniz.'),
        themen: ['ramadan'],
      }),
    ).catch((e: { ziel?: string }) => e);
    const ziel = (weiter as { ziel?: string }).ziel ?? '';
    expect(ziel).toMatch(/^\/verwaltung\/newsletter\/[0-9a-f-]{36}\?angelegt=1$/);
    ausgabeId = ziel.split('/')[3].split('?')[0];
    const [a] = await db.select().from(schema.newsletterAusgabe).where(eq(schema.newsletterAusgabe.id, ausgabeId));
    expect(a).toMatchObject({ themen: ['ramadan'], versendetAm: null, betreff: { de: 'Einladung zum Iftar', tr: 'İftar daveti' } });
  });

  it('Versand: nur mit Bestätigung; genau einmal; Mail-Ausgang ohne Adresse; Mail in Sprache des Abos mit Abmeldelink', async () => {
    await angemeldetAls([{ rolle: 'redaktion' }]);
    expect(await versendeAusgabe({}, formular({ id: ausgabeId }))).toMatchObject({ fehler: 'bestaetigen' });
    // Weitere bestätigte Anmeldung ohne passendes Thema: bekommt die Ausgabe nicht
    await db.insert(schema.newsletterAbo).values({
      ...(await (async () => {
        const { verschluessele } = await import('@/lib/krypto');
        const v = verschluessele('testperson.bildung@example.test');
        return { emailVerschluesselt: v.daten, schluesselId: v.schluesselId };
      })()),
      emailHmac: 'hmac-bildung',
      sprache: 'de',
      themen: ['bildung'],
      tokenHash: 'x',
      einwilligungVersion: 'newsletter-test',
      bestaetigtAm: new Date(),
    });
    await db.delete(schema.mailAusgang);
    expect(await versendeAusgabe({}, formular({ id: ausgabeId, bestaetigt: 'ja' }))).toEqual({ versendet: 1 });
    expect(await versendeAusgabe({}, formular({ id: ausgabeId, bestaetigt: 'ja' }))).toEqual({ fehler: 'schonVersendet' });
    const zeilen = await db.select().from(schema.mailAusgang);
    expect(zeilen).toHaveLength(1);
    const daten = entschluessele<{ an: string; daten: Record<string, string> }>(zeilen[0].datenVerschluesselt, zeilen[0].schluesselId);
    expect(daten.an).toMatch(/^newsletter:[0-9a-f-]{36}$/);
    expect(JSON.stringify(daten)).not.toContain('@');
    const [a] = await db.select().from(schema.newsletterAusgabe).where(eq(schema.newsletterAusgabe.id, ausgabeId));
    expect(a.empfaenger).toBe(1);
    expect(a.versendetAm).not.toBeNull();
    const audit = await db.select().from(schema.auditEintrag).where(eq(schema.auditEintrag.aktion, 'newsletter.versendet'));
    expect(audit[0]).toMatchObject({ zielId: ausgabeId, details: { empfaenger: 1 } });
    // Versand nach der Antwort in Paketen
    gesendet.length = 0;
    for (const f of aufrufe.nachher) await f();
    expect(gesendet).toHaveLength(1);
    expect(gesendet[0]).toMatchObject({ an: 'testperson.newsletter@example.test', betreff: 'İftar daveti' });
    expect(gesendet[0].text).toContain('Davetlisiniz.');
    // Bearbeiten und Löschen gehen nach dem Versand nicht mehr
    expect(await speichereAusgabe({}, formular({ id: ausgabeId, betreffDe: 'Neu', inhaltDe: doc('Neu') }))).toMatchObject({
      fehler: 'schonVersendet',
    });
    await loescheAusgabe(formular({ id: ausgabeId }));
    expect(await db.select().from(schema.newsletterAusgabe)).toHaveLength(1);
    // Abmeldelink aus der Mail: löscht die Anmeldung sofort, leitet auf #abgemeldet; zweiter Klick ändert nichts
    const url = link(gesendet[0].html, 'abmelden');
    const antwort = await abmeldenRoute.GET(new Request(url));
    expect(antwort.headers.get('location')).toBe('/tr/bulten#abgemeldet');
    const uebrig = await db.select({ themen: schema.newsletterAbo.themen }).from(schema.newsletterAbo);
    expect(uebrig).toEqual([{ themen: ['bildung'] }]);
    expect((await abmeldenRoute.GET(new Request(url))).headers.get('location')).toBe('/tr/bulten#abgemeldet');
  });

  it('gefälschtes Abmelde-Token löscht nichts', async () => {
    const [abo] = await db.select({ id: schema.newsletterAbo.id }).from(schema.newsletterAbo);
    const falsch = `a${abo.id.replace(/-/g, '')}${'0'.repeat(32)}`;
    await abmeldenRoute.GET(new Request(`https://example.test/api/newsletter/abmelden?token=${falsch}&sprache=de`));
    expect(await db.select().from(schema.newsletterAbo)).toHaveLength(1);
  });

  it('Abmeldung zwischen Planung und Versand: die geplante Mail geht an niemanden', async () => {
    await angemeldetAls([{ rolle: 'administration' }]);
    const weiter = await speichereAusgabe({}, formular({ betreffDe: 'Bildung', inhaltDe: doc('Kurse'), themen: ['bildung'] })).catch(
      (e: { ziel?: string }) => e,
    );
    const id = ((weiter as { ziel?: string }).ziel ?? '').split('/')[3].split('?')[0];
    expect(await versendeAusgabe({}, formular({ id, bestaetigt: 'ja' }))).toEqual({ versendet: 1 });
    await db.delete(schema.newsletterAbo);
    gesendet.length = 0;
    expect(await versendeOffeneMails()).toMatchObject({ fehler: 0 });
    expect(gesendet).toHaveLength(0);
  });
});
