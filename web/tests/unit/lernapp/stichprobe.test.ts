import { describe, expect, it } from 'vitest';
import {
  EINLAUF_EINHEITEN,
  einlaufAktiv,
  entscheide,
  pruefSprache,
  quote,
  stichprobenGroesse,
  stichprobenSaat,
  werteAus,
  ziehe,
} from '@/lib/lernapp/stichprobe';

/** Muttersprachliche Stichprobe (ADR 0041 Nr. 3–5, PLAN §6.5). */
describe('Stichprobe: Größe', () => {
  it('Text: n = max(20, 10 %), höchstens alle', () => {
    expect(stichprobenGroesse({ art: 'zieltext', sprache: 'tr', einlauf: false, gesamt: 12 })).toBe(12);
    expect(stichprobenGroesse({ art: 'zieltext', sprache: 'tr', einlauf: false, gesamt: 150 })).toBe(20);
    expect(stichprobenGroesse({ art: 'zieltext', sprache: 'tr', einlauf: false, gesamt: 200 })).toBe(20);
    expect(stichprobenGroesse({ art: 'zieltext', sprache: 'tr', einlauf: false, gesamt: 201 })).toBe(21);
    expect(stichprobenGroesse({ art: 'uebersetzung', sprache: 'de', einlauf: false, gesamt: 1000 })).toBe(100);
    expect(stichprobenGroesse({ art: 'zieltext', sprache: 'de', einlauf: false, gesamt: 0 })).toBe(0);
  });

  it('Einlauf: 30 %, bei Text mindestens 20', () => {
    expect(stichprobenGroesse({ art: 'zieltext', sprache: 'ar', einlauf: true, gesamt: 30 })).toBe(20);
    expect(stichprobenGroesse({ art: 'zieltext', sprache: 'ar', einlauf: true, gesamt: 100 })).toBe(30);
    expect(stichprobenGroesse({ art: 'zieltext', sprache: 'ar', einlauf: true, gesamt: 101 })).toBe(31);
    expect(stichprobenGroesse({ art: 'audio', sprache: 'de', einlauf: true, gesamt: 10 })).toBe(3);
  });

  it('Audio: 10 %, Arabisch 20 %, mindestens ein Clip', () => {
    expect(quote({ art: 'audio', sprache: 'de', einlauf: false })).toBe(0.1);
    expect(quote({ art: 'audio', sprache: 'ar', einlauf: false })).toBe(0.2);
    expect(stichprobenGroesse({ art: 'audio', sprache: 'de', einlauf: false, gesamt: 30 })).toBe(3);
    expect(stichprobenGroesse({ art: 'audio', sprache: 'ar', einlauf: false, gesamt: 30 })).toBe(6);
    expect(stichprobenGroesse({ art: 'audio', sprache: 'tr', einlauf: false, gesamt: 4 })).toBe(1);
  });
});

describe('Stichprobe: Einlauf', () => {
  it('aktiv, bis drei Stichproben in Folge bestanden sind', () => {
    expect(EINLAUF_EINHEITEN).toBe(3);
    expect(einlaufAktiv([])).toBe(true);
    expect(einlaufAktiv(['bestanden', 'bestanden'])).toBe(true);
    expect(einlaufAktiv(['bestanden', 'bestanden', 'bestanden'])).toBe(false);
    expect(einlaufAktiv(['bestanden', 'nachbessern', 'bestanden', 'bestanden'])).toBe(true);
    expect(einlaufAktiv(['nachbessern', 'bestanden', 'bestanden', 'bestanden'])).toBe(false);
    // offene Stichproben zählen nicht
    expect(einlaufAktiv(['bestanden', 'bestanden', 'offen', 'bestanden'])).toBe(false);
  });
});

describe('Stichprobe: Auswahl', () => {
  const kandidaten = Array.from({ length: 50 }, (_, i) => `tr.a1.e01.s${String(i + 1).padStart(4, '0')}`);
  const saat = stichprobenSaat({ einheit: 'tr.a1.e01', art: 'zieltext', einheitHash: 'a'.repeat(64), runde: 1 });

  it('reproduzierbar und unabhängig von der Reihenfolge der Kandidaten', () => {
    const a = ziehe(kandidaten, { saat, groesse: 20 });
    const b = ziehe([...kandidaten].reverse(), { saat, groesse: 20 });
    expect(a).toEqual(b);
    expect(a).toHaveLength(20);
    expect(new Set(a).size).toBe(20);
    for (const k of a) expect(kandidaten).toContain(k);
  });

  it('neuer Startwert (neue Runde) zieht anders', () => {
    const neu = stichprobenSaat({ einheit: 'tr.a1.e01', art: 'zieltext', einheitHash: 'a'.repeat(64), runde: 2 });
    expect(neu).not.toBe(saat);
    expect(ziehe(kandidaten, { saat: neu, groesse: 20 })).not.toEqual(ziehe(kandidaten, { saat, groesse: 20 }));
  });

  it('gemeldete Einträge immer, auch über n hinaus', () => {
    const gemeldet = kandidaten.slice(0, 3);
    const a = ziehe(kandidaten, { saat, groesse: 2, gemeldet });
    expect(a).toEqual(gemeldet);
    const b = ziehe(kandidaten, { saat, groesse: 20, gemeldet: ['tr.a1.e01.s0050', 'fremd'] });
    expect(b[0]).toBe('tr.a1.e01.s0050');
    expect(b).toHaveLength(20);
    expect(b).not.toContain('fremd');
  });
});

describe('Stichprobe: Ergebnis und Annahmeregel', () => {
  const ok = { urteil: 'ok' as const, kategorie: null };
  it('zählt kritische und leichte Fehler', () => {
    const e = werteAus([
      ok,
      { urteil: 'korrektur', kategorie: 'zeichensetzung' },
      { urteil: 'korrektur', kategorie: 'natuerlichkeit' },
      { urteil: 'abgelehnt', kategorie: 'bedeutung' },
      { urteil: 'korrektur', kategorie: null },
    ]);
    expect(e).toEqual({ geprueft: 5, kritisch: 2, leicht: 2 });
  });

  it('0 kritisch und höchstens 2 leichte je 20 (anteilig) → bestanden', () => {
    const zwanzig = (leicht: number, kritisch = 0) => ({ geprueft: 20, leicht, kritisch });
    expect(entscheide(zwanzig(2), 20)).toBe('bestanden');
    expect(entscheide(zwanzig(3), 20)).toBe('nachbessern');
    expect(entscheide(zwanzig(0, 1), 20)).toBe('nachbessern');
    expect(entscheide({ geprueft: 10, leicht: 1, kritisch: 0 }, 10)).toBe('bestanden');
    expect(entscheide({ geprueft: 10, leicht: 2, kritisch: 0 }, 10)).toBe('nachbessern');
  });

  it('offen, solange nicht alle gezogenen Einträge geprüft sind', () => {
    expect(entscheide({ geprueft: 19, leicht: 0, kritisch: 0 }, 20)).toBe('offen');
    expect(entscheide({ geprueft: 0, leicht: 0, kritisch: 0 }, 0)).toBe('offen');
  });

  it('Prüfsprache: Übersetzungen in der Ausgangssprache, sonst die Zielsprache', () => {
    expect(pruefSprache('zieltext', 'tr', 'de')).toBe('tr');
    expect(pruefSprache('uebersetzung', 'tr', 'de')).toBe('de');
    expect(pruefSprache('audio', 'ar', 'de')).toBe('ar');
  });
});
