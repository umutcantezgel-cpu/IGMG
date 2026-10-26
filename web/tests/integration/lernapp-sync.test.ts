import { randomUUID } from 'node:crypto';
import { and, eq } from 'drizzle-orm';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { db as appDb, schema } from '@/lib/db';
import { verschluessele } from '@/lib/krypto';
import type { Ereignis, EreignisEntwurf } from '@/lib/lernapp/ereignisse/typen';
import { haengeAn } from '@/lib/lernapp/lokal/ausgang';
import { arbeitsspeicher, type Profil, profilBereich, type Speicher } from '@/lib/lernapp/lokal/db';
import { aktivesProfil, aendereProfil, legeProfilAn } from '@/lib/lernapp/lokal/profile';
import type { Abruf } from '@/lib/lernapp/lokal/sync';
import { leiteAb, heuteStand } from '@/lib/lernapp/ereignisse/ableiten';
import { lerntagVon } from '@/lib/lernapp/ereignisse/serie';
import { EreignisSchema } from '@/lib/lernapp/ereignisse/typen';
import { GRENZEN, SITZUNG_ADRESSE, SYNC_ADRESSE, SyncAntwortSchema } from '@/lib/lernapp/sync/protokoll';
import { spieleKarteNach, type Note } from '@/lib/lernapp/srs';
import { kontoUmgebung } from './hilfen/konto';

/**
 * Abgleich der Lern-App (ADR 0038 Nr. 5–7 und 10, KERN 4.0 §5/§6) gegen PGlite: Schalter aus → 404, Ursprung, Anmeldung,
 * Einwilligung (bei Kindern von den Eltern), Zod und Grenzen, Idempotenz, Trennung zwischen Konten, Zeiger-Seiten, Bremse,
 * Uhrzeit-Klemme, Kartenstand mit derselben reinen Ableitung wie auf dem Gerät, Lerntage, Zuweisungen, Verdichtung im
 * Löschlauf und der Client (`lokal/sync.ts`) mit zwei Geräten. Testdaten fiktiv, Inhalte neutral.
 */
const { client, db } = await kontoUmgebung();
const { auth } = await import('@/lib/auth/server');
const syncRoute = await import('@/app/api/lernapp/sync/route');
const sitzungRoute = await import('@/app/api/lernapp/sitzung/route');
const { synchronisiere, bindungFuer, beantworteUebernahme, erzeugeAbgleich, ladeSitzung } = await import('@/lib/lernapp/lokal/sync');
const { verdichteLernapp } = await import('@/lib/lernapp/sync/verdichten');
const { gleicheKontoAb, alsEreignis } = await import('@/lib/lernapp/sync/server');
const { lernappTestkurs } = await import('../../drizzle/seeds/lernapp-test');
afterAll(() => client.close());

beforeAll(async () => {
  await lernappTestkurs(appDb);
});
afterEach(() => {
  for (const s of ['FUNKTION_LERNAPP', 'FUNKTION_LERNAPP_SYNC', 'FUNKTION_KONTEN', 'FUNKTION_LERNAPP_GRUPPEN']) delete process.env[s];
});

const api = auth.api as unknown as Record<string, unknown>;
/** Konto der aktuellen Sitzung; `sende` trägt es als `konto` in die Anfrage ein, wenn der Körper keins nennt. */
let angemeldet: string | null = null;
function als(id: string | null) {
  angemeldet = id;
  api.getSession = async () =>
    id
      ? {
          user: { id, name: 'Testperson', email: `${id.slice(0, 8)}@example.test`, twoFactorEnabled: false, gesperrtAm: null },
          session: { id: `s-${id}`, createdAt: new Date(), userId: id },
        }
      : null;
}

async function konto({ kind = false, einwilligung = true }: { kind?: boolean; einwilligung?: boolean } = {}): Promise<string> {
  const id = randomUUID();
  await db.insert(schema.user).values({ id, name: 'Testperson', email: `${id.slice(0, 8)}@example.test`, emailVerified: true });
  await db.insert(schema.kontoProfil).values({ benutzerId: id, anzeigename: 'Testperson T.', istKind: kind });
  await db.insert(schema.gemeindeRolle).values({ benutzerId: id, rolle: kind ? 'schueler' : 'gemeinde' });
  if (einwilligung) await db.insert(schema.kontoEinwilligung).values({ benutzerId: id, art: 'lernapp', textVersion: 'v1', erteiltVon: id });
  return id;
}

async function lernende(benutzerId: string, sechzehnAm = '2032-01-01'): Promise<string> {
  const v = verschluessele({ name: 'Testkind' });
  const [z] = await db
    .insert(schema.lernende)
    .values({ benutzerId, datenVerschluesselt: v.daten, schluesselId: v.schluesselId, anzeigename: 'Testkind K.', sechzehnAm })
    .returning({ id: schema.lernende.id });
  return z!.id;
}

const MIN = 60_000;
const vor = (minuten: number) => new Date(Date.now() - minuten * MIN);
const tagVon = (d: Date) => d.toISOString().slice(0, 10);
const KARTE = 'tr-aus-de:tr.a1.test.w001';

function bewertung(geraet: string, seq: number, note: Note, am: Date, karte = KARTE): Ereignis {
  return { geraet, seq, am: am.toISOString(), tag: tagVon(am), art: 'bewertung', daten: { karte, note, kurs: 'tr-aus-de' } };
}
function xp(geraet: string, seq: number, am: Date, menge = 5): Ereignis {
  return { geraet, seq, am: am.toISOString(), tag: tagVon(am), art: 'xp', daten: { menge, grund: 'lektion' } };
}
function lektion(geraet: string, seq: number, am: Date, schluessel: string): Ereignis {
  return {
    geraet,
    seq,
    am: am.toISOString(),
    tag: tagVon(am),
    art: 'lektion',
    daten: { kurs: 'tr-aus-de', lektion: schluessel, art: 'lektion', richtig: 4, gesamt: 4 },
  };
}

const KOPF = { 'content-type': 'application/json', 'sec-fetch-site': 'same-origin', host: 'example.test' };
async function sende(koerper: unknown, kopf: Record<string, string> = {}): Promise<Response> {
  const mitKonto =
    koerper && typeof koerper === 'object' && !Array.isArray(koerper) && !('konto' in koerper) && angemeldet
      ? { konto: angemeldet, ...koerper }
      : koerper;
  return syncRoute.POST(
    new Request(`https://example.test${SYNC_ADRESSE}`, {
      method: 'POST',
      headers: { ...KOPF, ...kopf },
      body: typeof mitKonto === 'string' ? mitKonto : JSON.stringify(mitKonto),
    }),
  );
}
async function sync(geraet: string, ereignisse: unknown[], cursor: string | null = null, basis?: string | null) {
  const r = await sende({ geraet, cursor, ereignisse, ...(basis !== undefined ? { basis } : {}) });
  expect(r.status).toBe(200);
  expect(r.headers.get('cache-control')).toContain('no-store');
  return SyncAntwortSchema.parse(await r.json());
}

