import { describe, expect, it } from 'vitest';
import type { FeedEintrag } from '@/lib/dachverband/feed';
import { adressKern, fuehreZusammen } from '@/lib/dachverband/zusammenfuehren';
import type { DachverbandEintrag } from '@/lib/validierung/seiteninhalte/dachverband';

/**
 * Zusammenführung von Bestand und Hutba-Feed (Plan Marktstart P3): neue Predigten vorn, Vorhandenes (auch Ausgeblendetes)
 * bleibt unverändert, Obergrenze nur zulasten alter Feed-Einträge, die nicht mehr im Feed stehen.
 */
const IGMG = 'https://www.igmg.org';
const feed = (schluessel: string, datum: string): FeedEintrag => ({
  schluessel,
  titel: `Predigt ${schluessel}`,
  url: `${IGMG}/${schluessel}/`,
  datum,
  veroeffentlicht: `${datum}T08:00:00.000Z`,
});
const bestand = (schluessel: string, teil: Partial<DachverbandEintrag> = {}): DachverbandEintrag => ({
  schluessel,
  art: 'hutba',
  datum: '2026-09-04',
  titel: { de: `Eigener Titel ${schluessel}` },
  url: `${IGMG}/${schluessel}/`,
  sichtbar: true,
  herkunft: 'feed',
  ...teil,
});

describe('fuehreZusammen', () => {
  it('neue Predigten vorn (neueste zuerst) als sichtbare Hutba aus dem Feed, ohne Kurztext; Bestand dahinter', () => {
    const alt = [bestand('alt', { herkunft: 'redaktion', art: 'kampagne' })];
    const z = fuehreZusammen(alt, [feed('a', '2026-10-09'), feed('b', '2026-10-23'), feed('c', '2026-10-16')]);
    expect(z.neu.map((e) => e.schluessel)).toEqual(['b', 'c', 'a']);
    expect(z.eintraege.map((e) => e.schluessel)).toEqual(['b', 'c', 'a', 'alt']);
    expect(z.neu[0]).toEqual({
      schluessel: 'b',
      art: 'hutba',
      datum: '2026-10-23',
      titel: { de: 'Predigt b' },
      url: `${IGMG}/b/`,
      sichtbar: true,
      herkunft: 'feed',
    });
    expect(z).toMatchObject({ vorhanden: 0, entfernt: 0 });
  });

  it('vorhanden über Kennung oder Adresse – ausgeblendete bleiben ausgeblendet, Titel der Redaktion bleibt', () => {
    const alt = [
      bestand('versteckt', { sichtbar: false }),
      // Die Redaktion hat dieselbe Predigt unter anderer Kennung eingetragen (Adresse ohne Schrägstrich, Großbuchstaben)
      bestand('hutba-2026-10-23', { herkunft: 'redaktion', url: 'https://WWW.igmg.org/neu', titel: { de: 'Von Hand' } }),
    ];
    const z = fuehreZusammen(alt, [feed('versteckt', '2026-10-16'), feed('neu', '2026-10-23')]);
    expect(z.neu).toEqual([]);
    expect(z.vorhanden).toBe(2);
    expect(z.eintraege).toEqual(alt);
  });

  it('Obergrenze: zuerst die ältesten Feed-Einträge, die nicht mehr im Feed stehen; Redaktion und Feed-Einträge im Feed bleiben', () => {
    const alt = [
      bestand('red-1', { herkunft: 'redaktion', datum: '2020-01-01' }),
      bestand('feed-alt', { datum: '2026-01-02' }),
      bestand('feed-aelter', { datum: '2026-01-01' }),
      bestand('feed-im-feed', { datum: '2025-01-01', sichtbar: false }),
    ];
    const z = fuehreZusammen(alt, [feed('neu', '2026-10-23'), feed('feed-im-feed', '2025-01-01')], 4);
    expect(z.eintraege.map((e) => e.schluessel)).toEqual(['neu', 'red-1', 'feed-alt', 'feed-im-feed']);
    expect(z).toMatchObject({ entfernt: 1, vorhanden: 1 });
    // Der Editor bekommt die Kennungen, damit er sie aus seinem Stand nimmt (sonst scheitert das Speichern an der Obergrenze)
    expect(z.entfernteSchluessel).toEqual(['feed-aelter']);
    // ausgeblendet und noch im Feed: bleibt (sonst käme sie beim nächsten Lauf sichtbar zurück)
    expect(z.eintraege.find((e) => e.schluessel === 'feed-im-feed')?.sichtbar).toBe(false);
  });

  it('reicht das Entfernen nicht, bleiben die ältesten neuen Predigten draußen; nie über der Obergrenze', () => {
    const alt = [bestand('red-1', { herkunft: 'redaktion' }), bestand('red-2', { herkunft: 'redaktion' })];
    const z = fuehreZusammen(alt, [feed('n1', '2026-10-09'), feed('n2', '2026-10-23'), feed('n3', '2026-10-16')], 3);
    expect(z.eintraege.map((e) => e.schluessel)).toEqual(['n2', 'red-1', 'red-2']);
    expect(z.neu.map((e) => e.schluessel)).toEqual(['n2']);
    expect(fuehreZusammen(alt, [feed('n1', '2026-10-09')], 2).eintraege).toEqual(alt);
  });

  it('zweiter Lauf mit demselben Feed: nichts Neues', () => {
    const erster = fuehreZusammen([], [feed('a', '2026-10-09'), feed('b', '2026-10-16')]);
    const zweiter = fuehreZusammen(erster.eintraege, [feed('a', '2026-10-09'), feed('b', '2026-10-16')]);
    expect(zweiter).toMatchObject({ neu: [], vorhanden: 2, entfernt: 0, entfernteSchluessel: [] });
    expect(zweiter.eintraege).toEqual(erster.eintraege);
  });

  it('Adresskern: Host und Pfad, klein, mit Schrägstrich, ohne Abfrage und Anker', () => {
    expect(adressKern('https://www.igmg.org/A/b?x=1#y')).toBe('www.igmg.org/a/b/');
    expect(adressKern('kein-url')).toBe('kein-url');
  });
});
