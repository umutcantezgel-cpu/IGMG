/** Achtstern (Geometrie wie `LernStern`, 24er-Raster). */
const STERN = 'M12 3.5 14.5 6H18v3.5l2.5 2.5-2.5 2.5V18h-3.5L12 20.5 9.5 18H6v-3.5L3.5 12 6 9.5V6h3.5z';

/**
 * Lektion abgeschlossen (B-30, großer Moment, KERN 4.0 §10): Der Achtstern-Ring zeichnet sich einmal (`linie-zeichnet`
 * mit `--dauer-moment` = 1,2 s, also ≤ 1,6 s); Ergebnis, XP und Tagesziel stehen daneben statisch – nichts zählt hoch.
 * Reduziert: Endzustand (globals.css setzt die Animation von `linie-zeichnet` aus). Rein dekorativ (`aria-hidden`).
 */
export function Abschluss() {
  return (
    <svg aria-hidden viewBox="2 2 20 20" fill="none" strokeLinejoin="round" className="size-16 shrink-0 text-gruen-700">
      <path d={STERN} stroke="currentColor" strokeWidth={0.75} className="opacity-25" />
      <path d={STERN} stroke="currentColor" strokeWidth={1.5} pathLength={1} className="linie-zeichnet" />
    </svg>
  );
}
