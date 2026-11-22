import { describe, expect, it } from 'vitest';
import {
  dokumentOhnePlatzhalter,
  faqOhnePlatzhalter,
  feldOhnePlatzhalter,
  oeffentlicheBloecke,
} from '@/components/website/bloecke/oeffentlich';
import { bloeckeSchema, type Block } from '@/lib/validierung/bloecke';

/**
 * Freie Seiten zeigen öffentlich keine Platzhalter der Gemeinde „[…]“ (Vorstellung 23.11.2026): Sätze mit Platzhalter
 * entfallen, leer gewordene Bausteine ebenso; die Verwaltung bekommt die Bausteine unverändert. Nichts wird erfunden.
 */
const absatz = (...texte: string[]) => ({
  type: 'doc' as const,
  content: texte.map((text) => ({ type: 'paragraph' as const, content: [{ type: 'text' as const, text }] })),
});

/** Alle Zeichenketten eines Werts (für „nirgends ein Platzhalter“). */
function texte(wert: unknown): string[] {
  if (typeof wert === 'string') return [wert];
  if (Array.isArray(wert)) return wert.flatMap(texte);
  if (wert && typeof wert === 'object') return Object.values(wert).flatMap(texte);
  return [];
}

describe('feldOhnePlatzhalter', () => {
  it('Text ohne Platzhalter bleibt dasselbe Feld', () => {
    const feld = { de: 'Besuchen Sie uns', tr: 'Bizi ziyaret edin' };
    expect(feldOhnePlatzhalter(feld, 'de')).toBe(feld);
    expect(feldOhnePlatzhalter(feld, 'tr')).toBe(feld);
  });

  it('Sätze mit Platzhalter entfallen in der gezeigten Sprache; bleibt nichts, ist das Feld leer', () => {
    expect(feldOhnePlatzhalter({ de: 'Herzlich willkommen. Führungen: [Zeiten]' }, 'de')).toEqual({ de: 'Herzlich willkommen.' });
    expect(feldOhnePlatzhalter({ de: '[Einladender Satz der Gemeinde]', tr: '[Cemaatten bir cümle]' }, 'tr')).toEqual({ de: '' });
    // Türkisch gepflegt, Deutsch noch Platzhalter: Die türkische Seite bleibt unberührt, die deutsche wird leer
    const feld = { de: '[Text fehlt]', tr: 'Hoş geldiniz.' };
    expect(feldOhnePlatzhalter(feld, 'tr')).toBe(feld);
    expect(feldOhnePlatzhalter(feld, 'de')).toEqual({ de: '' });
  });

  it('kein Rückfall auf eine andere Fassung, wenn die gezeigte nur Platzhalter war', () => {
    // Englisch ist Platzhalter, Deutsch echter Text: Englisch zeigt nichts (statt still auf Deutsch zu wechseln)
    expect(feldOhnePlatzhalter({ de: 'Offen für alle.', en: '[Text from the community]' }, 'en')).toEqual({ de: '' });
    // Englisch fehlt: sichtbarer Rückfall auf Deutsch, dort ohne den Satz mit Platzhalter
    expect(feldOhnePlatzhalter({ de: 'Offen für alle. Adresse: [Adresse]' }, 'en')).toEqual({ de: 'Offen für alle.' });
  });
});

