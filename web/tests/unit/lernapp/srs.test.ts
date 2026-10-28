import fc from 'fast-check';
import { default_w, FSRSVersion } from 'ts-fsrs';
import { describe, expect, it } from 'vitest';
import {
  FSRS_PARAMETER,
  FSRS_PARAMETERVERSION,
  istFaellig,
  type KartenBasis,
  type KartenBewertung,
  NOTEN,
  noteAus,
  noteAusSelbstbewertung,
  spieleKarteNach,
  spieleNach,
  vergleicheBewertungen,
  zuKarte,
} from '@/lib/lernapp/srs';

/**
 * FSRS deterministisch (ADR 0038 Nr. 3): feste Parameter mit Version, kein Fuzz, Nachspielen nach (am, geraet, seq) –
 * gleiche Bewertungen ergeben auf jedem Gerät denselben Kartenstand, unabhängig von der Reihenfolge des Eintreffens.
 */
const G1 = '00000000-0000-4000-8000-000000000001';
const G2 = '00000000-0000-4000-8000-000000000002';
const b = (karte: string, note: KartenBewertung['note'], am: string, geraet = G1, seq = 0): KartenBewertung => ({
  karte,
  note,
  am,
  geraet,
  seq,
});

describe('Parameter', () => {
  it('Version und Werte stehen fest; kein Fuzz; Kurzzeitschritte fest', () => {
    expect(FSRS_PARAMETERVERSION).toBe('fsrs6/ts-fsrs-5.4.2/1');
    expect(FSRS_PARAMETER.enable_fuzz).toBe(false);
    expect(FSRS_PARAMETER.request_retention).toBe(0.9);
    expect(FSRS_PARAMETER.learning_steps).toEqual(['1m', '10m']);
    expect(FSRS_PARAMETER.relearning_steps).toEqual(['10m']);
    expect(FSRS_PARAMETER.w).toHaveLength(21);
    expect(Object.isFrozen(FSRS_PARAMETER)).toBe(true);
  });

  it('entspricht der gepinnten Bibliothek (Wechsel der Bibliothek fällt hier auf)', () => {
    expect(FSRSVersion).toMatch(/^v5\.4\.2 /);
    expect([...FSRS_PARAMETER.w]).toEqual([...default_w]);
  });
});

describe('Abbildung auf Noten', () => {
  it('richtig → gut, Tippfehler oder Hilfe → schwer, falsch → nochmal; kein Easy', () => {
    expect(noteAus('richtig')).toBe('gut');
    expect(noteAus('richtig', { hilfe: true })).toBe('schwer');
    expect(noteAus('tippfehler')).toBe('schwer');
    expect(noteAus('falsch')).toBe('nochmal');
    expect(noteAus('falsch', { hilfe: true })).toBe('nochmal');
    expect(NOTEN).toEqual(['nochmal', 'schwer', 'gut']);
  });

  it('Selbstbewertung nur bei Sprechen und Schreiben', () => {
    expect(noteAusSelbstbewertung('sprechen', 'gut')).toBe('gut');
    expect(noteAusSelbstbewertung('schreiben', 'schwer')).toBe('schwer');
    expect(noteAusSelbstbewertung('auswahl', 'gut')).toBeNull();
    expect(noteAusSelbstbewertung('wortbank', 'nochmal')).toBeNull();
  });
});

