import { deriveKey } from 'altcha-lib/algorithms/pbkdf2';
import { solveChallenge } from 'altcha-lib';
import { and, eq } from 'drizzle-orm';
import { afterAll, afterEach, beforeEach, describe, expect, it } from 'vitest';
import konto from '../../messages/bereiche/konto.json';
import { schema } from '@/lib/db';
import { entschluessele, sha256, verschluessele } from '@/lib/krypto';
import { formular, kontoUmgebung, nachDerAntwort, nachher, umleitung } from './hilfen/konto';

/**
 * Gemeinde-Konten (ADR 0026, Paket O-A01/O-A02): Registrierung → Bestätigung → Rolle, Kinderkonto mit Anmeldung per
 * Benutzername (Server Action, Ratenbegrenzung), Einladung mit Gemeinde-Rollen, Sitzungsgrenze Lehrkraft 12 h,
 * Funktionsschalter aus → 404/KeinRecht, `.invalid` im Mail-Ausgang, Datenexport und Löschantrag.
 * Mit echtem Better Auth (Passwort-Hash, Benutzername-Plugin, Sitzungen in der Datenbank).
 */
const { client, db } = await kontoUmgebung();
const aktionen = await import('@/server/actions/konto');
const mein = await import('@/server/actions/mein-bereich');
const verwaltungAnmeldung = await import('@/server/actions/anmeldung');
const { legeKinderkontoAn, benutzernameFrei } = await import('@/lib/konto/kinderkonto');
const { verlangeMeinBereich } = await import('@/lib/konto/zugang');
const { ladeKonto, verlangeKontoRecht } = await import('@/lib/rechte/gemeinde');
const { planeKontoMail, versendeOffeneMails } = await import('@/lib/mail/ausgang');
const { neueChallenge } = await import('@/lib/validierung/altcha');
const { KONTO_EINWILLIGUNG_VERSION, textVersion } = await import('@/lib/konto/einwilligung');
const { auth } = await import('@/lib/auth/server');
afterAll(() => client.close());

const api = auth.api as unknown as Record<string, unknown>;
const echteSitzung = api.getSession;
const PASSWORT = 'Ein-langes-Testpasswort-2026';

beforeEach(async () => {
  await db.delete(schema.ratenbegrenzung);
});
afterEach(() => {
  api.getSession = echteSitzung;
  delete process.env.FUNKTION_KONTEN;
  nachher.length = 0;
});

async function altcha(): Promise<string> {
  const challenge = await neueChallenge();
  const solution = await solveChallenge({ challenge, deriveKey });
  return Buffer.from(JSON.stringify({ challenge, solution })).toString('base64');
}

/** Angemeldet als (für Seiten und Actions mit Sitzung): `auth.api.getSession` liefert diese Sitzung. */
function alsSitzung(u: { id: string; name: string; email: string; twoFactorEnabled?: boolean }, seit = new Date(), id = `s-${u.id}`) {
  api.getSession = async () => ({
    user: { ...u, twoFactorEnabled: u.twoFactorEnabled ?? false, gesperrtAm: null },
    session: { id, createdAt: seit, userId: u.id },
  });
}

/** Konto direkt über Better Auth anlegen (bestätigt), mit Gemeinde-Rollen. */
async function legeKontoAn(email: string, rollen: (typeof schema.gemeindeRolleEnum.enumValues)[number][], zweiFaktor = false) {
  const r = await auth.api.signUpEmail({ body: { email, password: PASSWORT, name: 'Testperson Eins' } });
  await db.update(schema.user).set({ emailVerified: true, twoFactorEnabled: zweiFaktor }).where(eq(schema.user.id, r.user.id));
  if (rollen.length) await db.insert(schema.gemeindeRolle).values(rollen.map((rolle) => ({ benutzerId: r.user.id, rolle })));
  return { id: r.user.id, name: 'Testperson Eins', email, twoFactorEnabled: zweiFaktor };
}

const sitzungenVon = (benutzerId: string) => db.select().from(schema.session).where(eq(schema.session.userId, benutzerId));
const rollenVon = async (benutzerId: string) =>
  (await db.select({ r: schema.gemeindeRolle.rolle }).from(schema.gemeindeRolle).where(eq(schema.gemeindeRolle.benutzerId, benutzerId)))
    .map((z) => z.r)
    .sort();
