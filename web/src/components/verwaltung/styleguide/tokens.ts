/**
 * Designwerte der Nachschlageseite „Styleguide“ (V14, Blatt _lauf/blaetter/V14-verwaltung-styleguide.md).
 *
 * Diese Liste ist die Quelle der Seite. Jeder Eintrag nennt eine Variable aus `src/app/globals.css` (@theme) und den
 * Wert, den sie dort hat. `tests/unit/styleguide-tokens.test.ts` prüft gegen globals.css: Jeder Eintrag existiert mit
 * diesem Wert, keine Variable fehlt, Kontrastangaben stehen im Token-Kommentar, und die Beispielpaare ergeben die
 * genannten Verhältnisse. Verwendungstexte stehen in `messages/verwaltung/styleguide.json` (Schlüssel `schluessel`).
 *
 * `klasse` ist die Tailwind-Klasse, mit der die Seite den Token zeigt. Tailwind erzeugt Klassen nur aus vollständig im
 * Quelltext stehenden Namen, deshalb stehen sie hier ausgeschrieben und werden nicht zusammengesetzt.
 */

export type FarbGruppe = 'marke' | 'neutral' | 'status' | 'organisationen' | 'tags';

export type FarbToken = {
  /** CSS-Variable im Theme, z. B. `--color-gruen-700` */
  name: string;
  /** Wert wie in globals.css */
  wert: string;
  gruppe: FarbGruppe;
  /** Schlüssel der Verwendung unter `styleguide.farben.verwendungen` */
  schluessel: string;
  /** Tailwind-Klasse, mit der die Vorschau den Token als Fläche zeigt */
  klasse: string;
  /** Kontrastangabe: nur, wenn der Token-Kommentar in globals.css ein Verhältnis nennt */
  kontrast?: string;
};

/** Reihenfolge der Farbgruppen wie in globals.css. */
export const FARBGRUPPEN: readonly FarbGruppe[] = ['marke', 'neutral', 'status', 'organisationen', 'tags'];

