import { randomUUID } from 'node:crypto';
import { and, eq, like } from 'drizzle-orm';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { db as appDb, schema } from '@/lib/db';
import { PaketSchema, VerzeichnisSchema, type Paket } from '@/lib/lernapp/paket/typen';
import { verwaltungsUmgebung } from './hilfen/verwaltung';

/**
 * Formelliste als Ganzes im Paketbau (KERN 4.0 §2.3 „Formelliste“, LM-09; Stufe C N2, Z-L10) gegen PGlite mit dem Testkurs:
 * Ein Eintrag mit `religionsbezug` erscheint erst mit zwei eigenen religiösen Freigaben **und** freigegebener Liste (zwei
 * Freigaben zum aktuellen Stand der Liste, Status „freigegeben“ im Leitfaden). Der Status im Leitfaden wird hier umgeschaltet
 * (im Repository: gesperrt). Testdaten fiktiv, Schlüssel des Testkurses zur Laufzeit ermittelt.
 */
const leitfaden = vi.hoisted(() => ({ status: 'gesperrt' as 'gesperrt' | 'freigegeben' }));
vi.mock('@/lib/lernapp/formelliste', async (original) => {
  const o = await original<typeof import('@/lib/lernapp/formelliste')>();
  return {
    ...o,
    FORMELN: {
      get status() {
        return leitfaden.status;
      },
      liste: o.FORMELN.liste,
    },
  };
});

const { client, db } = await verwaltungsUmgebung();
const { lernappTestkurs } = await import('../../drizzle/seeds/lernapp-test');
const verzeichnisRoute = await import('@/app/lern-app/pakete/[kurs]/route');
const einheitRoute = await import('@/app/lern-app/pakete/[kurs]/[einheit]/[hash]/route');
const { FORMELLISTE_ID, FORMELN, formellisteHash } = await import('@/lib/lernapp/formelliste');
const { formellisteFreigegeben } = await import('@/server/queries/lernapp/pakete');
afterAll(() => client.close());

beforeAll(async () => {
  await lernappTestkurs(appDb);
});
afterEach(() => {
  delete process.env.FUNKTION_LERNAPP;
  leitfaden.status = 'gesperrt';
});

const KURS = 'tr-aus-de';
const kontext = <T extends Record<string, unknown>>(p: T) => ({ params: Promise.resolve(p) }) as never;
const anfrage = (pfad: string) => new Request(`https://example.test${pfad}`);

/** Erstes Einheitenpaket der Richtung (Schlüssel aus dem Verzeichnis). */
async function paket(): Promise<Paket> {
  const v = VerzeichnisSchema.parse(
    await (await verzeichnisRoute.GET(anfrage(`/lern-app/pakete/${KURS}`), kontext({ kurs: KURS }))).json(),
  );
  const e = v.einheiten[0]!;
  const r = await einheitRoute.GET(
    anfrage(`/lern-app/pakete/${KURS}/${e.schluessel}/${e.hash}`),
    kontext({ kurs: KURS, einheit: e.schluessel, hash: e.hash }),
  );
  expect(r.status).toBe(200);
  return PaketSchema.parse(await r.json());
}

async function person(rollen: ('religioese_pruefung' | 'administration')[]): Promise<string> {
  const id = randomUUID();
  await db.insert(schema.user).values({ id, name: 'Testperson Prüfung', email: `f.${id}@example.test`, emailVerified: true });
  await db.insert(schema.rolleZuweisung).values(rollen.map((rolle) => ({ benutzerId: id, rolle })));
  return id;
}

const pruefung = (inhaltTyp: 'lemma' | 'formelliste', inhaltId: string, inhaltHash: string, pruefendeId: string) =>
  db.insert(schema.lernappPruefung).values({ inhaltTyp, inhaltId, inhaltHash, art: 'religioes', pruefendeId, urteil: 'ok' });

