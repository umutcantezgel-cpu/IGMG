import { getImageProps } from 'next/image';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Bild, bildAttribute } from '@/components/website/Bild';

/**
 * Bild (Z-08): dieselben img-Attribute wie next/image, aber als Server-Komponente ohne das Client-JavaScript der
 * Image-Komponente. Standardkonfiguration von next/image im Test (Adresse über /_next/image).
 */
const LOGO = '/bilder/logos/logo-igmg-wetzlar.png';

describe('Bild', () => {
  it('img mit Attributen von getImageProps, ohne Markierung der Client-Komponente', () => {
    const html = renderToStaticMarkup(<Bild src={LOGO} alt="" width={40} height={40} className="size-10" />);
    expect(html).toMatch(/^<img /);
    expect(html).toContain('alt=""');
    expect(html).toContain('width="40"');
    expect(html).toContain('height="40"');
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('class="size-10"');
    expect(html).toContain('src="/_next/image?url=%2Fbilder%2Flogos%2Flogo-igmg-wetzlar.png&amp;w=96&amp;q=75"');
    expect(html).toMatch(/srcSet="[^"]*w=48[^"]* 1x, [^"]*w=96[^"]* 2x"/);
    expect(html).not.toContain('data-nimg');
  });

  it('preload: nicht träge geladen (wie <Image preload>)', () => {
    const html = renderToStaticMarkup(<Bild src={LOGO} alt="" width={40} height={40} preload />);
    expect(html).not.toContain('loading=');
  });

  it('bildAttribute liefert die Attribute von getImageProps (für Client-Komponenten)', () => {
    const eingabe = { src: LOGO, alt: '', width: 32, height: 32 };
    expect(bildAttribute(eingabe)).toEqual(getImageProps(eingabe).props);
  });
});