describe('Nachspielen', () => {
  it('neue Karte, gut: Lernschritt 10 Minuten', () => {
    const s = spieleKarteNach('tr.a1.l0001', [b('tr.a1.l0001', 'gut', '2026-10-01T10:00:00.000Z')]);
    expect(s).toMatchObject({ zustand: 'lernen', faellig: '2026-10-01T10:10:00.000Z', wiederholungen: 1, letzteNote: 'gut' });
    expect(s?.parameterversion).toBe(FSRS_PARAMETERVERSION);
  });

  it('feste Folge ergibt immer denselben Stand (Schnappschuss)', () => {
    const folge = [
      b('k', 'gut', '2026-10-01T10:00:00.000Z', G1, 1),
      b('k', 'gut', '2026-10-01T10:10:00.000Z', G1, 2),
      b('k', 'schwer', '2026-10-03T09:00:00.000Z', G2, 1),
      b('k', 'nochmal', '2026-10-10T18:30:00.000Z', G1, 3),
      b('k', 'gut', '2026-10-10T18:45:00.000Z', G1, 4),
    ];
    const s = spieleKarteNach('k', folge);
    expect(s).toEqual(spieleKarteNach('k', [...folge].reverse()));
    expect(s?.zustand).toBe('wiederholen');
    expect(s?.fehler).toBe(1);
    expect(s?.wiederholungen).toBe(5);
  });

  it('ohne Bewertungen kein Stand; fremde Karten zählen nicht', () => {
    expect(spieleKarteNach('k', [])).toBeNull();
    expect(spieleKarteNach('k', [b('x', 'gut', '2026-10-01T10:00:00.000Z')])).toBeNull();
  });

  it('gleiche Zeit: Gerät, dann laufende Nummer entscheiden', () => {
    const am = '2026-10-01T10:00:00.000Z';
    expect(
      [b('k', 'gut', am, G2, 0), b('k', 'gut', am, G1, 5), b('k', 'gut', am, G1, 2)]
        .sort(vergleicheBewertungen)
        .map((x) => [x.geraet, x.seq]),
    ).toEqual([
      [G1, 2],
      [G1, 5],
      [G2, 0],
    ]);
  });

  it('Stand übersetzt sich verlustfrei in eine ts-fsrs-Karte und zurück', () => {
    const s = spieleKarteNach('k', [b('k', 'gut', '2026-10-01T10:00:00.000Z'), b('k', 'gut', '2026-10-02T10:00:00.000Z', G1, 1)])!;
    const c = zuKarte(s);
    expect(c.due.toISOString()).toBe(s.faellig);
    expect(c.reps).toBe(s.wiederholungen);
    expect(istFaellig(s, new Date(s.faellig))).toBe(true);
    expect(istFaellig(s, new Date(Date.parse(s.faellig) - 1))).toBe(false);
  });

  const bewertung = fc.record({
    karte: fc.constantFrom('a', 'b', 'c'),
    note: fc.constantFrom(...NOTEN),
    am: fc
      .date({ min: new Date('2026-01-01T00:00:00Z'), max: new Date('2027-01-01T00:00:00Z'), noInvalidDate: true })
      .map((d) => d.toISOString()),
    geraet: fc.constantFrom(G1, G2),
    seq: fc.nat({ max: 50 }),
  });

  it('Eigenschaft: Reihenfolge des Eintreffens ist gleichgültig (deterministisch nach Sortierung)', () => {
    fc.assert(
      fc.property(
        // (Gerät, Nummer) ist je Konto eindeutig (`lernapp_ereignis_eindeutig`); Dubletten mit verschiedener Note gibt es nicht
        fc
          .uniqueArray(bewertung, { maxLength: 25, selector: (x) => `${x.geraet}:${x.seq}` })
          .chain((liste) => fc.tuple(fc.constant(liste), fc.shuffledSubarray(liste, { minLength: liste.length, maxLength: liste.length }))),
        ([liste, gemischt]) => {
          const x = spieleNach(liste);
          const y = spieleNach(gemischt);
          return JSON.stringify([...x]) === JSON.stringify([...y]);
        },
      ),
    );
  });

  it('Eigenschaft: zweimal nachspielen ergibt dasselbe; Fälligkeit liegt nie vor der letzten Bewertung', () => {
    fc.assert(
      fc.property(fc.array(bewertung, { minLength: 1, maxLength: 25 }), (liste) => {
        const x = spieleNach(liste);
        expect(spieleNach(liste)).toEqual(x);
        for (const s of x.values()) expect(Date.parse(s.faellig)).toBeGreaterThanOrEqual(Date.parse(s.zuletzt!));
      }),
    );
  });

  it('Eigenschaft: Verdichtung (Basis bis zur Grenze + Rest) ergibt denselben Stand wie alle Bewertungen (ADR 0038 Nr. 10)', () => {
    fc.assert(
      fc.property(
        fc.array(bewertung, { minLength: 1, maxLength: 25 }),
        fc.date({ min: new Date('2026-01-01T00:00:00Z'), max: new Date('2027-01-01T00:00:00Z'), noInvalidDate: true }),
        (liste, grenzeDatum) => {
          const grenze = grenzeDatum.toISOString();
          const alle = spieleNach(liste);
          const basen = new Map<string, KartenBasis>();
          for (const karte of new Set(liste.map((x) => x.karte))) {
            const alt = liste.filter((x) => x.karte === karte && Date.parse(x.am) <= Date.parse(grenze));
            // über JSON wie in `lernapp_karte.basis` (jsonb) bzw. der Sync-Antwort
            const stand = spieleKarteNach(karte, alt);
            if (stand) basen.set(karte, JSON.parse(JSON.stringify({ stand, bis: grenze })) as KartenBasis);
          }
          const rest = liste.filter((x) => Date.parse(x.am) > Date.parse(grenze));
          expect(spieleNach(rest, basen)).toEqual(alle);
        },
      ),
    );
  });

  it('Basis: ältere Bewertungen als die Grenze zählen nicht mehr; ohne neue Bewertung bleibt die Basis', () => {
    const basis: KartenBasis = {
      stand: spieleKarteNach('k', [b('k', 'gut', '2026-01-01T10:00:00.000Z')])!,
      bis: '2026-02-01T00:00:00.000Z',
    };
    expect(spieleKarteNach('k', [], basis)).toEqual(basis.stand);
    expect(spieleKarteNach('k', [b('k', 'nochmal', '2026-01-15T10:00:00.000Z', G2, 9)], basis)).toEqual(basis.stand);
    expect(spieleKarteNach('k', [b('k', 'nochmal', '2026-02-02T10:00:00.000Z', G2, 9)], basis)?.wiederholungen).toBe(2);
  });
});
