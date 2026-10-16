/**
 * Einstellung „Hinweis auch als Mitteilung des Browsers“ (F-38) – je Gerät, weil auch die Erlaubnis des Browsers je
 * Gerät gilt. Nur ein Merker im Speicher des Browsers (`igmg-…`, Datenschutz-Entwurf §5); er verlässt das Gerät nie.
 * Lesen und Schreiben können scheitern (privates Fenster, gesperrte Website-Daten): dann gilt „aus“.
 */
export const MITTEILUNG_SPEICHER = 'igmg-mitteilung-mein-bereich';

export function mitteilungEingeschaltet(): boolean {
  try {
    return window.localStorage.getItem(MITTEILUNG_SPEICHER) === 'an';
  } catch {
    return false;
  }
}

export function setzeMitteilung(an: boolean): void {
  try {
    if (an) window.localStorage.setItem(MITTEILUNG_SPEICHER, 'an');
    else window.localStorage.removeItem(MITTEILUNG_SPEICHER);
  } catch {
    // Speicher gesperrt: Einstellung gilt nur bis zum Neuladen nicht – der Hinweis in der Seite bleibt
  }
}
