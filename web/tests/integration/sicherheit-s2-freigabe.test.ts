import { and, desc, eq } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { schema } from '@/lib/db';
import { angemeldetAls, formular, verwaltungsUmgebung } from './hilfen/verwaltung';

/**
 * Regressionstest der Sicherheitsprüfung S2 (Linse S2b): Vier-Augen-Prinzip der religiösen Freigabe auch über die
 * Warteschlange „Freigaben“ (ADR 0030, MN-24). Wer einen Inhalt verfasst oder zuletzt geändert hat, gibt ihn nicht selbst
 * frei – weder in „Koran & Hadith“ noch über `entscheideFreigabe`. Inhalte sind neutrale Platzhalter (keine religiösen
 * Texte), Testdaten fiktiv (G-04).
 */
const { client, db } = await verwaltungsUmgebung();
const { entscheideFreigabe } = await import('@/server/actions/freigaben');
const { speichereSeite, revisionWiederherstellen } = await import('@/server/actions/seiten');
afterAll(() => client.close());

beforeAll(async () => {
  // Platzhalter-Vers (kein religiöser Text), damit ein Vers-Baustein gültig ist
  await db.insert(schema.quranQuelle).values({
    id: 'tanzil',
    bezeichnung: '[Quelle]',
    url: 'https://example.test',
    version: 'test',
    sha256: '0'.repeat(64),
    lizenz: '[Lizenz]',
  });
  await db.insert(schema.quranSure).values({ nr: 1, nameAr: '[Sure 1]', verseAnzahl: 2, quelleId: 'tanzil', nameUmschrift: '[Sure Eins]' });
  await db.insert(schema.quranVers).values([
    { sure: 1, vers: 1, textAr: '[a]' },
    { sure: 1, vers: 2, textAr: '[a]' },
  ]);
});

async function weiterleitung(aufruf: Promise<unknown>): Promise<{ ziel?: string; wert?: unknown }> {
  try {
    return { wert: await aufruf };
  } catch (e) {
    return { ziel: (e as { ziel?: string }).ziel };
  }
}

describe('Vier-Augen-Prinzip über „Freigaben“', () => {
  it('eigener Inhalt: „vierAugen“, Status bleibt „zur_pruefung“; eine zweite Person gibt frei', async () => {
    const pruefer = (await angemeldetAls([{ rolle: 'religioese_pruefung' }]))!;
    await db.insert(schema.tajwidRegel).values({
      schluessel: 's2-vier-augen',
      familie: 'test',
      name: { de: '[Platzhalter Regel]' },
      freigabe: 'zur_pruefung',
      verfasstVon: pruefer,
    });
    const fd = () => formular({ inhaltTyp: 'tajwid_regel', inhaltId: 's2-vier-augen', entscheidung: 'freigeben' });
    expect(await weiterleitung(entscheideFreigabe({}, fd()))).toEqual({ wert: { fehler: 'vierAugen' } });
    const [vorher] = await db.select().from(schema.tajwidRegel).where(eq(schema.tajwidRegel.schluessel, 's2-vier-augen'));
    expect(vorher).toMatchObject({ freigabe: 'zur_pruefung', geprueftVon: null });

    // Administration darf religiös freigeben – aber auch sie nicht den eigenen Inhalt
    const admin = (await angemeldetAls([{ rolle: 'administration' }]))!;
    await db.update(schema.tajwidRegel).set({ verfasstVon: admin }).where(eq(schema.tajwidRegel.schluessel, 's2-vier-augen'));
    expect(await weiterleitung(entscheideFreigabe({}, fd()))).toEqual({ wert: { fehler: 'vierAugen' } });

    // Eine zweite Person mit religiöser Prüfung gibt frei
    const zweite = (await angemeldetAls([{ rolle: 'religioese_pruefung' }]))!;
    expect(await weiterleitung(entscheideFreigabe({}, fd()))).toEqual({ ziel: '/verwaltung/freigaben?erledigt=freigeben' });
    const [danach] = await db.select().from(schema.tajwidRegel).where(eq(schema.tajwidRegel.schluessel, 's2-vier-augen'));
    expect(danach).toMatchObject({ freigabe: 'geprueft', verfasstVon: admin, geprueftVon: zweite });
    const verlauf = await db
      .select()
      .from(schema.freigabe)
      .where(and(eq(schema.freigabe.inhaltTyp, 'tajwid_regel'), eq(schema.freigabe.inhaltId, 's2-vier-augen')));
    expect(verlauf.map((v) => [v.status, v.von])).toEqual([['geprueft', zweite]]);
  });

  it('eigener Inhalt lässt sich zurückweisen (kein Freigeben)', async () => {
    const pruefer = (await angemeldetAls([{ rolle: 'religioese_pruefung' }]))!;
    await db.insert(schema.tajwidRegel).values({
      schluessel: 's2-zurueck',
      familie: 'test',
      name: { de: '[Platzhalter Regel]' },
      freigabe: 'zur_pruefung',
      verfasstVon: pruefer,
    });
    const r = await weiterleitung(
      entscheideFreigabe(
        {},
        formular({ inhaltTyp: 'tajwid_regel', inhaltId: 's2-zurueck', entscheidung: 'zurueckweisen', kommentar: 'Bitte überarbeiten' }),
      ),
    );
    expect(r).toEqual({ ziel: '/verwaltung/freigaben?erledigt=zurueckweisen' });
    const [z] = await db.select().from(schema.tajwidRegel).where(eq(schema.tajwidRegel.schluessel, 's2-zurueck'));
    expect(z.freigabe).toBe('entwurf');
  });
});

