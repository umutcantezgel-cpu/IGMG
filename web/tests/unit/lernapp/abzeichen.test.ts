import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { abschlussStand, leiteAb } from '@/lib/lernapp/ereignisse/ableiten';
import {
  ABZEICHEN,
  ABZEICHEN_GRUPPEN,
  abzeichenArt,
  EINHEITEN_JE_STUFE,
  leiteAbzeichenAb,
  neueAbzeichen,
  SCHRIFTEN,
  VORKURS_LEKTIONEN,
} from '@/lib/lernapp/ereignisse/abzeichen';
import { addiereTage } from '@/lib/lernapp/ereignisse/serie';
import { type Ereignis, EreignisSchema } from '@/lib/lernapp/ereignisse/typen';
import { vereinige } from '@/lib/lernapp/ereignisse/zusammenfuehren';
import { LEKTIONS_ARTEN, type LektionsArt } from '@/lib/lernapp/engine/xp';
import { SPRACH_STUFEN } from '@/lib/lernapp/kurse';

/**
 * Abzeichen (ADR 0043 Nr. 5, PLAN §8, L7-01): Katalog von rund 40 Arten und ihre Ableitung allein aus dem Ereignisprotokoll
 * (ADR 0038) – rein, deterministisch, unabhängig von der Reihenfolge des Abgleichs. Ein Abzeichen gilt ab dem Lerntag des
 * Ereignisses, mit dem seine Bedingung erstmals erfüllt ist. Zahlen der Stufen und Vorkurse stimmen mit den Rahmenplänen.
 */
const G1 = '00000000-0000-4000-8000-00000000000a';
const G2 = '00000000-0000-4000-8000-00000000000b';
const START = '2026-09-01';

let zaehler = 0;
function ereignis<A extends Ereignis['art']>(art: A, daten: Extract<Ereignis, { art: A }>['daten'], tag: string, geraet = G1): Ereignis {
  return EreignisSchema.parse({ geraet, seq: zaehler++, am: `${tag}T10:00:00.000Z`, tag, art, daten });
}
const lektion = (schluessel: string, tag: string, art: LektionsArt = 'lektion', kurs = 'tr-aus-de', geraet = G1) =>
  ereignis('lektion', { kurs, lektion: schluessel, art, richtig: 1, gesamt: 1 }, tag, geraet);
const bewertung = (karte: string, tag: string, note: 'gut' | 'nochmal' = 'gut') => ereignis('bewertung', { karte, note }, tag);
const ab = (liste: Ereignis[], kontext = {}) => leiteAbzeichenAb(vereinige(liste), kontext);
const ids = (m: Map<string, unknown>) => [...m.keys()];
const zwei = (n: number) => String(n).padStart(2, '0');

