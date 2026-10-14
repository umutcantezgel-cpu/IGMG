/** Hadithe je Abschnitt der Buchseite (Sichtabnahme Runde 2, H-6). */
export const ABSCHNITT_GROESSE = 10;

/** Ein Abschnitt der Liste: Anker, erste und letzte Nummer, Lage in der Liste (`start` einschließlich, `ende` ausschließlich). */
export type HadithAbschnitt = { anker: string; von: string; bis: string; start: number; ende: number };

/** Anker eines Abschnitts nach der Nummer seines ersten Hadith (`#ab-8`). */
export function abschnittAnker(nummer: string): string {
  return `ab-${nummer}`;
}

/**
 * Gliederung einer Hadith-Liste in Abschnitte zu je 10 in der Reihenfolge der Liste; der Rest (weniger als 10) kommt zum
 * letzten Abschnitt, z. B. 51 Hadithe ab Nummer 8: 8–17, 18–27, 28–37, 38–47, 48–58. Ergäbe sich nur ein Abschnitt
 * (weniger als 20 Hadithe), bleibt die Liste ungegliedert: Ein einziger Abschnitt bräuchte weder Marke noch Sprung.
 */
export function hadithAbschnitte(nummern: readonly string[]): HadithAbschnitt[] {
  const anzahl = Math.floor(nummern.length / ABSCHNITT_GROESSE);
  if (anzahl < 2) return [];
  return Array.from({ length: anzahl }, (_, i) => {
    const start = i * ABSCHNITT_GROESSE;
    const ende = i === anzahl - 1 ? nummern.length : start + ABSCHNITT_GROESSE;
    return { anker: abschnittAnker(nummern[start]), von: nummern[start], bis: nummern[ende - 1], start, ende };
  });
}
