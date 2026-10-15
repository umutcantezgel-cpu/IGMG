import { randomUUID } from 'node:crypto';
import { and, eq } from 'drizzle-orm';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { schema } from '@/lib/db';
import { entschluessele, sha256, verschluessele } from '@/lib/krypto';
import { darf, type RollenZuweisung } from '@/lib/rechte/matrix';
import { kontoUmgebung, nachher, umleitung } from './hilfen/konto';

/**
 * Regressionstests der Nacharbeit N4 (Gegenprüfung der Sicherheitsprüfung S2/S3) gegen PGlite mit echtem Better Auth:
 * (A) M-2/S2b-3 – Start-Ausnahme: Die Administration entzieht allen Leitungskonten die Rolle (Rollen speichern oder Konto
 *     löschen), gibt einem Zweitkonto `leitung` und bestätigt damit `kinderschutz` für ein Drittkonto. Seit N4: Entzug der
 *     Rollen Leitung, Kinderschutz und religiöse Prüfung bei anderen nur mit zweiter Person (bis dahin wirksam), Löschen
 *     erst danach, dauerhafter Start-Merker, Mail an die Betroffenen und an die Schutzrollen.
 * (B) S2b-4 – Bildung wird über eine eigene Zweitadresse Elternteil und setzt das Kinderpasswort; `elternBezugBeenden`
 *     entfernt die echte Mutter still. Seit N4: Einladungen an Adressen außerhalb der Voranmeldung erst nach Freigabe,
 *     Beenden nur auf Antrag mit zweiter Person und Mail an das Elternkonto, kein Kinderzugang/-passwort über einen
 *     unbestätigten Eltern-Kind-Bezug.
 * Testdaten fiktiv (G-04).
 */
const { client, db } = await kontoUmgebung();
const { auth } = await import('@/lib/auth/server');
const benutzer = await import('@/server/actions/benutzer');
const gemeindeKonten = await import('@/server/actions/gemeinde-konten');
const kinder = await import('@/server/actions/kinder');
const { nimmEinladungAn, uebernimmEinladung } = await import('@/lib/konto/einladung');
const { legeKinderkontoAn } = await import('@/lib/konto/kinderkonto');
const schutzrollen = await import('@/lib/rechte/schutzrollen');
const elternFreigabe = await import('@/lib/konto/eltern-freigabe');
const { ladeGueltigeEinladung } = await import('@/server/queries/einladung');
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

async function person(name: string, o: { verwaltung?: RollenZuweisung[]; gemeinde?: GemeindeRolle[] } = {}): Promise<Person> {
  const email = `${randomUUID().slice(0, 8)}@example.test`;
  const r = await auth.api.signUpEmail({ body: { email, password: PASSWORT, name } });
  const zweiFaktor = Boolean(o.verwaltung?.length);
  await db.update(schema.user).set({ emailVerified: true, twoFactorEnabled: zweiFaktor }).where(eq(schema.user.id, r.user.id));
  await db.insert(schema.kontoProfil).values({ benutzerId: r.user.id, anzeigename: name, istKind: false });
  if (o.verwaltung?.length)
    await db
      .insert(schema.rolleZuweisung)
      .values(o.verwaltung.map((z) => ({ benutzerId: r.user.id, rolle: z.rolle, organisation: z.organisation ?? null })));
  if (o.gemeinde?.length) await db.insert(schema.gemeindeRolle).values(o.gemeinde.map((rolle) => ({ benutzerId: r.user.id, rolle })));
  return { id: r.user.id, name, email, twoFactorEnabled: zweiFaktor };
}

function formular(werte: Record<string, string | string[]>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(werte)) for (const x of Array.isArray(v) ? v : [v]) fd.append(k, x);
  return fd;
}

function als(p: Person) {
  api.getSession = async () => ({ user: { ...p, gesperrtAm: null }, session: { id: `s-${p.id}`, createdAt: new Date(), userId: p.id } });
}

const rollenVon = async (id: string) =>
  (await db.select({ rolle: schema.rolleZuweisung.rolle }).from(schema.rolleZuweisung).where(eq(schema.rolleZuweisung.benutzerId, id)))
    .map((z) => z.rolle)
    .sort();

const entscheider = (p: Person, rollen: RollenZuweisung[]) => ({ benutzerId: p.id, email: p.email, rollen });

