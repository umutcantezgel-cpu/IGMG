/**
 * Tastatur für Listen mit wanderndem Tabindex (WAI-ARIA „roving tabindex“): Pfeile folgen der sichtbaren Richtung –
 * in einer Liste von rechts nach links ist „Pfeil links“ das nächste Element. Pos1/Ende springen an den Rand.
 * Rein, ohne DOM; die Komponente setzt danach den Fokus.
 */
export function naechsterIndex(aktuell: number, taste: string, anzahl: number, rtl = false): number | null {
  if (anzahl <= 0) return null;
  const vor = rtl ? 'ArrowLeft' : 'ArrowRight';
  const zurueck = rtl ? 'ArrowRight' : 'ArrowLeft';
  if (taste === vor || taste === 'ArrowDown') return (aktuell + 1) % anzahl;
  if (taste === zurueck || taste === 'ArrowUp') return (aktuell - 1 + anzahl) % anzahl;
  if (taste === 'Home') return 0;
  if (taste === 'End') return anzahl - 1;
  return null;
}

/** Richtung zum Verschieben (Alt + Pfeil) in sichtbarer Richtung: +1 nach vorn im Satz, −1 zurück. */
export function verschiebeRichtung(taste: string, rtl = false): -1 | 1 | null {
  if (taste === (rtl ? 'ArrowLeft' : 'ArrowRight')) return 1;
  if (taste === (rtl ? 'ArrowRight' : 'ArrowLeft')) return -1;
  return null;
}
