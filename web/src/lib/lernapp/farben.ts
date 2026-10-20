import { FARBEN } from '@/components/verwaltung/styleguide/tokens';

/** Wert eines Farb-Tokens aus globals.css (über die geprüfte Token-Liste des Styleguides). */
function token(name: string): string {
  const eintrag = FARBEN.find((f) => f.name === name);
  if (!eintrag) throw new Error(`Farb-Token fehlt: ${name}`);
  return eintrag.wert;
}

/**
 * Farben für Browser-Metadaten und das Web-App-Manifest der Lern-App: Beide verlangen Farbwerte als Text, CSS-Variablen
 * gelten dort nicht. Die Werte kommen aus der Token-Liste des Styleguides (`components/verwaltung/styleguide/tokens.ts`),
 * die `tests/unit/styleguide-tokens.test.ts` gegen globals.css prüft – keine freien Farbwerte in der Lern-App.
 */
export const LERNAPP_FARBE = {
  /** --color-gruen-950: Adressleiste (wie die Website) */
  tiefgruen: token('--color-gruen-950'),
  /** --color-gruen-800: Fläche der Symbole, Manifest `theme_color` */
  gruen: token('--color-gruen-800'),
  /** --color-papier: Startbildschirm, Manifest `background_color` */
  papier: token('--color-papier'),
} as const;
