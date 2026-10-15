import { leisteDaten } from './leiste/leiste-daten';
import { LeisteLive } from './leiste/LeisteLive';

/**
 * PrayerTimesBar (02.2) – über `Seitenrahmen` auf allen Seiten außer Gebetszeiten (Laufbuch D-16) und den Leseseiten
 * (`PrayerTimesBarKompakt`). Daten gecacht, Rechnung im Browser.
 */
export async function PrayerTimesBar() {
  return <LeisteLive {...await leisteDaten()} />;
}
