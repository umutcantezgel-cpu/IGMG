import type { InhaltDatei } from './schema';

/**
 * Tatoeba-Sätze mit Koran- oder Hadith-4-Gramm (ADR 0045 Fortschreibung S7 Nr. 3; Liste in `web/daten/tatoeba/QUELLE.md`,
 * „Prüfung“ Nr. 4, S7-E7): Sie stehen im gepinnten Auszug, der Import schließt sie aus. Die Liste steht hier im Code, weil
 * der Import im Vercel-Bau läuft und `web/daten/tatoeba` dort fehlt (`.vercelignore`). Der Unit-Test
 * `tatoeba-ausschluss.test.ts` hält sie gleich mit `QUELLE.md` und nutzt die Sätze als Positivproben des Wächters.
 */
export const TATOEBA_AUSSCHLUSS: ReadonlySet<number> = new Set([
  372061, 433388, 528234, 1845468, 1870688, 1870712, 1870735, 1875947, 1894844, 3521805, 4378843, 4385414, 8386223, 8392676, 8414725,
  9571789, 9837334, 10065956, 10093410, 10097109, 10133584, 10133586, 10133589, 10133618, 10135759, 10140311, 10148021, 10150500, 10278230,
  10278235, 10278237, 10303180, 10462080, 10470035, 10473490, 10739670, 12493897, 12943584,
]);

/** Satz-ID aus `quelle: "tatoeba:<id>"`, sonst null. */
export function tatoebaId(quelle: string | undefined): number | null {
  const t = quelle?.match(/^tatoeba:(\d{1,12})$/);
  return t ? Number(t[1]) : null;
}

/** IDs der Ausschlussliste aus `QUELLE.md` (Absatz „Prüfung“ Nr. 4: Backtick-Block mit den IDs). */
export function ausschlussAusQuelle(quelleMd: string): number[] {
  const absatz = quelleMd.match(/IDs \(auch Positivproben[^`]*`([\d\s]+)`/);
  return absatz ? absatz[1]!.trim().split(/\s+/).map(Number) : [];
}

/**
 * Einträge mit ausgeschlossener Tatoeba-Quelle in Sprach- und Übersetzungsdateien (Befunde ohne Text, nur Ort). Der Import
 * bricht damit ab, `pnpm lernapp:pruefen` meldet blockierend.
 */
export function pruefeTatoebaAusschluss(dateien: readonly { pfad: string; datei: InhaltDatei }[]): string[] {
  const befunde: string[] = [];
  const pruefe = (pfad: string, ort: string, quelle: string) => {
    const id = tatoebaId(quelle);
    if (id !== null && TATOEBA_AUSSCHLUSS.has(id))
      befunde.push(`${pfad}: ${ort}: Tatoeba-Satz ${id} ausgeschlossen (Koran- bzw. Hadith-4-Gramm, web/daten/tatoeba/QUELLE.md)`);
  };
  for (const { pfad, datei } of dateien) {
    if (datei.art === 'sprache') for (const x of [...datei.daten.lemmata, ...datei.daten.saetze]) pruefe(pfad, x.schluessel, x.quelle);
    else for (const e of datei.daten.eintraege) pruefe(pfad, `${e.bezug}@${datei.daten.richtung}`, e.quelle);
  }
  return befunde;
}
