import { randomUUID } from 'node:crypto';
import { and, eq, isNull } from 'drizzle-orm';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { schema } from '@/lib/db';
import { entschluessele, verschluessele } from '@/lib/krypto';
import { darf, type RollenZuweisung } from '@/lib/rechte/matrix';
import { kontoUmgebung, nachher, umleitung } from './hilfen/konto';

/**
 * Regressionstests der Sicherheitsprüfung S2 (Konten und Rollen) gegen PGlite mit echtem Better Auth:
 * - S2a-4 Administration macht sich nicht selbst zur Lehrkraft, Aufsicht, zum Elternteil oder zur/zum Lernenden
 * - S2b-2 Eltern übernehmen oder löschen nicht das eigene Konto einer/eines Jugendlichen (D-11)
 * - S2b-4 Eltern-Einladung mit Kindbezug: kein Link an die Verwaltung, Hinweise an Schutzrollen und bisherige Eltern,
 *   Bezug lässt sich beenden (seit N4: Adresse außerhalb der Voranmeldung und Beenden nur mit zweiter Person, weitere
 *   Fälle in sicherheit-n4-vier-augen.test.ts)
 * - S2b-3 Schutzrollen leitung/kinderschutz nur im Vier-Augen-Prinzip (M-2 aus S1 nicht mehr umgehbar)
 * - S2a-6 (D-11 Übergang) und S2b-8 (Kinderzugang-Löschung über loescheGemeindeKonto)
 * - S-L2 N-1: Administration nie an ein Konto mit Kontoart mit Gruppenzugang oder Gruppenleitung (rollenSpeichern, Einladung)
 * Testdaten fiktiv (G-04).
 */
const { client, db } = await kontoUmgebung();
const { auth } = await import('@/lib/auth/server');
const gemeindeKonten = await import('@/server/actions/gemeinde-konten');
const gruppen = await import('@/server/actions/gruppen');
const benutzer = await import('@/server/actions/benutzer');
const kinder = await import('@/server/actions/kinder');
const anmeldung = await import('@/server/actions/anmeldung');
const { nimmEinladungAn, uebernimmEinladung } = await import('@/lib/konto/einladung');
const { legeKinderkontoAn } = await import('@/lib/konto/kinderkonto');
const schutzrollen = await import('@/lib/rechte/schutzrollen');
const chat = await import('@/lib/chat/dienst');
afterAll(() => client.close());

const api = auth.api as unknown as Record<string, unknown>;
const echteSitzung = api.getSession;
afterEach(() => {
  api.getSession = echteSitzung;
  nachher.length = 0;
});

const PASSWORT = 'Ein-langes-Testpasswort-2026';
type GemeindeRolle = (typeof schema.gemeindeRolleEnum.enumValues)[number];
type Person = { id: string; name: string; email: string; twoFactorEnabled: boolean };

/** Konto mit echtem Passwort (Better Auth), optional Verwaltungs- und Gemeinde-Rollen. */
async function person(
  name: string,
  o: { verwaltung?: RollenZuweisung[]; gemeinde?: GemeindeRolle[]; kind?: boolean } = {},
): Promise<Person> {
  const email = `${randomUUID().slice(0, 8)}@example.test`;
  const r = await auth.api.signUpEmail({ body: { email, password: PASSWORT, name } });
  const zweiFaktor = Boolean(o.verwaltung?.length) || Boolean(o.gemeinde?.includes('lehrkraft'));
  await db.update(schema.user).set({ emailVerified: true, twoFactorEnabled: zweiFaktor }).where(eq(schema.user.id, r.user.id));
  await db.insert(schema.kontoProfil).values({ benutzerId: r.user.id, anzeigename: name, istKind: o.kind ?? false });
  if (o.verwaltung?.length)
    await db
      .insert(schema.rolleZuweisung)
      .values(o.verwaltung.map((z) => ({ benutzerId: r.user.id, rolle: z.rolle, organisation: z.organisation ?? null })));
  if (o.gemeinde?.length) await db.insert(schema.gemeindeRolle).values(o.gemeinde.map((rolle) => ({ benutzerId: r.user.id, rolle })));
  return { id: r.user.id, name, email, twoFactorEnabled: zweiFaktor };
}

