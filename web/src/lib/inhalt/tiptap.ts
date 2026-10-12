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

/** Vergleichsform eines Textes: Leerraum zusammengezogen, Ränder entfernt. */
function norm(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Auszug und Rumpf (H-C02, Nachrichtendetail): Beginnt der Rich-Text mit einem einzelnen Absatz, dessen Wortlaut dem
 * Kurztext entspricht, steht der Satz doppelt da. Dann gilt: Folgen weitere Knoten, rendert der Rumpf sie ohne den
 * Absatz (der Untertitel bleibt im Kopf); ist der Absatz der einzige Knoten, entfällt der Untertitel und der Rumpf zeigt
 * den Absatz. Sind beide verschieden, bleibt alles unverändert. Kein Abschneiden von Präfixen.
 */
export function auszugImRumpf(doc: JSONContent, kurztext: string): { untertitel: boolean; doc: JSONContent } {
  const erster = doc.content?.[0];
  const absatz = erster?.type === 'paragraph' ? norm(klartext(erster)) : '';
  if (absatz === '' || absatz !== norm(kurztext)) return { untertitel: true, doc };
  if ((doc.content?.length ?? 0) <= 1) return { untertitel: false, doc };
  return { untertitel: true, doc: { ...doc, content: doc.content?.slice(1) } };
}

/** Lesezeit in Minuten (200 Wörter je Minute, mindestens 1). */
export function lesezeit(text: string): number {
  const woerter = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(woerter / 200));
}
