import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import {
  abSechzehn,
  bestenliste,
  elternSehenLernwoche,
  erscheint,
  gruppenziel,
  type Kandidat,
  kurzname,
  lernwoche,
  MINDEST_TEILNEHMENDE,
  siehtBestenliste,
  wocheVon,
  wochenSumme,
} from '@/lib/lernapp/gruppe/regeln';

/**
 * Reine Regeln für Gruppen und Bestenliste (L7-02; ADR 0043 Nr. 7/8; KERN 4.0 §5; L3-E02): Kinder nie in der
 * Bestenliste (Sperre im Code), nur mit Zustimmung und Einwilligung, Vorname + Initial, Gruppenziel ohne Namen erst ab
 * drei Teilnehmenden. Namen sind Platzhalter.
 */
const HEUTE = '2026-10-21';
const erwachsen = { istKind: false, hatLerndatensatz: false, sechzehnAm: null };
const kind = { istKind: true, hatLerndatensatz: true, sechzehnAm: '2030-05-01' };

function kandidat(teil: Partial<Kandidat> & { benutzerId: string }): Kandidat {
  return { anzeigename: '[Vorname] [Nachname]', alter: erwachsen, zustimmung: true, einwilligung: true, wochenXp: 10, ...teil };
}

describe('ab 16 (Sperre im Code)', () => {
  it('Kinderkonten nie, auch mit Datum in der Vergangenheit', () => {
    expect(abSechzehn({ istKind: true, hatLerndatensatz: true, sechzehnAm: '2020-01-01' }, HEUTE)).toBe(false);
    expect(abSechzehn({ istKind: true, hatLerndatensatz: false, sechzehnAm: null }, HEUTE)).toBe(false);
  });
  it('Lerndatensatz: erst ab dem Tag `sechzehnAm`, ohne Datum vorsichtig nicht', () => {
    expect(abSechzehn({ istKind: false, hatLerndatensatz: true, sechzehnAm: HEUTE }, HEUTE)).toBe(true);
    expect(abSechzehn({ istKind: false, hatLerndatensatz: true, sechzehnAm: '2026-10-22' }, HEUTE)).toBe(false);
    expect(abSechzehn({ istKind: false, hatLerndatensatz: true, sechzehnAm: null }, HEUTE)).toBe(false);
  });
  it('Gemeinde-Konto ohne Lerndatensatz (gibt es erst ab 16)', () => {
    expect(abSechzehn(erwachsen, HEUTE)).toBe(true);
  });
});

describe('Bestenliste', () => {
  it('nur ab 16, mit eigener Zustimmung und Einwilligung', () => {
    expect(erscheint(kandidat({ benutzerId: 'a' }), HEUTE)).toBe(true);
    expect(erscheint(kandidat({ benutzerId: 'a', zustimmung: false }), HEUTE)).toBe(false);
    expect(erscheint(kandidat({ benutzerId: 'a', einwilligung: false }), HEUTE)).toBe(false);
    expect(erscheint(kandidat({ benutzerId: 'a', alter: kind }), HEUTE)).toBe(false);
  });

  it('Wochen-XP absteigend, bei Gleichstand nach Name, ohne Ränge; doppelte Konten einmal', () => {
    const liste = bestenliste(
      [
        kandidat({ benutzerId: 'b', anzeigename: 'Bera Beispiel', wochenXp: 20 }),
        kandidat({ benutzerId: 'a', anzeigename: 'Ada Muster', wochenXp: 20 }),
        kandidat({ benutzerId: 'c', anzeigename: 'Can', wochenXp: 35.7 }),
        kandidat({ benutzerId: 'a', anzeigename: 'Ada Muster', wochenXp: 99 }),
        kandidat({ benutzerId: 'k', anzeigename: 'Kind Klein', wochenXp: 500, alter: kind }),
      ],
      HEUTE,
    );
    expect(liste).toEqual([
      { benutzerId: 'c', name: 'Can', xp: 35 },
      { benutzerId: 'a', name: 'Ada M.', xp: 20 },
      { benutzerId: 'b', name: 'Bera B.', xp: 20 },
    ]);
    expect(Object.keys(liste[0]!)).toEqual(['benutzerId', 'name', 'xp']);
  });

  it('Eigenschaft: kein Kinderkonto erscheint je, egal welche Zustimmung, Einwilligung oder XP', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            benutzerId: fc.uuid(),
            istKind: fc.boolean(),
            hatLerndatensatz: fc.boolean(),
            sechzehnAm: fc.option(fc.constantFrom('2000-01-01', '2026-10-21', '2031-03-03'), { nil: null }),
            zustimmung: fc.boolean(),
            einwilligung: fc.boolean(),
            wochenXp: fc.integer({ min: -5, max: 10_000 }),
          }),
          { maxLength: 30 },
        ),
        (zeilen) => {
          const liste = bestenliste(
            zeilen.map((z) => ({
              benutzerId: z.benutzerId,
              anzeigename: '[Name]',
              alter: { istKind: z.istKind, hatLerndatensatz: z.hatLerndatensatz, sechzehnAm: z.sechzehnAm },
              zustimmung: z.zustimmung,
              einwilligung: z.einwilligung,
              wochenXp: z.wochenXp,
            })),
            HEUTE,
          );
          for (const p of liste) {
            const z = zeilen.find((x) => x.benutzerId === p.benutzerId)!;
            expect(z.istKind).toBe(false);
            expect(z.zustimmung && z.einwilligung).toBe(true);
            expect(!z.hatLerndatensatz || (z.sechzehnAm !== null && z.sechzehnAm <= HEUTE)).toBe(true);
            expect(p.xp).toBeGreaterThanOrEqual(0);
          }
        },
      ),
    );
  });

  it('gegenseitiger Kreis (LA-V7, EL4): sehen nur, wer selbst zugestimmt hat und deren Einwilligung gilt', () => {
    expect(siehtBestenliste(kandidat({ benutzerId: 'a' }), HEUTE)).toBe(true);
    expect(siehtBestenliste(kandidat({ benutzerId: 'a', zustimmung: false }), HEUTE)).toBe(false);
    expect(siehtBestenliste(kandidat({ benutzerId: 'a', einwilligung: false }), HEUTE)).toBe(false);
    expect(siehtBestenliste(kandidat({ benutzerId: 'a', alter: kind }), HEUTE)).toBe(false);
    // Eigenschaft: sehen ⇔ selbst erscheinen dürfen
    fc.assert(
      fc.property(
        fc.boolean(),
        fc.boolean(),
        fc.option(fc.constantFrom('2000-01-01', HEUTE, '2031-03-03'), { nil: null }),
        fc.boolean(),
        fc.boolean(),
        (istKind, hatLerndatensatz, sechzehnAm, zustimmung, einwilligung) => {
          const k = { alter: { istKind, hatLerndatensatz, sechzehnAm }, zustimmung, einwilligung };
          expect(siehtBestenliste(k, HEUTE)).toBe(erscheint(k, HEUTE));
        },
      ),
    );
  });
});