const kontoZu = async (email: string) => (await db.select().from(schema.user).where(eq(schema.user.email, email)))[0];
const auditVon = async (aktion: string) => db.select().from(schema.auditEintrag).where(eq(schema.auditEintrag.aktion, aktion));

describe('Registrierung → Bestätigung → Rolle', () => {
  const email = 'testperson.registrierung@example.test';

  it('Konto entsteht erst nach der Antwort, Mail „Adresse bestätigen“ mit Link; nach Bestätigung Rolle „gemeinde“', async () => {
    const antwort = await aktionen.registrieren(
      {},
      formular({ sprache: 'tr', name: 'Testperson Eins', email, passwort: PASSWORT, einwilligung: 'ja', altcha: await altcha() }),
    );
    expect(antwort).toEqual({ ok: true });
    // Gleiche Antwortzeit mit und ohne Konto: angelegt wird erst nach der Antwort
    expect(await kontoZu(email)).toBeUndefined();
    await nachDerAntwort();
    const u = await kontoZu(email);
    expect(u).toMatchObject({ emailVerified: false, name: 'Testperson Eins' });
    expect(await rollenVon(u.id)).toEqual([]);
    const [profil] = await db.select().from(schema.kontoProfil).where(eq(schema.kontoProfil.benutzerId, u.id));
    expect(profil).toMatchObject({ sprache: 'tr', anzeigename: 'Testperson E.', istKind: false });
    const [einwilligung] = await db.select().from(schema.kontoEinwilligung).where(eq(schema.kontoEinwilligung.benutzerId, u.id));
    expect(einwilligung).toMatchObject({ art: 'konto', sprache: 'tr', erteiltVon: u.id, widerrufenAm: null });
    expect(einwilligung.textVersion).toBe(textVersion(KONTO_EINWILLIGUNG_VERSION, konto.tr.konto.einwilligung.text));
    expect(einwilligung.textVersion).toMatch(/^2026-10\+sha256:[0-9a-f]{64}$/);

    // Mail: verschlüsselt, ohne Inhalte außer dem Link (in der Sprache der Person)
    const [mail] = await db.select().from(schema.mailAusgang).where(eq(schema.mailAusgang.vorlage, 'konto-bestaetigen'));
    expect(mail).toMatchObject({ sprache: 'tr' });
    expect(mail.gesendetAm).not.toBeNull();
    expect(mail.datenVerschluesselt.toString('utf8')).not.toContain(email);
    const inhalt = entschluessele<{ an: string; daten: Record<string, string> }>(mail.datenVerschluesselt, mail.schluesselId);
    expect(inhalt.an).toBe(email);
    expect(Object.keys(inhalt.daten)).toEqual(['link']);
    expect(inhalt.daten.link).toMatch(/\/tr\/hesap\/onayla\?token=[A-Za-z0-9_-]{40,}$/);
    const token = new URL(inhalt.daten.link).searchParams.get('token')!;
    // Token nur als Hash gespeichert
    const [v] = await db.select().from(schema.verification).where(eq(schema.verification.value, u.id));
    expect(v.identifier).toBe(`konto-bestaetigen:${sha256(token)}`);
    expect((await auditVon('konto.registriert')).map((a) => a.benutzerId)).toContain(u.id);

    // Vor der Bestätigung: Passwort richtig, aber keine Sitzung
    expect(await aktionen.kontoAnmelden({}, formular({ email, passwort: PASSWORT }))).toMatchObject({ fehler: 'anmelden.unbestaetigt' });
    expect(await sitzungenVon(u.id)).toHaveLength(0);

    // Bestätigen (POST über die Action) → Rolle „gemeinde“
    expect(await umleitung(aktionen.kontoBestaetigen({}, formular({ token, sprache: 'tr' })))).toBe('/tr/giris?hinweis=bestaetigt');
    expect(await rollenVon(u.id)).toEqual(['gemeinde']);
    expect((await kontoZu(email)).emailVerified).toBe(true);
    expect((await auditVon('konto.bestaetigt')).map((a) => a.benutzerId)).toContain(u.id);
    // Einmal verwendbar
    expect(await aktionen.kontoBestaetigen({}, formular({ token, sprache: 'tr' }))).toEqual({ fehler: 'bestaetigen.ungueltig' });

    // Jetzt Anmeldung → Mein Bereich (tr) mit Sitzung
    expect(await umleitung(aktionen.kontoAnmelden({}, formular({ email, passwort: PASSWORT, sprache: 'tr' })))).toBe('/tr/hesabim');
    expect(await sitzungenVon(u.id)).toHaveLength(1);
  });

  it('keine Kontenaufzählung: vorhandene Adresse → gleiche Antwort, kein zweites Konto, Hinweis-Mail; Passwort bleibt', async () => {
    const vorher = await kontoZu(email);
    const antwort = await aktionen.registrieren(
      {},
      formular({ sprache: 'de', name: 'Jemand Anderes', email, passwort: 'Ganz-anderes-Passwort-99', einwilligung: 'ja', altcha: await altcha() }),
    );
    expect(antwort).toEqual({ ok: true });
    await nachDerAntwort();
    expect(await db.select().from(schema.user).where(eq(schema.user.email, email))).toHaveLength(1);
    expect((await kontoZu(email)).name).toBe(vorher.name);
    expect(await db.select().from(schema.mailAusgang).where(eq(schema.mailAusgang.vorlage, 'konto-vorhanden'))).toHaveLength(1);
    // Das alte Passwort gilt weiter, das neue nicht
    expect(await aktionen.kontoAnmelden({}, formular({ email, passwort: 'Ganz-anderes-Passwort-99' }))).toMatchObject({
      fehler: 'anmelden.fehler',
    });
    expect(await umleitung(aktionen.kontoAnmelden({}, formular({ email, passwort: PASSWORT })))).toBe('/mein-bereich');
  });

  it('Schutzschritte: Honigtopf (scheinbarer Erfolg), ALTCHA fehlt, Zod-Feldfehler, `.invalid` abgelehnt', async () => {
    const basis = { sprache: 'de', name: 'Testperson Zwei', email: 'testperson.zwei@example.test', passwort: PASSWORT, einwilligung: 'ja' };
    expect(await aktionen.registrieren({}, formular({ ...basis, website: 'bot', altcha: await altcha() }))).toEqual({ ok: true });
    expect(nachher).toHaveLength(0);
    expect(await aktionen.registrieren({}, formular(basis))).toMatchObject({ fehler: 'registrieren.fehler.altcha' });
    const fehler = await aktionen.registrieren(
      {},
      formular({ sprache: 'de', name: 'X', email: 'kind@konto.invalid', passwort: 'kurz', altcha: await altcha() }),
    );
    expect(fehler).toMatchObject({
      fehler: 'registrieren.fehler.pruefen',
      feldFehler: {
        name: 'registrieren.fehler.name',
        email: 'registrieren.fehler.email',
        passwort: 'registrieren.fehler.passwort',
        einwilligung: 'registrieren.fehler.einwilligung',
      },
    });
    expect(fehler.versuch).toBe(1);
    expect(await kontoZu('testperson.zwei@example.test')).toBeUndefined();
  });
});

