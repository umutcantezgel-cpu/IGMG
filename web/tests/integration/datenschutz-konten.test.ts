import { createECDH, randomBytes, randomUUID } from 'node:crypto';
import { eq, inArray } from 'drizzle-orm';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import benachrichtigungen from '../../messages/bereiche/benachrichtigungen.json';
import { schema } from '@/lib/db';
import { berlinerDatum, zeitpunkt } from '@/lib/gebetszeiten/naechstes';
import { entschluessele, verschluessele } from '@/lib/krypto';
import { plusMonate } from '@/lib/loeschen/fristen';
import { erzeugeVapid } from '@/lib/push/vapid';
import { base64url } from '@/lib/push/verschluesselung';
import { angemeldetAls, verwaltungsUmgebung } from './hilfen/verwaltung';

/**
 * Datenschutz-Befunde der DSFA (D-14 bis D-17) und Sicherheitsmails gegen PGlite:
 * - D-14: Einwilligungsnachweise überleben die Löschung der Lernenden ohne Bezug und ohne Namen bis zum Ende der
 *   Verjährung, dann löscht sie der Löschlauf.
 * - D-15: Version der Push-Einwilligung aus dem Text der Sprache, die die Person gesehen hat.
 * - D-16: inaktive Gemeinde-Konten – Vorwarnung (Kinderkonten an die Eltern, nie an `.invalid`), Löschung, Ausnahmen.
 * - D-17: Text nennt alle zugelassenen Push-Dienste und die Konto-Verknüpfung; alte Textfassung → keine Zustellung.
 * - Mail bei neuem Passkey bzw. eingerichteter Zwei-Faktor-Anmeldung ohne Geheimnisse.
 * Testdaten fiktiv, Adressen unter example.test.
 */
const gesendetMails: { an: string; betreff: string; text: string }[] = [];
vi.mock('@/lib/mail/transport', () => ({
  versende: async (m: { an: string; betreff: string; text: string }) => {
    gesendetMails.push(m);
  },
}));

const { client, db } = await verwaltungsUmgebung();
const { gemeindeLoeschlauf } = await import('@/lib/loeschen/gemeinde');
const { loescheGemeindeKonto } = await import('@/lib/konto/loeschen');
const { merkeAnmeldung } = await import('@/lib/konto/anmeldung-merken');
const { meldeSicherheitsaenderung } = await import('@/lib/konto/sicherheitsmail');
const { versendeOffeneMails } = await import('@/lib/mail/ausgang');
const { pushEinwilligungsVersion, gueltigePushVersionen } = await import('@/lib/push/einwilligung');
const { fuehreTaktAus } = await import('@/lib/push/abo');
const { vapidAusUmgebung } = await import('@/lib/push/vapid');
const { ladeGebetszeitenFenster } = await import('@/server/queries/gebetszeiten');
const aboRoute = await import('@/app/api/push/abo/route');
afterAll(() => client.close());

const JETZT = new Date('2026-10-13T03:00:00Z');
const TAG = 86_400_000;

async function konto(o: {
  email?: string;
  sprache?: string;
  istKind?: boolean;
  letzte?: Date | null;
  gewarnt?: Date | null;
  erstellt?: Date;
  gesperrt?: boolean;
}): Promise<string> {
  const id = randomUUID();
  await db.insert(schema.user).values({
    id,
    name: 'Testperson',
    email: o.email ?? `testperson.${id.slice(0, 8)}@example.test`,
    emailVerified: true,
    gesperrtAm: o.gesperrt ? JETZT : null,
  });
  await db.insert(schema.kontoProfil).values({
    benutzerId: id,
    anzeigename: 'Testperson T.',
    sprache: o.sprache ?? 'de',
    istKind: o.istKind ?? false,
    erstelltAm: o.erstellt ?? new Date('2024-01-01T00:00:00Z'),
    letzteAnmeldung: o.letzte ?? null,
    inaktivGewarntAm: o.gewarnt ?? null,
  });
  return id;
}