describe('Kurzname (Vorname + Initial, S-14)', () => {
  it.each([
    ['Ada Muster', 'Ada M.'],
    ['  Ada   Maria   muster ', 'Ada M.'],
    ['Can', 'Can'],
    ['', ''],
    ['Zeynep İnce', 'Zeynep İ.'],
  ])('%s → %s', (ein, aus) => expect(kurzname(ein)).toBe(aus));
});

describe('Gruppenziel (ohne Namen)', () => {
  it('kein Ziel → null', () => {
    expect(gruppenziel(null, [10, 20, 30])).toBeNull();
    expect(gruppenziel(0, [10, 20, 30])).toBeNull();
  });
  it(`unter ${MINDEST_TEILNEHMENDE} Teilnehmenden nur das Ziel, ohne Summe`, () => {
    expect(gruppenziel(100, [80, 40])).toEqual({ ziel: 100, zuWenige: true });
  });
  it('Summe, Anteil höchstens 1, erreicht', () => {
    expect(gruppenziel(100, [30, 20, 0])).toEqual({ ziel: 100, summe: 50, erreicht: false, anteil: 0.5, zuWenige: false });
    expect(gruppenziel(50, [30, 20, 40.9, -3])).toEqual({ ziel: 50, summe: 90, erreicht: true, anteil: 1, zuWenige: false });
  });
});

describe('Lernwoche', () => {
  it('Montag bis Sonntag', () => {
    const w = wocheVon(HEUTE);
    expect(w).toEqual({
      von: '2026-10-19',
      bis: '2026-10-25',
      tage: ['2026-10-19', '2026-10-20', '2026-10-21', '2026-10-22', '2026-10-23', '2026-10-24', '2026-10-25'],
    });
  });
  it('fehlende Tage zählen 0, Summen und Lerntage', () => {
    const tage = lernwoche(wocheVon(HEUTE), [
      { tag: '2026-10-19', xp: 20, lektionen: 2, pause: false },
      { tag: '2026-10-20', xp: 0, lektionen: 0, pause: true },
      { tag: '2026-10-25', xp: 5, lektionen: 0, pause: false },
      { tag: '2026-10-12', xp: 99, lektionen: 9, pause: false },
    ]);
    expect(tage).toHaveLength(7);
    expect(tage[1]).toEqual({ tag: '2026-10-20', xp: 0, lektionen: 0, pause: true, gelernt: false });
    expect(wochenSumme(tage)).toEqual({ xp: 25, lektionen: 2, lerntage: 2 });
  });
  it('Eltern sehen sie bis zum Ende des Übergangs, danach nicht mehr', () => {
    expect(elternSehenLernwoche('eltern')).toBe(true);
    expect(elternSehenLernwoche('uebergang')).toBe(true);
    expect(elternSehenLernwoche('eigene')).toBe(false);
  });
});