async function mailsSeit(stand: number) {
  const zeilen = await db.select().from(schema.mailAusgang).orderBy(schema.mailAusgang.erstelltAm);
  return zeilen.slice(stand).map((z) => ({
    vorlage: z.vorlage,
    ...entschluessele<{ an: string; daten: Record<string, string> }>(z.datenVerschluesselt, z.schluesselId),
  }));
}
const mailStand = async () => (await db.select().from(schema.mailAusgang)).length;

/** Lerndatensatz mit Eltern laut Voranmeldung (verschlüsselt wie bei der Aufnahme). */
async function lernende(name: string, elternAdressen: string[] = [], sechzehnAm = '2033-01-01'): Promise<string> {
  const v = verschluessele({
    vorname: name,
    nachname: 'Beispiel',
    geburtsdatum: null,
    eltern: elternAdressen.map((email, i) => ({ name: `Elternteil ${i + 1}`, email })),
  });
  const [z] = await db
    .insert(schema.lernende)
    .values({ benutzerId: null, datenVerschluesselt: v.daten, schluesselId: v.schluesselId, anzeigename: `${name} B.`, sechzehnAm })
    .returning({ id: schema.lernende.id });
  return z.id;
}

let admin: Person;
let bildung: Person;
beforeAll(async () => {
  admin = await person('Testperson Administration', { verwaltung: [{ rolle: 'administration' }] });
  bildung = await person('Testperson Bildung', { verwaltung: [{ rolle: 'bildung' }] });
});

