/**
 * Aufnahmen des Rundgangs (Vorführung ohne Datenbank): je Bildschirm eine Aufnahme für Computer (1440 px) und Handy
 * (390 px, 1,5-fach) unter `public/vorfuehrung/<id>-<desktop|telefon>.jpg`. Entstanden am 23.11.2026 in der Testumgebung
 * mit Beispieldaten (Beispielinhalte der Seeds, `scripts/beispielkonten.ts`) – keine echten Personen, keine Angaben der
 * Gemeinde. Breite und Höhe in Bildpunkten der Datei (Platz halten beim Nachladen). Titel und Erklärtexte:
 * `messages/verwaltung/rundgang.json`. Prüfung: `tests/unit/rundgang.test.ts`.
 */
export type Aufnahme = { breite: number; hoehe: number };

export const AUFNAHMEN = {
  'verwaltung-anmelden': { desktop: { breite: 1440, hoehe: 900 }, telefon: { breite: 585, hoehe: 1266 } },
  uebersicht: { desktop: { breite: 1440, hoehe: 1230 }, telefon: { breite: 585, hoehe: 3077 } },
  'gemeinde-im-blick': { desktop: { breite: 1440, hoehe: 1339 }, telefon: { breite: 585, hoehe: 3005 } },
  neuigkeiten: { desktop: { breite: 1440, hoehe: 1271 }, telefon: { breite: 585, hoehe: 3600 } },
  neuigkeit: { desktop: { breite: 1440, hoehe: 2200 }, telefon: { breite: 585, hoehe: 3600 } },
  veranstaltungen: { desktop: { breite: 1440, hoehe: 1667 }, telefon: { breite: 585, hoehe: 3600 } },
  veranstaltung: { desktop: { breite: 1440, hoehe: 2200 }, telefon: { breite: 585, hoehe: 3600 } },
  ankuendigungen: { desktop: { breite: 1440, hoehe: 1032 }, telefon: { breite: 585, hoehe: 1266 } },
  seiteninhalte: { desktop: { breite: 1440, hoehe: 1985 }, telefon: { breite: 585, hoehe: 3600 } },
  'seiteninhalte-kontakt': { desktop: { breite: 1440, hoehe: 2200 }, telefon: { breite: 585, hoehe: 3600 } },
  seiten: { desktop: { breite: 1440, hoehe: 1032 }, telefon: { breite: 585, hoehe: 1266 } },
  seite: { desktop: { breite: 1440, hoehe: 2200 }, telefon: { breite: 585, hoehe: 3600 } },
  startseite: { desktop: { breite: 1440, hoehe: 1369 }, telefon: { breite: 585, hoehe: 3363 } },
  menues: { desktop: { breite: 1440, hoehe: 2200 }, telefon: { breite: 585, hoehe: 3600 } },
  weiterleitungen: { desktop: { breite: 1440, hoehe: 1107 }, telefon: { breite: 585, hoehe: 2081 } },
  medien: { desktop: { breite: 1440, hoehe: 1510 }, telefon: { breite: 585, hoehe: 2591 } },
  wissen: { desktop: { breite: 1440, hoehe: 2200 }, telefon: { breite: 585, hoehe: 3600 } },
  freigaben: { desktop: { breite: 1440, hoehe: 2200 }, telefon: { breite: 585, hoehe: 3600 } },
  gebetszeiten: { desktop: { breite: 1440, hoehe: 2200 }, telefon: { breite: 585, hoehe: 3600 } },
  'besondere-tage': { desktop: { breite: 1440, hoehe: 1355 }, telefon: { breite: 585, hoehe: 3464 } },
  koran: { desktop: { breite: 1440, hoehe: 1219 }, telefon: { breite: 585, hoehe: 2559 } },
  rezitationen: { desktop: { breite: 1440, hoehe: 1032 }, telefon: { breite: 585, hoehe: 1412 } },
  hatim: { desktop: { breite: 1440, hoehe: 1032 }, telefon: { breite: 585, hoehe: 1266 } },
  anzeige: { desktop: { breite: 1440, hoehe: 1032 }, telefon: { breite: 585, hoehe: 1787 } },
  kurse: { desktop: { breite: 1440, hoehe: 1032 }, telefon: { breite: 585, hoehe: 2054 } },
  gruppen: { desktop: { breite: 1440, hoehe: 1032 }, telefon: { breite: 585, hoehe: 1329 } },
  gruppe: { desktop: { breite: 1440, hoehe: 2200 }, telefon: { breite: 585, hoehe: 3600 } },
  lernende: { desktop: { breite: 1440, hoehe: 1032 }, telefon: { breite: 585, hoehe: 2534 } },
  lernender: { desktop: { breite: 1440, hoehe: 2131 }, telefon: { breite: 585, hoehe: 3600 } },
  lehrplan: { desktop: { breite: 1440, hoehe: 2200 }, telefon: { breite: 585, hoehe: 3600 } },
  lernapp: { desktop: { breite: 1440, hoehe: 2200 }, telefon: { breite: 585, hoehe: 3600 } },
  'lernapp-kurs': { desktop: { breite: 1440, hoehe: 2200 }, telefon: { breite: 585, hoehe: 3600 } },
  'lernapp-sprachpruefung': { desktop: { breite: 1440, hoehe: 1032 }, telefon: { breite: 585, hoehe: 1562 } },
  'lernapp-audio': { desktop: { breite: 1440, hoehe: 2200 }, telefon: { breite: 585, hoehe: 3600 } },
  eingaenge: { desktop: { breite: 1440, hoehe: 1032 }, telefon: { breite: 585, hoehe: 1643 } },
  postfach: { desktop: { breite: 1440, hoehe: 1032 }, telefon: { breite: 585, hoehe: 1266 } },
  tickets: { desktop: { breite: 1440, hoehe: 1032 }, telefon: { breite: 585, hoehe: 1542 } },
  newsletter: { desktop: { breite: 1440, hoehe: 1032 }, telefon: { breite: 585, hoehe: 2129 } },
  benutzer: { desktop: { breite: 1440, hoehe: 1220 }, telefon: { breite: 585, hoehe: 2003 } },
  'gemeinde-konten': { desktop: { breite: 1440, hoehe: 1163 }, telefon: { breite: 585, hoehe: 3600 } },
  audit: { desktop: { breite: 1440, hoehe: 2200 }, telefon: { breite: 585, hoehe: 3600 } },
  startklar: { desktop: { breite: 1440, hoehe: 2200 }, telefon: { breite: 585, hoehe: 3600 } },
  einstellungen: { desktop: { breite: 1440, hoehe: 2200 }, telefon: { breite: 585, hoehe: 3600 } },
  styleguide: { desktop: { breite: 1440, hoehe: 2200 }, telefon: { breite: 585, hoehe: 3600 } },
  'verwaltung-konto': { desktop: { breite: 1440, hoehe: 1183 }, telefon: { breite: 585, hoehe: 2559 } },
  'konto-anmelden': { desktop: { breite: 1440, hoehe: 1958 }, telefon: { breite: 585, hoehe: 3600 } },
  'konto-registrieren': { desktop: { breite: 1440, hoehe: 2145 }, telefon: { breite: 585, hoehe: 3600 } },
  'konto-passwort': { desktop: { breite: 1440, hoehe: 1484 }, telefon: { breite: 585, hoehe: 3600 } },
  'mein-bereich': { desktop: { breite: 1440, hoehe: 1925 }, telefon: { breite: 585, hoehe: 3600 } },
  'mein-kinder': { desktop: { breite: 1440, hoehe: 2200 }, telefon: { breite: 585, hoehe: 3600 } },
  'mein-kind': { desktop: { breite: 1440, hoehe: 2200 }, telefon: { breite: 585, hoehe: 3600 } },
  'mein-gruppe': { desktop: { breite: 1440, hoehe: 2200 }, telefon: { breite: 585, hoehe: 3600 } },
  'mein-chat': { desktop: { breite: 1440, hoehe: 2200 }, telefon: { breite: 585, hoehe: 3600 } },
  'mein-lesezeichen': { desktop: { breite: 1440, hoehe: 2032 }, telefon: { breite: 585, hoehe: 3600 } },
  'mein-konto': { desktop: { breite: 1440, hoehe: 2200 }, telefon: { breite: 585, hoehe: 3600 } },
  'kind-bereich': { desktop: { breite: 1440, hoehe: 2200 }, telefon: { breite: 585, hoehe: 3600 } },
  unterricht: { desktop: { breite: 1440, hoehe: 2017 }, telefon: { breite: 585, hoehe: 3600 } },
  'unterricht-gruppe': { desktop: { breite: 1440, hoehe: 2200 }, telefon: { breite: 585, hoehe: 3600 } },
  'unterricht-anwesenheit': { desktop: { breite: 1440, hoehe: 1776 }, telefon: { breite: 585, hoehe: 3600 } },
  'unterricht-fortschritt': { desktop: { breite: 1440, hoehe: 2200 }, telefon: { breite: 585, hoehe: 3600 } },
  'unterricht-lernapp': { desktop: { breite: 1440, hoehe: 2200 }, telefon: { breite: 585, hoehe: 3600 } },
  'unterricht-moderation': { desktop: { breite: 1440, hoehe: 2178 }, telefon: { breite: 585, hoehe: 3600 } },
} as const satisfies Record<string, { desktop: Aufnahme; telefon: Aufnahme }>;

