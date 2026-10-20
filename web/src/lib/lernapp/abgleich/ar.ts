import type { SprachRegeln } from './normalisiere';

/**
 * Arabisch (PLAN §4.1). Zeichen nur als Codepunkt-Escapes (KERN §3).
 *
 * Still (ohne Hinweis):
 * - Harakat U+064B–U+065F und Alif khanjariyya U+0670 entfernen (außer im strengen Modus der Übung `harakat`)
 * - Tatweel U+0640 entfernen
 * - Alif mit Madda, Hamza oder Wasla (U+0622, U+0623, U+0625, U+0671–U+0673) → Alif U+0627
 * - Hamza-Träger tolerant: Waw mit Hamza U+0624 und Yaa mit Hamza U+0626 → Hamza U+0621
 * - persisches Yaa U+06CC → U+064A, Kaf U+06A9 → U+0643; Ziffern U+0660–U+0669 → 0–9 (in `bereite`)
 * - kanonische Reihenfolge Schadda/Vokal: NFC ordnet die Zeichen nach ihrer Kombinationsklasse (Vokal vor Schadda)
 *
 * Mit Hinweis (Lockerung): Alif maqsura U+0649 ↔ Yaa U+064A und Taa marbuta U+0629 ↔ Haa U+0647 am Wortende.
 * Im strengen Modus zählen Vokalzeichen und Hamza-Formen; es gibt keine Lockerungen.
 */
export const REGELN_AR: SprachRegeln = {
  sprache: 'ar',
  klein: (text) => text.toLowerCase(),
  still(text, streng) {
    const s = text
      .replace(/\u0640/g, '')
      .replace(/\u06CC/g, '\u064A')
      .replace(/\u06A9/g, '\u0643');
    if (streng) return s;
    return s
      .replace(/[\u064B-\u065F\u0670]/g, '')
      .replace(/[\u0622\u0623\u0625\u0671-\u0673]/g, '\u0627')
      .replace(/[\u0624\u0626]/g, '\u0621');
  },
  lockerungen: [
    { hinweis: 'alifMaqsura', wende: (w) => w.replace(/\u0649$/, '\u064A') },
    { hinweis: 'taMarbuta', wende: (w) => w.replace(/\u0629$/, '\u0647') },
  ],
};
