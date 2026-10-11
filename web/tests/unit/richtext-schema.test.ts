import { describe, expect, it } from 'vitest';
import { RICHTEXT_GRENZEN, richtextFeld, richtextSchema } from '@/lib/validierung/richtext';

/** ADR 0006 / C15: Rich-Text aus dem Editor wird beim Speichern streng geprüft (nur erlaubte Knoten, Links, Grenzen). */
const absatz = (text: string, marks?: unknown[]) => ({ type: 'paragraph', content: [{ type: 'text', text, ...(marks ? { marks } : {}) }] });
const doc = (...content: unknown[]) => ({ type: 'doc', content });

describe('richtextSchema', () => {
  it('erlaubt Absatz, Überschrift 2/3, Listen, Zitat, Umbruch, Fett/Kursiv/Link, Bild mit Medien-ID', () => {
    const d = doc(
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Titel' }] },
      absatz('fett', [{ type: 'bold' }, { type: 'italic' }]),
      absatz('Link', [{ type: 'link', attrs: { href: 'https://www.igmg.org', target: '_blank', rel: 'x', class: 'y' } }]),
      { type: 'bulletList', content: [{ type: 'listItem', content: [absatz('a')] }] },
      { type: 'orderedList', attrs: { start: 3 }, content: [{ type: 'listItem', content: [absatz('b')] }] },
      { type: 'blockquote', content: [absatz('Zitat')] },
      { type: 'paragraph', content: [{ type: 'text', text: 'x' }, { type: 'hardBreak' }, { type: 'text', text: 'y' }] },
      { type: 'image', attrs: { mediumId: '0f9c0f5c-1b1a-4c9f-9a43-0b6b7b7b7b7b', src: 'https://evil.example/x.png' } },
    );
    const r = richtextSchema.safeParse(d);
    expect(r.success).toBe(true);
    // unbekannte Attribute entfernt (target, rel, class, src)
    expect(JSON.stringify(r.data)).not.toMatch(/target|_blank|class|evil/);
  });

  it.each([
    ['Knoten script', doc({ type: 'script', content: [] })],
    ['Codeblock', doc({ type: 'codeBlock', content: [{ type: 'text', text: 'x' }] })],
    ['Überschrift Ebene 1', doc({ type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'x' }] })],
    ['javascript-Link', doc(absatz('x', [{ type: 'link', attrs: { href: 'javascript:alert(1)' } }]))],
    ['Protokoll-relativer Link', doc(absatz('x', [{ type: 'link', attrs: { href: '//evil.example' } }]))],
    ['Link /\\host', doc(absatz('x', [{ type: 'link', attrs: { href: '/\\evil.example' } }]))],
    ['Marke underline', doc(absatz('x', [{ type: 'underline' }]))],
    ['Bild ohne Medien-ID', doc({ type: 'image', attrs: { src: 'https://example.test/a.png' } })],
    ['leere Liste', doc({ type: 'bulletList', content: [] })],
    ['kein doc', { type: 'paragraph' }],
  ])('lehnt ab: %s', (_n, d) => {
    expect(richtextSchema.safeParse(d).success).toBe(false);
  });

  it('Grenzen: zu tiefe Schachtelung und zu viel Text werden abgelehnt', () => {
    let tief: unknown = absatz('x');
    for (let i = 0; i < RICHTEXT_GRENZEN.tiefe; i++) tief = { type: 'blockquote', content: [tief] };
    expect(richtextSchema.safeParse(doc(tief)).success).toBe(false);
    const lang = Array.from({ length: 7 }, () => absatz('x'.repeat(10_000)));
    expect(richtextSchema.safeParse(doc(...lang)).success).toBe(false);
  });
});

describe('richtextFeld (Formularfeld)', () => {
  it('leer oder nur leere Absätze → null; gültiges JSON → Dokument; kaputtes JSON → Fehler', () => {
    expect(richtextFeld.parse('')).toBeNull();
    expect(richtextFeld.parse(JSON.stringify(doc({ type: 'paragraph' })))).toBeNull();
    expect(richtextFeld.parse(JSON.stringify(doc(absatz('Hallo'))))).toMatchObject({ type: 'doc' });
    expect(richtextFeld.safeParse('{kein json').success).toBe(false);
  });
});