/** Formulardaten; Listen als Mehrfachfelder (z. B. `rollen`). */
function formular(werte: Record<string, string | string[]>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(werte)) for (const x of Array.isArray(v) ? v : [v]) fd.append(k, x);
  return fd;
}

function als(p: Person) {
  api.getSession = async () => ({ user: { ...p, gesperrtAm: null }, session: { id: `s-${p.id}`, createdAt: new Date(), userId: p.id } });
}

async function lernende(name: string, sechzehnAm: string, benutzerId: string | null = null): Promise<string> {
  const v = verschluessele({ name });
  const [z] = await db
    .insert(schema.lernende)
    .values({ benutzerId, datenVerschluesselt: v.daten, schluesselId: v.schluesselId, anzeigename: name, sechzehnAm })
    .returning({ id: schema.lernende.id });
  return z.id;
}

function berlinerHeute(tage: number): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Berlin' }).format(new Date(Date.now() + tage * 86_400_000));
}

/** Geplante Mails seit einem Stand (entschlüsselt). */
async function mailsSeit(stand: number) {
  const zeilen = await db.select().from(schema.mailAusgang).orderBy(schema.mailAusgang.erstelltAm);
  return zeilen.slice(stand).map((z) => ({
    vorlage: z.vorlage,
    ...entschluessele<{ an: string; daten: Record<string, string> }>(z.datenVerschluesselt, z.schluesselId),
  }));
}
const mailStand = async () => (await db.select().from(schema.mailAusgang)).length;

/** Token einer Gemeinde-Einladung aus der geplanten Mail (der Link geht nur per Mail). */
async function tokenAusMail(email: string): Promise<string> {
  const mails = await mailsSeit(0);
  const m = mails.filter((x) => x.vorlage === 'konto-einladung' && x.an === email).at(-1);
  if (!m) throw new Error('keine Einladungsmail');
  return decodeURIComponent(m.daten.link.split('/').at(-1)!);
}

let admin: Person;
let bildung: Person;
beforeAll(async () => {
  admin = await person('Testperson Administration', { verwaltung: [{ rolle: 'administration' }] });
  bildung = await person('Testperson Bildung', { verwaltung: [{ rolle: 'bildung' }] });
});

