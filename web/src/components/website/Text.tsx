import type { Mehrsprachig } from '@/lib/db/schema/typen';
import { waehle, type Sprache } from '@/lib/i18n/inhalt';

/**
 * Mehrsprachiger Datenbanktext mit sichtbarem Rückfall (K-02, ADR 0002): Fehlt die Sprache, erscheint
 * der deutsche Text mit lang="de" (Screenreader sprechen ihn richtig aus).
 */
export function Text({
  feld,
  sprache,
  als: Tag = 'span',
  className,
}: {
  feld: Mehrsprachig | null | undefined;
  sprache: Sprache;
  als?: 'span' | 'p' | 'h2' | 'h3' | 'strong';
  className?: string;
}) {
  const w = waehle(feld, sprache);
  if (!w.text) return null;
  return (
    <Tag lang={w.rueckfall ? 'de' : undefined} className={className}>
      {w.text}
    </Tag>
  );
}

export function textMitSprache(feld: Mehrsprachig | null | undefined, sprache: Sprache) {
  const w = waehle(feld, sprache);
  return { text: w.text, lang: w.rueckfall ? 'de' : undefined };
}
