import { randomUUID } from 'node:crypto';
import { and, eq } from 'drizzle-orm';
import { afterAll, afterEach, beforeEach, describe, expect, it } from 'vitest';
import { schema } from '@/lib/db';
import { entschluessele, verschluessele } from '@/lib/krypto';
import { formular, kontoUmgebung, nachher, umleitung } from './hilfen/konto';

/**
 * Aufnahme aus der Voranmeldung (O-L01) mit ECHTEM Better Auth: „Aufnehmen“ legt Lernende (verschlüsselt), Gruppe und
 * Eltern-Einladung an – idempotent (zweimal klicken, gleichzeitig klicken); die Annahme der Einladung (neues oder
 * vorhandenes Konto) ergibt den Eltern-Kind-Bezug. Dazu Einladung „Schüler ab 16“ mit Bindung an den Lerndatensatz und
 * Rechte-Negativtests. Testdaten fiktiv (G-04).
 */
const { client, db } = await kontoUmgebung();
const lernendeAktionen = await import('@/server/actions/lernende');
const kontenAktionen = await import('@/server/actions/gemeinde-konten');
const kontoAktionen = await import('@/server/actions/konto');
const { nimmVoranmeldungAuf } = await import('@/lib/lernen/aufnahme');
const eingaenge = await import('@/server/queries/verwaltung/eingaenge');
const { ladeGruppenAuswahl } = await import('@/server/queries/verwaltung/gruppen');
const { gruppeFuerKurs } = await import('@/lib/lernen/verwaltung');
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
  delete process.env.FUNKTION_LERNPLATTFORM;
  nachher.length = 0;
});

/** Verwaltungskonto mit Rollen (und zweitem Faktor) anlegen und als Sitzung setzen. */
async function alsVerwaltung(rollen: ('bildung' | 'redaktion' | 'administration')[], zweiFaktor = true): Promise<string> {
  const id = randomUUID();
  const email = `testperson.${id.slice(0, 8)}@example.test`;
  await db.insert(schema.user).values({ id, name: 'Testperson Verwaltung', email, emailVerified: true, twoFactorEnabled: zweiFaktor });
  if (rollen.length) await db.insert(schema.rolleZuweisung).values(rollen.map((rolle) => ({ benutzerId: id, rolle })));
  api.getSession = async () => ({
    user: { id, name: 'Testperson Verwaltung', email, twoFactorEnabled: zweiFaktor, gesperrtAm: null },
    session: { id: `s-${id}`, createdAt: new Date(), userId: id },
  });
  return id;
}

function alsSitzung(u: { id: string; name: string; email: string }) {
  api.getSession = async () => ({
    user: { ...u, twoFactorEnabled: false, gesperrtAm: null },
    session: { id: `s-${u.id}`, createdAt: new Date(), userId: u.id },
  });
}

async function voranmeldung(werte: Record<string, string> = {}, bezugId: string | null = null): Promise<string> {
  const daten = {
    sprache: 'tr',
    klasse: 'grundkurs',
    geschlecht: 'weiblich',
    vorname: 'Testkind',
    nachname: 'Beispiel',
    geburtsdatum: '2015-04-02',
    strasse: '[Straße 1]',
    plz: '35578',
    ort: 'Wetzlar',
    eltern1Name: 'Testperson Mutter',
    eltern1Telefon: '0123 456',
    eltern1Email: `testperson.mutter.${randomUUID().slice(0, 6)}@example.test`,
    eltern2Name: 'Testperson Vater',
    eltern2Telefon: '',
    eltern2Email: '',
    geschwister: '',
    ausgefuelltVon: 'Testperson Mutter',
    einwilligungKontakt: 'ja',
    einwilligungDatenschutz: 'ja',
    ...werte,
  };
  const p = verschluessele(daten);
  const [e] = await db
    .insert(schema.eingang)
    .values({ art: 'voranmeldung', sprache: daten.sprache, bezugId, datenVerschluesselt: p.daten, schluesselId: p.schluesselId })
    .returning({ id: schema.eingang.id });
  return e.id;
}