/** Abruf des Clients gegen die Route Handler (gleicher Ursprung wie im Browser). */
const abruf: Abruf = async (adresse, init) => {
  if (adresse === SITZUNG_ADRESSE) return sitzungRoute.GET();
  expect(adresse).toBe(SYNC_ADRESSE);
  const kopf = { ...(init?.headers as Record<string, string>), 'sec-fetch-site': 'same-origin' };
  return syncRoute.POST(new Request(`https://example.test${adresse}`, { method: init?.method, headers: kopf, body: init?.body }));
};

async function serverKarten(benutzerId: string): Promise<Record<string, unknown>> {
  const zeilen = await db
    .select({ karte: schema.lernappKarte.karte, zustand: schema.lernappKarte.zustand })
    .from(schema.lernappKarte)
    .where(eq(schema.lernappKarte.benutzerId, benutzerId));
  return Object.fromEntries(zeilen.map((z) => [z.karte, z.zustand]));
}
async function lokaleKarten(sp: Speicher, profil: string): Promise<Record<string, unknown>> {
  return Object.fromEntries((await sp.alle('karten', profilBereich(profil))).map(({ profil: _p, ...k }) => [k.karte, k]));
}
async function geraet(konto: string | null, name = 'Testprofil'): Promise<{ sp: Speicher; profil: Profil }> {
  const sp = arbeitsspeicher();
  const p = await legeProfilAn(sp, { name, oberflaeche: 'de' });
  return { sp, profil: konto ? await aendereProfil(sp, p.id, { benutzerId: konto }) : p };
}
const entwurf = (note: Note, karte = KARTE): EreignisEntwurf => ({ art: 'bewertung', daten: { karte, note, kurs: 'tr-aus-de' } });

describe('Schalter, Ursprung, Anmeldung, Einwilligung', () => {
  it('Schalter lernapp_sync, lernapp oder konten aus → 404 ohne Körper (Sync und Sitzung)', async () => {
    als(await konto());
    for (const [name, wert] of [
      ['FUNKTION_LERNAPP_SYNC', 'aus'],
      ['FUNKTION_LERNAPP', 'aus'],
      ['FUNKTION_KONTEN', 'aus'],
    ] as const) {
      process.env[name] = wert;
      const r = await sende({ geraet: randomUUID(), cursor: null, ereignisse: [] });
      expect(r.status).toBe(404);
      expect(await r.text()).toBe('');
      expect((await sitzungRoute.GET()).status).toBe(404);
      delete process.env[name];
    }
    expect((await sende({ geraet: randomUUID(), cursor: null, ereignisse: [] })).status).toBe(200);
  });

  it('ohne Anmeldung 401; die Sitzung sagt nur „nicht angemeldet“', async () => {
    als(null);
    const r = await sende({ geraet: randomUUID(), cursor: null, ereignisse: [] });
    expect(r.status).toBe(401);
    expect(await r.json()).toEqual({ fehler: 'anmeldung' });
    const s = await sitzungRoute.GET();
    expect(s.headers.get('cache-control')).toContain('no-store');
    expect(await s.json()).toEqual({ angemeldet: false });
    // Konto ohne Kontoart (unbestätigte Registrierung) zählt nicht als angemeldet
    const id = randomUUID();
    await db.insert(schema.user).values({ id, name: 'Testperson', email: `${id.slice(0, 8)}@example.test`, emailVerified: true });
    als(id);
    expect((await sende({ geraet: randomUUID(), cursor: null, ereignisse: [] })).status).toBe(401);
  });

  it('nur gleicher Ursprung: fremde Fetch-Metadaten bzw. fremdes Origin → 403', async () => {
    als(await konto());
    const leer = { geraet: randomUUID(), cursor: null, ereignisse: [] };
    expect((await sende(leer, { 'sec-fetch-site': 'cross-site' })).status).toBe(403);
    expect((await sende(leer, { 'sec-fetch-site': 'same-site' })).status).toBe(403);
    const ohneMetadaten = (origin: string) =>
      syncRoute.POST(
        new Request(`https://example.test${SYNC_ADRESSE}`, {
          method: 'POST',
          headers: { 'content-type': 'application/json', host: 'example.test', origin },
          body: JSON.stringify({ konto: angemeldet, ...leer }),
        }),
      );
    expect((await ohneMetadaten('https://fremd.example')).status).toBe(403);
    expect((await ohneMetadaten('https://example.test')).status).toBe(200);
  });

  it('ohne Einwilligung lernapp 403; Widerruf wirkt sofort; die Sitzung meldet den Stand', async () => {
    const id = await konto({ einwilligung: false });
    als(id);
    const leer = { geraet: randomUUID(), cursor: null, ereignisse: [] };
    let r = await sende(leer);
    expect(r.status).toBe(403);
    expect(await r.json()).toEqual({ fehler: 'einwilligung' });
    expect(await (await sitzungRoute.GET()).json()).toEqual({ angemeldet: true, konto: id, einwilligung: 'fehlt' });
    // Einwilligung einer anderen Art zählt nicht
    await db.insert(schema.kontoEinwilligung).values({ benutzerId: id, art: 'push', textVersion: 'v1', erteiltVon: id });
    expect((await sende(leer)).status).toBe(403);
    await db.insert(schema.kontoEinwilligung).values({ benutzerId: id, art: 'lernapp', textVersion: 'v1', erteiltVon: id });
    expect((await sende(leer)).status).toBe(200);
    expect(await (await sitzungRoute.GET()).json()).toEqual({ angemeldet: true, konto: id, einwilligung: 'erteilt' });
    await db
      .update(schema.kontoEinwilligung)
      .set({ widerrufenAm: new Date() })
      .where(and(eq(schema.kontoEinwilligung.benutzerId, id), eq(schema.kontoEinwilligung.art, 'lernapp')));
    r = await sende(leer);
    expect(r.status).toBe(403);
    expect(await db.select().from(schema.lernappEreignis).where(eq(schema.lernappEreignis.benutzerId, id))).toHaveLength(0);
  });

  it('Kind unter 16: ohne Einwilligung der Eltern abgelehnt – auch mit eigener; mit Einwilligung sorgeberechtigter Eltern erlaubt', async () => {
    const kind = await konto({ kind: true });
    als(kind);
    const leer = { geraet: randomUUID(), cursor: null, ereignisse: [] };
    // Kinderkonto ohne Lerndatensatz: niemand kann einwilligen; die eigene Einwilligung zählt nicht
    let r = await sende(leer);
    expect(r.status).toBe(403);
    expect(await r.json()).toEqual({ fehler: 'eltern' });

    const lernendeId = await lernende(kind);
    r = await sende(leer);
    expect(r.status).toBe(403);
    expect(await r.json()).toEqual({ fehler: 'eltern' });
    expect(await (await sitzungRoute.GET()).json()).toEqual({ angemeldet: true, konto: kind, einwilligung: 'eltern' });

    // Einwilligung von jemandem, der nicht sorgeberechtigt ist, zählt nicht
    const fremd = await konto();
    await db.insert(schema.elternKind).values({ elternId: fremd, lernendeId, sorgeberechtigt: false });
    await db
      .insert(schema.kontoEinwilligung)
      .values({ lernendeId, art: 'lernapp', textVersion: 'v1', erteiltVon: fremd, einvernehmenBestaetigt: true });
    expect((await sende(leer)).status).toBe(403);

    // Sorgeberechtigt, aber der Bezug ist noch nicht bestätigt (N4): zählt nicht (S-L2 H-3)
    const eltern = await konto();
    await db.insert(schema.elternKind).values({ elternId: eltern, lernendeId, sorgeberechtigt: true });
    await db
      .insert(schema.kontoEinwilligung)
      .values({ lernendeId, art: 'lernapp', textVersion: 'v1', erteiltVon: eltern, einvernehmenBestaetigt: true });
    expect((await sende(leer)).status).toBe(403);
    await db
      .update(schema.elternKind)
      .set({ bestaetigtAm: new Date() })
      .where(and(eq(schema.elternKind.elternId, eltern), eq(schema.elternKind.lernendeId, lernendeId)));
    expect((await sende(leer)).status).toBe(200);
  });

  it('ab 16 (nach dem Übergang) zählt nur die eigene Einwilligung', async () => {
    const jugend = await konto({ kind: true, einwilligung: false });
    const lernendeId = await lernende(jugend, '2020-01-01');
    const eltern = await konto();
    await db.insert(schema.elternKind).values({ elternId: eltern, lernendeId, sorgeberechtigt: true, bestaetigtAm: new Date() });
    await db.insert(schema.kontoEinwilligung).values({ lernendeId, art: 'lernapp', textVersion: 'v1', erteiltVon: eltern });
    als(jugend);
    const leer = { geraet: randomUUID(), cursor: null, ereignisse: [] };
    const r = await sende(leer);
    expect(r.status).toBe(403);
    expect(await r.json()).toEqual({ fehler: 'einwilligung' });
    await db
      .insert(schema.kontoEinwilligung)
      .values({ lernendeId, benutzerId: jugend, art: 'lernapp', textVersion: 'v1', erteiltVon: jugend });
    expect((await sende(leer)).status).toBe(200);
  });

  it('Zod und Grenzen: Typ 415, kein JSON 400, Hülle ungültig 400, > 500 Ereignisse 400, > 256 KB 413; ungültige Ereignisse einzeln abgelehnt', async () => {
    als(await konto());
    const g = randomUUID();
    expect((await sende({ geraet: g, cursor: null, ereignisse: [] }, { 'content-type': 'text/plain' })).status).toBe(415);
    expect((await sende('{kein json')).status).toBe(400);
    for (const huelle of [
      { geraet: 'kein-geraet', cursor: null, ereignisse: [] },
      { geraet: g, cursor: '-1', ereignisse: [] },
      { geraet: g, cursor: null, ereignisse: [], fremd: 1 },
      { konto: undefined, geraet: g, cursor: null, ereignisse: [] },
      { konto: '', geraet: g, cursor: null, ereignisse: [] },
      { geraet: g, cursor: null, ereignisse: Array.from({ length: 501 }, (_, i) => xp(g, i, vor(10))) },
    ]) {
      const r = await sende(huelle);
      expect(r.status).toBe(400);
      expect(await r.json()).toEqual({ fehler: 'pruefen' });
    }
    const gross = await sende({ geraet: g, cursor: null, ereignisse: [{ geraet: g, seq: 0, polster: 'x'.repeat(260 * 1024) }] });
    expect(gross.status).toBe(413);

    const a = await sync(g, [
      xp(g, 0, vor(10)),
      { ...xp(g, 1, vor(10)), daten: { menge: 999, grund: 'lektion' } },
      { ...bewertung(g, 2, 'gut', vor(10)), daten: { karte: KARTE, note: 'leicht' } },
      { ...xp(g, 3, vor(10)), extra: true },
      'kein Ereignis',
    ]);
    expect(a.angenommen).toBe(1);
    expect(a.abgelehnt).toEqual([
      { geraet: g, seq: 1 },
      { geraet: g, seq: 2 },
      { geraet: g, seq: 3 },
    ]);
  });
});

