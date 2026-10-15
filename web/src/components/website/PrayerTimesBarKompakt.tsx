import { leisteDaten } from './leiste/leiste-daten';
import { LeisteKompakt } from './leiste/LeisteKompakt';

/**
 * PrayerTimesBar als eine Zeile „Nächstes Gebet · Zeit“ für Leseseiten (Sichtabnahme S-1, `/quran/[sure]`), im
 * `Grundrahmen` als `leiste`. Eigenes Modul, damit Seiten mit voller Leiste ihr JavaScript nicht mitladen (Z-08).
 */
export async function PrayerTimesBarKompakt() {
  return <LeisteKompakt {...await leisteDaten()} />;
}
