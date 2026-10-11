/** Gebetszeiten eines Tages als Ortszeit Europe/Berlin „HH:MM“ (ADR 0008). Namen wie im Bestand/Design (türkisch). */
export const GEBETE = ['imsak', 'gunes', 'ogle', 'ikindi', 'aksam', 'yatsi'] as const;
export type Gebet = (typeof GEBETE)[number];
export type Tageszeiten = Record<Gebet, string>;
export type GebetszeitTag = Tageszeiten & { datum: string; quelle: 'import' | 'berechnet' };

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
  hoheBreite: 'middleofthenight' | 'seventhofthenight' | 'twilightangle';
  /** Zusätzliche Minuten je Gebet (zu den Anpassungen der Methode) */
  anpassungen: Partial<Record<Gebet, number>>;
  breite: number;
  laenge: number;
};

/** Standardannahme bis zur Klärung (K-08, ADR 0008, MENSCHEN M-017): Turkey, Shafi (asr-ı evvel), Siebtel der Nacht, Stadtpunkt Wetzlar. */
export const STANDARD_EINSTELLUNGEN: Berechnungseinstellungen = {
  methode: 'Turkey',
  madhab: 'shafi',
  hoheBreite: 'seventhofthenight',
  anpassungen: {},
  breite: 50.567,
  laenge: 8.5,
};

export const ZEIT_MUSTER = /^([01]\d|2[0-3]):[0-5]\d$/;
