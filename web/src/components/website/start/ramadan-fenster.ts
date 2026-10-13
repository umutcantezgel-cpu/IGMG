import { istRamadan } from '@/lib/gebetszeiten/hijri';

/**
 * Ramadan-Tage unter den Kalendertagen des Gebetszeiten-Fensters (gestern bis in 45 Tagen), über den Hidschri-Kalender
 * „islamic-umalqura“ wie /ramadan und /kalender (`src/lib/gebetszeiten/hijri.ts`, berechnet und vorläufig, MN-15).
 * Läuft auf dem Server: Die statische Startseite bekommt die Liste fertig, der Browser vergleicht nur das Datum
 * (`bogenArt`) – ohne Cookies und Header (K-01) und ohne islamischen Kalender im Browser (H-L01).
 */
export function ramadanImFenster(daten: readonly string[]): string[] {
  return daten.filter((d) => istRamadan(d));
}
