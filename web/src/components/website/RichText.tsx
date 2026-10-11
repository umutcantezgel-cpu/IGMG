import type { JSONContent } from '@tiptap/core';
import { renderJSONContentToReactElement } from '@tiptap/static-renderer/json/react';
import type { ReactNode } from 'react';
import { istErlaubterLink } from '@/lib/inhalt/links';

/** Linkregel (ADR 0006) – Quelle ist `@/lib/inhalt/links`, hier für bestehende Aufrufer weitergereicht. */
export { istErlaubterLink };

type Kinder = ReactNode | ReactNode[];
type KnotenProps = { node: JSONContent; children?: Kinder };

const renderer = renderJSONContentToReactElement<
  { type: string; attrs?: Record<string, unknown> },
  JSONContent & { content?: { forEach: (cb: (n: JSONContent) => void) => void } }
>({
  nodeMapping: {
    doc: ({ children }: KnotenProps) => <>{children}</>,
    paragraph: ({ children }: KnotenProps) => <p>{children}</p>,
    heading: ({ node, children }: KnotenProps) => ((node.attrs?.level as number) === 3 ? <h3>{children}</h3> : <h2>{children}</h2>),
    bulletList: ({ children }: KnotenProps) => <ul>{children}</ul>,
    orderedList: ({ children }: KnotenProps) => <ol>{children}</ol>,
    listItem: ({ children }: KnotenProps) => <li>{children}</li>,
    blockquote: ({ children }: KnotenProps) => <blockquote>{children}</blockquote>,
    hardBreak: () => <br />,
    text: ({ node }: KnotenProps) => <>{node.text ?? ''}</>,
  },
  markMapping: {
    bold: ({ children }: { children?: Kinder }) => <strong>{children}</strong>,
    italic: ({ children }: { children?: Kinder }) => <em>{children}</em>,
    link: ({ mark, children }: { mark: { attrs?: Record<string, unknown> }; children?: Kinder }) => {
      const href = mark.attrs?.href;
      if (!istErlaubterLink(href)) return <>{children}</>;
      const extern = href.startsWith('https://');
      return (
        <a href={href} {...(extern ? { rel: 'noopener noreferrer' } : {})}>
          {children}
        </a>
      );
    },
  },
  // Unbekannte Knoten und Marken werden nicht ausgegeben (kein rohes HTML, ADR 0006)
  unhandledNode: () => null,
  unhandledMark: ({ children }: { children?: Kinder }) => <>{children}</>,
});

/** Öffentliche Ausgabe von Rich-Text (Tiptap-JSON) als reine Server-Komponente – kein Editor-JavaScript. */
export function RichText({ doc, lang, className }: { doc: JSONContent | null | undefined; lang?: string; className?: string }) {
  if (!doc) return null;
  return (
    <div lang={lang} className={`fliesstext ${className ?? ''}`}>
      {renderer({ content: doc as JSONContent & { content?: { forEach: (cb: (n: JSONContent) => void) => void } } })}
    </div>
  );
}
