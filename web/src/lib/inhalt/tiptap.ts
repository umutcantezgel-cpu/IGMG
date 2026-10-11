import type { JSONContent } from '@tiptap/core';

/** Einfaches Tiptap-Dokument aus Absätzen (Seeds, Import). ADR 0006. */
export function dokumentAusAbsaetzen(absaetze: readonly string[]): JSONContent {
  return {
    type: 'doc',
    content: absaetze.filter((a) => a.trim()).map((a) => ({ type: 'paragraph', content: [{ type: 'text', text: a }] })),
  };
}

/** Klartext eines Tiptap-Dokuments (Volltextsuche, Lesezeit, Vorschau). */
export function klartext(doc: JSONContent | null | undefined): string {
  if (!doc) return '';
  const teile: string[] = [];
  const lauf = (k: JSONContent) => {
    if (k.type === 'text' && k.text) teile.push(k.text);
    k.content?.forEach(lauf);
    if (k.type === 'paragraph' || k.type === 'heading' || k.type === 'listItem') teile.push('\n');
  };
  lauf(doc);
  return teile
    .join('')
    .replace(/\n{2,}/g, '\n')
    .trim();
}

/** Lesezeit in Minuten (200 Wörter je Minute, mindestens 1). */
export function lesezeit(text: string): number {
  const woerter = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(woerter / 200));
}
