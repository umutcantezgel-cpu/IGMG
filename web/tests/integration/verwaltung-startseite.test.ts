import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { and, asc, eq } from 'drizzle-orm';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { schema } from '@/lib/db';
import { ordnungAus, STANDARD_ORDNUNG, type StartseitenOrdnung } from '@/lib/startseite/abschnitte';
import { angemeldetAls, aufrufe, formular, verwaltungsUmgebung } from './hilfen/verwaltung';

/**
 * Verwaltung „Startseite“ (F-40, Plan §3.7): Reihenfolge und Sichtbarkeit speichern (Einstellung, Revision, Audit,
 * Cache-Tag), Rechte (ohne Rolle bzw. ohne `startseite.bearbeiten` verboten), Standard wiederherstellen, frühere Fassung
 * zurückholen; öffentliches Lesen über `ladeStartseitenOrdnung` mit Rückfall auf den Bestand (ohne Datenbank, ohne oder
 * mit ungültiger Einstellung). Die Startseite bleibt statisch: keine Cookies/Header, keine neue Client-Komponente.
 */
const { client, db } = await verwaltungsUmgebung();
const { speichereStartseite, startseiteZuruecksetzen, startseiteRevisionWiederherstellen } = await import('@/server/actions/startseite');
const { ladeStartseitenOrdnung } = await import('@/server/queries/startseite');
const { ladeStartseiteVerwaltung } = await import('@/server/queries/verwaltung/startseite');
afterAll(() => client.close());

const NEU: StartseitenOrdnung = [
  { schluessel: 'neuigkeiten', sichtbar: true },
  { schluessel: 'veranstaltungen', sichtbar: true },
  { schluessel: 'moschee', sichtbar: false },
  { schluessel: 'desTages', sichtbar: true },
];
const fd = (ordnung: unknown) => formular({ ordnung: JSON.stringify(ordnung) });
const einstellung = () => db.select().from(schema.einstellung).where(eq(schema.einstellung.schluessel, 'startseite'));
const revisionen = () =>
  db
    .select()
    .from(schema.revision)
    .where(and(eq(schema.revision.inhaltTyp, 'startseite'), eq(schema.revision.inhaltId, 'startseite')))
    .orderBy(asc(schema.revision.erstelltAm));
const audit = () =>
  db.select().from(schema.auditEintrag).where(eq(schema.auditEintrag.zielId, 'startseite')).orderBy(asc(schema.auditEintrag.id));

/** Fängt die Weiterleitung einer Action ab und liefert ihr Ziel. */
async function weiter(aufruf: Promise<unknown>): Promise<string> {
  const e = (await aufruf.then(
    () => null,
    (x: unknown) => x,
  )) as { ziel?: string } | null;
  return e?.ziel ?? '';
}

beforeEach(async () => {
  await db.delete(schema.einstellung).where(eq(schema.einstellung.schluessel, 'startseite'));
});

describe('Speichern', () => {
  it('Redaktion speichert: Einstellung, Revision, Audit ohne Personendaten, Cache-Tag; öffentlich die neue Ordnung', async () => {
    const id = await angemeldetAls([{ rolle: 'redaktion' }]);
    const vorher = (await revisionen()).length;
    expect(await speichereStartseite({}, fd(NEU))).toEqual({ gespeichert: expect.any(Number) });
    expect((await einstellung())[0]).toMatchObject({ wert: NEU, geaendertVon: id });
    const rev = await revisionen();
    expect(rev).toHaveLength(vorher + 1);
    expect(rev.at(-1)).toMatchObject({ inhalt: NEU, erstelltVon: id });
    expect((await audit()).at(-1)).toMatchObject({
      aktion: 'einstellung.geaendert',
      zielTyp: 'einstellung',
      details: { reihenfolge: 'neuigkeiten,veranstaltungen,moschee,desTages', ausgeblendet: 1 },
    });
    expect(aufrufe.updateTag).toEqual(['startseite']);
    expect(await ladeStartseitenOrdnung()).toEqual(NEU);
  });

  it('unverändert erneut gespeichert: keine neue Fassung, kein Audit, kein Cache-Verfall', async () => {
    await angemeldetAls([{ rolle: 'redaktion' }]);
    await speichereStartseite({}, fd(NEU));
    const [r, a] = [(await revisionen()).length, (await audit()).length];
    await angemeldetAls([{ rolle: 'administration' }]);
    expect(await speichereStartseite({}, fd(NEU))).toEqual({ gespeichert: expect.any(Number) });
    expect([(await revisionen()).length, (await audit()).length]).toEqual([r, a]);
    expect(aufrufe.updateTag).toEqual([]);
  });

  it.each([
    ['unvollständig', NEU.slice(0, 3)],
    ['doppelt', [...NEU.slice(0, 3), NEU[0]]],
    ['unbekannter Abschnitt', [...NEU.slice(0, 3), { schluessel: 'kopf', sichtbar: true }]],
    ['kein JSON', '{'],
  ])('ungültige Eingabe (%s): „pruefen“, nichts gespeichert', async (_n, ordnung) => {
    await angemeldetAls([{ rolle: 'redaktion' }]);
    const r = await speichereStartseite({}, typeof ordnung === 'string' ? formular({ ordnung }) : fd(ordnung));
    expect(r).toEqual({ fehler: 'pruefen' });
    expect(await einstellung()).toHaveLength(0);
  });
});

