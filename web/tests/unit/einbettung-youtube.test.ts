import { describe, expect, it } from 'vitest';
import { YOUTUBE_ID, youtubeEinbettung, youtubeIdAus, youtubeLink } from '@/lib/einbettung/youtube';

/**
 * YouTube nur nach Klick (K-14, Plan Marktstart): Die ID kommt aus eingefügten Adressen; eingebettet wird nur über
 * youtube-nocookie, verlinkt auf youtube.com. Ungültige IDs erzeugen keine Adresse.
 */
const ID = 'eYOO4BNqx0Q';

describe('youtubeIdAus', () => {
  it.each([
    [ID],
    [`  ${ID}\n`],
    [`https://youtu.be/${ID}`],
    [`https://youtu.be/${ID}?si=abc`],
    [`youtu.be/${ID}`],
    [`https://www.youtube.com/watch?v=${ID}`],
    [`http://www.youtube.com/watch?feature=share&v=${ID}`],
    [`youtube.com/watch?v=${ID}`],
    [`https://m.youtube.com/watch?v=${ID}`],
    [`https://www.youtube.com/embed/${ID}`],
    [`https://www.youtube-nocookie.com/embed/${ID}?autoplay=1`],
    [`https://www.youtube.com/shorts/${ID}`],
  ])('%s → ID', (eingabe) => {
    expect(youtubeIdAus(eingabe)).toBe(ID);
  });

  it.each([
    [''],
    ['zu-kurz'],
    [`${ID}1`],
    ['ab cd ef ghi'],
    [`https://example.com/watch?v=${ID}`],
    [`https://youtube.com.example/watch?v=${ID}`],
    [`https://www.youtube.com/watch?v=${ID}1`],
    [`https://www.youtube.com/watch`],
    [`https://www.youtube.com/embed/${ID}/extra`],
    [`https://www.youtube.com/@igmgorg`],
    [`ftp://youtu.be/${ID}`],
    ['javascript:alert(1)'],
  ])('%s → null', (eingabe) => {
    expect(youtubeIdAus(eingabe)).toBeNull();
  });
});

describe('Adressen aus der ID', () => {
  it('Einbettung über youtube-nocookie mit Autostart (der Klick war die Absicht) und ohne fremde Vorschläge', () => {
    expect(youtubeEinbettung(ID)).toBe(`https://www.youtube-nocookie.com/embed/${ID}?autoplay=1&rel=0`);
  });

  it('Link „Auf YouTube ansehen“ auf youtube.com', () => {
    expect(youtubeLink(ID)).toBe(`https://www.youtube.com/watch?v=${ID}`);
  });

  it('ungültige IDs ergeben keine Adresse (Programmierfehler)', () => {
    for (const falsch of ['', 'x', `${ID}"`, '../../etwas']) {
      expect(YOUTUBE_ID.test(falsch)).toBe(false);
      expect(() => youtubeEinbettung(falsch)).toThrow();
      expect(() => youtubeLink(falsch)).toThrow();
    }
  });
});
