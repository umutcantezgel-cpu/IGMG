/**
 * Version der Ableitung (ADR 0038 Nr. 2): Ändert sich eine Regel in `ableiten.ts`, steigt sie, und die lokalen Speicher
 * werden aus dem Protokoll neu berechnet. Eigenes Modul, damit Inseln sie prüfen können, ohne die Ableitung (FSRS) zu laden.
 */
export const ABLEITUNGS_VERSION = 1;
