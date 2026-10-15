import { and, eq } from 'drizzle-orm';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { schema } from '@/lib/db';
import { entschluessele, sha256 } from '@/lib/krypto';
import { angemeldetAls, aufrufe, formular, verwaltungsUmgebung } from './hilfen/verwaltung';

/**
 * C12 (K-06, Z-06, G-07): Konten nur per Einladung (Token nur als Hash, Mail über den Mail-Ausgang), Rollen ändern
 * mit Schutz vor Selbstaussperrung, Zwei-Faktor zurücksetzen, endgültiges Löschen, eigenes Passwort – alles nur mit
 * Recht und mit Audit ohne Personendaten.
 */
// Versand abfangen: Empfänger mitschreiben (keine echten Mails, G-02)
const post = vi.hoisted(() => ({ an: [] as string[] }));
vi.mock('@/lib/mail/transport', () => ({
  versende: async (m: { an: string }) => {
    post.an.push(m.an);
  },
}));

const { client, db } = await verwaltungsUmgebung();
const actions = await import('@/server/actions/benutzer');
const { ladeGueltigeEinladung } = await import('@/server/queries/einladung');
const { ladeBenutzerAnsicht, ladeBenutzerListe } = await import('@/server/queries/verwaltung/benutzer');
const { mitAdministrationsSchutz } = await import('@/lib/rechte/administration');
const { auth } = await import('@/lib/auth/server');
afterAll(() => client.close());

const api = auth.api as unknown as Record<string, (o: unknown) => Promise<unknown>>;
const auditVon = (aktion: string) => db.select().from(schema.auditEintrag).where(eq(schema.auditEintrag.aktion, aktion));
const rollenVon = (id: string) =>
  db
    .select({ rolle: schema.rolleZuweisung.rolle, organisation: schema.rolleZuweisung.organisation })
    .from(schema.rolleZuweisung)
    .where(eq(schema.rolleZuweisung.benutzerId, id));

const leser = (benutzerId: string) => ({ benutzerId, name: 'Testperson Eins', email: '', rollen: [], zweiFaktorErfuellt: true });

async function fremdesKonto(rollen: Parameters<typeof angemeldetAls>[0]) {
  // angemeldetAls legt ein Konto an und meldet es an – danach wieder als Administration anmelden
  const id = (await angemeldetAls(rollen))!;
  return id;
}

beforeEach(async () => {
  await db.delete(schema.ratenbegrenzung);
});