export const FARBEN: readonly FarbToken[] = [
  { name: '--color-gruen-950', wert: '#0e3929', gruppe: 'marke', schluessel: 'gruen950', klasse: 'bg-gruen-950' },
  { name: '--color-gruen-800', wert: '#065f46', gruppe: 'marke', schluessel: 'gruen800', klasse: 'bg-gruen-800' },
  { name: '--color-gruen-700', wert: '#047857', gruppe: 'marke', schluessel: 'gruen700', klasse: 'bg-gruen-700' },
  { name: '--color-gruen-100', wert: '#d3f0e2', gruppe: 'marke', schluessel: 'gruen100', klasse: 'bg-gruen-100' },
  { name: '--color-gruen-50', wert: '#ebf9f2', gruppe: 'marke', schluessel: 'gruen50', klasse: 'bg-gruen-50' },
  { name: '--color-tinte', wert: '#1d1a17', gruppe: 'neutral', schluessel: 'tinte', klasse: 'bg-tinte' },
  { name: '--color-tinte-2', wert: '#514c46', gruppe: 'neutral', schluessel: 'tinte2', klasse: 'bg-tinte-2' },
  { name: '--color-tinte-3', wert: '#68625b', gruppe: 'neutral', schluessel: 'tinte3', klasse: 'bg-tinte-3' },
  { name: '--color-rand', wert: '#8c857c', gruppe: 'neutral', schluessel: 'rand', klasse: 'bg-rand', kontrast: '≥ 3:1' },
  { name: '--color-linie', wert: '#dfdad2', gruppe: 'neutral', schluessel: 'linie', klasse: 'bg-linie' },
  { name: '--color-sand', wert: '#f3f0e9', gruppe: 'neutral', schluessel: 'sand', klasse: 'bg-sand' },
  { name: '--color-papier', wert: '#fcfaf6', gruppe: 'neutral', schluessel: 'papier', klasse: 'bg-papier' },
  { name: '--color-weiss', wert: '#ffffff', gruppe: 'neutral', schluessel: 'weiss', klasse: 'bg-weiss' },
  { name: '--color-fehler', wert: '#af2b25', gruppe: 'status', schluessel: 'fehler', klasse: 'bg-fehler' },
  { name: '--color-fehler-toenung', wert: '#ffedea', gruppe: 'status', schluessel: 'fehlerToenung', klasse: 'bg-fehler-toenung' },
  { name: '--color-warnung', wert: '#81520a', gruppe: 'status', schluessel: 'warnung', klasse: 'bg-warnung' },
  { name: '--color-warnung-toenung', wert: '#fef2d9', gruppe: 'status', schluessel: 'warnungToenung', klasse: 'bg-warnung-toenung' },
  { name: '--color-info', wert: '#225899', gruppe: 'status', schluessel: 'info', klasse: 'bg-info' },
  { name: '--color-info-toenung', wert: '#e9f3ff', gruppe: 'status', schluessel: 'infoToenung', klasse: 'bg-info-toenung' },
  { name: '--color-org-at', wert: '#047857', gruppe: 'organisationen', schluessel: 'orgAt', klasse: 'bg-org-at' },
  { name: '--color-org-at-text', wert: '#065f46', gruppe: 'organisationen', schluessel: 'orgAtText', klasse: 'bg-org-at-text' },
  { name: '--color-org-at-toenung', wert: '#e7f8f0', gruppe: 'organisationen', schluessel: 'orgAtToenung', klasse: 'bg-org-at-toenung' },
  { name: '--color-org-kt', wert: '#592e81', gruppe: 'organisationen', schluessel: 'orgKt', klasse: 'bg-org-kt' },
  { name: '--color-org-kt-text', wert: '#592e81', gruppe: 'organisationen', schluessel: 'orgKtText', klasse: 'bg-org-kt-text' },
  { name: '--color-org-kt-toenung', wert: '#f7f0ff', gruppe: 'organisationen', schluessel: 'orgKtToenung', klasse: 'bg-org-kt-toenung' },
  { name: '--color-org-kgt', wert: '#9b255a', gruppe: 'organisationen', schluessel: 'orgKgt', klasse: 'bg-org-kgt' },
  { name: '--color-org-kgt-text', wert: '#9b255a', gruppe: 'organisationen', schluessel: 'orgKgtText', klasse: 'bg-org-kgt-text' },
  { name: '--color-org-kgt-toenung', wert: '#ffeef3', gruppe: 'organisationen', schluessel: 'orgKgtToenung', klasse: 'bg-org-kgt-toenung' },
  { name: '--color-org-gt', wert: '#008c98', gruppe: 'organisationen', schluessel: 'orgGt', klasse: 'bg-org-gt', kontrast: '4,03:1' },
  { name: '--color-org-gt-text', wert: '#006177', gruppe: 'organisationen', schluessel: 'orgGtText', klasse: 'bg-org-gt-text' },
  { name: '--color-org-gt-toenung', wert: '#e6f7fd', gruppe: 'organisationen', schluessel: 'orgGtToenung', klasse: 'bg-org-gt-toenung' },
  { name: '--color-tag-bildung', wert: '#225899', gruppe: 'tags', schluessel: 'tagBildung', klasse: 'bg-tag-bildung' },
  { name: '--color-tag-bildung-bg', wert: '#e9f3ff', gruppe: 'tags', schluessel: 'tagBildungBg', klasse: 'bg-tag-bildung-bg' },
  { name: '--color-tag-veranstaltung', wert: '#81520a', gruppe: 'tags', schluessel: 'tagVeranstaltung', klasse: 'bg-tag-veranstaltung' },
  {
    name: '--color-tag-veranstaltung-bg',
    wert: '#fef2d9',
    gruppe: 'tags',
    schluessel: 'tagVeranstaltungBg',
    klasse: 'bg-tag-veranstaltung-bg',
  },
  { name: '--color-tag-jugend', wert: '#006177', gruppe: 'tags', schluessel: 'tagJugend', klasse: 'bg-tag-jugend' },
  { name: '--color-tag-jugend-bg', wert: '#e6f7fd', gruppe: 'tags', schluessel: 'tagJugendBg', klasse: 'bg-tag-jugend-bg' },
  { name: '--color-tag-wichtig', wert: '#af2b25', gruppe: 'tags', schluessel: 'tagWichtig', klasse: 'bg-tag-wichtig' },
  { name: '--color-tag-wichtig-bg', wert: '#ffedea', gruppe: 'tags', schluessel: 'tagWichtigBg', klasse: 'bg-tag-wichtig-bg' },
  { name: '--color-tag-neuigkeiten', wert: '#065f46', gruppe: 'tags', schluessel: 'tagNeuigkeiten', klasse: 'bg-tag-neuigkeiten' },
  { name: '--color-tag-neuigkeiten-bg', wert: '#ebf9f2', gruppe: 'tags', schluessel: 'tagNeuigkeitenBg', klasse: 'bg-tag-neuigkeiten-bg' },
  { name: '--color-tag-gemeinde', wert: '#514c46', gruppe: 'tags', schluessel: 'tagGemeinde', klasse: 'bg-tag-gemeinde' },
  { name: '--color-tag-gemeinde-bg', wert: '#f3f0e9', gruppe: 'tags', schluessel: 'tagGemeindeBg', klasse: 'bg-tag-gemeinde-bg' },
];

