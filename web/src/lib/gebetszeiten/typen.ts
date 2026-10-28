/** Gebetszeiten eines Tages als Ortszeit Europe/Berlin „HH:MM“ (ADR 0008). Namen wie im Bestand/Design (türkisch). */
export const GEBETE = ['imsak', 'gunes', 'ogle', 'ikindi', 'aksam', 'yatsi'] as const;
export type Gebet = (typeof GEBETE)[number];
export type Tageszeiten = Record<Gebet, string>;
/**
 * Herkunft eines Tages (ADR 0048): `import` = Tabelle der Gemeinde, `igmg` = IGMG-Gebetskalender (Abgleich, eingefügte
 * Tabelle oder Jahresdatei), `berechnet` = Näherung oder Methode (öffentlich „berechnet (vorläufig)“).
 */
export type Zeitquelle = 'import' | 'igmg' | 'berechnet';
export type GebetszeitTag = Tageszeiten & { datum: string; quelle: Zeitquelle };

export type HoheBreite = 'middleofthenight' | 'seventhofthenight' | 'twilightangle';

/**
 * Kalibrierte Näherung „IGMG (angenähert)“ (ADR 0048): adhan mit eigenen Winkeln, ohne Rundung und ohne Anpassungen der
 * Methode; danach Temkin in Sekunden je Gebet und eigene Rundung auf die volle Minute. Asr nach Schafii (erste
 * Schattenlänge), wie im IGMG-Kalender.
 */
export type Naeherung = {
  fajrWinkel: number;
  ishaWinkel: number;
  /** Zuschlag in Sekunden je Gebet (negativ = früher) */
  temkinSek: Record<Gebet, number>;
  hoheBreite: HoheBreite;
};

/**
 * Werte aus dem Abgleich mit der IGMG-Tabelle Aachen, Oktober 2026 (50,77664 N, 6,08342 E nach GeoNames), mit adhan 4.4.6
 * angepasst (`pnpm gebetszeiten:kalibrieren`): je Gebet höchstens 1 Minute Abweichung, 29 bis 31 von 31 Tagen exakt.
 * Yatsı passt mit 18° besser als mit 17° (30 statt 28 von 31 Tagen; ADR 0048 Nr. 6). Gilt sicher nur für Herbst und Winter.
 */
export const STANDARD_NAEHERUNG: Naeherung = {
  fajrWinkel: 18,
  ishaWinkel: 18,
  temkinSek: { imsak: -17, gunes: -447, ogle: 308, ikindi: 360, aksam: 507, yatsi: -667 },
  hoheBreite: 'twilightangle',
};

export type Berechnungseinstellungen = {
  methode:
    | 'Turkey'
    | 'MuslimWorldLeague'
    | 'Egyptian'
    | 'Karachi'
    | 'UmmAlQura'
    | 'Dubai'
    | 'MoonsightingCommittee'
    | 'NorthAmerica'
    | 'Kuwait'
    | 'Qatar'
    | 'Singapore'
    | 'Tehran';
  madhab: 'shafi' | 'hanafi';
  hoheBreite: HoheBreite;
  /** Zusätzliche Minuten je Gebet (zu den Anpassungen der Methode) */
  anpassungen: Partial<Record<Gebet, number>>;
  breite: number;
  laenge: number;
  /** Womit Tage ohne Tabelle gerechnet werden (ADR 0048); ohne Angabe die Methode oben. */
  rueckfall?: 'naeherung' | 'methode';
  naeherung?: Naeherung;
};

/**
 * Standard (K-08, ADR 0008, ADR 0048): Rückfall „IGMG (angenähert)“ am Stadtpunkt Wetzlar. Die Methode (Turkey, Shafi
 * (asr-ı evvel), Siebtel der Nacht) gilt nur, wenn die Verwaltung den Rückfall „Methode“ wählt (MENSCHEN M-017).
 */
export const STANDARD_EINSTELLUNGEN: Berechnungseinstellungen = {
  methode: 'Turkey',
  madhab: 'shafi',
  hoheBreite: 'seventhofthenight',
  anpassungen: {},
  breite: 50.567,
  laenge: 8.5,
  rueckfall: 'naeherung',
  naeherung: STANDARD_NAEHERUNG,
};

export const ZEIT_MUSTER = /^([01]\d|2[0-3]):[0-5]\d$/;
