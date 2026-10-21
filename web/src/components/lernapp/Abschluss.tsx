import type de from '../../../messages/lernapp/de.json';
import type { AbzeichenTexte } from './Abzeichen';
import type { SerieTexte } from './Serie';

/*
 * Abschluss einer Lektion in zwei Teilen (KERN 4.0 §9: Spieler-Budget): Ring und Tagesziel-Ring hier, klein und im
 * Spieler-Chunk; Tagesziel-Text, Serie und neue Abzeichen in `AbschlussInhalt.tsx`, einem eigenen Chunk, den die Insel
 * nach der Lektion zusammen mit der Ableitung lädt (`nachDerLektion`).
 */

/** Achtstern (Geometrie wie `LernStern`, 24er-Raster). */
const STERN = 'M12 3.5 14.5 6H18v3.5l2.5 2.5-2.5 2.5V18h-3.5L12 20.5 9.5 18H6v-3.5L3.5 12 6 9.5V6h3.5z';
/** Kreis, der oben beginnt und im Uhrzeigersinn läuft (in `rtl` gespiegelt). */
const KREIS = 'M12 2a10 10 0 1 1 0 20a10 10 0 1 1 0-20';

/** Texte des Abschlussbildschirms (Namensräume `abschluss`, `serie`, `abzeichen`). */
export type AbschlussTexte = { abschluss: (typeof de)['abschluss']; serie: SerieTexte; abzeichen: AbzeichenTexte };

/**
 * Lektion abgeschlossen (B-30, großer Moment, KERN 4.0 §10): Der Achtstern-Ring zeichnet sich einmal (`linie-zeichnet`
 * mit `--dauer-moment` = 1,2 s, also ≤ 1,6 s); Ergebnis, XP und Tagesziel stehen daneben statisch – nichts zählt hoch.
 * Reduziert: Endzustand (globals.css setzt die Animation von `linie-zeichnet` aus). Rein dekorativ (`aria-hidden`).
 */
export function AbschlussRing() {
  return (
    <svg aria-hidden viewBox="2 2 20 20" fill="none" strokeLinejoin="round" className="size-16 shrink-0 text-gruen-700">
      <path d={STERN} stroke="currentColor" strokeWidth={0.75} className="opacity-25" />
      <path d={STERN} stroke="currentColor" strokeWidth={1.5} pathLength={1} className="linie-zeichnet" />
    </svg>
  );
}

/** Tagesziel als Ring (statisch, ohne Übergang): Anteil 0–1 des Ziels; dekorativ, der Text daneben sagt dasselbe. */
export function ZielRing({ anteil }: { anteil: number }) {
  const a = Math.max(0, Math.min(1, anteil));
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className="size-12 shrink-0 rtl:-scale-x-100">
      <path d={KREIS} strokeWidth={3} className="stroke-gruen-50" />
      {a > 0 ? (
        <path d={KREIS} pathLength={1} strokeDasharray={`${a} 1`} strokeWidth={3} strokeLinecap="round" className="stroke-gruen-700" />
      ) : null}
    </svg>
  );
}