describe('Rechte (startseite.bearbeiten)', () => {
  it.each([
    ['ohne Sitzung', null, true],
    ['ohne Rolle', [], true],
    ['ohne zweiten Faktor', [{ rolle: 'administration' as const }], false],
    ['Bildung', [{ rolle: 'bildung' as const }], true],
    ['Organisationsredaktion', [{ rolle: 'organisationsredaktion' as const, organisation: 'gt' as const }], true],
    ['Leitung', [{ rolle: 'leitung' as const }], true],
    ['Religiöse Prüfung', [{ rolle: 'religioese_pruefung' as const }], true],
  ])('%s: verboten, nichts geändert', async (_n, rollen, zweiFaktor) => {
    await angemeldetAls(rollen, zweiFaktor);
    const r = (await revisionen()).length;
    expect(await speichereStartseite({}, fd(NEU))).toEqual({ fehler: 'keinRecht' });
    await expect(startseiteZuruecksetzen()).rejects.toThrow('KEIN_RECHT');
    expect(await einstellung()).toHaveLength(0);
    expect((await revisionen()).length).toBe(r);
  });
});

describe('Standard und frühere Fassungen', () => {
  it('Standard wiederherstellen entfernt die Einstellung (Revision „standard“); öffentlich wieder der Bestand', async () => {
    await angemeldetAls([{ rolle: 'redaktion' }]);
    await speichereStartseite({}, fd(NEU));
    expect(await weiter(startseiteZuruecksetzen())).toMatch(/^\/verwaltung\/startseite\?zurueckgesetzt=\d+$/);
    expect(await einstellung()).toHaveLength(0);
    expect((await revisionen()).find((r) => r.kommentar === 'standard')).toMatchObject({ inhalt: STANDARD_ORDNUNG });
    expect(await ladeStartseitenOrdnung()).toEqual(STANDARD_ORDNUNG);
    expect(aufrufe.updateTag).toContain('startseite');
    const v = await ladeStartseiteVerwaltung();
    expect(v.gespeichert).toBeNull();
    expect(v.verlauf[0]).toMatchObject({ kommentar: 'standard' });
  });

  it('frühere Fassung zurückholen: gilt wieder, neue Fassung mit Vermerk und Audit', async () => {
    await angemeldetAls([{ rolle: 'redaktion' }]);
    await speichereStartseite({}, fd(NEU));
    // jsonb ordnet Schlüssel um: Vergleich über die gelesene Ordnung
    const alt = (await revisionen()).find((r) => JSON.stringify(ordnungAus(r.inhalt)) === JSON.stringify(NEU))!;
    await speichereStartseite({}, fd(STANDARD_ORDNUNG.map((e) => ({ ...e, sichtbar: e.schluessel !== 'desTages' }))));
    expect(await weiter(startseiteRevisionWiederherstellen(formular({ revisionId: alt.id })))).toMatch(/wiederhergestellt=\d+$/);
    expect((await einstellung())[0]?.wert).toEqual(NEU);
    expect((await revisionen()).find((r) => r.kommentar === 'wiederhergestellt')).toMatchObject({ inhalt: NEU });
    expect((await audit()).at(-1)).toMatchObject({ aktion: 'inhalt.revision_wiederhergestellt', details: { revision: alt.id } });
    expect(await ladeStartseitenOrdnung()).toEqual(NEU);
  });

  it('Revision einer anderen Inhaltsart lässt sich nicht als Startseite zurückholen', async () => {
    await angemeldetAls([{ rolle: 'redaktion' }]);
    const [fremd] = await db
      .insert(schema.revision)
      .values({ inhaltTyp: 'menue', inhaltId: 'fuss', inhalt: NEU })
      .returning({ id: schema.revision.id });
    await expect(startseiteRevisionWiederherstellen(formular({ revisionId: fremd.id }))).rejects.toThrow('KEIN_RECHT');
    expect(await einstellung()).toHaveLength(0);
  });
});

describe('Öffentliches Lesen mit Rückfall', () => {
  it('ohne Einstellung: Bestand', async () => {
    expect(await ladeStartseitenOrdnung()).toEqual(STANDARD_ORDNUNG);
  });

  it('ungültige Einstellung in der Datenbank: Bestand', async () => {
    await db.insert(schema.einstellung).values({ schluessel: 'startseite', wert: { kaputt: true } });
    expect(await ladeStartseitenOrdnung()).toEqual(STANDARD_ORDNUNG);
    await db.update(schema.einstellung).set({ wert: [{ schluessel: 'moschee', sichtbar: 'nein' }] });
    expect(await ladeStartseitenOrdnung()).toEqual(STANDARD_ORDNUNG);
  });

  it('Beispielmodus ohne Datenbank (live heute): Bestand, kein Absturz', async () => {
    await db.insert(schema.einstellung).values({ schluessel: 'startseite', wert: NEU });
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('DATABASE_URL', '');
    vi.stubEnv('BAU_PGLITE', '');
    try {
      expect(await ladeStartseitenOrdnung()).toEqual(STANDARD_ORDNUNG);
    } finally {
      vi.unstubAllEnvs();
    }
    expect(await ladeStartseitenOrdnung()).toEqual(NEU);
  });

  it('Startseite statisch: liest die Ordnung über die gecachte Abfrage mit eigenem Tag, keine Cookies/Header, kein Client-Code', () => {
    const wurzel = join(import.meta.dirname, '..', '..', 'src');
    const seite = readFileSync(join(wurzel, 'app', '[locale]', '(website)', 'page.tsx'), 'utf8');
    const abfrage = readFileSync(join(wurzel, 'server', 'queries', 'startseite.ts'), 'utf8');
    expect(seite).toContain("export const ensureStatic = 'navigation'");
    expect(seite).toContain('ladeStartseitenOrdnung()');
    expect(seite).not.toMatch(/next\/headers|cookies\(|headers\(|'use client'/);
    expect(abfrage).toContain("'use cache: remote'");
    expect(abfrage).toContain('cacheTag(TAG.startseite)');
    expect(abfrage).not.toMatch(/next\/headers|cookies\(|headers\(/);
  });
});
