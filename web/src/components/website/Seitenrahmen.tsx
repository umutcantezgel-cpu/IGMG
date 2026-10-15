import { Grundrahmen, type GrundrahmenProps } from './Grundrahmen';
import { PrayerTimesBar } from './PrayerTimesBar';

/**
 * Rahmen jeder öffentlichen Seite (MUSTER „Seite“) mit der vollen PrayerTimesBar: Grundrahmen (Sprunglink, Header,
 * Breadcrumbs, Inhalt, Footer, Konzept-Hinweis) plus Leiste. Ausnahmen nutzen den Grundrahmen direkt: Gebetszeiten ohne
 * Leiste (Laufbuch D-16), Leseseiten mit `PrayerTimesBarKompakt` (Sichtabnahme S-1) – so lädt keine Seite das
 * JavaScript einer Leiste, die sie nicht zeigt (Z-08).
 */
export function Seitenrahmen(props: GrundrahmenProps) {
  return <Grundrahmen {...props} leiste={<PrayerTimesBar />} />;
}
