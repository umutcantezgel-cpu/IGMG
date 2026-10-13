/**
 * Welcher Bogen steht auf der Startseite (Vorführpfad Station 1, B-06/B-20)? Reine Funktion ohne Kalenderrechnung, damit
 * sie im Browser läuft, ohne den islamischen Kalender zu laden (H-L01): Die Ramadan-Tage des Fensters rechnet der Server
 * (`ramadanImFenster`), der Browser vergleicht nur das heutige Datum (Europe/Berlin) mit der Liste.
 *
 * - `fasten`: heute ist ein Ramadan-Tag → Fastenbogen statt Tagesbogen.
 * - `fasten-vorschau`: außerhalb des Ramadan nur, wenn der Schalter `ramadan_vorschau` an ist **und** die Vorführung den
 *   Fastenbogen gewählt hat (Knopf unter dem Bogen); sonst bleibt der Tagesbogen der große Moment der Startseite.
 * - `tag`: Tagesbogen.
 */
export type BogenArt = 'tag' | 'fasten' | 'fasten-vorschau';

export function bogenArt({
  heute,
  ramadan,
  vorschau,
  gewaehlt,
}: {
  /** Kalendertag „JJJJ-MM-TT“ (Browser: `berlinerDatum(jetzt)`, vor der Hydrierung der Referenztag des Servers) */
  heute: string;
  /** Ramadan-Tage im Fenster der Gebetszeiten, vom Server berechnet */
  ramadan: readonly string[];
  /** Funktionsschalter `ramadan_vorschau` */
  vorschau: boolean;
  /** Vorführung hat den Fastenbogen gewählt */
  gewaehlt: boolean;
}): BogenArt {
  if (ramadan.includes(heute)) return 'fasten';
  return vorschau && gewaehlt ? 'fasten-vorschau' : 'tag';
}
