import { randomUUID } from 'node:crypto';
import { deriveKey } from 'altcha-lib/algorithms/pbkdf2';
import { solveChallenge } from 'altcha-lib';
import { and, eq } from 'drizzle-orm';
import { afterAll, describe, expect, it, vi } from 'vitest';
import { schema } from '@/lib/db';
import { berlinerDatum } from '@/lib/gebetszeiten/naechstes';
import { entschluessele } from '@/lib/krypto';
import { tagPlus } from '@/lib/lernen/termine';
import { formular, kontoUmgebung, umleitung } from './hilfen/konto';

/**
 * Lernkette als Integrationstest (Z-17; Ersatz für die E2E-Lernkette, die eine eigene Docker-Datenbank braucht): EIN
 * durchgehender Ablauf auf EINER PGlite-Datenbank mit echtem Better Auth, nur über die Server Actions und Abfragen, die
 * die Oberflächen benutzen: Voranmeldung (öffentliches Formular mit ALTCHA) → Aufnahme (Bildung) → Eltern nehmen die
 * Einladung an → Einwilligung und Kinderzugang → Kind meldet sich an und sieht seine Gruppe → Lehrkraft erfasst
 * Anwesenheit → Fortschritt → Eltern und Kind sehen beides. Übernommen aus der Stufe-C-Prüfung (k2), Testdaten fiktiv
 * (G-04).
 */
// Übersetzer der Formular-Action: Schlüssel in Klammern (wie in formular-voranmeldung.test.ts)
vi.mock('next-intl/server', () => ({ getTranslations: async () => (k: string) => `[${k}]`, getLocale: async () => 'de' }));

const { client, db } = await kontoUmgebung();
const { auth } = await import('@/lib/auth/server');
const { sendeVoranmeldung } = await import('@/server/actions/formulare/voranmeldung');
const { neueChallenge } = await import('@/lib/validierung/altcha');
const gruppenAktionen = await import('@/server/actions/gruppen');
const lernendeAktionen = await import('@/server/actions/lernende');
const kontoAktionen = await import('@/server/actions/konto');
const kinderAktionen = await import('@/server/actions/kinder');
const unterrichtAktionen = await import('@/server/actions/unterricht');
const { ladeGruppenKontext } = await import('@/lib/rechte/gemeinde');
const lernen = await import('@/lib/lernen/dienst');
const unterricht = await import('@/server/queries/mein-bereich/unterricht');
const kinder = await import('@/server/queries/mein-bereich/kinder');
const gruppeQ = await import('@/server/queries/mein-bereich/gruppe');
afterAll(() => client.close());

const api = auth.api as unknown as Record<string, unknown>;
const echteSitzung = api.getSession;
const PASSWORT = 'Ein-langes-Testpasswort-2026';
const heute = berlinerDatum(new Date());
type P = { id: string; name: string; email: string; twoFactorEnabled: boolean };
const als = (p: P) => {
  api.getSession = async () => ({ user: { ...p, gesperrtAm: null }, session: { id: `s-${p.id}`, createdAt: new Date(), userId: p.id } });
};
const elternEmail = `testperson.kette.${randomUUID().slice(0, 6)}@example.test`;
const s = {} as {
  eingang: string;
  gruppe: string;
  lernende: string;
  eltern: P;
  lehrkraft: P;
  bildung: P;
  kind: P;
  stufe: string;
  termin: string;
};

async function altcha(): Promise<string> {
  const challenge = await neueChallenge();
  const solution = await solveChallenge({ challenge, deriveKey });
  return Buffer.from(JSON.stringify({ challenge, solution })).toString('base64');
}

