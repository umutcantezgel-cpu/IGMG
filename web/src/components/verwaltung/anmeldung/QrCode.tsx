import { encode } from 'uqr';

/** QR-Code als SVG aus React-Elementen (kein innerHTML). Schwarz auf Weiß mit Ruhezone; der Rahmen gehört der Karte darum. */
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
      className="block bg-weiss"
    >
      <title>{titel}</title>
      <rect width={size} height={size} className="fill-weiss" />
      <path d={pfad} className="fill-tinte" />
    </svg>
  );
}
