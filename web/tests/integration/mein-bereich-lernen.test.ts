import { randomUUID } from 'node:crypto';
import { and, eq, isNull } from 'drizzle-orm';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import kinderTexte from '../../messages/bereiche/kinder.json';
import { schema } from '@/lib/db';
import { berlinerDatum } from '@/lib/gebetszeiten/naechstes';
import { verschluessele } from '@/lib/krypto';
import { tagPlus } from '@/lib/lernen/termine';
import { formular, kontoUmgebung, nachDerAntwort, nachher, umleitung } from './hilfen/konto';

/**
 * Oberflächen der Lernplattform in „Mein Bereich“ (Paket O-L02-UI, H-L06, H-L07, H-C01, H-P01) gegen PGlite mit echtem
 * Better Auth: Gruppenisolation der Abfragen (Lehrkraft nur eigene Gruppe, Eltern nur eigenes Kind, D-02), Einwilligungen
 * mit Textversion und sofortigem Widerruf (S-03) einschließlich D-11 (ab 16 eigene Zustimmung), Kinderzugang anlegen und
 * Passwort setzen, Lehrkraft-Aktionen (Ausfall, Moderation, Kanal-Pause) und Push an eine Gruppe ohne Inhalte.
 * Testdaten fiktiv (G-04).
 */
const gesendet: { nutzlast: unknown }[] = [];
vi.mock('@/lib/push/senden', async (original) => ({
  ...(await original<typeof import('@/lib/push/senden')>()),
  sendePush: async (_ziel: unknown, nutzlast: unknown) => {
    gesendet.push({ nutzlast });
    return { ok: true, status: 201, entfernen: false };
  },
}));

const { client, db } = await kontoUmgebung();
const { auth } = await import('@/lib/auth/server');
const { ladeGruppenKontext } = await import('@/lib/rechte/gemeinde');
const unterricht = await import('@/server/queries/mein-bereich/unterricht');
const kinder = await import('@/server/queries/mein-bereich/kinder');
const gruppe = await import('@/server/queries/mein-bereich/gruppe');
const kinderAktionen = await import('@/server/actions/kinder');
const schuelerAktionen = await import('@/server/actions/schueler');
const lehrkraftAktionen = await import('@/server/actions/lehrkraft');
const chat = await import('@/lib/chat/dienst');
const { sendeGruppenPush } = await import('@/lib/push/gruppe');
const { erzeugeVapid } = await import('@/lib/push/vapid');
const { pushEinwilligungsVersion } = await import('@/lib/push/einwilligung');
const { KONTO_EINWILLIGUNG_VERSION, textVersion } = await import('@/lib/konto/einwilligung');
afterAll(() => client.close());

const api = auth.api as unknown as Record<string, unknown>;
const echteSitzung = api.getSession;
afterEach(() => {
  api.getSession = echteSitzung;
  nachher.length = 0;
});

const heute = berlinerDatum(new Date());
const PASSWORT = 'Ein-langes-Testpasswort-2026';
type Rolle = (typeof schema.gemeindeRolleEnum.enumValues)[number];
type Person = { id: string; name: string; email: string; twoFactorEnabled: boolean };

async function person(name: string, rollen: Rolle[], kind = false): Promise<Person> {
  const email = `${randomUUID().slice(0, 8)}@example.test`;
  const r = await auth.api.signUpEmail({ body: { email, password: PASSWORT, name } });
  const zweiFaktor = rollen.includes('lehrkraft');
  await db.update(schema.user).set({ emailVerified: true, twoFactorEnabled: zweiFaktor }).where(eq(schema.user.id, r.user.id));
  await db.insert(schema.kontoProfil).values({ benutzerId: r.user.id, anzeigename: name, istKind: kind });
  await db.insert(schema.gemeindeRolle).values(rollen.map((rolle) => ({ benutzerId: r.user.id, rolle })));
  return { id: r.user.id, name, email, twoFactorEnabled: zweiFaktor };
}

function als(p: Person) {
  api.getSession = async () => ({
    user: { ...p, gesperrtAm: null },
    session: { id: `s-${p.id}`, createdAt: new Date(), userId: p.id },
  });
}