describe('Lernkette Voranmeldung → Aufnahme → Eltern → Kind → Gruppe → Anwesenheit → Fortschritt', () => {
  it('1 Voranmeldung über das öffentliche Formular (ALTCHA, verschlüsselt)', async () => {
    const r = await sendeVoranmeldung(
      null,
      formular({
        sprache: 'de',
        klasse: 'grundkurs',
        geschlecht: 'weiblich',
        vorname: 'Testkind',
        nachname: 'Kette',
        geburtsdatum: '2015-04-02',
        strasse: '[Straße 1]',
        plz: '35578',
        ort: 'Wetzlar',
        eltern1Name: 'Testperson Mutter',
        eltern1Telefon: '0123 456',
        eltern1Email: elternEmail,
        eltern2Name: '',
        eltern2Telefon: '',
        eltern2Email: '',
        geschwister: '',
        ausgefuelltVon: 'Testperson Mutter',
        einwilligungKontakt: 'ja',
        einwilligungDatenschutz: 'ja',
        schritt: '3',
        altcha: await altcha(),
      }),
    );
    expect(r.status).toBe('erfolg');
    const [e] = await db.select().from(schema.eingang).where(eq(schema.eingang.art, 'voranmeldung'));
    expect(e.datenVerschluesselt.toString('utf8')).not.toContain('Testkind');
    s.eingang = e.id;
  });

  it('2 Bildung legt Gruppe, Leitung, Termine an und nimmt die Voranmeldung auf (Eltern-Einladung)', async () => {
    const bid = randomUUID();
    s.bildung = { id: bid, name: 'Testperson Bildung', email: `bildung.${bid.slice(0, 6)}@example.test`, twoFactorEnabled: true };
    await db.insert(schema.user).values({ ...s.bildung, emailVerified: true });
    await db.insert(schema.rolleZuweisung).values({ benutzerId: bid, rolle: 'bildung' });
    const lk = await auth.api.signUpEmail({
      body: { email: `hoca.${bid.slice(0, 6)}@example.test`, password: PASSWORT, name: 'Hoca Kette' },
    });
    await db.update(schema.user).set({ emailVerified: true, twoFactorEnabled: true }).where(eq(schema.user.id, lk.user.id));
    await db.insert(schema.kontoProfil).values({ benutzerId: lk.user.id, anzeigename: 'Hoca Kette', istKind: false });
    await db.insert(schema.gemeindeRolle).values({ benutzerId: lk.user.id, rolle: 'lehrkraft' });
    s.lehrkraft = { id: lk.user.id, name: 'Hoca Kette', email: lk.user.email, twoFactorEnabled: true };

    als(s.bildung);
    const fd = formular({
      nameDe: 'Grundkurs [Kette]',
      kursart: 'elifbe',
      chatModus: 'aus',
      chatMindestalter: '10',
      chatVon: '08:00',
      chatBis: '20:00',
      status: 'aktiv',
      uhrzeitVon: '10:00',
      uhrzeitBis: '12:00',
    });
    for (const t of ['0', '1', '2', '3', '4', '5', '6']) fd.append('wochentage', t);
    const ziel = await umleitung(gruppenAktionen.speichereGruppe({}, fd));
    expect(ziel).toMatch(/^\/verwaltung\/gruppen\/[0-9a-f-]{36}\?meldung=angelegt$/);
    s.gruppe = ziel!.split('/')[3].split('?')[0];
    expect(
      await umleitung(gruppenAktionen.leitungZuweisen(formular({ gruppeId: s.gruppe, benutzerId: s.lehrkraft.id, rolle: 'lehrkraft' }))),
    ).toContain('meldung=leitung');
    expect(await umleitung(gruppenAktionen.termineAnlegen(formular({ gruppeId: s.gruppe, von: heute, bis: tagPlus(heute, 7) })))).toContain(
      'meldung=termine',
    );
    // Lehrplan-Stufe (Setup wie in tests/integration/lernen.test.ts)
    const [st] = await db
      .insert(schema.lehrplanStufe)
      .values({ kursart: 'elifbe', reihenfolge: 1, titel: { de: 'Stufe 1 [Kette]' } })
      .returning({ id: schema.lehrplanStufe.id });
    s.stufe = st.id;

    expect(await umleitung(lernendeAktionen.aufnehmen(formular({ id: s.eingang, gruppeId: s.gruppe, eltern1: 'ja' })))).toBe(
      `/verwaltung/eingaenge/${s.eingang}?aufnahme=angelegt&einladungen=1#aufnahme`,
    );
    const [l] = await db.select().from(schema.lernende).where(eq(schema.lernende.eingangId, s.eingang));
    expect(l).toMatchObject({ anzeigename: 'Testkind K.', status: 'aktiv' });
    s.lernende = l.id;
    expect(await db.select().from(schema.gruppenMitglied).where(eq(schema.gruppenMitglied.lernendeId, l.id))).toHaveLength(1);
  });

  it('3 Eltern nehmen die Einladung an (Token aus der Mail) → Eltern-Kind-Bezug', async () => {
    let token = '';
    for (const m of await db.select().from(schema.mailAusgang).where(eq(schema.mailAusgang.vorlage, 'konto-einladung'))) {
      const inhalt = entschluessele<{ an: string; daten: Record<string, string> }>(m.datenVerschluesselt, m.schluesselId);
      if (inhalt.an === elternEmail) token = inhalt.daten.link.split('/').at(-1)!;
    }
    expect(token.length).toBeGreaterThan(40);
    api.getSession = echteSitzung;
    expect(
      await umleitung(
        kontoAktionen.gemeindeEinladungAnnehmen(
          {},
          formular({ token, passwort: PASSWORT, wiederholung: PASSWORT, einwilligung: 'ja', sprache: 'de' }),
        ),
      ),
    ).toBe('/anmelden?hinweis=eingeladen');
    const [u] = await db.select().from(schema.user).where(eq(schema.user.email, elternEmail));
    s.eltern = { id: u.id, name: u.name, email: u.email, twoFactorEnabled: false };
    const [b] = await db.select().from(schema.elternKind).where(eq(schema.elternKind.elternId, u.id));
    expect(b).toMatchObject({ lernendeId: s.lernende });
    expect(b.bestaetigtAm).not.toBeNull();
    als(s.eltern);
    const liste = await kinder.kinderDerEltern(await ladeGruppenKontext(u.id), heute);
    expect(liste.map((k) => k.id)).toEqual([s.lernende]);
  });

  it('4 Eltern erteilen die Einwilligung „Kinderzugang“ und legen den Zugang an; das Kind meldet sich an', async () => {
    als(s.eltern);
    expect(
      await umleitung(
        kinderAktionen.einwilligungAendern(
          formular({ sprache: 'de', lernendeId: s.lernende, art: 'kinderkonto', aktion: 'erteilen', einvernehmen: 'ja' }),
        ),
      ),
    ).toContain('ok=erteilt');
    expect(
      await kinderAktionen.kinderzugangAnlegen(
        {},
        formular({ lernendeId: s.lernende, benutzername: 'kind.kette', passwort: PASSWORT, sprache: 'de' }),
      ),
    ).toMatchObject({ ok: 'angelegt', benutzername: 'kind.kette' });
    const [l] = await db.select().from(schema.lernende).where(eq(schema.lernende.id, s.lernende));
    expect(l.benutzerId).not.toBeNull();
    api.getSession = echteSitzung;
    expect(
      await umleitung(kontoAktionen.kinderAnmelden({}, formular({ benutzername: 'kind.kette', passwort: PASSWORT, sprache: 'de' }))),
    ).toBe('/mein-bereich');
    expect(await db.select().from(schema.session).where(eq(schema.session.userId, l.benutzerId!))).toHaveLength(1);
    s.kind = { id: l.benutzerId!, name: 'Testkind K.', email: 'x@konto.invalid', twoFactorEnabled: false };
  });

  it('5 Gruppe: Kind sieht seine Gruppe, Lehrkraft sieht die Gruppe mit dem Kind', async () => {
    const kk = await ladeGruppenKontext(s.kind.id);
    expect(kk.eigeneLernendeId).toBe(s.lernende);
    expect([...kk.eigeneGruppen]).toEqual([s.gruppe]);
    const meine = await gruppeQ.meineGruppen(kk, heute);
    expect(JSON.stringify(meine)).toContain(s.gruppe);
    const lk = await ladeGruppenKontext(s.lehrkraft.id);
    const g = await unterricht.gruppeFuerLeitung(s.gruppe, lk, heute);
    expect(JSON.stringify(g)).toContain('Testkind K.');
  });

  it('6 Anwesenheit: Eltern melden morgen ab (vorbelegt), Lehrkraft erfasst heute „anwesend“; Eltern und Kind sehen es', async () => {
    als(s.eltern);
    expect(await unterrichtAktionen.meldeKindFehlend({ lernendeId: s.lernende, datum: tagPlus(heute, 1), grund: 'krank' })).toMatchObject({
      ok: true,
    });
    const lk = await ladeGruppenKontext(s.lehrkraft.id);
    const termine = await lernen.termineDerLeitung(lk, heute, tagPlus(heute, 1));
    const tHeute = termine.find((t) => t.datum === heute)!;
    const tMorgen = termine.find((t) => t.datum === tagPlus(heute, 1))!;
    expect((await lernen.anwesenheitsListe(tMorgen.id, lk))!.zeilen.map((z) => z.status)).toEqual(['entschuldigt']);
    als(s.lehrkraft);
    expect(
      await unterrichtAktionen.speichereAnwesenheit({ terminId: tHeute.id, eintraege: [{ lernendeId: s.lernende, status: 'anwesend' }] }),
    ).toEqual({ ok: true, wert: 1 });
    // Fremde (Eltern) dürfen nicht erfassen
    als(s.eltern);
    expect(
      await unterrichtAktionen.speichereAnwesenheit({ terminId: tHeute.id, eintraege: [{ lernendeId: s.lernende, status: 'fehlt' }] }),
    ).toEqual({ ok: false });
    const sicht = await lernen.lernendenUebersicht(s.lernende, await ladeGruppenKontext(s.eltern.id));
    expect(sicht.anwesenheit).toEqual([{ datum: heute, status: 'anwesend' }]);
    expect(sicht.fehlmeldungen.map((f) => f.datum)).toEqual([tagPlus(heute, 1)]);
    const eigen = await lernen.lernendenUebersicht(s.lernende, await ladeGruppenKontext(s.kind.id));
    expect(eigen.anwesenheit).toHaveLength(1);
  });

  it('7 Fortschritt: Lehrkraft setzt „sicher“; Eltern und Kind sehen die Stufe; Aufsicht/Eltern dürfen nicht setzen', async () => {
    als(s.lehrkraft);
    expect(
      await unterrichtAktionen.speichereFortschritt({ gruppeId: s.gruppe, lernendeId: s.lernende, stufeId: s.stufe, status: 'sicher' }),
    ).toEqual({ ok: true, wert: true });
    als(s.eltern);
    expect(
      await unterrichtAktionen.speichereFortschritt({
        gruppeId: s.gruppe,
        lernendeId: s.lernende,
        stufeId: s.stufe,
        status: 'abgeschlossen',
      }),
    ).toEqual({ ok: false });
    const sicht = await lernen.lernendenUebersicht(s.lernende, await ladeGruppenKontext(s.eltern.id));
    expect(sicht.fortschritt).toMatchObject([{ status: 'sicher', kursart: 'elifbe', reihenfolge: 1 }]);
    const weg = await gruppeQ.lernwegVon(s.lernende, await ladeGruppenKontext(s.kind.id));
    expect(JSON.stringify(weg)).toContain('sicher');
    const [f] = await db
      .select()
      .from(schema.lernfortschritt)
      .where(and(eq(schema.lernfortschritt.lernendeId, s.lernende), eq(schema.lernfortschritt.stufeId, s.stufe)));
    expect(f.status).toBe('sicher');
  });
});