describe('Kinderkonto (ohne E-Mail) und Anmeldung per Benutzername', () => {
  let eltern: Awaited<ReturnType<typeof legeKontoAn>>;
  let lernendeId: string;
  let kindId: string;

  async function lernende(anzeigename: string) {
    const paket = verschluessele({ vorname: 'Testkind', nachname: 'Eins' });
    const [l] = await db
      .insert(schema.lernende)
      .values({ datenVerschluesselt: paket.daten, schluesselId: paket.schluesselId, anzeigename })
      .returning({ id: schema.lernende.id });
    await db.insert(schema.elternKind).values({ elternId: eltern.id, lernendeId: l.id });
    return l.id;
  }

  it('legeKinderkontoAn: Einwilligung Pflicht, Benutzername-Regeln, synthetische Adresse, Rolle schueler, Profil Kind', async () => {
    eltern = await legeKontoAn('testperson.eltern@example.test', ['gemeinde', 'eltern']);
    lernendeId = await lernende('Testkind E.');
    const basis = { passwort: PASSWORT, elternBenutzerId: eltern.id, lernendeId };
    expect(await legeKinderkontoAn({ ...basis, benutzername: 'kind.test' })).toEqual({ ok: false, fehler: 'keineEinwilligung' });
    await db
      .insert(schema.kontoEinwilligung)
      .values({ lernendeId, art: 'kinderkonto', textVersion: textVersion('test', 'Einwilligung'), erteiltVon: eltern.id, einvernehmenBestaetigt: true });
    expect(await legeKinderkontoAn({ ...basis, benutzername: 'abc' })).toEqual({ ok: false, fehler: 'kurz' });
    expect(await legeKinderkontoAn({ ...basis, benutzername: 'kind-test' })).toEqual({ ok: false, fehler: 'zeichen' });
    expect(await legeKinderkontoAn({ ...basis, benutzername: 'kind.test', passwort: 'kurz' })).toEqual({ ok: false, fehler: 'passwort' });
    // Fremdes Kind: kein Eltern-Bezug
    const fremd = await legeKontoAn('testperson.fremd@example.test', ['gemeinde']);
    expect(await legeKinderkontoAn({ ...basis, elternBenutzerId: fremd.id, benutzername: 'kind.test' })).toEqual({
      ok: false,
      fehler: 'keinElternteil',
    });

    const r = await legeKinderkontoAn({ ...basis, benutzername: ' Kind.Test ' });
    expect(r).toMatchObject({ ok: true, benutzername: 'kind.test' });
    kindId = (r as { benutzerId: string }).benutzerId;
    const [u] = await db.select().from(schema.user).where(eq(schema.user.id, kindId));
    expect(u.email).toMatch(/^k-[a-z0-9]{24}@konto\.invalid$/);
    expect(u.username).toBe('kind.test');
    expect(u.name).toBe('Testkind E.');
    expect(await rollenVon(kindId)).toEqual(['schueler']);
    const [profil] = await db.select().from(schema.kontoProfil).where(eq(schema.kontoProfil.benutzerId, kindId));
    expect(profil).toMatchObject({ istKind: true, anzeigename: 'Testkind E.' });
    const [l] = await db.select().from(schema.lernende).where(eq(schema.lernende.id, lernendeId));
    expect(l.benutzerId).toBe(kindId);
    expect((await auditVon('konto.kinderkonto_angelegt'))[0]).toMatchObject({ benutzerId: eltern.id, zielId: kindId });

    // Name vergeben; Lernende hat schon ein Konto
    expect(await benutzernameFrei('KIND.TEST')).toBe(false);
    expect(await benutzernameFrei('kind.frei')).toBe(true);
    expect(await legeKinderkontoAn({ ...basis, benutzername: 'kind.neu' })).toEqual({ ok: false, fehler: 'bereitsKonto' });
    const zweites = await lernende('Testkind Z.');
    await db
      .insert(schema.kontoEinwilligung)
      .values({ lernendeId: zweites, art: 'kinderkonto', textVersion: 'test', erteiltVon: eltern.id });
    expect(await legeKinderkontoAn({ ...basis, lernendeId: zweites, benutzername: 'kind.test' })).toEqual({ ok: false, fehler: 'vergeben' });
  });

  it('Anmeldung per Benutzername über die Server Action: falsch → keine Sitzung, richtig → Sitzung und Mein Bereich', async () => {
    expect(await aktionen.kinderAnmelden({}, formular({ benutzername: 'kind.test', passwort: 'Falsches-Passwort-123' }))).toMatchObject({
      fehler: 'kinder.fehler',
    });
    expect(await sitzungenVon(kindId)).toHaveLength(0);
    expect(await umleitung(aktionen.kinderAnmelden({}, formular({ benutzername: 'Kind.Test', passwort: PASSWORT, sprache: 'en' })))).toBe(
      '/en/my-account',
    );
    expect(await sitzungenVon(kindId)).toHaveLength(1);
    const erfolg = (await auditVon('anmeldung.erfolg')).filter((a) => a.benutzerId === kindId);
    expect(erfolg[0].details).toMatchObject({ weg: 'kind' });
    // Die synthetische Adresse taugt nicht für die E-Mail-Anmeldung
    const [u] = await db.select().from(schema.user).where(eq(schema.user.id, kindId));
    expect(await aktionen.kontoAnmelden({}, formular({ email: u.email, passwort: PASSWORT }))).toMatchObject({ fehler: 'anmelden.fehler' });
    expect(await sitzungenVon(kindId)).toHaveLength(1);
  });

  it('Ratenbegrenzung je Konto: nach 8 Fehlversuchen ist auch das richtige Passwort gesperrt', async () => {
    for (let i = 0; i < 8; i++) {
      expect(await aktionen.kinderAnmelden({}, formular({ benutzername: 'kind.test', passwort: `Falsch-${i}-Passwort` }))).toMatchObject({
        fehler: 'kinder.fehler',
      });
    }
    expect(await aktionen.kinderAnmelden({}, formular({ benutzername: 'kind.test', passwort: PASSWORT }))).toMatchObject({
      fehler: 'anmelden.zuViele',
    });
  });

  it('Mail-Ausgang weist `.invalid` hart ab: nicht geplant, nie versendet, nicht wiederholt', async () => {
    const [u] = await db.select().from(schema.user).where(eq(schema.user.id, kindId));
    expect(await planeKontoMail({ an: u.email, vorlage: 'konto-passwort', sprache: 'de', daten: { link: 'http://localhost/x' } })).toBe(false);
    // Eine trotzdem vorhandene Zeile (z. B. aus „Passwort vergessen“) wird endgültig abgelehnt
    const paket = verschluessele({ an: u.email, daten: { link: 'http://localhost/x' } });
    const [zeile] = await db
      .insert(schema.mailAusgang)
      .values({ vorlage: 'konto-passwort', datenVerschluesselt: paket.daten, schluesselId: paket.schluesselId })
      .returning({ id: schema.mailAusgang.id });
    await versendeOffeneMails();
    const [danach] = await db.select().from(schema.mailAusgang).where(eq(schema.mailAusgang.id, zeile.id));
    expect(danach).toMatchObject({ gesendetAm: null, fehler: 'MailUnzustellbar', versuche: 6 });
  });
});

