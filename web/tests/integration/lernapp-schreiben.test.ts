import { randomUUID } from 'node:crypto';
import { and, eq } from 'drizzle-orm';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { db as appDb, schema } from '@/lib/db';
import { verschluessele } from '@/lib/krypto';
import type { ListeAntwort, PruefAntwort } from '@/lib/lernapp/schreiben/abgabe';
import { kontoUmgebung } from './hilfen/konto';

/**
 * Korrekturweg der Lehrkraft (L5-03; PLAN §4.3; ADR 0042 Nr. 11; KERN 4.0 §5 und §6) gegen PGlite: Abgabe nur mit Konto,
 * Einwilligung `lernapp` (Kind: die der Eltern), Schalter `lernapp_gruppen` und Zuweisung an eine eigene Gruppe; Text und
 * Kommentar verschlüsselt im Ruhezustand, nie im Audit; Gruppenisolation (fremde Lehrkraft, Aufsicht, Eltern, Kind,
 * Administration lesen nie); Austritt und Widerruf machen Abgaben sofort unlesbar; Rückgabe mit Prüfliste und Einstufung,
 * Ansicht der eigenen Abgaben, Löschen jederzeit (auch ohne Schalter), Datenexport, Löschlauf nach 12 Monaten. Route:
 * Ursprung, Anmeldung, Größe, Idempotenz, Grenzen. Testdaten fiktiv, Namen Platzhalter, Texte neutrale Alltagssätze.
 * Gegenprüfung L5-03: Rückgabe einer gerade gelöschten Abgabe ohne Audit-Eintrag; gleichzeitige Abgaben überschreiten die
 * Grenzen nicht.
 */
// Einmaliger Eingriff vor der nächsten Einwilligungsprüfung – in `lesbare` liegt sie zwischen Lesen und Schreiben der
// Rückgabe; so lässt sich „die Person löscht ihre Abgabe, während die Lehrkraft zurückgibt“ ohne Zufall nachstellen
const zwischendurch = vi.hoisted(() => ({ einmal: null as null | (() => Promise<unknown>) }));
vi.mock('@/lib/lernapp/sync/server', async (original) => {
  const echt = await original<typeof import('@/lib/lernapp/sync/server')>();
  return {
    ...echt,
    lernappEinwilligung: async (...a: Parameters<typeof echt.lernappEinwilligung>) => {
      const eingriff = zwischendurch.einmal;
      zwischendurch.einmal = null;
      if (eingriff) await eingriff();
      return echt.lernappEinwilligung(...a);
    },
  };
});

const { client, db } = await kontoUmgebung();
const { auth } = await import('@/lib/auth/server');
const route = await import('@/app/api/lernapp/schreiben/route');
const dienst = await import('@/lib/lernapp/schreiben/dienst');
const gruppenDienst = await import('@/lib/lernapp/gruppe/dienst');
const { ladeGruppenKontext } = await import('@/lib/rechte/gemeinde');
const { exportiereKontodaten } = await import('@/server/queries/konto');
const { gemeindeLoeschlauf } = await import('@/lib/loeschen/gemeinde');
const { lernappTestkurs } = await import('../../drizzle/seeds/lernapp-test');
afterAll(() => client.close());
afterEach(() => {
  delete process.env.FUNKTION_LERNAPP_GRUPPEN;
});

const api = auth.api as unknown as Record<string, unknown>;
function als(id: string | null) {
  api.getSession = async () =>
    id
      ? {
          user: { id, name: '[Name]', email: `${id.slice(0, 8)}@example.test`, twoFactorEnabled: false, gesperrtAm: null },
          session: { id: `s-${id}`, createdAt: new Date(), userId: id },
        }
      : null;
}

