import { NextIntlClientProvider } from 'next-intl';
import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { BildFeld } from '@/components/verwaltung/medienwahl/BildFeld';
import { filtereBilder, MedienWahlDialog, wahlWarteschlange } from '@/components/verwaltung/medienwahl/MedienWahlDialog';
import type { BildWahl } from '@/server/queries/verwaltung/medien';
import medienwahl from '../../messages/verwaltung/medienwahl.json';

/** Testdaten sind erkennbar fiktiv (Testbild Eins und Zwei). */
const ID_A = '6a1f0c2e-7b3d-4e5f-8a9b-0c1d2e3f4a01';
const ID_B = '6a1f0c2e-7b3d-4e5f-8a9b-0c1d2e3f4a02';
const NICHT_IN_LISTE = '6a1f0c2e-7b3d-4e5f-8a9b-0c1d2e3f4a99';

const bild = (id: string, alt: string, dateiname: string | null): BildWahl => ({
  id,
  url: `/medien/testbild/${dateiname ?? 'ohne-name.jpg'}`,
  alt,
  breite: 1200,
  hoehe: 800,
  dateiname,
});
const BILDER = [bild(ID_A, 'Testbild Eins – Saal', 'testbild-eins.jpg'), bild(ID_B, 'Testbild Zwei – Foyer', 'testbild-zwei.png')];

/** Server-Rendering mit den echten Texten; Interaktion braucht den Browser und wird dort geprüft. */
function rendere(ui: ReactElement): string {
  return renderToStaticMarkup(
    <NextIntlClientProvider locale="de" timeZone="Europe/Berlin" messages={{ verwaltung: { medienwahl: medienwahl.medienwahl } }}>
      {ui}
    </NextIntlClientProvider>,
  );
}

describe('Mediathek-Auswahl: Filter', () => {
  it('findet nach Alt-Text ohne Groß- und Kleinschreibung', () => {
    expect(filtereBilder(BILDER, 'SAAL').map((b) => b.id)).toEqual([ID_A]);
  });

  it('findet nach Dateiname', () => {
    expect(filtereBilder(BILDER, 'zwei.png').map((b) => b.id)).toEqual([ID_B]);
  });

  it('leerer Filter und Leerraum zeigen alle Bilder', () => {
    expect(filtereBilder(BILDER, '')).toHaveLength(2);
    expect(filtereBilder(BILDER, '   ')).toHaveLength(2);
  });

  it('ohne Treffer bleibt die Liste leer; ein fehlender Dateiname schließt nichts aus', () => {
    expect(filtereBilder(BILDER, 'nichts-passt')).toEqual([]);
    expect(filtereBilder([bild(ID_A, 'Testbild Eins – Saal', null)], 'saal')).toHaveLength(1);
  });
});

describe('Mediathek-Auswahl: Antwort (Auswahl, Abbrechen, Escape)', () => {
  it('Auswahl liefert die Medien-ID', async () => {
    const warte = wahlWarteschlange();
    const antwort = warte.oeffnen();
    warte.beenden({ mediumId: ID_A });
    await expect(antwort).resolves.toEqual({ mediumId: ID_A });
  });

  it('Abbrechen und Escape liefern null', async () => {
    const warte = wahlWarteschlange();
    const antwort = warte.oeffnen();
    warte.beenden(null);
    await expect(antwort).resolves.toBeNull();
  });

  it('erneutes Öffnen beendet den offenen Vorgang mit null', async () => {
    const warte = wahlWarteschlange();
    const erster = warte.oeffnen();
    const zweiter = warte.oeffnen();
    await expect(erster).resolves.toBeNull();
    warte.beenden({ mediumId: ID_B });
    await expect(zweiter).resolves.toEqual({ mediumId: ID_B });
  });

  it('Schließen ohne offenen Vorgang ist folgenlos', () => {
    expect(() => wahlWarteschlange().beenden(null)).not.toThrow();
  });
});

describe('Bildfeld: Zustände', () => {
  it('ohne Bild: leeres verborgenes Feld, Knopf „Bild wählen“, kein Entfernen, Hinweis auf den Platzhalter', () => {
    const html = rendere(<BildFeld id="bild" bilder={BILDER} startwert="" />);
    expect(html).toMatch(/<input(?=[^>]*name="bildId")(?=[^>]*value="")[^>]*>/);
    expect(html).toContain('Bild wählen');
    expect(html).not.toContain('Bild entfernen');
    expect(html).toContain('Kein Bild gewählt');
  });

  it('mit Bild: verborgenes Feld trägt die ID, Vorschau mit Alt-Text, Knöpfe „Anderes Bild wählen“ und „Bild entfernen“', () => {
    const html = rendere(<BildFeld id="bild" bilder={BILDER} startwert={ID_A} />);
    expect(html).toContain(`value="${ID_A}"`);
    expect(html).toContain('alt="Testbild Eins – Saal"');
    expect(html).toContain('Anderes Bild wählen');
    expect(html).toContain('Bild entfernen');
    expect(html).not.toContain('Kein Bild gewählt');
  });

  it('Startwert nicht in der Liste (etwa im Papierkorb): Hinweis, der Wert bleibt und ist entfernbar', () => {
    const html = rendere(<BildFeld id="bild" bilder={BILDER} startwert={NICHT_IN_LISTE} />);
    expect(html).toContain('Das gewählte Bild ist nicht mehr in der Mediathek.');
    expect(html).toContain(`value="${NICHT_IN_LISTE}"`);
    expect(html).toContain('Bild entfernen');
  });

  it('Fehler am Feld: aria-invalid, Beschreibung verweist auf Hinweis und Fehler', () => {
    const html = rendere(<BildFeld id="bild" bilder={BILDER} startwert={ID_A} fehler="Das Bild ist nicht mehr verfügbar." />);
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain('aria-describedby="bild-hinweis bild-fehler"');
    expect(html).toContain('id="bild-fehler"');
    expect(html).toContain('Das Bild ist nicht mehr verfügbar.');
  });
});

describe('Mediathek-Dialog: Darstellung', () => {
  it('Titel, Filterfeld, benannte Bildknöpfe, Link zur Mediathek und Abbrechen', () => {
    const html = rendere(<MedienWahlDialog bilder={BILDER} />);
    expect(html).toContain('Bild aus der Mediathek wählen');
    expect(html).toContain('Nach Alt-Text oder Dateiname filtern');
    expect(html).toContain('aria-label="Auswählen: Testbild Eins – Saal"');
    expect(html).toContain('href="/verwaltung/medien"');
    expect(html).toContain('Neues Bild in der Mediathek hochladen');
    expect(html).toContain('Abbrechen');
  });

  it('Hinweis erst bei Erreichen der Grenze von 300 Bildern', () => {
    const viele = Array.from({ length: 300 }, (_, i) =>
      bild(`00000000-0000-4000-8000-${String(i).padStart(12, '0')}`, `Testbild ${i}`, null),
    );
    expect(rendere(<MedienWahlDialog bilder={viele} />)).toContain('Angezeigt werden die 300 neuesten Bilder.');
    expect(rendere(<MedienWahlDialog bilder={BILDER} />)).not.toContain('neuesten Bilder');
  });

  it('leere Mediathek: Hinweis statt Raster', () => {
    const html = rendere(<MedienWahlDialog bilder={[]} />);
    expect(html).toContain('Noch keine Bilder in der Mediathek.');
    expect(html).not.toContain('aria-label="Auswählen');
  });
});
