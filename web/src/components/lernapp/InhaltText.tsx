import { richtung, type UiSprache } from './typen';

/**
 * Inhalt in seiner eigenen Sprache (KERN §7): `lang` und `dir` an jedem Text, Arabisch in der Kursschrift
 * (`--font-arabic`, Zeilenhöhe der Token `--text-arabisch-*`, Harakat werden nie abgeschnitten).
 */
export function InhaltText({ inhalt, gross = false }: { inhalt: { text: string; sprache: UiSprache }; gross?: boolean }) {
  const klasse = inhalt.sprache === 'ar' ? (gross ? 'font-arabic text-arabisch-1' : 'font-arabic text-arabisch-3') : undefined;
  return (
    <span lang={inhalt.sprache} dir={richtung(inhalt.sprache)} className={klasse}>
      {inhalt.text}
    </span>
  );
}

/** Fremdsprachiger Wert in einem Satz der Oberfläche: Richtung isolieren (wie `<bdi>`, für reine Texte der Live-Region). */
export const isoliert = (text: string): string => `\u2068${text}\u2069`;
