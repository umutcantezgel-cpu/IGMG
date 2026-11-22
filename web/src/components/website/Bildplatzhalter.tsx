import { cn } from '@/lib/utils';
import { Achtstern } from './Icons';

/**
 * Bildfläche ohne Foto: ruhiges Markenmotiv (Achtstern-Gitter auf hellem Grün, in der Mitte ein Achtstern) statt der
 * früheren beschrifteten Streifen („Foto: …“, M-018). Solange die Gemeinde kein Foto hinterlegt hat, wirkt die Fläche
 * gestaltet und nicht leer – ohne etwas vorzutäuschen: keine generierten Moscheebilder, keine Kuppel- oder
 * Halbmondgrafik. Rein dekorativ (`aria-hidden`); `beschriftung` nennt weiterhin, welches Foto hierher gehört – nur noch
 * für den Code (Aufrufer bleiben unverändert), auf der Seite steht sie nicht.
 */
export function Bildplatzhalter({
  className,
  morph,
}: {
  /** Welches Foto hierher gehört (nur Dokumentation im Aufruf; nicht sichtbar) */
  beschriftung: string;
  className?: string;
  /** Früher: kurze sichtbare Beschriftung; ohne Wirkung */
  kurz?: string;
  /** Früher: kurze Beschriftung unter 768 px; ohne Wirkung */
  kurzBisMd?: string;
  /** Markierung für den Seitenwechsel (O-13): SeitenUebergang vergibt beim Klick den Übergangsnamen */
  morph?: string;
  /** Früher: Sprache der Beschriftung; ohne Wirkung */
  lang?: string;
}) {
  return (
    <div
      aria-hidden="true"
      data-morph={morph}
      data-bildflaeche
      className={cn('flex items-center justify-center overflow-hidden achtstern-flaeche text-gruen-700/25', className)}
    >
      <Achtstern className="h-2/5 max-h-24 min-h-6 w-auto" />
    </div>
  );
}