describe('Schreiben und Lesen', () => {
  it('idempotent: dieselbe Anfrage zweimal schreibt einmal; der Lernstand merkt die Aktivität', async () => {
    const id = await konto();
    als(id);
    const g = randomUUID();
    const ereignisse = [bewertung(g, 0, 'gut', vor(30)), bewertung(g, 1, 'schwer', vor(20)), xp(g, 2, vor(20))];
    const erste = await sync(g, ereignisse);
    expect(erste).toMatchObject({ angenommen: 3, doppelt: 0, mehr: false, ereignisse: [], geklemmt: [], abgelehnt: [] });
    const zweite = await sync(g, ereignisse, erste.cursor);
    expect(zweite).toMatchObject({ angenommen: 0, doppelt: 3, cursor: erste.cursor, ereignisse: [] });
    expect(await db.select().from(schema.lernappEreignis).where(eq(schema.lernappEreignis.benutzerId, id))).toHaveLength(3);
    const [profil] = await db.select().from(schema.lernappProfil).where(eq(schema.lernappProfil.benutzerId, id));
    expect(Date.now() - profil!.zuletztAktivAm.getTime()).toBeLessThan(60_000);
    expect(erste.angelegt).toBe(profil!.angelegtAm.toISOString());
    // doppelte Schlüssel in derselben Anfrage zählen einmal
    expect((await sync(g, [xp(g, 9, vor(5)), xp(g, 9, vor(5))], zweite.cursor)).angenommen).toBe(1);
  });

  it('Lektion mit geübten Typen (Sprechen, Schreiben) kommt unverändert beim anderen Gerät an; fremde Typen abgelehnt', async () => {
    als(await konto());
    const g = randomUUID();
    const mitTypen = (seq: number, typen: unknown) => {
      const e = lektion(g, seq, vor(10), `tr-aus-de.a1.test.l0${seq + 1}`);
      return { ...e, daten: { ...e.daten, typen } };
    };
    const a = await sync(g, [mitTypen(0, ['sprechen', 'schreiben']), mitTypen(1, ['hoeren'])]);
    expect(a.angenommen).toBe(1);
    expect(a.abgelehnt).toEqual([{ geraet: g, seq: 1 }]);
    const b = await sync(randomUUID(), []);
    expect((b.ereignisse as Ereignis[]).map((e) => e.daten)).toEqual([expect.objectContaining({ typen: ['sprechen', 'schreiben'] })]);
  });

  it('Trennung zwischen Konten: Ereignisse, Karten und Zeiger bleiben je Konto', async () => {
    const a = await konto();
    const b = await konto();
    const ga = randomUUID();
    const gb = randomUUID();
    als(a);
    await sync(ga, [bewertung(ga, 0, 'gut', vor(30)), xp(ga, 1, vor(30))]);
    als(b);
    // dasselbe Gerät und dieselbe Nummer in einem anderen Konto sind ein anderes Ereignis
    const antwortB = await sync(randomUUID(), [bewertung(ga, 0, 'nochmal', vor(25))]);
    expect(antwortB.angenommen).toBe(1);
    expect(antwortB.ereignisse.map((e) => (e as Ereignis).geraet)).toEqual([ga]);
    expect((antwortB.ereignisse[0] as Ereignis).daten).toMatchObject({ note: 'nochmal' });
    expect((await sync(gb, [])).ereignisse).toHaveLength(1);
    als(a);
    const antwortA = await sync(randomUUID(), []);
    expect(antwortA.ereignisse).toHaveLength(2);
    expect(antwortA.ereignisse.every((e) => (e as Ereignis).geraet === ga)).toBe(true);
    expect(Object.values(await serverKarten(a))).toEqual([expect.objectContaining({ letzteNote: 'gut' })]);
    expect(Object.values(await serverKarten(b))).toEqual([expect.objectContaining({ letzteNote: 'nochmal' })]);
  });

  it('Zeiger-Seiten: 2.500 fremde Ereignisse kommen als 2.000 mit „mehr“ und 500; eigene kommen nicht zurück', async () => {
    als(await konto());
    const ga = randomUUID();
    const gb = randomUUID();
    let cursor: string | null = null;
    for (let s = 0; s < 5; s++) {
      const a = await sync(
        ga,
        Array.from({ length: 500 }, (_, i) => xp(ga, s * 500 + i, vor(60 - s), 1)),
        cursor,
      );
      expect(a.angenommen).toBe(500);
      expect(a.ereignisse).toHaveLength(0);
      cursor = a.cursor;
    }
    const seite1 = await sync(gb, [xp(gb, 0, vor(1))]);
    expect(seite1.mehr).toBe(true);
    expect(seite1.ereignisse).toHaveLength(2000);
    expect(seite1.ereignisse.map((e) => (e as Ereignis).seq)).toEqual(Array.from({ length: 2000 }, (_, i) => i));
    const seite2 = await sync(gb, [], seite1.cursor);
    expect(seite2.mehr).toBe(false);
    expect(seite2.ereignisse).toHaveLength(500);
    expect((seite2.ereignisse.at(-1) as Ereignis).seq).toBe(2499);
    const seite3 = await sync(gb, [], seite2.cursor);
    expect(seite3).toMatchObject({ mehr: false, ereignisse: [], cursor: seite2.cursor });
    // Gerät A bekommt nur das eine Ereignis von B
    const vonB = await sync(ga, [], cursor);
    expect(vonB.ereignisse.map((e) => (e as Ereignis).geraet)).toEqual([gb]);
  });

  it('Uhrzeit-Klemme: Zeit höchstens Empfang + 5 min, Lerntag höchstens der späteste Kalendertag der Erde; der Client bekommt die Fassung zurück', async () => {
    const id = await konto();
    als(id);
    const g = randomUUID();
    const zukunft = new Date(Date.now() + 3 * 86_400_000);
    const vorher = Date.now();
    const a = await sync(g, [xp(g, 0, zukunft), xp(g, 1, vor(5))]);
    expect(a.geklemmt).toHaveLength(1);
    const k = a.geklemmt[0]!;
    expect(k.seq).toBe(0);
    expect(Date.parse(k.am)).toBeLessThanOrEqual(Date.now() + 5 * MIN);
    expect(Date.parse(k.am)).toBeGreaterThanOrEqual(vorher + 5 * MIN - 1000);
    expect(k.tag <= tagVon(new Date(Date.now() + 14 * 3_600_000))).toBe(true);
    const [z] = await db
      .select({ am: schema.lernappEreignis.am, tag: schema.lernappEreignis.tag })
      .from(schema.lernappEreignis)
      .where(and(eq(schema.lernappEreignis.benutzerId, id), eq(schema.lernappEreignis.seq, 0)));
    expect(z!.am.toISOString()).toBe(k.am);
    expect(z!.tag).toBe(k.tag);
  });

  it('Kartenstand auf dem Server mit derselben Ableitung wie auf dem Gerät; Lerntage für die Gruppenwoche', async () => {
    const id = await konto();
    als(id);
    const g1 = randomUUID();
    const g2 = randomUUID();
    const b1 = [bewertung(g1, 0, 'gut', vor(300)), bewertung(g1, 1, 'gut', vor(200))];
    const b2 = [bewertung(g2, 0, 'nochmal', vor(250)), bewertung(g2, 1, 'schwer', vor(100))];
    await sync(g1, b1);
    await sync(g2, b2);
    const erwartet = spieleKarteNach(
      KARTE,
      [...b2, ...b1].map((e) => ({ karte: KARTE, note: (e.daten as { note: Note }).note, am: e.am, geraet: e.geraet, seq: e.seq })),
    );
    expect(await serverKarten(id)).toEqual({ [KARTE]: erwartet });
    const [karte] = await db.select().from(schema.lernappKarte).where(eq(schema.lernappKarte.benutzerId, id));
    expect(karte!.faellig?.toISOString()).toBe(erwartet!.faellig);

    const heute = vor(1);
    await sync(g1, [lektion(g1, 2, heute, 'tr-aus-de.a1.test.l01'), xp(g1, 3, heute, 10)]);
    const tage = await db.select().from(schema.lernappTag).where(eq(schema.lernappTag.benutzerId, id));
    expect(tage.find((t) => t.tag === tagVon(heute))).toMatchObject({ xp: 10, lektionen: 1, zielErreicht: true, pause: false });

    // S-L3 M-1: dieselben Tage je Kurs – Lektion über ihren Kurs, XP über den Bezug; ohne Bezug „unbekannt“ (zählt nirgends)
    const mit = (e: Ereignis, daten: Record<string, unknown>) => ({ ...e, daten: { ...e.daten, ...daten } }) as Ereignis;
    await sync(g1, [
      mit(xp(g1, 4, heute, 7), { bezug: 'tr-aus-de.a1.test.l01' }),
      mit(lektion(g1, 5, heute, 'islam.grund.e01.l01'), { kurs: 'islam' }),
      mit(xp(g1, 6, heute, 9), { bezug: 'islam.grund.e01.l01' }),
      mit(lektion(g1, 7, heute, 'tr-aus-de.a1.test.l02'), { kurs: 'islam' }),
    ]);
    const jeKurs = await db
      .select({ kurs: schema.lernappTagKurs.kurs, xp: schema.lernappTagKurs.xp, lektionen: schema.lernappTagKurs.lektionen })
      .from(schema.lernappTagKurs)
      .where(and(eq(schema.lernappTagKurs.benutzerId, id), eq(schema.lernappTagKurs.tag, tagVon(heute))));
    expect(jeKurs.sort((a, b) => a.kurs.localeCompare(b.kurs))).toEqual([
      { kurs: 'islam', xp: 9, lektionen: 1 },
      { kurs: 'tr-aus-de', xp: 7, lektionen: 1 },
      { kurs: 'unbekannt', xp: 10, lektionen: 1 },
    ]);
    const [summe] = await db
      .select()
      .from(schema.lernappTag)
      .where(and(eq(schema.lernappTag.benutzerId, id), eq(schema.lernappTag.tag, tagVon(heute))));
    expect(summe).toMatchObject({ xp: 26, lektionen: 3 });
  });

  it('Bremse: 30 Anfragen je Minute und Konto, die 31. → 429 (ein anderes Konto bleibt frei)', async () => {
    als(await konto());
    const g = randomUUID();
    for (let i = 0; i < 30; i++) expect((await sende({ geraet: g, cursor: null, ereignisse: [] })).status).toBe(200);
    const r = await sende({ geraet: g, cursor: null, ereignisse: [] });
    expect(r.status).toBe(429);
    expect(r.headers.get('retry-after')).toBe('60');
    expect(await r.json()).toEqual({ fehler: 'bremse' });
    als(await konto());
    expect((await sende({ geraet: g, cursor: null, ereignisse: [] })).status).toBe(200);
  });

  it('Zuweisungen: abgeschlossene Lektion bzw. alle Lektionen der Einheit setzen aufgabe_erledigt (nur mit lernapp_gruppen)', async () => {
    const id = await konto({ kind: true });
    const lernendeId = await lernende(id);
    const eltern = await konto();
    await db.insert(schema.elternKind).values({ elternId: eltern, lernendeId, sorgeberechtigt: true, bestaetigtAm: new Date() });
    await db.insert(schema.kontoEinwilligung).values({ lernendeId, art: 'lernapp', textVersion: 'v1', erteiltVon: eltern });
    const [gr] = await db
      .insert(schema.gruppe)
      .values({ name: { de: 'Gruppe Sprache' } })
      .returning({ id: schema.gruppe.id });
    await db.insert(schema.gruppenMitglied).values({ gruppeId: gr!.id, lernendeId });
    const aufgabe = async (bezug: Record<string, string>) =>
      (
        await db
          .insert(schema.aufgabe)
          .values({ gruppeId: gr!.id, titel: 'Lektion üben', bezug: { art: 'lernapp', ...bezug } as never })
          .returning({ id: schema.aufgabe.id })
      )[0]!.id;
    const zurLektion = await aufgabe({ kurs: 'tr-aus-de', einheit: 'tr.a1.test', lektion: 'tr.a1.test.l01' });
    const zurEinheit = await aufgabe({ kurs: 'tr-aus-de', einheit: 'tr.a1.test' });
    const zumKurs = await aufgabe({ kurs: 'tr-aus-de' });
    const andereRichtung = await aufgabe({ kurs: 'tr-aus-ar', einheit: 'tr.a1.test', lektion: 'tr.a1.test.l01' });
    const erledigt = async () =>
      (await db.select().from(schema.aufgabeErledigt).where(eq(schema.aufgabeErledigt.lernendeId, lernendeId)))
        .map((z) => z.aufgabeId)
        .sort();
    als(id);
    const g = randomUUID();

    process.env.FUNKTION_LERNAPP_GRUPPEN = 'aus';
    await sync(g, [lektion(g, 0, vor(30), 'tr-aus-de.a1.test.l01')]);
    expect(await erledigt()).toEqual([]);
    delete process.env.FUNKTION_LERNAPP_GRUPPEN;

    await sync(g, [lektion(g, 1, vor(20), 'tr-aus-de.a1.test.l01')]);
    expect(await erledigt()).toEqual([zurLektion]);
    await sync(g, [lektion(g, 2, vor(10), 'tr-aus-de.a1.test.l02')]);
    // die Einheit hat vier Lektionen (l03: Typen aus L2-01, l04: Typen aus L2-02): erst mit der letzten ist sie erledigt
    expect(await erledigt()).toEqual([zurLektion]);
    await sync(g, [lektion(g, 3, vor(8), 'tr-aus-de.a1.test.l03')]);
    expect(await erledigt()).toEqual([zurLektion]);
    await sync(g, [lektion(g, 4, vor(7), 'tr-aus-de.a1.test.l04')]);
    expect(await erledigt()).toEqual([zurLektion, zurEinheit].sort());
    // erneut: idempotent; Kurs ohne Einheit und andere Richtung bleiben offen
    await sync(g, [lektion(g, 5, vor(5), 'tr-aus-de.a1.test.l02')]);
    expect(await erledigt()).toEqual([zurLektion, zurEinheit].sort());
    expect(await erledigt()).not.toContain(zumKurs);
    expect(await erledigt()).not.toContain(andereRichtung);
  });
});