describe('dokumentOhnePlatzhalter', () => {
  it('Absätze nur aus Platzhaltern entfallen; ohne Rest gibt es kein Dokument', () => {
    expect(dokumentOhnePlatzhalter(absatz('[Einleitung – Text von der Gemeinde]'))).toBeNull();
    expect(dokumentOhnePlatzhalter(absatz('Die Moschee ist offen für alle.', '[Öffnungszeiten – von der Gemeinde]'))).toEqual(
      absatz('Die Moschee ist offen für alle.'),
    );
  });

  it('Dokument ohne Platzhalter bleibt wörtlich, auch mit Einschub in runden Klammern und Auszeichnungen', () => {
    const doc = {
      type: 'doc' as const,
      content: [
        { type: 'heading' as const, attrs: { level: 2 as const }, content: [{ type: 'text' as const, text: 'Besuch' }] },
        {
          type: 'paragraph' as const,
          content: [
            { type: 'text' as const, text: 'Führungen (nach Absprache) bietet ' },
            { type: 'text' as const, text: 'die Gemeinde', marks: [{ type: 'bold' as const }] },
            { type: 'text' as const, text: ' an.' },
          ],
        },
      ],
    };
    expect(dokumentOhnePlatzhalter(doc)).toEqual(doc);
  });

  it('in einem Absatz entfallen nur die Sätze mit Platzhalter; Listenpunkte und Zeilen ebenso', () => {
    const doc = {
      type: 'doc' as const,
      content: [
        { type: 'paragraph' as const, content: [{ type: 'text' as const, text: 'Wir freuen uns auf Sie. Sie finden uns in [Adresse].' }] },
        {
          type: 'bulletList' as const,
          content: [
            {
              type: 'listItem' as const,
              content: [{ type: 'paragraph' as const, content: [{ type: 'text' as const, text: 'Gebetsraum' }] }],
            },
            {
              type: 'listItem' as const,
              content: [{ type: 'paragraph' as const, content: [{ type: 'text' as const, text: '[Weitere Räume]' }] }],
            },
          ],
        },
        {
          type: 'paragraph' as const,
          content: [
            { type: 'text' as const, text: 'Telefon: [Telefonnummer]' },
            { type: 'hardBreak' as const },
            { type: 'text' as const, text: 'E-Mail: info@igmg-wetzlar.de' },
          ],
        },
      ],
    };
    expect(dokumentOhnePlatzhalter(doc)).toEqual({
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'Wir freuen uns auf Sie.' }] },
        {
          type: 'bulletList',
          content: [{ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Gebetsraum' }] }] }],
        },
        { type: 'paragraph', content: [{ type: 'text', text: 'E-Mail: info@igmg-wetzlar.de' }] },
      ],
    });
  });

  it('läuft ein Satz mit Platzhalter über mehrere Textstücke, entfällt die ganze Zeile (kein halber Satz)', () => {
    const doc = {
      type: 'doc' as const,
      content: [
        {
          type: 'paragraph' as const,
          content: [
            { type: 'text' as const, text: 'Unser Imam ' },
            { type: 'text' as const, text: '[Name – Imam]', marks: [{ type: 'bold' as const }] },
            { type: 'text' as const, text: ' begrüßt Sie.' },
          ],
        },
        { type: 'paragraph' as const, content: [{ type: 'text' as const, text: 'Alle sind willkommen.' }] },
      ],
    };
    expect(dokumentOhnePlatzhalter(doc)).toEqual(absatz('Alle sind willkommen.'));
  });
});

describe('faqOhnePlatzhalter', () => {
  it('Antwort ohne den Satz mit Platzhalter; Einträge ohne Antwort entfallen', () => {
    const fragen = faqOhnePlatzhalter(
      [
        {
          frage: { de: 'Gibt es Seminare?' },
          antwort: { de: 'IGMG Reisen empfiehlt ein Seminar. Termine für Wetzlar: [Termine – von der Gemeinde]' },
        },
        { frage: { de: 'Darf ich die Moschee besuchen?' }, antwort: { de: '[Antwort der Gemeinde: Besuchszeiten]' } },
      ],
      'de',
    );
    expect(fragen).toEqual([{ frage: { de: 'Gibt es Seminare?' }, antwort: { de: 'IGMG Reisen empfiehlt ein Seminar.' } }]);
  });
});

