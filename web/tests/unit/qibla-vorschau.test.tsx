import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { QiblaKompassAnsicht, type QiblaKompassTexte } from '@/components/website/gebetszeiten/QiblaKompassAnsicht';

/**
 * P4 (echte E2E, welle-a/gebetszeiten „Qibla“ auf dem Telefon): Bis der Kompass im Browser geladen ist, steht die
 * Vorschau vom Server – dieselbe Ansicht ohne Handler. Ihr Knopf „Kompass aktivieren“ war bedienbar, ein Druck in dieser
 * Zeit ging ohne Wirkung verloren. Jetzt ist ein Knopf ohne Aktion gesperrt; der geladene Kompass gibt ihn frei.
 */
const texte: QiblaKompassTexte = {
  dialAria: 'Richtung',
  dialNord: 'N',
  winkelKurz: '120°',
  aktivieren: 'Kompass aktivieren',
  beenden: 'Kompass beenden',
  hinweis: 'Hinweis',
  startet: 'startet',
  aktiv: 'aktiv',
  verweigert: 'verweigert',
  fehlt: 'fehlt',
};

function knopf(html: string): string {
  return html.slice(html.indexOf('<button'), html.indexOf('</button>'));
}

describe('Qibla-Kompass: Vorschau ohne Aktion', () => {
  it('sperrt den Knopf der Vorschau (ohne onKnopf)', () => {
    const html = renderToStaticMarkup(
      <QiblaKompassAnsicht winkel={120} texte={texte} symbol={null} knopfText={texte.aktivieren} hinweisZeigen statusText="" />,
    );
    expect(knopf(html)).toContain('disabled=""');
    expect(knopf(html)).toContain(texte.aktivieren);
  });

  it('gibt den Knopf mit Aktion frei, solange nichts läuft', () => {
    const html = renderToStaticMarkup(
      <QiblaKompassAnsicht
        winkel={120}
        texte={texte}
        symbol={null}
        knopfText={texte.aktivieren}
        onKnopf={() => {}}
        hinweisZeigen
        statusText=""
      />,
    );
    expect(knopf(html)).not.toContain('disabled=""');
  });

  it('sperrt den Knopf mit Aktion, während der Kompass startet', () => {
    const html = renderToStaticMarkup(
      <QiblaKompassAnsicht
        winkel={120}
        texte={texte}
        symbol={null}
        knopfText={texte.aktivieren}
        onKnopf={() => {}}
        knopfGesperrt
        hinweisZeigen={false}
        statusText={texte.startet}
      />,
    );
    expect(knopf(html)).toContain('disabled=""');
  });
});