async function gruppe(): Promise<string> {
  const [g] = await db
    .insert(schema.gruppe)
    .values({ name: { de: 'Grundkurs [Testgruppe]' }, wochentage: [6] })
    .returning({ id: schema.gruppe.id });
  return g.id;
}

const lernendeZu = (eingangId: string) => db.select().from(schema.lernende).where(eq(schema.lernende.eingangId, eingangId));
const einladungenZu = (lernendeId: string) => db.select().from(schema.einladung).where(eq(schema.einladung.lernendeId, lernendeId));

/** Token aus der (verschlüsselten) Einladungsmail im Ausgang. */
async function tokenAusMail(email: string): Promise<{ token: string; link: string; sprache: string }> {
  const mails = await db.select().from(schema.mailAusgang).where(eq(schema.mailAusgang.vorlage, 'konto-einladung'));
  for (const m of mails) {
    const inhalt = entschluessele<{ an: string; daten: Record<string, string> }>(m.datenVerschluesselt, m.schluesselId);
    if (inhalt.an === email) return { token: inhalt.daten.link.split('/').at(-1)!, link: inhalt.daten.link, sprache: m.sprache };
  }
  throw new Error(`keine Einladungsmail an ${email}`);
}

describe('Aufnehmen (O-L01)', () => {
  it('legt Lernende verschlüsselt an, ordnet die Gruppe zu, lädt die Eltern ein – zweimal klicken legt nichts doppelt an', async () => {
    const akteur = await alsVerwaltung(['bildung']);
    const eingangId = await voranmeldung();
    const gruppeId = await gruppe();
    const fd = () => formular({ id: eingangId, gruppeId, eltern1: 'ja', eltern2: 'ja' });

    // Elternteil 2 hat keine Adresse: genau eine Einladung
    expect(await umleitung(lernendeAktionen.aufnehmen(fd()))).toBe(
      `/verwaltung/eingaenge/${eingangId}?aufnahme=angelegt&einladungen=1#aufnahme`,
    );
    const [l] = await lernendeZu(eingangId);
    expect(l).toMatchObject({ anzeigename: 'Testkind B.', sechzehnAm: '2031-04-02', status: 'aktiv', aufgenommenVon: akteur });
    expect(l.datenVerschluesselt.toString('utf8')).not.toContain('Testkind');
    expect(entschluessele<Record<string, unknown>>(l.datenVerschluesselt, l.schluesselId)).toMatchObject({
      vorname: 'Testkind',
      nachname: 'Beispiel',
      geburtsdatum: '2015-04-02',
    });
    const [e] = await db.select().from(schema.eingang).where(eq(schema.eingang.id, eingangId));
    // Verknüpft über lernende.eingang_id; der Bezug bleibt der (hier fehlende) gewünschte Kurs (F-44)
    expect(e).toMatchObject({ bezugId: null, status: 'in_bearbeitung' });
    expect(await db.select().from(schema.gruppenMitglied).where(eq(schema.gruppenMitglied.lernendeId, l.id))).toHaveLength(1);
    const [einladung] = await einladungenZu(l.id);
    expect(einladung).toMatchObject({ name: 'Testperson Mutter', gemeindeRollen: ['gemeinde', 'eltern'], rollen: [], angenommenAm: null });
    // Mail in der Sprache der Voranmeldung, Link auf die türkische Einladungsseite, ohne Namen
    const mail = await tokenAusMail(einladung.email);
    expect(mail.sprache).toBe('tr');
    expect(mail.link).toMatch(/\/tr\/davet\/[A-Za-z0-9_-]{40,}$/);
    const aufgenommen = await db.select().from(schema.auditEintrag).where(eq(schema.auditEintrag.aktion, 'lernende.aufgenommen'));
    expect(aufgenommen.find((a) => a.zielId === l.id)?.details).toEqual({ eingang: eingangId, gruppe: true, einladungen: 1 });
    expect(nachher.length).toBe(1);

    // Zweiter Klick: nichts doppelt
    expect(await umleitung(lernendeAktionen.aufnehmen(fd()))).toBe(
      `/verwaltung/eingaenge/${eingangId}?aufnahme=vorhanden&einladungen=0#aufnahme`,
    );
    expect(await lernendeZu(eingangId)).toHaveLength(1);
    expect(await einladungenZu(l.id)).toHaveLength(1);
    expect(await db.select().from(schema.gruppenMitglied).where(eq(schema.gruppenMitglied.lernendeId, l.id))).toHaveLength(1);
  });

  it('F-44: Voranmeldung mit Kurs – Eingang und Aufnahme zeigen den Kurs, die Gruppe des Kurses ist vorbelegt, der Bezug bleibt', async () => {
    const akteur = await alsVerwaltung(['bildung']);
    const [k] = await db
      .insert(schema.kurs)
      .values({ slug: `elifbe-${randomUUID().slice(0, 6)}`, titel: { de: 'Elifbe für Kinder' }, status: 'veroeffentlicht' })
      .returning({ id: schema.kurs.id });
    const [g] = await db
      .insert(schema.gruppe)
      .values({ name: { de: 'Elifbe [Samstag]' }, kursId: k.id, wochentage: [6] })
      .returning({ id: schema.gruppe.id });
    const eingangId = await voranmeldung({}, k.id);
    const a = {
      benutzerId: akteur,
      name: 'Testperson Verwaltung',
      email: 'x@example.test',
      rollen: [{ rolle: 'bildung' as const, organisation: null }],
      zweiFaktorErfuellt: true,
    };
    // Eingang: Kurs als Bezug (Kopfzeile, Liste, Detail)
    expect(await eingaenge.ladeEingangKopf(eingangId, a)).toMatchObject({ kursId: k.id, bezugTitel: 'Elifbe für Kinder' });
    const liste = await eingaenge.ladeEingangsListe({ art: 'voranmeldung', seite: 1 }, a);
    expect(liste.zeilen.find((z) => z.id === eingangId)).toMatchObject({ kursId: k.id, bezugTitel: 'Elifbe für Kinder' });
    // Aufnahme: Gruppe des Kurses vorbelegt
    expect(gruppeFuerKurs(await ladeGruppenAuswahl(), k.id)).toBe(g.id);
    // Aufnehmen mit der vorbelegten Gruppe: Mitgliedschaft, Bezug zum Kurs bleibt
    await umleitung(lernendeAktionen.aufnehmen(formular({ id: eingangId, gruppeId: g.id })));
    const [l] = await lernendeZu(eingangId);
    expect(await db.select().from(schema.gruppenMitglied).where(eq(schema.gruppenMitglied.lernendeId, l.id))).toHaveLength(1);
    const [e] = await db.select().from(schema.eingang).where(eq(schema.eingang.id, eingangId));
    expect(e).toMatchObject({ bezugId: k.id, status: 'in_bearbeitung' });
    // Ein Eingang ohne passenden Kurs (gelöscht) zeigt keinen Kurs
    const ohne = await voranmeldung({}, randomUUID());
    expect(await eingaenge.ladeEingangKopf(ohne, a)).toMatchObject({ kursId: null, bezugTitel: null });
  });

  it('gleichzeitige Aufnahme desselben Eingangs: genau eine Lernende, genau eine Einladung', async () => {
    const akteur = await alsVerwaltung(['bildung']);
    const eingangId = await voranmeldung();
    const ergebnisse = await Promise.all(
      [1, 2, 3].map(() => nimmVoranmeldungAuf({ eingangId, akteurId: akteur, gruppeId: null, eltern: [1] })),
    );
    expect(ergebnisse.filter((r) => r.ok && r.status === 'angelegt')).toHaveLength(1);
    const [l] = await lernendeZu(eingangId);
    expect(await lernendeZu(eingangId)).toHaveLength(1);
    expect(await einladungenZu(l.id)).toHaveLength(1);
  });

  it('Annahme mit neuem Konto ergibt eltern_kind; mit vorhandenem Konto (übernehmen) ebenso', async () => {
    await alsVerwaltung(['bildung']);
    const eingangId = await voranmeldung();
    await umleitung(lernendeAktionen.aufnehmen(formular({ id: eingangId, eltern1: 'ja' })));
    const [l] = await lernendeZu(eingangId);
    const [einladung] = await einladungenZu(l.id);
    const { token } = await tokenAusMail(einladung.email);

    api.getSession = echteSitzung;
    expect(
      await umleitung(
        kontoAktionen.gemeindeEinladungAnnehmen(
          {},
          formular({ token, passwort: PASSWORT, wiederholung: PASSWORT, einwilligung: 'ja', sprache: 'tr' }),
        ),
      ),
    ).toBe('/tr/giris?hinweis=eingeladen');
    const [u] = await db.select().from(schema.user).where(eq(schema.user.email, einladung.email));
    const [bezug] = await db.select().from(schema.elternKind).where(eq(schema.elternKind.elternId, u.id));
    expect(bezug).toMatchObject({ lernendeId: l.id, sorgeberechtigt: true });
    expect(bezug.bestaetigtAm).not.toBeNull();
    const rollen = await db
      .select({ r: schema.gemeindeRolle.rolle })
      .from(schema.gemeindeRolle)
      .where(eq(schema.gemeindeRolle.benutzerId, u.id));
    expect(rollen.map((x) => x.r).sort()).toEqual(['eltern', 'gemeinde']);

    // Vorhandenes Gemeinde-Konto (z. B. Geschwisterkind): Einladung übernehmen → zweiter Bezug, kein zweites Konto
    await alsVerwaltung(['bildung']);
    const zweiter = await voranmeldung({ vorname: 'Testkind Zwei', eltern1Email: einladung.email });
    await umleitung(lernendeAktionen.aufnehmen(formular({ id: zweiter, eltern1: 'ja' })));
    const [l2] = await lernendeZu(zweiter);
    const { token: token2 } = await tokenAusMail2(einladung.email, l2.id);
    alsSitzung({ id: u.id, name: u.name, email: u.email });
    expect(await umleitung(kontoAktionen.gemeindeEinladungUebernehmen({}, formular({ token: token2 })))).toBe('/mein-bereich');
    const bezuege = await db.select().from(schema.elternKind).where(eq(schema.elternKind.elternId, u.id));
    expect(bezuege.map((b) => b.lernendeId).sort()).toEqual([l.id, l2.id].sort());
    expect(await db.select().from(schema.user).where(eq(schema.user.email, einladung.email))).toHaveLength(1);
  });

  it('ohne Schalter „konten“ entsteht die Lernende, aber keine Einladung', async () => {
    await alsVerwaltung(['bildung']);
    process.env.FUNKTION_KONTEN = 'aus';
    const eingangId = await voranmeldung();
    expect(await umleitung(lernendeAktionen.aufnehmen(formular({ id: eingangId, eltern1: 'ja' })))).toContain(
      'aufnahme=angelegt&einladungen=0',
    );
    const [l] = await lernendeZu(eingangId);
    expect(await einladungenZu(l.id)).toHaveLength(0);
  });

  it('Rechte: Redaktion, ohne zweiten Faktor, Schalter „lernplattform“ aus und andere Eingangsarten werden abgelehnt', async () => {
    const eingangId = await voranmeldung();
    await alsVerwaltung(['redaktion']);
    await expect(lernendeAktionen.aufnehmen(formular({ id: eingangId }))).rejects.toThrow('KEIN_RECHT');
    await alsVerwaltung(['bildung'], false);
    await expect(lernendeAktionen.aufnehmen(formular({ id: eingangId }))).rejects.toThrow('KEIN_RECHT');
    await alsVerwaltung(['bildung']);
    process.env.FUNKTION_LERNPLATTFORM = 'aus';
    await expect(lernendeAktionen.aufnehmen(formular({ id: eingangId }))).rejects.toThrow('KEIN_RECHT');
    delete process.env.FUNKTION_LERNPLATTFORM;
    expect(await lernendeZu(eingangId)).toHaveLength(0);
    // Kontaktanfrage: Bildung sieht sie gar nicht → kein Recht
    const p = verschluessele({ name: 'Testperson Kontakt' });
    const [kontakt] = await db
      .insert(schema.eingang)
      .values({ art: 'kontakt', datenVerschluesselt: p.daten, schluesselId: p.schluesselId })
      .returning({ id: schema.eingang.id });
    await expect(lernendeAktionen.aufnehmen(formular({ id: kontakt.id }))).rejects.toThrow('KEIN_RECHT');
    await alsVerwaltung(['administration']);
    expect(await umleitung(lernendeAktionen.aufnehmen(formular({ id: kontakt.id })))).toBe(
      `/verwaltung/eingaenge/${kontakt.id}?aufnahme=keineVoranmeldung`,
    );
  });
});