async function lernende(name: string, sechzehnAm: string, benutzerId: string | null = null): Promise<string> {
  const v = verschluessele({ name });
  const [z] = await db
    .insert(schema.lernende)
    .values({ benutzerId, datenVerschluesselt: v.daten, schluesselId: v.schluesselId, anzeigename: name, sechzehnAm })
    .returning({ id: schema.lernende.id });
  return z.id;
}

async function aktiv(lernendeId: string, art: string) {
  return db
    .select()
    .from(schema.kontoEinwilligung)
    .where(
      and(
        eq(schema.kontoEinwilligung.lernendeId, lernendeId),
        eq(schema.kontoEinwilligung.art, art as 'gruppenchat'),
        isNull(schema.kontoEinwilligung.widerrufenAm),
      ),
    );
}

const p = {} as Record<'lehrkraftA' | 'aufsichtA' | 'lehrkraftB' | 'elternE' | 'elternF' | 'jugend' | 'jugend2', Person>;
const l = {} as Record<'kind1' | 'kind2' | 'fremd' | 'jugend' | 'jugend2', string>;
let gruppeA: string;
let gruppeB: string;
let kind1: Person;
let terminA: string;

beforeAll(async () => {
  [{ id: gruppeA }] = await db
    .insert(schema.gruppe)
    .values({ name: { de: 'Gruppe A' }, wochentage: [0, 1, 2, 3, 4, 5, 6], chatModus: 'offen', chatVon: '00:00', chatBis: '23:59' })
    .returning({ id: schema.gruppe.id });
  [{ id: gruppeB }] = await db
    .insert(schema.gruppe)
    .values({ name: { de: 'Gruppe B' }, wochentage: [6] })
    .returning({ id: schema.gruppe.id });
  p.lehrkraftA = await person('Hoca A', ['lehrkraft']);
  p.aufsichtA = await person('Aufsicht A', ['lehrkraft']);
  p.lehrkraftB = await person('Hoca B', ['lehrkraft']);
  p.elternE = await person('Mutter E', ['gemeinde', 'eltern']);
  p.elternF = await person('Vater F', ['gemeinde', 'eltern']);
  await db.insert(schema.gruppenLeitung).values([
    { gruppeId: gruppeA, benutzerId: p.lehrkraftA.id, rolle: 'lehrkraft' },
    { gruppeId: gruppeA, benutzerId: p.aufsichtA.id, rolle: 'aufsicht' },
    { gruppeId: gruppeB, benutzerId: p.lehrkraftB.id, rolle: 'lehrkraft' },
  ]);
  l.kind1 = await lernende('Kind Eins', tagPlus(heute, 4 * 365));
  l.kind2 = await lernende('Kind Zwei', tagPlus(heute, 6 * 365));
  l.fremd = await lernende('Kind Fremd', tagPlus(heute, 3 * 365));
  p.jugend = await person('Jugend Eigen', ['schueler'], true);
  l.jugend = await lernende('Jugend Eigen', tagPlus(heute, -60), p.jugend.id); // nach dem Übergang (D-11)
  p.jugend2 = await person('Jugend Uebergang', ['schueler'], true);
  l.jugend2 = await lernende('Jugend Uebergang', tagPlus(heute, -10), p.jugend2.id); // im Übergang
  await db.insert(schema.gruppenMitglied).values([
    { gruppeId: gruppeA, lernendeId: l.kind1, seit: tagPlus(heute, -30) },
    { gruppeId: gruppeA, lernendeId: l.kind2, seit: tagPlus(heute, -30) },
    { gruppeId: gruppeA, lernendeId: l.jugend, seit: tagPlus(heute, -30) },
    { gruppeId: gruppeA, lernendeId: l.jugend2, seit: tagPlus(heute, -30) },
    { gruppeId: gruppeB, lernendeId: l.fremd, seit: tagPlus(heute, -30) },
  ]);
  await db.insert(schema.elternKind).values([
    { elternId: p.elternE.id, lernendeId: l.kind1 },
    { elternId: p.elternE.id, lernendeId: l.kind2 },
    { elternId: p.elternE.id, lernendeId: l.jugend },
    { elternId: p.elternE.id, lernendeId: l.jugend2 },
    { elternId: p.elternF.id, lernendeId: l.fremd },
  ]);
  // Kinderzugang für Kind 1 (Einwilligung „kinderkonto“ von E, über die Eltern-Aktion)
  als(p.elternE);
  await umleitung(
    kinderAktionen.einwilligungAendern(
      formular({ sprache: 'de', lernendeId: l.kind1, art: 'kinderkonto', aktion: 'erteilen', einvernehmen: 'ja' }),
    ),
  );
  const r = await kinderAktionen.kinderzugangAnlegen(
    {},
    formular({ lernendeId: l.kind1, benutzername: 'kind.eins', passwort: PASSWORT, sprache: 'de' }),
  );
  expect(r).toMatchObject({ ok: 'angelegt', benutzername: 'kind.eins' });
  const [k] = await db.select({ id: schema.lernende.benutzerId }).from(schema.lernende).where(eq(schema.lernende.id, l.kind1));
  kind1 = { id: k.id!, name: 'Kind Eins', email: 'k@konto.invalid', twoFactorEnabled: false };
  await chat.kanaeleDerGruppe(gruppeA);
  [{ id: terminA }] = await db
    .insert(schema.unterrichtstermin)
    .values({ gruppeId: gruppeA, datum: tagPlus(heute, 1), beginn: '10:00' })
    .returning({ id: schema.unterrichtstermin.id });
});

