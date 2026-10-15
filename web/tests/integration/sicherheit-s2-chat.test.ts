import { randomUUID } from 'node:crypto';
import { and, eq, isNull } from 'drizzle-orm';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { schema } from '@/lib/db';
import { verschluessele, entschluessele } from '@/lib/krypto';
import { formular, kontoUmgebung, nachher, umleitung } from './hilfen/konto';

/**
 * Regressionstests der Sicherheitsprüfung S2 (Linse S2a, Chat und Kinderschutz) gegen PGlite mit echtem Better Auth:
 * - S2a-1 archivierte Gruppe: weder Lesen noch Schreiben – über Dienst, Abruf-Route und Server Action
 * - S2a-2 Pause der Rolle kinderschutz hebt die Gruppenleitung nicht auf; Fortsetzen durch die Leitung meldet kinderschutz
 * - S2a-3 Ratengrenze S-13 auch bei parallelen Anfragen
 * - S2a-5 Meldung gegen die Leitung bleibt nach dem Löschlauf vor ihr verborgen (D-02)
 * - S2a-7 die Leitung entfernt eigene Nachrichten nicht selbst („senden und löschen“)
 * Testdaten fiktiv (G-04).
 */
const { client, db } = await kontoUmgebung();
const { auth } = await import('@/lib/auth/server');
const dienst = await import('@/lib/chat/dienst');
const { ladeGruppenKontext } = await import('@/lib/rechte/gemeinde');
const unterricht = await import('@/server/queries/mein-bereich/unterricht');
const chatAktionen = await import('@/server/actions/chat');
const lehrkraftAktionen = await import('@/server/actions/lehrkraft');
const route = await import('@/app/api/mein/chat/[kanal]/route');
afterAll(() => client.close());

const api = auth.api as unknown as Record<string, unknown>;
const echteSitzung = api.getSession;
afterEach(() => {
  api.getSession = echteSitzung;
  nachher.length = 0;
});

type Rolle = (typeof schema.gemeindeRolleEnum.enumValues)[number];
type Person = { id: string; name: string; email: string; twoFactorEnabled: boolean };

async function person(name: string, rollen: Rolle[], kind = false): Promise<Person> {
  const id = randomUUID();
  const email = `${id.slice(0, 8)}@${kind ? 'konto.invalid' : 'example.test'}`;
  const zweiFaktor = rollen.includes('lehrkraft');
  await db.insert(schema.user).values({ id, name, email, emailVerified: true, twoFactorEnabled: zweiFaktor });
  await db.insert(schema.kontoProfil).values({ benutzerId: id, anzeigename: name, istKind: kind });
  if (rollen.length) await db.insert(schema.gemeindeRolle).values(rollen.map((rolle) => ({ benutzerId: id, rolle })));
  await dienst.bestaetigeRegeln(id);
  return { id, name, email, twoFactorEnabled: zweiFaktor };
}

function als(p: Person) {
  api.getSession = async () => ({ user: { ...p, gesperrtAm: null }, session: { id: `s-${p.id}`, createdAt: new Date(), userId: p.id } });
}

