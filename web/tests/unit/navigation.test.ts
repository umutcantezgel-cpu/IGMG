import { createNavigation } from 'next-intl/navigation';
import { describe, expect, it } from 'vitest';
import { pfadFuer } from '@/i18n/navigation';
import { ORGANISATIONEN, routing, type Pfad } from '@/i18n/routing';

/** Eigene Pfadberechnung (K-12) muss exakt next-intls getPathname entsprechen – für alle Pfade × Sprachen. */
const referenz = createNavigation(routing).getPathname;

const beispielParameter: Record<string, string> = {
  slug: 'freitagsgebet-mit-khutba',
  sure: '1',
  thema: 'fasten',
  organisation: ORGANISATIONEN[0],
};

describe('pfadFuer = getPathname (next-intl)', () => {
  const pfade = Object.keys(routing.pathnames) as Pfad[];
  for (const pfad of pfade) {
    for (const locale of routing.locales) {
      it(`${pfad} (${locale})`, () => {
        const namen = [...pfad.matchAll(/\[(?:\.\.\.)?([a-z]+)\]/g)].map((m) => m[1]);
        const ziel = namen.length
          ? { pathname: pfad, params: Object.fromEntries(namen.map((n) => [n, beispielParameter[n] ?? 'x'])) }
          : pfad;
        expect(pfadFuer(ziel as never, locale)).toBe(referenz({ href: ziel as never, locale }));
      });
    }
  }

  it('hängt Abfrage und Anker an', () => {
    expect(pfadFuer({ pathname: '/veranstaltungen/[slug]', params: { slug: 'a-b' }, hash: 'anmeldung' }, 'tr')).toBe(
      '/tr/etkinlikler/a-b#anmeldung',
    );
    expect(pfadFuer({ pathname: '/veranstaltungen', query: { kategorie: 'bildung' } }, 'de')).toBe('/veranstaltungen?kategorie=bildung');
    expect(pfadFuer('/', 'de')).toBe('/');
    expect(pfadFuer('/', 'en')).toBe('/en');
  });
});
