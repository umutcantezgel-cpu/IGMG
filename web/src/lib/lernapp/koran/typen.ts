import type { Lektion } from '../aufgaben/schema';
import type { Stufe } from '../kurse';

/**
 * Auslieferung des Koran-Arabisch-Pfads (L6-05, ADR 0039 Nr. 1/2, ADR 0040 Nr. 5) – Formate und Adressen ohne Abhängigkeiten
 * (Server und Client). Je Sprache der Bedeutungen (de, tr) ein Verzeichnis und je Einheit ein unveränderliches Paket unter
 * seinem SHA-256:
 *
 * - Verzeichnis `/lern-app/pakete/koran/<sprache>` (Netz zuerst): Einheiten mit Hash, Bytes, Zahl der Wortformen, der
 *   sichtbaren Bedeutungen und der spielbaren Lektionen.
 * - Paket `/lern-app/pakete/koran/<sprache>/<einheit>/<hash>`: Wortformen (Arabisch aus den gepinnten Koran-Daten, aufgelöst
 *   über ihre Stelle), Bedeutungen **nur** mit zwei religiösen Freigaben zum aktuellen Stand (sonst fehlt das Feld: „Bedeutung
 *   folgt“), Lektionen `koran_wort` nur, wenn jede gezeigte Bedeutung freigegeben ist. Wortzeiten nur aus geprüften Zeiten
 *   aktiver Rezitationen; nie Sprachausgabe (KERN 4.0 §4).
 */

export const KORAN_PAKET_FORMAT = 'igmg-lernapp-koran-paket';
export const KORAN_VERZEICHNIS_FORMAT = 'igmg-lernapp-koran-verzeichnis';
/** Sprachen der Bedeutungen (in der arabischen Oberfläche ist der Pfad ausgeblendet, ADR 0037 Nr. 7). */
export const BEDEUTUNGS_SPRACHEN = ['de', 'tr'] as const;
export type BedeutungsSprache = (typeof BEDEUTUNGS_SPRACHEN)[number];

export function istBedeutungsSprache(wert: unknown): wert is BedeutungsSprache {
  return wert === 'de' || wert === 'tr';
}

export function koranVerzeichnisAdresse(sprache: BedeutungsSprache): string {
  return `/lern-app/pakete/koran/${sprache}`;
}

export function koranPaketAdresse(sprache: BedeutungsSprache, einheit: string, hash: string): string {
  return `/lern-app/pakete/koran/${sprache}/${einheit}/${hash}`;
}

/** Ausschnitt einer geprüften Rezitation (Datei unter `/audio/…`, Zeiten in ms innerhalb der Datei). */
export type KoranWortZeit = { adresse: string; startMs: number; endeMs: number; rezitation: string };

export type KoranWort = {
  /** `Sure:Vers:Wort` */
  stelle: string;
  /** Wortform aus den gepinnten Koran-Daten (fehlt, wenn die Stelle nicht aufgelöst werden kann) */
  text?: string;
  /** Vorkommen der Wortform im ganzen Text */
  vorkommen: number;
  /** Bedeutung in der Sprache des Pakets, nur mit zwei Freigaben zum aktuellen Stand */
  bedeutung?: string;
  zeit?: KoranWortZeit;
};

export type KoranEinheitKopf = { schluessel: string; stufe: Stufe; reihenfolge: number; thema: { de?: string; tr?: string } };

export type KoranPaket = {
  format: typeof KORAN_PAKET_FORMAT;
  version: 1;
  kurs: 'koran';
  sprache: BedeutungsSprache;
  einheit: KoranEinheitKopf;
  woerter: KoranWort[];
  /** spielbare Lektionen (nur vollständig freigegeben), sonst leer */
  lektionen: Lektion[];
  /** Herkunft: Tanzil-Text, Bedeutungen der Gemeinde, Rezitationen */
  quellen: string[];
  lizenz: 'CC-BY-SA-4.0';
};

export type KoranVerzeichnisEinheit = KoranEinheitKopf & {
  hash: string;
  bytes: number;
  woerter: number;
  bedeutungen: number;
  /** Schlüssel der spielbaren Lektionen */
  lektionen: string[];
};

export type KoranVerzeichnis = {
  format: typeof KORAN_VERZEICHNIS_FORMAT;
  version: 1;
  kurs: 'koran';
  sprache: BedeutungsSprache;
  einheiten: KoranVerzeichnisEinheit[];
};
