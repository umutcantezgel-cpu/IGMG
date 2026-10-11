/**
 * Einbettung der Karte (OpenStreetMap, K-14). Die Adresse wird erst nach einem Klick des Besuchers geladen.
 * Der Ausschnitt liegt eng um die Koordinaten der Moschee; diese sind erst nach Bestätigung gesetzt (M-010).
 */
export function osmEinbettung({ breite, laenge }: { breite: number; laenge: number }): string {
  // Halbe Ausschnittsbreite in Grad (ca. 1 km je Richtung)
  const halb = 0.01;
  const bbox = [laenge - halb, breite - halb, laenge + halb, breite + halb].map((wert) => wert.toFixed(5)).join(',');
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${breite.toFixed(5)},${laenge.toFixed(5)}`;
}
