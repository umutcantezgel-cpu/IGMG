import { and, eq } from 'drizzle-orm';
import { afterAll, describe, expect, it } from 'vitest';
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
afterAll(() => client.close());

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
