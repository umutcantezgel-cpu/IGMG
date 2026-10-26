import { randomUUID } from 'node:crypto';
import { and, eq, sql } from 'drizzle-orm';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { db as appDb, schema } from '@/lib/db';
import { verschluessele } from '@/lib/krypto';
import { wocheVon } from '@/lib/lernapp/gruppe/regeln';
import type { GruppeAntwort } from '@/lib/lernapp/gruppe/protokoll';
import { berlinerDatum } from '@/lib/gebetszeiten/naechstes';
import { kontoUmgebung } from './hilfen/konto';

/**
 * Gruppen der Lern-App (L7-02; ADR 0043 Nr. 7/8; KERN 4.0 §5) gegen PGlite: Gruppenisolation (fremde Gruppe nie sichtbar,
 * nie bearbeitbar), Rechte-Negativtests (Aufsicht, Lernende, fremde Lehrkraft, fremde Eltern), Kinder nie in einer
 * Bestenliste – auch nicht mit einer untergeschobenen Zustimmung –, nur mit eigener Zustimmung und Einwilligung; sehen
 * darf sie nur, wer selbst zugestimmt hat und deren Einwilligung gilt (gegenseitiger Kreis, DSFA-Entwurf LA-V7/EL4).
 * Schalter `lernapp_gruppen`/`lernapp_rangliste` (Ausblenden geht immer), nur laufende Mitgliedschaften, Familienschalter
 * nur mit bestätigtem Bezug, Reihenfolge der Actions (Konto vor Eingabe), Ursprung, Audit ohne Inhalte. S-L3 M-1: XP aus
 * Wissenskurs und Koran-Arabisch zählen weder in Bestenliste und Gruppenziel noch im Stand der Lehrkraft (Art. 9). Testdaten
 * fiktiv, Namen Platzhalter.
 */
// Spion auf die Kontoprüfung der Actions (Reihenfolge wie MUSTER §5: Konto mit Faktor und Kontoart vor der Eingabe)
const kontoPruefungen = vi.hoisted(() => ({ anzahl: 0 }));
vi.mock('@/lib/rechte/gemeinde', async (original) => {
  const echt = await original<typeof import('@/lib/rechte/gemeinde')>();
  return {
    ...echt,
    verlangeKontoRecht: (...a: Parameters<typeof echt.verlangeKontoRecht>) => {
      kontoPruefungen.anzahl += 1;
      return echt.verlangeKontoRecht(...a);
    },
  };
});

const { client, db } = await kontoUmgebung();
const { auth } = await import('@/lib/auth/server');
const route = await import('@/app/api/lernapp/gruppe/route');
const dienst = await import('@/lib/lernapp/gruppe/dienst');
const { ladeGruppenKontext } = await import('@/lib/rechte/gemeinde');
const { lernappTestkurs } = await import('../../drizzle/seeds/lernapp-test');
afterAll(() => client.close());