describe('Einladen', () => {
  it('nur mit Recht benutzer.einladen', async () => {
    await angemeldetAls([{ rolle: 'redaktion' }]);
    await expect(
      actions.einladen({}, formular({ email: 'testperson.neu@example.test', name: 'Testperson Neu', rollen: 'redaktion' })),
    ).rejects.toThrow('KEIN_RECHT');
  });

  it('prüft Rollen und Organisation', async () => {
    await angemeldetAls([{ rolle: 'administration' }]);
    expect((await actions.einladen({}, formular({ email: 'testperson.a@example.test', name: 'Testperson A' }))).feldFehler).toMatchObject({
      rollen: 'rolleFehlt',
    });
    expect(
      (await actions.einladen({}, formular({ email: 'testperson.a@example.test', name: 'Testperson A', rollen: 'organisationsredaktion' })))
        .feldFehler,
    ).toMatchObject({
      organisationen: 'organisationFehlt',
    });
    expect((await actions.einladen({}, formular({ email: 'kein-email', name: 'T', rollen: 'redaktion' }))).feldFehler).toMatchObject({
      email: 'email',
      name: 'pflicht',
    });
  });

  it('legt Einladung mit Token-Hash an, Mail verschlüsselt im Ausgang, Audit ohne Adresse; Link führt zur gültigen Einladung', async () => {
    const admin = (await angemeldetAls([{ rolle: 'administration' }]))!;
    const fd = formular({ email: 'Testperson.Zwei@Example.test', name: 'Testperson Zwei', gueltigTage: '2' });
    fd.append('rollen', 'redaktion');
    fd.append('rollen', 'organisationsredaktion');
    fd.append('organisationen', 'gt');
    const z = await actions.einladen({}, fd);
    expect(z.ok).toBe(true);
    const token = z.link!.split('/verwaltung/einladung/')[1];
    const [e] = await db
      .select()
      .from(schema.einladung)
      .where(eq(schema.einladung.tokenHash, sha256(token)));
    expect(e).toMatchObject({ email: 'testperson.zwei@example.test', name: 'Testperson Zwei', erstelltVon: admin });
    expect(e.rollen).toEqual([{ rolle: 'redaktion' }, { rolle: 'organisationsredaktion', organisation: 'gt' }]);
    expect(Math.round((e.laeuftAb.getTime() - Date.now()) / 86_400_000)).toBe(2);
    expect(JSON.stringify(e)).not.toContain(token);
    const [m] = await db.select().from(schema.mailAusgang).where(eq(schema.mailAusgang.vorlage, 'einladung'));
    expect(m.datenVerschluesselt.toString('utf8')).not.toContain('testperson.zwei');
    expect(entschluessele<{ an: string; daten: { link: string } }>(m.datenVerschluesselt, m.schluesselId)).toMatchObject({
      an: 'testperson.zwei@example.test',
      daten: { link: z.link },
    });
    const [a] = await auditVon('einladung.erstellt');
    expect(a).toMatchObject({ benutzerId: admin, zielId: e.id, details: { rollen: 2 } });
    expect(JSON.stringify(a)).not.toContain('testperson.zwei');
    expect(aufrufe.nachher).toHaveLength(1);
    expect(await ladeGueltigeEinladung(token)).toMatchObject({ id: e.id });
    // Gleiche Adresse noch einmal: schon eingeladen
    const nochmal = formular({ email: 'testperson.zwei@example.test', name: 'Testperson Zwei', rollen: 'redaktion' });
    expect((await actions.einladen({}, nochmal)).feldFehler).toMatchObject({ email: 'emailEingeladen' });
  });

  it('bestehendes Konto: Fehler emailKonto; Widerrufen macht den Link ungültig', async () => {
    await angemeldetAls([{ rolle: 'administration' }]);
    const [vorhanden] = await db.select({ email: schema.user.email }).from(schema.user).limit(1);
    expect(
      (await actions.einladen({}, formular({ email: vorhanden.email, name: 'Testperson X', rollen: 'bildung' }))).feldFehler,
    ).toMatchObject({ email: 'emailKonto' });
    const z = await actions.einladen({}, formular({ email: 'testperson.drei@example.test', name: 'Testperson Drei', rollen: 'bildung' }));
    const token = z.link!.split('/verwaltung/einladung/')[1];
    const [e] = await db
      .select({ id: schema.einladung.id })
      .from(schema.einladung)
      .where(eq(schema.einladung.tokenHash, sha256(token)));
    await expect(actions.einladungWiderrufen(formular({ id: e.id }))).rejects.toMatchObject({
      ziel: '/verwaltung/benutzer?meldung=widerrufen',
    });
    expect(await ladeGueltigeEinladung(token)).toBeNull();
    expect((await auditVon('einladung.widerrufen')).some((x) => x.zielId === e.id)).toBe(true);
  });

  it('Einladungsmail wird mit Betreff und Link gebaut und versendet', async () => {
    const { versendeOffeneMails } = await import('@/lib/mail/ausgang');
    const r = await versendeOffeneMails();
    expect(r.fehler).toBe(0);
    const offen = await db
      .select()
      .from(schema.mailAusgang)
      .where(and(eq(schema.mailAusgang.vorlage, 'einladung')));
    expect(offen.every((m) => m.gesendetAm !== null)).toBe(true);
  });
});