export type SchriftgroesseToken = {
  /** CSS-Variable der Schriftgröße, z. B. `--text-48`; die Zeilenhöhe steht in `--text-48--line-height` */
  name: string;
  wert: string;
  zeile: string;
  /** Schlüssel für Rolle und Muster unter `styleguide.typografie` */
  schluessel: string;
  /** Klassen des Musters: Schriftfamilie, Größe, Gewicht */
  muster: string;
};

/** Schriftskala text-16 bis text-48, größte Stufe zuerst. */
export const SCHRIFTGROESSEN: readonly SchriftgroesseToken[] = [
  { name: '--text-48', wert: '3rem', zeile: '1.15', schluessel: 't48', muster: 'font-display text-48 font-semibold' },
  { name: '--text-36', wert: '2.25rem', zeile: '1.2', schluessel: 't36', muster: 'font-display text-36 font-semibold' },
  { name: '--text-30', wert: '1.875rem', zeile: '1.25', schluessel: 't30', muster: 'font-display text-30 font-semibold' },
  { name: '--text-24', wert: '1.5rem', zeile: '1.25', schluessel: 't24', muster: 'font-display text-24 font-semibold' },
  { name: '--text-20', wert: '1.25rem', zeile: '1.55', schluessel: 't20', muster: 'font-text text-20' },
  { name: '--text-18', wert: '1.125rem', zeile: '1.6', schluessel: 't18', muster: 'font-text text-18' },
  { name: '--text-16', wert: '1rem', zeile: '1.5', schluessel: 't16', muster: 'font-text text-16 font-bold' },
];

/** Laufweite der Überschriften. */
export const LAUFWEITE = { name: '--tracking-titel', wert: '-0.01em', klasse: 'tracking-titel' } as const;

export type SchriftToken = {
  name: string;
  /** Schriftstapel wie in globals.css */
  wert: string;
  /** Klasse, die die Schriftfamilie setzt */
  klasse: string;
  /** Schlüssel unter `styleguide.typografie.schriftVerwendung` und `schriftMuster` */
  schluessel: 'text' | 'display' | 'arabisch';
};

export const SCHRIFTEN: readonly SchriftToken[] = [
  { name: '--font-text', wert: "var(--schrift-text), 'Source Sans 3', system-ui, sans-serif", klasse: 'font-text', schluessel: 'text' },
  { name: '--font-display', wert: 'var(--schrift-titel), Georgia, serif', klasse: 'font-display', schluessel: 'display' },
  { name: '--font-arabic', wert: 'var(--schrift-arabisch), serif', klasse: 'font-arabic', schluessel: 'arabisch' },
];

