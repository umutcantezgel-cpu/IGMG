import { describe, expect, it } from 'vitest';
import { besondereTage, ramadanZeitraum } from '@/lib/kalender/besondere-tage';

/** Berechnete Tage (vorläufig, MN-15) – Plausibilität gegen den Kalender islamic-umalqura. */
describe('Besondere Tage 2026/2027', () => {
  const t2026 = besondereTage(2026);
  const t2027 = besondereTage(2027);
  const datum = (liste: typeof t2026, s: string) => liste.find((t) => t.schluessel === s)?.datum;

  it('alle Tage je Jahr vorhanden und sortiert', () => {
    for (const s of [
      'hicriNeujahr',
      'asure',
      'mevlid',
      'regaib',
      'mirac',
      'berat',
      'ramadanBeginn',
      'kadir',
      'ramazanBayrami',
      'kurbanBayrami',
    ])
      expect(datum(t2027, s), s).toBeDefined();
    expect([...t2026].sort((a, b) => a.datum.localeCompare(b.datum))).toEqual(t2026);
  });

  it('Ramadan 2027 beginnt im Februar, Bayram 29–30 Tage später', () => {
    const r = ramadanZeitraum(2027)!;
    expect(r.von.startsWith('2027-02')).toBe(true);
    const tage = (Date.parse(datum(t2027, 'ramazanBayrami')!) - Date.parse(r.von)) / 86_400_000;
    expect(tage === 29 || tage === 30).toBe(true);
  });

  it('Kandil-Nächte liegen am Vorabend; Regaib ist ein Donnerstag', () => {
    const regaib = datum(t2027, 'regaib')!;
    expect(new Date(`${regaib}T12:00:00Z`).getUTCDay()).toBe(4);
    const kadir = Date.parse(datum(t2027, 'kadir')!);
    const ramadan = Date.parse(ramadanZeitraum(2027)!.von);
    expect((kadir - ramadan) / 86_400_000).toBe(25);
  });

  it('Kurban Bayramı dauert vier Tage, Ramazan Bayramı drei', () => {
    expect(t2027.find((t) => t.schluessel === 'kurbanBayrami')?.tage).toBe(4);
    expect(t2027.find((t) => t.schluessel === 'ramazanBayrami')?.tage).toBe(3);
  });
});