type Rolle = 'gemeinde' | 'schueler' | 'eltern' | 'lehrkraft';
async function konto(name: string, { kind = false, rollen = ['gemeinde'] as Rolle[], einwilligung = false } = {}): Promise<string> {
  const id = randomUUID();
  await db.insert(schema.user).values({ id, name, email: `${id.slice(0, 8)}@example.test`, emailVerified: true });
  await db.insert(schema.kontoProfil).values({ benutzerId: id, anzeigename: name, istKind: kind });
  for (const rolle of rollen) await db.insert(schema.gemeindeRolle).values({ benutzerId: id, rolle });
  if (einwilligung) await db.insert(schema.kontoEinwilligung).values({ benutzerId: id, art: 'lernapp', textVersion: 'v1', erteiltVon: id });
  return id;
}

async function lernende(benutzerId: string, name: string, sechzehnAm: string): Promise<string> {
  const v = verschluessele({ name });
  const [z] = await db
    .insert(schema.lernende)
    .values({ benutzerId, datenVerschluesselt: v.daten, schluesselId: v.schluesselId, anzeigename: name, sechzehnAm })
    .returning({ id: schema.lernende.id });
  return z!.id;
}

async function gruppe(name: string): Promise<string> {
  const [g] = await db
    .insert(schema.gruppe)
    .values({ name: { de: name } })
    .returning({ id: schema.gruppe.id });
  return g!.id;
}

const KURS = 'tr-aus-de' as const;
/** Schreibaufgabe des Testkurses (Lektion l04) und eine Aufgabe anderen Typs */
const AUFGABE = 'tr.a1.e01.l04.a08';
const KEINE_SCHREIBAUFGABE = 'tr.a1.e01.l01.a01';
const TEXT = 'Ben su içiyorum. Kitap yeni.';
const KIND_TEXT = 'Ev büyük.';
const KOMMENTAR = '[Kommentar] Schöne Sätze; achte auf die Endungen.';

const KOPF = { 'sec-fetch-site': 'same-origin', host: 'example.test' };
const ADRESSE = 'https://example.test/api/lernapp/schreiben';
const pruefe = (aufgabe = AUFGABE, kopf: Record<string, string> = KOPF) =>
  route.GET(new Request(`${ADRESSE}?ui=de&kurs=${KURS}&aufgabe=${aufgabe}`, { headers: kopf }));
const liste = () => route.GET(new Request(`${ADRESSE}?ui=de`, { headers: KOPF }));
const loesche = (id: string) => route.DELETE(new Request(`${ADRESSE}?id=${id}`, { method: 'DELETE', headers: KOPF }));
function sende(e: Record<string, unknown>, kopf: Record<string, string> = KOPF, roh?: string): Promise<Response> {
  return route.POST(
    new Request(ADRESSE, {
      method: 'POST',
      headers: { ...kopf, 'content-type': 'application/json' },
      body: roh ?? JSON.stringify(e),
    }),
  );
}
const abgabe = (gruppeId: string, extra: Record<string, unknown> = {}) => ({
  id: randomUUID(),
  kurs: KURS,
  aufgabe: AUFGABE,
  gruppe: gruppeId,
  text: TEXT,
  pruefliste: { aufgabe: 2, grammatik: 1 },
  ...extra,
});

const ids = {} as Record<
  | 'lehrkraftA'
  | 'lehrkraftB'
  | 'aufsicht'
  | 'eltern'
  | 'kind'
  | 'erwachsen'
  | 'ohne'
  | 'fremd'
  | 'admin'
  | 'gruppe1'
  | 'gruppe2'
  | 'kindL'
  | 'erwachsenL',
  string
>;
const kontext = (id: string) => ladeGruppenKontext(id);

