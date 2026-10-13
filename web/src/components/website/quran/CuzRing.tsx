import type { CSSProperties } from 'react';
import { Achtstern } from '@/components/website/Icons';

/** Punkt auf dem Kreis um (160, 160); Winkel in Grad, 0 = oben, im Uhrzeigersinn. */
function punkt(r: number, grad: number): string {
  const rad = ((grad - 90) * Math.PI) / 180;
  return `${(160 + r * Math.cos(rad)).toFixed(2)} ${(160 + r * Math.sin(rad)).toFixed(2)}`;
}

const AUSSEN = 152;
const INNEN = 102;
const LUECKE = 1.2;

/** Ringsegment i von n als Fläche (Kreisringausschnitt) mit kleiner Lücke. */
function segment(i: number, n: number): string {
  const schritt = 360 / n;
  const a0 = i * schritt + LUECKE / 2;
  const a1 = (i + 1) * schritt - LUECKE / 2;
  return `M${punkt(AUSSEN, a0)}A${AUSSEN} ${AUSSEN} 0 0 1 ${punkt(AUSSEN, a1)}L${punkt(INNEN, a1)}A${INNEN} ${INNEN} 0 0 0 ${punkt(INNEN, a0)}Z`;
}

/**
 * Cüz-Ring der Übersicht (O-Q01, Erzählansicht /quran): 30 Segmente im Kreis, jedes führt zu seinem Cüz. Eine
 * Linie zeichnet sich einmal um den Ring (B-06-Kurve, `linie-zeichnet`), die Segmente treten gestaffelt auf; bei
 * reduzierter Bewegung und ohne JavaScript steht der Ring sofort. Der Ring ist Zeigerbedienung und Bild zugleich:
 * Für Tastatur und Screenreader steht daneben die Liste der 30 Cüz (48-px-Ziele), deshalb ist er hier verborgen.
 */
export function CuzRing({ eintraege, mitte }: { eintraege: { nr: number; href: string }[]; mitte: string }) {
  const n = eintraege.length || 30;
  return (
    <svg viewBox="0 0 320 320" aria-hidden="true" className="cuz-ring size-full overflow-visible">
      <path
        d={`M160 ${160 - AUSSEN - 6}A${AUSSEN + 6} ${AUSSEN + 6} 0 1 1 159.99 ${160 - AUSSEN - 6}`}
        pathLength={1}
        className="linie-zeichnet fill-none stroke-gruen-700"
        strokeWidth={2}
        strokeLinecap="round"
      />
      {eintraege.map((e, i) => {
        const mittelwinkel = (i + 0.5) * (360 / n);
        const [x, y] = punkt((AUSSEN + INNEN) / 2, mittelwinkel).split(' ');
        return (
          <a key={e.nr} href={e.href} tabIndex={-1} style={{ '--i': i } as CSSProperties}>
            <path d={segment(i, n)} className="cuz-segment" />
            <text x={x} y={y} textAnchor="middle" dominantBaseline="central" className="cuz-zahl">
              {e.nr}
            </text>
          </a>
        );
      })}
      <foreignObject x="96" y="96" width="128" height="128">
        <div className="flex size-full flex-col items-center justify-center gap-1 text-center">
          <Achtstern size={40} className="text-gruen-700" />
          <span className="font-display text-20 leading-tight font-semibold text-tinte">{mitte}</span>
        </div>
      </foreignObject>
    </svg>
  );
}
