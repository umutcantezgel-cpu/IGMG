import type { Inhalte } from './dateien';
import { Befunde } from './typen';

/**
 * Prüfer „Bildkarten“ (KERN 4.0 §5, §7; Leitfaden `bildkarten`, Motivliste LM-34): Lemmata verweisen nur auf vorhandene
 * Symbole (blockierend) und – außer im Testkurs (Quelle `test:`) – nur auf Motive mit Freigabe der Redaktion (blockierend,
 * wie der Import, `lib/lernapp/symbole.ts` `symbolFehler`); Motive außerhalb der Motivliste des Leitfadens sind ein Hinweis
 * an die Redaktion.
 */
export function pruefeSymbole(inhalte: Inhalte): Befunde {
  const b = new Befunde('symbole');
  const symbole = inhalte.symbole?.daten.symbole;
  for (const { pfad, daten: d } of inhalte.sprache)
    for (const l of d.lemmata) {
      if (!l.symbol) continue;
      const s = symbole?.[l.symbol];
      if (!symbole) b.warnung(pfad, 'Symbol angegeben, aber symbole/symbole.json fehlt', l.schluessel);
      else if (!s) b.blockierend(pfad, `Symbol ${l.symbol} fehlt in symbole/symbole.json`, l.schluessel);
      else if (!s.freigegeben && !l.quelle.startsWith('test:'))
        b.blockierend(pfad, `Motiv ${l.symbol} ohne Freigabe der Redaktion (LM-34)`, l.schluessel);
    }
  const motive = (inhalte.leitfaden?.daten as { bildkarten?: { motivliste_vorschlag?: Record<string, unknown> } } | undefined)?.bildkarten
    ?.motivliste_vorschlag;
  if (symbole && motive) {
    const liste = new Set(
      Object.values(motive)
        .filter(Array.isArray)
        .flat()
        .map((m) => String(m).toLowerCase()),
    );
    for (const [id, s] of Object.entries(symbole))
      if (!liste.has(s.motiv.toLowerCase()))
        b.warnung(inhalte.symbole!.pfad, `Motiv nicht in der Motivliste des Leitfadens (LM-34)`, `symbole.${id}`);
  }
  return b;
}