async function lernende(o: { benutzerId?: string | null; loeschenAb?: Date | null } = {}): Promise<string> {
  const v = verschluessele({ name: '[Kind]' });
  const [z] = await db
    .insert(schema.lernende)
    .values({
      benutzerId: o.benutzerId ?? null,
      datenVerschluesselt: v.daten,
      schluesselId: v.schluesselId,
      anzeigename: '[Kind] K.',
      loeschenAb: o.loeschenAb ?? null,
    })
    .returning({ id: schema.lernende.id });
  return z.id;
}

async function mails(vorlage: string) {
  const zeilen = await db.select().from(schema.mailAusgang).where(eq(schema.mailAusgang.vorlage, vorlage));
  return zeilen.map((z) => ({
    ...z,
    inhalt: entschluessele<{ an: string; daten: Record<string, string> }>(z.datenVerschluesselt, z.schluesselId),
  }));
}

describe('D-14: Einwilligungsnachweis nach Löschung der Lernenden', () => {
  it('bleibt ohne Bezug bis zum Ende der Verjährung, auch die eigene Einwilligung des Kindes; danach gelöscht', async () => {
    const eltern = await konto({ letzte: JETZT });
    const kind = await konto({ email: `k-${randomUUID().slice(0, 8)}@konto.invalid`, istKind: true, letzte: JETZT });
    const l = await lernende({ benutzerId: kind, loeschenAb: new Date(JETZT.getTime() - TAG) });
    await db.insert(schema.kontoEinwilligung).values([
      { lernendeId: l, art: 'lernplattform', textVersion: 'v1', erteiltVon: eltern, einvernehmenBestaetigt: true },
      { lernendeId: l, art: 'gruppenchat', textVersion: 'v1', erteiltVon: eltern, widerrufenAm: new Date('2026-05-01T00:00:00Z') },
      { lernendeId: l, benutzerId: kind, art: 'push_kind', textVersion: 'v1', erteiltVon: kind },
    ]);

    const r = await gemeindeLoeschlauf(JETZT);
    expect(r.lernende).toBeGreaterThanOrEqual(1);
    expect(r.nachweise).toBe(0);
    expect(await db.select().from(schema.lernende).where(eq(schema.lernende.id, l))).toHaveLength(0);
    // Das Kinderkonto ohne Lernende ist gelöscht – der Nachweis seiner eigenen Einwilligung bleibt
    expect(await db.select().from(schema.user).where(eq(schema.user.id, kind))).toHaveLength(0);
    const nachweise = await db
      .select()
      .from(schema.kontoEinwilligung)
      .where(inArray(schema.kontoEinwilligung.art, ['lernplattform', 'gruppenchat', 'push_kind']));
    expect(nachweise).toHaveLength(3);
    for (const n of nachweise) {
      expect(n.lernendeId).toBeNull();
      expect(n.benutzerId).toBeNull();
      expect(n.aufbewahrenBis?.toISOString()).toBe('2029-12-31T23:00:00.000Z');
    }
    expect(nachweise.find((n) => n.art === 'lernplattform')).toMatchObject({
      textVersion: 'v1',
      einvernehmenBestaetigt: true,
      erteiltVon: eltern,
    });

    // Am Ende der Frist löscht der Löschlauf die Nachweise
    expect((await gemeindeLoeschlauf(new Date('2029-12-31T22:59:00Z'))).nachweise).toBe(0);
    expect((await gemeindeLoeschlauf(new Date('2029-12-31T23:00:00Z'))).nachweise).toBe(3);
  });

  it('Konto löschen: Einwilligungen für einen Lerndatensatz bleiben (beendet), die des Kontos gehen', async () => {
    const jugend = await konto({ letzte: JETZT });
    const l = await lernende({ benutzerId: jugend });
    await db.insert(schema.kontoEinwilligung).values([
      { lernendeId: l, benutzerId: jugend, art: 'gruppenchat', textVersion: 'v1', erteiltVon: jugend },
      { benutzerId: jugend, art: 'konto', textVersion: 'v1', erteiltVon: jugend },
    ]);
    expect(await loescheGemeindeKonto(jugend, { akteurId: null, anlass: 'verwaltung' })).toMatchObject({ ok: true });
    const rest = await db.select().from(schema.kontoEinwilligung).where(eq(schema.kontoEinwilligung.lernendeId, l));
    expect(rest).toHaveLength(1);
    expect(rest[0]).toMatchObject({ art: 'gruppenchat', benutzerId: null, erteiltVon: null });
    expect(rest[0].widerrufenAm).not.toBeNull();
    expect(await db.select().from(schema.kontoEinwilligung).where(eq(schema.kontoEinwilligung.art, 'konto'))).toHaveLength(0);
  });
});

