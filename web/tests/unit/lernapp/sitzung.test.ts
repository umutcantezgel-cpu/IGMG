import { describe, expect, it } from 'vitest';
import type { Lektion } from '@/lib/lernapp/aufgaben/schema';
import { faelligeAnzahl, schwaeche, uebungsStufe, waehleKarten } from '@/lib/lernapp/engine/kartenwahl';
import {
  aktuell,
  fortschritt,
  pruefe,
  type Sitzung,
  starte,
  ueberspringe,
  WEITERE_VERSUCHE,
  weiter,
  zusammenfassung,
} from '@/lib/lernapp/engine/sitzung';
import { xpFuer } from '@/lib/lernapp/engine/xp';
import { EreignisEntwurfSchema, type EreignisEntwurf } from '@/lib/lernapp/ereignisse/typen';
import type { Kartenstand } from '@/lib/lernapp/srs';
import { LEKTION } from './hilfen/lektion';

/**
 * Lektionssitzung als Zustandsautomat (PLAN §4): frage → prüfen → Rückmeldung → weiter; Fehler am Ende erneut, ohne
 * Strafe; Bewertungen nur im ersten Versuch; am Ende Lektion und XP (statisch).
 */
const RICHTIG = {
  auswahl: { typ: 'auswahl', wahl: 0 },
  wortbank: { typ: 'wortbank', kacheln: [0, 1] },
  paare: {
    typ: 'paare',
    versuche: [
      [0, 0],
      [1, 1],
      [2, 2],
    ],
  },
  frei: { typ: 'frei', text: 'ekmek' },
} as const;
const FALSCH = {
  auswahl: { typ: 'auswahl', wahl: 1 },
  wortbank: { typ: 'wortbank', kacheln: [3, 4] },
  paare: {
    typ: 'paare',
    versuche: [
      [0, 1],
      [0, 0],
      [1, 1],
      [2, 2],
    ],
  },
  frei: { typ: 'frei', text: 'su' },
} as const;

function spiele(s: Sitzung, antworten: (typ: keyof typeof RICHTIG, nr: number) => 'richtig' | 'falsch') {
  const ereignisse: EreignisEntwurf[] = [];
  const reihe: string[] = [];
  let nr = 0;
  while (s.phase !== 'fertig') {
    const a = aktuell(s)!;
    const typ = a.aufgabe.typ as keyof typeof RICHTIG;
    reihe.push(`${typ}${a.wiederholung ? '*' : ''}`);
    const p = pruefe(s, (antworten(typ, nr++) === 'richtig' ? RICHTIG : FALSCH)[typ] as never);
    ereignisse.push(...p.ereignisse);
    const w = weiter(p.sitzung);
    ereignisse.push(...w.ereignisse);
    s = w.sitzung;
  }
  return { s, ereignisse, reihe };
}

