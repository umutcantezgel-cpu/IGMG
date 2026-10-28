import { describe, expect, it } from 'vitest';
import { baueSitemap, FESTE_ZIELE } from '@/lib/seo/sitemap';

/** Sitemap als reine Funktion (ADR 0049): Sprachfassungen, hreflang, lastModified-Regel, CMS-Seiten. Adressen fiktiv (example.test). */
const basis = 'https://example.test/';

describe('FESTE_ZIELE', () => {
  it('enthält die festen öffentlichen Seiten, aber weder Anzeige noch Suche, Offline oder Verwaltung', () => {
    const ziele: readonly string[] = FESTE_ZIELE;
    for (const pfad of ['/', '/gebetszeiten', '/kontakt', '/igmg', '/ueber-uns', '/ramadan', '/spenden']) expect(ziele).toContain(pfad);
    for (const pfad of ['/gebetszeiten/anzeige', '/suche', '/offline']) expect(ziele).not.toContain(pfad);
    expect(ziele.some((p) => p.startsWith('/verwaltung'))).toBe(false);
    expect(new Set(ziele).size).toBe(ziele.length);
  });
});

describe('baueSitemap', () => {
  it('je Sprachfassung ein Eintrag mit allen Alternativen und x-default = Deutsch', () => {
    const sitemap = baueSitemap({ basis, ziele: ['/', '/gebetszeiten'], mitDatum: true });
    const sprachen = {
      de: 'https://example.test/gebetszeiten',
      tr: 'https://example.test/tr/namaz-vakitleri',
      en: 'https://example.test/en/prayer-times',
    };
    expect(sitemap.map((e) => e.url)).toEqual([
      'https://example.test/',
      'https://example.test/tr',
      'https://example.test/en',
      sprachen.de,
      sprachen.tr,
      sprachen.en,
    ]);
    for (const e of sitemap.slice(3)) expect(e.alternates).toEqual({ languages: { ...sprachen, 'x-default': sprachen.de } });
    expect(sitemap[0].alternates?.languages).toMatchObject({ 'x-default': 'https://example.test/' });
  });

  it('dynamische Ziele mit Parametern; lastModified nur mit Änderungsdatum und nur außerhalb des Beispielmodus', () => {
    const ziele = [
      { ziel: { pathname: '/nachrichten/[slug]' as const, params: { slug: 'testbeitrag-eins' } }, geaendert: '2026-10-01T08:00:00.000Z' },
      '/kontakt' as const,
    ];
    const mit = baueSitemap({ basis, ziele, mitDatum: true });
    expect(mit[0]).toEqual({
      url: 'https://example.test/nachrichten/testbeitrag-eins',
      lastModified: '2026-10-01T08:00:00.000Z',
      alternates: {
        languages: {
          de: 'https://example.test/nachrichten/testbeitrag-eins',
          tr: 'https://example.test/tr/haberler/testbeitrag-eins',
          en: 'https://example.test/en/news/testbeitrag-eins',
          'x-default': 'https://example.test/nachrichten/testbeitrag-eins',
        },
      },
    });
    expect(mit.slice(0, 3).every((e) => e.lastModified === '2026-10-01T08:00:00.000Z')).toBe(true);
    // Feste Seiten haben kein Änderungsdatum
    expect(mit.slice(3).some((e) => 'lastModified' in e)).toBe(false);
    // Beispielmodus: kein lastModified, auch nicht für Inhalte
    expect(baueSitemap({ basis, ziele, mitDatum: false }).some((e) => 'lastModified' in e)).toBe(false);
  });

  it('freie CMS-Seiten mit ihren Pfaden je Sprache; doppelte Adressen nur einmal', () => {
    const seite = { de: '/unsere-moschee', tr: '/tr/camimiz', en: '/en/our-mosque' };
    const sitemap = baueSitemap({ basis, ziele: ['/kontakt', '/kontakt'], seiten: [seite, seite], mitDatum: true });
    expect(sitemap.map((e) => e.url)).toEqual([
      'https://example.test/kontakt',
      'https://example.test/tr/iletisim',
      'https://example.test/en/contact',
      'https://example.test/unsere-moschee',
      'https://example.test/tr/camimiz',
      'https://example.test/en/our-mosque',
    ]);
    expect(sitemap[4].alternates?.languages).toEqual({
      de: 'https://example.test/unsere-moschee',
      tr: 'https://example.test/tr/camimiz',
      en: 'https://example.test/en/our-mosque',
      'x-default': 'https://example.test/unsere-moschee',
    });
  });

  it('ohne changeFrequency und priority (Google wertet beide nicht aus)', () => {
    const sitemap = baueSitemap({ basis, ziele: FESTE_ZIELE, mitDatum: true });
    expect(sitemap).toHaveLength(FESTE_ZIELE.length * 3);
    expect(sitemap.some((e) => 'changeFrequency' in e || 'priority' in e)).toBe(false);
    expect(sitemap.every((e) => e.url.startsWith('https://example.test/'))).toBe(true);
  });
});
