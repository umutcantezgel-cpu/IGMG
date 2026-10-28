import { describe, expect, it } from 'vitest';
import { HTTPS_URL as HTTPS_URL_WEITER } from '@/lib/validierung/seiteninhalte';
import { HTTPS_URL, datumIso, igmgUrl, mehrsprachigeUrl, verweis, youtubeId } from '@/lib/validierung/url';

/**
 * Bausteine für Adressen und Kalendertage (Plan Marktstart, Welle 1): `HTTPS_URL` liegt in `url.ts` und wird von
 * `seiteninhalte.ts` unverändert weitergereicht; dazu Verweise je Sprache, Kalendertage, YouTube-IDs und IGMG-Adressen.
 */
describe('HTTPS_URL', () => {
  it('ist dasselbe Schema wie der Weiterexport aus seiteninhalte.ts', () => {
    expect(HTTPS_URL_WEITER).toBe(HTTPS_URL);
  });

  it('nimmt nur https mit Host an (keine javascript:-, data:- oder http-Links)', () => {
    expect(HTTPS_URL.safeParse('https://www.igmg.org/').success).toBe(true);
    for (const falsch of ['http://www.igmg.org/', 'javascript:alert(1)', 'data:text/html,x', 'https://', 'www.igmg.org', ''])
      expect(HTTPS_URL.safeParse(falsch).success, falsch).toBe(false);
  });
});

describe('mehrsprachigeUrl und verweis', () => {
  it('Deutsch Pflicht, Türkisch und Englisch optional', () => {
    expect(mehrsprachigeUrl.safeParse({ de: 'https://a.example/' }).success).toBe(true);
    expect(mehrsprachigeUrl.safeParse({ de: 'https://a.example/', tr: 'https://a.example/tr/' }).success).toBe(true);
    expect(mehrsprachigeUrl.safeParse({ tr: 'https://a.example/tr/' }).success).toBe(false);
    expect(mehrsprachigeUrl.safeParse({ de: 'https://a.example/', en: 'http://a.example/en/' }).success).toBe(false);
  });

  it('Verweis mit Titel (Deutsch Pflicht, höchstens 160 Zeichen), Beschreibung optional', () => {
    const gut = { titel: { de: 'IGMG' }, url: { de: 'https://www.igmg.org/' } };
    expect(verweis.safeParse(gut).success).toBe(true);
    expect(verweis.safeParse({ ...gut, beschreibung: { de: '', tr: 'Kısa' } }).success).toBe(true);
    expect(verweis.safeParse({ ...gut, titel: { de: '' } }).success).toBe(false);
    expect(verweis.safeParse({ ...gut, titel: { de: 'x'.repeat(161) } }).success).toBe(false);
    expect(verweis.safeParse({ ...gut, beschreibung: { de: 'x'.repeat(301) } }).success).toBe(false);
  });
});

describe('datumIso', () => {
  it('nimmt kalendergültige Tage JJJJ-MM-TT an, auch den Schalttag', () => {
    for (const tag of ['2026-10-27', '2026-01-31', '2028-02-29', '2000-02-29']) expect(datumIso.safeParse(tag).success, tag).toBe(true);
  });

  it('lehnt unmögliche Tage und andere Formate ab', () => {
    for (const tag of ['2026-02-29', '2026-02-30', '2026-04-31', '2026-13-01', '1900-02-29', '27.10.2026', '2026-10-27T12:00', '2026-1-5'])
      expect(datumIso.safeParse(tag).success, tag).toBe(false);
  });
});

describe('youtubeId', () => {
  const ID = 'ytTuELK2slU';

  it('nimmt die ID und eingefügte Adressen an und speichert nur die ID', () => {
    for (const eingabe of [
      ID,
      ` ${ID} `,
      `https://youtu.be/${ID}`,
      `youtu.be/${ID}`,
      `https://www.youtube.com/watch?v=${ID}`,
      `https://youtube.com/watch?v=${ID}&t=42s`,
      `https://m.youtube.com/watch?v=${ID}`,
      `https://www.youtube.com/embed/${ID}`,
      `https://www.youtube-nocookie.com/embed/${ID}?rel=0`,
      `https://www.youtube.com/shorts/${ID}`,
    ])
      expect(youtubeId.parse(eingabe), eingabe).toBe(ID);
  });

  it('lehnt fremde Hosts, falsche Längen und andere Pfade ab', () => {
    for (const eingabe of [
      'abc',
      `${ID}x`,
      `https://example.com/watch?v=${ID}`,
      `https://www.youtube.com/channel/${ID}`,
      `https://www.youtube.com/watch?v=${ID}x`,
      `https://youtu.be/${ID}/x`,
      'javascript:alert(1)',
      '',
      42,
    ])
      expect(youtubeId.safeParse(eingabe).success, String(eingabe)).toBe(false);
  });
});

describe('igmgUrl', () => {
  it('nimmt Adressen des Dachverbands, von IGMG Reisen und den Fachvereinen an', () => {
    for (const adresse of [
      'https://www.igmg.org/freitagspredigt/',
      'https://www.igmg.org/2026/10/22/hutba/',
      'https://www.igmgreisen.com/de/umra/',
      'https://www.hasene.org/de/zakat-rechner/',
    ])
      expect(igmgUrl.safeParse(adresse).success, adresse).toBe(true);
  });

  it('lehnt andere Hosts, ähnliche Namen und http ab', () => {
    for (const adresse of [
      'https://igmg.example/',
      'https://www.igmg.org.example/',
      'https://boese-igmg.org/',
      'https://tip.igmg.org/',
      'http://www.igmg.org/',
      'https://www.youtube.com/@igmgorg',
      'kein Link',
    ])
      expect(igmgUrl.safeParse(adresse).success, adresse).toBe(false);
  });
});
