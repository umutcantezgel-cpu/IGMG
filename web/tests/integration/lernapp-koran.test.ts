import { randomUUID } from 'node:crypto';
import { and, eq } from 'drizzle-orm';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { schema } from '@/lib/db';
import { KORAN_PAKET_FORMAT, type KoranPaket, type KoranVerzeichnis } from '@/lib/lernapp/koran/typen';
import { sha256Hex } from '@/lib/lernapp/paket/hash';
import { koranBedeutungHash } from '@/lib/lernapp/paket/koran';
import { angemeldetAls, aufrufe, formular, verwaltungsUmgebung } from './hilfen/verwaltung';

/**
 * Koran-Arabisch-Pfad gegen PGlite (L6-05, ADR 0040 Nr. 5, KERN 4.0 §2.3/§4, Tor L6): Pfad aus `inhalte/lernapp/koran/pfad.json`
 * (nur Verweise), Wortformen aus `quran_wort`, Bedeutungen aus `quran_wortbedeutung` – im Paket nur mit zwei religiösen
 * Freigaben verschiedener Personen zum aktuellen Inhalts-Hash, sonst „Bedeutung folgt“; Lektionen nur vollständig; kein Audio
 * außer Wortzeiten geprüfter Zeiten aktiver Rezitationen. Dazu die Abfrage am Live-Stand (`pruefeKoranSichtbarkeit`) – auch
 * gegen die ausgelieferten Adressen und mit einem Negativfall (veraltete Auslieferung) – und die Cache-Erneuerung durch die
 * Verwaltung „Koran“ bei jeder Änderung an einer Bedeutung (Gegenprüfung L6-05/06). Wortformen und Bedeutungen sind
 * Platzhalter in eckigen Klammern (keine religiösen Inhalte, keine arabische Schrift).
 */
const { client, db } = await verwaltungsUmgebung();
const koran = await import('@/server/queries/lernapp/koran');
const aktionen = await import('@/server/actions/koran');
const verzeichnisRoute = await import('@/app/lern-app/pakete/koran/[sprache]/route');
const einheitRoute = await import('@/app/lern-app/pakete/koran/[sprache]/[einheit]/[hash]/route');
afterAll(() => client.close());
afterEach(() => {
  delete process.env.FUNKTION_LERNAPP;
});

const E01 = koran.KORAN_PFAD.einheiten[0]!;
const L01 = E01.lektionen[0]!;
const stellenVon = (l: typeof L01) => [...new Set([...l.wortformen, ...l.aufgaben.flatMap((a) => [a.wortform, ...a.ablenker])])];
const STELLEN_E01 = [...new Set(E01.lektionen.flatMap(stellenVon))];
const STELLEN_L01 = stellenVon(L01);
const formId = new Map<string, number>();
const teile = (s: string) => s.split(':').map(Number) as [number, number, number];

beforeAll(async () => {
  const formen = await db
    .insert(schema.quranWortform)
    .values(STELLEN_E01.map((s, i) => ({ textAr: `[form ${s}]`, vorkommen: 100 - i })))
    .returning({ id: schema.quranWortform.id, textAr: schema.quranWortform.textAr });
  for (const f of formen) formId.set(f.textAr.slice(6, -1), f.id);
  await db.insert(schema.quranWort).values(
    STELLEN_E01.map((s) => {
      const [sure, vers, pos] = teile(s);
      return { sure, vers, pos, textAr: `[form ${s}]`, formId: formId.get(s)! };
    }),
  );
});

const kontext = <T extends Record<string, unknown>>(p: T) => ({ params: Promise.resolve(p) }) as never;
const anfrage = (pfad: string) => new Request(`https://example.test${pfad}`);

async function verzeichnis(sprache = 'de'): Promise<KoranVerzeichnis> {
  const r = await verzeichnisRoute.GET(anfrage(`/lern-app/pakete/koran/${sprache}`), kontext({ sprache }));
  expect(r.status).toBe(200);
  expect(r.headers.get('set-cookie')).toBeNull();
  return (await r.json()) as KoranVerzeichnis;
}

