import { describe, expect, it } from 'vitest';
import { istErlaubterLink } from '@/components/website/RichText';

/** ADR 0006, Tor A SP-A-16: nur https, mailto, tel und echte relative Pfade als Linkziele im Rich-Text. */
describe('istErlaubterLink', () => {
  it.each(['https://www.igmg.org', 'mailto:info@example.test', 'tel:+49000000', '/kontakt', '/veranstaltungen/a-b'])('erlaubt %s', (h) => {
    expect(istErlaubterLink(h)).toBe(true);
  });
  it.each([
    'http://example.test',
    'javascript:alert(1)',
    'data:text/html,x',
    '//example.test',
    '/\\example.test',
    ' /kontakt',
    'kontakt',
    42,
    null,
  ])('lehnt %s ab', (h) => {
    expect(istErlaubterLink(h)).toBe(false);
  });
});