describe('oeffentlicheBloecke', () => {
  // Aufbau wie die Beispielseite „Unsere Moschee“ (drizzle/seeds/bereiche/seiten.ts): fast nur Platzhalter
  const bloecke: Block[] = bloeckeSchema.parse([
    {
      typ: 'text',
      id: 'einleitung01',
      inhalt: { de: absatz('[Einleitung – Text von der Gemeinde]'), tr: absatz('[Giriş – metin cemaatten]') },
    },
    {
      typ: 'spalten',
      id: 'saeulen0001',
      titel: { de: 'Was Sie bei uns finden' },
      spalten: [
        { titel: { de: 'Gebet' }, text: { de: '[Kurzer Text zu Gebetsraum und Gebetszeiten]' } },
        { titel: { de: 'Bildung' }, text: { de: '[Kurzer Text zu Korankursen und Unterricht]' } },
      ],
    },
    { typ: 'trenner', id: 'trenner0001' },
    { typ: 'gebetszeiten', id: 'gebetszeit1', titel: { de: '' } },
    {
      typ: 'faq',
      id: 'fragen00001',
      titel: { de: 'Häufige Fragen' },
      eintraege: [{ frage: { de: 'Darf ich die Moschee besuchen?' }, antwort: { de: '[Antwort der Gemeinde]' } }],
    },
    { typ: 'trenner', id: 'trenner0002' },
    { typ: 'kontakt', id: 'kontakt0001', titel: { de: '[Titel]' } },
    {
      typ: 'aufruf',
      id: 'aufruf00001',
      titel: { de: 'Besuchen Sie uns' },
      text: { de: '[Einladender Satz der Gemeinde]' },
      knopf: { de: 'Kontakt aufnehmen' },
      ziel: '/kontakt',
    },
    { typ: 'trenner', id: 'trenner0003' },
  ]);

  it('Bausteine nur aus Platzhaltern entfallen, Trennlinien bleiben nur zwischen zwei Bausteinen', () => {
    const aus = oeffentlicheBloecke(bloecke, 'de');
    expect(aus.map((b) => b.typ)).toEqual(['gebetszeiten', 'trenner', 'kontakt', 'aufruf']);
    for (const text of texte(aus)) expect(text).not.toMatch(/\[[^\]]*\]/);
    const aufruf = aus.find((b) => b.typ === 'aufruf');
    expect(aufruf).toMatchObject({ titel: { de: 'Besuchen Sie uns' }, text: { de: '' }, knopf: { de: 'Kontakt aufnehmen' } });
    // Ein Titel, der nur Platzhalter war, ist leer – der Baustein zeigt dann seinen Standardtitel
    expect(aus.find((b) => b.typ === 'kontakt')).toMatchObject({ titel: { de: '' } });
  });

  it('gepflegte Bausteine bleiben wörtlich, die Eingabe wird nicht verändert', () => {
    const gepflegt: Block[] = bloeckeSchema.parse([
      { typ: 'text', id: 'text000001', inhalt: { de: absatz('Die Fatih-Moschee ist offen für alle.') } },
      {
        typ: 'spalten',
        id: 'spalten001',
        titel: { de: '' },
        spalten: [
          { titel: { de: 'Gebet' }, text: { de: 'Fünf tägliche Gebete.' } },
          { titel: { de: 'Bildung' }, text: { de: '[Text fehlt]' } },
        ],
      },
      { typ: 'vers', id: 'vers000001', sure: 1, von: 1, bis: 7 },
    ]);
    const vorher = JSON.stringify(gepflegt);
    const aus = oeffentlicheBloecke(gepflegt, 'de');
    expect(aus[0]).toEqual(gepflegt[0]);
    expect(aus[2]).toEqual(gepflegt[2]);
    // Nur die Spalte mit Text bleibt
    expect(aus[1]).toMatchObject({ typ: 'spalten', spalten: [{ titel: { de: 'Gebet' }, text: { de: 'Fünf tägliche Gebete.' } }] });
    expect(JSON.stringify(gepflegt)).toBe(vorher);
  });

  it('eine Seite nur aus Platzhaltern ergibt keine Bausteine (die Seite zeigt dann den Hinweis mit dem Weg zur Kontaktseite)', () => {
    expect(oeffentlicheBloecke(bloecke.slice(0, 3), 'de')).toEqual([]);
    expect(oeffentlicheBloecke(bloecke.slice(0, 3), 'tr')).toEqual([]);
  });
});
