import { describe, expect, it } from 'vitest';
import { meilensteinFrist, vergangeneOffene } from '@/lib/startklar/meilensteine';

/** Cockpit-Prüfung „Meilenstein vergangen, aber offen“ (AUFTRAG 3.9, E0-K05 Abschnitt 5): Datum lesen, Grenzfälle. */
describe('Meilenstein-Datum', () => {
  it('liest Tag, Monat und Jahr (erster Zeitpunkt danach, UTC)', () => {
    expect(meilensteinFrist('15.03.2024')?.toISOString()).toBe('2024-03-16T00:00:00.000Z');
    expect(meilensteinFrist('15. März 2024')?.toISOString()).toBe('2024-03-16T00:00:00.000Z');
    expect(meilensteinFrist('Maerz 2024')?.toISOString()).toBe('2024-04-01T00:00:00.000Z');
    expect(meilensteinFrist('Dezember 2025')?.toISOString()).toBe('2026-01-01T00:00:00.000Z');
    expect(meilensteinFrist(' 2026 ')?.toISOString()).toBe('2027-01-01T00:00:00.000Z');
  });

  it('Platzhalter, ungültige und unbekannte Angaben haben kein Datum', () => {
    for (const text of ['[Datum – von der Gemeinde]', '', 'bald', '31.02.2024', 'Herbst 2025', 'Mart 2024']) {
      expect(meilensteinFrist(text)).toBeNull();
    }
  });
});

describe('vergangen, aber offen', () => {
  const m = (datum: string, erledigt: boolean) => ({ titel: { de: `Schritt ${datum}` }, datum: { de: datum }, erledigt });
  const jetzt = new Date('2026-10-13T08:00:00Z');

  it('meldet nur offene Meilensteine mit abgelaufenem Zeitraum', () => {
    const liste = [m('März 2024', true), m('Januar 2026', false), m('Oktober 2026', false), m('[Datum – von der Gemeinde]', false)];
    expect(vergangeneOffene(liste, jetzt)).toEqual([{ titel: 'Schritt Januar 2026', datum: 'Januar 2026' }]);
  });

  it('der laufende Monat ist noch nicht vorbei; der letzte Tag zählt mit', () => {
    expect(vergangeneOffene([m('Oktober 2026', false), m('13.10.2026', false)], jetzt)).toEqual([]);
    expect(vergangeneOffene([m('12.10.2026', false)], jetzt)).toHaveLength(1);
  });

  it('alles erledigt (Stand 2026) → nichts zu melden', () => {
    expect(vergangeneOffene([m('März 2024', true), m('[Datum – von der Gemeinde]', true)], jetzt)).toEqual([]);
  });
});
