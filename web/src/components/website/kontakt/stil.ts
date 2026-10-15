/**
 * Gemeinsame Klassen des Kontaktbereichs (design/Contact.dc.html). Farben, Abstände und Schriftgrößen nur
 * über Tokens aus src/app/globals.css (K-04); Kartenrahmen 12 px = rounded-lg, Linie = border-linie.
 */
export const KARTE = 'flex min-w-0 flex-col gap-3 rounded-lg border border-linie bg-weiss p-6';

/**
 * Ein Teil der Begleitspalte (H-E03): ohne eigenen Rahmen, innerhalb des Rahmens der Spalte. Waagerechte Linie
 * zwischen den Teilen (ab 768 px senkrecht, ab 1024 px wieder waagerecht), je 24 px Abstand.
 */
export const TEIL =
  'flex min-w-0 flex-col gap-3 border-t border-linie pt-6 first:border-t-0 first:pt-0 md:border-t-0 md:pt-0 md:border-l md:pl-6 md:first:border-l-0 md:first:pl-0 lg:border-l-0 lg:pl-0 lg:border-t lg:pt-6 lg:first:border-t-0 lg:first:pt-0';

/** Begleitkarten-Rubriken wie Mission/Vision-h3 (H-C05): fette Sans text-20, die Serif bleibt den Inhaltstiteln vorbehalten (K-006, L-E13). */
export const UEBERSCHRIFT = 'font-text text-20 leading-snug font-bold tracking-normal';

/** Umrandete Schaltfläche (Design: Google Maps), Mindesthöhe 48 px nach K-11; Rückmeldung nach B-01. */
export const KNOPF_RAHMEN =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-md border-2 border-gruen-700 bg-weiss px-5 font-bold text-gruen-800 no-underline transition duration-(--dauer-rueckmeldung) hover:bg-gruen-50 hover:text-gruen-800 druck';