async function gruppeMitLeitung(name: string) {
  const [g] = await db
    .insert(schema.gruppe)
    .values({ name: { de: name }, chatModus: 'offen', chatVon: '00:00', chatBis: '23:59', chatMindestalter: 10 })
    .returning({ id: schema.gruppe.id });
  const hoca = await person(`Hoca ${name}`, ['lehrkraft']);
  const aufsicht = await person(`Aufsicht ${name}`, ['lehrkraft']);
  await db.insert(schema.gruppenLeitung).values([
    { gruppeId: g.id, benutzerId: hoca.id, rolle: 'lehrkraft' },
    { gruppeId: g.id, benutzerId: aufsicht.id, rolle: 'aufsicht' },
  ]);
  const kind = await person(`Kind ${name}`, ['schueler'], true);
  const eltern = await person(`Mutter ${name}`, ['gemeinde', 'eltern']);
  const v = verschluessele({ name: 'Testkind' });
  const [l] = await db
    .insert(schema.lernende)
    .values({
      benutzerId: kind.id,
      datenVerschluesselt: v.daten,
      schluesselId: v.schluesselId,
      anzeigename: 'Testkind',
      sechzehnAm: '2031-05-01',
    })
    .returning({ id: schema.lernende.id });
  await db.insert(schema.gruppenMitglied).values({ gruppeId: g.id, lernendeId: l.id });
  await db.insert(schema.elternKind).values({ elternId: eltern.id, lernendeId: l.id });
  await db
    .insert(schema.kontoEinwilligung)
    .values({ lernendeId: l.id, art: 'gruppenchat', textVersion: 'v1', erteiltVon: eltern.id, einvernehmenBestaetigt: true });
  const kanal = await dienst.kanaeleDerGruppe(g.id);
  return { gruppeId: g.id, hoca, aufsicht, kind, eltern, lernendeId: l.id, kanal };
}

const k = (id: string) => ladeGruppenKontext(id);
const lage = async (kanalId: string) => (await dienst.ladeKanal(kanalId))!;
async function abruf(p: Person, kanalId: string): Promise<number> {
  als(p);
  const antwort = await route.GET(new Request(`http://localhost/api/mein/chat/${kanalId}`), {
    params: Promise.resolve({ kanal: kanalId }),
  });
  return antwort.status;
}

describe('S2a-1: archivierte Gruppe – kein unbeaufsichtigter Kanal', () => {
  let g: Awaited<ReturnType<typeof gruppeMitLeitung>>;
  beforeAll(async () => {
    g = await gruppeMitLeitung('Archiv');
    expect((await dienst.sendeNachricht(await lage(g.kanal.gruppe), await k(g.kind.id), 'Vorher geschrieben')).ok).toBe(true);
  });

  it('vor dem Archivieren lesen Kind und Eltern ihre Kanäle über die Abruf-Route', async () => {
    expect(await abruf(g.kind, g.kanal.gruppe)).toBe(200);
    expect(await abruf(g.eltern, g.kanal.eltern)).toBe(200);
  });

  it('Archivieren über die Verwaltung: Kanäle archiviert, Mitgliedschaften beendet', async () => {
    const verwaltung = await person('Bildung Verwaltung', []);
    await db.update(schema.user).set({ twoFactorEnabled: true }).where(eq(schema.user.id, verwaltung.id));
    await db.insert(schema.rolleZuweisung).values({ benutzerId: verwaltung.id, rolle: 'bildung' });
    als({ ...verwaltung, twoFactorEnabled: true });
    const { speichereGruppe } = await import('@/server/actions/gruppen');
    const r = await speichereGruppe(
      {},
      formular({
        id: g.gruppeId,
        nameDe: 'Archiv',
        chatModus: 'offen',
        chatMindestalter: '10',
        chatVon: '08:00',
        chatBis: '20:00',
        status: 'archiviert',
      }),
    );
    expect(r.gespeichert).toBeTypeOf('number');
    const kanaele = await db.select().from(schema.chatKanal).where(eq(schema.chatKanal.gruppeId, g.gruppeId));
    expect(kanaele.map((x) => x.status)).toEqual(['archiviert', 'archiviert']);
    const offen = await db
      .select()
      .from(schema.gruppenMitglied)
      .where(and(eq(schema.gruppenMitglied.gruppeId, g.gruppeId), isNull(schema.gruppenMitglied.bis)));
    expect(offen).toHaveLength(0);
  });

  it('Kind und Eltern: kein Gruppenrecht mehr, Lesen und Schreiben scheitern – Dienst, Route und Action', async () => {
    for (const p of [g.kind, g.eltern]) {
      const kontext = await k(p.id);
      expect(kontext.eigeneGruppen.has(g.gruppeId)).toBe(false);
      expect([...kontext.kinder.values()].some((s) => s.has(g.gruppeId))).toBe(false);
    }
    expect(await dienst.ladeNachrichten(await lage(g.kanal.gruppe), await k(g.kind.id))).toBeNull();
    expect((await dienst.sendeNachricht(await lage(g.kanal.gruppe), await k(g.kind.id), 'Noch jemand da?')).ok).toBe(false);
    expect((await dienst.sendeNachricht(await lage(g.kanal.eltern), await k(g.eltern.id), 'Hallo?')).ok).toBe(false);
    expect(await abruf(g.kind, g.kanal.gruppe)).toBe(404);
    expect(await abruf(g.eltern, g.kanal.eltern)).toBe(404);
    als(g.kind);
    expect(await chatAktionen.sendeChatNachricht(g.kanal.gruppe, 'Über die Action')).toMatchObject({ ok: false });
    als(g.eltern);
    expect(await chatAktionen.sendeChatNachricht(g.kanal.eltern, 'Über die Action')).toMatchObject({ ok: false });
    const texte = (await db.select().from(schema.chatNachricht).where(eq(schema.chatNachricht.kanalId, g.kanal.gruppe))).map((n) =>
      entschluessele<string>(n.textVerschluesselt, n.schluesselId),
    );
    expect(texte).toEqual(['Vorher geschrieben']);
  });

  it('der Kanal gilt als archiviert, auch wenn nur die Gruppe archiviert ist', async () => {
    await db.update(schema.chatKanal).set({ status: 'aktiv' }).where(eq(schema.chatKanal.gruppeId, g.gruppeId));
    expect((await lage(g.kanal.gruppe)).status).toBe('archiviert');
    await db.update(schema.chatKanal).set({ status: 'archiviert' }).where(eq(schema.chatKanal.gruppeId, g.gruppeId));
  });
});

