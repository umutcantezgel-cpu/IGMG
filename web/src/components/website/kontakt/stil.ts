/**
 * Gemeinsame Klassen des Kontaktbereichs (design/Contact.dc.html). Farben, Abstände und Schriftgrößen nur
 * über Tokens aus src/app/globals.css (K-04); Kartenrahmen 12 px = rounded-lg, Linie = border-linie.
 */
export const KARTE = 'flex min-w-0 flex-col gap-3 rounded-lg border border-linie bg-weiss p-6';

/** Kartenüberschrift (24 px, Icon 24 px, Abstand 10 px, Zeilenhöhe 1,6 wie im Design). */
export const UEBERSCHRIFT = 'flex items-center gap-2.5 text-24 leading-ueberschrift';

/** Abschnittsüberschrift (fluid 30 → 40 px, Referenz: text-display-2) für Anfahrt, Angebote, Besucher und Nachricht. */
export const UEBERSCHRIFT_GROSS = 'flex items-center gap-2.5 text-display-2';

/** Umrandete Schaltfläche (Design: Google Maps), Mindesthöhe 48 px nach K-11; Rückmeldung nach B-01. */
export const KNOPF_RAHMEN =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-md border-2 border-gruen-700 bg-weiss px-5 font-bold text-gruen-800 no-underline transition duration-(--dauer-rueckmeldung) hover:bg-gruen-50 hover:text-gruen-800 active:scale-98';