async function paket(sprache = 'de', einheit = E01.schluessel): Promise<{ paket: KoranPaket; text: string }> {
  const e = (await verzeichnis(sprache)).einheiten.find((x) => x.schluessel === einheit)!;
  const r = await einheitRoute.GET(
    anfrage(`/lern-app/pakete/koran/${sprache}/${einheit}/${e.hash}`),
    kontext({ sprache, einheit, hash: e.hash }),
  );
  expect(r.status).toBe(200);
  expect(r.headers.get('cache-control')).toBe('public, max-age=31536000, immutable');
  // CDN-Tags wie der Daten-Cache: Änderungen an Bedeutungen und Rezitationen nehmen auch alte Hash-Adressen heraus
  expect(r.headers.get('vercel-cache-tag')).toBe('lernapp,lernapp-kurs-koran,quran,rezitationen,einstellungen');
  const text = await r.text();
  expect(sha256Hex(text)).toBe(e.hash);
  return { paket: JSON.parse(text) as KoranPaket, text };
}

async function person(rolle: 'religioese_pruefung' | 'administration' | null) {
  const id = randomUUID();
  await db.insert(schema.user).values({ id, name: 'Testperson Prüfung', email: `k.${id}@example.test`, emailVerified: true });
  if (rolle) await db.insert(schema.rolleZuweisung).values({ benutzerId: id, rolle });
  return id;
}

/** Bedeutungen (de) für Stellen, auf der Website eingereicht („zur Prüfung“); Rückgabe: Kennung je Stelle. */
async function bedeutungen(stellen: readonly string[], verfasstVon: string): Promise<Map<string, string>> {
  const zeilen = await db
    .insert(schema.quranWortbedeutung)
    .values(
      stellen.map((s) => ({
        formId: formId.get(s)!,
        sprache: 'de',
        bedeutung: `[Bedeutung ${s}]`,
        wurzel: '[W]',
        freigabe: 'zur_pruefung' as const,
        verfasstVon,
      })),
    )
    .returning({ id: schema.quranWortbedeutung.id, formId: schema.quranWortbedeutung.formId });
  return new Map(stellen.map((s) => [s, zeilen.find((z) => z.formId === formId.get(s))!.id]));
}

async function pruefe(ids: Map<string, string>, wer: string, urteil: 'ok' | 'abgelehnt' = 'ok', nur?: readonly string[]) {
  const zeilen = await db.select().from(schema.quranWortbedeutung).where(eq(schema.quranWortbedeutung.sprache, 'de'));
  for (const [stelle, id] of ids) {
    if (nur && !nur.includes(stelle)) continue;
    const b = zeilen.find((z) => z.id === id)!;
    await db.insert(schema.lernappPruefung).values({
      inhaltTyp: 'koran_bedeutung',
      inhaltId: id,
      inhaltHash: koranBedeutungHash(b),
      art: 'religioes',
      pruefendeId: wer,
      urteil,
    });
  }
}

const gezeigt = (p: KoranPaket) => p.woerter.filter((w) => w.bedeutung).map((w) => w.stelle);

let ids = new Map<string, string>();
let hoca = '';

