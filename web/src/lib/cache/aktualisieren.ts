import 'server-only';
import { revalidateTag, updateTag } from 'next/cache';
import { after } from 'next/server';

/** Abstand der zweiten Invalidierung (ms): länger als jeder Seitenaufbau, kurz genug für „sofort öffentlich“. */
const NACHLAUF_MS = 5_000;

/**
 * Inhalte geändert → Caches verfallen lassen (ADR 0004, Z-04). Nur in Server Actions aufrufen.
 * 1. `updateTag` sofort: Die nächste Anfrage rendert frisch (eigene Änderung sofort sichtbar).
 * 2. Nach {@link NACHLAUF_MS} erneut: Ein Seitenaufbau, der während des Speicherns noch alte Daten gelesen
 *    hat und erst nach Schritt 1 fertig wird, würde sonst einen veralteten Eintrag dauerhaft im Cache
 *    hinterlassen (in D05 im parallelen E2E-Lauf beobachtet, FEHLERSTATISTIK F-002).
 */
export function inhaltGeaendert(...tags: string[]): void {
  for (const tag of tags) updateTag(tag);
  after(async () => {
    await new Promise((fertig) => setTimeout(fertig, NACHLAUF_MS));
    for (const tag of tags) revalidateTag(tag, { expire: 0 });
  });
}
