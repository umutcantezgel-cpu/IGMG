import { describe, expect, it } from 'vitest';
import { VARIANTEN, variantenBreiten, variantenSchluessel, variantenSrcSet, zerlegeVariante } from '@/lib/medien/varianten';
import { pruefeSchluessel } from '@/lib/storage';

describe('Bildvarianten (ADR 0020)', () => {
  it('erzeugt nur Breiten unterhalb des Originals – nie hochskaliert', () => {
    expect(variantenBreiten(2560)).toEqual([480, 960, 1600]);
    expect(variantenBreiten(1000)).toEqual([480, 960]);
    expect(variantenBreiten(480)).toEqual([]);
    expect(variantenBreiten(null)).toEqual([]);
  });

  it('legt Varianten neben das Original und findet von dort zurück', () => {
    const original = '0123456789abcdef/freitagsgebet.jpg';
    for (const w of VARIANTEN) {
      const v = variantenSchluessel(original, w);
      expect(zerlegeVariante(v)).toEqual({ original, breite: w });
      expect(() => pruefeSchluessel(v)).not.toThrow();
    }
    expect(zerlegeVariante(original)).toBeNull();
    expect(zerlegeVariante(`${original}.w500.webp`)).toBeNull();
  });

  it('baut ein srcset aus Varianten und Original', () => {
    expect(variantenSrcSet('/medien/a/b.jpg', 1200)).toBe(
      '/medien/a/b.jpg.w480.webp 480w, /medien/a/b.jpg.w960.webp 960w, /medien/a/b.jpg 1200w',
    );
  });
});