describe('S2a-4: Administration wird nicht Lehrkraft, Aufsicht oder Elternteil', () => {
  it('Einladung an die eigene Adresse und an Konten mit Administration wird abgewiesen', async () => {
    als(admin);
    for (const art of ['lehrkraft', 'eltern'] as const) {
      const r = await gemeindeKonten.gemeindeEinladen(
        {},
        formular({ name: 'Ich selbst', email: admin.email, art, sprache: 'de', gueltigTage: '7' }),
      );
      expect(r).toMatchObject({ fehler: 'pruefen', feldFehler: { email: 'eigeneAdresse' } });
    }
    als(bildung);
    const r = await gemeindeKonten.gemeindeEinladen(
      {},
      formular({ name: 'Admin', email: admin.email, art: 'lehrkraft', sprache: 'de', gueltigTage: '7' }),
    );
    expect(r).toMatchObject({ fehler: 'pruefen', feldFehler: { email: 'administration' } });
    expect(await db.select().from(schema.einladung).where(eq(schema.einladung.email, admin.email))).toHaveLength(0);
  });

  it('eine schon vorhandene Einladung übernimmt ein Konto mit Administration nicht', async () => {
    const token = randomUUID() + randomUUID();
    const { sha256 } = await import('@/lib/krypto');
    await db.insert(schema.einladung).values({
      email: admin.email,
      name: 'Admin',
      rollen: [],
      gemeindeRollen: ['gemeinde', 'lehrkraft'],
      tokenHash: sha256(token),
      laeuftAb: new Date(Date.now() + 86_400_000),
    });
    expect(await uebernimmEinladung({ token, benutzerId: admin.id, email: admin.email })).toEqual({ ok: false, fehler: 'administration' });
    expect(await db.select().from(schema.gemeindeRolle).where(eq(schema.gemeindeRolle.benutzerId, admin.id))).toHaveLength(0);
  });

  it('Kontoarten mit Zugang zu Gruppen gibt die Verwaltung keinem Konto mit Administration', async () => {
    const zweitAdmin = await person('Zweite Administration', { verwaltung: [{ rolle: 'administration' }], gemeinde: ['gemeinde'] });
    als(bildung);
    const ziel = await umleitung(
      gemeindeKonten.gemeindeRollenSpeichern(formular({ id: zweitAdmin.id, rollen: ['gemeinde', 'lehrkraft'] })),
    );
    expect(ziel).toContain('fehler=administration');
    expect(
      (await db.select().from(schema.gemeindeRolle).where(eq(schema.gemeindeRolle.benutzerId, zweitAdmin.id))).map((r) => r.rolle),
    ).toEqual(['gemeinde']);
  });

  it('Leitung zuweisen: nie das eigene Konto, nie Administration; jede Zuweisung meldet Leitung und Kinderschutz', async () => {
    const [g] = await db
      .insert(schema.gruppe)
      .values({ name: { de: 'Gruppe Leitung' } })
      .returning({ id: schema.gruppe.id });
    // Bildung mit eigener Gemeinde-Rolle Lehrkraft (rechtmäßig möglich) – aber nicht selbst zuweisen
    await db.insert(schema.gemeindeRolle).values({ benutzerId: bildung.id, rolle: 'lehrkraft' });
    als(bildung);
    expect(await umleitung(gruppen.leitungZuweisen(formular({ gruppeId: g.id, benutzerId: bildung.id, rolle: 'aufsicht' })))).toContain(
      'fehler=leitungSelbst',
    );
    // Administration mit (alter) Kontoart Lehrkraft
    await db.insert(schema.gemeindeRolle).values({ benutzerId: admin.id, rolle: 'lehrkraft' });
    expect(await umleitung(gruppen.leitungZuweisen(formular({ gruppeId: g.id, benutzerId: admin.id, rolle: 'aufsicht' })))).toContain(
      'fehler=leitungAdministration',
    );
    als(admin);
    expect(await umleitung(gruppen.leitungZuweisen(formular({ gruppeId: g.id, benutzerId: admin.id, rolle: 'aufsicht' })))).toContain(
      'fehler=leitungSelbst',
    );
    await db
      .delete(schema.gemeindeRolle)
      .where(and(eq(schema.gemeindeRolle.benutzerId, admin.id), eq(schema.gemeindeRolle.rolle, 'lehrkraft')));
    expect(await db.select().from(schema.gruppenLeitung).where(eq(schema.gruppenLeitung.gruppeId, g.id))).toHaveLength(0);
    const hoca = await person('Hoca Test', { gemeinde: ['lehrkraft'] });
    const vorher = await mailStand();
    als(bildung);
    expect(await umleitung(gruppen.leitungZuweisen(formular({ gruppeId: g.id, benutzerId: hoca.id, rolle: 'lehrkraft' })))).toContain(
      'meldung=leitung',
    );
    expect(await mailsSeit(vorher)).toEqual([
      { vorlage: 'hinweis', an: 'schutzrollen:', daten: { art: 'leitungszuweisung', pfad: `/verwaltung/gruppen/${g.id}` } },
    ]);
  });
});

