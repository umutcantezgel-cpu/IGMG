import type { CSSProperties } from 'react';

/**
 * Achtstern-Medaillon mit Nummer (Formensprache K-008: Achtstern, 2-px-Strich). Umriss der Vereinigung zweier Quadrate
 * (48er-Raster), die Nummer in der Mitte. Ohne Hooks, ohne next-intl – auch in Client-Inseln nutzbar.
 * `morph`: Markierung für den Seitenwechsel (Karte → Kopf, morph.ts); `stil`: fester Übergangsname auf der Zielseite.
 */
const STERN = 'M24 2.8 30.2 9H39v8.8l6.2 6.2-6.2 6.2V39h-8.8L24 45.2 17.8 39H9v-8.8L2.8 24 9 17.8V9h8.8z';

const GROESSEN = {
  klein: { kasten: 'size-11', zahl: 'text-16' },
  mittel: { kasten: 'size-14', zahl: 'text-18' },
  gross: { kasten: 'size-20', zahl: 'text-24' },
} as const;

export function Medaillon({
  nr,
  groesse = 'klein',
  flaeche = 'fill-weiss',
  morph,
  stil,
  className = '',
}: {
  nr: number;
  groesse?: keyof typeof GROESSEN;
  /** Füllung des Sterns (Klasse) */
  flaeche?: string;
  morph?: string;
  stil?: CSSProperties;
  className?: string;
}) {
  const g = GROESSEN[groesse];
  return (
    <span data-morph={morph} style={stil} className={`relative inline-grid shrink-0 place-items-center ${g.kasten} ${className}`}>
      <svg viewBox="0 0 48 48" aria-hidden="true" className="absolute inset-0 size-full overflow-visible">
        <path
          d={STERN}
          className={`${flaeche} stroke-gruen-700`}
          strokeWidth={2}
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        <circle cx="24" cy="24" r="12.5" className="fill-none stroke-gruen-700/30" strokeWidth={1} vectorEffect="non-scaling-stroke" />
      </svg>
      <span className={`relative font-display leading-none font-semibold text-gruen-800 tabular-nums ${g.zahl}`}>{nr}</span>
    </span>
  );
}
