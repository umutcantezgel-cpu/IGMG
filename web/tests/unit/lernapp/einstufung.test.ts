import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import type { Aufgabe, AufgabeVon } from '@/lib/lernapp/aufgaben/schema';
import {
  beantworte,
  bedarf,
  beende,
  EINSTUFUNG_ANZAHL,
  einheitenFuer,
  einstufungsEreignis,
  ergebnis,
  gekonnt,
  type Kandidat,
  kandidatenAus,
  nichtGekonnt,
  starteEinstufung,
  stufenAus,
  waehle,
} from '@/lib/lernapp/engine/einstufung';
import { EreignisEntwurfSchema } from '@/lib/lernapp/ereignisse/typen';
import type { Stufe } from '@/lib/lernapp/kurse';

/**
 * Einstufungstest (ADR 0043 Nr. 6): Treppe über die Stufen, Ende nach höchstens 20 Aufgaben, Ergebnis als Ereignis
 * `einstufung`. Aufgaben neutral (Platzhalter), Bank aus Paket-Lektionen.
 */
const STUFEN: Stufe[] = ['a1', 'a2', 'b1', 'b2', 'c1'];
const EINHEITEN = STUFEN.flatMap((stufe) => [1, 2, 3].map((n) => ({ schluessel: `tr.${stufe}.e0${n}`, stufe })));

const auswahl = (schluessel: string): AufgabeVon<'auswahl'> => ({
  typ: 'auswahl',
  schluessel,
  anweisung: 'waehleWort',
  optionen: [
    { text: '[A]', sprache: 'tr' },
    { text: '[B]', sprache: 'tr' },
  ],
  richtig: 0,
});
/** Bank mit `n` Aufgaben je Stufe. */
const bank = (n = 30): Kandidat[] =>
  STUFEN.flatMap((stufe) =>
    Array.from({ length: n }, (_, i) => ({ aufgabe: auswahl(`tr.${stufe}.e01.a${i}`), stufe, einheit: `tr.${stufe}.e01` })),
  );

/** Spielt den Test mit einer Antwortfunktion durch (bis fertig oder ohne Aufgabe). */
function spiele(antwort: (k: Kandidat, i: number) => boolean, b = bank(), stufen = STUFEN) {
  let st = starteEinstufung('tr-aus-de', stufen);
  for (let i = 0; i < 100 && !st.fertig; i++) {
    const k = waehle(st, b);
    if (!k) {
      st = beende(st);
      break;
    }
    st = beantworte(st, k, antwort(k, i) ? 'richtig' : 'falsch');
  }
  return st;
}

describe('Treppe über die Stufen', () => {
  it('beginnt auf der ersten Stufe; Aufgaben nur der aktuellen Stufe und nie doppelt', () => {
    const st = starteEinstufung('tr-aus-de', STUFEN);
    expect(bedarf(st)).toBe('a1');
    const b = bank(3);
    const k1 = waehle(st, b)!;
    expect(k1.stufe).toBe('a1');
    const st2 = beantworte(st, k1, 'falsch');
    expect(waehle(st2, b)?.aufgabe.schluessel).not.toBe(k1.aufgabe.schluessel);
    expect(starteEinstufung('x', []).fertig).toBe(true);
  });

  it('alles richtig → bis zur obersten Stufe, Ende dort mit drei Aufgaben; Vorschlag C1', () => {
    const st = spiele(() => true);
    expect(st.fertig).toBe(true);
    expect(st.verlauf.map((v) => v.stufe)).toEqual(['a1', 'a1', 'a2', 'a2', 'b1', 'b1', 'b2', 'b2', 'c1', 'c1', 'c1']);
    expect(ergebnis(st, EINHEITEN)).toEqual({ stufe: 'c1', einheit: 'tr.c1.e01', richtig: 11, gesamt: 11 });
  });

  it('alles falsch → nach zwei Antworten Ende; Vorschlag A1, erste Einheit', () => {
    const st = spiele(() => false);
    expect(st.verlauf).toHaveLength(2);
    expect(ergebnis(st, EINHEITEN)).toEqual({ stufe: 'a1', einheit: 'tr.a1.e01', richtig: 0, gesamt: 2 });
  });

  it('A1 und A2 gekonnt, B1 zweimal falsch → Einstieg B1', () => {
    const st = spiele((k) => k.stufe !== 'b1');
    expect(st.verlauf.map((v) => `${v.stufe}:${v.richtig ? 'r' : 'f'}`)).toEqual(['a1:r', 'a1:r', 'a2:r', 'a2:r', 'b1:f', 'b1:f']);
    expect(gekonnt(st, 'a2')).toBe(true);
    expect(nichtGekonnt(st, 'b1')).toBe(true);
    expect(ergebnis(st, EINHEITEN)?.stufe).toBe('b1');
  });

  it('Fehler auf einer Stufe, deren untere noch offen ist → eine Stufe tiefer; Einstieg über der gekonnten', () => {
    // A1: r r → A2: f r f → nicht gekonnt; A1 gekonnt → Ende, Einstieg A2
    const folge = [true, true, false, true, false];
    const st = spiele((_k, i) => folge[i] ?? true);
    expect(st.verlauf.map((v) => v.stufe)).toEqual(['a1', 'a1', 'a2', 'a2', 'a2']);
    expect(ergebnis(st, EINHEITEN)?.stufe).toBe('a2');
    // A1: f r r → A2 (Folge aus zwei richtigen) …: der erste Fehler auf A1 allein beendet nichts
    const st2 = spiele((_k, i) => i !== 0);
    expect(st2.verlauf[1]?.stufe).toBe('a1');
    expect(st2.verlauf[3]?.stufe).toBe('a2');
  });

  it('ohne Aufgaben auf der aktuellen Stufe endet der Test mit dem Bisherigen', () => {
    const nurA1 = bank(1).filter((k) => k.stufe === 'a1');
    const st = spiele(() => true, nurA1);
    expect(st.fertig).toBe(true);
    expect(st.verlauf).toHaveLength(1);
    expect(ergebnis(st, EINHEITEN)?.stufe).toBe('a1');
    expect(ergebnis(starteEinstufung('x', STUFEN), EINHEITEN)).toBeNull();
  });

  it('Eigenschaft: endet nach höchstens 20 Aufgaben; Vorschlag ist eine Stufe des Kurses; „Tippfehler“ zählt richtig', () => {
    fc.assert(
      fc.property(fc.array(fc.boolean(), { minLength: 40, maxLength: 40 }), (antworten) => {
        const st = spiele((_k, i) => antworten[i] ?? false);
        expect(st.fertig).toBe(true);
        expect(st.verlauf.length).toBeLessThanOrEqual(EINSTUFUNG_ANZAHL);
        expect(STUFEN).toContain(ergebnis(st, EINHEITEN)?.stufe);
      }),
      { numRuns: 300 },
    );
    const st = beantworte(starteEinstufung('k', STUFEN), bank(1)[0]!, 'tippfehler');
    expect(st.verlauf[0]?.richtig).toBe(true);
  });

  it('Eigenschaft: alles richtig ergibt nie eine tiefere, alles falsch nie eine höhere Stufe als jede andere Folge', () => {
    const stufeVon = (a: readonly boolean[]) =>
      STUFEN.indexOf(
        ergebnis(
          spiele((_k, i) => a[i] ?? false),
          EINHEITEN,
        )!.stufe,
      );
    const oben = stufeVon(Array<boolean>(30).fill(true));
    const unten = stufeVon(Array<boolean>(30).fill(false));
    fc.assert(
      fc.property(fc.array(fc.boolean(), { minLength: 30, maxLength: 30 }), (antworten) => {
        const s = stufeVon(antworten);
        expect(s).toBeLessThanOrEqual(oben);
        expect(s).toBeGreaterThanOrEqual(unten);
      }),
      { numRuns: 200 },
    );
  });
});

