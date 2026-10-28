import type { GebetszeitTag, Tageszeiten } from './typen';

/**
 * Vorrang der Quellen je Tag (ADR 0048), reine Funktion für beide Lader und die Lese-API:
 * 1. manueller Import der Gemeinde (`quelle 'import'`) – der Abgleich überschreibt ihn nie,
 * 2. IGMG-Zeiten aus der Datenbank (Abgleich oder eingefügte Tabelle, `quelle 'igmg'`),
 * 3. IGMG-Jahresdatei im Repository (`web/daten/igmg-gebetskalender/`, nur mit Erlaubnis der IGMG),
 * 4. Rechnung: Näherung „IGMG (angenähert)“ oder Methode – je nach Einstellung `rueckfall` (`rechne`).
 */
export const VORRANG = ['import', 'igmg', 'datei', 'rechnung'] as const;
export type Ebene = (typeof VORRANG)[number];

export type TagesEbenen = {
  import?: Tageszeiten | null;
  igmg?: Tageszeiten | null;
  datei?: Tageszeiten | null;
};

/** Zeiten eines Tages nach Vorrang; `rechne` läuft nur, wenn keine Tabelle den Tag kennt. */
export function waehleTag(datum: string, ebenen: TagesEbenen, rechne: (datum: string) => Tageszeiten): GebetszeitTag & { ebene: Ebene } {
  if (ebenen.import) return { datum, ...nurZeiten(ebenen.import), quelle: 'import', ebene: 'import' };
  if (ebenen.igmg) return { datum, ...nurZeiten(ebenen.igmg), quelle: 'igmg', ebene: 'igmg' };
  if (ebenen.datei) return { datum, ...nurZeiten(ebenen.datei), quelle: 'igmg', ebene: 'datei' };
  return { datum, ...rechne(datum), quelle: 'berechnet', ebene: 'rechnung' };
}

/** Zeiten ohne Sekunden („HH:MM:SS“ aus der Datenbank → „HH:MM“), ohne weitere Felder. */
export function nurZeiten(z: Tageszeiten): Tageszeiten {
  return {
    imsak: z.imsak.slice(0, 5),
    gunes: z.gunes.slice(0, 5),
    ogle: z.ogle.slice(0, 5),
    ikindi: z.ikindi.slice(0, 5),
    aksam: z.aksam.slice(0, 5),
    yatsi: z.yatsi.slice(0, 5),
  };
}

/** Herkunft eines Zeitraums: nur Tabelle der Gemeinde, nur IGMG, gemischt mit Rechnung oder nur gerechnet. */
export function quelleVon(tage: readonly Pick<GebetszeitTag, 'quelle'>[]): 'import' | 'igmg' | 'berechnet' | 'gemischt' {
  const arten = new Set(tage.map((t) => t.quelle));
  if (arten.size === 1) return [...arten][0];
  return arten.has('berechnet') ? 'gemischt' : arten.has('igmg') ? 'igmg' : 'import';
}