/** Basis aller Abstände: ein Schritt des Rasters. */
export const ABSTAND_BASIS = { name: '--spacing', wert: '0.25rem' } as const;

/** Schritte, mit denen die Seite Abstände zeigt; die Klasse `w-N` nutzt dieselbe Basis. */
export const ABSTAENDE: readonly { schritt: number; klasse: string }[] = [
  { schritt: 1, klasse: 'w-1' },
  { schritt: 2, klasse: 'w-2' },
  { schritt: 3, klasse: 'w-3' },
  { schritt: 4, klasse: 'w-4' },
  { schritt: 6, klasse: 'w-6' },
  { schritt: 8, klasse: 'w-8' },
  { schritt: 12, klasse: 'w-12' },
  { schritt: 16, klasse: 'w-16' },
  { schritt: 24, klasse: 'w-24' },
];

export type RadiusToken = { name: string; wert: string; klasse: string; schluessel: string };

export const RADIEN: readonly RadiusToken[] = [
  { name: '--radius-sm', wert: '4px', klasse: 'rounded-sm', schluessel: 'sm' },
  { name: '--radius-md', wert: '8px', klasse: 'rounded-md', schluessel: 'md' },
  { name: '--radius-lg', wert: '12px', klasse: 'rounded-lg', schluessel: 'lg' },
  { name: '--radius-pill', wert: '999px', klasse: 'rounded-pill', schluessel: 'pill' },
];

export type SchattenToken = { name: string; wert: string; klasse: string; schluessel: string };

export const SCHATTEN: readonly SchattenToken[] = [
  { name: '--shadow-s1', wert: '0 1px 2px rgba(29, 26, 23, 0.06)', klasse: 'shadow-s1', schluessel: 's1' },
  { name: '--shadow-s2', wert: '0 6px 20px rgba(29, 26, 23, 0.1)', klasse: 'shadow-s2', schluessel: 's2' },
  { name: '--shadow-s3', wert: '0 24px 64px rgba(29, 26, 23, 0.22)', klasse: 'shadow-s3', schluessel: 's3' },
];

/**
 * Beispielpaare aus dem Design (Styleguide.dc.html, Abschnitt Accessibility). `verhaeltnis` und `stufe` sind die Angaben
 * des Designs; der Test rechnet sie aus den Token-Werten nach.
 */
export const KONTRASTBEISPIELE: readonly {
  schluessel: string;
  vordergrund: string;
  hintergrund: string;
  verhaeltnis: string;
  stufe: 'AA' | 'AAA';
  klasse: string;
}[] = [
  {
    schluessel: 'weissAufGruen700',
    vordergrund: '--color-weiss',
    hintergrund: '--color-gruen-700',
    verhaeltnis: '5,48:1',
    stufe: 'AA',
    klasse: 'bg-gruen-700 text-weiss',
  },
  {
    schluessel: 'gruen800AufToenung',
    vordergrund: '--color-gruen-800',
    hintergrund: '--color-gruen-50',
    verhaeltnis: '7,09:1',
    stufe: 'AAA',
    klasse: 'bg-gruen-50 text-gruen-800',
  },
];

/** Abschnitte der Seite in Reihenfolge; Schlüssel für Sprungnavigation und Überschriften. */
export const ABSCHNITTE = [
  'farben',
  'typografie',
  'abstaende',
  'radien',
  'schatten',
  'knoepfe',
  'felder',
  'pillen',
  'karten',
  'meldungen',
  'barrierefreiheit',
] as const;

/** Rem-Wert wie `0.25rem` in Pixel bei 16 px Basisschrift. */
export function remZuPx(rem: string): number {
  return Number.parseFloat(rem) * 16;
}