describe('Verdichtung im Löschlauf (ADR 0038 Nr. 10)', () => {
  it('Bewertungen älter als 12 Monate: Basis statt Ereignis, Kartenstand unverändert, neue Geräte leiten denselben Stand ab', async () => {
    const id = await konto();
    als(id);
    const geraetA = await geraet(id, 'Gerät A');
    const tage = (n: number) => new Date(Date.now() - n * 86_400_000);
    for (const [note, d] of [
      ['gut', tage(420)],
      ['gut', tage(410)],
      ['schwer', tage(380)],
      ['nochmal', tage(30)],
      ['gut', tage(2)],
    ] as const)
      await haengeAn(geraetA.sp, geraetA.profil, entwurf(note), { jetzt: d });
    await haengeAn(geraetA.sp, geraetA.profil, entwurf('gut', 'tr-aus-de:tr.a1.test.w002'), { jetzt: tage(400) });
    expect(await synchronisiere(geraetA.sp, geraetA.profil, { abruf })).toMatchObject({ ok: true, gesendet: 6 });
    const vorher = await serverKarten(id);

    const r = await verdichteLernapp();
    expect(r).toMatchObject({ konten: 1, ereignisse: 4, karten: 2 });
    expect(await serverKarten(id)).toEqual(vorher);
    const rest = await db.select().from(schema.lernappEreignis).where(eq(schema.lernappEreignis.benutzerId, id));
    expect(rest).toHaveLength(2);
    const basen = await db
      .select({ basis: schema.lernappKarte.basis, basisBis: schema.lernappKarte.basisBis })
      .from(schema.lernappKarte)
      .where(eq(schema.lernappKarte.benutzerId, id));
    expect(basen.every((b) => b.basis && b.basisBis)).toBe(true);
    expect(await verdichteLernapp()).toEqual({ konten: 0, ereignisse: 0, karten: 0 });

    // Neues Gerät: bekommt die verbleibenden Ereignisse und die Basen – gleicher Stand wie der Server
    const geraetC = await geraet(id, 'Gerät C');
    expect(await synchronisiere(geraetC.sp, geraetC.profil, { abruf })).toMatchObject({ ok: true, empfangen: 2, neuAbgeleitet: true });
    expect(await lokaleKarten(geraetC.sp, geraetC.profil.id)).toEqual(vorher);
    expect((await geraetC.sp.lies('sync', geraetC.profil.id))?.basen).toBeDefined();
    // Gerät A (mit allen alten Ereignissen) bleibt gleich, auch mit den Basen
    await synchronisiere(geraetA.sp, geraetA.profil, { abruf });
    expect(await lokaleKarten(geraetA.sp, geraetA.profil.id)).toEqual(vorher);
    // Basen kommen nur, wenn sich ihr Stand geändert hat
    const stand = await geraetC.sp.lies('sync', geraetC.profil.id);
    const ohne = await sync(geraetC.profil.geraet, [], stand!.zeiger, stand!.basisStand);
    expect(ohne.basen).toBeUndefined();
  });
});

