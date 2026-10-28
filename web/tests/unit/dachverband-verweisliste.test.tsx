import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import texte from '../../messages/bereiche/dachverband.json';

/**
 * Verweisliste (Plan Marktstart, Welle 1): Links mit rel und hrefLang, sichtbarer Sprachhinweis beim Rückfall, Linkname mit
 * Kontext (MUSTER §4), Symbol nur dekorativ; gepflegte Verweise fallen je Feld auf Deutsch zurück (lang="de").
 */
let sprache: 'de' | 'tr' | 'en' = 'de';
vi.mock('next-intl/server', () => ({
  getLocale: async () => sprache,
  getTranslations: async (ns: string) => (schluessel: string) => {
    let wert: unknown = (texte[sprache] as Record<string, unknown>)[ns];
    for (const teil of schluessel.split('.')) wert = (wert as Record<string, unknown>)[teil];
    return String(wert);
  },
}));

const { Verweisliste } = await import('@/components/website/dachverband/Verweisliste');
const zeige = async (props: Parameters<typeof Verweisliste>[0]) => renderToStaticMarkup(await Verweisliste(props));

describe('Verweisliste', () => {
  beforeEach(() => {
    sprache = 'de';
  });

  it('Netzwerk-Ziel auf Deutsch: Link mit rel, hrefLang, Kontext und Beschreibung, Symbol aria-hidden', async () => {
    const html = await zeige({ eintraege: ['freitagspredigt'] });
    expect(html).toContain('href="https://www.igmg.org/freitagspredigt/"');
    expect(html).toContain('hrefLang="de"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain('aria-label="Freitagspredigten der IGMG: externe Seite"');
    expect(html).toContain('min-h-12');
    expect(html).toMatch(/<svg[^>]*aria-hidden="true"/);
    expect(html).toContain(texte.de.dachverband.ziele.freitagspredigt.beschreibung);
    expect(html).not.toContain('(auf');
  });

  it('Rückfall: englische Seite auf IGMG Reisen (nur de/tr) mit sichtbarem Hinweis und hrefLang de', async () => {
    sprache = 'en';
    const html = await zeige({ eintraege: ['reisen'], mitBeschreibung: false });
    expect(html).toContain('href="https://www.igmgreisen.com/de/"');
    expect(html).toContain('hrefLang="de"');
    expect(html).toContain('>(in German)</span>');
    expect(html).toContain('aria-label="IGMG Hajj and Umrah travel (in German): external site"');
    expect(html).not.toMatch(/<p[ >]/);
  });

  it('türkische Seite: eigene Fassung ohne Hinweis; Seite nur auf Türkisch auf Deutsch mit Hinweis', async () => {
    sprache = 'tr';
    const tr = await zeige({ eintraege: ['reisen'] });
    expect(tr).toContain('href="https://www.igmgreisen.com/"');
    expect(tr).toContain('hrefLang="tr"');
    expect(tr).not.toContain('(Almanca)');
    sprache = 'de';
    expect(await zeige({ eintraege: ['kinderclub'] })).toContain('>(auf Türkisch)</span>');
  });

  it('gepflegter Verweis: Titel und Adresse je Sprache, sonst Deutsch mit lang="de" und Hinweis', async () => {
    sprache = 'tr';
    const verweis = {
      titel: { de: 'Broschüre', tr: 'Broşür' },
      beschreibung: { de: 'Kurz erklärt' },
      url: { de: 'https://www.igmg.org/a/' },
    };
    const html = await zeige({ eintraege: [verweis] });
    expect(html).toContain('<span>Broşür</span>');
    expect(html).toContain('<p lang="de"');
    expect(html).toContain('href="https://www.igmg.org/a/"');
    expect(html).toContain('>(Almanca)</span>');
    const eigen = await zeige({ eintraege: [{ ...verweis, url: { de: 'https://www.igmg.org/a/', tr: 'https://www.igmg.org/tr/a/' } }] });
    expect(eigen).toContain('href="https://www.igmg.org/tr/a/"');
    expect(eigen).not.toContain('(Almanca)');
  });
});
