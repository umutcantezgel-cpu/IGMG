import { createTranslator } from 'next-intl';
import { describe, expect, it } from 'vitest';
import de from '../../messages/de.json';
import en from '../../messages/en.json';
import tr from '../../messages/tr.json';

/** Pluralformen in Texten mit Zahlen (ICU): „1 Platz“, nicht „1 Plätze“. */
describe('Pluralformen', () => {
  const hinweis = (locale: 'de' | 'en' | 'tr', messages: typeof de, n: number) =>
    createTranslator({ locale, messages, namespace: 'veranstaltung.formular' })('personenHinweis', { verfuegbar: n });

  it('freie Plätze in de, en, tr', () => {
    expect([0, 1, 2].map((n) => hinweis('de', de, n))).toEqual(['Noch 0 Plätze frei.', 'Noch 1 Platz frei.', 'Noch 2 Plätze frei.']);
    expect([1, 5].map((n) => hinweis('en', en as typeof de, n))).toEqual(['1 place left.', '5 places left.']);
    expect(hinweis('tr', tr as typeof de, 3)).toBe('3 yer kaldı.');
  });
});
