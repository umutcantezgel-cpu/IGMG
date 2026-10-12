/**
 * Farben für E-Mails (Inline-Stile, E-Mail-Programme kennen keine CSS-Variablen). Werte = Tokens aus
 * src/app/globals.css (--color-gruen-950, -700, tinte, tinte-2, sand, papier, linie). Nur hier als Hex erlaubt.
 */
export const MAILFARBE = {
  tiefgruen: '#0e3929',
  gruen: '#047857',
  tinte: '#1d1a17',
  tinte2: '#514c46',
  sand: '#f3f0e9',
  papier: '#fcfaf6',
  linie: '#dfdad2',
  weiss: '#ffffff',
} as const;

/**
 * Maße für E-Mails, aus demselben Grund wie die Farben nur hier als px erlaubt. Schriftstufen = text-14/16/24,
 * Radien = --radius-md/-lg, Abstände aus der 4-px-Spacing-Skala; dazu die festen Maße des Mailrahmens
 * (Outlook-Breite, Grenze für schmale Bildschirme, Akzentlinie, Knopf-Mindesthöhe, unsichtbarer Vorschautext).
 */
export const MAILMASS = {
  textKlein: '14px',
  text: '16px',
  titel: '24px',
  knopfZeile: '20px',
  knopfHoehe: '48px',
  radiusKnopf: '8px',
  radius: '12px',
  abstand1: '4px',
  abstand3: '12px',
  abstand4: '16px',
  abstand5: '20px',
  abstand6: '24px',
  abstand8: '32px',
  knopfSenkrecht: '14px',
  breite: '600px',
  schmal: '480px',
  akzent: '2px',
  haar: '1px',
  aus: '0px',
} as const;