beforeAll(async () => {
  await lernappTestkurs(appDb);
  ids.gruppe1 = await gruppe('[Gruppe Eins]');
  ids.gruppe2 = await gruppe('[Gruppe Zwei]');
  ids.lehrkraftA = await konto('[Lehrkraft] A', { rollen: ['lehrkraft'] });
  ids.lehrkraftB = await konto('[Lehrkraft] B', { rollen: ['lehrkraft'] });
  ids.aufsicht = await konto('[Aufsicht] C', { rollen: ['lehrkraft'] });
  await db.insert(schema.gruppenLeitung).values([
    { gruppeId: ids.gruppe1, benutzerId: ids.lehrkraftA, rolle: 'lehrkraft' },
    { gruppeId: ids.gruppe1, benutzerId: ids.aufsicht, rolle: 'aufsicht' },
    { gruppeId: ids.gruppe2, benutzerId: ids.lehrkraftB, rolle: 'lehrkraft' },
  ]);
  ids.eltern = await konto('[Elternteil] E', { rollen: ['gemeinde', 'eltern'] });
  ids.kind = await konto('[Kind] K', { kind: true, rollen: ['schueler'] });
  ids.kindL = await lernende(ids.kind, '[Kind] K', '2033-01-01');
  await db
    .insert(schema.elternKind)
    .values({ elternId: ids.eltern, lernendeId: ids.kindL, sorgeberechtigt: true, bestaetigtAm: new Date() });
  ids.erwachsen = await konto('[Erwachsen] W', { rollen: ['schueler'], einwilligung: true });
  ids.erwachsenL = await lernende(ids.erwachsen, '[Erwachsen] W', '2010-01-01');
  ids.ohne = await konto('[Ohne] O', { rollen: ['schueler'] });
  const ohneL = await lernende(ids.ohne, '[Ohne] O', '2010-01-01');
  ids.fremd = await konto('[Fremd] X', { rollen: ['schueler'], einwilligung: true });
  const fremdL = await lernende(ids.fremd, '[Fremd] X', '2010-01-01');
  ids.admin = await konto('[Administration] V');
  await db.insert(schema.rolleZuweisung).values({ benutzerId: ids.admin, rolle: 'administration' });
  await db
    .insert(schema.gruppenMitglied)
    .values([
      ...[ids.kindL, ids.erwachsenL, ohneL].map((lernendeId) => ({ gruppeId: ids.gruppe1, lernendeId })),
      { gruppeId: ids.gruppe2, lernendeId: fremdL },
    ]);
  // Gruppe 1: Lektion l04 mit der Schreibaufgabe zugewiesen; Gruppe 2: nur Lektion l01
  await gruppenDienst.weiseZu(await kontext(ids.lehrkraftA), ids.gruppe1, {
    kurs: KURS,
    einheit: 'tr.a1.e01',
    lektion: 'tr.a1.e01.l04',
    faellig: null,
    titel: 't',
  });
  await gruppenDienst.weiseZu(await kontext(ids.lehrkraftB), ids.gruppe2, {
    kurs: KURS,
    einheit: 'tr.a1.e01',
    lektion: 'tr.a1.e01.l01',
    faellig: null,
    titel: 't',
  });
});