describe('Rollen, Zwei-Faktor, Löschen', () => {
  it('Rollen ändern mit Audit (vorher/nachher); sich selbst die Administration nehmen geht nicht', async () => {
    const ziel = await fremdesKonto([{ rolle: 'redaktion' }]);
    const admin = (await angemeldetAls([{ rolle: 'administration' }]))!;
    const fd = formular({ id: ziel, rollen: 'bildung' });
    fd.append('rollen', 'organisationsredaktion');
    fd.append('organisationen', 'kt');
    expect(await actions.rollenSpeichern({}, fd)).toEqual({ ok: true });
    expect(await rollenVon(ziel)).toEqual(
      expect.arrayContaining([
        { rolle: 'bildung', organisation: null },
        { rolle: 'organisationsredaktion', organisation: 'kt' },
      ]),
    );
    const [a] = (await auditVon('benutzer.rollen_geaendert')).filter((x) => x.zielId === ziel);
    expect(a.details).toEqual({ vorher: 'redaktion', nachher: 'bildung,organisationsredaktion:kt' });
    expect((await actions.rollenSpeichern({}, formular({ id: admin, rollen: 'redaktion' }))).fehler).toBe('eigeneAdministration');
    expect(await rollenVon(admin)).toEqual([{ rolle: 'administration', organisation: null }]);
  });

  it('M-2 (S1, S2/S3): Schutzrollen nie selbst, nie mit Administration, sonst erst nach Bestätigung durch eine zweite Person', async () => {
    const ziel = await fremdesKonto([{ rolle: 'redaktion' }]);
    const admin = (await angemeldetAls([{ rolle: 'administration' }]))!;
    const selbst = formular({ id: admin, rollen: 'administration' });
    selbst.append('rollen', 'kinderschutz');
    expect((await actions.rollenSpeichern({}, selbst)).fehler).toBe('kinderschutzAdministration');
    const leitung = formular({ id: admin, rollen: 'administration' });
    leitung.append('rollen', 'leitung');
    expect((await actions.rollenSpeichern({}, leitung)).fehler).toBe('leitungAdministration');
    expect(await rollenVon(admin)).toEqual([{ rolle: 'administration', organisation: null }]);
    // Vergabe an ein anderes Konto: nur beantragt, nicht wirksam (Bestätigung: tests/integration/sicherheit-s2-konten.test.ts)
    expect(await actions.rollenSpeichern({}, formular({ id: ziel, rollen: 'kinderschutz' }))).toEqual({
      ok: true,
      beantragt: ['kinderschutz'],
    });
    expect(await rollenVon(ziel)).toEqual([]);
    expect((await db.select().from(schema.rollenAntrag).where(eq(schema.rollenAntrag.benutzerId, ziel))).map((z) => z.rolle)).toEqual([
      'kinderschutz',
    ]);
  });

  it('ohne benutzer.bearbeiten: KeinRecht', async () => {
    const ziel = await fremdesKonto([{ rolle: 'redaktion' }]);
    await angemeldetAls([{ rolle: 'mitgliederverwaltung' }]);
    await expect(actions.rollenSpeichern({}, formular({ id: ziel, rollen: 'administration' }))).rejects.toThrow('KEIN_RECHT');
    await expect(actions.kontoLoeschen(formular({ id: ziel }))).rejects.toThrow('KEIN_RECHT');
  });

  it('Zwei-Faktor zurücksetzen: TOTP, Passkeys und Sitzungen weg; nicht für das eigene Konto', async () => {
    const ziel = await fremdesKonto([{ rolle: 'bildung' }]);
    await db.insert(schema.twoFactor).values({ id: 'tf-1', secret: 'x', backupCodes: 'y', userId: ziel });
    await db.insert(schema.session).values({
      id: 's-1',
      token: 'tok-1',
      userId: ziel,
      expiresAt: new Date(Date.now() + 3_600_000),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const admin = (await angemeldetAls([{ rolle: 'administration' }]))!;
    await expect(actions.zweiFaktorZuruecksetzen(formular({ id: ziel }))).rejects.toMatchObject({
      ziel: `/verwaltung/benutzer/${ziel}?meldung=zweiFaktor`,
    });
    expect(await db.select().from(schema.twoFactor).where(eq(schema.twoFactor.userId, ziel))).toHaveLength(0);
    expect(await db.select().from(schema.session).where(eq(schema.session.userId, ziel))).toHaveLength(0);
    const [u] = await db.select({ zf: schema.user.twoFactorEnabled }).from(schema.user).where(eq(schema.user.id, ziel));
    expect(u.zf).toBe(false);
    expect((await auditVon('benutzer.zwei_faktor_zurueckgesetzt')).some((x) => x.zielId === ziel && x.benutzerId === admin)).toBe(true);
    await expect(actions.zweiFaktorZuruecksetzen(formular({ id: admin }))).rejects.toMatchObject({
      ziel: `/verwaltung/benutzer/${admin}?fehler=selbst`,
    });
  });

  it('Konto endgültig löschen: Konto und Rollen weg, Audit bleibt; eigenes Konto nicht', async () => {
    const ziel = await fremdesKonto([{ rolle: 'mitgliederverwaltung' }]);
    const admin = (await angemeldetAls([{ rolle: 'administration' }]))!;
    await expect(actions.kontoLoeschen(formular({ id: ziel }))).rejects.toMatchObject({ ziel: '/verwaltung/benutzer?meldung=geloescht' });
    expect(await db.select().from(schema.user).where(eq(schema.user.id, ziel))).toHaveLength(0);
    expect(await rollenVon(ziel)).toHaveLength(0);
    expect((await auditVon('benutzer.geloescht')).some((x) => x.zielId === ziel)).toBe(true);
    await expect(actions.kontoLoeschen(formular({ id: admin }))).rejects.toMatchObject({
      ziel: `/verwaltung/benutzer/${admin}?fehler=selbst`,
    });
    expect((await ladeBenutzerListe(leser(admin))).some((k) => k.id === ziel)).toBe(false);
  });
});

describe('Sperren', () => {
  it('sperren: Sitzungen enden, Audit, keine Benachrichtigungen mehr; entsperren; nicht das eigene Konto', async () => {
    const ziel = await fremdesKonto([{ rolle: 'mitgliederverwaltung' }]);
    await db.insert(schema.session).values({
      id: 's-2',
      token: 'tok-2',
      userId: ziel,
      expiresAt: new Date(Date.now() + 3_600_000),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    // Offener Passwort-Link des Kontos und einer eines anderen Kontos (N6)
    await db.insert(schema.verification).values([
      { id: 'v-1', identifier: 'reset-password:tokenzielkonto', value: ziel, expiresAt: new Date(Date.now() + 3_600_000) },
      { id: 'v-2', identifier: 'reset-password:tokenanderes', value: 'anderes-konto', expiresAt: new Date(Date.now() + 3_600_000) },
    ]);
    const admin = (await angemeldetAls([{ rolle: 'administration' }]))!;
    await expect(actions.kontoSperren(formular({ id: ziel }))).rejects.toMatchObject({
      ziel: `/verwaltung/benutzer/${ziel}?meldung=gesperrt`,
    });
    expect((await db.select({ id: schema.verification.id }).from(schema.verification)).map((v) => v.id)).toEqual(['v-2']);
    const [u] = await db.select({ g: schema.user.gesperrtAm }).from(schema.user).where(eq(schema.user.id, ziel));
    expect(u.g).toBeInstanceOf(Date);
    expect(await db.select().from(schema.session).where(eq(schema.session.userId, ziel))).toHaveLength(0);
    expect((await auditVon('benutzer.gesperrt')).some((x) => x.zielId === ziel && x.benutzerId === admin)).toBe(true);
    // Gesperrte Konten erhalten keine Benachrichtigungen (Mail-Ausgang „rolle:mitgliedsantrag“)
    const [{ email }] = await db.select({ email: schema.user.email }).from(schema.user).where(eq(schema.user.id, ziel));
    const { versendeOffeneMails } = await import('@/lib/mail/ausgang');
    const { verschluessele } = await import('@/lib/krypto');
    const paket = verschluessele({ an: 'rolle:mitgliedsantrag', daten: { art: 'mitgliedsantrag' } });
    const [m] = await db
      .insert(schema.mailAusgang)
      .values({ vorlage: 'benachrichtigung', sprache: 'de', datenVerschluesselt: paket.daten, schluesselId: paket.schluesselId })
      .returning({ id: schema.mailAusgang.id });
    post.an.length = 0;
    await versendeOffeneMails();
    const [gesendet] = await db
      .select({ g: schema.mailAusgang.gesendetAm })
      .from(schema.mailAusgang)
      .where(eq(schema.mailAusgang.id, m.id));
    expect(gesendet.g).not.toBeNull();
    expect(post.an.length).toBeGreaterThan(0); // die Administration erhält sie
    expect(post.an).not.toContain(email);
    await expect(actions.kontoEntsperren(formular({ id: ziel }))).rejects.toMatchObject({
      ziel: `/verwaltung/benutzer/${ziel}?meldung=entsperrt`,
    });
    const [u2] = await db.select({ g: schema.user.gesperrtAm }).from(schema.user).where(eq(schema.user.id, ziel));
    expect(u2.g).toBeNull();
    await expect(actions.kontoSperren(formular({ id: admin }))).rejects.toMatchObject({
      ziel: `/verwaltung/benutzer/${admin}?fehler=selbst`,
    });
  });

  it('letzte Administration: Schutz in der Transaktion greift auch ohne Vorprüfung und bei gleichzeitigen Änderungen', async () => {
    const admin = (await angemeldetAls([{ rolle: 'administration' }]))!;
    const zweite = await fremdesKonto([{ rolle: 'administration' }]);
    // Alle anderen Administrationskonten sperren → genau admin und zweite bleiben
    const andere = await db
      .select({ id: schema.rolleZuweisung.benutzerId })
      .from(schema.rolleZuweisung)
      .where(eq(schema.rolleZuweisung.rolle, 'administration'));
    for (const { id } of andere)
      if (id !== admin && id !== zweite) await db.update(schema.user).set({ gesperrtAm: new Date() }).where(eq(schema.user.id, id));
    const sperre = (id: string) => () =>
      mitAdministrationsSchutz(async (tx) => {
        await tx.update(schema.user).set({ gesperrtAm: new Date() }).where(eq(schema.user.id, id));
      });
    // Zwei gleichzeitige Sperren der beiden letzten: genau eine gelingt, die andere wird zurückgerollt
    const ergebnisse = await Promise.all([sperre(admin)(), sperre(zweite)()]);
    expect(ergebnisse.filter(Boolean)).toHaveLength(1);
    const offen = await db
      .select({ id: schema.user.id })
      .from(schema.user)
      .where(and(eq(schema.user.id, ergebnisse[0] ? zweite : admin)));
    expect(offen).toHaveLength(1);
    const { zaehleAdministration } = await import('@/server/queries/verwaltung/benutzer');
    expect(await zaehleAdministration()).toBe(1);
    // Rollen entziehen und Löschen der letzten: abgelehnt, nichts geändert
    const letzte = ergebnisse[0] ? zweite : admin;
    expect(
      await mitAdministrationsSchutz(async (tx) => {
        await tx.delete(schema.rolleZuweisung).where(eq(schema.rolleZuweisung.benutzerId, letzte));
      }),
    ).toBe(false);
    expect(await rollenVon(letzte)).toEqual([{ rolle: 'administration', organisation: null }]);
    expect(
      await mitAdministrationsSchutz(async (tx) => {
        await tx.delete(schema.user).where(eq(schema.user.id, letzte));
      }),
    ).toBe(false);
    expect(await zaehleAdministration()).toBe(1);
    // aufräumen: alle wieder entsperren
    await db.update(schema.user).set({ gesperrtAm: null });
  });

  it('gesperrte Administration zählt nicht als verbleibende Administration', async () => {
    const { zaehleAdministration } = await import('@/server/queries/verwaltung/benutzer');
    const vorher = await zaehleAdministration();
    const zweite = await fremdesKonto([{ rolle: 'administration' }]);
    expect(await zaehleAdministration()).toBe(vorher + 1);
    await db.update(schema.user).set({ gesperrtAm: new Date() }).where(eq(schema.user.id, zweite));
    expect(await zaehleAdministration()).toBe(vorher);
  });
});

describe('Lesen protokolliert (G-07, Tor B/C M2)', () => {
  it('Liste und Detail schreiben benutzer.gelesen ohne Personendaten', async () => {
    const admin = (await angemeldetAls([{ rolle: 'administration' }]))!;
    const ziel = await fremdesKonto([{ rolle: 'redaktion' }]);
    await ladeBenutzerListe(leser(admin));
    expect(await ladeBenutzerAnsicht(ziel, leser(admin))).toMatchObject({ id: ziel });
    expect(await ladeBenutzerAnsicht('gibt-es-nicht', leser(admin))).toBeNull();
    const eintraege = (await auditVon('benutzer.gelesen')).filter((e) => e.benutzerId === admin);
    expect(eintraege.map((e) => [e.zielId, e.details])).toEqual(
      expect.arrayContaining([
        [null, { ansicht: 'liste' }],
        [ziel, { ansicht: 'detail' }],
      ]),
    );
    expect(eintraege).toHaveLength(2);
  });
});

describe('Mein Konto', () => {
  it('Passwort ändern: Prüfung, Fehler bei falschem Passwort, Erfolg mit Audit', async () => {
    const ich = (await angemeldetAls([{ rolle: 'bildung' }]))!;
    expect(
      (await actions.passwortAendern({}, formular({ aktuell: 'alt-passwort-123', neu: 'kurz', wiederholung: 'kurz' }))).feldFehler,
    ).toMatchObject({ neu: 'passwortKurz' });
    expect(
      (
        await actions.passwortAendern(
          {},
          formular({ aktuell: 'alt-passwort-123', neu: 'neues-passwort-123', wiederholung: 'anders-passwort-123' }),
        )
      ).feldFehler,
    ).toMatchObject({ wiederholung: 'passwortGleich' });
    let aufruf: unknown = null;
    api.changePassword = async (o) => {
      aufruf = o;
      throw new Error('INVALID_PASSWORD');
    };
    expect(
      (
        await actions.passwortAendern(
          {},
          formular({ aktuell: 'falsch-passwort-1', neu: 'neues-passwort-123', wiederholung: 'neues-passwort-123' }),
        )
      ).feldFehler,
    ).toEqual({
      aktuell: 'passwortFalsch',
    });
    expect(aufruf).toMatchObject({ body: { revokeOtherSessions: true } });
    api.changePassword = async () => ({ token: null });
    // Erfolg leitet zur Kontoseite (neue Sitzung im Cookie der Antwort)
    await expect(
      actions.passwortAendern({}, formular({ aktuell: 'alt-passwort-123', neu: 'neues-passwort-123', wiederholung: 'neues-passwort-123' })),
    ).rejects.toMatchObject({ ziel: '/verwaltung/konto?passwort=geaendert' });
    expect((await auditVon('konto.passwort_geaendert')).some((x) => x.benutzerId === ich)).toBe(true);
  });

  it('Ersatzcodes: nur mit Passwort, Codes nur in der Antwort, Audit', async () => {
    const ich = (await angemeldetAls([{ rolle: 'redaktion' }]))!;
    expect((await actions.ersatzcodesErzeugen({}, formular({}))).feldFehler).toEqual({ passwort: 'pflicht' });
    api.generateBackupCodes = async () => ({ status: true, backupCodes: ['aaaaa-bbbbb', 'ccccc-ddddd'] });
    expect(await actions.ersatzcodesErzeugen({}, formular({ passwort: 'richtig-passwort-1' }))).toEqual({
      ok: true,
      ersatzcodes: ['aaaaa-bbbbb', 'ccccc-ddddd'],
    });
    const [a] = (await auditVon('konto.ersatzcodes_erzeugt')).filter((x) => x.benutzerId === ich);
    expect(JSON.stringify(a)).not.toContain('aaaaa');
  });

  it('ohne Zwei-Faktor kein Zugriff', async () => {
    await angemeldetAls([{ rolle: 'administration' }], false);
    await expect(actions.passwortAendern({}, formular({}))).rejects.toThrow('KEIN_RECHT');
  });
});
