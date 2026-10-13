/**
 * Sichtbarkeit der Übersetzungsausgaben (ADR 0025, 0030, MN-02). Öffentlich ist eine Ausgabe nur, wenn sie aktiv und
 * einmal freigegeben ist. In Entwicklung und Vorschau erscheinen zusätzlich die übrigen importierten Ausgaben – mit
 * dem sichtbaren Hinweis „Freigabe ausstehend“ –, damit die Gemeinde sie vor der Entscheidung lesen kann.
 * Reine Funktionen (Unit-Test `quran-ausgaben.test.ts`).
 */
export type AusgabeZeile = {
  id: string;
  sprache: string;
  titel: string;
  uebersetzer: string;
  aktiv: boolean;
  standard: boolean;
  freigegebenAm: Date | string | null;
};

export type SichtbareAusgabe = {
  id: string;
  sprache: string;
  titel: string;
  uebersetzer: string;
  standard: boolean;
  /** true: nicht freigegeben, nur in Entwicklung/Vorschau sichtbar */
  ausstehend: boolean;
};

/** Freigegeben heißt: aktiv geschaltet und mit Freigabedatum. */
export function istFreigegeben(a: Pick<AusgabeZeile, 'aktiv' | 'freigegebenAm'>): boolean {
  return a.aktiv && a.freigegebenAm !== null;
}

/**
 * Sichtbare Ausgaben: freigegebene immer, die übrigen nur mit `vorschau` (Betriebsart ≠ Produktion).
 * Reihenfolge: Sprache de, tr, en, dann andere; darin freigegebene vor ausstehenden, dann Standard, dann Titel.
 */
export function sichtbareAusgaben(alle: readonly AusgabeZeile[], vorschau: boolean): SichtbareAusgabe[] {
  const rang = (s: string) => {
    const i = ['de', 'tr', 'en'].indexOf(s);
    return i < 0 ? 3 : i;
  };
  return alle
    .filter((a) => istFreigegeben(a) || vorschau)
    .map((a) => ({
      id: a.id,
      sprache: a.sprache,
      titel: a.titel,
      uebersetzer: a.uebersetzer,
      standard: a.standard,
      ausstehend: !istFreigegeben(a),
    }))
    .sort(
      (x, y) =>
        rang(x.sprache) - rang(y.sprache) ||
        x.sprache.localeCompare(y.sprache) ||
        Number(x.ausstehend) - Number(y.ausstehend) ||
        Number(y.standard) - Number(x.standard) ||
        x.titel.localeCompare(y.titel),
    );
}

/** Ausgabe für die Seitensprache: die erste sichtbare dieser Sprache (Reihenfolge wie oben), sonst keine. */
export function ausgabeFuer(sichtbar: readonly SichtbareAusgabe[], sprache: string): SichtbareAusgabe | null {
  return sichtbar.find((a) => a.sprache === sprache) ?? null;
}
