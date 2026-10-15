import { describe, expect, it } from 'vitest';
import {
  istStandard,
  ordnungAus,
  setzeSichtbar,
  sichtbareAbschnitte,
  STANDARD_ORDNUNG,
  STARTSEITE_ABSCHNITTE,
  startseitenOrdnung,
  verschiebeAbschnitt,
} from '@/lib/startseite/abschnitte';

/**
 * Ordnung der Startseiten-Abschnitte (F-40): Rückfall auf den Bestand bei fehlender oder ungültiger Einstellung,
 * Ergänzen fehlender Abschnitte, Verschieben und Ausblenden.
 */
const BESTAND = ['moschee', 'veranstaltungen', 'neuigkeiten', 'desTages'];

describe('Bestand', () => {
  it('Reihenfolge wie die Startseite vor F-40, alle sichtbar', () => {
    expect(STARTSEITE_ABSCHNITTE).toEqual(BESTAND);
    expect(sichtbareAbschnitte(STANDARD_ORDNUNG)).toEqual(BESTAND);
    expect(istStandard(STANDARD_ORDNUNG)).toBe(true);
  });
});

describe('ordnungAus (Rückfall)', () => {
  it.each([
    ['null (keine Einstellung)', null],
    ['undefined', undefined],
    ['leeres Objekt', {}],
    ['leere Liste', []],
    ['Zeichenkette', 'moschee,neuigkeiten'],
    ['unbekannter Abschnitt', [{ schluessel: 'kopf', sichtbar: true }]],
    ['doppelter Abschnitt', [{ schluessel: 'moschee', sichtbar: true }, { schluessel: 'moschee', sichtbar: false }]],
    ['sichtbar fehlt', [{ schluessel: 'moschee' }]],
    ['sichtbar kein Wahrheitswert', [{ schluessel: 'moschee', sichtbar: 'ja' }]],
    ['zusätzliches Feld', [{ schluessel: 'moschee', sichtbar: true, farbe: 'rot' }]],
    ['zu viele Einträge', [...STANDARD_ORDNUNG, { schluessel: 'moschee', sichtbar: true }]],
  ])('%s → Standardordnung', (_n, roh) => {
    expect(ordnungAus(roh)).toEqual(STANDARD_ORDNUNG);
  });

  it('gültige vollständige Ordnung bleibt, wie sie ist', () => {
    const roh = [
      { schluessel: 'neuigkeiten', sichtbar: true },
      { schluessel: 'desTages', sichtbar: false },
      { schluessel: 'moschee', sichtbar: true },
      { schluessel: 'veranstaltungen', sichtbar: true },
    ];
    expect(ordnungAus(roh)).toEqual(roh);
    expect(sichtbareAbschnitte(ordnungAus(roh))).toEqual(['neuigkeiten', 'moschee', 'veranstaltungen']);
  });

  it('unvollständig (später hinzugekommener Abschnitt): fehlende sichtbar in Bestandsreihenfolge angehängt', () => {
    const o = ordnungAus([
      { schluessel: 'neuigkeiten', sichtbar: false },
      { schluessel: 'moschee', sichtbar: true },
    ]);
    expect(o.map((e) => e.schluessel)).toEqual(['neuigkeiten', 'moschee', 'veranstaltungen', 'desTages']);
    expect(o.map((e) => e.sichtbar)).toEqual([false, true, true, true]);
  });

  it('liefert eine neue Liste (Standard wird nicht verändert)', () => {
    const o = ordnungAus(null);
    o[0].sichtbar = false;
    expect(STANDARD_ORDNUNG[0].sichtbar).toBe(true);
  });
});

describe('Bearbeiten', () => {
  it('nach oben und nach unten tauscht mit dem Nachbarn', () => {
    const runter = verschiebeAbschnitt(STANDARD_ORDNUNG, 'moschee', 'runter');
    expect(runter.map((e) => e.schluessel)).toEqual(['veranstaltungen', 'moschee', 'neuigkeiten', 'desTages']);
    const hoch = verschiebeAbschnitt(runter, 'desTages', 'hoch');
    expect(hoch.map((e) => e.schluessel)).toEqual(['veranstaltungen', 'moschee', 'desTages', 'neuigkeiten']);
    expect(istStandard(hoch)).toBe(false);
  });

  it('am Rand und bei unbekanntem Abschnitt: unverändert (neue Liste)', () => {
    const oben = verschiebeAbschnitt(STANDARD_ORDNUNG, 'moschee', 'hoch');
    expect(oben).toEqual(STANDARD_ORDNUNG);
    expect(oben).not.toBe(STANDARD_ORDNUNG);
    expect(verschiebeAbschnitt(STANDARD_ORDNUNG, 'desTages', 'runter')).toEqual(STANDARD_ORDNUNG);
    expect(verschiebeAbschnitt(STANDARD_ORDNUNG, 'kopf' as never, 'hoch')).toEqual(STANDARD_ORDNUNG);
  });

  it('ausblenden entfernt den Abschnitt aus der Anzeige, die Stelle bleibt', () => {
    const o = setzeSichtbar(STANDARD_ORDNUNG, 'veranstaltungen', false);
    expect(sichtbareAbschnitte(o)).toEqual(['moschee', 'neuigkeiten', 'desTages']);
    expect(o[1]).toEqual({ schluessel: 'veranstaltungen', sichtbar: false });
    expect(istStandard(o)).toBe(false);
    expect(sichtbareAbschnitte(setzeSichtbar(o, 'veranstaltungen', true))).toEqual(BESTAND);
  });

  it('das Speicherschema nimmt nur gültige Ordnungen an', () => {
    expect(startseitenOrdnung.safeParse(STANDARD_ORDNUNG).success).toBe(true);
    expect(startseitenOrdnung.safeParse([]).success).toBe(false);
  });
});
