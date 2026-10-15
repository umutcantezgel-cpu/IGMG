import { describe, expect, it } from 'vitest';
import { GRUPPEN_AKTIONEN, darfInGruppe, type GruppenKontext } from '@/lib/rechte/gruppen';
import { KONTOARTEN, soll, ZIELE, type Kontoart, type ZielArt } from '../../hilfen/gruppen-soll';

/**
 * Vollständige Wahrheitstafel der Gruppenrechte (ADR 0026): 5 Kontoarten × 14 Aktionen × 2 Gruppen (eigene, fremde)
 * × 3 Ziele (eigene Person bzw. eigenes Kind, fremdes Kind, ohne Ziel) = 420 Fälle gegen die Soll-Tafel
 * (`tests/hilfen/gruppen-soll.ts`). Ersetzt die Stichproben aus gruppen.test.ts (Stufe C, Prüfer k2) durch eine Tafel.
 */
const EIGENE = 'gruppe-eigen';
const FREMDE = 'gruppe-fremd';

function kontext(art: Kontoart): GruppenKontext {
  const leer: GruppenKontext = { benutzerId: 'u', leitung: new Map(), eigeneLernendeId: null, eigeneGruppen: new Set(), kinder: new Map() };
  switch (art) {
    case 'lehrkraft':
      return { ...leer, leitung: new Map([[EIGENE, 'lehrkraft']]) };
    case 'aufsicht':
      return { ...leer, leitung: new Map([[EIGENE, 'aufsicht']]) };
    case 'schueler':
      return { ...leer, eigeneLernendeId: 'ich', eigeneGruppen: new Set([EIGENE]) };
    case 'eltern':
      return { ...leer, kinder: new Map([['mein-kind', new Set([EIGENE])]]) };
    case 'fremd':
      return leer;
  }
}

function ziel(art: Kontoart, z: ZielArt): { lernendeId?: string } {
  if (z === 'ohne') return {};
  if (z === 'fremd') return { lernendeId: 'fremdes-kind' };
  return { lernendeId: art === 'eltern' ? 'mein-kind' : 'ich' };
}

describe('Gruppenrechte: Wahrheitstafel gegen ADR 0026', () => {
  it('420 Fälle, keine Abweichung', () => {
    const abweichungen: string[] = [];
    let faelle = 0;
    for (const art of KONTOARTEN)
      for (const aktion of GRUPPEN_AKTIONEN)
        for (const eigen of [true, false])
          for (const z of ZIELE) {
            faelle++;
            const ist = darfInGruppe(kontext(art), aktion, eigen ? EIGENE : FREMDE, ziel(art, z));
            if (ist !== soll(art, aktion, eigen, z))
              abweichungen.push(`${art} ${aktion} ${eigen ? 'eigene' : 'fremde'} Gruppe, Ziel ${z}: ${ist}`);
          }
    expect(faelle).toBe(KONTOARTEN.length * GRUPPEN_AKTIONEN.length * 2 * ZIELE.length);
    expect(faelle).toBe(420);
    expect(abweichungen).toEqual([]);
  });

  it('Elternteil, das zugleich Schüler ist (zwei Bezüge), bekommt nur die Summe – nie die Leitungsrechte', () => {
    const beides: GruppenKontext = {
      benutzerId: 'u',
      leitung: new Map(),
      eigeneLernendeId: 'ich',
      eigeneGruppen: new Set([EIGENE]),
      kinder: new Map([['mein-kind', new Set([EIGENE])]]),
    };
    for (const aktion of GRUPPEN_AKTIONEN)
      for (const z of ZIELE) {
        const erwartet = soll('schueler', aktion, true, z) || soll('eltern', aktion, true, z);
        const zielId = z === 'ohne' ? {} : z === 'fremd' ? { lernendeId: 'fremdes-kind' } : undefined;
        if (zielId) expect(darfInGruppe(beides, aktion, EIGENE, zielId), `${aktion} ${z}`).toBe(erwartet);
      }
    for (const aktion of [
      'chat.moderieren',
      'anwesenheit.erfassen',
      'fortschritt.erfassen',
      'aufgabe.bearbeiten',
      'elternbrief.senden',
    ] as const)
      expect(darfInGruppe(beides, aktion, EIGENE)).toBe(false);
  });
});
