/**
 * Lektionsleiste (B-28): füllt sich je abgeschlossener Aufgabe vom Zeilenanfang aus (`scale` auf der Füllung, Ursprung
 * am Anfang; in Rechts-nach-links wird die Leiste über `rtl:` gespiegelt). Bei reduzierter Bewegung ohne Übergang.
 * `role="progressbar"` mit Wert in Prozent und lesbarem Text.
 */
export function Fortschrittsleiste({ anteil, beschriftung, wertText }: { anteil: number; beschriftung: string; wertText?: string }) {
  const a = Math.max(0, Math.min(1, Number.isFinite(anteil) ? anteil : 0));
  return (
    <div
      role="progressbar"
      aria-label={beschriftung}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(a * 100)}
      aria-valuetext={wertText}
      className="relative h-3 w-full overflow-hidden rounded-pill bg-sand rtl:-scale-x-100"
    >
      <div
        className="absolute inset-0 rounded-pill bg-gruen-700 transition-transform duration-(--dauer-wechsel) ease-standard motion-reduce:transition-none"
        style={{ scale: `${a} 1`, transformOrigin: '0 50%' }}
      />
    </div>
  );
}
