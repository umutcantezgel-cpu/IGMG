import type { SchreibGrund } from '@/lib/chat/regeln';
import type { ChatTexte } from './ChatFenster';

/**
 * Hinweise des Chatfensters (ADR 0027, Z-07) als reine Funktionen: Was nach einer Ablehnung beim Senden geschieht und
 * welche Stelle die Statusmeldung trägt. Getrennt von der Insel, damit Unit-Tests sie ohne Browser prüfen.
 */

/** Ablehnungen, nach denen weiter geschrieben werden kann (Fokus bleibt im Feld); alle übrigen Gründe sperren das Feld. */
export const HINWEIS_ZUM_TEXT: ReadonlySet<string> = new Set(['leer', 'zuLang', 'rate']);

/** Gründe, die das Feld sperren und im Hinweisband über dem Feld stehen (die Regeln haben einen eigenen Kasten). */
export type SperrGrund = Exclude<SchreibGrund, 'ok' | 'regelnFehlen'>;
export const istSperrGrund = (g: SchreibGrund | null): g is SperrGrund => g !== null && g !== 'ok' && g !== 'regelnFehlen';

/**
 * Was nach einer Ablehnung beim Senden geschieht: Hinweise zum Text (leer, zu lang, zu schnell) stehen in der
 * Statuszeile, der Fokus bleibt im Feld. Sperrt der Kanal, wird das Feld sofort gesperrt (nicht erst mit dem nächsten
 * Abruf) und der Grund steht nur im Hinweisband – nie zusätzlich in der Statuszeile (Endprüfung Stufe C: derselbe Text
 * stand nach „geschlossen“ doppelt als `role="status"` da).
 */
export function nachAblehnung(grund: string): { art: 'hinweis'; grund: string } | { art: 'sperre'; grund: SchreibGrund } {
  return HINWEIS_ZUM_TEXT.has(grund) ? { art: 'hinweis', grund } : { art: 'sperre', grund: grund as SchreibGrund };
}

/**
 * Genau eine Live-Region für Hinweise: Ist das Feld gesperrt, ist das Hinweisband die Statusmeldung (mit Grund, bei
 * „geschlossen“ der Wiederöffnungszeit und einer weiteren Meldung wie „gemeldet“); sonst die Statuszeile unter dem Feld.
 * Derselbe Text steht nie zweimal.
 */
export function hinweisLage(
  schreiben: SchreibGrund | null,
  meldung: string | null,
  texte: Pick<ChatTexte, 'grund'>,
): { band: { grund: SperrGrund; text: string; zusatz: string | null } | null; status: string | null } {
  if (!istSperrGrund(schreiben)) return { band: null, status: meldung };
  const text = texte.grund[schreiben] ?? '';
  return { band: { grund: schreiben, text, zusatz: meldung && meldung !== text ? meldung : null }, status: null };
}
