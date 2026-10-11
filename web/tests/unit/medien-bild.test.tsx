import type { JSONContent } from '@tiptap/core';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { MedienBild, SIZES_TEXTSPALTE } from '@/components/website/MedienBild';
import { RichText } from '@/components/website/RichText';
import type { BildDaten } from '@/lib/medien/bild';

/**
 * C11b: Gepflegte Bilder erscheinen öffentlich über MedienBild (next/image, ohne Client-JavaScript) und als Bildknoten
 * im Rich-Text. Der Test nutzt die Standardkonfiguration von next/image: Die Musterprüfung gegen `localPatterns`
 * aus next.config.ts läuft unter NODE_ENV=test nicht (next/dist/shared/lib/image-loader.js), die Adresse selbst
 * bleibt `/_next/image?url=/medien/…`. Die Produktionskonfiguration prüft die Sichtprüfung im Browser.
 */
const bild: BildDaten = {
  id: '0f9c0f5c-1b1a-4c9f-9a43-0b6b7b7b7b7b',
  url: '/medien/a1b2c3/testbild-eins.webp',
  breite: 1200,
  hoehe: 800,
  alt: { de: 'Testbild Eins auf Deutsch', en: 'Test image one in English' },
};
const ohneEnglisch: BildDaten = { ...bild, alt: { de: 'Testbild Eins auf Deutsch' } };

/** Rich-Text mit Absatz und einem Bildknoten (wie der Editor ihn speichert: nur `mediumId`). */
const bildDoc = (id: string): JSONContent => ({
  type: 'doc',
  content: [
    { type: 'paragraph', content: [{ type: 'text', text: 'Vor dem Bild' }] },
    { type: 'image', attrs: { mediumId: id } },
  ],
});

describe('MedienBild', () => {
  it('rendert ein img mit Alt-Text der Sprache, Maßen und srcset über /_next/image', () => {
    const html = renderToStaticMarkup(<MedienBild bild={bild} sprache="en" sizes="100vw" />);
    expect(html).toMatch(/^<img /);
    expect(html).toContain('alt="Test image one in English"');
    expect(html).toContain('width="1200"');
    expect(html).toContain('height="800"');
    expect(html).toContain('src="/_next/image?url=%2Fmedien%2Fa1b2c3%2Ftestbild-eins.webp&amp;w=');
    expect(html).toMatch(/srcSet="\/_next\/image\?url=%2Fmedien%2Fa1b2c3%2Ftestbild-eins\.webp&amp;w=\d+&amp;q=\d+ \d+w/);
    expect(html).toContain('sizes="100vw"');
    expect(html).toContain('loading="lazy"');
    expect(html).not.toContain('<link rel="preload"');
    expect(html).not.toContain('lang=');
  });

  it('übernimmt Höhe und Rundung aus className und füllt die Fläche mit object-cover', () => {
    const html = renderToStaticMarkup(<MedienBild bild={bild} sprache="de" sizes="100vw" className="h-40 rounded-lg border-b" />);
    expect(html).toMatch(/class="[^"]*\bblock\b[^"]*\bw-full\b[^"]*\bobject-cover\b[^"]*\bh-40\b[^"]*\brounded-lg\b/);
  });

  it('fällt auf Deutsch zurück und kennzeichnet es mit lang="de", wenn die Sprache fehlt', () => {
    const html = renderToStaticMarkup(<MedienBild bild={ohneEnglisch} sprache="en" sizes="100vw" />);
    expect(html).toContain('alt="Testbild Eins auf Deutsch"');
    expect(html).toContain('lang="de"');
  });

  it('vorladen: eager, hohe Priorität statt lazy', () => {
    const html = renderToStaticMarkup(<MedienBild bild={bild} sprache="de" sizes="100vw" vorladen />);
    expect(html).toContain('loading="eager"');
    expect(html).toContain('fetchPriority="high"');
    expect(html).not.toContain('loading="lazy"');
    // Preload-Hinweis (react-dom preload, Next-Dokumentation: preload) mit dem srcset des Bildes
    expect(html).toMatch(/<link rel="preload" as="image" fetchPriority="high" imageSrcSet="\/_next\/image\?url=%2Fmedien%2F/);
    expect(html).toContain('imageSizes="100vw"');
  });
});

describe('RichText mit Bildknoten', () => {
  it('rendert den Bildknoten als figure mit img, wenn das Bild auf der Seite liegt', () => {
    const html = renderToStaticMarkup(<RichText doc={bildDoc(bild.id)} bilder={{ [bild.id]: bild }} sprache="de" />);
    expect(html).toContain('Vor dem Bild');
    expect(html).toMatch(/<figure><img /);
    expect(html).toContain('alt="Testbild Eins auf Deutsch"');
    expect(html).toContain(`sizes="${SIZES_TEXTSPALTE}"`);
  });

  it('die Sprache des Alt-Textes folgt der Seite', () => {
    const html = renderToStaticMarkup(<RichText doc={bildDoc(bild.id)} bilder={{ [bild.id]: bild }} sprache="en" />);
    expect(html).toContain('alt="Test image one in English"');
  });

  it('erzeugt weder img noch figure für einen Bildknoten ohne Eintrag in bilder', () => {
    const html = renderToStaticMarkup(<RichText doc={bildDoc('ffffffff-0000-4000-8000-000000000000')} bilder={{}} />);
    expect(html).toContain('Vor dem Bild');
    expect(html).not.toContain('<img');
    expect(html).not.toContain('<figure');
  });

  it('andere Aufrufer ohne bilder-Angabe zeigen den Bildknoten wie bisher nicht', () => {
    const html = renderToStaticMarkup(<RichText doc={bildDoc(bild.id)} />);
    expect(html).toContain('Vor dem Bild');
    expect(html).not.toContain('<img');
  });
});
