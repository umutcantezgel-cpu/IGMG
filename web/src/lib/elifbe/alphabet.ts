/**
 * Elifbe – das arabische Alphabet aus Unicode-Codepunkten (ADR 0030, KI-Regel): 28 Buchstaben in der Reihenfolge des
 * Elifbâ-Unterrichts und die Hamza. Alle Zeichen entstehen hier aus Zahlen (`String.fromCodePoint`), nie aus getipptem
 * arabischem Text; Formen über den Verbinder U+200D (ZWJ), nicht über Darstellungsformen (U+FBxx/U+FExx).
 * Diese Datei ist ohne Importe, damit auch das Glyphen-Werkzeug sie lesen kann (`_gemeinde/werkzeuge/elifbe-glyphen.mjs`).
 *
 * Adressen (Slugs, ASCII, eindeutig): türkische Elifbâ-Namen ohne Sonderzeichen –
 * elif, be, te, se, cim, ha, hi, dal, zel, ra, ze, sin, shin, sad, dad, ti, zi, ayin, gayin, fe, kaf, kef, lam, mim,
 * nun, vav, he, ye, hemze. Einzige Ausnahme: Şın heißt `shin` (sonst gleich mit `sin`).
 *
 * Fachbegriffe (Namen, Artikulationsort-Gruppen) sind Bezeichnungen, keine Erklärungen. Gruppen, Ähnlichkeiten und
 * Reihenfolge prüft die Hoca (MENSCHEN MN-07); bis dahin gelten sie als vorläufig.
 */

/** Verbinder (Zero Width Joiner): erzwingt die verbundene Form, ohne ein sichtbares Zeichen hinzuzufügen. */
export const ZWJ = '\u200D';

export type Sprache = 'de' | 'tr' | 'en';
export type Mehrsprachig = Record<Sprache, string>;

/** Lage der Punkte (oder Zeichen) am Buchstaben. */
export type PunktLage = 'keine' | 'oben' | 'unten' | 'innen';

/**
 * Artikulationsort-Gruppe (Mahrec) als Fachbegriff. Die Erklärung schreibt die Hoca (Platzhalter bis MN-07).
 * halk = Kehle, lisan = Zunge, sefeteyn = Lippen, cevf = Mund- und Rachenraum.
 */
export type Mahrec = 'halk' | 'lisan' | 'sefeteyn' | 'cevf';

/** Grundform (Buchstaben mit gleichem Rumpf, die sich nur durch Punkte unterscheiden). */
export type Familie =
  | 'elif'
  | 'be'
  | 'cim'
  | 'dal'
  | 'ra'
  | 'sin'
  | 'sad'
  | 'ti'
  | 'ayin'
  | 'fe'
  | 'kaf'
  | 'kef'
  | 'lam'
  | 'mim'
  | 'nun'
  | 'vav'
  | 'he'
  | 'ye'
  | 'hemze';

export type Buchstabe = {
  /** Stelle im Elifbe (1 … 29; die Hamza steht am Ende). */
  nr: number;
  slug: string;
  codepunkt: number;
  /** Elifbâ-Name, wie er im Unterricht der Gemeinde fällt (türkisch). */
  elifbe: string;
  /** Name in der Sprache der Seite (Fachbegriff; in tr gleich dem Elifbâ-Namen). */
  name: Mehrsprachig;
  /** Vereinfachte Umschrift des Lauts (Konsonant) je Sprache; leer bei Elif (Träger des Vokals). */
  laut: Mehrsprachig;
  /** Verbindet sich mit dem folgenden Buchstaben (links). Rechts verbinden sich alle außer der Hamza. */
  verbindetLinks: boolean;
  verbindetRechts: boolean;
  punkte: { anzahl: 0 | 1 | 2 | 3; lage: PunktLage };
  familie: Familie;
  mahrec: Mahrec;
  /** Buchstaben, die leicht zu verwechseln sind (Slugs, gleiche Reihenfolge wie im Elifbe). */
  aehnlich: string[];
};

type Roh = Omit<Buchstabe, 'nr' | 'verbindetRechts' | 'aehnlich'> & { verbindetRechts?: boolean; aehnlich?: string[] };

const n = (de: string, tr: string, en: string): Mehrsprachig => ({ de, tr, en });