const SCHALTER = ['FUNKTION_LERNAPP_GRUPPEN', 'FUNKTION_LERNAPP_RANGLISTE'];
afterEach(() => {
  for (const s of SCHALTER) delete process.env[s];
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

async function lernende(benutzerId: string | null, name: string, sechzehnAm: string): Promise<string> {
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

const HEUTE = berlinerDatum(new Date());
const WOCHE = wocheVon(HEUTE);
/** Lerntag im Sprachkurs `tr-aus-de`: Tagessumme und dieselbe Zeile je Kurs (wie der Abgleich sie ableitet). */
async function xp(benutzerId: string, menge: number) {
  await db.insert(schema.lernappProfil).values({ benutzerId }).onConflictDoNothing();
  await db.insert(schema.lernappTag).values({ benutzerId, tag: WOCHE.von, xp: menge, lektionen: 1 });
  await db.insert(schema.lernappTagKurs).values({ benutzerId, tag: WOCHE.von, kurs: 'tr-aus-de', xp: menge, lektionen: 1 });
}

/** Zusätzlich gelernt im Wissenskurs bzw. Koran-Pfad am selben Tag (zwei Lektionen): Tagessumme wächst, Zeile je Kurs neu. */
async function religioeseXp(benutzerId: string, kurs: 'islam' | 'koran', menge: number) {
  const T = schema.lernappTag;
  await db
    .update(T)
    .set({ xp: sql`${T.xp} + ${menge}`, lektionen: sql`${T.lektionen} + 2` })
    .where(and(eq(T.benutzerId, benutzerId), eq(T.tag, WOCHE.von)));
  await db.insert(schema.lernappTagKurs).values({ benutzerId, tag: WOCHE.von, kurs, xp: menge, lektionen: 2 });
}

const KOPF = { 'sec-fetch-site': 'same-origin', host: 'example.test' };
async function hole(ui = 'de', kopf: Record<string, string> = KOPF): Promise<Response> {
  return route.GET(new Request(`https://example.test/api/lernapp/gruppe?ui=${ui}`, { headers: kopf }));
}
async function holeJson(): Promise<GruppeAntwort> {
  const r = await hole();
  expect(r.status).toBe(200);
  expect(r.headers.get('cache-control')).toContain('no-store');
  return (await r.json()) as GruppeAntwort;
}
async function sende(aktion: 'zustimmen' | 'ausblenden', kopf: Record<string, string> = KOPF): Promise<Response> {
  return route.POST(
    new Request('https://example.test/api/lernapp/gruppe', {
      method: 'POST',
      headers: { ...kopf, 'content-type': 'application/json' },
      body: JSON.stringify({ aktion, ui: 'de' }),
    }),
  );
}

// ——— Aufbau: zwei Gruppen, je eine Lehrkraft; Gruppe 1 mit Aufsicht, Kind, Jugendlicher, Erwachsenem, Ohne-Einwilligung ———
const ids = {} as Record<
  | 'lehrkraftA'
  | 'lehrkraftB'
  | 'aufsicht'
  | 'eltern'
  | 'elternFremd'
  | 'kind'
  | 'jugend'
  | 'erwachsen'
  | 'ohne'
  | 'fremd'
  | 'gruppe1'
  | 'gruppe2'
  | 'kindL'
  | 'jugendL'
  | 'unbestaetigtL',
  string
>;

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
  ids.eltern = await konto('[Elternteil] E', { rollen: ['gemeinde', 'eltern'], einwilligung: true });
  ids.elternFremd = await konto('[Elternteil] F', { rollen: ['gemeinde', 'eltern'] });

  // Kind (unter 16, Kinderkonto) – Einwilligung von den Eltern; dazu eine untergeschobene Zustimmung (darf nie wirken)
  ids.kind = await konto('[Kind] K', { kind: true, rollen: ['schueler'] });
  ids.kindL = await lernende(ids.kind, '[Kind] K', '2033-01-01');
  await db
    .insert(schema.elternKind)
    .values({ elternId: ids.eltern, lernendeId: ids.kindL, sorgeberechtigt: true, bestaetigtAm: new Date() });
  await db.insert(schema.kontoEinwilligung).values({ lernendeId: ids.kindL, art: 'lernapp', textVersion: 'v1', erteiltVon: ids.eltern });
  await db.insert(schema.lernappRanglisteZustimmung).values({ benutzerId: ids.kind, textVersion: 'untergeschoben' });

  // Jugendliche/r ab 16 (eigenes Konto, Übergang vorbei), eigene Einwilligung; Kind derselben Eltern
  ids.jugend = await konto('[Jugend] J', { rollen: ['schueler'], einwilligung: true });
  ids.jugendL = await lernende(ids.jugend, '[Jugend] J', '2025-01-01');
  await db
    .insert(schema.elternKind)
    .values({ elternId: ids.eltern, lernendeId: ids.jugendL, sorgeberechtigt: true, bestaetigtAm: new Date() });

  ids.erwachsen = await konto('[Erwachsen] W', { rollen: ['schueler'], einwilligung: true });
  const erwachsenL = await lernende(ids.erwachsen, '[Erwachsen] W', '2010-01-01');
  ids.ohne = await konto('[Ohne] O', { rollen: ['schueler'] });
  const ohneL = await lernende(ids.ohne, '[Ohne] O', '2010-01-01');
  const ohneKontoL = await lernende(null, '[Ohne Konto] N', '2034-01-01');
  ids.unbestaetigtL = ohneKontoL;
  await db.insert(schema.elternKind).values({ elternId: ids.elternFremd, lernendeId: ohneKontoL, sorgeberechtigt: true });

  ids.fremd = await konto('[Fremd] X', { rollen: ['schueler'], einwilligung: true });
  const fremdL = await lernende(ids.fremd, '[Fremd] X', '2010-01-01');
  await db.insert(schema.lernappRanglisteZustimmung).values({ benutzerId: ids.fremd, textVersion: 'v1' });

  await db
    .insert(schema.gruppenMitglied)
    .values([
      ...[ids.kindL, ids.jugendL, erwachsenL, ohneL, ohneKontoL].map((lernendeId) => ({ gruppeId: ids.gruppe1, lernendeId })),
      { gruppeId: ids.gruppe2, lernendeId: fremdL },
    ]);
  await xp(ids.kind, 40);
  await xp(ids.jugend, 30);
  await xp(ids.erwachsen, 30);
  await xp(ids.ohne, 70);
  await xp(ids.fremd, 90);
  await db.insert(schema.lernappRanglisteZustimmung).values({ benutzerId: ids.erwachsen, textVersion: 'v1' });
});

const kontext = (id: string) => ladeGruppenKontext(id);

describe('Zuweisungen: nur die Lehrkraft der eigenen Gruppe', () => {
  it('Lehrkraft A weist eine Lektion zu; fremde Lehrkraft, Aufsicht, Lernende und Eltern nicht', async () => {
    const a = await kontext(ids.lehrkraftA);
    const eingabe = { kurs: 'tr-aus-de', einheit: 'tr.a1.test', lektion: 'tr.a1.test.l01', faellig: null, titel: 't' };
    const id = await dienst.weiseZu(a, ids.gruppe1, eingabe);
    for (const fremd of [ids.lehrkraftB, ids.aufsicht, ids.jugend, ids.kind, ids.eltern])
      await expect(dienst.weiseZu(await kontext(fremd), ids.gruppe1, { ...eingabe, lektion: 'tr.a1.test.l02' })).rejects.toBeInstanceOf(
        dienst.KeinGruppenZugang,
      );
    await expect(dienst.weiseZu(a, ids.gruppe2, eingabe)).rejects.toBeInstanceOf(dienst.KeinGruppenZugang);
    // Audit ohne Inhalte: nur Kennungen
    const [eintrag] = await db.select().from(schema.auditEintrag).where(eq(schema.auditEintrag.aktion, 'lernapp.zuweisung_angelegt'));
    expect(eintrag?.details).toEqual({ aufgabe: id, kurs: 'tr-aus-de', einheit: 'tr.a1.test' });
  });

  it('ungültige Einheit, fremde Lektion und doppelte Zuweisung werden abgelehnt', async () => {
    const a = await kontext(ids.lehrkraftA);
    const basis = { kurs: 'tr-aus-de', faellig: null, titel: 't' };
    await expect(dienst.weiseZu(a, ids.gruppe1, { ...basis, einheit: 'tr.a1.e99' })).rejects.toMatchObject({ grund: 'einheit' });
    await expect(dienst.weiseZu(a, ids.gruppe1, { ...basis, einheit: 'tr.a1.test', lektion: 'tr.a1.test.l99' })).rejects.toMatchObject({
      grund: 'einheit',
    });
    await expect(dienst.weiseZu(a, ids.gruppe1, { ...basis, einheit: 'tr.a1.test', lektion: 'de.a1.test.l01' })).rejects.toBeInstanceOf(
      dienst.UngueltigeZuweisung,
    );
    await expect(dienst.weiseZu(a, ids.gruppe1, { ...basis, kurs: 'islam', einheit: 'x.a1.e01' })).rejects.toMatchObject({
      grund: 'bezug',
    });
    await expect(dienst.weiseZu(a, ids.gruppe1, { ...basis, einheit: 'tr.a1.test', lektion: 'tr.a1.test.l01' })).rejects.toMatchObject({
      grund: 'doppelt',
    });
  });

  it('Lektionen einer Einheit mit Paket-Schlüssel und Nummer', async () => {
    const l = await dienst.lektionenVon('tr-aus-de', 'tr.a1.test');
    expect(l[0]).toMatchObject({ schluessel: 'tr.a1.test.l01', paket: 'tr-aus-de.a1.test.l01', nr: 1 });
    expect(await dienst.lektionenVon('tr-aus-de', 'tr.a1.e99')).toEqual([]);
  });

  it('Entfernen nur durch die Lehrkraft der Gruppe der Zuweisung', async () => {
    const a = await kontext(ids.lehrkraftA);
    const id = await dienst.weiseZu(a, ids.gruppe1, { kurs: 'tr-aus-de', einheit: 'tr.a1.test', faellig: '2026-12-01', titel: 't' });
    await expect(dienst.entferneZuweisung(await kontext(ids.lehrkraftB), id)).rejects.toBeInstanceOf(dienst.KeinGruppenZugang);
    await expect(dienst.entferneZuweisung(await kontext(ids.aufsicht), id)).rejects.toBeInstanceOf(dienst.KeinGruppenZugang);
    expect(await db.select().from(schema.aufgabe).where(eq(schema.aufgabe.id, id))).toHaveLength(1);
    expect(await dienst.entferneZuweisung(a, id)).toBe(ids.gruppe1);
    expect(await db.select().from(schema.aufgabe).where(eq(schema.aufgabe.id, id))).toHaveLength(0);
  });
});

describe('Stand der Gruppe (Lehrkraft)', () => {
  it('nur mit Einwilligung Zahlen; fremde Gruppe und Aufsicht nie', async () => {
    const s = await dienst.standDerGruppe(await kontext(ids.lehrkraftA), ids.gruppe1, HEUTE);
    const nach = new Map(s.zeilen.map((z) => [z.name, z]));
    expect([...nach.keys()].sort()).toEqual(['[Erwachsen] W', '[Jugend] J', '[Kind] K', '[Ohne Konto] N', '[Ohne] O']);
    expect(nach.get('[Kind] K')?.woche?.xp).toBe(40);
    expect(nach.get('[Jugend] J')?.woche?.xp).toBe(30);
    expect(nach.get('[Ohne] O')).toMatchObject({ konto: true, einwilligung: false, woche: null, erledigt: null });
    expect(nach.get('[Ohne Konto] N')).toMatchObject({ konto: false, woche: null });
    expect(s.zeilen.some((z) => z.name === '[Fremd] X')).toBe(false);
    await expect(dienst.standDerGruppe(await kontext(ids.lehrkraftA), ids.gruppe2, HEUTE)).rejects.toBeInstanceOf(dienst.KeinGruppenZugang);
    await expect(dienst.standDerGruppe(await kontext(ids.aufsicht), ids.gruppe1, HEUTE)).rejects.toBeInstanceOf(dienst.KeinGruppenZugang);
    await expect(dienst.standDerGruppe(await kontext(ids.jugend), ids.gruppe1, HEUTE)).rejects.toBeInstanceOf(dienst.KeinGruppenZugang);
  });

  it('Gruppenziel: nur die Lehrkraft, nur erlaubte Werte; Summe ohne Namen, nur mit Einwilligung', async () => {
    await expect(dienst.setzeWochenziel(await kontext(ids.lehrkraftB), ids.gruppe1, 100)).rejects.toBeInstanceOf(dienst.KeinGruppenZugang);
    await expect(dienst.setzeWochenziel(await kontext(ids.lehrkraftA), ids.gruppe1, 123)).rejects.toBeInstanceOf(dienst.KeinGruppenZugang);
    await dienst.setzeWochenziel(await kontext(ids.lehrkraftA), ids.gruppe1, 100);
    const s = await dienst.standDerGruppe(await kontext(ids.lehrkraftA), ids.gruppe1, HEUTE);
    // Kind 40 + Jugend 30 + Erwachsen 30; „Ohne“ (70 XP, keine Einwilligung) zählt nicht
    expect(s.ziel).toEqual({ ziel: 100, summe: 100, erreicht: true, anteil: 1, zuWenige: false });
  });
});

describe('API /api/lernapp/gruppe: Isolation und Bestenliste', () => {
  beforeAll(async () => {
    await dienst.setzeGruppenBestenliste(await kontext(ids.lehrkraftA), ids.gruppe1, true);
    await dienst.setzeGruppenBestenliste(await kontext(ids.lehrkraftB), ids.gruppe2, true);
  });

  it('Bestenlisten nur mit dem eingeschalteten Schalter der Gruppe: B darf Gruppe 1 nicht schalten', async () => {
    await expect(dienst.setzeGruppenBestenliste(await kontext(ids.lehrkraftB), ids.gruppe1, false)).rejects.toBeInstanceOf(
      dienst.KeinGruppenZugang,
    );
  });

  it('Jugendliche/r ab 16: eigene Gruppe mit Bestenliste ohne Kinder; fremde Gruppe nie sichtbar', async () => {
    als(ids.jugend);
    await db.insert(schema.lernappRanglisteZustimmung).values({ benutzerId: ids.jugend, textVersion: 'v1' });
    const a = await holeJson();
    expect(a.einwilligung).toBe('erteilt');
    expect(a.gruppen.map((g) => g.name)).toEqual(['[Gruppe Eins]']);
    const liste = a.gruppen[0]!.bestenliste!;
    expect(liste).toEqual([
      { name: '[Erwachsen] W.', xp: 30, ich: false },
      { name: '[Jugend] J.', xp: 30, ich: true },
    ]);
    // nie Kennungen anderer Konten in der Antwort, nie Kinder, nie die fremde Gruppe
    const text = JSON.stringify(a);
    for (const fremd of [ids.kind, ids.erwachsen, ids.fremd, ids.gruppe2, '[Kind]', '[Fremd]', '[Gruppe Zwei]'])
      expect(text).not.toContain(fremd);
    expect(a.zuweisungen.every((z) => z.gruppe === '[Gruppe Eins]')).toBe(true);
    expect(a.zuweisungen[0]).toMatchObject({ kurs: 'tr-aus-de', lektion: 'tr-aus-de.a1.test.l01', nr: 1, erledigt: false });
    expect(a.zustimmung).toEqual({ erteilt: true });
  });

  it('Kind: nie eine Bestenliste, nie eine Zustimmung – auch mit untergeschobener Zustimmung', async () => {
    als(ids.kind);
    const a = await holeJson();
    expect(a.einwilligung).toBe('erteilt');
    expect(a.gruppen).toHaveLength(1);
    expect(a.gruppen[0]).toMatchObject({ bestenliste: null, verborgen: false });
    expect(a.familien).toEqual([]);
    expect(a.zustimmung).toBeNull();
    expect(a.zuweisungen.length).toBeGreaterThan(0);
    // Zustimmen ist für Kinder gesperrt
    const r = await sende('zustimmen');
    expect(r.status).toBe(403);
    expect(await r.json()).toEqual({ fehler: 'alter' });
  });

  it('Fremde Gruppe: deren Mitglied sieht nur die eigene Gruppe und nie Gruppe 1', async () => {
    als(ids.fremd);
    const a = await holeJson();
    expect(a.gruppen.map((g) => g.name)).toEqual(['[Gruppe Zwei]']);
    expect(a.gruppen[0]!.bestenliste).toEqual([{ name: '[Fremd] X.', xp: 90, ich: true }]);
    expect(a.zuweisungen).toEqual([]);
    expect(JSON.stringify(a)).not.toContain('[Jugend]');
  });

  it('Zustimmung zurücknehmen blendet sofort aus – auch die Liste der anderen (gegenseitiger Kreis)', async () => {
    als(ids.jugend);
    expect((await sende('ausblenden')).status).toBe(200);
    const a = await holeJson();
    // Ohne eigene Zustimmung keine Namen: nur der Hinweis „verborgen“ und das Angebot zur Zustimmung
    expect(a.gruppen[0]).toMatchObject({ bestenliste: null, verborgen: true });
    expect(JSON.stringify(a)).not.toContain('[Erwachsen]');
    expect(a.zustimmung).toEqual({ erteilt: false });
    const r = await sende('zustimmen');
    expect(r.status).toBe(200);
    expect(await r.json()).toEqual({ erteilt: true });
    const b = await holeJson();
    expect(b.gruppen[0]).toMatchObject({ verborgen: false });
    expect(b.gruppen[0]!.bestenliste!.map((p) => p.name)).toEqual(['[Erwachsen] W.', '[Jugend] J.']);
    als(ids.ohne);
    expect((await sende('zustimmen')).status).toBe(403);
    // Audit ohne Inhalte
    const audit = await db.select().from(schema.auditEintrag).where(eq(schema.auditEintrag.aktion, 'lernapp.bestenliste_zustimmung'));
    expect(audit.length).toBeGreaterThanOrEqual(2);
    for (const e of audit) expect(Object.keys(e.details ?? {})).toEqual(['erteilt']);
  });

  it('Ab 16 ohne Einwilligung: keine Liste, auch mit Zustimmung in der Datenbank; das Angebot bleibt', async () => {
    als(ids.ohne);
    const vorher = await holeJson();
    expect(vorher.einwilligung).toBe('fehlt');
    expect(vorher.gruppen[0]).toMatchObject({ bestenliste: null, verborgen: true });
    expect(vorher.zustimmung).toEqual({ erteilt: false });
    await db.insert(schema.lernappRanglisteZustimmung).values({ benutzerId: ids.ohne, textVersion: 'untergeschoben' });
    const a = await holeJson();
    expect(a.gruppen[0]).toMatchObject({ bestenliste: null, verborgen: true });
    expect(a.zustimmung).toEqual({ erteilt: true });
    expect(JSON.stringify(a)).not.toContain('[Erwachsen]');
    expect((await sende('ausblenden')).status).toBe(200);
  });

  it('Heute ausgetragen: weder in Bestenliste noch in Gruppenziel oder Stand (nur laufende Mitgliedschaften)', async () => {
    const id = await konto('[Ausgetragen] A', { rollen: ['schueler'], einwilligung: true });
    const l = await lernende(id, '[Ausgetragen] A', '2010-01-01');
    await db.insert(schema.gruppenMitglied).values({ gruppeId: ids.gruppe1, lernendeId: l, bis: HEUTE });
    await db.insert(schema.lernappRanglisteZustimmung).values({ benutzerId: id, textVersion: 'v1' });
    await xp(id, 50);
    als(ids.jugend);
    const a = await holeJson();
    expect(a.gruppen[0]!.bestenliste!.map((p) => p.name)).toEqual(['[Erwachsen] W.', '[Jugend] J.']);
    expect(JSON.stringify(a)).not.toContain('[Ausgetragen]');
    const s = await dienst.standDerGruppe(await kontext(ids.lehrkraftA), ids.gruppe1, HEUTE);
    expect(s.zeilen.map((z) => z.name)).not.toContain('[Ausgetragen] A');
    expect(s.ziel).toMatchObject({ summe: 100 });
  });

  it('Schalter: ohne `lernapp_rangliste` keine Bestenliste und kein Zustimmen; ohne `lernapp_gruppen` 404', async () => {
    als(ids.jugend);
    process.env.FUNKTION_LERNAPP_RANGLISTE = 'aus';
    const a = await holeJson();
    expect(a.gruppen[0]!.bestenliste).toBeNull();
    expect(a.zustimmung).toBeNull();
    expect((await sende('zustimmen')).status).toBe(404);
    process.env.FUNKTION_LERNAPP_GRUPPEN = 'aus';
    expect((await hole()).status).toBe(404);
    expect((await sende('zustimmen')).status).toBe(404);
    // Ausblenden geht auch mit ausgeschalteten Schaltern (Austritt jederzeit): die Zeile ist sofort weg
    als(ids.erwachsen);
    expect((await sende('ausblenden')).status).toBe(200);
    const zeilen = await db
      .select()
      .from(schema.lernappRanglisteZustimmung)
      .where(eq(schema.lernappRanglisteZustimmung.benutzerId, ids.erwachsen));
    expect(zeilen).toEqual([]);
  });

  it('Ursprung, Anmeldung und Eingabe werden geprüft', async () => {
    als(ids.jugend);
    expect((await hole('de', { 'sec-fetch-site': 'cross-site', host: 'example.test' })).status).toBe(403);
    expect((await sende('zustimmen', { 'sec-fetch-site': 'cross-site', host: 'example.test' })).status).toBe(403);
    expect((await hole('en')).status).toBe(400);
    als(null);
    expect((await hole()).status).toBe(401);
  });
});

describe('Familie und Eltern', () => {
  it('Eltern schalten die Bestenliste der Familie; Kinder unter 16 erscheinen nie, sehen sie nie', async () => {
    await expect(dienst.setzeFamilienBestenliste(await kontext(ids.jugend), true)).rejects.toBeInstanceOf(dienst.KeinGruppenZugang);
    // Eltern-Kind-Bezug ohne Bestätigung genügt nicht (wie bei Lernwoche und Familie)
    await expect(dienst.setzeFamilienBestenliste(await kontext(ids.elternFremd), true)).rejects.toBeInstanceOf(dienst.KeinGruppenZugang);
    expect(await dienst.hatBestaetigtesKind(ids.elternFremd)).toBe(false);
    await dienst.setzeFamilienBestenliste(await kontext(ids.eltern), true);
    // Elternteil ohne eigene Zustimmung: eingeschaltet, aber keine Namen – nur das Angebot
    als(ids.eltern);
    const ohne = await holeJson();
    expect(ohne.familien).toEqual([{ eigene: true, bestenliste: null }]);
    expect(ohne.zustimmung).toEqual({ erteilt: false });
    await db.insert(schema.lernappRanglisteZustimmung).values({ benutzerId: ids.eltern, textVersion: 'v1' });
    als(ids.jugend);
    const a = await holeJson();
    expect(a.familien).toHaveLength(1);
    expect(a.familien[0]!.eigene).toBe(false);
    expect(a.familien[0]!.bestenliste!.map((p) => p.name).sort()).toEqual(['[Elternteil] E.', '[Jugend] J.']);
    als(ids.eltern);
    const e = await holeJson();
    expect(e.familien[0]!.eigene).toBe(true);
    expect(JSON.stringify(e)).not.toContain('[Kind]');
    als(ids.kind);
    expect((await holeJson()).familien).toEqual([]);
  });

  it('Lernwoche nur für das eigene, bestätigte Kind; nie für fremde Kinder', async () => {
    const w = await dienst.lernwocheDesKindes(await kontext(ids.eltern), ids.kindL, HEUTE);
    expect(w).toMatchObject({ art: 'woche', summe: { xp: 40, lektionen: 1, lerntage: 1 } });
    await expect(dienst.lernwocheDesKindes(await kontext(ids.elternFremd), ids.kindL, HEUTE)).rejects.toBeInstanceOf(
      dienst.KeinGruppenZugang,
    );
    await expect(dienst.lernwocheDesKindes(await kontext(ids.lehrkraftA), ids.kindL, HEUTE)).rejects.toBeInstanceOf(
      dienst.KeinGruppenZugang,
    );
    // Eltern-Kind-Bezug ohne Bestätigung genügt nicht
    await expect(dienst.lernwocheDesKindes(await kontext(ids.elternFremd), ids.unbestaetigtL, HEUTE)).rejects.toBeInstanceOf(
      dienst.KeinGruppenZugang,
    );
    // Jugendliche/r nach dem Übergang: Eltern sehen nichts mehr
    expect(await dienst.lernwocheDesKindes(await kontext(ids.eltern), ids.jugendL, HEUTE)).toEqual({ art: 'selbst' });
  });
});

describe('S-L3 M-1: kein Rückschluss auf Wissenskurs und Koran-Arabisch (Art. 9)', () => {
  it('XP aus Wissen und Koran-Arabisch: nicht in Bestenliste, Gruppenziel, Familie und Stand der Lehrkraft; die Lernwoche der Eltern zählt alle Kurse', async () => {
    await religioeseXp(ids.kind, 'islam', 500);
    await religioeseXp(ids.jugend, 'koran', 400);
    for (const benutzerId of [ids.jugend, ids.erwachsen])
      await db.insert(schema.lernappRanglisteZustimmung).values({ benutzerId, textVersion: 'v1' }).onConflictDoNothing();

    // Lehrkraft: nur der zugewiesene Sprachkurs; Gruppenziel nur Sprachkurse
    const s = await dienst.standDerGruppe(await kontext(ids.lehrkraftA), ids.gruppe1, HEUTE);
    const nach = new Map(s.zeilen.map((z) => [z.name, z]));
    expect(s.kurse).toEqual(['tr-aus-de']);
    expect(nach.get('[Kind] K')?.woche).toEqual({ xp: 40, lektionen: 1, lerntage: 1 });
    expect(nach.get('[Jugend] J')?.woche).toEqual({ xp: 30, lektionen: 1, lerntage: 1 });
    expect(s.ziel).toMatchObject({ summe: 100 });

    // Lernende ab 16: Gruppenziel und Bestenlisten (Gruppe, Familie) nur mit XP aus den Sprachkursen
    als(ids.jugend);
    const a = await holeJson();
    expect(a.gruppen[0]!.ziel).toMatchObject({ summe: 100 });
    expect(a.gruppen[0]!.bestenliste).toEqual([
      { name: '[Erwachsen] W.', xp: 30, ich: false },
      { name: '[Jugend] J.', xp: 30, ich: true },
    ]);
    expect(a.familien[0]!.bestenliste!.find((p) => p.name === '[Jugend] J.')?.xp).toBe(30);

    // Eltern: Lernwoche des eigenen Kindes mit allen Kursen
    const w = await dienst.lernwocheDesKindes(await kontext(ids.eltern), ids.kindL, HEUTE);
    expect(w).toMatchObject({ art: 'woche', summe: { xp: 540, lektionen: 3, lerntage: 1 } });
  });

  it('Lehrkraft sieht nur die Kurse der Zuweisungen ihrer Gruppe: ohne Zuweisung Nullen, mit Zuweisung die Zahlen', async () => {
    const b = await kontext(ids.lehrkraftB);
    const ohne = await dienst.standDerGruppe(b, ids.gruppe2, HEUTE);
    expect(ohne.kurse).toEqual([]);
    expect(ohne.zeilen.find((z) => z.name === '[Fremd] X')?.woche).toEqual({ xp: 0, lektionen: 0, lerntage: 0 });
    await dienst.weiseZu(b, ids.gruppe2, { kurs: 'tr-aus-de', einheit: 'tr.a1.test', faellig: null, titel: 't' });
    const mit = await dienst.standDerGruppe(b, ids.gruppe2, HEUTE);
    expect(mit.kurse).toEqual(['tr-aus-de']);
    expect(mit.zeilen.find((z) => z.name === '[Fremd] X')?.woche).toEqual({ xp: 90, lektionen: 1, lerntage: 1 });
  });
});

describe('Actions: Konto mit Faktor und Kontoart vor der Eingabe (MUSTER §5)', () => {
  it('ungültige Eingabe: jede Action prüft zuerst das Konto und endet in KeinRecht', async () => {
    const actions = await import('@/server/actions/lernapp-gruppe');
    const { KeinRecht } = await import('@/lib/rechte/pruefe');
    als(ids.lehrkraftA);
    for (const [name, action] of Object.entries(actions)) {
      kontoPruefungen.anzahl = 0;
      await expect((action as (fd: FormData) => Promise<void>)(new FormData()), name).rejects.toBeInstanceOf(KeinRecht);
      expect(kontoPruefungen.anzahl, name).toBe(1);
    }
  });
});
