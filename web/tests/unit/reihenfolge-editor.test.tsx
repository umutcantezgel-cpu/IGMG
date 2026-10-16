import { NextIntlClientProvider } from 'next-intl';
import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ReihenfolgeEditor } from '@/components/verwaltung/reihenfolge/ReihenfolgeEditor';
import startseite from '../../messages/verwaltung/startseite.json';
import wissen from '../../messages/verwaltung/wissen.json';

/**
 * Reihenfolge-Editor (F-40, Nacharbeit 2 Feinschliff): Die Seite trägt die h1; der Editor setzt eine h2 über die Liste,
 * die Einträge sind h3 – keine Lücke h1 → h3 (axe best-practice „heading-order“). Server-Rendering mit den echten
 * Texten; Verschieben und die Speicherleiste (scroll-padding) prüft der Browser.
 */
function rendere(ui: ReactElement): string {
  return renderToStaticMarkup(
    <NextIntlClientProvider
      locale="de"
      timeZone="Europe/Berlin"
      messages={{ verwaltung: { startseite: startseite.startseite, wissen: wissen.wissen } }}
    >
      {ui}
    </NextIntlClientProvider>,
  );
}

const aktion = async () => ({});
const ebenen = (html: string) => [...html.matchAll(/<h([1-6])\b/g)].map((m) => Number(m[1]));

describe('ReihenfolgeEditor: Überschriftenfolge', () => {
  it('Startseite (mit festem Kopf): h2 „Abschnitte der Startseite“ vor allen h3, Liste danach benannt', () => {
    const html = rendere(
      <ReihenfolgeEditor
        aktion={aktion}
        namensraum="verwaltung.startseite.editor"
        mitSichtbarkeit
        fest={{ titel: 'Kopf', beschreibung: 'Beschreibung', marke: 'fest' }}
        eintraege={[
          { schluessel: 'a', titel: 'Eintrag A', sichtbar: true },
          { schluessel: 'b', titel: 'Eintrag B', sichtbar: false },
        ]}
      />,
    );
    expect(ebenen(html)).toEqual([2, 3, 3, 3]);
    const h2 = /<h2 id="([^"]+)" class="sr-only">([^<]+)<\/h2>/.exec(html);
    expect(h2?.[2]).toBe(startseite.startseite.editor.ueberschrift);
    expect(html).toContain(`<ol aria-labelledby="${h2?.[1]}"`);
  });

  it('Islamisches Wissen: h2 „Reihenfolge der Themen“, Einträge h3', () => {
    const html = rendere(
      <ReihenfolgeEditor
        aktion={aktion}
        namensraum="verwaltung.wissen.editor"
        eintraege={[
          { schluessel: 'x', titel: 'Thema X' },
          { schluessel: 'y', titel: 'Thema Y' },
        ]}
      />,
    );
    expect(ebenen(html)).toEqual([2, 3, 3]);
    expect(html).toContain(`>${wissen.wissen.editor.ueberschrift}</h2>`);
  });
});