describe('D-16: inaktive Gemeinde-Konten', () => {
  it('Vorwarnung 30 Tage vorher (Kinder über die Eltern), Löschung danach, Ausnahmen bleiben unberührt', async () => {
    await db.delete(schema.mailAusgang);
    const fast = new Date(plusMonate(JETZT, -24).getTime() + 10 * TAG);
    const lange = plusMonate(JETZT, -25);
    const warnen = await konto({ sprache: 'tr', letzte: fast });
    const loeschen = await konto({ letzte: lange, gewarnt: new Date(JETZT.getTime() - 31 * TAG) });
    const nochWarten = await konto({ letzte: lange, gewarnt: new Date(JETZT.getTime() - 5 * TAG) });
    const frisch = await konto({ letzte: new Date(JETZT.getTime() - 100 * TAG) });
    const ohneAnmeldungAlt = await konto({ letzte: null, erstellt: lange });
    const gesperrt = await konto({ letzte: lange, gesperrt: true });
    const verwaltung = await konto({ letzte: lange });
    await db.insert(schema.rolleZuweisung).values({ benutzerId: verwaltung, rolle: 'redaktion' });
    const lehrkraft = await konto({ letzte: lange });
    const [g] = await db
      .insert(schema.gruppe)
      .values({ name: { de: '[Gruppe]' } })
      .returning({ id: schema.gruppe.id });
    await db.insert(schema.gruppenLeitung).values({ gruppeId: g.id, benutzerId: lehrkraft });
    const eltern = await konto({ sprache: 'en', letzte: lange });
    const kind = await konto({ email: `k-${randomUUID().slice(0, 8)}@konto.invalid`, istKind: true, letzte: fast });
    const l = await lernende({ benutzerId: kind });
    await db.insert(schema.elternKind).values({ elternId: eltern, lernendeId: l, sorgeberechtigt: true });

    const r = await gemeindeLoeschlauf(JETZT);
    expect(r).toMatchObject({ inaktivGewarnt: 3, inaktivGeloescht: 1 });
    const noch = (await db.select({ id: schema.user.id }).from(schema.user)).map((u) => u.id);
    expect(noch).not.toContain(loeschen);
    expect(noch).toEqual(
      expect.arrayContaining([warnen, nochWarten, frisch, ohneAnmeldungAlt, gesperrt, verwaltung, lehrkraft, eltern, kind]),
    );
    const [zeile] = await db.select().from(schema.kontoProfil).where(eq(schema.kontoProfil.benutzerId, warnen));
    expect(zeile.inaktivGewarntAm?.toISOString()).toBe(JETZT.toISOString());

    // Mails ohne Inhalte: nur Löschdatum und Link; Kinderkonto → an die Eltern (ihre Sprache), nie an .invalid
    const erwachsen = await mails('konto-inaktiv');
    expect(erwachsen).toHaveLength(2);
    const tr = erwachsen.find((m) => m.sprache === 'tr')!;
    expect(Object.keys(tr.inhalt.daten).sort()).toEqual(['gueltigBis', 'link']);
    expect(tr.inhalt.daten.link).toMatch(/\/tr\/giris$/);
    const kinderMails = await mails('konto-inaktiv-kind');
    expect(kinderMails).toHaveLength(1);
    const [elternAdresse] = await db.select({ email: schema.user.email }).from(schema.user).where(eq(schema.user.id, eltern));
    expect(kinderMails[0]).toMatchObject({ sprache: 'en', inhalt: { an: elternAdresse.email } });
    expect(JSON.stringify([...erwachsen, ...kinderMails].map((m) => m.inhalt))).not.toContain('.invalid');
    const audit = await db.select().from(schema.auditEintrag).where(eq(schema.auditEintrag.aktion, 'konto.inaktiv_gewarnt'));
    expect(audit.filter((a) => [warnen, ohneAnmeldungAlt, kind].includes(a.zielId ?? '')).map((a) => a.details)).toEqual(
      expect.arrayContaining([
        { kind: true, mails: 1 },
        { kind: false, mails: 1 },
      ]),
    );

    // Zweiter Lauf am selben Tag: keine zweite Vorwarnung
    expect(await gemeindeLoeschlauf(JETZT)).toMatchObject({ inaktivGewarnt: 0, inaktivGeloescht: 0 });

    // Versand: Text enthält das Datum, keine Namen
    await versendeOffeneMails(50);
    const versandt = gesendetMails.find((m) => m.an === elternAdresse.email)!;
    expect(versandt.text).not.toContain('Testperson');
    expect(versandt.text).toMatch(/2026/);

    // Anmeldung nach der Vorwarnung: Vorwarnung erledigt, das Konto bleibt
    await merkeAnmeldung(warnen, new Date(JETZT.getTime() + TAG));
    const [nachAnmeldung] = await db.select().from(schema.kontoProfil).where(eq(schema.kontoProfil.benutzerId, warnen));
    expect(nachAnmeldung.inaktivGewarntAm).toBeNull();
    expect((await gemeindeLoeschlauf(new Date(JETZT.getTime() + 40 * TAG))).inaktivGeloescht).toBeGreaterThanOrEqual(1);
    const bleibt = (await db.select({ id: schema.user.id }).from(schema.user)).map((u) => u.id);
    expect(bleibt).toContain(warnen);
    expect(bleibt).not.toContain(kind);
    // Der Lerndatensatz des Kindes bleibt (nur der Zugang wird gelöscht)
    expect(await db.select().from(schema.lernende).where(eq(schema.lernende.id, l))).toHaveLength(1);
  });
});