describe('Client (lokal/sync.ts)', () => {
  it('zwei Geräte lernen offline dieselbe Karte unterschiedlich und zeigen nach dem Abgleich denselben Stand wie der Server', async () => {
    const id = await konto();
    als(id);
    const a = await geraet(id, 'Gerät A');
    const b = await geraet(id, 'Gerät B');
    await haengeAn(a.sp, a.profil, entwurf('gut'), { jetzt: vor(120) });
    await haengeAn(b.sp, b.profil, entwurf('nochmal'), { jetzt: vor(90) });
    await haengeAn(a.sp, a.profil, entwurf('schwer'), { jetzt: vor(60) });
    await haengeAn(b.sp, b.profil, { art: 'xp', daten: { menge: 5, grund: 'lektion' } }, { jetzt: vor(60) });

    expect(await synchronisiere(a.sp, a.profil, { abruf })).toMatchObject({ ok: true, gesendet: 2, empfangen: 0 });
    expect(await synchronisiere(b.sp, b.profil, { abruf })).toMatchObject({ ok: true, gesendet: 2, empfangen: 2 });
    expect(await synchronisiere(a.sp, a.profil, { abruf })).toMatchObject({ ok: true, gesendet: 0, empfangen: 2 });
    const server = await serverKarten(id);
    expect(Object.keys(server)).toEqual([KARTE]);
    expect(await lokaleKarten(a.sp, a.profil.id)).toEqual(server);
    expect(await lokaleKarten(b.sp, b.profil.id)).toEqual(server);
    // nichts mehr offen; ein weiterer Abgleich ändert nichts
    expect(await synchronisiere(a.sp, a.profil, { abruf })).toMatchObject({ ok: true, gesendet: 0, empfangen: 0, neuAbgeleitet: false });
  });

  it('ohne Konto keine Anfrage; Abgleich aus → „aus“; ohne Einwilligung → „einwilligung“; der Planer ruht danach', async () => {
    let anfragen = 0;
    const zaehlend: Abruf = async (adresse, init) => {
      anfragen++;
      return abruf(adresse, init);
    };
    const ohne = await geraet(null);
    await haengeAn(ohne.sp, ohne.profil, entwurf('gut'));
    expect(await synchronisiere(ohne.sp, ohne.profil, { abruf: zaehlend })).toMatchObject({ ok: false, grund: 'nichtGebunden' });
    const planer = erzeugeAbgleich({ speicher: ohne.sp, profil: () => aktivesProfil(ohne.sp), abruf: zaehlend });
    expect(await planer.beimOeffnen()).toBeNull();
    planer.beenden();
    expect(anfragen).toBe(0);

    const id = await konto({ einwilligung: false });
    als(id);
    const mit = await geraet(id);
    await haengeAn(mit.sp, mit.profil, entwurf('gut'));
    expect(await synchronisiere(mit.sp, mit.profil, { abruf: zaehlend })).toMatchObject({ ok: false, grund: 'einwilligung' });
    expect(await ladeSitzung(zaehlend)).toEqual({ angemeldet: true, konto: id, einwilligung: 'fehlt' });
    process.env.FUNKTION_LERNAPP_SYNC = 'aus';
    expect(await synchronisiere(mit.sp, mit.profil, { abruf: zaehlend })).toMatchObject({ ok: false, grund: 'aus' });
    expect(await ladeSitzung(zaehlend)).toBeNull();
    // Planer beim Öffnen: Sitzung zuerst; ohne Abgleich kein POST
    const vorher = anfragen;
    const planer2 = erzeugeAbgleich({ speicher: mit.sp, profil: () => mit.profil, abruf: zaehlend });
    expect(await planer2.beimOeffnen()).toBeNull();
    expect(anfragen).toBe(vorher + 1);
    planer2.beenden();
  });

  it('Planer beim Öffnen mit Konto und Einwilligung gleicht ab', async () => {
    const id = await konto();
    als(id);
    const d = await geraet(id);
    await haengeAn(d.sp, d.profil, entwurf('gut'));
    const ergebnisse: unknown[] = [];
    const planer = erzeugeAbgleich({ speicher: d.sp, profil: () => d.profil, abruf, beiErgebnis: (e) => ergebnisse.push(e) });
    expect(await planer.beimOeffnen()).toMatchObject({ ok: true, gesendet: 1 });
    expect(ergebnisse).toHaveLength(1);
    planer.beenden();
    // ein anderes Konto ist angemeldet: kein Abgleich dieses Profils
    als(await konto());
    const planer2 = erzeugeAbgleich({ speicher: d.sp, profil: () => d.profil, abruf });
    expect(await planer2.beimOeffnen()).toBeNull();
    planer2.beenden();
  });

  it('erste Anmeldung: Übernahme-Frage nur mit lokalem Fortschritt; ja bindet das Profil, nein legt ein leeres an', async () => {
    const id = await konto();
    als(id);
    const leer = await geraet(null);
    expect(await bindungFuer(leer.sp, leer.profil, id)).toBe('binden');
    const mit = await geraet(null, 'Lernprofil');
    await haengeAn(mit.sp, mit.profil, entwurf('gut'), { jetzt: vor(10) });
    expect(await bindungFuer(mit.sp, mit.profil, id)).toBe('frage');

    const nein = await beantworteUebernahme(mit.sp, mit.profil, id, false);
    expect(nein.id).not.toBe(mit.profil.id);
    expect(nein.benutzerId).toBe(id);
    expect((await aktivesProfil(mit.sp))?.id).toBe(nein.id);
    expect((await mit.sp.lies('profile', mit.profil.id))?.benutzerId).toBeUndefined();
    expect(await bindungFuer(mit.sp, nein, 'anderes-konto')).toBe('anderesKonto');

    const ja = await beantworteUebernahme(mit.sp, mit.profil, id, true);
    expect(ja.id).toBe(mit.profil.id);
    expect(await bindungFuer(mit.sp, ja, id)).toBe('gebunden');
    expect(await synchronisiere(mit.sp, ja, { abruf })).toMatchObject({ ok: true, gesendet: 1 });
  });

  it('neu angelegter Lernstand auf dem Server (Löschung nach Inaktivität): das Gerät sendet sein ganzes Protokoll neu', async () => {
    const id = await konto();
    als(id);
    const d = await geraet(id);
    await haengeAn(d.sp, d.profil, entwurf('gut'), { jetzt: vor(50) });
    await haengeAn(d.sp, d.profil, entwurf('schwer'), { jetzt: vor(40) });
    expect(await synchronisiere(d.sp, d.profil, { abruf })).toMatchObject({ ok: true, gesendet: 2 });
    const vorher = await serverKarten(id);
    await db.delete(schema.lernappProfil).where(eq(schema.lernappProfil.benutzerId, id));
    await haengeAn(d.sp, d.profil, entwurf('gut'), { jetzt: vor(1) });
    const r = await synchronisiere(d.sp, d.profil, { abruf });
    expect(r.ok).toBe(true);
    expect(await db.select().from(schema.lernappEreignis).where(eq(schema.lernappEreignis.benutzerId, id))).toHaveLength(3);
    expect(Object.keys(await serverKarten(id))).toEqual(Object.keys(vorher));
    expect(await lokaleKarten(d.sp, d.profil.id)).toEqual(await serverKarten(id));
  });
});