describe('Seite: Redaktionsantrag deckt keine ungeprüften Verse (S2b, Revision wiederherstellen)', () => {
  const vers = JSON.stringify([{ typ: 'vers', id: 'versblock1', sure: 1, von: 1, bis: 2, uebersetzung: true }]);
  const text = JSON.stringify([
    {
      typ: 'text',
      id: 'textblock1',
      inhalt: { de: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hallo' }] }] } },
    },
  ]);
  const verlauf = (id: string) =>
    db
      .select({ art: schema.freigabe.art, status: schema.freigabe.status })
      .from(schema.freigabe)
      .where(and(eq(schema.freigabe.inhaltTyp, 'seite'), eq(schema.freigabe.inhaltId, id)))
      .orderBy(desc(schema.freigabe.am), desc(schema.freigabe.id));

  it('Wiederherstellen einer Fassung mit Vers zieht den offenen Redaktionsantrag zurück; Freigeben veröffentlicht nichts', async () => {
    await angemeldetAls([{ rolle: 'redaktion' }]);
    const anlage = await weiterleitung(
      speichereSeite({}, formular({ titelDe: 'S2b', slugDe: 's2b-revision', status: 'entwurf', bloecke: vers })),
    );
    const id = /seiten\/([0-9a-f-]{36})/.exec(anlage.ziel ?? '')![1];
    const [r1] = await db
      .select()
      .from(schema.revision)
      .where(and(eq(schema.revision.inhaltTyp, 'seite'), eq(schema.revision.inhaltId, id)))
      .orderBy(desc(schema.revision.erstelltAm))
      .limit(1);
    expect(
      await speichereSeite({}, formular({ id, titelDe: 'S2b', slugDe: 's2b-revision', status: 'zur_pruefung', bloecke: text })),
    ).toMatchObject({
      hinweis: 'zurPruefung',
    });
    expect((await verlauf(id))[0]).toEqual({ art: 'redaktion', status: 'zur_pruefung' });
    await weiterleitung(revisionWiederherstellen(formular({ revisionId: r1.id })));
    expect((await verlauf(id))[0]).toEqual({ art: 'redaktion', status: 'entwurf' });
    expect(await weiterleitung(entscheideFreigabe({}, formular({ inhaltTyp: 'seite', inhaltId: id, entscheidung: 'freigeben' })))).toEqual({
      wert: { fehler: 'nichtMehrOffen' },
    });
    const [seite] = await db.select().from(schema.seite).where(eq(schema.seite.id, id));
    expect(seite.status).toBe('entwurf');
  });

  it('offener Redaktionsantrag, aber der aktuelle Stand hat einen Vers: Antrag geht in die religiöse Prüfung', async () => {
    await angemeldetAls([{ rolle: 'redaktion' }]);
    const anlage = await weiterleitung(
      speichereSeite({}, formular({ titelDe: 'S2b', slugDe: 's2b-wettlauf', status: 'zur_pruefung', bloecke: text })),
    );
    const id = /seiten\/([0-9a-f-]{36})/.exec(anlage.ziel ?? '')![1];
    expect((await verlauf(id))[0]).toEqual({ art: 'redaktion', status: 'zur_pruefung' });
    // Inhalt ändert sich zwischen Antrag und Entscheidung (z. B. ein älterer Weg ohne Rückzug)
    await db
      .update(schema.seite)
      .set({ bloecke: JSON.parse(vers) })
      .where(eq(schema.seite.id, id));
    expect(await weiterleitung(entscheideFreigabe({}, formular({ inhaltTyp: 'seite', inhaltId: id, entscheidung: 'freigeben' })))).toEqual({
      wert: { fehler: 'religioesePruefungNoetig' },
    });
    expect((await verlauf(id))[0]).toEqual({ art: 'religioes', status: 'zur_pruefung' });
    const [seite] = await db.select().from(schema.seite).where(eq(schema.seite.id, id));
    expect(seite.status).toBe('entwurf');
  });
});