describe('Gruppenisolation der Abfragen', () => {
  it('Lehrkraft sieht nur die eigene Gruppe', async () => {
    const kA = await ladeGruppenKontext(p.lehrkraftA.id);
    expect((await unterricht.gruppenDerLeitung(kA, heute)).map((g) => g.id)).toEqual([gruppeA]);
    expect(await unterricht.gruppeFuerLeitung(gruppeB, kA, heute)).toBeNull();
    const a = await unterricht.gruppeFuerLeitung(gruppeA, kA, heute);
    expect(a?.lernende.map((x) => x.name).sort()).toEqual(['Jugend Eigen', 'Jugend Uebergang', 'Kind Eins', 'Kind Zwei']);
    expect(a?.leitung.map((x) => x.name)).toEqual(['Hoca A.', 'Aufsicht A.']);
    expect(await unterricht.offeneMeldungen(gruppeA, await ladeGruppenKontext(p.elternE.id))).toBeNull();
    expect(await unterricht.hifzDerGruppe(gruppeA, await ladeGruppenKontext(p.aufsichtA.id), heute)).toBeNull();
  });

  it('Eltern sehen nur eigene Kinder', async () => {
    const kE = await ladeGruppenKontext(p.elternE.id);
    expect((await kinder.kinderDerEltern(kE, heute)).map((k) => k.name).sort()).toEqual([
      'Jugend Eigen',
      'Jugend Uebergang',
      'Kind Eins',
      'Kind Zwei',
    ]);
    expect(await kinder.kindKopf(l.fremd, kE)).toBeNull();
    expect(await kinder.einwilligungenDesKindes(l.fremd, kE)).toBeNull();
    expect(await kinder.kinderzugang(l.fremd, kE)).toBeNull();
    expect(await kinder.kinderzugang(l.kind1, kE)).toEqual({ benutzername: 'kind.eins', gesperrt: false });
    expect(await gruppe.lernwegVon(l.fremd, kE)).toBeNull();
  });

  it('Gruppe nur für Mitglieder, Eltern eines Mitglieds und Leitung', async () => {
    expect(await gruppe.gruppeAnsicht(gruppeA, await ladeGruppenKontext(p.elternF.id), heute)).toBeNull();
    expect(await gruppe.gruppeAnsicht(gruppeA, await ladeGruppenKontext(p.elternE.id), heute)).not.toBeNull();
    expect(await gruppe.gruppeAnsicht(gruppeA, await ladeGruppenKontext(kind1.id), heute)).not.toBeNull();
    expect(await gruppe.gruppeAnsicht(gruppeB, await ladeGruppenKontext(kind1.id), heute)).toBeNull();
    expect(await gruppe.gruppeAnsicht('kein-uuid', await ladeGruppenKontext(kind1.id), heute)).toBeNull();
  });

  it('Moderation: keine Meldungen über eigene Nachrichten (D-02)', async () => {
    const kanal = await chat.kanaeleDerGruppe(gruppeA);
    const v = verschluessele('Hallo');
    const [n] = await db
      .insert(schema.chatNachricht)
      .values({ kanalId: kanal.gruppe, absenderId: p.lehrkraftA.id, textVerschluesselt: v.daten, schluesselId: v.schluesselId })
      .returning({ id: schema.chatNachricht.id });
    const m = await chat.meldeNachricht(await ladeGruppenKontext(kind1.id), n.id, 'unangemessen', null);
    expect(m.ok).toBe(true);
    expect(await unterricht.offeneMeldungen(gruppeA, await ladeGruppenKontext(p.lehrkraftA.id))).toEqual([]);
    // S2/S3: Meldungen gegen die Leitung sieht auch die übrige Leitung nicht – nur die Rolle kinderschutz
    expect(await unterricht.offeneMeldungen(gruppeA, await ladeGruppenKontext(p.aufsichtA.id))).toEqual([]);
    const [gespeichert] = await db.select().from(schema.chatMeldung).where(eq(schema.chatMeldung.nachrichtId, n.id));
    expect(gespeichert).toMatchObject({ gemeldetePerson: p.lehrkraftA.id, gegenLeitung: true });
  });
});