describe('Einladung mit Gemeinde-Rolle', () => {
  async function einladung(email: string, gemeindeRollen: ('eltern' | 'lehrkraft' | 'schueler')[], rollen: { rolle: 'redaktion' }[] = []) {
    const token = `einladung-${Math.random().toString(36).slice(2)}-${Date.now()}`;
    const [e] = await db
      .insert(schema.einladung)
      .values({
        email,
        name: 'Testperson Eingeladen',
        rollen,
        gemeindeRollen,
        tokenHash: sha256(token),
        laeuftAb: new Date(Date.now() + 86_400_000),
        erstelltVon: 'test',
      })
      .returning({ id: schema.einladung.id });
    return { token, id: e.id };
  }

  it('neues Konto: Rollen aus der Einladung, Adresse bestätigt, Einwilligung gespeichert; Link nur einmal', async () => {
    const email = 'testperson.eingeladen@example.test';
    const { token, id } = await einladung(email, ['eltern']);
    const fd = (w: Record<string, string>) => formular({ token, passwort: PASSWORT, wiederholung: PASSWORT, einwilligung: 'ja', ...w });
    expect(await aktionen.gemeindeEinladungAnnehmen({}, fd({ wiederholung: 'anders-als-oben-123' }))).toMatchObject({
      feldFehler: { wiederholung: 'einladung.fehlerGleich' },
    });
    expect(await aktionen.gemeindeEinladungAnnehmen({}, fd({ einwilligung: '' }))).toMatchObject({
      feldFehler: { einwilligung: 'einladung.fehlerEinwilligung' },
    });
    expect(await umleitung(aktionen.gemeindeEinladungAnnehmen({}, fd({ sprache: 'tr' })))).toBe('/tr/giris?hinweis=eingeladen');
    const u = await kontoZu(email);
    expect(u.emailVerified).toBe(true);
    expect(await rollenVon(u.id)).toEqual(['eltern']);
    expect(await db.select().from(schema.rolleZuweisung).where(eq(schema.rolleZuweisung.benutzerId, u.id))).toHaveLength(0);
    const [e] = await db.select().from(schema.einladung).where(eq(schema.einladung.id, id));
    expect(e.angenommenAm).not.toBeNull();
    const einwilligungen = await db.select().from(schema.kontoEinwilligung).where(eq(schema.kontoEinwilligung.benutzerId, u.id));
    expect(einwilligungen.map((x) => x.art)).toEqual(['konto']);
    expect(await aktionen.gemeindeEinladungAnnehmen({}, fd({}))).toEqual({ fehler: 'einladung.ungueltig' });
  });

  it('vorhandenes Konto: kein zweites Konto; angemeldet mit derselben Adresse werden nur Rollen ergänzt', async () => {
    const vorhanden = await legeKontoAn('testperson.lehrkraft@example.test', ['gemeinde']);
    const { token, id } = await einladung(vorhanden.email, ['lehrkraft']);
    expect(
      await aktionen.gemeindeEinladungAnnehmen({}, formular({ token, passwort: PASSWORT, wiederholung: PASSWORT, einwilligung: 'ja' })),
    ).toEqual({ fehler: 'einladung.vorhanden' });
    const [offen] = await db.select().from(schema.einladung).where(eq(schema.einladung.id, id));
    expect(offen.angenommenAm).toBeNull();
    // Mit einem anderen Konto angemeldet: abgelehnt
    const anders = await legeKontoAn('testperson.anders@example.test', ['gemeinde']);
    alsSitzung(anders);
    expect(await aktionen.gemeindeEinladungUebernehmen({}, formular({ token }))).toEqual({ fehler: 'einladung.andereAdresse' });
    alsSitzung(vorhanden);
    expect(await umleitung(aktionen.gemeindeEinladungUebernehmen({}, formular({ token })))).toBe('/mein-bereich');
    expect(await rollenVon(vorhanden.id)).toEqual(['gemeinde', 'lehrkraft']);
  });

  it('Verwaltungs-Einladung trägt Gemeinde-Rollen mit (bestehende Annahme unter /verwaltung)', async () => {
    const email = 'testperson.redaktion@example.test';
    const { token } = await einladung(email, ['lehrkraft'], [{ rolle: 'redaktion' }]);
    expect(
      await umleitung(verwaltungAnmeldung.einladungAnnehmen({}, formular({ token, passwort: PASSWORT, wiederholung: PASSWORT }))),
    ).toBe('/verwaltung/anmelden?eingeladen=1');
    const u = await kontoZu(email);
    expect(await rollenVon(u.id)).toEqual(['lehrkraft']);
    expect(await db.select().from(schema.rolleZuweisung).where(eq(schema.rolleZuweisung.benutzerId, u.id))).toHaveLength(1);
  });
});