describe('Sitzung', () => {
  it('startet mit den spielbaren Aufgaben; abgewählte Typen fallen weg', () => {
    const s = starte(LEKTION);
    expect(s.aufgaben.map((a) => a.typ)).toEqual(['auswahl', 'wortbank', 'paare', 'frei']);
    expect(starte(LEKTION, { ohne: ['frei', 'paare'] }).aufgaben.map((a) => a.typ)).toEqual(['auswahl', 'wortbank']);
    expect(s.phase).toBe('frage');
    expect(fortschritt(s)).toBe(0);
    expect(s.lexikon?.woerter.has('ekmek')).toBe(true);
  });

  it('alles richtig: vier Aufgaben, Bewertungen je Karte, am Ende Lektion und 10 XP', () => {
    const { s, ereignisse, reihe } = spiele(starte(LEKTION), () => 'richtig');
    expect(reihe).toEqual(['auswahl', 'wortbank', 'paare', 'frei']);
    expect(fortschritt(s)).toBe(1);
    expect(
      ereignisse.filter((e) => e.art === 'bewertung').map((e) => (e.art === 'bewertung' ? [e.daten.karte, e.daten.note] : [])),
    ).toEqual([
      ['tr.a1.l0001', 'gut'],
      ['tr.a1.s0001', 'gut'],
      ['tr.a1.l0001', 'gut'],
      ['tr.a1.l0002', 'gut'],
      ['tr.a1.l0003', 'gut'],
    ]);
    expect(ereignisse.at(-2)).toEqual({
      art: 'lektion',
      daten: { kurs: 'tr-aus-de', lektion: 'tr-aus-de.a1.e01.l01', art: 'lektion', richtig: 4, gesamt: 4 },
    });
    expect(ereignisse.at(-1)).toEqual({ art: 'xp', daten: { menge: 10, grund: 'lektion', bezug: 'tr-aus-de.a1.e01.l01' } });
    for (const e of ereignisse) expect(EreignisEntwurfSchema.safeParse(e).success).toBe(true);
    expect(zusammenfassung(s)).toEqual({ richtig: 4, gesamt: 4, xp: 10 });
  });

  it('Fehler kommen am Ende noch einmal; Bewertung nur im ersten Versuch', () => {
    const { s, ereignisse, reihe } = spiele(starte(LEKTION), (typ, nr) => (typ === 'wortbank' && nr === 1 ? 'falsch' : 'richtig'));
    expect(reihe).toEqual(['auswahl', 'wortbank', 'paare', 'frei', 'wortbank*']);
    const wb = ereignisse.filter((e) => e.art === 'bewertung' && e.daten.karte === 'tr.a1.s0001');
    expect(wb).toHaveLength(1);
    expect(wb[0]).toMatchObject({ daten: { note: 'nochmal', aufgabe: 'tr.a1.e01.a002', kurs: 'tr-aus-de' } });
    expect(zusammenfassung(s)).toEqual({ richtig: 3, gesamt: 4, xp: 10 });
  });

  it('höchstens zwei weitere Versuche je Aufgabe, dann geht es weiter', () => {
    const { s, reihe } = spiele(starte(LEKTION), (typ) => (typ === 'auswahl' ? 'falsch' : 'richtig'));
    expect(reihe).toEqual(['auswahl', 'wortbank', 'paare', 'frei', 'auswahl*', 'auswahl*']);
    expect(WEITERE_VERSUCHE).toBe(2);
    expect(s.versuche[0]).toBe(3);
    expect(fortschritt(s)).toBe(1);
  });

  it('Phasen: prüfen nur bei „frage“, weiter nur bei „rueckmeldung“; Fortschritt wächst', () => {
    let s = starte(LEKTION);
    expect(weiter(s).sitzung).toBe(s);
    const p = pruefe(s, RICHTIG.auswahl);
    s = p.sitzung;
    expect(s.phase).toBe('rueckmeldung');
    expect(s.letzte).toMatchObject({ urteil: 'richtig', loesung: 'su' });
    expect(pruefe(s, RICHTIG.auswahl).sitzung).toBe(s);
    expect(fortschritt(s)).toBeCloseTo(1 / 4);
    s = weiter(s).sitzung;
    expect(s.phase).toBe('frage');
    expect(s.letzte).toBeNull();
  });

  it('Tippfehler zählen als angenommen; Lektion ohne spielbare Aufgabe ist sofort fertig', () => {
    const leer: Lektion = { ...LEKTION, aufgaben: [LEKTION.aufgaben[3]!] };
    const s = starte(leer, { ohne: ['frei'] });
    expect(s.phase).toBe('fertig');
    expect(fortschritt(s)).toBe(1);
    expect(zusammenfassung(s)).toEqual({ richtig: 0, gesamt: 0, xp: 0 });
  });

  it('überspringen: ohne Bewertung und ohne Wiederholung; mit Typen auch spätere Aufgaben dieser Typen', () => {
    let s = starte(LEKTION);
    const r = ueberspringe(s);
    expect(r.ereignisse).toEqual([]);
    s = r.sitzung;
    expect(s.phase).toBe('frage');
    expect(aktuell(s)?.aufgabe.typ).toBe('wortbank');
    expect(s.uebersprungen).toEqual([true, false, false, false]);
    expect(fortschritt(s)).toBeCloseTo(1 / 4);
    // „Ich kann gerade nicht hören“: alle späteren Aufgaben der Typen fallen weg (hier frei als Beispiel)
    const t = ueberspringe(s, { typen: ['frei'] });
    expect(t.sitzung.uebersprungen).toEqual([true, true, false, true]);
    expect(t.sitzung.reihe).toEqual([0, 1, 2]);
    expect(aktuell(t.sitzung)?.aufgabe.typ).toBe('paare');
    // zu Ende spielen: Lektion zählt nur die gespielte Aufgabe
    const p = pruefe(t.sitzung, RICHTIG.paare as never);
    const w = weiter(p.sitzung);
    expect(w.sitzung.phase).toBe('fertig');
    expect(w.ereignisse[0]).toMatchObject({ art: 'lektion', daten: { richtig: 1, gesamt: 1 } });
    expect(zusammenfassung(w.sitzung)).toEqual({ richtig: 1, gesamt: 1, xp: 10 });
  });

  it('überspringen nur vor dem ersten Versuch; alles übersprungen ergibt keine Ereignisse', () => {
    const s = starte(LEKTION);
    const p = pruefe(s, FALSCH.auswahl);
    expect(ueberspringe(p.sitzung).sitzung).toBe(p.sitzung);
    let x = starte(LEKTION);
    const ereignisse: EreignisEntwurf[] = [];
    while (x.phase !== 'fertig') {
      const r = ueberspringe(x);
      ereignisse.push(...r.ereignisse);
      x = r.sitzung;
    }
    expect(ereignisse).toEqual([]);
    expect(zusammenfassung(x)).toEqual({ richtig: 0, gesamt: 0, xp: 0 });
    expect(fortschritt(x)).toBe(1);
  });

  it('XP je Art der Lektion: Geschichte 15, Prüfstein 20, Wiederholung 1 je 2 Karten', () => {
    expect(zusammenfassung(starte({ ...LEKTION, art: 'geschichte' })).xp).toBe(15);
    expect(zusammenfassung(starte({ ...LEKTION, art: 'pruefstein' })).xp).toBe(20);
    expect(zusammenfassung(starte({ ...LEKTION, art: 'wiederholung' })).xp).toBe(2); // 4 Karten
    expect([
      xpFuer('wiederholung', 0),
      xpFuer('wiederholung', 3),
      xpFuer('wiederholung', 40),
      xpFuer('schreiben'),
      xpFuer('schrift'),
    ]).toEqual([0, 1, 10, 15, 10]);
  });
});

