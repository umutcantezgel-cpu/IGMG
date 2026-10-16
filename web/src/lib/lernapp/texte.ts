import { createTranslator } from 'next-intl';
import ar from '../../../messages/lernapp/ar.json';
import de from '../../../messages/lernapp/de.json';
import tr from '../../../messages/lernapp/tr.json';

/**
 * Oberflächensprachen der Lern-App (ADR 0037 Nr. 1, L3-E08). Getrennt von `routing.locales` der Website (de/tr/en):
 * `ar` kommt nie in next-intl-Routing.
 */
export const OBERFLAECHEN = ['de', 'tr', 'ar'] as const;
export type Oberflaeche = (typeof OBERFLAECHEN)[number];

export function istOberflaeche(wert: unknown): wert is Oberflaeche {
  return typeof wert === 'string' && (OBERFLAECHEN as readonly string[]).includes(wert);
}

/** Schreibrichtung der Oberfläche: Arabisch vollständig von rechts nach links (ADR 0037 Nr. 6). */
export function richtung(ui: Oberflaeche): 'ltr' | 'rtl' {
  return ui === 'ar' ? 'rtl' : 'ltr';
}

const NACHRICHTEN: Record<Oberflaeche, typeof de> = { de, tr, ar };

/**
 * Texte der Oberfläche auf dem Server (ADR 0037 Nr. 5): `createTranslator` mit ausdrücklicher Sprache, ohne die
 * `getRequestConfig` der Website (die kennt nur de/tr/en). Im Client der Lern-App kein next-intl (KERN 4.0 §9).
 * Spike L0-S1: Platzhaltertexte; `ar.json` nur in Umschrift, bis die Religion-Prüfung die Datei erlaubt (KERN 4.0 §3).
 */
export function lernTexte(ui: Oberflaeche) {
  return createTranslator({ locale: ui, messages: NACHRICHTEN[ui] });
}