describe('Abgabe: nur mit Konto, Einwilligung, Schalter und Zuweisung an die eigene Gruppe', () => {
  it('Erwachsene/r: Prüfung nennt die eigene Gruppe; Abgabe 201, Wiederholung derselben Kennung 200 ohne Doppel', async () => {
    als(ids.erwachsen);
    const p = await pruefe();
    expect(p.status).toBe(200);
    expect(p.headers.get('cache-control')).toContain('no-store');
    expect((await p.json()) as PruefAntwort).toEqual({ moeglich: true, gruppen: [{ id: ids.gruppe1, name: '[Gruppe Eins]' }] });
    const e = abgabe(ids.gruppe1);
    const r = await sende(e);
    expect(r.status).toBe(201);
    expect(await r.json()).toEqual({ status: 'eingereicht' });
    const nochmal = await sende(e);
    expect(nochmal.status).toBe(200);
    expect(await nochmal.json()).toEqual({ status: 'vorhanden' });
    const zeilen = await db.select().from(schema.lernappSchreibabgabe).where(eq(schema.lernappSchreibabgabe.id, e.id));
    expect(zeilen).toHaveLength(1);
    // 12 Monate nach der Abgabe gelöscht (loeschenAb)
    const z = zeilen[0]!;
    const monate =
      (z.loeschenAb.getUTCFullYear() - z.eingereichtAm.getUTCFullYear()) * 12 + z.loeschenAb.getUTCMonth() - z.eingereichtAm.getUTCMonth();
    expect(monate).toBe(12);
    // Dieselbe Kennung von einem anderen Konto: Konflikt, ohne etwas zu verraten
    als(ids.fremd);
    const fremd = await sende({ ...e, gruppe: ids.gruppe2 });
    expect(fremd.status).toBe(409);
    expect(await fremd.json()).toEqual({ fehler: 'konflikt' });
  });

  it('Text verschlüsselt im Ruhezustand; Audit nur mit Kennungen', async () => {
    const zeilen = await db.select({ t: schema.lernappSchreibabgabe.textVerschluesselt }).from(schema.lernappSchreibabgabe);
    expect(zeilen.length).toBeGreaterThan(0);
    for (const z of zeilen) {
      const bytes = Buffer.from(z.t);
      for (const klar of ['su içiyorum', 'Kitap', 'Ben su']) {
        expect(bytes.includes(Buffer.from(klar, 'utf8'))).toBe(false);
        expect(bytes.toString('latin1')).not.toContain(klar);
      }
    }
    const audit = await db.select().from(schema.auditEintrag).where(eq(schema.auditEintrag.aktion, 'lernapp.schreibabgabe_eingereicht'));
    expect(audit.length).toBeGreaterThan(0);
    for (const a of audit) {
      expect(Object.keys(a.details ?? {})).toEqual(['abgabe']);
      expect(JSON.stringify(a)).not.toContain('Kitap');
    }
  });

  it('nicht zugewiesen, fremde Gruppe, keine Schreibaufgabe, ohne Einwilligung → abgelehnt; der Text bleibt auf dem Gerät', async () => {
    als(ids.fremd);
    // Gruppe 2 hat nur Lektion l01 zugewiesen
    expect(await (await pruefe()).json()).toEqual({ moeglich: false, grund: 'zuweisung' });
    const r = await sende(abgabe(ids.gruppe2));
    expect(r.status).toBe(403);
    expect(await r.json()).toEqual({ fehler: 'zuweisung' });
    // an Gruppe 1 (nicht Mitglied) ebenfalls nicht
    expect((await sende(abgabe(ids.gruppe1))).status).toBe(403);
    als(ids.erwachsen);
    expect(await (await pruefe(KEINE_SCHREIBAUFGABE)).json()).toEqual({ moeglich: false, grund: 'aufgabe' });
    expect((await sende(abgabe(ids.gruppe1, { aufgabe: KEINE_SCHREIBAUFGABE }))).status).toBe(404);
    // Ohne Einwilligung
    als(ids.ohne);
    expect(await (await pruefe()).json()).toEqual({ moeglich: false, grund: 'einwilligung' });
    expect((await sende(abgabe(ids.gruppe1))).status).toBe(403);
    const ohne = await db.select().from(schema.lernappSchreibabgabe).where(eq(schema.lernappSchreibabgabe.benutzerId, ids.ohne));
    expect(ohne).toEqual([]);
  });

  it('Kind: nur mit der Einwilligung der Eltern', async () => {
    als(ids.kind);
    expect(await (await pruefe()).json()).toEqual({ moeglich: false, grund: 'eltern' });
    const vorher = await sende(abgabe(ids.gruppe1));
    expect(vorher.status).toBe(403);
    expect(await vorher.json()).toEqual({ fehler: 'eltern' });
    await db.insert(schema.kontoEinwilligung).values({ lernendeId: ids.kindL, art: 'lernapp', textVersion: 'v1', erteiltVon: ids.eltern });
    expect((await sende(abgabe(ids.gruppe1, { text: KIND_TEXT }))).status).toBe(201);
  });

  it('Route: Ursprung, Anmeldung, Eingabe, Größe und Grenze je Aufgabe', async () => {
    als(ids.erwachsen);
    expect((await pruefe(AUFGABE, { 'sec-fetch-site': 'cross-site', host: 'example.test' })).status).toBe(403);
    expect((await sende(abgabe(ids.gruppe1), { 'sec-fetch-site': 'cross-site', host: 'example.test' })).status).toBe(403);
    expect((await sende(abgabe(ids.gruppe1, { pruefliste: { aufgabe: 4 } }))).status).toBe(400);
    expect((await sende(abgabe(ids.gruppe1, { extra: 1 }))).status).toBe(400);
    expect((await sende({}, KOPF, JSON.stringify(abgabe(ids.gruppe1, { text: 'x'.repeat(70_000) })))).status).toBe(413);
    // Höchstens drei Fassungen je Aufgabe und Gruppe (eine liegt schon vor)
    expect((await sende(abgabe(ids.gruppe1))).status).toBe(201);
    expect((await sende(abgabe(ids.gruppe1))).status).toBe(201);
    const zuViel = await sende(abgabe(ids.gruppe1));
    expect(zuViel.status).toBe(429);
    expect(await zuViel.json()).toEqual({ fehler: 'grenze' });
    als(null);
    expect((await pruefe()).status).toBe(401);
    expect((await liste()).status).toBe(401);
  });
});