const stand = (karte: string, teil: Partial<Kartenstand>): Kartenstand => ({
  karte,
  faellig: '2026-10-17T10:00:00.000Z',
  stabilitaet: 5,
  schwierigkeit: 5,
  tageVergangen: 0,
  tageGeplant: 5,
  lernschritt: 0,
  wiederholungen: 3,
  fehler: 0,
  zustand: 'wiederholen',
  zuletzt: '2026-10-12T10:00:00.000Z',
  letzteNote: 'gut',
  parameterversion: 'fsrs6/ts-fsrs-5.4.2/1',
  ...teil,
});

describe('Kartenwahl', () => {
  const jetzt = new Date('2026-10-17T12:00:00.000Z');
  const karten = [
    stand('a', { faellig: '2026-10-17T11:00:00.000Z' }),
    stand('b', { faellig: '2026-10-10T11:00:00.000Z' }),
    stand('c', { faellig: '2026-10-20T11:00:00.000Z', letzteNote: 'nochmal', fehler: 2 }),
    stand('d', { faellig: '2026-10-25T11:00:00.000Z' }),
    stand('e', { faellig: '2026-10-21T11:00:00.000Z', letzteNote: 'schwer' }),
  ];

  it('fällige zuerst (am längsten überfällig vorn), dann schwache; starke nicht', () => {
    expect(waehleKarten(karten, { jetzt }).map((k) => k.karte)).toEqual(['b', 'a', 'c', 'e']);
    expect(waehleKarten(karten, { jetzt, anzahl: 3 }).map((k) => k.karte)).toEqual(['b', 'a', 'c']);
    expect(faelligeAnzahl(karten, jetzt)).toBe(2);
  });

  it('Schwäche und Übungsstufe nach Stabilität', () => {
    expect(schwaeche(stand('x', {}))).toBe(0);
    expect(schwaeche(stand('x', { letzteNote: 'nochmal', fehler: 5, stabilitaet: 0.5 }))).toBe(8);
    expect(uebungsStufe(undefined)).toBe('erkennen');
    expect(uebungsStufe(stand('x', { stabilitaet: 1.5 }))).toBe('erkennen');
    expect(uebungsStufe(stand('x', { stabilitaet: 5 }))).toBe('wortbank');
    expect(uebungsStufe(stand('x', { stabilitaet: 30 }))).toBe('produktion');
  });
});