describe('(A) M-2/S2b-3: Start-Ausnahme nicht über das Entziehen der Leitung zurückzuholen', () => {
  it('Weg der Gegenprüfung: Entzug nur beantragt, Löschen gesperrt, neue Leitung wartet, Kinderschutz bleibt unbestätigt', async () => {
    const vorstand = await person('Vorstand Bestand', { verwaltung: [{ rolle: 'leitung' }] });
    const zweit = await person('Zweitkonto Admin');
    const dritt = await person('Drittkonto Admin');
    const vorher = await mailStand();
    als(admin);
    // 1. Leitung des Vorstands entziehen (Rolle „redaktion“ statt „leitung“) → nur beantragt, Leitung bleibt wirksam
    expect(await benutzer.rollenSpeichern({}, formular({ id: vorstand.id, rollen: ['redaktion'] }))).toEqual({
      ok: true,
      entzugBeantragt: ['leitung'],
    });
    expect(await rollenVon(vorstand.id)).toEqual(['leitung', 'redaktion']);
    const mails = await mailsSeit(vorher);
    expect(mails.filter((m) => m.vorlage === 'betroffen')).toEqual([
      { vorlage: 'betroffen', an: vorstand.email, daten: { art: 'rollenentzug', rolle: 'leitung' } },
    ]);
    expect(mails.filter((m) => m.vorlage === 'hinweis').map((m) => m.daten.art)).toContain('rollenentzug');
    // Der Start ist vorbei – dauerhaft vermerkt (auch für eine Leitung aus dem Bestand ohne Merker)
    const [merker] = await db.select().from(schema.einstellung).where(eq(schema.einstellung.schluessel, schutzrollen.START_MERKER));
    expect(merker).toBeDefined();
    // 2. Konto löschen geht nicht, solange die Leitung wirksam ist
    expect(await umleitung(benutzer.kontoLoeschen(formular({ id: vorstand.id })))).toBe(
      `/verwaltung/benutzer/${vorstand.id}?fehler=schutzrolle`,
    );
    expect(await db.select().from(schema.user).where(eq(schema.user.id, vorstand.id))).toHaveLength(1);
    // 3. Zweitkonto bekommt leitung → nur beantragt (keine Start-Ausnahme)
    expect(await benutzer.rollenSpeichern({}, formular({ id: zweit.id, rollen: ['leitung'] }))).toEqual({
      ok: true,
      beantragt: ['leitung'],
    });
    expect(await rollenVon(zweit.id)).toEqual([]);
    // 4. kinderschutz für das Drittkonto → beantragt; das Zweitkonto kann nicht bestätigen
    expect(await benutzer.rollenSpeichern({}, formular({ id: dritt.id, rollen: ['kinderschutz'] }))).toEqual({
      ok: true,
      beantragt: ['kinderschutz'],
    });
    const [antrag] = await db.select().from(schema.rollenAntrag).where(eq(schema.rollenAntrag.benutzerId, dritt.id));
    const zweitRollen = await db.select().from(schema.rolleZuweisung).where(eq(schema.rolleZuweisung.benutzerId, zweit.id));
    expect(await schutzrollen.entscheideAntrag({ benutzerId: zweit.id, rollen: zweitRollen }, antrag.id, true)).toBe('keinRecht');
    const drittRollen = await db.select().from(schema.rolleZuweisung).where(eq(schema.rolleZuweisung.benutzerId, dritt.id));
    expect(darf(drittRollen, 'meldung.chat.lesen')).toBe(false);
    // Der Vorstand (wirksame Leitung) entscheidet – und lehnt den eigenen Entzug nicht selbst ab
    const [entzug] = await db
      .select()
      .from(schema.rollenAntrag)
      .where(and(eq(schema.rollenAntrag.benutzerId, vorstand.id), eq(schema.rollenAntrag.art, 'entzug')));
    expect(await schutzrollen.entscheideAntrag({ benutzerId: vorstand.id, rollen: [{ rolle: 'leitung' }] }, entzug.id, false)).toBe(
      'keinRecht',
    );
    // Aufräumen für die folgenden Fälle: Anträge verwerfen (der Vorstand lehnt die fremden ab)
    for (const id of [antrag.id])
      expect(await schutzrollen.entscheideAntrag({ benutzerId: vorstand.id, rollen: [{ rolle: 'leitung' }] }, id, false)).toBeNull();
  });

  it('auch nach bestätigtem Entzug der letzten Leitung kommt die Start-Ausnahme nicht zurück; Mails an Betroffene und Schutzrollen', async () => {
    // Alle Leitungen und offenen Anträge aus vorigen Fällen entfernen; Merker bleibt
    await db.delete(schema.rollenAntrag);
    await db.delete(schema.rolleZuweisung).where(eq(schema.rolleZuweisung.rolle, 'leitung'));
    const vorstand = await person('Vorstand Letzte', { verwaltung: [{ rolle: 'leitung' }] });
    const ks = await person('Kinderschutz Zweite Person', { verwaltung: [{ rolle: 'kinderschutz' }] });
    als(admin);
    expect(await benutzer.rollenSpeichern({}, formular({ id: vorstand.id, rollen: ['redaktion'] }))).toMatchObject({
      entzugBeantragt: ['leitung'],
    });
    const [entzug] = await db.select().from(schema.rollenAntrag).where(eq(schema.rollenAntrag.benutzerId, vorstand.id));
    expect(entzug).toMatchObject({ rolle: 'leitung', art: 'entzug', beantragtVon: admin.id });
    // Weder Administration noch die beantragende Person entscheiden
    expect(await schutzrollen.entscheideAntrag({ benutzerId: admin.id, rollen: [{ rolle: 'administration' }] }, entzug.id, true)).toBe(
      'keinRecht',
    );
    // Kinderschutz (zweite Person) bestätigt über die Action
    const vorher = await mailStand();
    als(ks);
    expect(
      await umleitung(
        benutzer.rollenAntragEntscheiden(formular({ id: entzug.id, entscheidung: 'bestaetigen', zurueck: '/verwaltung/kinderschutz' })),
      ),
    ).toBe('/verwaltung/kinderschutz?rollenantrag=bestaetigt#rollenantraege');
    expect(await rollenVon(vorstand.id)).toEqual(['redaktion']);
    const mails = await mailsSeit(vorher);
    expect(mails.filter((m) => m.vorlage === 'betroffen')).toEqual([
      { vorlage: 'betroffen', an: vorstand.email, daten: { art: 'rolle_entzogen', rolle: 'leitung' } },
    ]);
    expect(mails.filter((m) => m.vorlage === 'hinweis').map((m) => m.daten.art)).toEqual(['rolle_entzogen']);
    // Jetzt gibt es keine Leitung mehr – trotzdem wirkt eine neue Leitung nicht sofort
    expect(await db.select().from(schema.rolleZuweisung).where(eq(schema.rolleZuweisung.rolle, 'leitung'))).toHaveLength(0);
    const zweit = await person('Zweitkonto Nach Entzug');
    als(admin);
    expect(await benutzer.rollenSpeichern({}, formular({ id: zweit.id, rollen: ['leitung'] }))).toEqual({
      ok: true,
      beantragt: ['leitung'],
    });
    expect(await rollenVon(zweit.id)).toEqual([]);
    expect(await schutzrollen.schutzrollenGestartet()).toBe(true);
  });

  it('religiöse Prüfung: Entzug bei anderen beantragt (bleibt wirksam); erneut gewählt verfällt der Antrag; eigener Entzug sofort', async () => {
    const hoca = await person('Hoca Pruefung', { verwaltung: [{ rolle: 'religioese_pruefung' }] });
    als(admin);
    expect(await benutzer.rollenSpeichern({}, formular({ id: hoca.id, rollen: ['redaktion'] }))).toEqual({
      ok: true,
      entzugBeantragt: ['religioese_pruefung'],
    });
    expect(await rollenVon(hoca.id)).toEqual(['redaktion', 'religioese_pruefung']);
    // Wieder gewählt: der offene Entzug verfällt
    expect(await benutzer.rollenSpeichern({}, formular({ id: hoca.id, rollen: ['religioese_pruefung'] }))).toEqual({ ok: true });
    expect(await db.select().from(schema.rollenAntrag).where(eq(schema.rollenAntrag.benutzerId, hoca.id))).toHaveLength(0);
    // Eigene Rolle religiöse Prüfung (Administration darf sie haben) gibt man selbst sofort ab
    await db.insert(schema.rolleZuweisung).values({ benutzerId: admin.id, rolle: 'religioese_pruefung' });
    expect(await benutzer.rollenSpeichern({}, formular({ id: admin.id, rollen: ['administration'] }))).toEqual({ ok: true });
    expect(await rollenVon(admin.id)).toEqual(['administration']);
  });

  it('Leitung mit offenem Entzug bekommt keine Administration dazu; Sperre eines Kontos mit Schutzrolle meldet sich', async () => {
    const leitung = await person('Leitung Sperre', { verwaltung: [{ rolle: 'leitung' }] });
    als(admin);
    expect(await benutzer.rollenSpeichern({}, formular({ id: leitung.id, rollen: ['administration'] }))).toMatchObject({
      fehler: 'entzugVorAdministration',
    });
    expect(await rollenVon(leitung.id)).toEqual(['leitung']);
    const vorher = await mailStand();
    expect(await umleitung(benutzer.kontoSperren(formular({ id: leitung.id })))).toBe(
      `/verwaltung/benutzer/${leitung.id}?meldung=gesperrt`,
    );
    const mails = await mailsSeit(vorher);
    expect(mails.filter((m) => m.vorlage === 'betroffen')).toEqual([
      { vorlage: 'betroffen', an: leitung.email, daten: { art: 'gesperrt', rolle: '' } },
    ]);
    expect(mails.filter((m) => m.vorlage === 'hinweis').map((m) => m.daten.art)).toEqual(['schutzrolle_gesperrt']);
  });
});

