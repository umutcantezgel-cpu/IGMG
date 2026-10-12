import { describe, expect, it } from 'vitest';
import { telefonHref } from '@/lib/telefon';

describe('telefonHref', () => {
  it('ergibt keinen Link für Platzhalter in eckigen Klammern (G-05)', () => {
    expect(telefonHref('[Telefonnummer]')).toBeNull();
    expect(telefonHref('[Telefonnummer Notfall]')).toBeNull();
    expect(telefonHref('  [Telefonnummer]  ')).toBeNull();
  });

  it('ergibt keinen Link ohne Wert oder ohne Ziffer', () => {
    expect(telefonHref(null)).toBeNull();
    expect(telefonHref(undefined)).toBeNull();
    expect(telefonHref('')).toBeNull();
    expect(telefonHref('   ')).toBeNull();
    expect(telefonHref('+')).toBeNull();
    expect(telefonHref('tel.')).toBeNull();
  });

  it('macht aus einer gepflegten Nummer ein tel:-Ziel nur mit Ziffern und Pluszeichen', () => {
    expect(telefonHref('+49 6441 123-456')).toBe('tel:+496441123456');
    expect(telefonHref('(06441) 12 34 56')).toBe('tel:06441123456');
    expect(telefonHref('0641 / 9 87 65')).toBe('tel:064198765');
    expect(telefonHref(' +49 (0) 6441 1234 ')).toBe('tel:+49064411234');
  });
});