describe('Sitzungsgrenzen und zweiter Faktor', () => {
  it('Lehrkraft: Sitzung gilt 12 h ab Anmeldung, danach wird sie widerrufen; Gemeinde bleibt angemeldet', async () => {
    const lehrkraft = await legeKontoAn('testperson.zwoelf@example.test', ['gemeinde', 'lehrkraft'], true);
    const stunde = 3_600_000;
    await db.insert(schema.session).values({
      id: 'sitzung-lehrkraft',
      token: 'token-lehrkraft',
      userId: lehrkraft.id,
      expiresAt: new Date(Date.now() + 30 * 24 * stunde),
      createdAt: new Date(Date.now() - 13 * stunde),
      updatedAt: new Date(),
    });
    alsSitzung(lehrkraft, new Date(Date.now() - 11 * stunde), 'sitzung-lehrkraft');
    expect(await ladeKonto()).toMatchObject({ benutzerId: lehrkraft.id, gemeindeRollen: ['gemeinde', 'lehrkraft'] });
    alsSitzung(lehrkraft, new Date(Date.now() - 12 * stunde - 60_000), 'sitzung-lehrkraft');
    expect(await ladeKonto()).toBeNull();
    expect(await db.select().from(schema.session).where(eq(schema.session.id, 'sitzung-lehrkraft'))).toHaveLength(0);

    const gemeinde = await legeKontoAn('testperson.dreissig@example.test', ['gemeinde']);
    alsSitzung(gemeinde, new Date(Date.now() - 13 * stunde));
    expect(await ladeKonto()).toMatchObject({ benutzerId: gemeinde.id });
  });

  it('Lehrkraft ohne zweiten Faktor: Mein Bereich → Einrichtung, Actions verweigert (auch Passkeys)', async () => {
    const lehrkraft = await legeKontoAn('testperson.ohnefaktor@example.test', ['lehrkraft'], false);
    alsSitzung(lehrkraft);
    expect(await umleitung(verlangeMeinBereich('de'))).toBe('/mein-bereich/konto?faktor=pflicht');
    await expect(verlangeKontoRecht()).rejects.toMatchObject({ name: 'KeinRecht' });
    await expect(mein.passkeyRegistrierOptionen()).rejects.toMatchObject({ name: 'KeinRecht' });
    await expect(mein.datenExportieren()).rejects.toMatchObject({ name: 'KeinRecht' });
    // Abschalten ist für Pflichtkonten nie möglich
    alsSitzung({ ...lehrkraft, twoFactorEnabled: true });
    expect(await mein.kontoZweiFaktorAbschalten({}, formular({ passwort: PASSWORT }))).toEqual({ fehler: 'konto.zweiFaktor.pflicht' });
  });

  it('nicht angemeldet → Anmeldung; ohne Rolle (unbestätigt) → Anmeldung mit Hinweis', async () => {
    expect(await umleitung(verlangeMeinBereich('tr'))).toBe('/tr/giris');
    const ohne = await legeKontoAn('testperson.ohnerolle@example.test', []);
    alsSitzung(ohne);
    expect(await umleitung(verlangeMeinBereich('de'))).toBe('/anmelden?hinweis=unbestaetigt');
  });
});