describe('S2b-4: Eltern-Einladung mit Kindbezug', () => {
  let kindId: string;
  let mutter: Person;
  let vorstand: Person;
  const zweitesElternteil = `${randomUUID().slice(0, 8)}@example.test`;
  beforeAll(async () => {
    mutter = await person('Mutter Bestand', { gemeinde: ['gemeinde', 'eltern'] });
    vorstand = await person('Vorstand Eltern', { verwaltung: [{ rolle: 'leitung' }] });
    // Lerndatensatz mit beiden Eltern laut Voranmeldung (Adressen aus der Voranmeldung brauchen keine Freigabe, N4)
    const v = verschluessele({
      vorname: 'Kind',
      nachname: 'Einladung',
      eltern: [
        { name: 'Mutter', email: mutter.email },
        { name: 'Zweites Elternteil', email: zweitesElternteil },
      ],
    });
    const [z] = await db
      .insert(schema.lernende)
      .values({ datenVerschluesselt: v.daten, schluesselId: v.schluesselId, anzeigename: 'Kind E.', sechzehnAm: '2032-04-01' })
      .returning({ id: schema.lernende.id });
    kindId = z.id;
    await db.insert(schema.elternKind).values({ elternId: mutter.id, lernendeId: kindId, bestaetigtAm: new Date() });
  });

  it('kein Link an die Verwaltung; Hinweis an Leitung und Kinderschutz; bisherige Eltern erfahren vom neuen Bezug', async () => {
    const email = zweitesElternteil;
    const vorher = await mailStand();
    als(bildung);
    const r = await gemeindeKonten.gemeindeEinladen(
      {},
      formular({ name: 'Zweites Elternteil', email, art: 'eltern', lernendeId: kindId, sprache: 'de', gueltigTage: '7' }),
    );
    expect(r).toEqual({ ok: true });
    const mails = await mailsSeit(vorher);
    expect(mails.map((m) => m.vorlage).sort()).toEqual(['hinweis', 'konto-einladung']);
    expect(mails.find((m) => m.vorlage === 'hinweis')?.daten).toEqual({ art: 'elternbezug', pfad: `/verwaltung/lernende/${kindId}` });
    // Ohne Kindbezug (z. B. Lehrkraft) bleibt der Link für die persönliche Übergabe
    const lehrkraft = await gemeindeKonten.gemeindeEinladen(
      {},
      formular({
        name: 'Neue Lehrkraft',
        email: `${randomUUID().slice(0, 8)}@example.test`,
        art: 'lehrkraft',
        sprache: 'de',
        gueltigTage: '7',
      }),
    );
    expect(lehrkraft.link).toContain('/einladung/');

    const vorAnnahme = await mailStand();
    const angenommen = await nimmEinladungAn({ token: await tokenAusMail(email), passwort: PASSWORT, sprache: 'de', einwilligung: 'v1' });
    expect(angenommen.ok).toBe(true);
    const anMutter = (await mailsSeit(vorAnnahme)).filter((m) => m.vorlage === 'konto-elternbezug');
    expect(anMutter.map((m) => m.an)).toEqual([mutter.email]);
  });

  it('die Verwaltung beendet einen Eltern-Kind-Bezug gezielt – auf Antrag, mit Bestätigung durch eine zweite Person (N4)', async () => {
    const alle = await db.select().from(schema.elternKind).where(eq(schema.elternKind.lernendeId, kindId));
    expect(alle).toHaveLength(2);
    const zweit = alle.find((e) => e.elternId !== mutter.id)!;
    als(bildung);
    expect(await umleitung(gemeindeKonten.elternBezugBeenden(formular({ lernendeId: kindId, elternId: zweit.elternId })))).toContain(
      'meldung=elternBeendenBeantragt',
    );
    expect(await db.select().from(schema.elternKind).where(eq(schema.elternKind.lernendeId, kindId))).toHaveLength(2);
    als(vorstand);
    expect(
      await umleitung(
        benutzer.rollenAntragEntscheiden(formular({ art: 'bezug', id: kindId, konto: zweit.elternId, entscheidung: 'bestaetigen' })),
      ),
    ).toContain('rollenantrag=bezugBeendet');
    expect((await db.select().from(schema.elternKind).where(eq(schema.elternKind.lernendeId, kindId))).map((e) => e.elternId)).toEqual([
      mutter.id,
    ]);
  });
});

