/**
 * Gemeinsame Klassen des Kontaktbereichs (design/Contact.dc.html). Farben, Abstände und Schriftgrößen nur
 * über Tokens aus src/app/globals.css (K-04); Kartenrahmen 12 px = rounded-lg, Linie = border-linie.
 */
export const KARTE = 'flex min-w-0 flex-col gap-3 rounded-lg border border-linie bg-weiss p-6';

/** Kartenüberschrift (24 px, Icon 24 px, Abstand 10 px). */
export const UEBERSCHRIFT = 'flex items-center gap-2.5 text-24';

/** Abschnittsüberschrift (30 px) für Anfahrt, Angebote und Besucher. */
export const UEBERSCHRIFT_GROSS = 'flex items-center gap-2.5 text-30';

/** Umrandete Schaltfläche (Design: Google Maps), Mindesthöhe 48 px nach K-11. */
export const KNOPF_RAHMEN =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-md border-2 border-gruen-700 bg-weiss px-5 font-bold text-gruen-800 no-underline hover:bg-gruen-50 hover:text-gruen-800';
