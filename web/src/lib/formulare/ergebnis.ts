import type { ReactNode } from 'react';

/**
 * Ergebnis der Verarbeitung öffentlicher Formulare (ADR 0005): nie Personendaten oder Interna, Fehler als Schlüssel
 * unter `formulare.fehler` bzw. des Formular-Namensraums; `werte` nur zum erneuten Befüllen des Formulars.
 */
export type FormularErgebnis =
  | { status: 'leer' }
  | { status: 'erfolg' }
  | { status: 'fehler'; fehler: string; feldFehler?: Record<string, string>; werte?: Record<string, unknown> };

export const LEER: FormularErgebnis = { status: 'leer' };

/**
 * Antwort einer öffentlichen Formular-Action an `FormularInsel` (E-028): Die Action rendert die nächste Ansicht
 * auf dem Server (Felder mit Werten und Fehlern bzw. die Erfolgsmeldung) – im Browser bleibt nur eine kleine Insel.
 * `fehler`/`feldFehler` sind Schlüssel (für Tests und Protokoll), die Werte stecken nur in `ansicht`.
 */
export type FormularAntwort = {
  /** „schritt“: FormWizard wechselt ohne Fehler in einen anderen Schritt */
  status: 'erfolg' | 'fehler' | 'schritt';
  fehler?: string;
  feldFehler?: Record<string, string>;
  ansicht: ReactNode;
};

/** Namen der Schutzfelder – im Formular gesetzt, in der Action geprüft. */
export const FELD_HONIGTOPF = 'website';
export const FELD_ALTCHA = 'altcha';
