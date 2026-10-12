'use client';

import { useEffect, useState } from 'react';

/**
 * Wird `true`, sobald der Browser nach dem Einhängen zur Ruhe kommt (`requestIdleCallback`, spätestens nach
 * `spaetestens` ms; ohne `requestIdleCallback` nach 300 ms). Große Momente starten damit erst nach der Hydrierung und
 * den ersten Rechnungen der Zeitinseln, die Bewegung läuft auf einem freien Hauptthread (Z-05, B-06 und B-09).
 * Mit `aktiv = false` wartet der Haken, bis der Aufrufer bereit ist (Tagesbogen: erst wenn die Uhrzeit feststeht).
 */
export function useNachRuhe(aktiv = true, spaetestens = 1000): boolean {
  const [ruhe, setRuhe] = useState(false);
  useEffect(() => {
    if (!aktiv || ruhe) return;
    if (typeof window.requestIdleCallback === 'function') {
      const kennung = window.requestIdleCallback(() => setRuhe(true), { timeout: spaetestens });
      return () => window.cancelIdleCallback(kennung);
    }
    const kennung = window.setTimeout(() => setRuhe(true), 300);
    return () => window.clearTimeout(kennung);
  }, [aktiv, ruhe, spaetestens]);
  return ruhe;
}