describe('S2b-2: eigenes Konto ab 16 bleibt in der Hand der/des Jugendlichen (D-11)', () => {
  let jugend: Person;
  let lernId: string;
  let vater: Person;
  beforeAll(async () => {
    jugend = await person('Jugendliche Eigen', { gemeinde: ['gemeinde', 'schueler'] });
    lernId = await lernende('Jugendliche Eigen', berlinerHeute(-2 * 365), jugend.id);
    vater = await person('Vater Eigen', { gemeinde: ['gemeinde', 'eltern'] });
    await db.insert(schema.elternKind).values({ elternId: vater.id, lernendeId: lernId, bestaetigtAm: new Date() });
  });

  it('kein neues Passwort durch die Eltern – das eigene bleibt gültig', async () => {
    als(vater);
    expect(await kinder.kinderPasswortSetzen({}, formular({ lernendeId: lernId, passwort: 'Ein-anderes-Passwort-2026' }))).toEqual({
      fehler: 'eigenesKonto',
    });
    api.getSession = echteSitzung;
    const r = await auth.api.signInEmail({ body: { email: jugend.email, password: PASSWORT } });
    expect(r.user.id).toBe(jugend.id);
  });

  it('die Einwilligung „Kinderzugang“ greift nicht: weder erteilen noch über den Widerruf löschen', async () => {
    als(vater);
    for (const aktion of ['erteilen', 'widerrufen'] as const) {
      const ziel = await umleitung(
        kinder.einwilligungAendern(
          formular({ sprache: 'de', lernendeId: lernId, art: 'kinderkonto', aktion, einvernehmen: 'ja', bestaetigt: 'ja' }),
        ),
      );
      expect(ziel).toContain('fehler=eigenesKonto');
    }
    expect(await db.select().from(schema.user).where(eq(schema.user.id, jugend.id))).toHaveLength(1);
  });
});

describe('S2a-6: Übergang nach dem 16. Geburtstag (D-11)', () => {
  it('Eltern erteilen keine neue Einwilligung für Gruppenchat oder Push, widerrufen aber noch', async () => {
    const mama = await person('Mama Uebergang', { gemeinde: ['gemeinde', 'eltern'] });
    const lernId = await lernende('Kind Uebergang', berlinerHeute(-10));
    await db.insert(schema.elternKind).values({ elternId: mama.id, lernendeId: lernId, bestaetigtAm: new Date() });
    await db.insert(schema.kontoEinwilligung).values({ lernendeId: lernId, art: 'push_kind', textVersion: 'v1', erteiltVon: mama.id });
    als(mama);
    for (const art of ['gruppenchat', 'push_kind'] as const) {
      const ziel = await umleitung(
        kinder.einwilligungAendern(formular({ sprache: 'de', lernendeId: lernId, art, aktion: 'erteilen', einvernehmen: 'ja' })),
      );
      expect(ziel).toContain('fehler=nurKind');
    }
    const ziel = await umleitung(
      kinder.einwilligungAendern(formular({ sprache: 'de', lernendeId: lernId, art: 'push_kind', aktion: 'widerrufen' })),
    );
    expect(ziel).toContain('ok=widerrufen');
    expect(
      await db
        .select()
        .from(schema.kontoEinwilligung)
        .where(and(eq(schema.kontoEinwilligung.lernendeId, lernId), isNull(schema.kontoEinwilligung.widerrufenAm))),
    ).toHaveLength(0);
  });
});

describe('Kinderzugang (unter 16): Passwort mit Hinweis an die übrigen Eltern, Löschen wie jedes Gemeinde-Konto', () => {
  it('Passwort setzen meldet das andere Elternteil; der Widerruf löscht den Zugang samt Chat-Texten', async () => {
    const eins = await person('Elternteil Eins', { gemeinde: ['gemeinde', 'eltern'] });
    const zwei = await person('Elternteil Zwei', { gemeinde: ['gemeinde', 'eltern'] });
    const lernId = await lernende('Kind Zugang', '2033-06-01');
    await db.insert(schema.elternKind).values([
      { elternId: eins.id, lernendeId: lernId, bestaetigtAm: new Date() },
      { elternId: zwei.id, lernendeId: lernId, bestaetigtAm: new Date() },
    ]);
    await db.insert(schema.kontoEinwilligung).values({ lernendeId: lernId, art: 'kinderkonto', textVersion: 'v1', erteiltVon: eins.id });
    const zugang = await legeKinderkontoAn({
      benutzername: `kind.${randomUUID().slice(0, 6)}`,
      passwort: PASSWORT,
      elternBenutzerId: eins.id,
      lernendeId: lernId,
    });
    expect(zugang.ok).toBe(true);
    const kindId = (zugang as { benutzerId: string }).benutzerId;

    const vorher = await mailStand();
    als(eins);
    expect(await kinder.kinderPasswortSetzen({}, formular({ lernendeId: lernId, passwort: 'Ein-neues-Kinderpasswort-26' }))).toMatchObject({
      ok: 'gesetzt',
    });
    expect((await mailsSeit(vorher)).map((m) => [m.vorlage, m.an])).toEqual([['konto-kinderpasswort', zwei.email]]);

    // Chat-Nachricht des Kindes – nach dem Widerruf bleibt nur der Platzhalter ohne Text
    const [g] = await db
      .insert(schema.gruppe)
      .values({ name: { de: 'Gruppe Zugang' } })
      .returning({ id: schema.gruppe.id });
    const kanal = await chat.kanaeleDerGruppe(g.id);
    const v = verschluessele('Nachricht des Kindes');
    const [n] = await db
      .insert(schema.chatNachricht)
      .values({ kanalId: kanal.gruppe, absenderId: kindId, textVerschluesselt: v.daten, schluesselId: v.schluesselId })
      .returning({ id: schema.chatNachricht.id });
    const ziel = await umleitung(
      kinder.einwilligungAendern(
        formular({ sprache: 'de', lernendeId: lernId, art: 'kinderkonto', aktion: 'widerrufen', bestaetigt: 'ja' }),
      ),
    );
    expect(ziel).toContain('ok=widerrufen');
    expect(await db.select().from(schema.user).where(eq(schema.user.id, kindId))).toHaveLength(0);
    const [rest] = await db.select().from(schema.chatNachricht).where(eq(schema.chatNachricht.id, n.id));
    expect(rest.entferntAm).not.toBeNull();
    expect(entschluessele<string>(rest.textVerschluesselt, rest.schluesselId)).toBe('');
  });
});