describe('Lehrkraft: nur die eigene Gruppe, nur lesbare Abgaben', () => {
  it('Liste ohne Texte, offene zuerst; die Abgabe mit Text und Selbsteinschätzung', async () => {
    const a = await kontext(ids.lehrkraftA);
    const zeilen = await dienst.abgabenDerGruppe(a, ids.gruppe1);
    expect(new Set(zeilen.map((z) => z.name))).toEqual(new Set(['[Erwachsen] W', '[Kind] K']));
    expect(zeilen.every((z) => z.zustand === 'offen' && z.kurs === KURS)).toBe(true);
    expect(zeilen[0]!.aufgabe).toMatchObject({ sprache: 'tr' });
    expect(JSON.stringify(zeilen)).not.toContain('Kitap');
    const kind = zeilen.find((z) => z.name === '[Kind] K')!;
    const d = await dienst.abgabeFuerLehrkraft(a, ids.gruppe1, kind.id);
    expect(d).toMatchObject({ text: KIND_TEXT, selbst: { aufgabe: 2, grammatik: 1 }, kommentar: null, einstufung: null });
  });

  it('fremde Lehrkraft, Aufsicht, Eltern, Kind, Lernende und Administration lesen nie', async () => {
    const [eine] = await dienst.abgabenDerGruppe(await kontext(ids.lehrkraftA), ids.gruppe1);
    for (const wer of [ids.lehrkraftB, ids.aufsicht, ids.eltern, ids.kind, ids.erwachsen, ids.admin]) {
      const k = await kontext(wer);
      await expect(dienst.abgabenDerGruppe(k, ids.gruppe1)).rejects.toBeInstanceOf(dienst.KeinZugang);
      await expect(dienst.abgabeFuerLehrkraft(k, ids.gruppe1, eine!.id)).rejects.toBeInstanceOf(dienst.KeinZugang);
      await expect(
        dienst.gibZurueck(k, ids.gruppe1, eine!.id, { kommentar: 'x', pruefliste: {}, einstufung: null }),
      ).rejects.toBeInstanceOf(dienst.KeinZugang);
    }
    // Lehrkraft A über Gruppe 2 (fremd) bzw. die Abgabe aus Gruppe 1 unter der Kennung von Gruppe 2
    await expect(dienst.abgabenDerGruppe(await kontext(ids.lehrkraftA), ids.gruppe2)).rejects.toBeInstanceOf(dienst.KeinZugang);
    await expect(dienst.abgabeFuerLehrkraft(await kontext(ids.lehrkraftB), ids.gruppe2, eine!.id)).rejects.toBeInstanceOf(
      dienst.KeinZugang,
    );
    expect(await dienst.abgabenDerGruppe(await kontext(ids.lehrkraftB), ids.gruppe2)).toEqual([]);
  });

  it('Rückgabe: Kommentar verschlüsselt, Prüfliste und Einstufung; die lernende Person sieht die Rückmeldung', async () => {
    const a = await kontext(ids.lehrkraftA);
    const zeilen = await dienst.abgabenDerGruppe(a, ids.gruppe1);
    const ziel = zeilen.find((z) => z.name === '[Erwachsen] W')!;
    await dienst.gibZurueck(a, ids.gruppe1, ziel.id, {
      kommentar: KOMMENTAR,
      pruefliste: { aufgabe: 3, wortschatz: 2 },
      einstufung: 'unterwegs',
    });
    const danach = await dienst.abgabenDerGruppe(a, ids.gruppe1);
    expect(danach.find((z) => z.id === ziel.id)?.zustand).toBe('zurueckgegeben');
    expect(danach.at(-1)?.zustand).toBe('zurueckgegeben');
    const [z] = await db.select().from(schema.lernappSchreibabgabe).where(eq(schema.lernappSchreibabgabe.id, ziel.id));
    expect(z!.kommentarVerschluesselt).not.toBeNull();
    expect(Buffer.from(z!.kommentarVerschluesselt!).includes(Buffer.from('Endungen', 'utf8'))).toBe(false);
    expect(z!.rubrik).toEqual({
      pruefliste: { aufgabe: 2, grammatik: 1 },
      lehrkraft: { aufgabe: 3, wortschatz: 2 },
      einstufung: 'unterwegs',
    });
    const audit = await db.select().from(schema.auditEintrag).where(eq(schema.auditEintrag.aktion, 'lernapp.schreibabgabe_zurueckgegeben'));
    expect(audit.map((e) => e.details)).toEqual([{ abgabe: ziel.id }]);

    als(ids.erwachsen);
    const r = await liste();
    expect(r.status).toBe(200);
    const { abgaben } = (await r.json()) as ListeAntwort;
    const meine = abgaben.find((x) => x.id === ziel.id)!;
    expect(meine).toMatchObject({
      kurs: KURS,
      gruppe: '[Gruppe Eins]',
      aufgabe: { sprache: 'tr' },
      selbst: { aufgabe: 2, grammatik: 1 },
      rueckmeldung: { kommentar: KOMMENTAR, pruefliste: { aufgabe: 3, wortschatz: 2 }, einstufung: 'unterwegs' },
    });
    // nur eigene Abgaben
    expect(abgaben.every((x) => x.text !== KIND_TEXT)).toBe(true);
  });

  it('Rückgabe, während die Person ihre Abgabe löscht: KeinZugang und kein Audit-Eintrag „zurückgegeben“', async () => {
    const a = await kontext(ids.lehrkraftA);
    const offen = (await dienst.abgabenDerGruppe(a, ids.gruppe1)).find((z) => z.name === '[Erwachsen] W' && z.zustand === 'offen')!;
    const A = schema.lernappSchreibabgabe;
    // Zwischen dem Lesen (`lesbare`) und dem Schreiben verschwindet die Abgabe – wie `loescheEigeneAbgabe`
    zwischendurch.einmal = () => db.delete(A).where(eq(A.id, offen.id));
    await expect(
      dienst.gibZurueck(a, ids.gruppe1, offen.id, { kommentar: KOMMENTAR, pruefliste: { aufgabe: 1 }, einstufung: 'nochmal' }),
    ).rejects.toBeInstanceOf(dienst.KeinZugang);
    expect(zwischendurch.einmal).toBeNull();
    expect(await db.select({ id: A.id }).from(A).where(eq(A.id, offen.id))).toEqual([]);
    const audit = await db.select().from(schema.auditEintrag).where(eq(schema.auditEintrag.aktion, 'lernapp.schreibabgabe_zurueckgegeben'));
    expect(audit.filter((e) => (e.details as { abgabe?: string } | null)?.abgabe === offen.id)).toEqual([]);
  });

  it('Austritt aus der Gruppe: sofort nicht mehr lesbar (Liste, Abgabe, Rückgabe); die Person sieht sie weiter', async () => {
    const a = await kontext(ids.lehrkraftA);
    const kind = (await dienst.abgabenDerGruppe(a, ids.gruppe1)).find((z) => z.name === '[Kind] K')!;
    const heute = new Date().toISOString().slice(0, 10);
    await db
      .update(schema.gruppenMitglied)
      .set({ bis: heute })
      .where(and(eq(schema.gruppenMitglied.lernendeId, ids.kindL), eq(schema.gruppenMitglied.gruppeId, ids.gruppe1)));
    expect((await dienst.abgabenDerGruppe(a, ids.gruppe1)).some((z) => z.name === '[Kind] K')).toBe(false);
    await expect(dienst.abgabeFuerLehrkraft(a, ids.gruppe1, kind.id)).rejects.toBeInstanceOf(dienst.KeinZugang);
    await expect(dienst.gibZurueck(a, ids.gruppe1, kind.id, { kommentar: 'x', pruefliste: {}, einstufung: null })).rejects.toBeInstanceOf(
      dienst.KeinZugang,
    );
    als(ids.kind);
    const { abgaben } = (await (await liste()).json()) as ListeAntwort;
    expect(abgaben.map((x) => x.id)).toContain(kind.id);
    // und kann nicht mehr neu abgeben (keine Gruppe mit dieser Zuweisung)
    expect(await (await pruefe()).json()).toEqual({ moeglich: false, grund: 'zuweisung' });
  });

  it('Widerruf der Einwilligung: sofort nicht mehr lesbar; danach keine neue Abgabe', async () => {
    const a = await kontext(ids.lehrkraftA);
    expect((await dienst.abgabenDerGruppe(a, ids.gruppe1)).some((z) => z.name === '[Erwachsen] W')).toBe(true);
    await db
      .update(schema.kontoEinwilligung)
      .set({ widerrufenAm: new Date() })
      .where(and(eq(schema.kontoEinwilligung.benutzerId, ids.erwachsen), eq(schema.kontoEinwilligung.art, 'lernapp')));
    expect((await dienst.abgabenDerGruppe(a, ids.gruppe1)).some((z) => z.name === '[Erwachsen] W')).toBe(false);
    als(ids.erwachsen);
    expect(await (await pruefe()).json()).toEqual({ moeglich: false, grund: 'einwilligung' });
    // die eigenen Abgaben bleiben für die Person sichtbar (Art. 15)
    expect(((await (await liste()).json()) as ListeAntwort).abgaben.length).toBeGreaterThan(0);
  });
});

