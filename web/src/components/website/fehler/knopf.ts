/**
 * Sekundärer Knopf der Fehlerseiten und Zustände (REFERENZ §2): mindestens 48 px hoch, Rand 2 px Grün, fette Schrift,
 * Hover-Fläche Grün-50. Rückmeldung nach B-01: Farbe in `dauer-rueckmeldung`, Druck `active:scale-98`. `transition`
 * statt `transition-colors`, damit auch die Skalierung weich läuft.
 */
export const knopfRahmen =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-md border-2 border-gruen-700 bg-weiss px-5.5 font-bold text-gruen-800 no-underline transition duration-(--dauer-rueckmeldung) hover:bg-gruen-50 hover:text-gruen-800 active:scale-98';