describe('(B) S2b-4: Eltern-Einladung an eine Adresse außerhalb der Voranmeldung', () => {
  let leitung: Person;
  beforeAll(async () => {
    leitung = await person('Leitung Eltern', { verwaltung: [{ rolle: 'leitung' }] });
  });

  it('Weg der Gegenprüfung: Bildung lädt die eigene Zweitadresse ein – keine Mail, kein Link, keine Annahme', async () => {
    const mutter = await person('Mutter Zweitadresse', { gemeinde: ['gemeinde', 'eltern'] });
    const kind = await lernende('Kind Zweitadresse', [mutter.email]);
    await db.insert(schema.elternKind).values({ elternId: mutter.id, lernendeId: kind, bestaetigtAm: new Date() });
    const zweitadresse = `${randomUUID().slice(0, 8)}@example.test`;
    const vorher = await mailStand();
    als(bildung);
    expect(
      await gemeindeKonten.gemeindeEinladen(
        {},
        formular({ name: 'Zweitadresse', email: zweitadresse, art: 'eltern', lernendeId: kind, sprache: 'de', gueltigTage: '7' }),
      ),
    ).toEqual({ ok: true, wartet: true });
    const mails = await mailsSeit(vorher);
    expect(mails.filter((m) => m.an === zweitadresse)).toEqual([]);
    expect(mails.map((m) => [m.vorlage, m.an, m.daten.art])).toEqual([['hinweis', 'schutzrollen:', 'elterneinladung']]);
    const [e] = await db.select().from(schema.einladung).where(eq(schema.einladung.email, zweitadresse));
    expect(e).toMatchObject({ freigabeNoetig: true, freigegebenAm: null, lernendeId: kind });
    // Selbst mit dem (gespeicherten) Hash gäbe es keinen gültigen Link – die Einladung wartet
    expect(await db.select().from(schema.elternKind).where(eq(schema.elternKind.lernendeId, kind))).toHaveLength(1);
    // Weder Bildung noch Administration noch die eingeladene Adresse bestätigen
    expect(await elternFreigabe.entscheideEinladung(entscheider(bildung, [{ rolle: 'bildung' }]), e.id, true)).toBe('keinRecht');
    expect(await elternFreigabe.entscheideEinladung(entscheider(admin, [{ rolle: 'administration' }]), e.id, true)).toBe('keinRecht');
    expect(
      await elternFreigabe.entscheideEinladung(
        { benutzerId: randomUUID(), email: zweitadresse, rollen: [{ rolle: 'leitung' }] },
        e.id,
        true,
      ),
    ).toBe('keinRecht');
    expect((await elternFreigabe.elternAntraegeZurEntscheidung(entscheider(bildung, [{ rolle: 'bildung' }]))).einladungen).toEqual([]);
    expect(
      (await elternFreigabe.elternAntraegeZurEntscheidung(entscheider(leitung, [{ rolle: 'leitung' }]))).einladungen.map((x) => x.id),
    ).toContain(e.id);
    // Ablehnen durch die Leitung widerruft die Einladung
    als({ ...leitung, twoFactorEnabled: true });
    expect(await umleitung(benutzer.rollenAntragEntscheiden(formular({ art: 'einladung', id: e.id, entscheidung: 'ablehnen' })))).toBe(
      '/verwaltung/gemeinde-im-blick?rollenantrag=einladungAbgelehnt#rollenantraege',
    );
    const [danach] = await db.select().from(schema.einladung).where(eq(schema.einladung.id, e.id));
    expect(danach.widerrufenAm).not.toBeNull();
    expect((await mailsSeit(vorher)).filter((m) => m.an === zweitadresse)).toEqual([]);
  });

  it('nach Freigabe durch die zweite Person geht die Mail hinaus; die Annahme stiftet einen bestätigten Bezug', async () => {
    const kind = await lernende('Kind Freigabe', ['elternteil.voranmeldung@example.test']);
    const adresse = `${randomUUID().slice(0, 8)}@example.test`;
    als(bildung);
    expect(
      await gemeindeKonten.gemeindeEinladen(
        {},
        formular({ name: 'Weiteres Elternteil', email: adresse, art: 'eltern', lernendeId: kind, sprache: 'tr', gueltigTage: '7' }),
      ),
    ).toEqual({ ok: true, wartet: true });
    const [e] = await db.select().from(schema.einladung).where(eq(schema.einladung.email, adresse));
    const vorher = await mailStand();
    als({ ...leitung, twoFactorEnabled: true });
    expect(await umleitung(benutzer.rollenAntragEntscheiden(formular({ art: 'einladung', id: e.id, entscheidung: 'bestaetigen' })))).toBe(
      '/verwaltung/gemeinde-im-blick?rollenantrag=einladungBestaetigt#rollenantraege',
    );
    const mails = await mailsSeit(vorher);
    expect(mails.map((m) => [m.vorlage, m.an])).toEqual([['konto-einladung', adresse]]);
    expect(mails[0].daten.link).toContain('/tr/');
    const token = decodeURIComponent(mails[0].daten.link.split('/').at(-1)!);
    expect(await ladeGueltigeEinladung(token)).not.toBeNull();
    const r = await nimmEinladungAn({ token, passwort: PASSWORT, sprache: 'tr', einwilligung: 'v1' });
    expect(r.ok).toBe(true);
    const [bezug] = await db.select().from(schema.elternKind).where(eq(schema.elternKind.lernendeId, kind));
    expect(bezug.bestaetigtAm).not.toBeNull();
    // Zweite Entscheidung über dieselbe Einladung: nichts mehr offen
    expect(await elternFreigabe.entscheideEinladung(entscheider(leitung, [{ rolle: 'leitung' }]), e.id, true)).toBe('nichtGefunden');
  });

  it('Adresse aus der Voranmeldung: wie bisher sofort verschickt (Groß-/Kleinschreibung egal)', async () => {
    const kind = await lernende('Kind Voranmeldung', ['mama.voranmeldung@example.test']);
    const vorher = await mailStand();
    als(bildung);
    expect(
      await gemeindeKonten.gemeindeEinladen(
        {},
        formular({
          name: 'Mama',
          email: 'Mama.Voranmeldung@example.test',
          art: 'eltern',
          lernendeId: kind,
          sprache: 'de',
          gueltigTage: '7',
        }),
      ),
    ).toEqual({ ok: true });
    const mails = await mailsSeit(vorher);
    expect(mails.map((m) => m.vorlage).sort()).toEqual(['hinweis', 'konto-einladung']);
    expect(mails.find((m) => m.vorlage === 'hinweis')?.daten.art).toBe('elternbezug');
  });

  it('ältere Einladung (vor N4) an eine fremde Adresse: Annahme wartet auf Freigabe, der alte Link gilt nicht mehr', async () => {
    const kind = await lernende('Kind Altbestand', ['echte.eltern@example.test']);
    const token = randomUUID() + randomUUID();
    const adresse = `${randomUUID().slice(0, 8)}@example.test`;
    const [e] = await db
      .insert(schema.einladung)
      .values({
        email: adresse,
        name: 'Alt',
        rollen: [],
        gemeindeRollen: ['gemeinde', 'eltern'],
        lernendeId: kind,
        tokenHash: sha256(token),
        laeuftAb: new Date(Date.now() + 86_400_000),
        erstelltVon: bildung.id,
      })
      .returning({ id: schema.einladung.id });
    const vorher = await mailStand();
    expect(await nimmEinladungAn({ token, passwort: PASSWORT, sprache: 'de', einwilligung: 'v1' })).toEqual({
      ok: false,
      fehler: 'freigabe',
    });
    expect(await db.select().from(schema.user).where(eq(schema.user.email, adresse))).toHaveLength(0);
    expect(await db.select().from(schema.elternKind).where(eq(schema.elternKind.lernendeId, kind))).toHaveLength(0);
    expect(await ladeGueltigeEinladung(token)).toBeNull();
    const [danach] = await db.select().from(schema.einladung).where(eq(schema.einladung.id, e.id));
    expect(danach.freigabeNoetig).toBe(true);
    expect((await mailsSeit(vorher)).map((m) => m.daten.art)).toEqual(['elterneinladung']);

    // Vorhandenes Konto übernimmt eine solche Einladung ebenso wenig
    const vorhanden = await person('Gemeindemitglied Alt', { gemeinde: ['gemeinde'] });
    const token2 = randomUUID() + randomUUID();
    await db.insert(schema.einladung).values({
      email: vorhanden.email,
      name: 'Alt 2',
      rollen: [],
      gemeindeRollen: ['gemeinde', 'eltern'],
      lernendeId: kind,
      tokenHash: sha256(token2),
      laeuftAb: new Date(Date.now() + 86_400_000),
      erstelltVon: bildung.id,
    });
    expect(await uebernimmEinladung({ token: token2, benutzerId: vorhanden.id, email: vorhanden.email })).toEqual({
      ok: false,
      fehler: 'freigabe',
    });
    expect(await db.select().from(schema.elternKind).where(eq(schema.elternKind.elternId, vorhanden.id))).toHaveLength(0);
  });
});

