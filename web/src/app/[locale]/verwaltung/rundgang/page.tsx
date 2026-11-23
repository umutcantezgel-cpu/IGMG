import { Rundgang } from '@/components/verwaltung/rundgang/Rundgang';

/**
 * Rundgang mit Aufnahmen aller Bildschirme hinter der Anmeldung (ADR 0051) auf eigener Adresse: zum Ansehen ohne
 * Anmeldung. In der Vorführung mit Testzugang (ADR 0052) verweist die Anmeldeseite hierher; ganz ohne Datenbank zeigt
 * das Layout der Verwaltung den Rundgang ohnehin unter jeder Adresse.
 */
export default function RundgangSeite() {
  return <Rundgang />;
}