describe('Koran-Pfad: Verzeichnis und Paket', () => {
  it('ohne Freigaben: alle Einheiten, Wortformen aus quran_wort, überall „Bedeutung folgt“, keine Übungen, kein Audio', async () => {
    const v = await verzeichnis();
    expect(v.einheiten).toHaveLength(koran.KORAN_PFAD.einheiten.length);
    expect(v.einheiten[0]).toMatchObject({ schluessel: E01.schluessel, bedeutungen: 0, lektionen: [] });
    const { paket: p, text } = await paket();
    expect(p).toMatchObject({ format: KORAN_PAKET_FORMAT, kurs: 'koran', sprache: 'de', lektionen: [] });
    expect(p.woerter.length).toBeGreaterThan(0);
    expect(p.woerter.every((w) => w.text === `[form ${w.stelle}]` && w.bedeutung === undefined && w.zeit === undefined)).toBe(true);
    expect(text).not.toMatch(/"(audio|stimme|clip|bedeutung)"\s*:/);
    expect((await verzeichnis('tr')).einheiten[0]).toMatchObject({ bedeutungen: 0, lektionen: [] });
    expect(await koran.pruefeKoranSichtbarkeit()).toEqual({ sichtbar: 0, lektionen: 0, verstoesse: [] });
  });

  it('Bedeutungen der Hoca: eine Freigabe, Administration und Verfasserin genügen nicht; zwei Personen → sichtbar, Lektion ganz', async () => {
    hoca = await person('religioese_pruefung');
    ids = await bedeutungen(STELLEN_L01, hoca);
    await pruefe(ids, await person('religioese_pruefung'));
    await pruefe(ids, await person('administration'));
    await pruefe(ids, hoca);
    await pruefe(ids, await person(null));
    expect(gezeigt((await paket()).paket)).toEqual([]);

    // zweite Person mit Rolle, aber nicht für alle Wortformen der Lektion: Bedeutungen ja, Übungen nein
    const zweite = await person('religioese_pruefung');
    await pruefe(ids, zweite, 'ok', STELLEN_L01.slice(1));
    const teil = (await paket()).paket;
    expect(new Set(gezeigt(teil))).toEqual(new Set(STELLEN_L01.slice(1).filter((s) => L01.wortformen.includes(s))));
    expect(teil.lektionen).toEqual([]);

    await pruefe(ids, zweite, 'ok', STELLEN_L01.slice(0, 1));
    const { paket: voll } = await paket();
    expect(new Set(gezeigt(voll))).toEqual(new Set(L01.wortformen));
    expect(voll.woerter.find((w) => w.stelle === L01.wortformen[0])?.bedeutung).toBe(`[Bedeutung ${L01.wortformen[0]}]`);
    expect(voll.lektionen.map((l) => l.schluessel)).toEqual([L01.schluessel]);
    const a = voll.lektionen[0]!.aufgaben[0]!;
    expect(a.typ === 'koran_wort' && a.optionen.every((o) => o.sprache === 'de' && o.text.startsWith('[Bedeutung '))).toBe(true);
    expect((await verzeichnis()).einheiten[0]).toMatchObject({ bedeutungen: L01.wortformen.length, lektionen: [L01.schluessel] });
    // andere Sprache: keine Bedeutungen
    expect((await verzeichnis('tr')).einheiten[0]).toMatchObject({ bedeutungen: 0, lektionen: [] });
    // Abfrage am Live-Stand: jede gezeigte Bedeutung hat zwei Freigaben zum aktuellen Hash
    expect(await koran.pruefeKoranSichtbarkeit()).toEqual({ sichtbar: STELLEN_L01.length, lektionen: 1, verstoesse: [] });
  });

  it('Änderung setzt zurück, abweichende Bedeutung an der Stelle und Einwand verbergen sofort', async () => {
    const [erste, zweite] = L01.wortformen as [string, string];
    await db
      .update(schema.quranWortbedeutung)
      .set({ bedeutung: '[Bedeutung geändert]' })
      .where(eq(schema.quranWortbedeutung.id, ids.get(erste)!));
    let p = (await paket()).paket;
    expect(gezeigt(p)).not.toContain(erste);
    expect(p.lektionen).toEqual([]);
    // beide prüfen den neuen Stand
    await pruefe(ids, await person('religioese_pruefung'), 'ok', [erste]);
    await pruefe(ids, await person('religioese_pruefung'), 'ok', [erste]);
    p = (await paket()).paket;
    expect(p.woerter.find((w) => w.stelle === erste)?.bedeutung).toBe('[Bedeutung geändert]');
    expect(p.lektionen).toHaveLength(1);

    const [sure, vers, pos] = teile(zweite);
    await db.insert(schema.quranWortbedeutungOrt).values({ sure, vers, pos, sprache: 'de', bedeutung: '[an dieser Stelle]' });
    p = (await paket()).paket;
    expect(gezeigt(p)).not.toContain(zweite);
    expect(p.lektionen).toEqual([]);
    await db
      .delete(schema.quranWortbedeutungOrt)
      .where(
        and(
          eq(schema.quranWortbedeutungOrt.sure, sure),
          eq(schema.quranWortbedeutungOrt.vers, vers),
          eq(schema.quranWortbedeutungOrt.pos, pos),
        ),
      );
    expect((await paket()).paket.lektionen).toHaveLength(1);

    await pruefe(ids, await person('religioese_pruefung'), 'abgelehnt', [zweite]);
    p = (await paket()).paket;
    expect(gezeigt(p)).not.toContain(zweite);
    expect(p.lektionen).toEqual([]);
    expect((await koran.pruefeKoranSichtbarkeit()).verstoesse).toEqual([]);
  });

  it('Wortzeiten nur geprüft und nur aktiver Rezitationen; nie Sprachausgabe', async () => {
    const [medium] = await db
      .insert(schema.medium)
      .values({ schluessel: 'test/vereinbarung.pdf', typ: 'application/pdf', groesse: 1, alt: { de: '[Vereinbarung]' } })
      .returning({ id: schema.medium.id });
    await db.insert(schema.quranRezitation).values({
      id: 'test-rezitation',
      name: { de: '[Rezitation]' },
      rezitator: '[Name]',
      art: 'eigen',
      lizenz: '[Lizenz]',
      vereinbarungMediumId: medium!.id,
      aktiv: true,
    });
    const datei = '/audio/test-rezitation/001-000-0123456789abcdef.webm';
    await db.insert(schema.quranAudio).values({
      rezitationId: 'test-rezitation',
      sure: 1,
      vers: 0,
      pfad: datei,
      mime: 'audio/webm',
      bytes: 1,
      sha256: '0'.repeat(64),
    });
    const stelle = L01.wortformen[0]!;
    const [sure, vers, pos] = teile(stelle);
    await db
      .insert(schema.quranWortzeit)
      .values({ rezitationId: 'test-rezitation', sure, vers, pos, startMs: 100, endeMs: 900, quelle: 'mitklopfen', geprueft: false });
    const zeit = async () => (await paket()).paket.woerter.find((w) => w.stelle === stelle)?.zeit;
    expect(await zeit()).toBeUndefined();
    await db.update(schema.quranWortzeit).set({ geprueft: true });
    expect(await zeit()).toEqual({ adresse: datei, startMs: 100, endeMs: 900, rezitation: 'test-rezitation' });
    const { paket: p, text } = await paket();
    expect(text).not.toMatch(/"(audio|stimme|clip)"\s*:/);
    // Namensnennung der Rezitation im Paket (offline lesbar)
    expect(p.quellen).toContain('Rezitation: [Rezitation] – [Name], [Lizenz]');
    expect((await koran.pruefeKoranSichtbarkeit()).verstoesse).toEqual([]);
    await db.update(schema.quranRezitation).set({ aktiv: false });
    expect(await zeit()).toBeUndefined();
  });

  it('Routen: Sprache ar, unbekannte Einheit und alter Hash 404; Schalter lernapp aus → 404', async () => {
    const r = await verzeichnisRoute.GET(anfrage('/lern-app/pakete/koran/ar'), kontext({ sprache: 'ar' }));
    expect(r.status).toBe(404);
    const v = await verzeichnis();
    const e = v.einheiten[0]!;
    const falsch = await einheitRoute.GET(anfrage('/x'), kontext({ sprache: 'de', einheit: E01.schluessel, hash: 'f'.repeat(64) }));
    expect(falsch.status).toBe(404);
    const fremd = await einheitRoute.GET(anfrage('/x'), kontext({ sprache: 'de', einheit: 'tr.a1.e01', hash: e.hash }));
    expect(fremd.status).toBe(404);
    process.env.FUNKTION_LERNAPP = 'aus';
    expect((await verzeichnisRoute.GET(anfrage('/x'), kontext({ sprache: 'de' }))).status).toBe(404);
    expect((await einheitRoute.GET(anfrage('/x'), kontext({ sprache: 'de', einheit: E01.schluessel, hash: e.hash }))).status).toBe(404);
  });

  // Endabnahme Z-L03 (C-religion-gegen): live lieferte nur e01 aus – der Beispielmodus hat zur Laufzeit keine Datenbank, also
  // muss jede Einheit vorgerendert sein, und jede Adresse des Verzeichnisses muss genau dieses Paket liefern.
  it('alle Einheiten: Einheitenroute liefert den Hash aus dem Verzeichnis; im Beispielmodus sind alle vorgerendert', async () => {
    const sprachen = ['de', 'tr'] as const;
    for (const sprache of sprachen) {
      const v = await verzeichnis(sprache);
      expect(v.einheiten.map((e) => e.schluessel)).toEqual(koran.KORAN_PFAD.einheiten.map((e) => e.schluessel));
      for (const e of v.einheiten) {
        const r = await einheitRoute.GET(
          anfrage(`/lern-app/pakete/koran/${sprache}/${e.schluessel}/${e.hash}`),
          kontext({ sprache, einheit: e.schluessel, hash: e.hash }),
        );
        expect(r.status, `${sprache} ${e.schluessel}`).toBe(200);
        expect(sha256Hex(await r.text()), `${sprache} ${e.schluessel}`).toBe(e.hash);
      }
    }
    // Server mit Datenbank: je Sprache nur die erste Einheit vorgerendert (der Rest entsteht bei Bedarf)
    const mitDatenbank = await koran.ladeKoranPaketParameter();
    expect(mitDatenbank.map((p) => `${p.sprache} ${p.einheit}`)).toEqual(sprachen.map((s) => `${s} ${E01.schluessel}`));
    // Beispielmodus (Vercel-Bau mit PGlite, zur Laufzeit ohne Datenbank): alle 2 × 40 Einheiten mit dem Hash des Verzeichnisses
    vi.stubEnv('VERCEL', '1');
    vi.stubEnv('BAU_PGLITE', '1');
    try {
      const parameter = await koran.ladeKoranPaketParameter();
      expect(parameter).toHaveLength(sprachen.length * koran.KORAN_PFAD.einheiten.length);
      for (const sprache of sprachen) {
        const v = await verzeichnis(sprache);
        expect(parameter.filter((p) => p.sprache === sprache)).toEqual(
          v.einheiten.map((e) => ({ sprache, einheit: e.schluessel, hash: e.hash })),
        );
      }
    } finally {
      vi.unstubAllEnvs();
    }
  });
});