describe('(B) S2b-4: Eltern-Kind-Bezug beenden nur mit zweiter Person, Elternkonto erfährt davon', () => {
  let leitung: Person;
  let mutter: Person;
  let kind: string;
  beforeAll(async () => {
    leitung = await person('Leitung Bezug', { verwaltung: [{ rolle: 'leitung' }] });
    mutter = await person('Mutter Bezug', { gemeinde: ['gemeinde', 'eltern'] });
    await db.update(schema.kontoProfil).set({ sprache: 'en' }).where(eq(schema.kontoProfil.benutzerId, mutter.id));
    kind = await lernende('Kind Bezug', [mutter.email]);
    await db.insert(schema.elternKind).values({ elternId: mutter.id, lernendeId: kind, bestaetigtAm: new Date() });
  });

  it('Bildung beantragt: Bezug bleibt, Mail an die Mutter, Hinweis an die Schutzrollen; Bildung und Mutter bestätigen nicht', async () => {
    const vorher = await mailStand();
    als(bildung);
    expect(await umleitung(gemeindeKonten.elternBezugBeenden(formular({ lernendeId: kind, elternId: mutter.id })))).toBe(
      `/verwaltung/lernende/${kind}?meldung=elternBeendenBeantragt#eltern`,
    );
    const [b] = await db.select().from(schema.elternKind).where(eq(schema.elternKind.lernendeId, kind));
    expect(b).toMatchObject({ elternId: mutter.id, beendenBeantragtVon: bildung.id });
    // Beide Mails entstehen in einer Transaktion (gleicher Zeitstempel) – Reihenfolge daher sortiert
    const mails = (await mailsSeit(vorher)).sort((x, y) => x.vorlage.localeCompare(y.vorlage));
    expect(mails.map((m) => [m.vorlage, m.an])).toEqual([
      ['hinweis', 'schutzrollen:'],
      ['konto-elternbezug-beenden', mutter.email],
    ]);
    expect(mails[1].daten.link).toContain('/en/');
    expect(mails[0].daten.art).toBe('elternbezug_beenden');
    // Ein zweiter Antrag schickt keine zweite Mail
    const stand = await mailStand();
    await umleitung(gemeindeKonten.elternBezugBeenden(formular({ lernendeId: kind, elternId: mutter.id })));
    expect(await mailStand()).toBe(stand);
    // Nicht die beantragende Person, nicht das Elternkonto, nicht die Administration
    expect(await elternFreigabe.entscheideBezugEnde(entscheider(bildung, [{ rolle: 'bildung' }]), kind, mutter.id, true)).toBe('keinRecht');
    expect(await elternFreigabe.entscheideBezugEnde(entscheider(admin, [{ rolle: 'administration' }]), kind, mutter.id, true)).toBe(
      'keinRecht',
    );
    expect(await elternFreigabe.entscheideBezugEnde(entscheider(mutter, [{ rolle: 'leitung' }]), kind, mutter.id, true)).toBe('keinRecht');
    expect(await db.select().from(schema.elternKind).where(eq(schema.elternKind.lernendeId, kind))).toHaveLength(1);
  });

  it('Ablehnen nimmt den Antrag zurück; Bestätigen durch die Leitung beendet den Bezug und meldet es der Mutter', async () => {
    als({ ...leitung, twoFactorEnabled: true });
    expect(
      await umleitung(benutzer.rollenAntragEntscheiden(formular({ art: 'bezug', id: kind, konto: mutter.id, entscheidung: 'ablehnen' }))),
    ).toBe('/verwaltung/gemeinde-im-blick?rollenantrag=bezugAbgelehnt#rollenantraege');
    const [b] = await db.select().from(schema.elternKind).where(eq(schema.elternKind.lernendeId, kind));
    expect(b.beendenBeantragtAm).toBeNull();
    als(bildung);
    await umleitung(gemeindeKonten.elternBezugBeenden(formular({ lernendeId: kind, elternId: mutter.id })));
    const vorher = await mailStand();
    als({ ...leitung, twoFactorEnabled: true });
    expect(
      await umleitung(
        benutzer.rollenAntragEntscheiden(formular({ art: 'bezug', id: kind, konto: mutter.id, entscheidung: 'bestaetigen' })),
      ),
    ).toBe('/verwaltung/gemeinde-im-blick?rollenantrag=bezugBeendet#rollenantraege');
    expect(await db.select().from(schema.elternKind).where(eq(schema.elternKind.lernendeId, kind))).toHaveLength(0);
    const mails = (await mailsSeit(vorher)).sort((x, y) => x.vorlage.localeCompare(y.vorlage));
    expect(mails.map((m) => [m.vorlage, m.an])).toEqual([
      ['hinweis', 'schutzrollen:'],
      ['konto-elternbezug-beendet', mutter.email],
    ]);
    expect(mails[0].daten.art).toBe('elternbezug_beendet');
    const audit = await db
      .select()
      .from(schema.auditEintrag)
      .where(and(eq(schema.auditEintrag.aktion, 'lernende.elternbezug_beendet'), eq(schema.auditEintrag.zielId, kind)));
    expect(audit.map((x) => x.benutzerId)).toEqual([leitung.id]);
  });

  it('die Kontoart Eltern lässt sich nicht still entfernen, solange das Konto mit Kindern verknüpft ist', async () => {
    const vater = await person('Vater Kontoart', { gemeinde: ['gemeinde', 'eltern'] });
    const k = await lernende('Kind Kontoart', [vater.email]);
    await db.insert(schema.elternKind).values({ elternId: vater.id, lernendeId: k, bestaetigtAm: new Date() });
    als(bildung);
    expect(await umleitung(gemeindeKonten.gemeindeRollenSpeichern(formular({ id: vater.id, rollen: ['gemeinde'] })))).toBe(
      `/verwaltung/gemeinde-konten/${vater.id}?fehler=elternBezug`,
    );
    expect(
      (await db.select().from(schema.gemeindeRolle).where(eq(schema.gemeindeRolle.benutzerId, vater.id))).map((r) => r.rolle).sort(),
    ).toEqual(['eltern', 'gemeinde']);
  });
});