const ROH: Roh[] = [
  {
    slug: 'elif',
    codepunkt: 0x0627,
    elifbe: 'Elif',
    name: n('Alif', 'Elif', 'Alif'),
    laut: n('', '', ''),
    verbindetLinks: false,
    punkte: { anzahl: 0, lage: 'keine' },
    familie: 'elif',
    mahrec: 'cevf',
    aehnlich: ['lam'],
  },
  {
    slug: 'be',
    codepunkt: 0x0628,
    elifbe: 'Be',
    name: n('Ba', 'Be', 'Ba'),
    laut: n('b', 'b', 'b'),
    verbindetLinks: true,
    punkte: { anzahl: 1, lage: 'unten' },
    familie: 'be',
    mahrec: 'sefeteyn',
    aehnlich: ['te', 'se', 'nun', 'ye'],
  },
  {
    slug: 'te',
    codepunkt: 0x062a,
    elifbe: 'Te',
    name: n('Ta', 'Te', 'Ta'),
    laut: n('t', 't', 't'),
    verbindetLinks: true,
    punkte: { anzahl: 2, lage: 'oben' },
    familie: 'be',
    mahrec: 'lisan',
    aehnlich: ['be', 'se', 'nun'],
  },
  {
    slug: 'se',
    codepunkt: 0x062b,
    elifbe: 'Se',
    name: n('Tha', 'Se', 'Tha'),
    laut: n('th', 's̱', 'th'),
    verbindetLinks: true,
    punkte: { anzahl: 3, lage: 'oben' },
    familie: 'be',
    mahrec: 'lisan',
    aehnlich: ['be', 'te', 'shin'],
  },
  {
    slug: 'cim',
    codepunkt: 0x062c,
    elifbe: 'Cim',
    name: n('Dschim', 'Cim', 'Jim'),
    laut: n('dsch', 'c', 'j'),
    verbindetLinks: true,
    punkte: { anzahl: 1, lage: 'innen' },
    familie: 'cim',
    mahrec: 'lisan',
    aehnlich: ['ha', 'hi'],
  },
  {
    slug: 'ha',
    codepunkt: 0x062d,
    elifbe: 'Ha',
    name: n('Ḥa', 'Ha', 'Ḥa'),
    laut: n('ḥ', 'ḥ', 'ḥ'),
    verbindetLinks: true,
    punkte: { anzahl: 0, lage: 'keine' },
    familie: 'cim',
    mahrec: 'halk',
    aehnlich: ['cim', 'hi'],
  },
  {
    slug: 'hi',
    codepunkt: 0x062e,
    elifbe: 'Hı',
    name: n('Cha', 'Hı', 'Kha'),
    laut: n('ch', 'h̬', 'kh'),
    verbindetLinks: true,
    punkte: { anzahl: 1, lage: 'oben' },
    familie: 'cim',
    mahrec: 'halk',
    aehnlich: ['cim', 'ha'],
  },
  {
    slug: 'dal',
    codepunkt: 0x062f,
    elifbe: 'Dal',
    name: n('Dal', 'Dal', 'Dal'),
    laut: n('d', 'd', 'd'),
    verbindetLinks: false,
    punkte: { anzahl: 0, lage: 'keine' },
    familie: 'dal',
    mahrec: 'lisan',
    aehnlich: ['zel', 'ra'],
  },
  {
    slug: 'zel',
    codepunkt: 0x0630,
    elifbe: 'Zel',
    name: n('Dhal', 'Zel', 'Dhal'),
    laut: n('dh', 'ẕ', 'dh'),
    verbindetLinks: false,
    punkte: { anzahl: 1, lage: 'oben' },
    familie: 'dal',
    mahrec: 'lisan',
    aehnlich: ['dal', 'ze'],
  },
  {
    slug: 'ra',
    codepunkt: 0x0631,
    elifbe: 'Ra',
    name: n('Ra', 'Ra', 'Ra'),
    laut: n('r', 'r', 'r'),
    verbindetLinks: false,
    punkte: { anzahl: 0, lage: 'keine' },
    familie: 'ra',
    mahrec: 'lisan',
    aehnlich: ['ze', 'dal', 'vav'],
  },
  {
    slug: 'ze',
    codepunkt: 0x0632,
    elifbe: 'Ze',
    name: n('Zay', 'Ze', 'Zay'),
    laut: n('z', 'z', 'z'),
    verbindetLinks: false,
    punkte: { anzahl: 1, lage: 'oben' },
    familie: 'ra',
    mahrec: 'lisan',
    aehnlich: ['ra', 'zel'],
  },
  {
    slug: 'sin',
    codepunkt: 0x0633,
    elifbe: 'Sin',
    name: n('Sin', 'Sin', 'Sin'),
    laut: n('s', 's', 's'),
    verbindetLinks: true,
    punkte: { anzahl: 0, lage: 'keine' },
    familie: 'sin',
    mahrec: 'lisan',
    aehnlich: ['shin', 'sad'],
  },
  {
    slug: 'shin',
    codepunkt: 0x0634,
    elifbe: 'Şın',
    name: n('Schin', 'Şın', 'Shin'),
    laut: n('sch', 'ş', 'sh'),
    verbindetLinks: true,
    punkte: { anzahl: 3, lage: 'oben' },
    familie: 'sin',
    mahrec: 'lisan',
    aehnlich: ['sin', 'se'],
  },
  {
    slug: 'sad',
    codepunkt: 0x0635,
    elifbe: 'Sad',
    name: n('Ṣad', 'Sad', 'Ṣad'),
    laut: n('ṣ', 'ṣ', 'ṣ'),
    verbindetLinks: true,
    punkte: { anzahl: 0, lage: 'keine' },
    familie: 'sad',
    mahrec: 'lisan',
    aehnlich: ['dad', 'sin', 'ti'],
  },
  {
    slug: 'dad',
    codepunkt: 0x0636,
    elifbe: 'Dad',
    name: n('Ḍad', 'Dad', 'Ḍad'),
    laut: n('ḍ', 'ḍ', 'ḍ'),
    verbindetLinks: true,
    punkte: { anzahl: 1, lage: 'oben' },
    familie: 'sad',
    mahrec: 'lisan',
    aehnlich: ['sad', 'zi'],
  },
  {
    slug: 'ti',
    codepunkt: 0x0637,
    elifbe: 'Tı',
    name: n('Ṭa', 'Tı', 'Ṭa'),
    laut: n('ṭ', 'ṭ', 'ṭ'),
    verbindetLinks: true,
    punkte: { anzahl: 0, lage: 'keine' },
    familie: 'ti',
    mahrec: 'lisan',
    aehnlich: ['zi', 'sad'],
  },
  {
    slug: 'zi',
    codepunkt: 0x0638,
    elifbe: 'Zı',
    name: n('Ẓa', 'Zı', 'Ẓa'),
    laut: n('ẓ', 'ẓ', 'ẓ'),
    verbindetLinks: true,
    punkte: { anzahl: 1, lage: 'oben' },
    familie: 'ti',
    mahrec: 'lisan',
    aehnlich: ['ti', 'dad'],
  },
  {
    slug: 'ayin',
    codepunkt: 0x0639,
    elifbe: 'Ayın',
    name: n('ʿAin', 'Ayın', 'ʿAyn'),
    laut: n('ʿ', 'ʿ', 'ʿ'),
    verbindetLinks: true,
    punkte: { anzahl: 0, lage: 'keine' },
    familie: 'ayin',
    mahrec: 'halk',
    aehnlich: ['gayin', 'hemze'],
  },
  {
    slug: 'gayin',
    codepunkt: 0x063a,
    elifbe: 'Ğayın',
    name: n('Ghain', 'Ğayın', 'Ghayn'),
    laut: n('gh', 'ğ', 'gh'),
    verbindetLinks: true,
    punkte: { anzahl: 1, lage: 'oben' },
    familie: 'ayin',
    mahrec: 'halk',
    aehnlich: ['ayin'],
  },
  {
    slug: 'fe',
    codepunkt: 0x0641,
    elifbe: 'Fe',
    name: n('Fa', 'Fe', 'Fa'),
    laut: n('f', 'f', 'f'),
    verbindetLinks: true,
    punkte: { anzahl: 1, lage: 'oben' },
    familie: 'fe',
    mahrec: 'sefeteyn',
    aehnlich: ['kaf'],
  },
  {
    slug: 'kaf',
    codepunkt: 0x0642,
    elifbe: 'Kaf',
    name: n('Qaf', 'Kaf', 'Qaf'),
    laut: n('q', 'ḳ', 'q'),
    verbindetLinks: true,
    punkte: { anzahl: 2, lage: 'oben' },
    familie: 'kaf',
    mahrec: 'lisan',
    aehnlich: ['fe', 'kef'],
  },
  {
    slug: 'kef',
    codepunkt: 0x0643,
    elifbe: 'Kef',
    name: n('Kaf', 'Kef', 'Kaf'),
    laut: n('k', 'k', 'k'),
    verbindetLinks: true,
    punkte: { anzahl: 0, lage: 'keine' },
    familie: 'kef',
    mahrec: 'lisan',
    aehnlich: ['kaf', 'lam'],
  },
  {
    slug: 'lam',
    codepunkt: 0x0644,
    elifbe: 'Lâm',
    name: n('Lam', 'Lâm', 'Lam'),
    laut: n('l', 'l', 'l'),
    verbindetLinks: true,
    punkte: { anzahl: 0, lage: 'keine' },
    familie: 'lam',
    mahrec: 'lisan',
    aehnlich: ['elif', 'kef'],
  },
  {
    slug: 'mim',
    codepunkt: 0x0645,
    elifbe: 'Mim',
    name: n('Mim', 'Mim', 'Mim'),
    laut: n('m', 'm', 'm'),
    verbindetLinks: true,
    punkte: { anzahl: 0, lage: 'keine' },
    familie: 'mim',
    mahrec: 'sefeteyn',
    aehnlich: ['vav'],
  },
  {
    slug: 'nun',
    codepunkt: 0x0646,
    elifbe: 'Nun',
    name: n('Nun', 'Nun', 'Nun'),
    laut: n('n', 'n', 'n'),
    verbindetLinks: true,
    punkte: { anzahl: 1, lage: 'oben' },
    familie: 'nun',
    mahrec: 'lisan',
    aehnlich: ['be', 'te'],
  },
  {
    slug: 'vav',
    codepunkt: 0x0648,
    elifbe: 'Vav',
    name: n('Waw', 'Vav', 'Waw'),
    laut: n('w', 'v', 'w'),
    verbindetLinks: false,
    punkte: { anzahl: 0, lage: 'keine' },
    familie: 'vav',
    mahrec: 'sefeteyn',
    aehnlich: ['ra', 'mim'],
  },
  {
    slug: 'he',
    codepunkt: 0x0647,
    elifbe: 'He',
    name: n('Ha', 'He', 'Ha'),
    laut: n('h', 'h', 'h'),
    verbindetLinks: true,
    punkte: { anzahl: 0, lage: 'keine' },
    familie: 'he',
    mahrec: 'halk',
    aehnlich: ['ha'],
  },
  {
    slug: 'ye',
    codepunkt: 0x064a,
    elifbe: 'Ye',
    name: n('Ya', 'Ye', 'Ya'),
    laut: n('j', 'y', 'y'),
    verbindetLinks: true,
    punkte: { anzahl: 2, lage: 'unten' },
    familie: 'ye',
    mahrec: 'lisan',
    aehnlich: ['be', 'te'],
  },
  {
    slug: 'hemze',
    codepunkt: 0x0621,
    elifbe: 'Hemze',
    name: n('Hamza', 'Hemze', 'Hamza'),
    laut: n('ʾ', 'ʾ', 'ʾ'),
    verbindetLinks: false,
    verbindetRechts: false,
    punkte: { anzahl: 0, lage: 'keine' },
    familie: 'hemze',
    mahrec: 'halk',
    aehnlich: ['ayin'],
  },
];

