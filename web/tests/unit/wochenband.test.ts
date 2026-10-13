import { describe, expect, it } from 'vitest';
import { type WochenQuelle, wochenband } from '@/components/website/veranstaltungen/wochenband';

/** Veranstaltung wie aus `ladeVeranstaltungen` (Zeiten als ISO, Serien mit erstem Beginn). */
function termin(teil: Partial<WochenQuelle> & { beginn: string }): WochenQuelle {
  return {
    id: teil.id ?? teil.beginn,
    slug: teil.slug ?? 's',
    titel: { de: teil.id ?? 'T' },
    ende: null,
    ganztaegig: false,
    regel: null,
    ausnahmen: [],
    ersterBeginn: teil.beginn,
    ...teil,
  };
}

describe('Wochenband der Veranstaltungen (AUFTRAG 4)', () => {
  it('sieben Kalendertage ab heute, auch über den Monatswechsel', () => {
    const tage = wochenband([], '2026-10-29');
    expect(tage.map((t) => t.datum)).toEqual([
      '2026-10-29',
      '2026-10-30',
      '2026-10-31',
      '2026-11-01',
      '2026-11-02',
      '2026-11-03',
      '2026-11-04',
    ]);
    expect(tage.every((t) => t.termine.length === 0)).toBe(true);
  });

  it('wöchentliche Serie: jedes Vorkommen am richtigen Tag (Europe/Berlin), Ausnahme fällt aus', () => {
    // Dienstags 14:00 Uhr Ortszeit (12:00 UTC im Sommer), erster Beginn im Juni
    const serie = termin({
      id: 'frauenkreis',
      beginn: '2026-10-13T12:00:00.000Z',
      ersterBeginn: '2026-06-02T12:00:00.000Z',
      regel: 'FREQ=WEEKLY;BYDAY=TU',
    });
    const tage = wochenband([serie], '2026-10-20', 14);
    const mit = tage.filter((t) => t.termine.length).map((t) => t.datum);
    expect(mit).toEqual(['2026-10-20', '2026-10-27']);
    // Nach dem Wechsel auf Winterzeit (25.10.) bleibt die Wanduhrzeit 14:00 (13:00 UTC)
    expect(tage[0].termine[0].beginn).toBe('2026-10-20T12:00:00.000Z');
    expect(tage[7].termine[0].beginn).toBe('2026-10-27T13:00:00.000Z');
    const ohne = wochenband([{ ...serie, ausnahmen: ['2026-10-13'] }], '2026-10-13');
    expect(ohne[0].termine).toEqual([]);
  });

  it('einmalige Termine nur im Zeitraum; Tagesgrenze nach Ortszeit, sortiert nach Beginn', () => {
    const spaet = termin({ id: 'spaet', beginn: '2026-10-14T22:30:00.000Z' }); // 15.10. 00:30 Uhr in Berlin
    const frueh = termin({ id: 'frueh', beginn: '2026-10-15T05:00:00.000Z' });
    const vorher = termin({ id: 'vorher', beginn: '2026-10-12T10:00:00.000Z' });
    const danach = termin({ id: 'danach', beginn: '2026-10-20T10:00:00.000Z' });
    const tage = wochenband([frueh, danach, spaet, vorher], '2026-10-13');
    expect(tage.find((t) => t.datum === '2026-10-14')?.termine).toEqual([]);
    expect(tage.find((t) => t.datum === '2026-10-15')?.termine.map((x) => x.id)).toEqual(['spaet', 'frueh']);
    expect(tage.flatMap((t) => t.termine).map((x) => x.id)).not.toContain('danach');
    expect(tage.flatMap((t) => t.termine).map((x) => x.id)).not.toContain('vorher');
  });

  it('ein Termin, der vor dem ersten Tag begann und noch läuft, zählt nicht', () => {
    const laeuft = termin({ id: 'lager', beginn: '2026-10-10T08:00:00.000Z', ende: '2026-10-16T16:00:00.000Z' });
    expect(wochenband([laeuft], '2026-10-13').flatMap((t) => t.termine)).toEqual([]);
  });
});