describe('(B) S2b-4: kein Kinderzugang und kein Kinderpasswort über einen unbestätigten Eltern-Kind-Bezug', () => {
  it('neu eingetragener, unbestätigter Bezug: Passwort, Zugang und Anlegen werden abgewiesen', async () => {
    const mutter = await person('Mutter Bestaetigt', { gemeinde: ['gemeinde', 'eltern'] });
    const neu = await person('Elternteil Unbestaetigt', { gemeinde: ['gemeinde', 'eltern'] });
    const kind = await lernende('Kind Unbestaetigt', [mutter.email]);
    await db.insert(schema.elternKind).values([
      { elternId: mutter.id, lernendeId: kind, bestaetigtAm: new Date() },
      { elternId: neu.id, lernendeId: kind, bestaetigtAm: null },
    ]);
    await db.insert(schema.kontoEinwilligung).values({ lernendeId: kind, art: 'kinderkonto', textVersion: 'v1', erteiltVon: mutter.id });
    const zugang = await legeKinderkontoAn({
      benutzername: `kind.${randomUUID().slice(0, 6)}`,
      passwort: PASSWORT,
      elternBenutzerId: mutter.id,
      lernendeId: kind,
    });
    expect(zugang.ok).toBe(true);
    als(neu);
    expect(await kinder.kinderPasswortSetzen({}, formular({ lernendeId: kind, passwort: 'Ganz-neues-Passwort-2026' }))).toEqual({
      fehler: 'unbestaetigt',
    });
    // Das bisherige Passwort des Kinderzugangs gilt weiter
    api.getSession = echteSitzung;
    const anmeldung = await auth.api.signInUsername({ body: { username: zugang.ok ? zugang.benutzername : '', password: PASSWORT } });
    expect(anmeldung?.token).toBeTruthy();

    const zweitesKind = await lernende('Zweites Kind Unbestaetigt');
    await db.insert(schema.elternKind).values({ elternId: neu.id, lernendeId: zweitesKind, bestaetigtAm: null });
    await db
      .insert(schema.kontoEinwilligung)
      .values({ lernendeId: zweitesKind, art: 'kinderkonto', textVersion: 'v1', erteiltVon: neu.id });
    als(neu);
    expect(
      await kinder.kinderzugangAnlegen(
        {},
        formular({ lernendeId: zweitesKind, benutzername: `kind.${randomUUID().slice(0, 6)}`, passwort: PASSWORT, sprache: 'de' }),
      ),
    ).toEqual({ fehler: 'unbestaetigt' });
    expect(
      await legeKinderkontoAn({
        benutzername: `kind.${randomUUID().slice(0, 6)}`,
        passwort: PASSWORT,
        elternBenutzerId: neu.id,
        lernendeId: zweitesKind,
      }),
    ).toEqual({ ok: false, fehler: 'unbestaetigt' });
    const [l] = await db.select().from(schema.lernende).where(eq(schema.lernende.id, zweitesKind));
    expect(l.benutzerId).toBeNull();
  });
});

describe('Neue Mails (Betroffene, Elternkonto) lassen sich bauen und versenden', () => {
  it('alle geplanten Mails gehen ohne Fehler hinaus (Datei-Transport)', async () => {
    const { versendeOffeneMails } = await import('@/lib/mail/ausgang');
    const vorlagen = new Set((await db.select().from(schema.mailAusgang)).map((m) => m.vorlage));
    for (const v of ['hinweis', 'betroffen', 'konto-einladung', 'konto-elternbezug-beenden', 'konto-elternbezug-beendet'])
      expect(vorlagen.has(v), v).toBe(true);
    const r = await versendeOffeneMails(500);
    expect(r.fehler).toBe(0);
    const offen = (await db.select().from(schema.mailAusgang)).filter((m) => !m.gesendetAm);
    expect(offen.map((m) => m.vorlage)).toEqual([]);
  });
});
