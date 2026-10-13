import type { CSSProperties } from 'react';
import type { CuzStand } from '@/lib/hatim/dienst';
import { klassen } from '@/lib/klassen';

/**
 * Hatim-Ring (B-19, AUFTRAG 4): 30 Segmente im Kreis, eines je Cüz, im Uhrzeigersinn ab oben. Der Stand ist nie nur
 * an der Farbe erkennbar: frei = leerer Umriss, übernommen = Schraffur, gelesen = volle Fläche. Außen zeichnet sich der
 * Fortschrittsbogen (gelesene Cüz) einmal per CSS (`linie-zeichnet`, pathLength 1); bei reduzierter Bewegung steht er
 * sofort. Die Zahl in der Mitte zählt nie hoch. Reine Server-Komponente; die Bedeutung trägt `aria-label`.
 */
const MITTE = 120;
const INNEN = 76;
const AUSSEN = 102;
const BOGEN = 113;
const SEGMENT = 12;
const LUECKE = 2.4;

function punkt(r: number, grad: number): string {
  const b = ((grad - 90) * Math.PI) / 180;
  return `${(MITTE + r * Math.cos(b)).toFixed(2)} ${(MITTE + r * Math.sin(b)).toFixed(2)}`;
}

function segment(i: number): string {
  const a0 = i * SEGMENT + LUECKE / 2;
  const a1 = (i + 1) * SEGMENT - LUECKE / 2;
  return `M${punkt(AUSSEN, a0)} A${AUSSEN} ${AUSSEN} 0 0 1 ${punkt(AUSSEN, a1)} L${punkt(INNEN, a1)} A${INNEN} ${INNEN} 0 0 0 ${punkt(INNEN, a0)}Z`;
}

/** Fortschrittsbogen von oben im Uhrzeigersinn über `anteil` (0…1) des Kreises. */
export function fortschrittsPfad(anteil: number): string | null {
  if (anteil <= 0) return null;
  if (anteil >= 1) return `M${punkt(BOGEN, 0)} A${BOGEN} ${BOGEN} 0 1 1 ${punkt(BOGEN, 180)} A${BOGEN} ${BOGEN} 0 1 1 ${punkt(BOGEN, 360)}`;
  const grad = anteil * 360;
  return `M${punkt(BOGEN, 0)} A${BOGEN} ${BOGEN} 0 ${grad > 180 ? 1 : 0} 1 ${punkt(BOGEN, grad)}`;
}

export const STAND_KLASSE: Record<CuzStand, string> = {
  frei: 'fill-weiss stroke-rand',
  vergeben: 'stroke-gruen-700',
  gelesen: 'fill-gruen-700 stroke-gruen-700',
};

/** Schraffur für „übernommen“ (Muster statt nur Farbe, WCAG 1.4.1). */
export function Schraffur({ id }: { id: string }) {
  return (
    <pattern id={id} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="6" height="6" className="fill-gruen-50" />
      <line x1="1.5" y1="0" x2="1.5" y2="6" className="stroke-gruen-700" strokeWidth="2.5" />
    </pattern>
  );
}

export function HatimRing({
  kennung,
  teile,
  label,
  mitte,
  zeichnen = false,
  className,
  stil,
}: {
  /** eindeutig je Seite (Muster-ID) */
  kennung: string;
  teile: readonly CuzStand[];
  label: string;
  /** Zahl und Zeile in der Mitte (statisch) */
  mitte: { zahl: string; text: string };
  /** B-19: Fortschrittsbogen zeichnet sich einmal (nur ein Ring je Bildschirmhöhe) */
  zeichnen?: boolean;
  className?: string;
  stil?: CSSProperties;
}) {
  const muster = `hatim-schraffur-${kennung}`;
  const gelesen = teile.filter((t) => t === 'gelesen').length;
  const pfad = fortschrittsPfad(gelesen / 30);
  return (
    <div className={klassen('relative aspect-square', className)} style={stil} data-morph="ring">
      <svg viewBox="0 0 240 240" role="img" aria-label={label} className="absolute inset-0 size-full">
        <defs>
          <Schraffur id={muster} />
        </defs>
        <circle cx={MITTE} cy={MITTE} r={BOGEN} fill="none" className="stroke-linie" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        {pfad ? (
          <path
            d={pfad}
            fill="none"
            pathLength={1}
            className={klassen('stroke-gruen-700', zeichnen && 'linie-zeichnet')}
            strokeWidth="5"
            strokeLinecap="round"
            style={zeichnen ? ({ '--dauer': 'var(--dauer-moment)' } as CSSProperties) : undefined}
          />
        ) : null}
        {teile.map((stand, i) => (
          <path
            key={i}
            d={segment(i)}
            data-stand={stand}
            className={STAND_KLASSE[stand]}
            fill={stand === 'vergeben' ? `url(#${muster})` : undefined}
            strokeWidth="2"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
      <div aria-hidden="true" className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-display text-36 leading-none font-semibold text-gruen-800 tabular-nums">{mitte.zahl}</span>
        <span className="mt-1 max-w-24 text-16 leading-tight text-tinte-2">{mitte.text}</span>
      </div>
    </div>
  );
}

/** Kleines Zeichen eines Stands für Legende und Cüz-Liste (gleiches Muster wie im Ring). */
export function StandZeichen({ stand, kennung }: { stand: CuzStand; kennung: string }) {
  const muster = `hatim-legende-${kennung}`;
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="size-5 shrink-0">
      {stand === 'vergeben' ? (
        <defs>
          <Schraffur id={muster} />
        </defs>
      ) : null}
      <rect
        x="2"
        y="2"
        width="16"
        height="16"
        rx="3"
        className={STAND_KLASSE[stand]}
        fill={stand === 'vergeben' ? `url(#${muster})` : undefined}
        strokeWidth="2"
      />
    </svg>
  );
}
