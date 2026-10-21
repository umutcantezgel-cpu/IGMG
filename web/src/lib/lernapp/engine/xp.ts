/**
 * XP statisch (ADR 0043 Nr. 1, PLAN §8): Lektion 10, Geschichte 15, Prüfstein 20, Wiederholung 1 je 2 Karten (höchstens
 * 10), Schreiben 15. Schrift-Vorkurs und Sprechen zählen wie eine Lektion. Keine Zeitboni; die Zahl steht in der Anzeige
 * statisch und zählt nie hoch. Die Summe entsteht aus den `xp`-Ereignissen (ereignisse/ableiten.ts).
 */

/** Arten einer Lektion (PLAN §3.9, `lernapp_lektion.art`). */
export const LEKTIONS_ARTEN = ['lektion', 'geschichte', 'wiederholung', 'pruefstein', 'schrift', 'schreiben', 'sprechen'] as const;
export type LektionsArt = (typeof LEKTIONS_ARTEN)[number];

/**
 * Aufgabentypen, die das Ereignis `lektion` im optionalen Feld `typen` nennt, wenn die Lektion mindestens eine gewertete
 * Aufgabe dieses Typs hatte (engine/sitzung.ts). Sprechen und Schreiben sind Aufgaben in gewöhnlichen Lektionen, keine
 * eigenen Stationen des Rahmenplans; die Abzeichen „Erstes Sprechen“ und „Erstes Schreiben“ (ADR 0043 Nr. 5) folgen daraus
 * (ereignisse/abzeichen.ts). Ältere Ereignisse ohne das Feld bleiben gültig. Hier statt in ereignisse/typen.ts, damit der
 * Spieler die Liste ohne Zod bekommt (KERN 4.0 §9).
 */
export const GEMELDETE_TYPEN = ['sprechen', 'schreiben'] as const;
export type GemeldeterTyp = (typeof GEMELDETE_TYPEN)[number];

export const XP: Readonly<Record<Exclude<LektionsArt, 'wiederholung'>, number>> = {
  lektion: 10,
  geschichte: 15,
  pruefstein: 20,
  schrift: 10,
  schreiben: 15,
  sprechen: 10,
};

/** Wiederholung: 1 XP je 2 Karten, höchstens 10 je Sitzung. */
export const XP_WIEDERHOLUNG_HOECHSTENS = 10;

/** Höchste XP eines einzelnen Ereignisses (Zod-Grenze in ereignisse/typen.ts). */
export const XP_HOECHSTENS = 20;

/** XP für eine abgeschlossene Lektion; bei Wiederholung zählt die Zahl der wiederholten Karten. */
export function xpFuer(art: LektionsArt, karten = 0): number {
  if (art === 'wiederholung') return Math.min(XP_WIEDERHOLUNG_HOECHSTENS, Math.floor(Math.max(0, karten) / 2));
  return XP[art];
}
