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
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

/**
 * Achtstern als Fläche (Kern K-008): Quadrat 6–18 und dasselbe Quadrat um 45° gedreht (Spitzen bei 3,5 und 20,5),
 * als Umriss der Vereinigung. Für Marken, die auch klein als Stern lesbar sein müssen (Tagesbogen: nächstes Gebet).
 */
export function Achtstern({ size = 20, ...rest }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...rest}>
      <path d="M12 3.5 14.5 6H18v3.5l2.5 2.5-2.5 2.5V18h-3.5L12 20.5 9.5 18H6v-3.5L3.5 12 6 9.5V6h3.5z" />
    </svg>
  );
}

/**
 * Achtzackiger Stern – nur als kleines Zeichen vor Abschnittskennungen (readme, Ikonografie). Als Fläche gezeichnet:
 * Der frühere 2-px-Umriss las sich in 14 px wie ein Zahnrad (Sichtprüfung E2).
 */
export function Stern8({ size = 14, ...rest }: IconProps) {
  return <Achtstern size={size} {...rest} />;
}

/**
 * Nachtzeichen für Imsak und Yatsı (MN-27 „ersetzen“: keine Mondsichel, K-008): Stern über dem Horizont. Der große Stern
 * sind die vier Spitzen des Achtsterns (Spitzen der gedrehten Quadrathälfte, Innenecken auf den Diagonalen), der kleine
 * die gedrehte Hälfte selbst (Raute, als Fläche – so klein läse sich ein Umriss nicht). Horizont wie bei Lucide
 * `Sunrise`/`Sunset` (M22 22H2), damit die sechs Tageszeiten eine Familie bleiben: 24-px-Raster, 2-px-Strich, runde Enden.
 * Dekorativ (`aria-hidden` aus `Basis`); der Name des Gebets steht immer daneben.
 */
export function Nachtzeichen(props: IconProps) {
  return (
    <Basis {...props}>
      <path d="M22 22H2" />
      <path d="M10 5l1.4 5.6L17 12l-5.6 1.4L10 19l-1.4-5.6L3 12l5.6-1.4z" />
      <path d="M18.5 3l2 2-2 2-2-2z" fill="currentColor" stroke="none" />
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
