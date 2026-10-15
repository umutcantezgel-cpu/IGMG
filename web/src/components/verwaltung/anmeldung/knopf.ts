/**
 * Absendeknopf der Anmeldestrecke (K-009, B-01, B-12): Rückmeldung über Farbe und Druck (`druck`, reduziert nur Farbe).
 * Während des Ladens bleibt der Knopf grün (kein gestrichelter „deaktiviert“-Zustand), der Lade-Achtstern
 * steht vor dem unveränderten Text.
 */
export const ANMELDE_KNOPF =
  'w-full transition duration-(--dauer-rueckmeldung) druck disabled:cursor-wait disabled:border-solid disabled:border-gruen-700 disabled:bg-gruen-700 disabled:text-weiss disabled:opacity-80';
