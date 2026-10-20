import type { ReactNode } from 'react';

/** Achtstern (Geometrie wie `LernStern`, 24er-Raster). */
const STERN = 'M12 3.5 14.5 6H18v3.5l2.5 2.5-2.5 2.5V18h-3.5L12 20.5 9.5 18H6v-3.5L3.5 12 6 9.5V6h3.5z';

/**
 * Abzeichen (ADR 0043 Nr. 5, B-34): Form aus der Achtstern-Geometrie mit einem Symbol in der Mitte, daneben der Name.
 * Ein neu erhaltenes Abzeichen erscheint mit Deckkraft und Skalierung 0,96 → 1 (wie B-14), rein in CSS über
 * `@starting-style` (Tailwind `starting:`); reduziert nur Deckkraft. Ohne Unterstützung im Browser steht es sofort da.
 * „Stufe abgeschlossen“ heißt nie „Zertifikat“ (KERN 4.0 §1). Die Arten und ihre Ableitung folgen in L7 (`abzeichen.ts`).
 */
export function Abzeichen({
  name,
  symbol,
  neu = false,
  neuText,
}: {
  name: string;
  /** Symbol der Oberfläche (Lucide, 24er-Raster) */
  symbol?: ReactNode;
  /** gerade erhalten: Auftritt B-34 und Hinweis `neuText` */
  neu?: boolean;
  neuText?: string;
}) {
  const auftritt = neu
    ? 'transition duration-(--dauer-auftritt) ease-eintritt starting:scale-96 starting:opacity-0 motion-reduce:starting:scale-100'
    : '';
  return (
    <figure className={`flex flex-col items-center gap-2 text-center ${auftritt}`}>
      <span className="relative inline-flex size-20 items-center justify-center text-gruen-700">
        <svg aria-hidden viewBox="2.5 2.5 19 19" className="absolute inset-0 size-full">
          <path d={STERN} className="fill-gruen-50 stroke-gruen-700" strokeWidth={1.5} strokeLinejoin="round" />
        </svg>
        {symbol ? <span className="relative">{symbol}</span> : null}
      </span>
      <figcaption className="text-16 font-bold">
        {name}
        {neu && neuText ? <span className="block font-normal text-tinte-2">{neuText}</span> : null}
      </figcaption>
    </figure>
  );
}