describe('S-L1 M-1: Abgleich nur für das gebundene Konto', () => {
  it('Anfrage für ein anderes Konto als die Sitzung → 409 „konto“; nichts wird geschrieben, kein Lernstand angelegt', async () => {
    const a = await konto();
    const b = await konto();
    als(b);
    const g = randomUUID();
    const r = await sende({ konto: a, geraet: g, cursor: null, ereignisse: [xp(g, 0, vor(5))] });
    expect(r.status).toBe(409);
    expect(r.headers.get('cache-control')).toContain('no-store');
    expect(await r.json()).toEqual({ fehler: 'konto' });
    for (const id of [a, b]) {
      expect(await db.select().from(schema.lernappEreignis).where(eq(schema.lernappEreignis.benutzerId, id))).toHaveLength(0);
      expect(await db.select().from(schema.lernappProfil).where(eq(schema.lernappProfil.benutzerId, id))).toHaveLength(0);
    }
  });

  it('geteiltes Gerät: Profil an A, danach Sitzung B – kein Abgleich in das Konto B, der Planer ruht; zurück bei A geht es weiter', async () => {
    const a = await konto();
    const b = await konto();
    als(a);
    const d = await geraet(a);
    await haengeAn(d.sp, d.profil, entwurf('gut'), { jetzt: vor(10) });
    expect(await synchronisiere(d.sp, d.profil, { abruf })).toMatchObject({ ok: true, gesendet: 1 });
    // Kontowechsel (z. B. das Kind meldet sich an), ohne dass die Seite die Sitzung neu geprüft hat
    als(b);
    await haengeAn(d.sp, d.profil, entwurf('schwer'), { jetzt: vor(5) });
    expect(await synchronisiere(d.sp, d.profil, { abruf })).toMatchObject({ ok: false, grund: 'konto', gesendet: 0 });
    expect(await db.select().from(schema.lernappEreignis).where(eq(schema.lernappEreignis.benutzerId, b))).toHaveLength(0);
    expect(await db.select().from(schema.lernappEreignis).where(eq(schema.lernappEreignis.benutzerId, a))).toHaveLength(1);
    // Planer: Die Sitzungsprüfung je Seitenaufruf sagt nein; danach senden weder nachHandlung noch abgleichen
    let posts = 0;
    const zaehlend: Abruf = async (adresse, init) => {
      if (adresse === SYNC_ADRESSE) posts++;
      return abruf(adresse, init);
    };
    const planer = erzeugeAbgleich({ speicher: d.sp, profil: () => d.profil, abruf: zaehlend, verzoegerungMs: 0 });
    expect(await planer.pruefeSitzung()).toBe(false);
    planer.nachHandlung();
    expect(await planer.abgleichen()).toBeNull();
    expect(posts).toBe(0);
    planer.beenden();
    // derselbe Planer ruht auch nach einer 409 aus einem Lauf (Wechsel nach der Prüfung, z. B. im zweiten Tab)
    als(a);
    const planer2 = erzeugeAbgleich({ speicher: d.sp, profil: () => d.profil, abruf: zaehlend, verzoegerungMs: 0 });
    expect(await planer2.pruefeSitzung()).toBe(true);
    als(b);
    expect(await planer2.abgleichen()).toMatchObject({ ok: false, grund: 'konto' });
    expect(await planer2.abgleichen()).toBeNull();
    planer2.beenden();
    // zurück bei A: der ausstehende Stand geht an A
    als(a);
    expect(await synchronisiere(d.sp, d.profil, { abruf })).toMatchObject({ ok: true, gesendet: 1 });
    expect(await db.select().from(schema.lernappEreignis).where(eq(schema.lernappEreignis.benutzerId, a))).toHaveLength(2);
    expect(await db.select().from(schema.lernappEreignis).where(eq(schema.lernappEreignis.benutzerId, b))).toHaveLength(0);
  });
});