describe('Koran-Pfad: Website-Status, Verwaltung und Auslieferung (Gegenprüfung L6-05/06)', () => {
  const L02 = E01.lektionen[1]!;
  const STELLEN_L02 = stellenVon(L02);
  let ids2 = new Map<string, string>();
  const zeile = async (stelle: string) =>
    (
      await db
        .select()
        .from(schema.quranWortbedeutung)
        .where(eq(schema.quranWortbedeutung.id, ids2.get(stelle)!))
    )[0]!;
  const lektionenDe = async () => (await paket()).paket.lektionen.map((l) => l.schluessel);
  /** ausgelieferte Adressen über die Route Handler (ohne Cache im Test) */
  const routen = (async (eingabe: string | URL) => {
    const url = new URL(String(eingabe));
    const [, , , sprache, einheit, hash] = url.pathname.split('/').filter(Boolean);
    return einheit
      ? einheitRoute.GET(new Request(url), kontext({ sprache, einheit, hash }))
      : verzeichnisRoute.GET(new Request(url), kontext({ sprache }));
  }) as unknown as typeof fetch;

  it('zwei Freigaben zum Hash über Bedeutung, Wurzel und Anmerkung; ein Website-Entwurf sperrt', async () => {
    ids2 = await bedeutungen(STELLEN_L02, await person('religioese_pruefung'));
    await pruefe(ids2, await person('religioese_pruefung'));
    await pruefe(ids2, await person('religioese_pruefung'));
    expect(await lektionenDe()).toContain(L02.schluessel);

    const [erste] = L02.wortformen as [string];
    await db
      .update(schema.quranWortbedeutung)
      .set({ freigabe: 'entwurf' })
      .where(eq(schema.quranWortbedeutung.id, ids2.get(erste)!));
    let p = (await paket()).paket;
    expect(gezeigt(p)).not.toContain(erste);
    expect(p.lektionen.map((l) => l.schluessel)).not.toContain(L02.schluessel);
    expect((await koran.pruefeKoranSichtbarkeit()).verstoesse).toEqual([]);
    await db
      .update(schema.quranWortbedeutung)
      .set({ freigabe: 'geprueft' })
      .where(eq(schema.quranWortbedeutung.id, ids2.get(erste)!));
    expect(await lektionenDe()).toContain(L02.schluessel);

    // nur die Anmerkung geändert: neuer Hash, beide Freigaben zurückgesetzt
    await db
      .update(schema.quranWortbedeutung)
      .set({ anmerkung: '[Anmerkung]' })
      .where(eq(schema.quranWortbedeutung.id, ids2.get(erste)!));
    p = (await paket()).paket;
    expect(gezeigt(p)).not.toContain(erste);
    await pruefe(ids2, await person('religioese_pruefung'), 'ok', [erste]);
    await pruefe(ids2, await person('religioese_pruefung'), 'ok', [erste]);
    expect(await lektionenDe()).toContain(L02.schluessel);
  });

  it('Abfrage am Live-Stand gegen die ausgelieferten Adressen; eine veraltete Auslieferung meldet sie als Verstoß', async () => {
    const basis = 'https://example.test';
    expect((await koran.pruefeKoranSichtbarkeit(koran.ausgeliefert(basis, routen))).verstoesse).toEqual([]);
    // Stand vor der Änderung festhalten (wie ein Cache, der nicht erneuert wurde)
    const vorher = { de: await koran.frischGebaut('de'), tr: await koran.frischGebaut('tr') };
    const veraltet = async (sprache: 'de' | 'tr') => vorher[sprache];
    expect((await koran.pruefeKoranSichtbarkeit(veraltet)).verstoesse).toEqual([]);

    const [erste, zweite] = L02.wortformen as [string, string];
    await db
      .update(schema.quranWortbedeutung)
      .set({ wurzel: '[W2]' })
      .where(eq(schema.quranWortbedeutung.id, ids2.get(erste)!));
    await db.delete(schema.quranWortbedeutung).where(eq(schema.quranWortbedeutung.id, ids2.get(zweite)!));
    const befund = (await koran.pruefeKoranSichtbarkeit(veraltet)).verstoesse;
    expect(befund).toContain(`de ${erste}: 0 Freigabe(n) zum aktuellen Hash`);
    expect(befund).toContain(`de ${zweite}: Bedeutung ohne passende Zeile`);
    // frisch gebaut bzw. ausgeliefert (im Test ohne Cache): verborgen, also kein Verstoß
    expect((await koran.pruefeKoranSichtbarkeit()).verstoesse).toEqual([]);
    expect((await koran.pruefeKoranSichtbarkeit(koran.ausgeliefert(basis, routen))).verstoesse).toEqual([]);

    // ausgelieferte Bytes passen nicht zur Adresse
    const verfaelscht = (async (eingabe: string | URL) => {
      const r = await routen(eingabe);
      return String(eingabe).includes(`/${E01.schluessel}/`) ? new Response(`${await r.text()} `, { status: r.status }) : r;
    }) as unknown as typeof fetch;
    expect((await koran.pruefeKoranSichtbarkeit(koran.ausgeliefert(basis, verfaelscht))).verstoesse).toEqual(
      expect.arrayContaining([`de ${E01.schluessel}: Paket passt nicht zum Hash der Adresse`]),
    );
  });

  it('Verwaltung „Koran“: jede Änderung an Bedeutung, Stelle oder Status erneuert den Koran-Pfad, auch ohne Website-Status „geprüft“', async () => {
    const [, , dritte] = L02.wortformen as [string, string, string];
    const z = await zeile(dritte);
    expect(z.freigabe).toBe('zur_pruefung');
    const [sure, vers, pos] = teile(dritte);
    const lernapp = 'lernapp-kurs-koran';

    await angemeldetAls([{ rolle: 'religioese_pruefung' }]);
    const bearbeitet = await aktionen.bedeutungSpeichern(
      {},
      formular({ formId: String(z.formId), sprache: 'de', bedeutung: '[Bedeutung neu]', wurzel: '[W]' }),
    );
    expect(bearbeitet).toMatchObject({ status: 'zur_pruefung' });
    expect(aufrufe.updateTag).toEqual([lernapp]);
    expect(gezeigt((await paket()).paket)).not.toContain(dritte);

    // unverändert gespeichert: nichts zu erneuern
    await angemeldetAls([{ rolle: 'religioese_pruefung' }]);
    await aktionen.bedeutungSpeichern(
      {},
      formular({ formId: String(z.formId), sprache: 'de', bedeutung: '[Bedeutung neu]', wurzel: '[W]' }),
    );
    expect(aufrufe.updateTag).toEqual([]);

    await angemeldetAls([{ rolle: 'religioese_pruefung' }]);
    await aktionen.ortSpeichern(
      {},
      formular({ sure: String(sure), vers: String(vers), pos: String(pos), sprache: 'de', bedeutung: '[Ort]' }),
    );
    expect(aufrufe.updateTag).toEqual([lernapp]);
    await angemeldetAls([{ rolle: 'religioese_pruefung' }]);
    await aktionen.ortEntfernen({}, formular({ sure: String(sure), vers: String(vers), pos: String(pos), sprache: 'de' }));
    expect(aufrufe.updateTag).toEqual([lernapp]);

    await angemeldetAls([{ rolle: 'religioese_pruefung' }]);
    expect(
      await aktionen.statusSetzen({}, formular({ art: 'quran_wortbedeutung', kennung: z.id, ziel: 'entwurf', grund: '[Grund]' })),
    ).toMatchObject({ status: 'entwurf' });
    expect(aufrufe.updateTag).toEqual([lernapp]);

    await angemeldetAls([{ rolle: 'religioese_pruefung' }]);
    await aktionen.bedeutungEntfernen({}, formular({ kennung: z.id }));
    expect(aufrufe.updateTag).toEqual([lernapp]);
    expect((await koran.pruefeKoranSichtbarkeit()).verstoesse).toEqual([]);
  });
});

