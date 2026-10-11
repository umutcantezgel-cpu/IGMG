import type { CSSProperties } from 'react';
import { klassen } from '@/lib/klassen';

/**
 * Zustandsgrafiken (Kern K-008): großer Achtstern als Fläche mit Umriss, darin ein Zeichen aus der Icon-Familie.
 * Raster 96 px = 4 × 24 px, Strich 2 px, runde Enden. Dekorativ (`aria-hidden`): Die Bedeutung trägt immer der Text
 * daneben. Ohne Abhängigkeiten (Lucide-Pfade inline, ISC), damit auch die Fehlergrenze sie nutzen kann (K-12).
 * „erfolg“ zeichnet sein Häkchen einmal (B-11); bei reduzierter Bewegung steht es sofort.
 */
export type Zustand = 'leer' | 'fehler' | 'erfolg' | 'offline' | 'nichtGefunden';

/** Umriss der Vereinigung aus Quadrat (24–72) und demselben Quadrat um 45° gedreht (Spitzen bei 14 und 82). */
const ACHTSTERN_96 = 'M48 14 58 24h14v14l10 10-10 10v14H58L48 82 38 72H24V58L14 48l10-10V24h14z';

const FARBE: Record<Zustand, { flaeche: string; linie: string; zeichen: string }> = {
  leer: { flaeche: 'fill-sand', linie: 'stroke-rand', zeichen: 'text-tinte-2' },
  fehler: { flaeche: 'fill-fehler-toenung', linie: 'stroke-fehler', zeichen: 'text-fehler' },
  erfolg: { flaeche: 'fill-gruen-50', linie: 'stroke-gruen-700', zeichen: 'text-gruen-700' },
  offline: { flaeche: 'fill-info-toenung', linie: 'stroke-info', zeichen: 'text-info' },
  nichtGefunden: { flaeche: 'fill-sand', linie: 'stroke-gruen-700', zeichen: 'text-gruen-800' },
};

/** Lucide-Pfade (ISC): inbox, circle-alert, wifi-off, compass. */
const ZEICHEN: Record<Exclude<Zustand, 'erfolg'>, string[]> = {
  leer: [
    'M22 12h-6l-2 3h-4l-2-3H2',
    'M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z',
  ],
  fehler: ['M12 2a10 10 0 1 0 0 20 10 10 0 1 0 0-20z', 'M12 8v4', 'M12 16h.01'],
  offline: [
    'M12 20h.01',
    'M8.5 16.429a5 5 0 0 1 7 0',
    'M5 12.859a10 10 0 0 1 5.17-2.69',
    'M19 12.859a10 10 0 0 0-2.007-1.523',
    'M2 8.82a15 15 0 0 1 4.177-2.643',
    'M22 8.82a15 15 0 0 0-11.288-3.764',
    'm2 2 20 20',
  ],
  nichtGefunden: [
    'm16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z',
    'M12 2a10 10 0 1 0 0 20 10 10 0 1 0 0-20z',
  ],
};

export function Zustandsgrafik({ art, groesse = 96, className }: { art: Zustand; groesse?: number; className?: string }) {
  const farbe = FARBE[art];
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={groesse}
      height={groesse}
      viewBox="0 0 96 96"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={klassen('shrink-0', farbe.zeichen, className)}
    >
      <path d={ACHTSTERN_96} className={klassen(farbe.flaeche, farbe.linie)} strokeWidth="2" />
      {art === 'erfolg' ? (
        <path
          d="M37 49l7 7 15-16"
          pathLength={1}
          stroke="currentColor"
          strokeWidth="2"
          className="linie-zeichnet"
          style={{ '--dauer': 'var(--dauer-auftritt)', '--verzoegerung': 'var(--dauer-rueckmeldung)' } as CSSProperties}
        />
      ) : (
        <g transform="translate(36 36)" stroke="currentColor" strokeWidth="2">
          {ZEICHEN[art].map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
      )}
    </svg>
  );
}

/** Achtstern-Trenner (K-008): Linie – Stern – Linie, dekorativ zwischen Abschnitten. */
export function Trenner({ className }: { className?: string }) {
  return (
    <div aria-hidden className={klassen('flex items-center gap-3 text-rand', className)}>
      <span className="h-px flex-1 bg-linie" />
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 3.5 14.5 6H18v3.5l2.5 2.5-2.5 2.5V18h-3.5L12 20.5 9.5 18H6v-3.5L3.5 12 6 9.5V6h3.5z" />
      </svg>
      <span className="h-px flex-1 bg-linie" />
    </div>
  );
}

/**
 * Lade-Achtstern (B-12): Der Umriss zeichnet sich wiederholt, höchstens vier Durchläufe (≈ 5 s), danach steht er.
 * Für Knöpfe und Bereiche, die senden oder speichern; die Ansage übernimmt der Text („Wird gesendet …“).
 */
export function LadeStern({ groesse = 20, className }: { groesse?: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={groesse}
      height={groesse}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={klassen('shrink-0', className)}
    >
      <path
        d="M12 3.5 14.5 6H18v3.5l2.5 2.5-2.5 2.5V18h-3.5L12 20.5 9.5 18H6v-3.5L3.5 12 6 9.5V6h3.5z"
        pathLength={1}
        className="lade-stern"
      />
    </svg>
  );
}
