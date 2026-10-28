import type { z } from 'zod';
import type { SEITENINHALT } from '@/lib/validierung/seiteninhalte';

/**
 * Bereiche des Moduls „Seiteninhalte I“ (V05): Über uns, Vorstand, Projekte, IGMG, Impressum und Datenschutz, dazu „Aus
 * dem Dachverband“ (Marktstart P3: Freitagspredigt und Gemeinschaftsthemen der IGMG) und „Hadsch & Umra“ (Marktstart P4). Die
 * Kontaktdaten und die vier Organisationen pflegen andere Pakete; die Übersicht verlinkt sie nur.
 * Reine Daten und Typen ohne Datenbank, damit Server, Browser und Tests dieselbe Liste nutzen.
 */
export const VERWALTUNG_BEREICHE = [
  'ueber-uns',
  'vorstand',
  'projekte',
  'igmg',
  'impressum',
  'datenschutz',
  'dachverband',
  'hadsch-umra',
] as const;
export type VerwaltungBereich = (typeof VERWALTUNG_BEREICHE)[number];

export function istVerwaltungBereich(wert: string): wert is VerwaltungBereich {
  return (VERWALTUNG_BEREICHE as readonly string[]).includes(wert);
}

export const KONTAKT_BEREICH = 'kontakt';

/** Organisationen: Kürzel in der Adresse und Bereich im Seiteninhalt (Registry in src/lib/validierung/seiteninhalte.ts). */
export const ORGANISATIONEN = [
  { kuerzel: 'at', bereich: 'organisation-ana-teskilati' },
  { kuerzel: 'kt', bereich: 'organisation-kadin-teskilati' },
  { kuerzel: 'gt', bereich: 'organisation-genclik-teskilati' },
  { kuerzel: 'kgt', bereich: 'organisation-kadin-genclik-teskilati' },
] as const;
export type Organisationskuerzel = (typeof ORGANISATIONEN)[number]['kuerzel'];

/** Inhalt eines Bereichs in der Form, die das Schema nach Standardwerten liefert. */
export type InhaltFuer<B extends VerwaltungBereich> = z.infer<(typeof SEITENINHALT)[B]>;

/** Stand eines Bereichs für die Verwaltung: Inhalt, Zustand und letzte Änderung. */
export type StandFuer<B extends VerwaltungBereich> = {
  bereich: B;
  inhalt: InhaltFuer<B>;
  /** true: keine gespeicherte Fassung oder als Beispiel markiert. */
  istBeispiel: boolean;
  aktualisiertAm: Date | null;
  /** true: Die gespeicherte Fassung passt nicht mehr zum Schema; angezeigt werden Standardwerte. */
  unlesbar: boolean;
};

/** Ein Stand, unterschieden nach Bereich (diskriminierte Union: `stand.bereich` legt den Inhalt fest). */
export type VerwaltungsStand = { [B in VerwaltungBereich]: StandFuer<B> }[VerwaltungBereich];
