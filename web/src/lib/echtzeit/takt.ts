/**
 * Abruf-Takt (ADR 0027) ohne Serverabhängigkeit – für den Gruppenchat und den Hinweis „Neues“ in Mein Bereich (F-38).
 * Beide pausieren bei verborgenem Tab und rufen beim Wiedereinblenden sofort ab; ein Echtzeit-Signal löst ebenfalls
 * sofort einen Abruf aus.
 */

/** Chat: 4 s nach Aktivität (eigene oder fremde Nachricht), dann 15 s, nach 5 Minuten Ruhe 30 s. */
export function chatAbstand(ruheMs: number): number {
  return ruheMs < 60_000 ? 4_000 : ruheMs < 300_000 ? 15_000 : 30_000;
}

/** Hinweis „Neues“ in Mein Bereich: ruhiger als der Chat – 30 s, nach 5 Minuten ohne Neues 60 s. */
export function uebersichtAbstand(ruheMs: number): number {
  return ruheMs < 300_000 ? 30_000 : 60_000;
}
