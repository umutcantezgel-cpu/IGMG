import type { LektionsArt } from '@/lib/lernapp/engine/xp';

/** Lektionsarten, die der Lernpfad in der Liste der Lektionen benennt (L4-03). */
export type BenannteArt = Extract<LektionsArt, 'geschichte' | 'pruefstein'>;

/**
 * Marke an einer Lektion im Lernpfad: Geschichten und Prüfsteine sind als solche benannt (L4-03, PLAN §4 `geschichte`,
 * ADR 0043 Nr. 5); andere Arten tragen keine Marke. Text aus `ansichten.stufen.art`.
 */
export function LektionsArtMarke({ art, texte }: { art: LektionsArt; texte: Record<BenannteArt, string> }) {
  if (art !== 'geschichte' && art !== 'pruefstein') return null;
  return <span className="rounded-pill bg-sand px-3 text-16 font-normal text-tinte-2">{texte[art]}</span>;
}