describe('Einwilligungen der Eltern (S-03)', () => {
  it('erteilen nur mit Einvernehmen; Textversion ist der SHA-256 des angezeigten Wortlauts', async () => {
    als(p.elternE);
    const ohne = await umleitung(
      kinderAktionen.einwilligungAendern(formular({ sprache: 'de', lernendeId: l.kind1, art: 'gruppenchat', aktion: 'erteilen' })),
    );
    expect(ohne).toContain('fehler=einvernehmen');
    expect(await aktiv(l.kind1, 'gruppenchat')).toHaveLength(0);
    const ziel = await umleitung(
      kinderAktionen.einwilligungAendern(
        formular({ sprache: 'tr', lernendeId: l.kind1, art: 'gruppenchat', aktion: 'erteilen', einvernehmen: 'ja' }),
      ),
    );
    expect(ziel).toContain('ok=erteilt');
    const [e] = await aktiv(l.kind1, 'gruppenchat');
    const d = kinderTexte.tr.kinder.detail;
    expect(e).toMatchObject({
      erteiltVon: p.elternE.id,
      sprache: 'tr',
      einvernehmenBestaetigt: true,
      textVersion: textVersion(KONTO_EINWILLIGUNG_VERSION, `${d.einwilligung.gruppenchat.text}\n${d.einvernehmen}`),
    });
  });

  it('fremdes Kind: kein Recht', async () => {
    als(p.elternE);
    await expect(
      kinderAktionen.einwilligungAendern(
        formular({ sprache: 'de', lernendeId: l.fremd, art: 'gruppenchat', aktion: 'erteilen', einvernehmen: 'ja' }),
      ),
    ).rejects.toThrow();
    expect(
      await kinderAktionen.kinderzugangAnlegen({}, formular({ lernendeId: l.fremd, benutzername: 'fremd.kind', passwort: PASSWORT })),
    ).toEqual({
      fehler: 'keinElternteil',
    });
  });

  it('Widerruf wirkt sofort: Chat sofort gesperrt, Push-Abos des Kindes entfernt', async () => {
    const kanal = (await chat.ladeKanal((await chat.kanaeleDerGruppe(gruppeA)).gruppe))!;
    await chat.bestaetigeRegeln(kind1.id);
    expect(await chat.schreibLage(kanal, await ladeGruppenKontext(kind1.id))).toBe('ok');
    als(p.elternE);
    await umleitung(
      kinderAktionen.einwilligungAendern(formular({ sprache: 'de', lernendeId: l.kind1, art: 'gruppenchat', aktion: 'widerrufen' })),
    );
    expect(await aktiv(l.kind1, 'gruppenchat')).toHaveLength(0);
    expect(await chat.schreibLage(kanal, await ladeGruppenKontext(kind1.id))).toBe('einwilligungFehlt');
    expect((await chat.ladeNachrichten(kanal, await ladeGruppenKontext(kind1.id)))?.nachrichten).toEqual([]);

    await umleitung(
      kinderAktionen.einwilligungAendern(
        formular({ sprache: 'de', lernendeId: l.kind1, art: 'push_kind', aktion: 'erteilen', einvernehmen: 'ja' }),
      ),
    );
    const v = verschluessele('https://fcm.googleapis.com/fcm/send/x');
    await db.insert(schema.pushAbo).values({
      benutzerId: kind1.id,
      endpointVerschluesselt: v.daten,
      schluesselId: v.schluesselId,
      endpointHmac: randomUUID(),
      p256dh: 'x',
      auth: 'y',
      themen: ['chat'],
      einwilligungVersion: 'test',
    });
    await umleitung(
      kinderAktionen.einwilligungAendern(formular({ sprache: 'de', lernendeId: l.kind1, art: 'push_kind', aktion: 'widerrufen' })),
    );
    expect(await db.select().from(schema.pushAbo).where(eq(schema.pushAbo.benutzerId, kind1.id))).toHaveLength(0);
  });

  it('Kinderzugang: anlegen nur mit Einwilligung, Passwort neu setzen beendet Sitzungen, Widerruf löscht den Zugang', async () => {
    als(p.elternE);
    expect(
      await kinderAktionen.kinderzugangAnlegen({}, formular({ lernendeId: l.kind2, benutzername: 'kind.zwei', passwort: PASSWORT })),
    ).toEqual({
      fehler: 'keineEinwilligung',
    });
    await umleitung(
      kinderAktionen.einwilligungAendern(
        formular({ sprache: 'de', lernendeId: l.kind2, art: 'kinderkonto', aktion: 'erteilen', einvernehmen: 'ja' }),
      ),
    );
    expect(
      await kinderAktionen.kinderzugangAnlegen({}, formular({ lernendeId: l.kind2, benutzername: 'kind.eins', passwort: PASSWORT })),
    ).toEqual({
      fehler: 'vergeben',
    });
    expect(
      await kinderAktionen.kinderzugangAnlegen({}, formular({ lernendeId: l.kind2, benutzername: 'kind.zwei', passwort: PASSWORT })),
    ).toMatchObject({
      ok: 'angelegt',
    });
    const [{ benutzerId }] = await db
      .select({ benutzerId: schema.lernende.benutzerId })
      .from(schema.lernende)
      .where(eq(schema.lernende.id, l.kind2));
    const [alt] = await db.select({ hash: schema.account.password }).from(schema.account).where(eq(schema.account.userId, benutzerId!));
    await db.insert(schema.session).values({
      id: randomUUID(),
      token: randomUUID(),
      userId: benutzerId!,
      expiresAt: new Date(Date.now() + 3600_000),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    expect(await kinderAktionen.kinderPasswortSetzen({}, formular({ lernendeId: l.kind2, passwort: 'kurz' }))).toEqual({
      fehler: 'passwort',
    });
    expect(
      await kinderAktionen.kinderPasswortSetzen({}, formular({ lernendeId: l.kind2, passwort: 'Neues-Kinderpasswort-1' })),
    ).toMatchObject({
      ok: 'gesetzt',
      benutzername: 'kind.zwei',
    });
    const [neu] = await db.select({ hash: schema.account.password }).from(schema.account).where(eq(schema.account.userId, benutzerId!));
    expect(neu.hash).not.toBe(alt.hash);
    expect(neu.hash).not.toContain('Neues-Kinderpasswort-1');
    expect(await db.select().from(schema.session).where(eq(schema.session.userId, benutzerId!))).toHaveLength(0);
    als(p.elternF);
    expect(await kinderAktionen.kinderPasswortSetzen({}, formular({ lernendeId: l.kind2, passwort: 'Neues-Kinderpasswort-2' }))).toEqual({
      fehler: 'keinElternteil',
    });

    als(p.elternE);
    const ohne = await umleitung(
      kinderAktionen.einwilligungAendern(formular({ sprache: 'de', lernendeId: l.kind2, art: 'kinderkonto', aktion: 'widerrufen' })),
    );
    expect(ohne).toContain('fehler=bestaetigen');
    await umleitung(
      kinderAktionen.einwilligungAendern(
        formular({ sprache: 'de', lernendeId: l.kind2, art: 'kinderkonto', aktion: 'widerrufen', bestaetigt: 'ja' }),
      ),
    );
    expect(await db.select().from(schema.user).where(eq(schema.user.id, benutzerId!))).toHaveLength(0);
    const [danach] = await db
      .select({ benutzerId: schema.lernende.benutzerId })
      .from(schema.lernende)
      .where(eq(schema.lernende.id, l.kind2));
    expect(danach.benutzerId).toBeNull();
    const audit = await db
      .select({ aktion: schema.auditEintrag.aktion })
      .from(schema.auditEintrag)
      .where(eq(schema.auditEintrag.zielId, l.kind2));
    expect(audit.map((a) => a.aktion)).toEqual(expect.arrayContaining(['konto.einwilligung_erteilt', 'konto.einwilligung_widerrufen']));
  });
});

describe('Ab 16 entscheidet die Person selbst (D-11)', () => {
  it('nach dem Übergang: Eltern ändern Chat und Push nicht mehr, die Person stimmt selbst zu', async () => {
    als(p.elternE);
    const z = await umleitung(
      kinderAktionen.einwilligungAendern(
        formular({ sprache: 'de', lernendeId: l.jugend, art: 'gruppenchat', aktion: 'erteilen', einvernehmen: 'ja' }),
      ),
    );
    expect(z).toContain('fehler=nurKind');
    expect(await aktiv(l.jugend, 'gruppenchat')).toHaveLength(0);
    // Lernplattform bleibt Sache der Eltern
    expect(
      await umleitung(
        kinderAktionen.einwilligungAendern(
          formular({ sprache: 'de', lernendeId: l.jugend, art: 'lernplattform', aktion: 'erteilen', einvernehmen: 'ja' }),
        ),
      ),
    ).toContain('ok=erteilt');

    als(p.jugend);
    const kJ = await ladeGruppenKontext(p.jugend.id);
    expect((await gruppe.eigeneEinwilligungen(kJ, heute))?.lage).toBe('eigene');
    expect(
      await umleitung(schuelerAktionen.eigeneEinwilligungAendern(formular({ sprache: 'en', art: 'gruppenchat', aktion: 'erteilen' }))),
    ).toContain('einwilligung=erteilt');
    const [e] = await aktiv(l.jugend, 'gruppenchat');
    expect(e).toMatchObject({
      erteiltVon: p.jugend.id,
      benutzerId: p.jugend.id,
      textVersion: textVersion(KONTO_EINWILLIGUNG_VERSION, kinderTexte.en.lernweg.einwilligungen.art.gruppenchat.text),
    });
    expect((await gruppe.eigeneEinwilligungen(kJ, heute))?.arten.find((a) => a.art === 'gruppenchat')?.gilt).toBe(true);
    await umleitung(schuelerAktionen.eigeneEinwilligungAendern(formular({ sprache: 'de', art: 'gruppenchat', aktion: 'widerrufen' })));
    expect(await aktiv(l.jugend, 'gruppenchat')).toHaveLength(0);
  });

  it('im Übergang: Eltern-Widerruf nimmt die eigene Zustimmung nicht zurück; unter 16 keine eigene Zustimmung', async () => {
    als(p.elternE);
    // S2/S3: Im Übergang erteilen Eltern nichts Neues mehr – die Einwilligung der Eltern stammt aus der Zeit vor dem 16.
    expect(
      await umleitung(
        kinderAktionen.einwilligungAendern(
          formular({ sprache: 'de', lernendeId: l.jugend2, art: 'gruppenchat', aktion: 'erteilen', einvernehmen: 'ja' }),
        ),
      ),
    ).toContain('fehler=nurKind');
    await db
      .insert(schema.kontoEinwilligung)
      .values({ lernendeId: l.jugend2, art: 'gruppenchat', textVersion: 'v1', erteiltVon: p.elternE.id, einvernehmenBestaetigt: true });
    als(p.jugend2);
    expect((await gruppe.eigeneEinwilligungen(await ladeGruppenKontext(p.jugend2.id), heute))?.lage).toBe('uebergang');
    await umleitung(schuelerAktionen.eigeneEinwilligungAendern(formular({ sprache: 'de', art: 'gruppenchat', aktion: 'erteilen' })));
    expect(await aktiv(l.jugend2, 'gruppenchat')).toHaveLength(2);
    als(p.elternE);
    await umleitung(
      kinderAktionen.einwilligungAendern(formular({ sprache: 'de', lernendeId: l.jugend2, art: 'gruppenchat', aktion: 'widerrufen' })),
    );
    expect((await aktiv(l.jugend2, 'gruppenchat')).map((x) => x.erteiltVon)).toEqual([p.jugend2.id]);
    // Elternansicht zeigt nur Einwilligungen der Eltern
    expect(
      (await kinder.einwilligungenDesKindes(l.jugend2, await ladeGruppenKontext(p.elternE.id)))?.find((x) => x.art === 'gruppenchat')
        ?.aktiv,
    ).toBe(false);

    als(kind1);
    await expect(
      schuelerAktionen.eigeneEinwilligungAendern(formular({ sprache: 'de', art: 'gruppenchat', aktion: 'erteilen' })),
    ).rejects.toThrow();
  });
});

describe('Lehrkraft-Aktionen', () => {
  it('Termin ausfallen lassen nur in der eigenen Gruppe', async () => {
    als(p.lehrkraftB);
    await expect(lehrkraftAktionen.terminAusfallSetzen(formular({ terminId: terminA, ausgefallen: '1' }))).rejects.toThrow();
    als(p.elternE);
    await expect(lehrkraftAktionen.terminAusfallSetzen(formular({ terminId: terminA, ausgefallen: '1' }))).rejects.toThrow();
    als(p.aufsichtA);
    await lehrkraftAktionen.terminAusfallSetzen(formular({ terminId: terminA, ausgefallen: '1' }));
    const [t] = await db.select().from(schema.unterrichtstermin).where(eq(schema.unterrichtstermin.id, terminA));
    expect(t.ausgefallen).toBe(true);
    await nachDerAntwort();
  });

  it('Moderation: nur mit Grund, nur eigene Gruppe; entfernen und abschließen', async () => {
    const kanal = await chat.kanaeleDerGruppe(gruppeA);
    const v = verschluessele('Gemeinheit');
    const [n] = await db
      .insert(schema.chatNachricht)
      .values({ kanalId: kanal.gruppe, absenderId: p.jugend.id, textVerschluesselt: v.daten, schluesselId: v.schluesselId })
      .returning({ id: schema.chatNachricht.id });
    const m = await chat.meldeNachricht(await ladeGruppenKontext(kind1.id), n.id, 'beleidigung', null);
    if (!m.ok) throw new Error('Meldung');
    const fd = (grund: string, massnahme = 'entfernen') =>
      formular({ sprache: 'de', gruppeId: gruppeA, meldungId: m.meldungId, massnahme, grund, abschliessen: 'ja' });

    als(p.lehrkraftB);
    await expect(lehrkraftAktionen.moderiereMeldung(fd('Grund genug'))).rejects.toThrow();
    als(p.lehrkraftA);
    expect(await umleitung(lehrkraftAktionen.moderiereMeldung(fd('ab')))).toContain('fehler=grund');
    const offen = await unterricht.offeneMeldungen(gruppeA, await ladeGruppenKontext(p.lehrkraftA.id));
    expect(offen?.find((x) => x.id === m.meldungId)?.absenderLernendeId).toBe(l.jugend);
    expect(await umleitung(lehrkraftAktionen.moderiereMeldung(fd('Beleidigung im Chat')))).toContain('ok=entfernen');
    const [nachher2] = await db.select().from(schema.chatNachricht).where(eq(schema.chatNachricht.id, n.id));
    expect(nachher2.entferntAm).not.toBeNull();
    const [meldung] = await db.select().from(schema.chatMeldung).where(eq(schema.chatMeldung.id, m.meldungId));
    expect(meldung.status).toBe('erledigt');
    const protokoll = await db.select({ aktion: schema.moderationsprotokoll.aktion }).from(schema.moderationsprotokoll);
    expect(protokoll.map((x) => x.aktion)).toEqual(expect.arrayContaining(['entfernt', 'meldung_bearbeitet']));
  });

  it('Kanal pausieren mit Grund', async () => {
    const kanal = await chat.kanaeleDerGruppe(gruppeA);
    als(p.lehrkraftA);
    const ziel = await umleitung(
      lehrkraftAktionen.kanalPauseSetzen(
        formular({ sprache: 'de', gruppeId: gruppeA, kanalId: kanal.eltern, pause: '1', grund: 'Ruhe bitte' }),
      ),
    );
    expect(ziel).toContain('ok=pausiert');
    expect((await chat.ladeKanal(kanal.eltern))?.status).toBe('pausiert');
    als(p.lehrkraftB);
    await expect(
      lehrkraftAktionen.kanalPauseSetzen(
        formular({ sprache: 'de', gruppeId: gruppeA, kanalId: kanal.eltern, pause: '0', grund: 'Weiter geht es' }),
      ),
    ).rejects.toThrow();
  });
});

describe('Push an eine Gruppe (ADR 0034, S-16)', () => {
  it('nur mit Thema, Kinder nur mit Freigabe, ohne Inhalt, höchstens einmal je 10 Minuten', async () => {
    const vapid = erzeugeVapid();
    process.env.VAPID_PRIVAT = vapid.privat;
    process.env.VAPID_KONTAKT = 'mailto:test@example.test';
    const abo = async (benutzerId: string, themen: string[]) => {
      const v = verschluessele(`https://fcm.googleapis.com/fcm/send/${randomUUID()}`);
      await db.insert(schema.pushAbo).values({
        benutzerId,
        endpointVerschluesselt: v.daten,
        schluesselId: v.schluesselId,
        endpointHmac: randomUUID(),
        p256dh: 'x',
        auth: 'y',
        themen,
        // D-17: nur Abos mit Einwilligung zum aktuellen Wortlaut bekommen Push
        einwilligungVersion: pushEinwilligungsVersion('de', false),
      });
    };
    await abo(p.lehrkraftA.id, ['chat']);
    await abo(p.aufsichtA.id, ['gebet']);
    await abo(kind1.id, ['chat']);
    await abo(p.elternE.id, ['chat', 'unterricht']);
    await abo(p.elternF.id, ['chat']);
    gesendet.length = 0;
    const jetzt = Date.now();
    // Gruppenkanal: Leitung und Schüler – Kind 1 ohne „Push für das Kind“, Eltern nicht im Kreis
    expect(
      await sendeGruppenPush(gruppeA, 'chat', { schueler: true, eltern: false }, `/mein-bereich/gruppen/${gruppeA}/chat`, null, jetzt),
    ).toBe(1);
    expect(gesendet).toEqual([{ nutzlast: { art: 'chat', pfad: `/mein-bereich/gruppen/${gruppeA}/chat`, sprache: 'de' } }]);
    expect(await sendeGruppenPush(gruppeA, 'chat', { schueler: true, eltern: false }, '/x', null, jetzt + 1000)).toBe(0);
    // Freigabe der Eltern → im nächsten Fenster auch das Kind; der Absender selbst nie
    als(p.elternE);
    await umleitung(
      kinderAktionen.einwilligungAendern(
        formular({ sprache: 'de', lernendeId: l.kind1, art: 'push_kind', aktion: 'erteilen', einvernehmen: 'ja' }),
      ),
    );
    // S2/S3: Chat-Push an das Kind zusätzlich nur mit Einwilligung „Gruppenchat“ (hier noch widerrufen)
    expect(await aktiv(l.kind1, 'gruppenchat')).toHaveLength(0);
    expect(await sendeGruppenPush(gruppeA, 'chat', { schueler: true, eltern: false }, '/x', p.lehrkraftA.id, jetzt + 11 * 60_000)).toBe(0);
    await umleitung(
      kinderAktionen.einwilligungAendern(
        formular({ sprache: 'de', lernendeId: l.kind1, art: 'gruppenchat', aktion: 'erteilen', einvernehmen: 'ja' }),
      ),
    );
    expect(await sendeGruppenPush(gruppeA, 'chat', { schueler: true, eltern: false }, '/x', p.lehrkraftA.id, jetzt + 21 * 60_000)).toBe(1);
    // Unterricht: Eltern der Gruppe mit Thema „unterricht“, nicht Eltern anderer Gruppen
    gesendet.length = 0;
    expect(await sendeGruppenPush(gruppeA, 'unterricht', { schueler: true, eltern: true }, '/y', null, jetzt)).toBe(1);
    expect(JSON.stringify(gesendet)).not.toMatch(/Hoca|Kind|Mutter/);
    delete process.env.VAPID_PRIVAT;
    expect(await sendeGruppenPush(gruppeA, 'chat', { schueler: true, eltern: true }, '/z', null, jetzt + 30 * 60_000)).toBe(0);
  });
});
