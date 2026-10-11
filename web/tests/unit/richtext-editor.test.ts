import { Editor, type JSONContent } from '@tiptap/core';
import { describe, expect, it } from 'vitest';
import { ERLAUBTE_KNOTEN, ERLAUBTE_MARKEN, richtextErweiterungen } from '@/components/verwaltung/richtext/erweiterungen';
import { richtextFeld } from '@/lib/validierung/richtext';

/**
 * ADR 0006 / C15: Was der Editor erzeugt, besteht die Prüfung beim Speichern. Der Editor läuft headless (ohne DOM),
 * Befehle laufen über die Ansicht-Attrappe; `focus()` braucht die echte Ansicht und wird hier nicht genutzt.
 */
const MEDIUM = '0f9c0f5c-1b1a-4c9f-9a43-0b6b7b7b7b7b';
const absatz = (text: string): JSONContent => ({ type: 'paragraph', content: [{ type: 'text', text }] });
const dokument = (...inhalt: JSONContent[]): JSONContent => ({ type: 'doc', content: inhalt });

/** Leeres Dokument als JSON: ein Textinhalt aus Zeichenkette würde HTML parsen und braucht ein Fenster. */
const leer: JSONContent = { type: 'doc', content: [{ type: 'paragraph' }] };

function editor(inhalt?: JSONContent) {
  return new Editor({ extensions: richtextErweiterungen({ bildPlatzhalter: 'Bild' }), content: inhalt ?? leer });
}

/** Der Weg beim Speichern: JSON-Text aus dem Formularfeld wird mit `richtextFeld` geprüft. */
const speicherbar = (e: Editor) => richtextFeld.safeParse(JSON.stringify(e.getJSON())).success;

describe('Rich-Text-Editor: Erweiterungen (ADR 0006)', () => {
  it('kennt nur die erlaubten Knoten und Marken', () => {
    const e = editor();
    expect(Object.keys(e.schema.nodes).sort()).toEqual([...ERLAUBTE_KNOTEN].sort());
    expect(Object.keys(e.schema.marks).sort()).toEqual([...ERLAUBTE_MARKEN].sort());
  });
});

describe('Rich-Text-Editor: Befehle erzeugen nur speicherbare Inhalte', () => {
  it('Fett und Kursiv', () => {
    const e = editor(dokument(absatz('Hallo Welt')));
    e.commands.setTextSelection({ from: 1, to: 6 });
    expect(e.commands.toggleBold()).toBe(true);
    expect(e.commands.toggleItalic()).toBe(true);
    expect(JSON.stringify(e.getJSON())).toContain('"type":"bold"');
    expect(speicherbar(e)).toBe(true);
  });

  it.each([2, 3])('Überschrift Ebene %i', (level) => {
    const e = editor(dokument(absatz('Titel')));
    e.commands.setTextSelection({ from: 1, to: 6 });
    expect(e.commands.toggleHeading({ level: level as 2 | 3 })).toBe(true);
    expect(e.getJSON().content?.[0]).toMatchObject({ type: 'heading', attrs: { level } });
    expect(speicherbar(e)).toBe(true);
  });

  it('Aufzählung, Nummerierung und Zitat', () => {
    const aufzaehlung = editor(dokument(absatz('Punkt')));
    aufzaehlung.commands.setTextSelection({ from: 1, to: 6 });
    aufzaehlung.commands.toggleBulletList();
    expect(aufzaehlung.getJSON().content?.[0]?.type).toBe('bulletList');
    expect(speicherbar(aufzaehlung)).toBe(true);

    const nummerierung = editor(dokument(absatz('Schritt')));
    nummerierung.commands.setTextSelection({ from: 1, to: 6 });
    nummerierung.commands.toggleOrderedList();
    expect(nummerierung.getJSON().content?.[0]?.type).toBe('orderedList');
    expect(speicherbar(nummerierung)).toBe(true);

    const zitat = editor(dokument(absatz('Zitat')));
    zitat.commands.setTextSelection({ from: 1, to: 6 });
    zitat.commands.toggleBlockquote();
    expect(zitat.getJSON().content?.[0]?.type).toBe('blockquote');
    expect(speicherbar(zitat)).toBe(true);
  });

  it('Zeilenumbruch (Umschalt-Eingabe)', () => {
    const e = editor(dokument(absatz('Zeile')));
    e.commands.setTextSelection(3);
    expect(e.commands.insertContent({ type: 'hardBreak' })).toBe(true);
    expect(JSON.stringify(e.getJSON())).toContain('"hardBreak"');
    expect(speicherbar(e)).toBe(true);
  });

  it('verschachtelte Aufzählung im Zitat ist speicherbar', () => {
    const e = editor(dokument(absatz('Zitat mit Liste')));
    e.commands.setTextSelection({ from: 1, to: 6 });
    e.commands.toggleBlockquote();
    e.commands.toggleBulletList();
    expect(speicherbar(e)).toBe(true);
  });

  it.each(['https://www.igmg.org', 'mailto:info@example.test', 'tel:+4900000', '/kontakt'])('Link %s ist erlaubt', (href) => {
    const e = editor(dokument(absatz('Kontakt')));
    e.commands.setTextSelection({ from: 1, to: 8 });
    expect(e.commands.setLink({ href })).toBe(true);
    expect(JSON.stringify(e.getJSON())).toContain(href);
    expect(speicherbar(e)).toBe(true);
  });

  it.each(['http://www.igmg.org', 'javascript:alert(1)', '//evil.example', '/\\evil.example', 'ftp://example.test'])(
    'Link %s wird nicht gesetzt',
    (href) => {
      const e = editor(dokument(absatz('Kontakt')));
      e.commands.setTextSelection({ from: 1, to: 8 });
      expect(e.commands.setLink({ href })).toBe(false);
      expect(JSON.stringify(e.getJSON())).not.toContain('"link"');
    },
  );

  it('Bild mit Medien-ID speichert nur die ID', () => {
    const e = editor(dokument(absatz('Text')));
    expect(e.commands.setBild(MEDIUM)).toBe(true);
    expect(e.getJSON().content).toContainEqual({ type: 'image', attrs: { mediumId: MEDIUM } });
    expect(speicherbar(e)).toBe(true);
  });

  it('Bild ohne gültige Medien-ID wird abgelehnt', () => {
    const e = editor(dokument(absatz('Text')));
    expect(e.commands.setBild('kein-medium')).toBe(false);
    expect(e.getJSON().content?.some((k) => k.type === 'image')).toBe(false);
  });
});

describe('Rich-Text-Editor: Speichern', () => {
  it('leerer Editor ergibt kein Dokument', () => {
    expect(richtextFeld.parse(JSON.stringify(editor().getJSON()))).toBeNull();
  });

  it('gemischter Text mit Überschrift, Fett, Liste, Link, Bild und Zitat ist speicherbar', () => {
    const e = editor(
      dokument(
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Gebetszeiten' }] },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Fett', marks: [{ type: 'bold' }] },
            { type: 'text', text: ' und ' },
            { type: 'text', text: 'Link', marks: [{ type: 'link', attrs: { href: 'https://www.igmg.org' } }] },
          ],
        },
        { type: 'bulletList', content: [{ type: 'listItem', content: [absatz('Freitag')] }] },
        { type: 'image', attrs: { mediumId: MEDIUM } },
        { type: 'blockquote', content: [absatz('Zitat')] },
      ),
    );
    expect(speicherbar(e)).toBe(true);
  });
});
