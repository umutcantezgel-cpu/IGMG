import { describe, expect, it } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn: eigene Schriftgrößen neben Farben', () => {
  it('behält Display- und Anzeige-Stufen neben einer Textfarbe', () => {
    expect(cn('text-display-2', 'text-weiss')).toBe('text-display-2 text-weiss');
    expect(cn('text-display-1 text-tinte', 'text-gruen-800')).toBe('text-display-1 text-gruen-800');
    expect(cn('text-anzeige-96', 'text-weiss')).toBe('text-anzeige-96 text-weiss');
  });

  it('ersetzt eine Schriftgröße durch die spätere', () => {
    expect(cn('text-24', 'text-display-2')).toBe('text-display-2');
    expect(cn('text-display-1', 'text-18')).toBe('text-18');
  });
});
