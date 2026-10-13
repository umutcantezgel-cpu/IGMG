import { describe, expect, it } from 'vitest';
import { pfadTiefe, richtungZwischen } from '@/components/website/SeitenUebergang';

describe('B-26 Seitenwechsel mit Richtung', () => {
  it('Tiefe ohne Sprachpräfix', () => {
    expect(pfadTiefe('/')).toBe(0);
    expect(pfadTiefe('/tr')).toBe(0);
    expect(pfadTiefe('/quran')).toBe(1);
    expect(pfadTiefe('/tr/kuran/2')).toBe(2);
    expect(pfadTiefe('/en/quran/2/')).toBe(2);
  });

  it('tiefer, höher, seitlich', () => {
    expect(richtungZwischen('/quran', '/quran/2')).toBe('tiefer');
    expect(richtungZwischen('/tr/kuran/2', '/tr/kuran')).toBe('hoeher');
    expect(richtungZwischen('/quran/1', '/quran/2')).toBe('seitlich');
    expect(richtungZwischen('/hadith', '/gebetszeiten')).toBe('seitlich');
  });
});
