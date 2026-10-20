import 'server-only';
import { createTranslator } from 'next-intl';
import ar from '../../../messages/lernapp/ar.json';
import de from '../../../messages/lernapp/de.json';
import tr from '../../../messages/lernapp/tr.json';
import { intlSprache, type Ziffern } from './format';
import type { Oberflaeche } from './kurse';

/** Oberflächensprachen und Richtung kommen aus `kurse.ts` (L1-01); hier nur weitergereicht. */
export { OBERFLAECHEN, istOberflaeche, richtung, type Oberflaeche } from './kurse';

export type LernNachrichten = typeof de;
const NACHRICHTEN: Record<Oberflaeche, LernNachrichten> = { de, tr, ar };

/**
 * Texte der Oberfläche auf dem Server (ADR 0037 Nr. 5 mit Fortschreibung Nr. 4): `createTranslator` mit ausdrücklicher
 * Sprache, ohne die `getRequestConfig` der Website (die kennt nur de/tr/en und ruft unter `/lern-app` `notFound()`).
 * In der arabischen Oberfläche mit östlich-arabischen Ziffern (O-5), auf Wunsch westlich (`ziffern: 'latn'`, LM-18).
 * Im Client der Lern-App kein next-intl (KERN 4.0 §9): Inseln bekommen die rohen Nachrichten als Props (`rohTexte`) und
 * formatieren mit `format.ts`.
 */
export function lernTexte(ui: Oberflaeche, ziffern: Ziffern = 'arab') {
  return createTranslator({ locale: intlSprache(ui, ziffern), messages: NACHRICHTEN[ui] });
}

/** Rohe Nachrichten eines Namensraums (ICU-Text ungeformt) für eine Client-Insel. */
export function rohTexte<N extends keyof LernNachrichten>(ui: Oberflaeche, namensraum: N): LernNachrichten[N] {
  return NACHRICHTEN[ui][namensraum];
}
