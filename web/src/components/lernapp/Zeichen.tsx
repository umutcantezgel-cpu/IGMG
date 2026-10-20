import type { SVGProps } from 'react';

/**
 * Achtstern der Lern-App (Formensprache KERN 3.0, gleiche Geometrie wie `Achtstern` der Website): als Fläche oder als
 * 2-px-Linie im 24er-Raster. Rein dekorativ (`aria-hidden`); der Text steht immer daneben.
 */
export function LernStern({ linie = false, ...rest }: SVGProps<SVGSVGElement> & { linie?: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill={linie ? 'none' : 'currentColor'}
      stroke={linie ? 'currentColor' : 'none'}
      strokeWidth={linie ? 2 : undefined}
      strokeLinejoin="round"
      {...rest}
    >
      <path d="M12 3.5 14.5 6H18v3.5l2.5 2.5-2.5 2.5V18h-3.5L12 20.5 9.5 18H6v-3.5L3.5 12 6 9.5V6h3.5z" />
    </svg>
  );
}
