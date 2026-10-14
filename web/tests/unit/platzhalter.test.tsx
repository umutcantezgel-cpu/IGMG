import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { istNurPlatzhalter, MitPlatzhaltern } from '@/components/website/Platzhalter';
import { Text } from '@/components/website/Text';

/**
 * Sichtabnahme Runde 2 (X-9, PR-3): Platzhalter der Gemeinde „[…]“ sind als solche gekennzeichnet – gestrichelt, in der
 * zweiten Textfarbe, mit `data-platzhalter`. `Text` tut das nur auf Wunsch (`platzhalter`), weil eckige Klammern in
 * Übersetzungen auch Einschübe sein können.
 */
describe('Platzhalter', () => {
  it('MitPlatzhaltern setzt jeden Platzhalter einzeln, der übrige Text bleibt', () => {
    const html = renderToStaticMarkup(<MitPlatzhaltern text="Die Moschee in [Ort] ist eröffnet. [Datum]" />);
    expect(html.match(/data-platzhalter/g)).toHaveLength(2);
    expect(html).toContain('Die Moschee in <span data-platzhalter="true" class="');
    expect(html).toContain('>[Ort]</span> ist eröffnet. <span');
    expect(html).toContain('border-dashed');
    expect(html).toContain('text-tinte-2');
  });

  it('ohne Klammern kein Platzhalter', () => {
    expect(renderToStaticMarkup(<MitPlatzhaltern text="März 2024" />)).toBe('März 2024');
  });

  it('istNurPlatzhalter erkennt reine Platzhalter wie „[Datum]“', () => {
    expect(istNurPlatzhalter('[Datum]')).toBe(true);
    expect(istNurPlatzhalter(' [Tarih] ')).toBe(true);
    expect(istNurPlatzhalter('April 2024')).toBe(false);
    expect(istNurPlatzhalter('Eröffnung: [Datum]')).toBe(false);
    expect(istNurPlatzhalter('[a] [b]')).toBe(false);
  });
});

describe('Text mit `platzhalter`', () => {
  const feld = { de: 'Gemeinde in [Ortsangabe – von der Gemeinde]', en: 'Community in [Location]' };

  it('standardmäßig aus: Klammern bleiben gewöhnlicher Text', () => {
    expect(renderToStaticMarkup(<Text feld={feld} sprache="de" />)).toBe('<span>Gemeinde in [Ortsangabe – von der Gemeinde]</span>');
  });

  it('eingeschaltet: Platzhalter gekennzeichnet, Rückfall-Sprache bleibt', () => {
    const html = renderToStaticMarkup(<Text feld={feld} sprache="tr" als="p" platzhalter />);
    expect(html.startsWith('<p lang="de">Gemeinde in <span data-platzhalter')).toBe(true);
    expect(html).toContain('>[Ortsangabe – von der Gemeinde]</span></p>');
  });
});