describe('S2a-2: Pause der Rolle kinderschutz', () => {
  let g: Awaited<ReturnType<typeof gruppeMitLeitung>>;
  beforeAll(async () => {
    g = await gruppeMitLeitung('Pause');
  });

  it('die Leitung hebt die Pause nicht auf – weder im Dienst noch über die Actions', async () => {
    expect(await dienst.pausiereAlsKinderschutz('kinderschutz-person', g.kanal.gruppe, true, 'Meldung wird geprüft')).toBeNull();
    expect((await dienst.sendeNachricht(await lage(g.kanal.gruppe), await k(g.hoca.id), 'Weiter geht es')).ok).toBe(false);
    expect(await dienst.setzeKanalPause(await k(g.hoca.id), await lage(g.kanal.gruppe), false, 'weiter')).toBe('keinRecht');
    expect(await dienst.setzeKanalPause(await k(g.aufsicht.id), await lage(g.kanal.gruppe), false, 'abc')).toBe('keinRecht');
    als(g.hoca);
    expect(await chatAktionen.pausiereKanal(g.kanal.gruppe, false, 'weiter')).toEqual({ fehler: 'keinRecht' });
    const ziel = await umleitung(
      lehrkraftAktionen.kanalPauseSetzen(
        formular({ sprache: 'de', gruppeId: g.gruppeId, kanalId: g.kanal.gruppe, pause: '0', grund: 'weiter' }),
      ),
    );
    expect(ziel).toContain('fehler=nichtMoeglich');
    // Auch erneutes Pausieren durch die Leitung überschreibt die Pause der Rolle kinderschutz nicht
    expect(await dienst.setzeKanalPause(await k(g.hoca.id), await lage(g.kanal.gruppe), true, 'auch pausieren')).toBe('keinRecht');
    const [kanal] = await db.select().from(schema.chatKanal).where(eq(schema.chatKanal.id, g.kanal.gruppe));
    expect(kanal).toMatchObject({ status: 'pausiert', kinderschutzPause: true });
    expect((await unterricht.kanalStatus(g.gruppeId)).find((x) => x.id === g.kanal.gruppe)?.kinderschutzPause).toBe(true);
  });

  it('kinderschutz setzt fort; danach pausiert und setzt die Leitung wieder selbst fort – mit Hinweis an kinderschutz', async () => {
    expect(await dienst.pausiereAlsKinderschutz('kinderschutz-person', g.kanal.gruppe, false, 'Prüfung beendet')).toBeNull();
    expect((await dienst.sendeNachricht(await lage(g.kanal.gruppe), await k(g.hoca.id), 'Weiter geht es')).ok).toBe(true);
    expect(await dienst.setzeKanalPause(await k(g.hoca.id), await lage(g.kanal.gruppe), true, 'kurze Pause')).toBeNull();
    const vorher = (await db.select().from(schema.mailAusgang)).length;
    expect(await dienst.setzeKanalPause(await k(g.hoca.id), await lage(g.kanal.gruppe), false, 'Pause vorbei')).toBeNull();
    const mails = await db.select().from(schema.mailAusgang);
    expect(mails).toHaveLength(vorher + 1);
    const neu = mails.at(-1)!;
    expect(neu.vorlage).toBe('hinweis');
    expect(entschluessele(neu.datenVerschluesselt, neu.schluesselId)).toEqual({
      an: 'recht:meldung.chat.bearbeiten',
      daten: { art: 'kanal_fortgesetzt', pfad: '/verwaltung/kinderschutz' },
    });
  });
});