describe('Schalter, Löschen, Datenexport, Löschlauf', () => {
  it('Schalter `lernapp_gruppen` aus: Prüfen, Senden und Liste 404 ohne Körper; Löschen der eigenen Abgabe geht', async () => {
    als(ids.erwachsen);
    // eine Abgabe ohne Rückmeldung (die mit Rückmeldung prüft der Datenexport)
    const eine = ((await (await liste()).json()) as ListeAntwort).abgaben.find((x) => !x.rueckmeldung);
    expect(eine).toBeDefined();
    process.env.FUNKTION_LERNAPP_GRUPPEN = 'aus';
    for (const r of [await pruefe(), await liste(), await sende(abgabe(ids.gruppe1))]) {
      expect(r.status).toBe(404);
      expect(await r.text()).toBe('');
    }
    // fremde Abgabe löschen: wie „gibt es nicht“
    als(ids.fremd);
    expect((await loesche(eine!.id)).status).toBe(404);
    als(ids.erwachsen);
    const r = await loesche(eine!.id);
    expect(r.status).toBe(200);
    expect(await db.select().from(schema.lernappSchreibabgabe).where(eq(schema.lernappSchreibabgabe.id, eine!.id))).toEqual([]);
    const [audit] = await db.select().from(schema.auditEintrag).where(eq(schema.auditEintrag.aktion, 'lernapp.schreibabgabe_geloescht'));
    expect(audit?.details).toEqual({ abgabe: eine!.id });
  });

  it('Datenexport (Art. 15/20) enthält die eigenen Abgaben mit Text und Rückmeldung – keine fremden', async () => {
    const daten = (await exportiereKontodaten(ids.erwachsen)) as { lernapp: { schreibabgaben: Record<string, unknown>[] } };
    const liste = daten.lernapp.schreibabgaben;
    expect(liste.length).toBeGreaterThan(0);
    expect(liste.every((x) => x.text === TEXT)).toBe(true);
    expect(liste.some((x) => (x.rueckmeldung as { kommentar?: string } | null)?.kommentar === KOMMENTAR)).toBe(true);
    expect(JSON.stringify(liste)).not.toContain(KIND_TEXT);
    expect(JSON.stringify(liste)).not.toContain(ids.lehrkraftA);
    const kind = (await exportiereKontodaten(ids.kind)) as { lernapp: { schreibabgaben: { text: string }[] } };
    expect(kind.lernapp.schreibabgaben.map((x) => x.text)).toEqual([KIND_TEXT]);
  });

  it('abgelaufen: für niemanden mehr lesbar; der Löschlauf entfernt Abgaben nach 12 Monaten', async () => {
    const A = schema.lernappSchreibabgabe;
    const [kindAbgabe] = await db.select({ id: A.id }).from(A).where(eq(A.benutzerId, ids.kind));
    // Kind wieder in der Gruppe: lesbar, bis die Frist abläuft
    await db.update(schema.gruppenMitglied).set({ bis: null }).where(eq(schema.gruppenMitglied.lernendeId, ids.kindL));
    const a = await kontext(ids.lehrkraftA);
    expect((await dienst.abgabenDerGruppe(a, ids.gruppe1)).map((z) => z.id)).toContain(kindAbgabe!.id);
    const spaeter = new Date(Date.now() + 366 * 86_400_000);
    expect((await dienst.abgabenDerGruppe(a, ids.gruppe1, spaeter)).map((z) => z.id)).not.toContain(kindAbgabe!.id);
    expect(await dienst.eigeneAbgaben(ids.kind, 'de', spaeter)).toEqual([]);
    const vorher = (await db.select({ id: A.id }).from(A)).length;
    expect(vorher).toBeGreaterThan(0);
    const ergebnis = await gemeindeLoeschlauf(spaeter);
    expect(ergebnis.lernappAbgaben).toBe(vorher);
    expect(await db.select({ id: A.id }).from(A)).toEqual([]);
  });
});

