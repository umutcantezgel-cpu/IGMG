import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { prerenderToNodeStream } from 'react-dom/static';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { WissensThema } from '@/server/queries/wissen';
import texte from '../../messages/bereiche/wissen.json';

/**
 * Bausteine der Wissens-Entwürfe (Plan Marktstart P5, ADR 0047): die einbettbare `WissenErklaerung` (Titel, Kurztext, „Mehr
 * erfahren“, kompakter Entwurfshinweis; `null`, wenn das Thema nicht sichtbar ist), der Hinweis auf der Themenseite und die
 * Marke „Entwurf“. Texte aus `messages/bereiche/wissen.json`; die Abfrage ist ersetzt.
 */
type Sprache = 'de' | 'tr' | 'en';
let sprache: Sprache = 'de';
vi.mock('next-intl/server', () => ({
  getLocale: async () => sprache,
  getTranslations: async (arg: string | { locale: Sprache; namespace: string }) => {
    const { locale, namespace } = typeof arg === 'string' ? { locale: sprache, namespace: arg } : arg;
    return (schluessel: string) => {
      let wert: unknown = texte[locale];
      for (const teil of `${namespace}.${schluessel}`.split('.')) wert = (wert as Record<string, unknown>)[teil];
      return String(wert);
    };
  },
}));

const themen = new Map<string, WissensThema>();
vi.mock('@/server/queries/wissen', () => ({ ladeWissensThema: async (slug: string) => themen.get(slug) ?? null }));

const { WissenErklaerung } = await import('@/components/website/wissen/WissenErklaerung');
const { EntwurfHinweis } = await import('@/components/website/wissen/EntwurfHinweis');
const { EntwurfMarke } = await import('@/components/website/wissen/EntwurfMarke');

async function alsHtml(ui: ReactNode): Promise<string> {
  const { prelude } = await prerenderToNodeStream(ui);
  let html = '';
  for await (const teil of prelude) html += String(teil);
  // Trenner zwischen benachbarten Textknoten (React) entfernen
  return html.replaceAll('<!-- -->', '');
}

const thema = (slug: string, werte: Partial<WissensThema> = {}): WissensThema => ({
  id: slug,
  slug,
  titel: { de: 'Hadsch und Umra', tr: 'Hac ve Umre', en: 'Hajj and Umrah' },
  kurztext: { de: 'Kurzer Testtext.', tr: 'Kısa deneme metni.', en: 'Short test text.' },
  inhalt: null,
  sortierung: 13,
  istBeispiel: true,
  aktualisiertAm: '2026-10-28T00:00:00.000Z',
  entwurf: false,
  kiEntwurf: false,
  ...werte,
});

