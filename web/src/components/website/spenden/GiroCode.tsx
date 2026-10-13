import { encode } from 'uqr';

/**
 * GiroCode (EPC-QR, AUFTRAG 3.10) als statisches SVG aus React-Elementen (kein innerHTML, kein Skript): Fehlerkorrektur
 * „M“ wie von EPC069-12 verlangt, Ruhezone 4 Module. Schwarz auf Weiß, damit jede Kamera ihn liest; die Bedeutung trägt
 * `titel` (role="img"). Erzeugt mit `uqr` wie der QR-Code der Zwei-Faktor-Einrichtung.
 */
export function GiroCode({ nutzlast, titel, className }: { nutzlast: string; titel: string; className?: string }) {
  const { data, size } = encode(nutzlast, { ecc: 'M', border: 4 });
  const pfad = data.flatMap((zeile, y) => zeile.map((an, x) => (an ? `M${x} ${y}h1v1h-1z` : ''))).join('');
  return (
    <svg role="img" aria-label={titel} viewBox={`0 0 ${size} ${size}`} shapeRendering="crispEdges" className={className}>
      <title>{titel}</title>
      <rect width={size} height={size} className="fill-weiss" />
      <path d={pfad} className="fill-tinte" />
    </svg>
  );
}
