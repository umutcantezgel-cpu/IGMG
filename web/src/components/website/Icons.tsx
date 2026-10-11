import type { SVGProps } from 'react';

/**
 * Eigene Zeichen, die lucide-react 1.x nicht (mehr) enthält – Pfade aus design/Icon.dc.html
 * (Lucide-Pfade, ISC; „stern8“ aus dem Designsystem). Strich 2 px wie Lucide.
 */
type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Basis({ size = 20, children, ...rest }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...rest}
    >
      {children}
    </svg>
  );
}

/** Achtzackiger Stern – nur als kleines Zeichen vor Abschnittskennungen (readme, Ikonografie). */
export function Stern8(props: IconProps) {
  return (
    <Basis size={14} {...props}>
      <path d="M6 6h12v12H6zM12 3.5l8.5 8.5-8.5 8.5L3.5 12z" />
    </Basis>
  );
}

export function Facebook(props: IconProps) {
  return (
    <Basis {...props}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </Basis>
  );
}

export function Instagram(props: IconProps) {
  return (
    <Basis {...props}>
      <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zM16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zM17.5 6.5h.01" />
    </Basis>
  );
}

export function Youtube(props: IconProps) {
  return (
    <Basis {...props}>
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17M10 15l5-3-5-3z" />
    </Basis>
  );
}
