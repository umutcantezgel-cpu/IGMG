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
 * Maße für E-Mails, aus demselben Grund wie die Farben nur hier als px erlaubt. Jeder Wert ist ein Token der Website
 * (tests/unit/token-spiegel.test.ts prüft das gegen src/app/globals.css): Schriftstufen text-16/24, Radien
 * --radius-md/-lg, Abstände als Vielfache von --spacing (4 px). Dazu fünf feste Maße des Mailrahmens, die es auf der
 * Website nicht gibt: Outlook-Breite, Grenze für schmale Bildschirme, Akzentlinie, Haarlinie, unsichtbarer Vorschautext.
 */
export const MAILMASS = {
  text: '16px', // --text-16
  titel: '24px', // --text-24
  radiusKnopf: '8px', // --radius-md
  radius: '12px', // --radius-lg
  abstand1: '4px', // 1 × --spacing
  abstand3: '12px', // 3 × --spacing
  abstand4: '16px', // 4 × --spacing
  abstand5: '20px', // 5 × --spacing (auch Zeilenhöhe im Knopf)
  abstand6: '24px', // 6 × --spacing
  abstand8: '32px', // 8 × --spacing
  knopfSenkrecht: '14px', // 3,5 × --spacing (py-3.5)
  knopfHoehe: '48px', // 12 × --spacing (min-h-12, Mindestgröße für Ziele)
  breite: '600px', // Mailrahmen: Outlook-Breite
  schmal: '480px', // Mailrahmen: schmale Bildschirme
  akzent: '2px', // Mailrahmen: Akzentlinie unter dem Kopf
  haar: '1px', // Mailrahmen: Haarlinie und unsichtbarer Vorschautext
  aus: '0px', // Mailrahmen: ausgeblendeter Vorschautext
} as const;