describe('Bank, Stufen und Ereignis', () => {
  const T = (text: string) => ({ text, sprache: 'tr' as const });
  const AUDIO = { buendel: '/lern-app/audio/tr/tr.a1.e01-0123456789abcdef.lpa', versatz: 0, laenge: 10 };
  const lektion = (aufgaben: Aufgabe[]) => ({ aufgaben });
  const hw = (schluessel: string, audio = true): AufgabeVon<'hoeren_waehlen'> => ({
    typ: 'hoeren_waehlen',
    schluessel,
    anweisung: 'waehleGehoertes',
    hoeren: audio ? { ...T('[x]'), audio: AUDIO } : T('[x]'),
    optionen: [T('[x]'), T('[y]')],
    richtig: 0,
  });
  const wf: AufgabeVon<'wahr_falsch'> = {
    typ: 'wahr_falsch',
    schluessel: 'w1',
    anweisung: 'stimmtDas',
    sprache: 'de',
    aussage: '[Aussage]',
    wahr: true,
    begruendung: '[Begründung]',
  };

  it('kandidatenAus: nur Test-Typen, Hörübungen nur mit Ton und bei „Hören an“; gemischt, stabil', () => {
    const e = { schluessel: 'tr.a1.e01', stufe: 'a1' as const };
    const ls = [lektion([auswahl('a1'), auswahl('a2'), hw('h1'), hw('h2', false), wf])];
    const k = kandidatenAus(e, ls);
    expect(k.map((x) => x.aufgabe.schluessel).sort()).toEqual(['a1', 'a2', 'h1']);
    expect(k.every((x) => x.stufe === 'a1' && x.einheit === 'tr.a1.e01')).toBe(true);
    expect(kandidatenAus(e, ls).map((x) => x.aufgabe.schluessel)).toEqual(k.map((x) => x.aufgabe.schluessel));
    expect(
      kandidatenAus(e, ls, { hoeren: false })
        .map((x) => x.aufgabe.schluessel)
        .sort(),
    ).toEqual(['a1', 'a2']);
  });

  it('einheitenFuer: erste und letzte Einheit der Stufe; stufenAus in Reihenfolge des Verzeichnisses', () => {
    expect(einheitenFuer(EINHEITEN, 'b1').map((e) => e.schluessel)).toEqual(['tr.b1.e01', 'tr.b1.e03']);
    expect(einheitenFuer([{ schluessel: 'x', stufe: 'a1' as const }], 'a1')).toHaveLength(1);
    expect(einheitenFuer(EINHEITEN, 'grund')).toEqual([]);
    expect(stufenAus(EINHEITEN)).toEqual(STUFEN);
  });

  it('Ereignis `einstufung` gültig nach dem Schema; ohne Sprachstufe keines', () => {
    const e = einstufungsEreignis('tr-aus-de', { stufe: 'a2', einheit: 'tr.a2.e01', richtig: 5, gesamt: 7 });
    expect(EreignisEntwurfSchema.safeParse(e).success).toBe(true);
    expect(e).toEqual({ art: 'einstufung', daten: { kurs: 'tr-aus-de', stufe: 'a2', einheit: 'tr.a2.e01', richtig: 5, gesamt: 7 } });
    expect(einstufungsEreignis('islam', { stufe: 'grund', richtig: 1, gesamt: 2 })).toBeNull();
  });
});
