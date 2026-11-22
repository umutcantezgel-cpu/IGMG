import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { istNurPlatzhalter, MitPlatzhaltern } from '@/components/website/Platzhalter';
import { Text } from '@/components/website/Text';

/**
 * Platzhalter der Gemeinde „[…]“: In den Rechtstexten sind sie als solche gekennzeichnet (`MitPlatzhaltern`: gestrichelt,
 * in der zweiten Textfarbe, mit `data-platzhalter`; Sichtabnahme Runde 2, X-9/PR-3). Auf allen anderen öffentlichen Seiten
 * erscheinen sie nicht: `Text` lässt mit `platzhalter` Sätze mit Platzhalter weg – nur auf Wunsch, weil eckige Klammern
 * in Übersetzungen auch Einschübe sein können.
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
  const feld = { de: 'Die Gemeinde lädt ein. Ort: [Ortsangabe – von der Gemeinde].', en: 'Community in [Location]' };

  it('standardmäßig aus: Klammern bleiben gewöhnlicher Text (Einschübe in Übersetzungen)', () => {
    expect(renderToStaticMarkup(<Text feld={feld} sprache="de" />)).toBe(
      '<span>Die Gemeinde lädt ein. Ort: [Ortsangabe – von der Gemeinde].</span>',
    );
  });

  it('eingeschaltet: Sätze mit Platzhalter entfallen, Rückfall-Sprache bleibt', () => {
    expect(renderToStaticMarkup(<Text feld={feld} sprache="tr" als="p" platzhalter />)).toBe('<p lang="de">Die Gemeinde lädt ein.</p>');
  });

  it('eingeschaltet und nichts bleibt übrig: kein Element', () => {
    expect(renderToStaticMarkup(<Text feld={{ de: '[Kurzbeschreibung – von der Gemeinde]' }} sprache="de" als="p" platzhalter />)).toBe('');
  });
});
