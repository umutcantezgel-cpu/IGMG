/**
 * Farben für Browser-Metadaten und das Web-App-Manifest der Lern-App: Beide verlangen Farbwerte als Text, CSS-Variablen
 * gelten dort nicht. Werte = Tokens aus src/app/globals.css (`--color-gruen-950`, `--color-gruen-800`, `--color-papier`);
 * nur hier als Hex erlaubt, der Unit-Test `lernapp/farben` prüft sie gegen globals.css (wie `mail/vorlagen/farben.ts`).
 */
export const LERNAPP_FARBE = {
  /** = --color-gruen-950: Adressleiste (wie die Website) */
  tiefgruen: '#0e3929',
  /** = --color-gruen-800: Fläche der Symbole, Manifest `theme_color` */
  gruen: '#065f46',
  /** = --color-papier: Startbildschirm, Manifest `background_color` */
  papier: '#fcfaf6',
} as const;
