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
