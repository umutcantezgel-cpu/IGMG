import type { ReactNode } from 'react';
import { prerenderToNodeStream } from 'react-dom/static';
import { describe, expect, it, vi } from 'vitest';
import type { TitelTreffer } from '@/lib/suche/titelindex';
import texte from '../../messages/bereiche/wissen.json';

/**
 * Trefferliste der Titel-Suche ohne Datenbank (`TitelTrefferliste`, ADR 0047 Nr. 7): Wissensthemen „zur Prüfung“ tragen
 * die Marke „Entwurf“ wie in der Trefferliste der Volltextsuche; geprüfte Themen und andere Arten nicht. Der Text der Marke
 * kommt aus `messages/bereiche/wissen.json`, alle übrigen Texte stehen als Schlüssel. Treffer fiktiv.
 */
vi.mock('next-intl/server', () => ({
  getLocale: async () => 'tr',
  getTranslations: async (namensraum: string) => (schluessel: string) =>
    namensraum === 'wissen.entwurf' ? texte.tr.wissen.entwurf[schluessel as 'marke'] : `${namensraum}.${schluessel}`,
}));

const { TitelTrefferliste } = await import('@/components/website/suche/TitelTrefferliste');

async function alsHtml(ui: ReactNode): Promise<string> {
  const { prelude } = await prerenderToNodeStream(ui);
  let html = '';
  for await (const teil of prelude) html += String(teil);
  return html.replaceAll('<!-- -->', '');
}

/** Karten der Liste: Titel und ob die Marke „Entwurf“ darin steht. */
function karten(html: string): [string, boolean][] {
  return [...html.matchAll(/<article[^>]*>([\s\S]*?)<\/article>/g)].map((m) => [
    /<a [^>]*>([^<]*)<\/a>/.exec(m[1])?.[1] ?? '',
    m[1].includes('data-wissen-entwurf-marke'),
  ]);
}

describe('TitelTrefferliste', () => {
  it('Wissensthema „zur Prüfung“ mit Marke „Entwurf“, geprüftes Thema und Neuigkeit ohne', async () => {
    const treffer: TitelTreffer[] = [
      { art: 'nachricht', titel: 'Testnachricht', slug: 'testnachricht' },
      { art: 'wissen', titel: 'Testthema geprüft', slug: 'testthema-geprueft' },
      { art: 'wissen', titel: 'Testthema Entwurf', slug: 'testthema-entwurf', entwurf: true },
    ];
    const html = await alsHtml(await TitelTrefferliste({ treffer }));
    expect(karten(html)).toEqual([
      ['Testnachricht', false],
      ['Testthema geprüft', false],
      ['Testthema Entwurf', true],
    ]);
    expect(html).toContain(`${texte.tr.wissen.entwurf.marke}</span>`);
    expect(html).toContain('href="/tr/islami-bilgiler/testthema-entwurf"');
  });
});
