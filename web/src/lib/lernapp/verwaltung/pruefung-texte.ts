import 'server-only';
import { createTranslator } from 'next-intl';
import datei from '../../../../messages/verwaltung/lernapp-pruefung.json';
import { istOberflaeche, type Oberflaeche } from '../kurse';

/**
 * Texte der Prüfoberfläche Sprache (ADR 0041 Nr. 10, PLAN §7.2): die einzige Seite der Verwaltung mit Sprachwahl de/tr/ar.
 * Wie in der Lern-App `createTranslator` mit ausdrücklicher Sprache (nicht `getTranslations`, das nur de/tr/en kennt); im
 * Client die rohen Texte als Props, gefüllt mit `lib/lernapp/format.ts`.
 */
export type PruefTexte = (typeof datei)['de'];
const TEXTE: Record<Oberflaeche, PruefTexte> = { de: datei.de, tr: datei.tr, ar: datei.ar };

/** Sprache der Prüfoberfläche aus dem Suchparameter `ui` (Standard Deutsch). */
export function pruefUi(wert: unknown): Oberflaeche {
  return istOberflaeche(wert) ? wert : 'de';
}

export function pruefTexte(ui: Oberflaeche) {
  return createTranslator({ locale: ui, messages: TEXTE[ui] });
}

export function rohPruefTexte(ui: Oberflaeche): PruefTexte {
  return TEXTE[ui];
}
