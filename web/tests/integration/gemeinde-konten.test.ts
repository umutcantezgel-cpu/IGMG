import { randomBytes, randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { schema } from '@/lib/db';
import { entschluessele, verschluessele } from '@/lib/krypto';
import type { RollenZuweisung } from '@/lib/rechte/matrix';
import { angemeldetAls, formular, verwaltungsUmgebung } from './hilfen/verwaltung';

/**
 * Verwaltung „Gemeinde-Konten“ (H-L05): Sperren beendet alle Sitzungen sofort (S-18), Kontoarten ändern (ohne Lehrkraft
 * endet die Leitung, Kinderkonten nur „schueler“), „Jetzt löschen“ erst nach Frist und vollständig (Chat nur als
 * „entfernt“), täglicher Löschlauf (Löschanträge nach Frist, unbestätigte Registrierungen nach 7 Tagen), Schutz von
 * Verwaltungskonten und Rechte-Negativtests. Testdaten fiktiv (G-04).
 */
const { client, db } = await verwaltungsUmgebung();
const aktionen = await import('@/server/actions/gemeinde-konten');
const { kontenLoeschlauf, loescheGemeindeKonto } = await import('@/lib/konto/loeschen');
const { ladeGemeindeKonten } = await import('@/server/queries/verwaltung/gemeinde-konten');
const chat = await import('@/lib/chat/dienst');
const loesch = await import('@/app/api/wartung/loeschfristen/route');
afterAll(() => client.close());
afterEach(() => {
  delete process.env.FUNKTION_KONTEN;
});

const BILDUNG: RollenZuweisung[] = [{ rolle: 'bildung' }];
const TAG = 86_400_000;

async function ziel(aufruf: Promise<unknown>): Promise<string> {
  const e: unknown = await aufruf.then(
    () => null,
    (x: unknown) => x,
  );
  return (e as { ziel?: string } | null)?.ziel ?? `kein redirect: ${String(e)}`;
}

type KontoOpt = {
  rollen?: ('gemeinde' | 'eltern' | 'lehrkraft' | 'schueler')[];
  kind?: boolean;
  bestaetigt?: boolean;
  seitTagen?: number;
  loeschenAb?: Date | null;
  verwaltung?: boolean;
};

async function konto(name: string, o: KontoOpt = {}): Promise<string> {
  const id = randomUUID();
  const kind = o.kind ?? false;
  await db.insert(schema.user).values({
    id,
    name,
    email: kind ? `k-${randomBytes(10).toString('hex')}@konto.invalid` : `testperson.${id.slice(0, 8)}@example.test`,
    username: kind ? `kind.${id.slice(0, 6)}` : null,
    displayUsername: kind ? `kind.${id.slice(0, 6)}` : null,
    emailVerified: o.bestaetigt ?? !kind,
    createdAt: new Date(Date.now() - (o.seitTagen ?? 0) * TAG),
  });
  await db.insert(schema.kontoProfil).values({ benutzerId: id, anzeigename: name, istKind: kind, loeschenAb: o.loeschenAb ?? null });
  if (o.rollen?.length) await db.insert(schema.gemeindeRolle).values(o.rollen.map((rolle) => ({ benutzerId: id, rolle })));
  if (o.verwaltung) await db.insert(schema.rolleZuweisung).values({ benutzerId: id, rolle: 'redaktion' });
  return id;
}

async function sitzungen(benutzerId: string, anzahl = 2): Promise<void> {
  for (let i = 0; i < anzahl; i++)
    await db.insert(schema.session).values({
      id: randomUUID(),
      token: randomBytes(16).toString('hex'),
      userId: benutzerId,
      expiresAt: new Date(Date.now() + 30 * TAG),
      updatedAt: new Date(),
    });
}
const sitzungenVon = (id: string) => db.select().from(schema.session).where(eq(schema.session.userId, id));
const kontoDa = async (id: string) => (await db.select().from(schema.user).where(eq(schema.user.id, id))).length === 1;

describe('Sperren (S-18)', () => {
  it('beendet alle Sitzungen sofort, Passwort-Links verfallen; Entsperren erlaubt neue Anmeldung', async () => {
    await angemeldetAls(BILDUNG);
    const id = await konto('Testperson Gesperrt', { rollen: ['gemeinde', 'eltern'] });
    await sitzungen(id, 3);
    await db
      .insert(schema.verification)
      .values({ id: randomUUID(), identifier: `reset-password:${randomUUID()}`, value: id, expiresAt: new Date(Date.now() + TAG) });
    expect(await sitzungenVon(id)).toHaveLength(3);

    expect(await ziel(aktionen.gemeindeKontoSperren(formular({ id })))).toBe(`/verwaltung/gemeinde-konten/${id}?meldung=gesperrt`);
    expect(await sitzungenVon(id)).toHaveLength(0);
    expect(await db.select().from(schema.verification).where(eq(schema.verification.value, id))).toHaveLength(0);
    const [u] = await db.select().from(schema.user).where(eq(schema.user.id, id));
    expect(u.gesperrtAm).not.toBeNull();
    const audit = await db.select().from(schema.auditEintrag).where(eq(schema.auditEintrag.aktion, 'gemeindekonto.gesperrt'));
    expect(audit.map((a) => a.zielId)).toContain(id);

    expect(await ziel(aktionen.gemeindeKontoEntsperren(formular({ id })))).toBe(`/verwaltung/gemeinde-konten/${id}?meldung=entsperrt`);
    expect((await db.select().from(schema.user).where(eq(schema.user.id, id)))[0].gesperrtAm).toBeNull();
  });

  it('Verwaltungskonten und das eigene Konto sperrt man hier nicht', async () => {
    const selbst = await angemeldetAls(BILDUNG);
    await db.insert(schema.kontoProfil).values({ benutzerId: selbst!, anzeigename: 'Testperson E.' });
    const verwaltung = await konto('Testperson Redaktion', { rollen: ['gemeinde'], verwaltung: true });
    await sitzungen(verwaltung, 1);
    expect(await ziel(aktionen.gemeindeKontoSperren(formular({ id: verwaltung })))).toBe(
      `/verwaltung/gemeinde-konten/${verwaltung}?fehler=verwaltungskonto`,
    );
    expect(await sitzungenVon(verwaltung)).toHaveLength(1);
    expect(await ziel(aktionen.gemeindeKontoSperren(formular({ id: selbst! })))).toBe(
      `/verwaltung/gemeinde-konten/${selbst}?fehler=selbst`,
    );
  });
});

describe('Kontoarten', () => {
  it('ohne „lehrkraft“ endet die Gruppenleitung; Kinderkonten nur „schueler“', async () => {
    await angemeldetAls(BILDUNG);
    const hoca = await konto('Testperson Hoca', { rollen: ['gemeinde', 'lehrkraft'] });
    const [g] = await db
      .insert(schema.gruppe)
      .values({ name: { de: 'Testgruppe Leitung' } })
      .returning({ id: schema.gruppe.id });
    await db.insert(schema.gruppenLeitung).values({ gruppeId: g.id, benutzerId: hoca, rolle: 'lehrkraft' });
    expect(await ziel(aktionen.gemeindeRollenSpeichern(formular({ id: hoca, rollen: ['gemeinde', 'eltern'] })))).toBe(
      `/verwaltung/gemeinde-konten/${hoca}?meldung=rollen`,
    );
    const rollen = await db
      .select({ r: schema.gemeindeRolle.rolle })
      .from(schema.gemeindeRolle)
      .where(eq(schema.gemeindeRolle.benutzerId, hoca));
    expect(rollen.map((x) => x.r).sort()).toEqual(['eltern', 'gemeinde']);
    expect(await db.select().from(schema.gruppenLeitung).where(eq(schema.gruppenLeitung.benutzerId, hoca))).toHaveLength(0);

    const kind = await konto('Testkind K.', { rollen: ['schueler'], kind: true });
    expect(await ziel(aktionen.gemeindeRollenSpeichern(formular({ id: kind, rollen: ['schueler', 'eltern'] })))).toBe(
      `/verwaltung/gemeinde-konten/${kind}?fehler=kindRollen`,
    );
    const liste = await ladeGemeindeKonten(
      { rolle: 'schueler', zustand: 'alle' },
      { benutzerId: 'leser', name: '', email: '', rollen: BILDUNG, zweiFaktorErfuellt: true },
    );
    const z = liste.find((k) => k.id === kind)!;
    // Kinderkonten zeigen den Benutzernamen, nie die synthetische Adresse
    expect(z.kennung).toMatch(/^kind\./);
    expect(z.istKind).toBe(true);
  });
});

describe('Löschen', () => {
  async function chatNachricht(absenderId: string): Promise<number> {
    const [g] = await db
      .insert(schema.gruppe)
      .values({ name: { de: 'Testgruppe Chat' } })
      .returning({ id: schema.gruppe.id });
    const kanal = (await chat.kanaeleDerGruppe(g.id)).gruppe;
    const t = verschluessele('Hallo zusammen [Testnachricht]');
    const [n] = await db
      .insert(schema.chatNachricht)
      .values({ kanalId: kanal, absenderId, textVerschluesselt: t.daten, schluesselId: t.schluesselId })
      .returning({ id: schema.chatNachricht.id });
    return n.id;
  }

  it('„Jetzt löschen“ erst nach Frist; dann vollständig: Sitzungen, Profil, Rollen, Einwilligungen, Push, Bezüge; Chat nur „entfernt“', async () => {
    const akteur = await angemeldetAls(BILDUNG);
    const id = await konto('Testperson Löschen', { rollen: ['gemeinde', 'eltern'], loeschenAb: new Date(Date.now() + 5 * TAG) });
    await sitzungen(id, 2);
    const v = verschluessele({ vorname: 'Testkind' });
    const [l] = await db
      .insert(schema.lernende)
      .values({ datenVerschluesselt: v.daten, schluesselId: v.schluesselId, anzeigename: 'Testkind L.' })
      .returning({ id: schema.lernende.id });
    await db.insert(schema.elternKind).values({ elternId: id, lernendeId: l.id });
    await db.insert(schema.kontoEinwilligung).values({ benutzerId: id, art: 'konto', textVersion: 'v1', erteiltVon: id });
    const ep = verschluessele('https://push.example.test/abo');
    await db.insert(schema.pushAbo).values({
      benutzerId: id,
      endpointVerschluesselt: ep.daten,
      schluesselId: ep.schluesselId,
      endpointHmac: randomBytes(16).toString('hex'),
      p256dh: 'x',
      auth: 'y',
      einwilligungVersion: 'v1',
    });
    const nachricht = await chatNachricht(id);

    expect(await ziel(aktionen.gemeindeKontoJetztLoeschen(formular({ id })))).toBe(`/verwaltung/gemeinde-konten/${id}?fehler=fristLaeuft`);
    expect(await kontoDa(id)).toBe(true);

    await db
      .update(schema.kontoProfil)
      .set({ loeschenAb: new Date(Date.now() - TAG) })
      .where(eq(schema.kontoProfil.benutzerId, id));
    expect(await ziel(aktionen.gemeindeKontoJetztLoeschen(formular({ id })))).toBe('/verwaltung/gemeinde-konten?meldung=geloescht');
    expect(await kontoDa(id)).toBe(false);
    expect(await sitzungenVon(id)).toHaveLength(0);
    expect(await db.select().from(schema.kontoProfil).where(eq(schema.kontoProfil.benutzerId, id))).toHaveLength(0);
    expect(await db.select().from(schema.gemeindeRolle).where(eq(schema.gemeindeRolle.benutzerId, id))).toHaveLength(0);
    expect(await db.select().from(schema.kontoEinwilligung).where(eq(schema.kontoEinwilligung.benutzerId, id))).toHaveLength(0);
    expect(await db.select().from(schema.pushAbo).where(eq(schema.pushAbo.benutzerId, id))).toHaveLength(0);
    expect(await db.select().from(schema.elternKind).where(eq(schema.elternKind.elternId, id))).toHaveLength(0);
    // Lerndatensatz des Kindes bleibt
    expect(await db.select().from(schema.lernende).where(eq(schema.lernende.id, l.id))).toHaveLength(1);
    const [n] = await db.select().from(schema.chatNachricht).where(eq(schema.chatNachricht.id, nachricht));
    expect(n).toMatchObject({ absenderId: null, entferntGrund: 'Konto gelöscht', entferntVon: akteur });
    expect(entschluessele<string>(n.textVerschluesselt, n.schluesselId)).toBe('');
    const audit = await db.select().from(schema.auditEintrag).where(eq(schema.auditEintrag.aktion, 'gemeindekonto.geloescht'));
    expect(audit.find((a) => a.zielId === id)?.details).toEqual({ anlass: 'verwaltung', nachrichten: 1 });
  });

  it('Verwaltungskonten löscht nur „Benutzer und Rollen“', async () => {
    const id = await konto('Testperson Redaktion Löschen', {
      rollen: ['gemeinde'],
      verwaltung: true,
      loeschenAb: new Date(Date.now() - TAG),
    });
    expect(await loescheGemeindeKonto(id, { akteurId: null, anlass: 'frist' })).toEqual({ ok: false, fehler: 'verwaltungskonto' });
    expect(await kontoDa(id)).toBe(true);
  });

  it('Löschlauf: Anträge nach Frist, unbestätigte Registrierungen nach 7 Tagen; Kinder, Verwaltung und Frische bleiben', async () => {
    const faellig = await konto('Testperson Frist', { rollen: ['gemeinde'], loeschenAb: new Date(Date.now() - TAG) });
    const laeuft = await konto('Testperson Frist läuft', { rollen: ['gemeinde'], loeschenAb: new Date(Date.now() + TAG) });
    const verwaltung = await konto('Testperson Frist Verwaltung', {
      rollen: ['gemeinde'],
      verwaltung: true,
      loeschenAb: new Date(Date.now() - TAG),
    });
    const unbestaetigtAlt = await konto('Testperson Unbestätigt', { bestaetigt: false, seitTagen: 8 });
    const unbestaetigtNeu = await konto('Testperson Unbestätigt neu', { bestaetigt: false, seitTagen: 2 });
    const kind = await konto('Testkind Alt', { kind: true, rollen: ['schueler'], seitTagen: 30 });
    await sitzungen(faellig, 1);

    const r = await kontenLoeschlauf();
    expect(r.geloeschteKonten).toBeGreaterThanOrEqual(1);
    expect(r.geloeschteUnbestaetigteKonten).toBeGreaterThanOrEqual(1);
    expect(await kontoDa(faellig)).toBe(false);
    expect(await kontoDa(unbestaetigtAlt)).toBe(false);
    expect(await kontoDa(laeuft)).toBe(true);
    expect(await kontoDa(verwaltung)).toBe(true);
    expect(await kontoDa(unbestaetigtNeu)).toBe(true);
    expect(await kontoDa(kind)).toBe(true);
    const audit = await db.select().from(schema.auditEintrag).where(eq(schema.auditEintrag.aktion, 'gemeindekonto.geloescht'));
    expect(audit.find((a) => a.zielId === faellig)).toMatchObject({ benutzerId: null, details: { anlass: 'frist', nachrichten: 0 } });
    expect(audit.find((a) => a.zielId === unbestaetigtAlt)?.details).toMatchObject({ anlass: 'unbestaetigt' });
    // Idempotent: ein zweiter Lauf findet nichts mehr
    expect(await kontenLoeschlauf()).toEqual({ geloeschteKonten: 0, geloeschteUnbestaetigteKonten: 0 });
  });

  describe('im Cron „loeschfristen“', () => {
    const CRON = randomBytes(32).toString('base64');
    const vorher = process.env.CRON_SECRET;
    beforeAll(() => {
      process.env.CRON_SECRET = CRON;
    });
    afterAll(() => {
      if (vorher === undefined) delete process.env.CRON_SECRET;
      else process.env.CRON_SECRET = vorher;
    });
    it('löscht fällige Konten und meldet die Zahlen', async () => {
      const faellig = await konto('Testperson Cron', { rollen: ['gemeinde'], loeschenAb: new Date(Date.now() - TAG) });
      const antwort = await loesch.GET(new Request('https://example.test/api/wartung', { headers: { authorization: `Bearer ${CRON}` } }));
      expect(antwort.status).toBe(200);
      const daten = (await antwort.json()) as Record<string, number>;
      expect(daten.geloeschteKonten).toBe(1);
      expect(daten.geloeschteUnbestaetigteKonten).toBeTypeOf('number');
      expect(await kontoDa(faellig)).toBe(false);
    });
  });
});

describe('Einladen', () => {
  it('Lehrkraft einladen: Einladung mit Gemeinde-Rollen, Mail im Ausgang, zweite gleiche Einladung nicht doppelt', async () => {
    await angemeldetAls(BILDUNG);
    const email = 'testperson.lehrkraft.neu@example.test';
    const fd = formular({
      name: 'Testperson Lehrkraft',
      email: 'TestPerson.Lehrkraft.Neu@example.test',
      art: 'lehrkraft',
      sprache: 'tr',
      gueltigTage: '10',
    });
    const r = await aktionen.gemeindeEinladen({}, fd);
    expect(r).toMatchObject({ ok: true });
    expect(r.link).toMatch(/\/tr\/davet\//);
    const [e] = await db.select().from(schema.einladung).where(eq(schema.einladung.email, email));
    expect(e).toMatchObject({ gemeindeRollen: ['gemeinde', 'lehrkraft'], rollen: [], lernendeId: null });
    const tage = (e.laeuftAb.getTime() - Date.now()) / TAG;
    expect(Math.round(tage)).toBe(10);
    expect(await aktionen.gemeindeEinladen({}, fd)).toEqual({ ok: true, vorhanden: true });
    expect(await db.select().from(schema.einladung).where(eq(schema.einladung.email, email))).toHaveLength(1);
    expect(await aktionen.gemeindeEinladen({}, formular({ name: 'x', email: 'kaputt', art: 'lehrkraft' }))).toMatchObject({
      fehler: 'pruefen',
      feldFehler: { name: 'pflicht', email: 'email' },
    });
    expect(await ziel(aktionen.gemeindeEinladungWiderrufen(formular({ id: e.id })))).toBe(
      '/verwaltung/gemeinde-konten?meldung=widerrufen#einladungen',
    );
    expect((await db.select().from(schema.einladung).where(eq(schema.einladung.id, e.id)))[0].widerrufenAm).not.toBeNull();
  });
});

describe('Rechte und Funktionsschalter', () => {
  const ohneRecht: { name: string; rollen: RollenZuweisung[] }[] = [
    { name: 'Redaktion', rollen: [{ rolle: 'redaktion' }] },
    { name: 'Mitgliederverwaltung (nur lesen)', rollen: [{ rolle: 'mitgliederverwaltung' }] },
    { name: 'Leitung', rollen: [{ rolle: 'leitung' }] },
    { name: 'Kinderschutz', rollen: [{ rolle: 'kinderschutz' }] },
  ];
  it.each(ohneRecht)('$name darf nicht sperren, löschen, Rollen ändern oder einladen', async ({ rollen }) => {
    const id = await konto('Testperson Ziel', { rollen: ['gemeinde'], loeschenAb: new Date(Date.now() - TAG) });
    await sitzungen(id, 1);
    await angemeldetAls(rollen);
    await expect(aktionen.gemeindeKontoSperren(formular({ id }))).rejects.toThrow('KEIN_RECHT');
    await expect(aktionen.gemeindeKontoJetztLoeschen(formular({ id }))).rejects.toThrow('KEIN_RECHT');
    await expect(aktionen.gemeindeRollenSpeichern(formular({ id, rollen: ['lehrkraft'] }))).rejects.toThrow('KEIN_RECHT');
    expect(
      await aktionen.gemeindeEinladen({}, formular({ name: 'Testperson X', email: 'testperson.x@example.test', art: 'lehrkraft' })),
    ).toEqual({
      fehler: 'keinRecht',
    });
    expect(await kontoDa(id)).toBe(true);
    expect(await sitzungenVon(id)).toHaveLength(1);
  });

  it('Bildung ohne zweiten Faktor und mit Schalter „konten“ aus: abgelehnt', async () => {
    const id = await konto('Testperson Ziel 2', { rollen: ['gemeinde'] });
    await angemeldetAls(BILDUNG, false);
    await expect(aktionen.gemeindeKontoSperren(formular({ id }))).rejects.toThrow('KEIN_RECHT');
    await angemeldetAls(BILDUNG);
    process.env.FUNKTION_KONTEN = 'aus';
    await expect(aktionen.gemeindeKontoSperren(formular({ id }))).rejects.toThrow('KEIN_RECHT');
  });
});
