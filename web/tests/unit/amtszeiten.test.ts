import { describe, expect, it } from 'vitest';
import { amtszeitenLinie } from '@/components/website/vorstand/amtszeiten';
import { KATEGORIE_MARKEN } from '@/components/website/nachrichten/KategorieMarke';
import { nachrichtKategorieEnum } from '@/lib/db/schema/inhalte';

describe('Verbindungslinie der Vorsitzenden (Vorstand, AUFTRAG 4)', () => {
  const chronik = [
    { von: '1975', bis: '1979', aktuell: false },
    { von: '1979', bis: '1981', aktuell: false },
    { von: '2012', bis: '2025', aktuell: false },
    { von: '2025', bis: '', aktuell: true },
  ];

  it('reicht vom ersten Amtsbeginn bis heute; Abschnitte nach Jahren, die laufende Amtszeit markiert', () => {
    const l = amtszeitenLinie(chronik, 2026);
    expect(l).not.toBeNull();
    expect(l!.start).toBe(1975);
    expect(l!.ende).toBe(2026);
    expect(l!.abschnitte[0]).toMatchObject({ von: 1975, bis: 1979, anfang: 0, aktuell: false });
    expect(l!.abschnitte[0].laenge).toBeCloseTo(4 / 51);
    const letzte = l!.abschnitte.at(-1)!;
    expect(letzte).toMatchObject({ von: 2025, bis: 2026, aktuell: true });
    expect(letzte.anfang + letzte.laenge).toBeCloseTo(1);
    expect(l!.jahrzehnte.map((j) => j.jahr)).toEqual([1980, 1990, 2000, 2010, 2020]);
  });

  it('sortiert nach Amtsbeginn; kurze Amtszeiten bleiben sichtbar', () => {
    const l = amtszeitenLinie([{ von: '1994', bis: '1994', aktuell: false }, ...chronik.slice(0, 2)].reverse(), 2026)!;
    expect(l.abschnitte.map((a) => a.von)).toEqual([1975, 1979, 1994]);
    expect(l.abschnitte[2].laenge).toBeGreaterThan(0);
  });

  it('ohne lesbare Jahre oder mit nur einer Amtszeit: keine Linie', () => {
    expect(amtszeitenLinie([{ von: '[Jahr]', bis: '', aktuell: true }, ...chronik], 2026)).toBeNull();
    expect(amtszeitenLinie([chronik[0]], 2026)).toBeNull();
    expect(amtszeitenLinie([{ von: '1990', bis: '1980', aktuell: false }, chronik[0]], 2026)).toBeNull();
  });
});

describe('Kategorie-Marken der Nachrichten (AUFTRAG 4)', () => {
  it('jede Kategorie und „Wichtig“ hat eine eigene Form', () => {
    for (const k of [...nachrichtKategorieEnum.enumValues, 'wichtig']) expect(KATEGORIE_MARKEN).toHaveProperty(k);
    const formen = Object.values(KATEGORIE_MARKEN).map((m) => m.d);
    expect(new Set(formen).size).toBe(formen.length);
  });
});
