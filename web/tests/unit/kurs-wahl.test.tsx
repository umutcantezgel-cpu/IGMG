import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { KursWahl } from '@/components/website/formulare/KursWahl';

/**
 * Gewünschter Kurs der Voranmeldung (F-44): Die statische Seite rendert auf dem Server nichts (der Kurs steht erst im
 * Browser fest); in späteren Schritten kommt er vom Server als Wert. Nur erlaubte Kurse erzeugen das versteckte Feld.
 */
const kurse = { 'elifbe-kinder': { titel: 'Elifbe für Kinder' }, 'koran-lesen': { titel: 'Koran lesen', lang: 'de' } };
const vorlage = 'Voranmeldung für den Kurs: {titel}';

describe('KursWahl', () => {
  it('ohne Wert auf dem Server: nichts (Adresse liest erst der Browser)', () => {
    expect(renderToStaticMarkup(<KursWahl kurse={kurse} vorlage={vorlage} />)).toBe('');
  });

  it('erlaubter Kurs: verstecktes Feld und Satz, Titel mit Sprache beim Rückfall', () => {
    const html = renderToStaticMarkup(<KursWahl kurse={kurse} vorlage={vorlage} wert="koran-lesen" />);
    expect(html).toContain('<input type="hidden" name="kurs" value="koran-lesen"/>');
    expect(html).toContain('Voranmeldung für den Kurs: <span lang="de">Koran lesen</span>');
  });

  it('unbekannter Kurs oder Eigenschaften des Objekts: nichts', () => {
    for (const wert of ['gibt-es-nicht', 'constructor', '__proto__', ''])
      expect(renderToStaticMarkup(<KursWahl kurse={kurse} vorlage={vorlage} wert={wert} />)).toBe('');
  });
});