/** Einladungsmail zu einer bestimmten Lernenden (gleiche Adresse kann mehrere Einladungen haben). */
async function tokenAusMail2(email: string, lernendeId: string): Promise<{ token: string }> {
  const [e] = await db
    .select()
    .from(schema.einladung)
    .where(and(eq(schema.einladung.email, email), eq(schema.einladung.lernendeId, lernendeId)));
  const { sha256 } = await import('@/lib/krypto');
  const mails = await db.select().from(schema.mailAusgang).where(eq(schema.mailAusgang.vorlage, 'konto-einladung'));
  for (const m of mails) {
    const inhalt = entschluessele<{ an: string; daten: Record<string, string> }>(m.datenVerschluesselt, m.schluesselId);
    const token = inhalt.daten.link.split('/').at(-1)!;
    if (inhalt.an === email && sha256(token) === e.tokenHash) return { token };
  }
  throw new Error('keine passende Mail');
}

describe('Einladung „Schüler ab 16“', () => {
  it('nur mit Lerndatensatz ab 16; die Annahme verknüpft das Konto mit dem Lerndatensatz', async () => {
    await alsVerwaltung(['bildung']);
    const v = verschluessele({ vorname: 'Testjugend', nachname: 'Beispiel' });
    const [jung, alt] = await db
      .insert(schema.lernende)
      .values([
        { datenVerschluesselt: v.daten, schluesselId: v.schluesselId, anzeigename: 'Testjung B.', sechzehnAm: '2030-01-01' },
        { datenVerschluesselt: v.daten, schluesselId: v.schluesselId, anzeigename: 'Testjugend B.', sechzehnAm: '2025-01-01' },
      ])
      .returning({ id: schema.lernende.id });
    const email = 'testperson.jugend@example.test';
    const fd = (lernendeId: string) =>
      formular({ name: 'Testjugend Beispiel', email, art: 'schueler', lernendeId, sprache: 'de', gueltigTage: '7' });
    expect(await kontenAktionen.gemeindeEinladen({}, fd(jung.id))).toMatchObject({
      fehler: 'pruefen',
      feldFehler: { lernendeId: 'unter16' },
    });
    const r = await kontenAktionen.gemeindeEinladen({}, fd(alt.id));
    // S2/S3: Mit Bezug auf Lernende geht der Link nur per Mail an die eingeladene Adresse, nie an die Verwaltung
    expect(r).toEqual({ ok: true });
    expect(await kontenAktionen.gemeindeEinladen({}, fd(alt.id))).toEqual({ ok: true, vorhanden: true });

    api.getSession = echteSitzung;
    const mail = (await db.select().from(schema.mailAusgang).where(eq(schema.mailAusgang.vorlage, 'konto-einladung')))
      .map((m) => entschluessele<{ an: string; daten: { link: string } }>(m.datenVerschluesselt, m.schluesselId))
      .find((m) => m.an === email)!;
    expect(mail.daten.link).toMatch(/\/einladung\/[A-Za-z0-9_-]{40,}$/);
    const token = mail.daten.link.split('/').at(-1)!;
    await umleitung(
      kontoAktionen.gemeindeEinladungAnnehmen({}, formular({ token, passwort: PASSWORT, wiederholung: PASSWORT, einwilligung: 'ja' })),
    );
    const [u] = await db.select().from(schema.user).where(eq(schema.user.email, email));
    const [l] = await db.select().from(schema.lernende).where(eq(schema.lernende.id, alt.id));
    expect(l.benutzerId).toBe(u.id);
  });
});