describe('S2a-3: Ratengrenze S-13 bei parallelen Anfragen', () => {
  it('40 gleichzeitige Nachrichten: genau 10 gespeichert, der Rest „rate“', async () => {
    const g = await gruppeMitLeitung('Rate');
    const kanal = await lage(g.kanal.gruppe);
    const kontext = await k(g.kind.id);
    const ergebnisse = await Promise.all(Array.from({ length: 40 }, (_, i) => dienst.sendeNachricht(kanal, kontext, `Flut ${i}`)));
    expect(ergebnisse.filter((e) => e.ok)).toHaveLength(10);
    expect(ergebnisse.filter((e) => !e.ok && e.grund === 'rate')).toHaveLength(30);
    expect(await db.select().from(schema.chatNachricht).where(eq(schema.chatNachricht.absenderId, g.kind.id))).toHaveLength(10);
  });
});

describe('S2a-5: Meldung gegen die Leitung nach dem Löschlauf (D-02)', () => {
  it('bleibt vor der gemeldeten Lehrkraft verborgen; sie liest den Kontext nicht und schließt die Meldung nicht', async () => {
    const g = await gruppeMitLeitung('Meldung');
    const v = verschluessele('Nachricht der Lehrkraft');
    const [n] = await db
      .insert(schema.chatNachricht)
      .values({
        kanalId: g.kanal.gruppe,
        absenderId: g.hoca.id,
        textVerschluesselt: v.daten,
        schluesselId: v.schluesselId,
        erstelltAm: new Date(Date.now() - 85 * 86_400_000),
      })
      .returning({ id: schema.chatNachricht.id });
    const m = await dienst.meldeNachricht(await k(g.kind.id), n.id, 'unangemessen', 'Freitext zur Meldung');
    expect(m.ok).toBe(true);
    const [gespeichert] = await db.select().from(schema.chatMeldung).where(eq(schema.chatMeldung.nachrichtId, n.id));
    expect(gespeichert).toMatchObject({ gemeldetePerson: g.hoca.id, gegenLeitung: true });
    const sichtbar = async (p: Person) => (await unterricht.offeneMeldungen(g.gruppeId, await k(p.id)))!.map((x) => x.id);
    expect(await sichtbar(g.hoca)).toEqual([]);
    expect(await sichtbar(g.aufsicht)).toEqual([]);

    // Der Löschlauf entfernt die 85 Tage alte Nachricht erst nach 90 Tagen – hier vorgezogen
    await db
      .update(schema.chatNachricht)
      .set({ erstelltAm: new Date(Date.now() - 91 * 86_400_000) })
      .where(eq(schema.chatNachricht.id, n.id));
    expect((await dienst.chatLoeschlauf()).nachrichten).toBeGreaterThanOrEqual(1);
    expect(await db.select().from(schema.chatNachricht).where(eq(schema.chatNachricht.id, n.id))).toHaveLength(0);

    expect(await sichtbar(g.hoca)).toEqual([]);
    expect(await sichtbar(g.aufsicht)).toEqual([]);
    expect((await unterricht.gruppenDerLeitung(await k(g.hoca.id), '2026-10-15')).find((x) => x.id === g.gruppeId)?.offeneMeldungen).toBe(
      0,
    );
    als(g.hoca);
    const ziel = await umleitung(
      lehrkraftAktionen.moderiereMeldung(
        formular({ sprache: 'de', gruppeId: g.gruppeId, meldungId: m.ok ? m.meldungId : '', massnahme: 'erledigt', grund: 'erledigt' }),
      ),
    );
    expect(ziel).toContain('fehler=nichtMoeglich');
    const [danach] = await db.select().from(schema.chatMeldung).where(eq(schema.chatMeldung.nachrichtId, n.id));
    expect(danach.status).toBe('offen');
  });

  it('Meldung über ein Kind: die Leitung sieht sie weiter, auch nach dem Löschlauf (mit gespeicherter Person)', async () => {
    const g = await gruppeMitLeitung('Kindmeldung');
    const r = await dienst.sendeNachricht(await lage(g.kanal.gruppe), await k(g.kind.id), 'Unfreundlich');
    const id = (r as { id: number }).id;
    expect((await dienst.meldeNachricht(await k(g.aufsicht.id), id, 'beleidigung', null)).ok).toBe(true);
    await db.delete(schema.chatNachricht).where(eq(schema.chatNachricht.id, id));
    const liste = (await unterricht.offeneMeldungen(g.gruppeId, await k(g.hoca.id)))!;
    expect(liste).toHaveLength(1);
    expect(liste[0]).toMatchObject({ absenderId: g.kind.id, absenderIstLeitung: false, nachrichtEntfernt: true });
  });

  it('wird jemand später Leitung, sieht er Meldungen über sich nicht', async () => {
    const g = await gruppeMitLeitung('Spaeter');
    const r = await dienst.sendeNachricht(await lage(g.kanal.eltern), await k(g.eltern.id), 'Elternnachricht');
    const id = (r as { id: number }).id;
    expect((await dienst.meldeNachricht(await k(g.hoca.id), id, 'sonstiges', null)).ok).toBe(true);
    expect(await unterricht.offeneMeldungen(g.gruppeId, await k(g.aufsicht.id))).toHaveLength(1);
    await db.insert(schema.gemeindeRolle).values({ benutzerId: g.eltern.id, rolle: 'lehrkraft' });
    await db.insert(schema.gruppenLeitung).values({ gruppeId: g.gruppeId, benutzerId: g.eltern.id, rolle: 'aufsicht' });
    expect(await unterricht.offeneMeldungen(g.gruppeId, await k(g.eltern.id))).toHaveLength(0);
    expect(await unterricht.offeneMeldungen(g.gruppeId, await k(g.aufsicht.id))).toHaveLength(0);
  });
});

describe('S2a-7: Die Leitung entfernt eigene Nachrichten nicht selbst', () => {
  it('eigene Nachricht: keinRecht, Text bleibt; eine andere Leitungsperson darf entfernen', async () => {
    const g = await gruppeMitLeitung('Eigen');
    const r = await dienst.sendeNachricht(await lage(g.kanal.gruppe), await k(g.hoca.id), 'Nachricht der Lehrkraft');
    const id = (r as { id: number }).id;
    expect(await dienst.entferneNachricht(await k(g.hoca.id), id, 'Tippfehler')).toBe('keinRecht');
    const [n] = await db.select().from(schema.chatNachricht).where(eq(schema.chatNachricht.id, id));
    expect(n.entferntAm).toBeNull();
    expect(entschluessele<string>(n.textVerschluesselt, n.schluesselId)).toBe('Nachricht der Lehrkraft');
    expect(await dienst.entferneNachricht(await k(g.aufsicht.id), id, 'auf Bitte entfernt')).toBeNull();
  });
});