export const BUCHSTABEN: readonly Buchstabe[] = ROH.map((b, i) => ({
  ...b,
  nr: i + 1,
  verbindetRechts: b.verbindetRechts ?? true,
  aehnlich: b.aehnlich ?? [],
}));

export const SLUGS: readonly string[] = BUCHSTABEN.map((b) => b.slug);

const NACH_SLUG = new Map(BUCHSTABEN.map((b) => [b.slug, b]));

export function buchstabeFuer(slug: string): Buchstabe | undefined {
  return NACH_SLUG.get(slug);
}

/** Das Zeichen eines Buchstabens (aus dem Codepunkt). */
export function zeichen(b: Pick<Buchstabe, 'codepunkt'>): string {
  return String.fromCodePoint(b.codepunkt);
}

/** Codepunkt als vierstellige Hex-Angabe („0628“), wie in `elifbe_lektion.buchstaben` und `elifbe_audio.schluessel`. */
export function hex(codepunkt: number): string {
  return codepunkt.toString(16).toUpperCase().padStart(4, '0');
}

export type FormArt = 'isoliert' | 'anfang' | 'mitte' | 'ende';
export const FORM_ARTEN: readonly FormArt[] = ['isoliert', 'anfang', 'mitte', 'ende'];

/**
 * Die vier Formen über ZWJ: Anfang = Zeichen + ZWJ, Mitte = ZWJ + Zeichen + ZWJ, Ende = ZWJ + Zeichen.
 * Verbindet ein Buchstabe nicht nach links, sieht der Anfang aus wie die Einzelform und die Mitte wie das Ende;
 * die Hamza verbindet sich gar nicht und hat nur eine Form.
 */