describe('Sicherheitsmail bei neuem Passkey oder Zwei-Faktor', () => {
  beforeAll(() => {
    gesendetMails.length = 0;
  });

  it('Gemeinde-Konto in seiner Sprache, Verwaltung auf Deutsch, nie an .invalid, ohne Geheimnisse', async () => {
    await db.delete(schema.mailAusgang);
    const gemeinde = await konto({ sprache: 'tr', letzte: JETZT });
    expect(await meldeSicherheitsaenderung(gemeinde, 'passkey', JETZT)).toBe(true);
    const [passkey] = await mails('konto-passkey');
    expect(passkey.sprache).toBe('tr');
    expect(Object.keys(passkey.inhalt.daten).sort()).toEqual(['link', 'zeitpunkt']);
    expect(passkey.inhalt.daten.link).toMatch(/\/tr\/hesabim\/hesap$/);

    const kind = await konto({ email: `k-${randomUUID().slice(0, 8)}@konto.invalid`, istKind: true });
    expect(await meldeSicherheitsaenderung(kind, 'zwei_faktor', JETZT)).toBe(false);

    const verwaltung = await angemeldetAls([{ rolle: 'redaktion' }]);
    expect(await meldeSicherheitsaenderung(verwaltung!, 'zwei_faktor', JETZT)).toBe(true);
    const [zf] = await mails('sicherheit-zwei-faktor');
    expect(zf.sprache).toBe('de');
    expect(zf.inhalt.daten.link).toMatch(/\/verwaltung\/konto$/);

    await versendeOffeneMails(50);
    const tuerkisch = gesendetMails.find((m) => m.betreff.includes('geçiş anahtarı'))!;
    expect(tuerkisch.text).toContain('Bunu siz yapmadınız mı?');
    const deutsch = gesendetMails.find((m) => m.betreff.startsWith('Zwei-Faktor-Anmeldung eingerichtet'))!;
    expect(deutsch.text).toContain('Waren Sie das nicht?');
    expect(deutsch.text).not.toMatch(/otpauth|secret=/i);
    expect(gesendetMails.some((m) => m.an.endsWith('.invalid'))).toBe(false);
  });
});

