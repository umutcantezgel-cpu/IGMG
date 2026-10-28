import { describe, expect, it } from 'vitest';
import { adressenAus, MAX_WEITERLEITUNGEN, SOFT_404, stufeEin } from '../../scripts/links-pruefen.mjs';

/**
 * Linkprüfung (scripts/links-pruefen.mjs, `pnpm links:pruefen`, Marktstart Welle 3): reine Einstufung der Prüfergebnisse
 * und das Herauslösen von Adressen aus Quelltexten. Keine Netzanfragen.
 */
type Schritt = { url: string; status: number };
type Eingabe = { url: string; kette?: Schritt[]; fehler?: string; titel?: string };
const stufe = (e: Eingabe) => (stufeEin as unknown as (e: Eingabe) => { stufe: string; grund: string })(e);
const U = 'https://www.igmg.org/gebetskalender';

describe('Einstufung', () => {
  it('200 → ok', () => {
    expect(stufe({ url: U, kette: [{ url: U, status: 200 }] })).toEqual({ stufe: 'ok', grund: 'erreichbar' });
  });

  it('404 und 410 → Fehler', () => {
    expect(stufe({ url: U, kette: [{ url: U, status: 404 }] }).stufe).toBe('fehler');
    expect(stufe({ url: U, kette: [{ url: U, status: 410 }] }).stufe).toBe('fehler');
  });

  it('http:// → Fehler, auch als Ziel einer Weiterleitung', () => {
    expect(stufe({ url: 'http://www.igmg.org/', kette: [] })).toMatchObject({ stufe: 'fehler' });
    const kette = [
      { url: U, status: 301 },
      { url: 'http://www.igmg.org/gebetskalender', status: 200 },
    ];
    expect(stufe({ url: U, kette }).stufe).toBe('fehler');
  });

  it('301/308 auf einen anderen Pfad → Warnung „umgezogen“; auf denselben Pfad (Schrägstrich, www) → ok', () => {
    const neu = 'https://www.igmg.org/gebetszeiten/';
    expect(
      stufe({
        url: U,
        kette: [
          { url: U, status: 301 },
          { url: neu, status: 200 },
        ],
      }),
    ).toEqual({
      stufe: 'warnung',
      grund: `umgezogen → ${neu}`,
    });
    expect(
      stufe({
        url: U,
        kette: [
          { url: U, status: 308 },
          { url: neu, status: 200 },
        ],
      }).stufe,
    ).toBe('warnung');
    expect(
      stufe({
        url: U,
        kette: [
          { url: U, status: 301 },
          { url: `${U}/`, status: 200 },
        ],
      }).stufe,
    ).toBe('ok');
    const ohneWww = 'https://igmg.org/gebetskalender';
    expect(
      stufe({
        url: ohneWww,
        kette: [
          { url: ohneWww, status: 301 },
          { url: U, status: 200 },
        ],
      }).stufe,
    ).toBe('ok');
  });

  it('vorübergehende Weiterleitung (302/307) auf eine Sprachfassung → ok', () => {
    const tr = 'https://www.igmg.org/tr/gebetskalender';
    expect(
      stufe({
        url: U,
        kette: [
          { url: U, status: 302 },
          { url: tr, status: 200 },
        ],
      }).stufe,
    ).toBe('ok');
    expect(
      stufe({
        url: U,
        kette: [
          { url: U, status: 307 },
          { url: tr, status: 200 },
        ],
      }).stufe,
    ).toBe('ok');
  });

  it('mehr als fünf Weiterleitungen → Fehler', () => {
    const kette = Array.from({ length: MAX_WEITERLEITUNGEN + 1 }, (_, i) => ({ url: `${U}?s=${i}`, status: 302 }));
    expect(stufe({ url: U, kette })).toMatchObject({ stufe: 'fehler', grund: expect.stringContaining('Weiterleitungen') });
  });

  it('5xx und keine Antwort nach dem zweiten Versuch → Warnung', () => {
    expect(stufe({ url: U, kette: [{ url: U, status: 503 }] }).stufe).toBe('warnung');
    expect(stufe({ url: U, fehler: 'Zeitüberschreitung 15 s' })).toMatchObject({
      stufe: 'warnung',
      grund: expect.stringContaining('Zeitüberschreitung'),
    });
  });

  it('403 (Bot-Schutz, z. B. camiahaber.com) → Warnung, kein Fehler', () => {
    const url = 'https://www.camiahaber.com/';
    expect(stufe({ url, kette: [{ url, status: 403 }] })).toMatchObject({ stufe: 'warnung', grund: expect.stringContaining('403') });
    expect(stufe({ url, kette: [{ url, status: 429 }] }).stufe).toBe('warnung');
  });

  it('200 mit Soft-404-Titel (de/tr/en) → Warnung', () => {
    for (const titel of ['Seite nicht gefunden – IGMG', 'Sayfa bulunamadı', 'Page not found', '404 | IGMG'])
      expect(stufe({ url: U, kette: [{ url: U, status: 200 }], titel }).stufe, titel).toBe('warnung');
    expect(SOFT_404.test('Gebetskalender – IGMG')).toBe(false);
    expect(stufe({ url: U, kette: [{ url: U, status: 200 }], titel: 'Gebetskalender – IGMG' }).stufe).toBe('ok');
  });
});

describe('Adressen aus Quelltexten', () => {
  it('bereinigt Satzzeichen und Entitäten, lässt Beispiel- und Testadressen weg', () => {
    const text = [
      "url: 'https://www.igmg.org/gebetskalender?stadt=Wetzlar&amp;id=20238',",
      'Siehe https://hasene.org/de. Und (https://www.ukba.eu/de).',
      'mail an https://example.com/x und https://gemeinde.test/a sowie https://igmg-wetzlar.de/kontakt',
      'Platzhalter im Formular: https://www.ihre-aktuelle-webseite.de, https://www.your-current-website.de',
      'unsicher: http://www.igmg.org/',
    ].join('\n');
    expect(adressenAus(text)).toEqual([
      'https://www.igmg.org/gebetskalender?stadt=Wetzlar&id=20238',
      'https://hasene.org/de',
      'https://www.ukba.eu/de',
      'http://www.igmg.org/',
    ]);
  });
});