describe('S2b-3: Schutzrollen nur im Vier-Augen-Prinzip (M-2)', () => {
  let leitung: Person;

  it('nie zusammen mit Administration, nie an sich selbst', async () => {
    als(admin);
    const r = await benutzer.rollenSpeichern({}, formular({ id: admin.id, rollen: ['administration', 'leitung'] }));
    expect(r).toMatchObject({ fehler: 'leitungAdministration' });
    const zweit = await person('Zweitkonto Ohne Rolle');
    const k = await benutzer.rollenSpeichern({}, formular({ id: zweit.id, rollen: ['administration', 'kinderschutz'] }));
    expect(k).toMatchObject({ fehler: 'kinderschutzAdministration' });
  });

  it('Start: die erste Leitung wirkt sofort, jede weitere Schutzrolle wartet auf Bestätigung', async () => {
    // Frische Installation: keine Leitung und noch nie eine (kein Start-Merker, N4)
    await db.delete(schema.rolleZuweisung).where(eq(schema.rolleZuweisung.rolle, 'leitung'));
    await db.delete(schema.einstellung).where(eq(schema.einstellung.schluessel, schutzrollen.START_MERKER));
    leitung = await person('Vorstand Eins');
    als(admin);
    expect(await benutzer.rollenSpeichern({}, formular({ id: leitung.id, rollen: ['leitung'] }))).toEqual({ ok: true });
    expect(
      (await db.select().from(schema.rolleZuweisung).where(eq(schema.rolleZuweisung.benutzerId, leitung.id))).map((z) => z.rolle),
    ).toEqual(['leitung']);
    // Der Start ist damit dauerhaft vorbei
    expect(await db.select().from(schema.einstellung).where(eq(schema.einstellung.schluessel, schutzrollen.START_MERKER))).toHaveLength(1);
    const zweit = await person('Zweite Leitung');
    expect(await benutzer.rollenSpeichern({}, formular({ id: zweit.id, rollen: ['leitung'] }))).toEqual({
      ok: true,
      beantragt: ['leitung'],
    });
    expect(await db.select().from(schema.rolleZuweisung).where(eq(schema.rolleZuweisung.benutzerId, zweit.id))).toHaveLength(0);
  });

  it('Kinderschutz per Einladung an eine Zweitadresse: nach der Annahme nicht wirksam, erst nach Bestätigung', async () => {
    const email = `${randomUUID().slice(0, 8)}@example.test`;
    als(admin);
    const e = await benutzer.einladen({}, formular({ email, name: 'Zweitadresse', gueltigTage: '7', rollen: ['kinderschutz'] }));
    expect(e.ok).toBe(true);
    api.getSession = echteSitzung;
    const token = e.link!.split('/').at(-1)!;
    await umleitung(anmeldung.einladungAnnehmen({}, formular({ token, passwort: PASSWORT, wiederholung: PASSWORT })));
    const [neu] = await db.select().from(schema.user).where(eq(schema.user.email, email));
    const rollen = await db.select().from(schema.rolleZuweisung).where(eq(schema.rolleZuweisung.benutzerId, neu.id));
    expect(rollen).toHaveLength(0);
    expect(darf(rollen, 'meldung.chat.lesen')).toBe(false);
    const [antrag] = await db.select().from(schema.rollenAntrag).where(eq(schema.rollenAntrag.benutzerId, neu.id));
    expect(antrag).toMatchObject({ rolle: 'kinderschutz', beantragtVon: admin.id });

    // Weder Administration noch die beantragende oder die betroffene Person entscheiden
    const adminRollen = [{ rolle: 'administration' as const }];
    expect(await schutzrollen.entscheideAntrag({ benutzerId: admin.id, rollen: adminRollen }, antrag.id, true)).toBe('keinRecht');
    expect(await schutzrollen.entscheideAntrag({ benutzerId: neu.id, rollen: [{ rolle: 'leitung' }] }, antrag.id, true)).toBe('keinRecht');
    expect(await schutzrollen.entscheideAntrag({ benutzerId: admin.id, rollen: [{ rolle: 'leitung' }] }, antrag.id, true)).toBe(
      'keinRecht',
    );
    expect(await schutzrollen.antraegeZurEntscheidung({ benutzerId: admin.id, rollen: adminRollen })).toEqual([]);

    // Die Leitung (zweite Person) bestätigt über die Action
    const offen = await schutzrollen.antraegeZurEntscheidung({ benutzerId: leitung.id, rollen: [{ rolle: 'leitung' }] });
    expect(offen.map((x) => x.id)).toContain(antrag.id);
    als({ ...leitung, twoFactorEnabled: true });
    await db.update(schema.user).set({ twoFactorEnabled: true }).where(eq(schema.user.id, leitung.id));
    const ziel = await umleitung(
      benutzer.rollenAntragEntscheiden(formular({ id: antrag.id, entscheidung: 'bestaetigen', zurueck: '/verwaltung/gemeinde-im-blick' })),
    );
    expect(ziel).toContain('rollenantrag=bestaetigt');
    const danach = await db.select().from(schema.rolleZuweisung).where(eq(schema.rolleZuweisung.benutzerId, neu.id));
    expect(darf(danach, 'meldung.chat.lesen')).toBe(true);
  });

  it('Kinderschutz an ein vorhandenes Konto: beantragt, Hinweis an die Schutzrollen; Ablehnen verwirft den Antrag', async () => {
    const ziel = await person('Kandidat Kinderschutz');
    const vorher = await mailStand();
    als(admin);
    expect(await benutzer.rollenSpeichern({}, formular({ id: ziel.id, rollen: ['redaktion', 'kinderschutz'] }))).toEqual({
      ok: true,
      beantragt: ['kinderschutz'],
    });
    expect(
      (await db.select().from(schema.rolleZuweisung).where(eq(schema.rolleZuweisung.benutzerId, ziel.id))).map((z) => z.rolle),
    ).toEqual(['redaktion']);
    expect((await mailsSeit(vorher)).filter((m) => m.vorlage === 'hinweis').map((m) => m.daten.art)).toContain('rollenantrag');
    const [antrag] = await db.select().from(schema.rollenAntrag).where(eq(schema.rollenAntrag.benutzerId, ziel.id));
    expect(await schutzrollen.entscheideAntrag({ benutzerId: leitung.id, rollen: [{ rolle: 'leitung' }] }, antrag.id, false)).toBeNull();
    expect(await db.select().from(schema.rollenAntrag).where(eq(schema.rollenAntrag.benutzerId, ziel.id))).toHaveLength(0);
    expect(
      (await db.select().from(schema.rolleZuweisung).where(eq(schema.rolleZuweisung.benutzerId, ziel.id))).map((z) => z.rolle),
    ).toEqual(['redaktion']);
  });
});