describe('Katalog', () => {
  it('rund 40 Arten, eindeutige Schlüssel, jede Gruppe mit Rang ab 1; kein Zertifikat und keine Serien-Abzeichen', () => {
    expect(ABZEICHEN.length).toBeGreaterThanOrEqual(36);
    expect(ABZEICHEN.length).toBeLessThanOrEqual(44);
    expect(new Set(ABZEICHEN.map((a) => a.id)).size).toBe(ABZEICHEN.length);
    expect(new Set(ABZEICHEN.map((a) => a.gruppe))).toEqual(new Set(ABZEICHEN_GRUPPEN));
    for (const g of ABZEICHEN_GRUPPEN) {
      const raenge = ABZEICHEN.filter((a) => a.gruppe === g).map((a) => a.rang);
      expect(raenge, g).toEqual(raenge.map((_, i) => i + 1));
      expect(Math.max(...raenge), g).toBeLessThanOrEqual(5);
    }
    expect(ABZEICHEN.filter((a) => a.gruppe === 'stufe').map((a) => a.wert)).toEqual([...SPRACH_STUFEN]);
    expect(ABZEICHEN.filter((a) => a.gruppe === 'lerntage').map((a) => a.wert)).toEqual([7, 30, 100, 365]);
    expect(ABZEICHEN.some((a) => /serie|folge|zertifikat/i.test(a.id))).toBe(false);
    expect(abzeichenArt('woerter-5000')).toMatchObject({ gruppe: 'woerter', rang: 5 });
    expect(abzeichenArt('unbekannt')).toBeUndefined();
  });

  it('Einheiten je Stufe und Lektionen der Schrift-Vorkurse wie in den Rahmenplänen de, tr, ar', () => {
    for (const sprache of Object.keys(SCHRIFTEN) as (keyof typeof SCHRIFTEN)[]) {
      const rahmen = JSON.parse(
        readFileSync(join(import.meta.dirname, `../../../inhalte/lernapp/rahmen/${sprache}.rahmen.json`), 'utf8'),
      ) as {
        vorkurs: unknown[];
        stufen: { stufe: string; einheiten: unknown[] }[];
      };
      expect(rahmen.vorkurs, sprache).toHaveLength(VORKURS_LEKTIONEN[sprache]);
      for (const s of rahmen.stufen) expect(s.einheiten, `${sprache} ${s.stufe}`).toHaveLength(EINHEITEN_JE_STUFE[s.stufe as 'a1']);
    }
  });

  it('jede Gruppe hat Name und Bedingung in de, tr und ar; die Platzhalter werden voll gefüllt', async () => {
    const { abzeichenText } = await import('@/components/lernapp/Abzeichen');
    for (const ui of ['de', 'tr', 'ar'] as const) {
      const texte = JSON.parse(readFileSync(join(import.meta.dirname, `../../../messages/lernapp/${ui}.json`), 'utf8')).abzeichen;
      expect(Object.keys(texte.arten).sort(), ui).toEqual([...ABZEICHEN_GRUPPEN].sort());
      const namen = ABZEICHEN.map((a) => abzeichenText(a, texte, ui, 'westlich'));
      for (const [i, t] of namen.entries()) {
        expect(t.name.length, `${ui} ${ABZEICHEN[i]!.id}`).toBeGreaterThan(1);
        expect(`${t.name} ${t.text}`, `${ui} ${ABZEICHEN[i]!.id}`).not.toMatch(/[{}#]/);
      }
      expect(new Set(namen.map((t) => t.name)).size, `${ui}: Namen unterscheidbar`).toBe(ABZEICHEN.length);
    }
  });
});

describe('Ableitung aus dem Protokoll', () => {
  it('Lektionen: verschiedene zählen, Wiederholung derselben Lektion nicht; Tag = Lerntag des auslösenden Ereignisses', () => {
    const liste = [lektion('tr-aus-de.a1.e01.l01', START), lektion('tr-aus-de.a1.e01.l01', addiereTage(START, 1))];
    for (let i = 2; i <= 10; i++) liste.push(lektion(`tr-aus-de.a1.e01.l${zwei(i)}`, addiereTage(START, i)));
    const m = ab(liste);
    expect(m.get('lektionen-1')).toEqual({ id: 'lektionen-1', tag: START });
    expect(m.get('lektionen-10')).toEqual({ id: 'lektionen-10', tag: addiereTage(START, 10) });
    expect(m.has('lektionen-50')).toBe(false);
  });

  it('Lerntage gesamt, nicht in Folge (mit Lücken); Ruhezeit und Einstellungen machen keinen Lerntag', () => {
    const liste = Array.from({ length: 7 }, (_, i) => lektion('tr-aus-de.a1.e01.l01', addiereTage(START, i * 5)));
    liste.push(ereignis('pause', { von: '2026-12-01', bis: '2026-12-20' }, '2026-12-01'));
    liste.push(ereignis('einstellung', { schluessel: 'pausetage', wert: 3 }, '2026-12-02'));
    const m = ab(liste);
    expect(m.get('lerntage-7')?.tag).toBe(addiereTage(START, 30));
    expect(m.has('lerntage-30')).toBe(false);
  });

  it('Wörter: verschiedene Karten mindestens einmal richtig, „nochmal“ zählt nicht', () => {
    const liste = Array.from({ length: 99 }, (_, i) => bewertung(`tr-aus-de:tr.a1.w${i}`, START));
    liste.push(bewertung('tr-aus-de:tr.a1.w0', START), bewertung('tr-aus-de:tr.a1.w99', START, 'nochmal'));
    expect(ab(liste).has('woerter-100')).toBe(false);
    liste.push(bewertung('tr-aus-de:tr.a1.w99', addiereTage(START, 1)));
    expect(ab(liste).get('woerter-100')?.tag).toBe(addiereTage(START, 1));
  });

  it('Geschichten, Prüfsteine und Wiederholungen; Wiederholungssitzungen zählen je Sitzung', () => {
    const liste = [
      lektion('tr-aus-de.a1.e01.g01', START, 'geschichte'),
      lektion('tr-aus-de.a1.e01.p01', START, 'pruefstein'),
      ...Array.from({ length: 10 }, (_, i) => lektion('tr-aus-de.wiederholung', addiereTage(START, i), 'wiederholung')),
    ];
    expect(ids(ab(liste))).toEqual(
      expect.arrayContaining(['geschichten-1', 'pruefsteine-1', 'wiederholungen-1', 'wiederholungen-10', 'lektionen-1']),
    );
    expect(ab(liste).has('wiederholungen-50')).toBe(false);
  });

  it('Stufe: Prüfsteine aller Einheiten einer Stufe in einem Sprachkurs (A1: 12); doppelt zählt einmal, andere Kurse nicht', () => {
    const pruef = (kurs: string, e: number, tag: string) => lektion(`${kurs}.a1.e${zwei(e)}.p01`, tag, 'pruefstein', kurs);
    const elf = Array.from({ length: 11 }, (_, i) => pruef('tr-aus-de', i + 1, addiereTage(START, i)));
    const liste = [...elf, pruef('tr-aus-de', 11, addiereTage(START, 20)), pruef('de-aus-tr', 12, addiereTage(START, 21))];
    expect(ab(liste).has('stufe-a1')).toBe(false);
    liste.push(pruef('tr-aus-de', 12, addiereTage(START, 30)));
    expect(ab(liste).get('stufe-a1')?.tag).toBe(addiereTage(START, 30));
    expect(ab(liste).has('stufe-a2')).toBe(false);
  });

  it('Schrift-Vorkurs: alle Lektionen einer Zielsprache; dieselbe Lektion aus zwei Ausgangssprachen zählt einmal', () => {
    const vorkurs = (kurs: string, n: number, tag = START) => lektion(`${kurs}.v.l${zwei(n)}`, tag, 'schrift', kurs);
    const ar = Array.from({ length: VORKURS_LEKTIONEN.ar - 1 }, (_, i) => vorkurs('ar-aus-de', i + 1));
    ar.push(vorkurs('ar-aus-tr', 1));
    expect(ab(ar).has('schrift-ar')).toBe(false);
    ar.push(vorkurs('ar-aus-tr', VORKURS_LEKTIONEN.ar, addiereTage(START, 3)));
    expect(ab(ar).get('schrift-ar')?.tag).toBe(addiereTage(START, 3));
    const tr = [vorkurs('tr-aus-de', 1), vorkurs('tr-aus-ar', 2)];
    expect(ids(ab(tr))).toContain('schrift-tr');
    expect(ids(ab(tr))).not.toContain('schrift-latein');
    expect(ids(ab(Array.from({ length: VORKURS_LEKTIONEN.de }, (_, i) => vorkurs('de-aus-ar', i + 1))))).toContain('schrift-latein');
  });

  it('Erstes Sprechen und Schreiben, Einstufung, Bereiche des Wissenskurses, Gruppenziel nur mit Kontext', () => {
    const liste = [
      lektion('tr-aus-de.a1.e01.s01', START, 'sprechen'),
      lektion('de-aus-tr.b1.e01.w01', START, 'schreiben', 'de-aus-tr'),
      ereignis('einstufung', { kurs: 'ar-aus-de', stufe: 'a2', richtig: 14, gesamt: 20 }, START),
      lektion('islam.grund.e01.l01', START, 'lektion', 'islam'),
      lektion('islam.vertiefung.e02.l01', addiereTage(START, 2), 'lektion', 'islam'),
    ];
    const m = ab(liste);
    expect(ids(m)).toEqual(
      expect.arrayContaining(['erstes-sprechen', 'erstes-schreiben', 'einstufung-test', 'wissen-grund', 'wissen-vertiefung']),
    );
    expect(m.has('wissen-aufbau')).toBe(false);
    expect(m.has('gruppe-ziel')).toBe(false);
    expect(ab(liste, { gruppenziel: '2026-09-07' }).get('gruppe-ziel')?.tag).toBe('2026-09-07');
  });

  it('Erstes Sprechen und Schreiben aus gewöhnlichen Lektionen des Rahmenplans (Feld `typen`, Mangel L7-01 Nr. 1)', () => {
    // Rahmenpläne kennen nur lektion, geschichte, wiederholung und pruefstein; Sprechen und Schreiben sind Aufgabentypen darin
    const mit = (schluessel: string, tag: string, typen: ('sprechen' | 'schreiben')[]) =>
      ereignis('lektion', { kurs: 'de-aus-tr', lektion: schluessel, art: 'lektion', richtig: 3, gesamt: 4, typen }, tag, G2);
    const ohne = ab([lektion('de-aus-tr.a1.e01.l03', START, 'lektion', 'de-aus-tr')]);
    expect(ohne.has('erstes-sprechen')).toBe(false);
    expect(ohne.has('erstes-schreiben')).toBe(false);
    const m = ab([
      lektion('de-aus-tr.a1.e01.l03', START, 'lektion', 'de-aus-tr'),
      mit('de-aus-tr.a1.e01.l04', addiereTage(START, 1), ['sprechen']),
      mit('de-aus-tr.a1.e02.l04', addiereTage(START, 3), ['sprechen', 'schreiben']),
    ]);
    expect(m.get('erstes-sprechen')).toEqual({ id: 'erstes-sprechen', tag: addiereTage(START, 1) });
    expect(m.get('erstes-schreiben')).toEqual({ id: 'erstes-schreiben', tag: addiereTage(START, 3) });
    // am Abschluss gilt es als neu (heutiger Lerntag)
    const heute = addiereTage(START, 1);
    const a = leiteAb([lektion('de-aus-tr.a1.e01.l03', START), mit('de-aus-tr.a1.e01.l04', heute, ['sprechen'])], heute);
    expect(abschlussStand(a, heute, new Set(['lektionen-1'])).neu).toEqual(['erstes-sprechen']);
  });

  it('Feld `typen`: optional; nur Sprechen und Schreiben, je einmal, nicht leer', () => {
    const daten = { kurs: 'de-aus-tr', lektion: 'de-aus-tr.a1.e01.l04', art: 'lektion', richtig: 1, gesamt: 1 };
    const kopf = { geraet: G1, seq: 0, am: `${START}T10:00:00.000Z`, tag: START, art: 'lektion' };
    expect(EreignisSchema.safeParse({ ...kopf, daten }).success).toBe(true);
    expect(EreignisSchema.safeParse({ ...kopf, daten: { ...daten, typen: ['schreiben', 'sprechen'] } }).success).toBe(true);
    for (const typen of [[], ['hoeren'], ['sprechen', 'sprechen'], ['sprechen', 'schreiben', 'sprechen'], 'sprechen'])
      expect(EreignisSchema.safeParse({ ...kopf, daten: { ...daten, typen } }).success, JSON.stringify(typen)).toBe(false);
  });

  it('Tagesziel: Tage mit erreichtem Ziel gesamt (aus der Ableitung); Tag = siebter Zieltag', () => {
    const liste = Array.from({ length: 8 }, (_, i) => lektion(`tr-aus-de.a1.e01.l${zwei(i + 1)}`, addiereTage(START, i * 2)));
    const a = leiteAb(liste, addiereTage(START, 20));
    expect([...a.tage.values()].filter((t) => t.erreicht)).toHaveLength(8);
    expect(a.abzeichen.get('tagesziel-7')?.tag).toBe(addiereTage(START, 12));
    // „kein Ziel“: keine Zieltage, also kein Abzeichen der Gruppe
    const ohne = leiteAb([ereignis('tagesziel', { ziel: { art: 'kein' } }, '2026-08-01'), ...liste], addiereTage(START, 20));
    expect([...ohne.abzeichen.keys()].some((k) => k.startsWith('tagesziel-'))).toBe(false);
  });

  it('Ergebnis in Katalogreihenfolge; neue Abzeichen gegenüber einem früheren Stand', () => {
    const m = ab([
      lektion('tr-aus-de.a1.e01.p01', START, 'pruefstein'),
      ereignis('einstufung', { kurs: 'tr-aus-de', stufe: 'a1', richtig: 1, gesamt: 2 }, START),
    ]);
    const reihenfolge = ABZEICHEN.map((a) => a.id).filter((id) => m.has(id));
    expect(ids(m)).toEqual(reihenfolge);
    expect(neueAbzeichen(m, new Set(['lektionen-1']))).toEqual(reihenfolge.filter((id) => id !== 'lektionen-1'));
  });

  it('Abschlussstand: heutiger Tag, Serie und neue Abzeichen aus derselben Ableitung', () => {
    const heute = addiereTage(START, 5);
    const a = leiteAb([lektion('tr-aus-de.a1.e01.l01', START), lektion('tr-aus-de.a1.e01.l02', heute)], heute);
    const s = abschlussStand(a, heute, new Set(['lektionen-1']));
    expect(s.neu).toEqual([]);
    expect(s.tag).toMatchObject({ tag: heute, lektionen: 1, erreicht: true });
    expect(s.serie).toMatchObject({ heute, wiedereinstieg: true, pausetage: 2 });
    // ohne früheren Stand (neue Ableitungsversion, Abgleich): nur Abzeichen von heute gelten als neu
    expect(abschlussStand(a, heute, new Set()).neu).toEqual([]);
    const b = leiteAb([lektion('tr-aus-de.a1.e01.l01', START), lektion('tr-aus-de.a1.e01.s01', heute, 'sprechen')], heute);
    expect(abschlussStand(b, heute, new Set()).neu).toEqual(['erstes-sprechen']);
  });

  it('Zeitzonen: ein Abzeichen gilt am Lerntag in Ortszeit des Geräts, nicht am UTC-Tag von `am`', () => {
    // 00:30 in Berlin (22:30 UTC am Vortag) bzw. 23:30 in Los Angeles (06:30 UTC am Folgetag)
    const berlin = EreignisSchema.parse({
      geraet: G1,
      seq: zaehler++,
      am: '2026-10-17T22:30:00.000Z',
      tag: '2026-10-18',
      art: 'lektion',
      daten: { kurs: 'tr-aus-de', lektion: 'tr-aus-de.a1.e01.l01', art: 'lektion', richtig: 1, gesamt: 1 },
    });
    const la = EreignisSchema.parse({ ...berlin, geraet: G2, am: '2026-10-19T06:30:00.000Z', tag: '2026-10-18' });
    expect(ab([berlin]).get('lektionen-1')?.tag).toBe('2026-10-18');
    expect(ab([la]).get('lektionen-1')?.tag).toBe('2026-10-18');
    expect(abschlussStand(leiteAb([berlin], '2026-10-18'), '2026-10-18', new Set()).neu).toEqual(['lektionen-1']);
  });
});

describe('Eigenschaften', () => {
  const tag = fc.integer({ min: 0, max: 400 }).map((n) => addiereTage(START, n));
  const art = fc.constantFrom(...LEKTIONS_ARTEN);
  const kurs = fc.constantFrom('tr-aus-de', 'ar-aus-de', 'ar-aus-tr', 'de-aus-ar', 'islam');
  const eintrag = fc.oneof(
    fc
      .tuple(kurs, fc.constantFrom('a1', 'a2', 'v', 'grund', 'aufbau'), fc.integer({ min: 1, max: 14 }), art, tag, fc.boolean())
      .map(([k, s, e, a, t, g]) => lektion(`${k}.${s}.e${zwei(e)}.l01`, t, a, k, g ? G1 : G2)),
    fc.tuple(fc.integer({ min: 0, max: 150 }), tag, fc.boolean()).map(([n, t, g]) => bewertung(`k${n}`, t, g ? 'gut' : 'nochmal')),
    tag.map((t) => ereignis('einstufung', { kurs: 'tr-aus-de', stufe: 'a1', richtig: 1, gesamt: 2 }, t)),
  );

  it('dasselbe Protokoll ergibt auf jedem Gerät dieselben Abzeichen mit demselben Tag (Reihenfolge egal)', () => {
    fc.assert(
      fc.property(fc.array(eintrag, { maxLength: 60 }), fc.integer(), (liste, saat) => {
        const gemischt = [...liste].sort((x, y) => ((x.seq * 7919 + saat) % 101) - ((y.seq * 7919 + saat) % 101));
        expect(ab(gemischt)).toEqual(ab(liste));
      }),
      { numRuns: 60 },
    );
  });

  it('ein weiteres Ereignis nimmt kein Abzeichen weg und verschiebt keinen früheren Tag nach hinten', () => {
    fc.assert(
      fc.property(fc.array(eintrag, { maxLength: 60 }), eintrag, (liste, extra) => {
        const vorher = ab(liste);
        const nachher = ab([...liste, extra]);
        for (const [id, z] of vorher) {
          expect(nachher.has(id)).toBe(true);
          expect(nachher.get(id)!.tag <= z.tag).toBe(true);
        }
      }),
      { numRuns: 60 },
    );
  });
});
