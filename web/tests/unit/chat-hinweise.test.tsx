import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { hinweisLage, istSperrGrund, nachAblehnung } from '@/components/chat/hinweise';
import { SperrBand } from '@/components/chat/SperrBand';
import type { SchreibGrund } from '@/lib/chat/regeln';
import fenster from '../../messages/bereiche/chat-fenster.json';

/**
 * Chatfenster, genau eine Live-Region (Endprüfung Stufe C, Kleinigkeiten): Nach „geschlossen“ stand derselbe Text doppelt
 * als `role="status"` da – in der Statuszeile unter dem Feld (Ablehnung beim Senden) und im Hinweisband über dem Feld
 * (nächster Abruf). Jetzt sperrt eine Ablehnung das Feld sofort, der Grund steht nur im Band; solange das Band steht, ist
 * die Statuszeile keine Live-Region.
 */
const c = fenster.de.chatFenster;
const texte = { grund: c.grund as Partial<Record<SchreibGrund | 'leer' | 'zuLang' | 'rate', string>> };
const wiederAb = c.wiederAb.replace('{von}', '08:00');
const GRUENDE: SchreibGrund[] = [
  'ok',
  'keinRecht',
  'kanalAus',
  'notfallpause',
  'pausiert',
  'zuWenigeErwachsene',
  'geschlossen',
  'nurLehrkraft',
  'stumm',
  'einwilligungFehlt',
  'zuJung',
  'regelnFehlen',
];

/** Markup der beiden Hinweisstellen, wie ChatFenster sie setzt (Band über dem Feld, Statuszeile darunter). */
function markup(schreiben: SchreibGrund | null, meldung: string | null): string {
  const lage = hinweisLage(schreiben, meldung, texte);
  return renderToStaticMarkup(
    <>
      {lage.band ? <SperrBand {...lage.band} wiederAb={wiederAb} /> : null}
      <p role={lage.band ? undefined : 'status'}>{lage.status}</p>
    </>,
  );
}
const anzahl = (text: string, teil: string) => text.split(teil).length - 1;

describe('Chat: Ablehnung beim Senden', () => {
  it('Hinweise zum Text bleiben Meldungen, alles andere sperrt das Feld', () => {
    for (const g of ['leer', 'zuLang', 'rate']) expect(nachAblehnung(g)).toEqual({ art: 'hinweis', grund: g });
    for (const g of ['geschlossen', 'pausiert', 'notfallpause', 'stumm', 'keinRecht', 'kanalAus', 'regelnFehlen'])
      expect(nachAblehnung(g)).toEqual({ art: 'sperre', grund: g });
    expect(istSperrGrund('geschlossen')).toBe(true);
    expect(istSperrGrund('regelnFehlen')).toBe(false);
    expect(istSperrGrund('ok')).toBe(false);
    expect(istSperrGrund(null)).toBe(false);
  });
});

describe('Chat: genau eine Live-Region, kein Text doppelt', () => {
  it('„geschlossen“: ein role="status" mit Grund und Wiederöffnungszeit, der Grund steht einmal', () => {
    // Zustand wie vorher nach Senden + Abruf: Meldung = Grund, Kanal = geschlossen
    for (const meldung of [null, c.grund.geschlossen]) {
      const html = markup('geschlossen', meldung);
      expect(anzahl(html, 'role="status"')).toBe(1);
      expect(anzahl(html, c.grund.geschlossen)).toBe(1);
      expect(html).toContain(wiederAb);
    }
  });

  it('jeder Zustand: genau eine Live-Region; jede Meldung höchstens einmal', () => {
    for (const schreiben of [null, ...GRUENDE])
      for (const meldung of [null, c.gemeldet, c.fehler, c.grund.zuLang, schreiben ? (c.grund as Record<string, string>)[schreiben] : null]) {
        const html = markup(schreiben, meldung ?? null);
        expect(anzahl(html, 'role="status"'), `${schreiben} / ${meldung}`).toBe(1);
        if (meldung) expect(anzahl(html, meldung), `${schreiben} / ${meldung}`).toBe(1);
      }
  });

  it('gesperrt: weitere Meldungen (z. B. „gemeldet“) stehen im Band, die Statuszeile bleibt leer', () => {
    const lage = hinweisLage('pausiert', c.gemeldet, texte);
    expect(lage).toEqual({ band: { grund: 'pausiert', text: c.grund.pausiert, zusatz: c.gemeldet }, status: null });
    expect(hinweisLage('ok', c.gemeldet, texte)).toEqual({ band: null, status: c.gemeldet });
    // Regeln fehlen: eigener Kasten, die Statuszeile meldet
    expect(hinweisLage('regelnFehlen', c.grund.regelnFehlen, texte)).toEqual({ band: null, status: c.grund.regelnFehlen });
  });
});