describe('Formelliste im Paketbau', () => {
  let lemma: { id: string; schluessel: string; inhaltHash: string };

  beforeAll(async () => {
    process.env.FUNKTION_LERNAPP = 'an';
    // ein Lemma der ersten Einheit, das im Paket steht, bekommt das Kennzeichen und zwei eigene Freigaben
    const schluessel = Object.keys((await paket()).eintraege).find((k) => /^tr\.a1\.[^.]+\.w\d+$/.test(k))!;
    const [l] = await db
      .update(schema.lernappLemma)
      .set({ religionsbezug: true })
      .where(and(eq(schema.lernappLemma.schluessel, schluessel), like(schema.lernappLemma.schluessel, 'tr.%')))
      .returning();
    lemma = { id: l!.id, schluessel, inhaltHash: l!.inhaltHash };
    for (const id of [await person(['religioese_pruefung']), await person(['religioese_pruefung'])])
      await pruefung('lemma', lemma.id, lemma.inhaltHash, id);
  });

  it('Liste gesperrt (Status im Leitfaden): unsichtbar trotz zwei Eintragsfreigaben – auch mit zwei Listenfreigaben', async () => {
    process.env.FUNKTION_LERNAPP = 'an';
    expect(await formellisteFreigegeben()).toBe(false);
    expect((await paket()).eintraege[lemma.schluessel]).toBeUndefined();
    const hash = formellisteHash(FORMELN.liste);
    for (const id of [await person(['religioese_pruefung']), await person(['religioese_pruefung'])])
      await pruefung('formelliste', FORMELLISTE_ID, hash, id);
    expect(await formellisteFreigegeben()).toBe(false);
    expect((await paket()).eintraege[lemma.schluessel]).toBeUndefined();
    await db.delete(schema.lernappPruefung).where(eq(schema.lernappPruefung.inhaltTyp, 'formelliste'));
  });

  it('Liste freigegeben + zwei Listenfreigaben zum aktuellen Stand + zwei Eintragsfreigaben: sichtbar, ohne Stimme', async () => {
    process.env.FUNKTION_LERNAPP = 'an';
    leitfaden.status = 'freigegeben';
    const hash = formellisteHash(FORMELN.liste);
    // ohne Listenfreigaben: unsichtbar
    expect((await paket()).eintraege[lemma.schluessel]).toBeUndefined();
    // eine Freigabe und ein Konto mit Administration (auch mit der Rolle) genügen nicht
    await pruefung('formelliste', FORMELLISTE_ID, hash, await person(['religioese_pruefung']));
    await pruefung('formelliste', FORMELLISTE_ID, hash, await person(['religioese_pruefung', 'administration']));
    expect(await formellisteFreigegeben()).toBe(false);
    expect((await paket()).eintraege[lemma.schluessel]).toBeUndefined();
    // Freigabe zu einem älteren Stand der Liste zählt nicht
    await pruefung('formelliste', FORMELLISTE_ID, 'b'.repeat(64), await person(['religioese_pruefung']));
    expect((await paket()).eintraege[lemma.schluessel]).toBeUndefined();
    // zweite Freigabe zum aktuellen Stand: sichtbar (Religionsbezug nie mit Stimme)
    await pruefung('formelliste', FORMELLISTE_ID, hash, await person(['religioese_pruefung']));
    expect(await formellisteFreigegeben()).toBe(true);
    const mit = await paket();
    expect(mit.eintraege[lemma.schluessel]).toMatchObject({ text: expect.any(String) });
    expect(mit.eintraege[lemma.schluessel]?.stimme).toBeUndefined();
    // die Liste ersetzt die Eintragsfreigaben nicht: ohne sie wieder unsichtbar
    await db.delete(schema.lernappPruefung).where(eq(schema.lernappPruefung.inhaltId, lemma.id));
    expect((await paket()).eintraege[lemma.schluessel]).toBeUndefined();
    await db.delete(schema.lernappPruefung).where(eq(schema.lernappPruefung.inhaltTyp, 'formelliste'));
  });
});
