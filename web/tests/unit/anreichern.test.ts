import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Nachsatz langer Suren (Z-08): Wörter und Tajwid entstehen in Abschnitten von höchstens ABSCHNITT_MS, dazwischen
 * gibt der Nachsatz den Hauptthread frei (vorher eine Aufgabe von ≈ 470 ms bei CPU 4× auf Al-Baqara). Satzfunktionen
 * und Wortdaten sind nachgebaut (Platzhaltertext, kein arabischer Text im Test); geprüft wird die Steuerung.
 */
vi.mock('@/lib/quran/satz', () => ({
  teileMitVersatz: (text: string) => text.split(' ').map((t, i) => ({ text: t, pos: i + 1, versatz: i * 10 })),
  versHtml: (teile: { text: string }[]) => `<satz>${teile.map((t) => t.text).join('|')}</satz>`,
}));
const ladeWoerter = vi.fn();
vi.mock('@/components/website/quran/daten', () => ({ ladeWoerter: (url: string) => ladeWoerter(url) }));
const { ABSCHNITT_MS, reichereAn } = await import('@/components/website/quran/anreichern');

let uhr = 0;
const KOSTEN_MS = 3;

class Vers {
  roh = true;
  isConnected = true;
  html = '';
  constructor(
    public textContent: string,
    public nr: number,
  ) {}
  set innerHTML(wert: string) {
    this.html = wert;
    uhr += KOSTEN_MS;
  }
  hasAttribute(n: string) {
    return n === 'data-roh' && this.roh;
  }
  removeAttribute(n: string) {
    if (n === 'data-roh') this.roh = false;
  }
  closest(s: string) {
    return s === '[data-v]' ? { dataset: { v: String(this.nr) } } : null;
  }
}

function leser(verse: Vers[]) {
  const ol = {
    dataset: { sure: '2' },
    querySelector: () => verse.find((v) => v.roh) ?? null,
    querySelectorAll: () => verse.filter((v) => v.roh),
  };
  return { querySelectorAll: () => [ol] } as unknown as HTMLElement;
}
const passend = (anzahl: number) => ({ w: Array.from({ length: anzahl }, (_, i) => [i + 1, i * 10, 0]), tj: [] });

const yieldSpion = vi.fn(() => Promise.resolve());
beforeEach(() => {
  uhr = 0;
  yieldSpion.mockClear();
  (globalThis as { scheduler?: unknown }).scheduler = { yield: yieldSpion };
});
afterEach(() => {
  delete (globalThis as { scheduler?: unknown }).scheduler;
});

describe('reichereAn', () => {
  it('setzt alle passenden Verse und gibt nach je höchstens ABSCHNITT_MS den Hauptthread frei', async () => {
    const verse = Array.from({ length: 10 }, (_, i) => new Vers('w1 w2', i + 1));
    ladeWoerter.mockResolvedValue({ verse: Object.fromEntries(verse.map((v) => [v.nr, passend(2)])) });
    await reichereAn(leser(verse), '/api/quran/__s__/woerter', () => uhr);
    expect(ladeWoerter).toHaveBeenCalledWith('/api/quran/2/woerter');
    expect(verse.every((v) => !v.roh && v.html === '<satz>w1|w2</satz>')).toBe(true);
    // je Vers 3 ms: Pause vor dem 4., 7. und 10. Vers
    expect(ABSCHNITT_MS).toBe(8);
    expect(yieldSpion).toHaveBeenCalledTimes(3);
  });

  it('ohne scheduler.yield: Pause über eine neue Aufgabe', async () => {
    delete (globalThis as { scheduler?: unknown }).scheduler;
    const zeitgeber = vi.spyOn(globalThis, 'setTimeout');
    const verse = Array.from({ length: 4 }, (_, i) => new Vers('w1', i + 1));
    ladeWoerter.mockResolvedValue({ verse: Object.fromEntries(verse.map((v) => [v.nr, passend(1)])) });
    await reichereAn(leser(verse), '/api/quran/__s__/woerter', () => uhr);
    expect(verse.every((v) => !v.roh)).toBe(true);
    expect(zeitgeber).toHaveBeenCalledWith(expect.any(Function), 0);
    zeitgeber.mockRestore();
  });

  it('Vers passt nicht zur Wortliste oder ist nicht mehr im Dokument: bleibt schlicht', async () => {
    const verse = [new Vers('w1 w2', 1), new Vers('w1', 2), new Vers('w1', 3)];
    verse[2].isConnected = false;
    ladeWoerter.mockResolvedValue({ verse: { 1: passend(3), 2: passend(1), 3: passend(1) } });
    await reichereAn(leser(verse), '/api/quran/__s__/woerter', () => uhr);
    expect(verse.map((v) => v.roh)).toEqual([true, false, true]);
  });
});
