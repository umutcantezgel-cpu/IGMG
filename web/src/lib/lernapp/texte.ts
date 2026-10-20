import { createTranslator } from 'next-intl';
import ar from '../../../messages/lernapp/ar.json';
import de from '../../../messages/lernapp/de.json';
import tr from '../../../messages/lernapp/tr.json';
import type { Oberflaeche } from './kurse';

/** Oberflächensprachen und Richtung kommen aus `kurse.ts` (L1-01); hier nur weitergereicht. */
export { OBERFLAECHEN, istOberflaeche, richtung, type Oberflaeche } from './kurse';

const NACHRICHTEN: Record<Oberflaeche, typeof de> = { de, tr, ar };

/**
 * Texte der Oberfläche auf dem Server (ADR 0037 Nr. 5): `createTranslator` mit ausdrücklicher Sprache, ohne die
 * `getRequestConfig` der Website (die kennt nur de/tr/en). Im Client der Lern-App kein next-intl (KERN 4.0 §9).
 * Spike L0-S1: Platzhaltertexte; `ar.json` nur in Umschrift, bis die Religion-Prüfung die Datei erlaubt (KERN 4.0 §3).
 */
export function lernTexte(ui: Oberflaeche) {
  return createTranslator({ locale: ui, messages: NACHRICHTEN[ui] });
}
