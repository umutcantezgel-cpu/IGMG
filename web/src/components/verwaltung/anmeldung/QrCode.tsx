import { encode } from 'uqr';

/** QR-Code als SVG aus React-Elementen (kein innerHTML). Schwarz auf Weiß mit Ruhezone. */
export function QrCode({ text, titel, groesse = 224 }: { text: string; titel: string; groesse?: number }) {
  const { data, size } = encode(text, { ecc: 'M', border: 2 });
  const pfad = data.flatMap((zeile, y) => zeile.map((an, x) => (an ? `M${x} ${y}h1v1h-1z` : ''))).join('');
  return (
    <svg
      role="img"
      aria-label={titel}
      viewBox={`0 0 ${size} ${size}`}
      width={groesse}
      height={groesse}
      shapeRendering="crispEdges"
      className="rounded-md border border-linie bg-weiss"
    >
      <title>{titel}</title>
      <rect width={size} height={size} fill="#FFFFFF" />
      <path d={pfad} fill="#1D1A17" />
    </svg>
  );
}