describe('Koran-Pfad: Konto mit Administration und religiöser Prüfung (Stufe C N2, Gegenprüfung)', () => {
  const L03 = E01.lektionen[2]!;
  const STELLEN_L03 = stellenVon(L03);
  /** Altkonto mit beiden Rollen (vor Stufe C N2 vergeben; heute vergibt „Benutzer und Rollen“ das nicht mehr). */
  const beideRollen = async () => {
    const id = await person('religioese_pruefung');
    await db.insert(schema.rolleZuweisung).values({ benutzerId: id, rolle: 'administration' });
    return id;
  };
  const lektionen = async () => (await paket()).paket.lektionen.map((l) => l.schluessel);

  it('seine Freigabe zählt nie, sein Einwand sperrt weiter – im Paketbau und in der Abfrage am Live-Stand', async () => {
    const ids3 = await bedeutungen(STELLEN_L03, await person('religioese_pruefung'));
    await pruefe(ids3, await person('religioese_pruefung'));
    await pruefe(ids3, await beideRollen());
    expect(gezeigt((await paket()).paket).filter((s) => STELLEN_L03.includes(s))).toEqual([]);
    expect(await lektionen()).not.toContain(L03.schluessel);

    // zweite gültige Freigabe: sichtbar; diesen Stand festhalten (wie ein Cache, der nicht erneuert wurde)
    const zweite = await person('religioese_pruefung');
    await pruefe(ids3, zweite);
    expect(await lektionen()).toContain(L03.schluessel);
    const vorher = { de: await koran.frischGebaut('de'), tr: await koran.frischGebaut('tr') };
    const veraltet = async (sprache: 'de' | 'tr') => vorher[sprache];
    expect((await koran.pruefeKoranSichtbarkeit(veraltet)).verstoesse).toEqual([]);

    // ohne die zweite gültige Freigabe ersetzt die des Kontos mit beiden Rollen sie nicht – auch nicht in der SQL-Abfrage
    const [w] = L03.wortformen as [string];
    await db
      .delete(schema.lernappPruefung)
      .where(and(eq(schema.lernappPruefung.pruefendeId, zweite), eq(schema.lernappPruefung.inhaltTyp, 'koran_bedeutung')));
    expect(await lektionen()).not.toContain(L03.schluessel);
    expect((await koran.pruefeKoranSichtbarkeit(veraltet)).verstoesse).toContain(`de ${w}: 1 Freigabe(n) zum aktuellen Hash`);

    // wieder zwei gültige Freigaben; ein gespeichertes „abgelehnt“ eines Kontos mit beiden Rollen sperrt (fail closed)
    await pruefe(ids3, zweite);
    expect(await lektionen()).toContain(L03.schluessel);
    expect((await koran.pruefeKoranSichtbarkeit(veraltet)).verstoesse).toEqual([]);
    await pruefe(ids3, await beideRollen(), 'abgelehnt', [w]);
    expect(gezeigt((await paket()).paket)).not.toContain(w);
    expect(await lektionen()).not.toContain(L03.schluessel);
    expect((await koran.pruefeKoranSichtbarkeit(veraltet)).verstoesse).toContain(`de ${w}: Einwand zum aktuellen Hash`);
    expect((await koran.pruefeKoranSichtbarkeit()).verstoesse).toEqual([]);
  });
});
