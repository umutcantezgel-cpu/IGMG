import { klassen } from '@/lib/klassen';

/**
 * Achtstern-Marke für besondere Tage (AUFTRAG 4: Kalender und Ramadan mit Achtstern-Marken, keine Mondsichel):
 * gefüllt = bestätigt, Umriss (2 px) = vorläufig. Dekorativ – die Bedeutung steht immer als Text daneben.
 */
const STERN = 'M12 3.5 14.5 6H18v3.5l2.5 2.5-2.5 2.5V18h-3.5L12 20.5 9.5 18H6v-3.5L3.5 12 6 9.5V6h3.5z';

export function SternMarke({ vorlaeufig, className }: { vorlaeufig: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={klassen('shrink-0', className)}>
      <path
        d={STERN}
        className={vorlaeufig ? 'fill-weiss stroke-gruen-700' : 'fill-gruen-700 stroke-gruen-700'}
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Punkt für eine Veranstaltung (Ring statt Fläche, damit er neben dem Stern unterscheidbar bleibt). */
export function TerminMarke({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" aria-hidden="true" className={klassen('shrink-0', className)}>
      <circle cx="6" cy="6" r="4" className="fill-info-toenung stroke-info" strokeWidth="2" />
    </svg>
  );
}
