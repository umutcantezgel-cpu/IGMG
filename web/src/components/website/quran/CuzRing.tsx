import type { CSSProperties } from 'react';
import { Achtstern } from '@/components/website/Icons';

/** Punkt auf dem Kreis um (160, 160); Winkel in Grad, 0 = oben, im Uhrzeigersinn. */
function punkt(r: number, grad: number): string {
  const rad = ((grad - 90) * Math.PI) / 180;
  return `${(160 + r * Math.cos(rad)).toFixed(2)} ${(160 + r * Math.sin(rad)).toFixed(2)}`;
}

const AUSSEN = 152;
/** Achtstern in der Mitte der kleinen Rosette (Quadrat und um 45° gedrehtes Quadrat, Umriss der Vereinigung). */
const ACHTSTERN_MITTE =
  'M160 104 176.4 120.4h23.2v23.2L216 160l-16.4 16.4v23.2h-23.2L160 216l-16.4-16.4h-23.2v-23.2L104 160l16.4-16.4v-23.2h23.2z';
const INNEN = 102;
const LUECKE = 1.2;
/** K-007: höchstens 8 Elemente je Staffel. Die 30 Cüz treten als 6 Sechstel zu je 5 auf (6 Staffelschritte). */
export const STAFFEL_GRUPPEN = 6;

/** Staffelschritt eines Segments: Gruppe 0 … STAFFEL_GRUPPEN − 1, im Uhrzeigersinn wie die Linie. */
export function staffelGruppe(i: number, n: number): number {
  return Math.floor(i / Math.ceil(n / STAFFEL_GRUPPEN));
}

/** Ringsegment i von n als Fläche (Kreisringausschnitt) mit kleiner Lücke. */
function segment(i: number, n: number): string {
  const schritt = 360 / n;
  const a0 = i * schritt + LUECKE / 2;
  const a1 = (i + 1) * schritt - LUECKE / 2;
  return `M${punkt(AUSSEN, a0)}A${AUSSEN} ${AUSSEN} 0 0 1 ${punkt(AUSSEN, a1)}L${punkt(INNEN, a1)}A${INNEN} ${INNEN} 0 0 0 ${punkt(INNEN, a0)}Z`;
}

/**
 * Cüz-Ring der Übersicht (O-Q01, Erzählansicht /quran): 30 Segmente im Kreis, jedes führt zu seinem Cüz. Eine
 * Linie zeichnet sich einmal um den Ring (B-06-Kurve, `linie-zeichnet`), die Segmente treten in sechs Gruppen zu fünf
 * Cüz gestaffelt auf (`--gruppe`, Versatz `staffel`; K-007: ≤ 8 je Staffel, vorher 30 Einzelschritte); bei reduzierter
 * Bewegung steht der Ring sofort (Endzustand). Der Ring ist Zeigerbedienung und Bild zugleich:
 * Für Tastatur und Screenreader steht daneben die Liste der 30 Cüz (48-px-Ziele), deshalb ist er hier verborgen.
 * `schmuck`: kleine Rosette neben der Überschrift (Telefon, Sichtabnahme K-4) – ohne Links, Zahlen und Mitte; die
 * Auswahl trägt dort allein das Zahlenraster.
 */
export function CuzRing({
  eintraege,
  mitte,
  schmuck = false,
}: {
  eintraege: { nr: number; href: string }[];
  mitte: string;
  schmuck?: boolean;
}) {
  const n = eintraege.length || 30;
  if (schmuck) {
    return (
      // Eigene Klassen (nicht .cuz-ring/.cuz-segment): ruhig, ohne Staffel, und nicht als zweiter Ring gezählt
      <svg viewBox="0 0 320 320" aria-hidden="true" className="cuz-rosette pointer-events-none size-full overflow-visible">
        <circle cx="160" cy="160" r={AUSSEN + 6} className="fill-none stroke-gruen-700" strokeWidth={8} />
        {eintraege.map((e, i) => (
          <path key={e.nr} d={segment(i, n)} className={i % 2 ? 'fill-gruen-100' : 'fill-gruen-50'} />
        ))}
        <path d={ACHTSTERN_MITTE} className="fill-gruen-700" />
      </svg>
    );
  }
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
          <a key={e.nr} href={e.href} tabIndex={-1} style={{ '--gruppe': staffelGruppe(i, n) } as CSSProperties}>
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
