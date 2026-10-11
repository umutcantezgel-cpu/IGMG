import { mergeAttributes, type Extensions } from '@tiptap/core';
import { Image } from '@tiptap/extension-image';
import { Link } from '@tiptap/extension-link';
import { StarterKit } from '@tiptap/starter-kit';
import { z } from 'zod';
import { istErlaubterLink } from '@/lib/inhalt/links';

/**
 * Erweiterungen des Rich-Text-Editors (ADR 0006, C15). Der Editor erzeugt nur, was `richtextSchema` annimmt:
 * `ERLAUBTE_KNOTEN` und `ERLAUBTE_MARKEN`. Abgeschaltet sind Codeblock, Code, Durchstreichen, Unterstreichen und
 * Trennlinie. Links gibt es nur nach `istErlaubterLink` (Befehl, Einfügen und fremdes HTML). Bilder gibt es nur mit
 * Medien-ID; ein Bildknoten speichert nichts außer `mediumId`.
 */
export const ERLAUBTE_KNOTEN = [
  'doc',
  'paragraph',
  'heading',
  'bulletList',
  'orderedList',
  'listItem',
  'blockquote',
  'hardBreak',
  'text',
  'image',
] as const;
export const ERLAUBTE_MARKEN = ['bold', 'italic', 'link'] as const;

const medienId = z.uuid();

/** Medien-ID wie im Schema (`z.uuid()`). Nur solche IDs werden als Bild übernommen. */
export function istMedienId(wert: unknown): wert is string {
  return typeof wert === 'string' && medienId.safeParse(wert).success;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    richtextBild: {
      /** Fügt ein Bild aus der Mediathek ein. Eine ungültige Medien-ID wird abgelehnt. */
      setBild: (mediumId: string) => ReturnType;
    };
  }
}

const bildKlasse =
  'my-2 flex min-h-24 items-center justify-center rounded-md border border-dashed border-rand bg-sand px-4 text-16 text-tinte-2 data-[ausgewaehlt]:border-2 data-[ausgewaehlt]:border-solid data-[ausgewaehlt]:border-gruen-700';

/**
 * Bild aus der Mediathek. Gegenüber `Image` abgeschaltet: Attribute außer `mediumId` (kein `src`, `alt`, `title`),
 * Eingaberegeln (`![…](…)`) und das Übernehmen fremder `<img>`-Tags. Eingefügt wird nur über `setBild`.
 */
const BildKnoten = Image.extend<{ platzhalter: string }>({
  addOptions() {
    return { ...this.parent?.(), platzhalter: 'Bild' };
  },
  addAttributes() {
    return {
      mediumId: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-medium-id'),
        renderHTML: (attribute) => (istMedienId(attribute.mediumId) ? { 'data-medium-id': attribute.mediumId } : {}),
      },
    };
  },
  parseHTML() {
    return [
      {
        tag: 'figure[data-medium-id]',
        getAttrs: (element) => (typeof element !== 'string' && istMedienId(element.getAttribute('data-medium-id')) ? null : false),
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      'figure',
      mergeAttributes(HTMLAttributes, { class: bildKlasse, contenteditable: 'false' }),
      ['span', {}, this.options.platzhalter],
    ];
  },
  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement('figure');
      dom.className = bildKlasse;
      dom.contentEditable = 'false';
      dom.setAttribute('data-medium-id', String(node.attrs.mediumId ?? ''));
      const text = document.createElement('span');
      text.textContent = this.options.platzhalter;
      dom.append(text);
      return {
        dom,
        update: (aktuell) => {
          if (aktuell.type.name !== this.name) return false;
          dom.setAttribute('data-medium-id', String(aktuell.attrs.mediumId ?? ''));
          return true;
        },
        selectNode: () => dom.setAttribute('data-ausgewaehlt', 'true'),
        deselectNode: () => dom.removeAttribute('data-ausgewaehlt'),
      };
    };
  },
  addInputRules() {
    return [];
  },
  addCommands() {
    return {
      setBild:
        (mediumId: string) =>
        ({ commands }) =>
          istMedienId(mediumId) ? commands.insertContent({ type: this.name, attrs: { mediumId } }) : false,
    };
  },
});

/**
 * Verweise nur nach `istErlaubterLink`. Kein Öffnen beim Anklicken im Editor, kein automatisches Verlinken beim
 * Tippen: Ein Verweis entsteht nur, wenn Ehrenamtliche ihn bewusst setzen (oder aus Text mit Adresse eingefügt wird).
 */
function verweis() {
  return Link.configure({
    openOnClick: false,
    autolink: false,
    linkOnPaste: true,
    isAllowedUri: (url) => istErlaubterLink(url),
  });
}

/** Alle Erweiterungen des Editors. `bildPlatzhalter` ist der sichtbare Text eines Bildes (aus den Texten). */
export function richtextErweiterungen({ bildPlatzhalter }: { bildPlatzhalter: string }): Extensions {
  return [
    StarterKit.configure({
      codeBlock: false,
      code: false,
      strike: false,
      horizontalRule: false,
      underline: false,
      link: false,
      heading: { levels: [2, 3] },
    }),
    verweis(),
    BildKnoten.configure({ platzhalter: bildPlatzhalter }),
  ];
}