describe('WissenErklaerung (einbettbar)', () => {
  beforeEach(() => {
    sprache = 'de';
    themen.clear();
  });

  it('KI-Entwurf: Titel, kompakter Hinweis vor dem Kurztext, „Mehr erfahren“ mit Kontext auf die Themenseite', async () => {
    themen.set('hajj-umrah', thema('hajj-umrah', { entwurf: true, kiEntwurf: true }));
    const html = await alsHtml(await WissenErklaerung({ slug: 'hajj-umrah' }));
    const w = texte.de.wissen.entwurf;
    expect(html).toContain('data-wissen-erklaerung="hajj-umrah"');
    expect(html).toMatch(/<h2 id="wissen-erklaerung-hajj-umrah"[^>]*>Hadsch und Umra<\/h2>/);
    expect(html).toContain('data-wissen-entwurf="kompakt"');
    expect(html).toContain(`<strong>${w.titel}</strong> ${w.kompaktKi}`);
    expect(html.indexOf(w.titel)).toBeLessThan(html.indexOf('Kurzer Testtext.'));
    expect(html).toContain('href="/islamisches-wissen/hajj-umrah"');
    expect(html).toContain(`aria-label="${w.mehr}: Hadsch und Umra"`);
    expect(html).toContain('min-h-12');
    expect(html).toMatch(/<svg[^>]*aria-hidden="true"/);
  });

  it('von der Redaktion bearbeiteter Entwurf: Hinweis ohne KI-Angabe; geprüftes Thema: kein Hinweis', async () => {
    themen.set('a', thema('a', { entwurf: true, kiEntwurf: false }));
    themen.set('b', thema('b'));
    const a = await alsHtml(await WissenErklaerung({ slug: 'a' }));
    expect(a).toContain(texte.de.wissen.entwurf.kompakt);
    expect(a).not.toContain(texte.de.wissen.entwurf.kompaktKi);
    const b = await alsHtml(await WissenErklaerung({ slug: 'b' }));
    expect(b).not.toContain('data-wissen-entwurf');
    expect(b).not.toContain(texte.de.wissen.entwurf.titel);
    expect(b).toContain('Kurzer Testtext.');
  });

  it('nicht sichtbar (Schalter aus und ungeprüft, Papierkorb, unbekannt): nichts', async () => {
    expect(await WissenErklaerung({ slug: 'fehlt' })).toBeNull();
  });

  it('Türkisch mit Überschrift Ebene 3; fehlende Übersetzung fällt sichtbar auf Deutsch zurück (lang="de")', async () => {
    sprache = 'tr';
    themen.set('friday-prayer', thema('friday-prayer', { entwurf: true, kiEntwurf: true, kurztext: { de: 'Nur Deutsch.' } }));
    const html = await alsHtml(await WissenErklaerung({ slug: 'friday-prayer', ebene: 3 }));
    expect(html).toMatch(/<h3 id="wissen-erklaerung-friday-prayer"[^>]*>Hac ve Umre<\/h3>/);
    expect(html).toContain(texte.tr.wissen.entwurf.kompaktKi);
    expect(html).toContain('<p lang="de"');
    expect(html).toContain('Nur Deutsch.');
    expect(html).toContain('href="/tr/islami-bilgiler/friday-prayer"');
    expect(html).toContain(`aria-label="${texte.tr.wissen.entwurf.mehr}: Hac ve Umre"`);
  });

  it('Sprache ausdrücklich gewählt: Texte in dieser Sprache', async () => {
    themen.set('hajj-umrah', thema('hajj-umrah', { entwurf: true, kiEntwurf: true }));
    const html = await alsHtml(await WissenErklaerung({ slug: 'hajj-umrah', sprache: 'en' }));
    expect(html).toContain('>Hajj and Umrah</h2>');
    expect(html).toContain(texte.en.wissen.entwurf.titel);
    expect(html).toContain('Short test text.');
  });
});

describe('EntwurfHinweis und EntwurfMarke', () => {
  it('Hinweis der Themenseite: Bereich mit Namen, Überschrift und Text, Zeichen nur Schmuck', () => {
    const w = texte.de.wissen.entwurf;
    const html = renderToStaticMarkup(<EntwurfHinweis titel={w.titel} text={w.textKi} />);
    expect(html).toContain(`aria-label="${w.titel}"`);
    expect(html).toContain('data-wissen-entwurf="hinweis"');
    expect(html).toContain(`<h2 class="text-18 font-bold">${w.titel}</h2>`);
    expect(html).toContain(w.textKi);
    expect(html).toMatch(/<svg[^>]*aria-hidden="true"/);
  });

  it('Marke: sichtbarer Text in den Warn-Tokens', () => {
    const html = renderToStaticMarkup(<EntwurfMarke text="Entwurf" />);
    expect(html).toContain('data-wissen-entwurf-marke=""');
    expect(html).toContain('bg-warnung-toenung');
    expect(html).toContain('text-warnung');
    expect(html).toMatch(/<\/svg>Entwurf<\/span>$/);
  });

  it('Texte in allen drei Sprachen vorhanden und ohne Platzhalter', () => {
    for (const s of ['de', 'tr', 'en'] as const)
      for (const [k, v] of Object.entries(texte[s].wissen.entwurf)) {
        expect(v.trim().length, `${s}.${k}`).toBeGreaterThan(1);
        expect(v, `${s}.${k}`).not.toMatch(/\[|\{/);
      }
  });
});
