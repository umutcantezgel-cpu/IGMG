import type { Mehrsprachig } from '@/lib/db/schema/typen';
import { waehle, type Sprache } from '@/lib/i18n/inhalt';
import { ohnePlatzhalter } from '@/lib/inhalt/platzhalter';

/**
 * Mehrsprachiger Datenbanktext mit sichtbarem Rückfall (K-02, ADR 0002): Fehlt die Sprache, erscheint
 * der deutsche Text mit lang="de" (Screenreader sprechen ihn richtig aus).
 * `platzhalter` (standardmäßig aus): Teile „[…]“ sind Platzhalter der Gemeinde und erscheinen öffentlich nicht – Sätze
 * mit Platzhalter entfallen, bleibt nichts übrig, entfällt das Element (`src/lib/inhalt/platzhalter.ts`). Nur dort
 * einschalten, wo eckige Klammern Platzhalter sind – in Übersetzungen stehen sie auch für Einschübe und müssen bleiben.
 */
export function Text({
  feld,
  sprache,
  als: Tag = 'span',
  className,
  platzhalter = false,
}: {
  feld: Mehrsprachig | null | undefined;
  sprache: Sprache;
  als?: 'span' | 'p' | 'h2' | 'h3' | 'strong';
  className?: string;
  platzhalter?: boolean;
}) {
  const w = waehle(feld, sprache);
  const text = platzhalter ? ohnePlatzhalter(w.text) : w.text;
  if (!text) return null;
  return (
    <Tag lang={w.rueckfall ? 'de' : undefined} className={className}>
      {text}
    </Tag>
  );
}

/**
 * Text und Sprachkennung eines mehrsprachigen Feldes. `platzhalter`: wie bei `Text` – Sätze mit Platzhalter „[…]“
 * entfallen; `text` ist dann leer, wenn nichts übrig bleibt.
 */
export function textMitSprache(feld: Mehrsprachig | null | undefined, sprache: Sprache, { platzhalter = false } = {}) {
  const w = waehle(feld, sprache);
  return { text: platzhalter ? ohnePlatzhalter(w.text) : w.text, lang: w.rueckfall ? 'de' : undefined };
}