describe('D-15 und D-17: Push-Einwilligung', () => {
  const gesendet: string[] = [];
  beforeAll(() => {
    process.env.VAPID_PRIVAT = erzeugeVapid().privat;
    process.env.VAPID_KONTAKT = 'mailto:technik@example.test';
    vi.stubGlobal('fetch', async (url: string) => {
      gesendet.push(url);
      return new Response(null, { status: 201 });
    });
  });
  afterAll(() => {
    vi.unstubAllGlobals();
    delete process.env.VAPID_PRIVAT;
    delete process.env.VAPID_KONTAKT;
  });
  beforeEach(async () => {
    gesendet.length = 0;
    await angemeldetAls(null);
  });

  function browserAbo() {
    const ecdh = createECDH('prime256v1');
    ecdh.generateKeys();
    return {
      endpoint: `https://fcm.googleapis.com/fcm/send/${randomBytes(12).toString('hex')}`,
      keys: { p256dh: base64url(ecdh.getPublicKey()), auth: base64url(randomBytes(16)) },
    };
  }
  const anfrage = (koerper: unknown) =>
    new Request('https://example.test/api/push/abo', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'sec-fetch-site': 'same-origin' },
      body: JSON.stringify(koerper),
    });

  it('D-17: der Text nennt alle zugelassenen Push-Dienste, das Drittland und die Konto-Verknüpfung – in jeder Sprache', () => {
    for (const s of ['de', 'tr', 'en'] as const) {
      for (const text of [benachrichtigungen[s].push.einwilligung, benachrichtigungen[s].push.kind.einwilligung])
        for (const dienst of ['Google', 'Mozilla', 'Apple', 'Microsoft']) expect(text).toContain(dienst);
    }
    expect(benachrichtigungen.de.push.einwilligung).toMatch(/Konto/);
    expect(benachrichtigungen.tr.push.einwilligung).toMatch(/hesab/);
    expect(benachrichtigungen.en.push.einwilligung).toMatch(/account/);
    expect(benachrichtigungen.de.push.einwilligung).toMatch(/außerhalb der EU/);
    expect(new Set(gueltigePushVersionen()).size).toBe(6);
  });

  it('D-15: Version aus dem Text der Sprache, die die Seite gezeigt hat', async () => {
    const a = browserAbo();
    const r = await aboRoute.POST(
      anfrage({ abo: a, themen: ['gebet'], gebete: ['ogle'], minutenVorher: 10, sprache: 'tr', einwilligung: true }),
    );
    expect(r.status).toBe(200);
    const [zeile] = await db.select().from(schema.pushAbo).where(eq(schema.pushAbo.p256dh, a.keys.p256dh));
    expect(zeile.einwilligungVersion).toBe(pushEinwilligungsVersion('tr', false));
    expect(zeile.einwilligungVersion).not.toBe(pushEinwilligungsVersion('de', false));
  });

  it('D-17: Abos mit alter Textfassung bekommen nichts, bis neu eingewilligt wird', async () => {
    await db.delete(schema.pushAbo);
    const alt = browserAbo();
    const v = verschluessele(alt.endpoint);
    await db.insert(schema.pushAbo).values({
      endpointVerschluesselt: v.daten,
      schluesselId: v.schluesselId,
      endpointHmac: randomUUID(),
      p256dh: alt.keys.p256dh,
      auth: alt.keys.auth,
      themen: ['gebet'],
      gebete: ['ogle'],
      minutenVorher: 10,
      einwilligungVersion: 'push-0000000000000000',
    });
    const fenster = await ladeGebetszeitenFenster();
    const heute = fenster.tage.find((t) => t.datum === berlinerDatum(new Date()))!;
    const jetzt = new Date(zeitpunkt(heute.datum, heute.ogle).getTime() - 10 * 60_000 + 20_000);
    expect((await fuehreTaktAus(vapidAusUmgebung()!, jetzt)).gebetsErinnerungen).toBe(0);
    // Neue Einwilligung (gleicher Browser, aktueller Text) → wieder zugestellt
    await aboRoute.POST(anfrage({ abo: alt, themen: ['gebet'], gebete: ['ogle'], minutenVorher: 10, sprache: 'de', einwilligung: true }));
    await db.delete(schema.pushVersand);
    gesendet.length = 0;
    expect((await fuehreTaktAus(vapidAusUmgebung()!, jetzt)).gebetsErinnerungen).toBe(1);
  });
});