describe('S-L1 M-2: Grenzen je Konto und gezielte Ableitung', () => {
  const zeile = (benutzerId: string, e: Ereignis) => ({
    benutzerId,
    geraet: e.geraet,
    seq: e.seq,
    am: new Date(e.am),
    tag: e.tag,
    art: e.art,
    daten: e.daten as Record<string, unknown>,
  });
  const anzahl = async (benutzerId: string) =>
    (await db.select().from(schema.lernappEreignis).where(eq(schema.lernappEreignis.benutzerId, benutzerId))).length;

  it('Geräte: über GRENZEN.geraete → 429 „grenze“ mit Retry-After, nichts geschrieben; bekannte Geräte und Lesen gehen weiter', async () => {
    const id = await konto();
    als(id);
    await db.insert(schema.lernappProfil).values({ benutzerId: id, zuletztAktivAm: new Date() });
    const bekannt = Array.from({ length: GRENZEN.geraete }, () => randomUUID());
    await db.insert(schema.lernappEreignis).values(bekannt.map((g) => zeile(id, xp(g, 0, vor(10)))));
    const g = randomUUID();
    const r = await sende({ geraet: g, cursor: null, ereignisse: [xp(g, 0, vor(5))] });
    expect(r.status).toBe(429);
    expect(r.headers.get('retry-after')).toBe(String(GRENZEN.wartenSekunden));
    expect(await r.json()).toEqual({ fehler: 'grenze' });
    expect(await anzahl(id)).toBe(GRENZEN.geraete);
    expect((await sync(bekannt[0]!, [xp(bekannt[0]!, 1, vor(4))])).angenommen).toBe(1);
    expect((await sync(g, [])).ereignisse.length).toBeGreaterThan(0);
    // ein anderes Konto bleibt frei
    als(await konto());
    expect((await sync(g, [xp(g, 0, vor(5))])).angenommen).toBe(1);
  });

  it('gesamt und je 24 Stunden: die Grenze greift ohne zu schreiben; nach 24 Stunden ist wieder Platz', async () => {
    const id = await konto();
    const g = randomUUID();
    const klein = { gesamt: 1000, jeTag: 5, geraete: 50, seqAbstand: 50_000 };
    const anfrage = (ereignisse: Ereignis[]) => ({ konto: id, geraet: g, cursor: null, ereignisse });
    const jetzt = new Date();
    expect(await gleicheKontoAb(id, anfrage([0, 1, 2].map((i) => xp(g, i, vor(10)))), jetzt, klein)).toMatchObject({
      antwort: { angenommen: 3 },
    });
    expect(await gleicheKontoAb(id, anfrage([3, 4, 5].map((i) => xp(g, i, vor(9)))), jetzt, klein)).toEqual({ grenze: 'jeTag' });
    expect(await anzahl(id)).toBe(3);
    const morgen = new Date(jetzt.getTime() + 86_400_000 + 60_000);
    expect(await gleicheKontoAb(id, anfrage([3, 4, 5].map((i) => xp(g, i, vor(9)))), morgen, klein)).toMatchObject({
      antwort: { angenommen: 3 },
    });
    expect(await gleicheKontoAb(id, anfrage([xp(g, 6, vor(8))]), morgen, { ...klein, gesamt: 6 })).toEqual({ grenze: 'gesamt' });
    expect(await anzahl(id)).toBe(6);
  });

  it('Folgenummer: mehr als GRENZEN.seqAbstand über der höchsten gespeicherten des Geräts → abgelehnt', async () => {
    const id = await konto();
    als(id);
    const g = randomUUID();
    const a = await sync(g, [xp(g, 0, vor(10)), xp(g, GRENZEN.seqAbstand, vor(9)), xp(g, GRENZEN.seqAbstand + 1, vor(8))]);
    expect(a.angenommen).toBe(1);
    expect(a.abgelehnt).toEqual([
      { geraet: g, seq: GRENZEN.seqAbstand },
      { geraet: g, seq: GRENZEN.seqAbstand + 1 },
    ]);
    // ab der gespeicherten Nummer 0 ist seqAbstand erlaubt
    expect((await sync(g, [xp(g, GRENZEN.seqAbstand, vor(7))], a.cursor)).angenommen).toBe(1);
  });

  it('Lerntage aus den Ereignissen genau dieser Tage = volle Ableitung (Tagesziele im Verlauf, Pausen über den Jahreswechsel)', async () => {
    const id = await konto();
    als(id);
    const g = randomUUID();
    const h = randomUUID();
    const am = vor(30).toISOString();
    const e = (geraet: string, seq: number, tag: string, art: Ereignis['art'], daten: unknown) =>
      ({ geraet, seq, am, tag, art, daten }) as Ereignis;
    const lektionAm = (geraet: string, seq: number, tag: string) =>
      e(geraet, seq, tag, 'lektion', { kurs: 'tr-aus-de', lektion: 'tr-aus-de.a1.test.l01', art: 'lektion', richtig: 3, gesamt: 4 });
    const runden: Ereignis[][] = [
      [
        lektionAm(g, 0, '2025-12-27'),
        e(g, 1, '2025-12-27', 'xp', { menge: 10, grund: 'lektion' }),
        e(g, 2, '2025-12-29', 'xp', { menge: 15, grund: 'lektion' }),
      ],
      [
        e(g, 3, '2025-12-28', 'tagesziel', { ziel: { art: 'xp', wert: 20 } }),
        e(g, 4, '2025-12-30', 'pause', { von: '2025-12-30', bis: '2026-01-03' }),
      ],
      [
        lektionAm(h, 0, '2026-01-02'),
        e(h, 1, '2026-01-02', 'xp', { menge: 20, grund: 'lektion' }),
        e(h, 2, '2026-01-04', 'xp', { menge: 5, grund: 'lektion' }),
      ],
      [
        e(h, 3, '2025-12-26', 'tagesziel', { ziel: { art: 'kein' } }),
        e(g, 5, '2026-01-05', 'tagesziel', { ziel: { art: 'lektionen', wert: 1 } }),
      ],
      [lektionAm(g, 6, '2026-01-06'), e(g, 7, '2025-12-31', 'xp', { menge: 15, grund: 'lektion' })],
    ];
    for (const runde of runden) await sync(runde[0]!.geraet, runde);

    const alle = (await db.select().from(schema.lernappEreignis).where(eq(schema.lernappEreignis.benutzerId, id))).map((z) =>
      EreignisSchema.parse(alsEreignis(z)),
    );
    const voll = leiteAb(alle, lerntagVon(new Date(), 'UTC'));
    const tage = await db.select().from(schema.lernappTag).where(eq(schema.lernappTag.benutzerId, id));
    expect(tage.map((t) => t.tag).sort()).toEqual([
      '2025-12-27',
      '2025-12-29',
      '2025-12-30',
      '2025-12-31',
      '2026-01-01',
      '2026-01-02',
      '2026-01-03',
      '2026-01-04',
      '2026-01-06',
    ]);
    for (const t of tage) {
      const s = heuteStand(voll, t.tag);
      expect({ tag: t.tag, xp: t.xp, lektionen: t.lektionen, pause: t.pause, ziel: t.zielErreicht }).toEqual({
        tag: t.tag,
        xp: s.xp,
        lektionen: s.lektionen,
        pause: voll.ruhetage.has(t.tag),
        ziel: s.erreicht === true,
      });
    }
    expect(tage.find((t) => t.tag === '2026-01-01')).toMatchObject({ pause: true });
    expect(tage.find((t) => t.tag === '2025-12-29')).toMatchObject({ xp: 15, zielErreicht: false });
  });
});