export type SchirmId = keyof typeof AUFNAHMEN;

/** Bereiche des Rundgangs in der Reihenfolge der Seite; jeder Bildschirm steht in genau einem Bereich. */
export const RUNDGANG_GRUPPEN = [
  { id: 'einstieg', schirme: ['verwaltung-anmelden', 'uebersicht', 'gemeinde-im-blick'] },
  {
    id: 'inhalte',
    schirme: [
      'neuigkeiten',
      'neuigkeit',
      'veranstaltungen',
      'veranstaltung',
      'ankuendigungen',
      'seiteninhalte',
      'seiteninhalte-kontakt',
      'seiten',
      'seite',
      'startseite',
      'menues',
      'weiterleitungen',
      'medien',
      'wissen',
      'freigaben',
    ],
  },
  { id: 'gebet', schirme: ['gebetszeiten', 'besondere-tage', 'koran', 'rezitationen', 'hatim', 'anzeige'] },
  {
    id: 'unterricht',
    schirme: [
      'kurse',
      'gruppen',
      'gruppe',
      'lernende',
      'lernender',
      'lehrplan',
      'lernapp',
      'lernapp-kurs',
      'lernapp-sprachpruefung',
      'lernapp-audio',
    ],
  },
  { id: 'kommunikation', schirme: ['eingaenge', 'postfach', 'tickets', 'newsletter'] },
  { id: 'betrieb', schirme: ['benutzer', 'gemeinde-konten', 'audit', 'startklar', 'einstellungen', 'styleguide', 'verwaltung-konto'] },
  {
    id: 'mitglieder',
    schirme: [
      'konto-anmelden',
      'konto-registrieren',
      'konto-passwort',
      'mein-bereich',
      'mein-kinder',
      'mein-kind',
      'mein-gruppe',
      'mein-chat',
      'mein-lesezeichen',
      'mein-konto',
      'kind-bereich',
    ],
  },
  {
    id: 'lehrkraft',
    schirme: [
      'unterricht',
      'unterricht-gruppe',
      'unterricht-anwesenheit',
      'unterricht-fortschritt',
      'unterricht-lernapp',
      'unterricht-moderation',
    ],
  },
] as const satisfies readonly { id: string; schirme: readonly SchirmId[] }[];

export type GruppenId = (typeof RUNDGANG_GRUPPEN)[number]['id'];

export const aufnahmeAdresse = (id: SchirmId, geraet: 'desktop' | 'telefon') => `/vorfuehrung/${id}-${geraet}.jpg`;