describe('Neue Mails (Hinweis an Schutzrollen, Elternbezug, Kinderpasswort) lassen sich bauen und versenden', () => {
  it('alle geplanten Mails gehen ohne Fehler hinaus (Datei-Transport)', async () => {
    const { versendeOffeneMails } = await import('@/lib/mail/ausgang');
    const vorlagen = new Set((await db.select().from(schema.mailAusgang)).map((m) => m.vorlage));
    for (const v of ['hinweis', 'konto-elternbezug', 'konto-kinderpasswort']) expect(vorlagen.has(v), v).toBe(true);
    const r = await versendeOffeneMails(500);
    expect(r.fehler).toBe(0);
    const offen = (await db.select().from(schema.mailAusgang)).filter((m) => !m.gesendetAm);
    expect(offen.map((m) => m.vorlage)).toEqual([]);
  });
});

describe('S-L2 N-1: Administration nie an ein Konto mit Gruppenzugang (Gegenrichtung zu S2a-4)', () => {
  it('rollenSpeichern lehnt Administration ab für Gruppenleitung, Lehrkraft, Elternteil und Schüler*in; reine Gemeinde-Konten gehen', async () => {
    const [g] = await db
      .insert(schema.gruppe)
      .values({ name: { de: 'Gruppe N-1' } })
      .returning({ id: schema.gruppe.id });
    const hoca = await person('Hoca N-1', { gemeinde: ['gemeinde', 'lehrkraft'] });
    await db.insert(schema.gruppenLeitung).values({ gruppeId: g.id, benutzerId: hoca.id, rolle: 'lehrkraft' });
    als(admin);
    const administration = (id: string) => benutzer.rollenSpeichern({}, formular({ id, rollen: ['administration'] }));
    expect(await administration(hoca.id)).toMatchObject({ fehler: 'administrationGruppenzugang' });
    expect(await db.select().from(schema.rolleZuweisung).where(eq(schema.rolleZuweisung.benutzerId, hoca.id))).toEqual([]);
    expect(await db.select().from(schema.gruppenLeitung).where(eq(schema.gruppenLeitung.benutzerId, hoca.id))).toHaveLength(1);
    // Die Gruppenleitung allein genügt (Kontoart schon entzogen)
    await db
      .delete(schema.gemeindeRolle)
      .where(and(eq(schema.gemeindeRolle.benutzerId, hoca.id), eq(schema.gemeindeRolle.rolle, 'lehrkraft')));
    expect(await administration(hoca.id)).toMatchObject({ fehler: 'administrationGruppenzugang' });
    for (const art of ['eltern', 'schueler', 'lehrkraft'] as const) {
      const p = await person(`Konto ${art}`, { gemeinde: ['gemeinde', art] });
      expect(await administration(p.id)).toMatchObject({ fehler: 'administrationGruppenzugang' });
    }
    // Andere Verwaltungsrollen bleiben möglich; ein reines Gemeinde-Konto bekommt Administration
    expect(await benutzer.rollenSpeichern({}, formular({ id: hoca.id, rollen: ['bildung'] }))).toEqual({ ok: true });
    const nur = await person('Nur Gemeinde', { gemeinde: ['gemeinde'] });
    expect(await administration(nur.id)).toEqual({ ok: true });
  });

  it('eine Einladung mit Rolle Administration übernimmt ein Konto mit Gruppenzugang nicht', async () => {
    const hoca = await person('Hoca Einladung', { gemeinde: ['gemeinde', 'lehrkraft'] });
    const token = randomUUID() + randomUUID();
    const { sha256 } = await import('@/lib/krypto');
    await db.insert(schema.einladung).values({
      email: hoca.email,
      name: 'Hoca',
      rollen: [{ rolle: 'administration' }],
      gemeindeRollen: [],
      tokenHash: sha256(token),
      laeuftAb: new Date(Date.now() + 86_400_000),
    });
    expect(await uebernimmEinladung({ token, benutzerId: hoca.id, email: hoca.email })).toEqual({ ok: false, fehler: 'administration' });
    expect(await db.select().from(schema.rolleZuweisung).where(eq(schema.rolleZuweisung.benutzerId, hoca.id))).toEqual([]);
  });
});