describe('Funktionsschalter `konten` aus', () => {
  it('Seiten liefern 404, Actions verweigern', async () => {
    process.env.FUNKTION_KONTEN = 'aus';
    const { default: KontoLayout } = await import('@/app/[locale]/(konto)/layout');
    await expect(KontoLayout({ children: null } as never)).rejects.toThrow('NEXT_NOT_FOUND');
    await expect(verlangeMeinBereich('de')).rejects.toThrow('NEXT_NOT_FOUND');
    await expect(aktionen.kontoAnmelden({}, formular({ email: 'a@example.test', passwort: 'x' }))).rejects.toMatchObject({ name: 'KeinRecht' });
    await expect(aktionen.registrieren({}, formular({}))).rejects.toMatchObject({ name: 'KeinRecht' });
    await expect(aktionen.kinderAnmelden({}, formular({}))).rejects.toMatchObject({ name: 'KeinRecht' });
    await expect(mein.datenExportieren()).rejects.toMatchObject({ name: 'KeinRecht' });
  });
});

describe('Mein Bereich: Datenexport (Art. 15/20) und Löschantrag (Art. 17)', () => {
  it('Export enthält die eigenen Daten ohne Geheimnisse; Löschantrag legt Ticket und Frist an, löscht nicht sofort', async () => {
    const person = await legeKontoAn('testperson.export@example.test', ['gemeinde']);
    alsSitzung(person);
    const r = await mein.datenExportieren();
    const daten = JSON.parse(r.datei!);
    expect(daten.konto).toMatchObject({ id: person.id, email: person.email, zweiFaktorAktiv: false });
    expect(daten.kontoarten.map((k: { rolle: string }) => k.rolle)).toEqual(['gemeinde']);
    expect(r.datei).not.toMatch(/"password"|"secret"|"token"|"publicKey"/);
    expect((await auditVon('konto.daten_exportiert')).map((a) => a.benutzerId)).toContain(person.id);

    expect(await mein.loeschAntragStellen({}, formular({ passwort: 'Falsches-Passwort-1', bestaetigt: 'ja' }))).toEqual({
      feldFehler: { passwort: 'konto.loeschen.fehler.passwort' },
    });
    expect(await mein.loeschAntragStellen({}, formular({ passwort: PASSWORT }))).toMatchObject({
      feldFehler: { bestaetigt: 'konto.loeschen.fehler.bestaetigt' },
    });
    expect(await mein.loeschAntragStellen({}, formular({ passwort: PASSWORT, bestaetigt: 'ja' }))).toMatchObject({ ok: true });
    const [profil] = await db.select().from(schema.kontoProfil).where(eq(schema.kontoProfil.benutzerId, person.id));
    const tage = (profil.loeschenAb!.getTime() - Date.now()) / 86_400_000;
    expect(tage).toBeGreaterThan(29.9);
    expect(tage).toBeLessThan(30.1);
    const [ticket] = await db
      .select()
      .from(schema.ticket)
      .where(and(eq(schema.ticket.erstelltVon, person.id), eq(schema.ticket.kategorie, 'loeschantrag')));
    expect(ticket.beschreibung).toContain(person.id);
    expect(ticket.beschreibung).not.toContain(person.email);
    expect(await kontoZu(person.email)).toBeDefined();
  });
});
