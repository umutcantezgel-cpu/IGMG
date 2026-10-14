import type { Mehrsprachig } from '@/lib/db/schema/typen';
import { waehle, type Sprache } from '@/lib/i18n/inhalt';
import { MitPlatzhaltern } from './Platzhalter';

/**
 * Mehrsprachiger Datenbanktext mit sichtbarem Rückfall (K-02, ADR 0002): Fehlt die Sprache, erscheint
 * der deutsche Text mit lang="de" (Screenreader sprechen ihn richtig aus).
 * `platzhalter` (Sichtabnahme Runde 2, PR-3; standardmäßig aus): Teile „[…]“ erscheinen als Platzhalter der Gemeinde
 * (gestrichelt, `data-platzhalter`). Nur dort einschalten, wo eckige Klammern Platzhalter sind – in Übersetzungen
 * stehen sie auch für Einschübe und dürfen dort nicht markiert werden.
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
  if (!w.text) return null;
  return (
    <Tag lang={w.rueckfall ? 'de' : undefined} className={className}>
      {platzhalter ? <MitPlatzhaltern text={w.text} /> : w.text}
    </Tag>
  );
}

export function textMitSprache(feld: Mehrsprachig | null | undefined, sprache: Sprache) {
  const w = waehle(feld, sprache);
  return { text: w.text, lang: w.rueckfall ? 'de' : undefined };
}
