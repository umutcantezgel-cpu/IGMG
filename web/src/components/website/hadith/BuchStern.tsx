import type { CSSProperties } from 'react';
import { cn } from '@/lib/utils';

/** Achtstern im 48er-Raster (Kern K-008): Quadrat 12–36 und dasselbe Quadrat um 45° gedreht, Umriss der Vereinigung. */
const ACHTSTERN_48 = 'M24 7 29 12h7v7l5 5-5 5v7h-7l-5 5-5-5h-7v-7l-5-5 5-5v-7h7z';

const ART = {
  // Kachel: Sandfläche mit 2-px-Strich, beim Überfahren der Karte tiefgrün (REFERENZ §2, wie die Suren-Kacheln)
  kachel: {
    rahmen: 'size-14',
    stern: 'fill-sand stroke-gruen-700 transition duration-(--dauer-rueckmeldung) group-hover:fill-gruen-700',
    zahl: 'text-16 text-gruen-800 transition duration-(--dauer-rueckmeldung) group-hover:text-weiss',
  },
  // Kopf der Buchseite: gefüllte Marke (Morph-Ziel der Kachel)
  kopf: { rahmen: 'size-18 md:size-24', stern: 'fill-gruen-700 stroke-gruen-700', zahl: 'text-24 text-weiss md:text-30' },
} as const;

/**
 * Buchnummer im Achtstern (Hadith-Buchraster und Kopf der Buchseite). Dekorativ: Die Nummer steht für Hilfsmittel im
 * Linktext bzw. in der Kennung. `morph` markiert die Kachel-Marke für den Seitenwechsel, `stil` trägt den festen
 * Übergangsnamen auf der Buchseite (morph.ts).
 */
export function BuchStern({
  nr,
  art,
  morph,
  stil,
  className,
}: {
  nr: number;
  art: keyof typeof ART;
  morph?: string;
  stil?: CSSProperties;
  className?: string;
}) {
  const a = ART[art];
  return (
    <span
      aria-hidden
      data-morph={morph}
      style={stil}
      className={cn('relative inline-flex shrink-0 items-center justify-center', a.rahmen, className)}
    >
      <svg viewBox="0 0 48 48" className="absolute inset-0 size-full overflow-visible">
        <path d={ACHTSTERN_48} strokeWidth={2} strokeLinejoin="round" vectorEffect="non-scaling-stroke" className={a.stern} />
      </svg>
      <span className={cn('relative font-bold tabular-nums', a.zahl)}>{nr}</span>
    </span>
  );
}