describe('Gleichzeitige Abgaben (Gegenprüfung L5-03)', () => {
  it('überschreiten die Grenze je Aufgabe und Gruppe nicht: Zählen und Einfügen in einem Zug', async () => {
    const id = await konto('[Erwachsen] P', { rollen: ['schueler'], einwilligung: true });
    const lernendeId = await lernende(id, '[Erwachsen] P', '2010-01-01');
    await db.insert(schema.gruppenMitglied).values({ gruppeId: ids.gruppe1, lernendeId });
    const k = await kontext(id);
    const versuche = await Promise.allSettled(
      Array.from({ length: 5 }, () => dienst.reicheEin({ benutzerId: id, istKind: false }, k, abgabe(ids.gruppe1))),
    );
    expect(versuche.filter((v) => v.status === 'fulfilled').map((v) => v.value)).toEqual(['eingereicht', 'eingereicht', 'eingereicht']);
    const abgelehnt = versuche.flatMap((v) => (v.status === 'rejected' ? [v.reason as InstanceType<typeof dienst.AbgabeAbgelehnt>] : []));
    expect(abgelehnt.map((e) => e.grund)).toEqual(['grenze', 'grenze']);
    const A = schema.lernappSchreibabgabe;
    expect(await db.select({ id: A.id }).from(A).where(eq(A.benutzerId, id))).toHaveLength(3);
  });
});