export function formen(b: Pick<Buchstabe, 'codepunkt' | 'verbindetLinks' | 'verbindetRechts'>): Record<FormArt, string> {
  const z = zeichen(b);
  const links = b.verbindetLinks ? ZWJ : '';
  const rechts = b.verbindetRechts ? ZWJ : '';
  return { isoliert: z, anfang: z + links, mitte: rechts + z + links, ende: rechts + z };
}

/** Harakat (Lesezeichen) als Codepunkte; Namen sind Fachbegriffe. */
export type HarakaSchluessel = 'fatha' | 'kasra' | 'damma' | 'sukun' | 'shadda' | 'fathatan' | 'kasratan' | 'dammatan';

export type Haraka = {
  schluessel: HarakaSchluessel;
  codepunkt: number;
  name: Mehrsprachig;
  /** Vokal der vereinfachten Umschrift; leer bei Sukun und Shadda. */
  vokal: string;
  /** Tanwin: „n“ am Ende der Umschrift. */
  tanwin: boolean;
};

export const HARAKAT: readonly Haraka[] = [
  { schluessel: 'fatha', codepunkt: 0x064e, name: n('Fatha', 'Üstün', 'Fatha'), vokal: 'a', tanwin: false },
  { schluessel: 'kasra', codepunkt: 0x0650, name: n('Kasra', 'Esre', 'Kasra'), vokal: 'i', tanwin: false },
  { schluessel: 'damma', codepunkt: 0x064f, name: n('Damma', 'Ötre', 'Damma'), vokal: 'u', tanwin: false },
  { schluessel: 'sukun', codepunkt: 0x0652, name: n('Sukun', 'Cezm', 'Sukun'), vokal: '', tanwin: false },
  { schluessel: 'shadda', codepunkt: 0x0651, name: n('Schadda', 'Şedde', 'Shadda'), vokal: '', tanwin: false },
  { schluessel: 'fathatan', codepunkt: 0x064b, name: n('Tanwin Fatha', 'İki üstün', 'Tanwin fatha'), vokal: 'a', tanwin: true },
  { schluessel: 'kasratan', codepunkt: 0x064d, name: n('Tanwin Kasra', 'İki esre', 'Tanwin kasra'), vokal: 'i', tanwin: true },
  { schluessel: 'dammatan', codepunkt: 0x064c, name: n('Tanwin Damma', 'İki ötre', 'Tanwin damma'), vokal: 'u', tanwin: true },
];

const HARAKA_NACH_SCHLUESSEL = new Map(HARAKAT.map((h) => [h.schluessel, h]));

export function haraka(schluessel: HarakaSchluessel): Haraka {
  const h = HARAKA_NACH_SCHLUESSEL.get(schluessel);
  if (!h) throw new Error(`Unbekannte Haraka: ${schluessel}`);
  return h;
}

/** Tatweel (Dehnungsstrich) – nur für Hilfsdarstellungen, nicht für Formen. */
export const TATWEEL = 0x0640;
