import { z } from 'zod';
import { istErlaubterLink } from '@/lib/inhalt/links';

/**
 * Prüfung von Rich-Text aus dem Editor beim Speichern (ADR 0006, C15): nur die erlaubten Knoten und Marken,
 * Überschriften Ebene 2–3, Links nur nach `istErlaubterLink`, Bilder nur mit Medien-ID (Alt-Text aus der Mediathek).
 * Unbekannte Attribute werden entfernt (Zod streift unbekannte Schlüssel), unbekannte Knoten abgelehnt.
 * Grenzen gegen übergroße Eingaben: Schachtelungstiefe, Knotenzahl, Textlänge. Fehler sind Schlüssel (`richtext`).
 */
export const RICHTEXT_GRENZEN = { tiefe: 8, knoten: 4000, zeichen: 60_000 } as const;

const marke = z.discriminatedUnion('type', [
  z.object({ type: z.literal('bold') }),
  z.object({ type: z.literal('italic') }),
  z.object({ type: z.literal('link'), attrs: z.object({ href: z.string().max(2000).refine(istErlaubterLink, 'link') }) }),
]);

const text = z.object({ type: z.literal('text'), text: z.string().min(1).max(10_000), marks: z.array(marke).max(3).optional() });
const umbruch = z.object({ type: z.literal('hardBreak') });
const inline = z.discriminatedUnion('type', [text, umbruch]);

type Block =
  | { type: 'paragraph'; content?: z.infer<typeof inline>[] }
  | { type: 'heading'; attrs: { level: 2 | 3 }; content?: z.infer<typeof inline>[] }
  | { type: 'bulletList'; content: { type: 'listItem'; content: Block[] }[] }
  | { type: 'orderedList'; attrs?: { start?: number }; content: { type: 'listItem'; content: Block[] }[] }
  | { type: 'blockquote'; content: Block[] }
  | { type: 'image'; attrs: { mediumId: string } };

const block: z.ZodType<Block> = z.lazy(() =>
  z.discriminatedUnion('type', [
    z.object({ type: z.literal('paragraph'), content: z.array(inline).max(500).optional() }),
    z.object({
      type: z.literal('heading'),
      attrs: z.object({ level: z.union([z.literal(2), z.literal(3)]) }),
      content: z.array(inline).max(100).optional(),
    }),
    z.object({ type: z.literal('bulletList'), content: z.array(listenpunkt).min(1).max(200) }),
    z.object({
      type: z.literal('orderedList'),
      attrs: z.object({ start: z.number().int().min(1).max(10_000).optional() }).optional(),
      content: z.array(listenpunkt).min(1).max(200),
    }),
    z.object({ type: z.literal('blockquote'), content: z.array(block).min(1).max(50) }),
    z.object({ type: z.literal('image'), attrs: z.object({ mediumId: z.uuid() }) }),
  ]),
);
const listenpunkt = z.object({ type: z.literal('listItem'), content: z.array(block).min(1).max(20) });

/** Tiefe, Knotenzahl und Zeichen zählen (Zod prüft nur die Form). */
function vermessen(knoten: unknown, tiefe = 0, stand = { knoten: 0, zeichen: 0, tiefe: 0 }) {
  if (!knoten || typeof knoten !== 'object') return stand;
  stand.knoten += 1;
  stand.tiefe = Math.max(stand.tiefe, tiefe);
  const k = knoten as { text?: unknown; content?: unknown };
  if (typeof k.text === 'string') stand.zeichen += k.text.length;
  if (Array.isArray(k.content)) for (const kind of k.content) vermessen(kind, tiefe + 1, stand);
  return stand;
}

export const richtextSchema = z.object({ type: z.literal('doc'), content: z.array(block).max(1000) }).superRefine((doc, ctx) => {
  const m = vermessen(doc);
  if (m.tiefe > RICHTEXT_GRENZEN.tiefe || m.knoten > RICHTEXT_GRENZEN.knoten || m.zeichen > RICHTEXT_GRENZEN.zeichen)
    ctx.addIssue({ code: 'custom', message: 'zuLang' });
});
export type RichtextDokument = z.infer<typeof richtextSchema>;

/** Leeres Dokument (nur leere Absätze) gilt als „kein Inhalt“. */
export function istLeer(doc: RichtextDokument): boolean {
  return doc.content.every((b) => b.type === 'paragraph' && !(b.content ?? []).some((i) => i.type === 'text' && i.text.trim()));
}

/** Formularfeld (JSON-Text aus dem Editor) → geprüftes Dokument oder `null` bei leer; Fehler als Zod-Fehler. */
export const richtextFeld = z
  .string()
  .max(500_000, 'zuLang')
  .transform((roh, ctx) => {
    if (!roh.trim()) return null;
    try {
      return JSON.parse(roh) as unknown;
    } catch {
      ctx.addIssue({ code: 'custom', message: 'richtext' });
      return z.NEVER;
    }
  })
  .pipe(richtextSchema.nullable())
  .transform((doc) => (doc && !istLeer(doc) ? doc : null));
