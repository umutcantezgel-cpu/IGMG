/**
 * Hilfen der Verwaltung „Seiteninhalte“ (V05): Platzhalter, Übersetzungen, Listen und Feldnamen. Reine Funktionen ohne
 * Oberfläche, damit Browser und Server dieselben Regeln nutzen.
 */

/** Mehrsprachiger Text wie im Schema: Deutsch Pflicht, Türkisch und Englisch optional (ADR 0002). */
export type Mehrsprachig = { de: string; tr?: string | undefined; en?: string | undefined };

/** Platzhalter in eckigen Klammern (G-05): Sie dürfen stehen bleiben; die Oberfläche weist darauf hin. */
const PLATZHALTER = /\[[^\]]*\]/;

export function hatPlatzhalter(text: string): boolean {
  return PLATZHALTER.test(text);
}

/** Anzahl der Texte im Inhalt, die noch einen Platzhalter enthalten. */
export function zaehlePlatzhalter(wert: unknown): number {
  if (typeof wert === 'string') return hatPlatzhalter(wert) ? 1 : 0;
  if (Array.isArray(wert)) return wert.reduce<number>((summe, teil: unknown) => summe + zaehlePlatzhalter(teil), 0);
  if (wert !== null && typeof wert === 'object') return zaehlePlatzhalter(Object.values(wert as Record<string, unknown>));
  return 0;
}

/** Kennung eines Felds (aus dem Schema-Pfad): Fehler-Zusammenfassung und Sprungverweise zeigen darauf. */
export function feldId(pfad: string): string {
  return `si-${pfad.replace(/\./g, '-')}`;
}

/** Übersetzungen ohne Text entfallen; Deutsch bleibt. */
export function bereinige(m: Mehrsprachig): Mehrsprachig {
  return { de: m.de, ...(m.tr ? { tr: m.tr } : {}), ...(m.en ? { en: m.en } : {}) };
}

/** Optionaler Text: ohne jeden Eintrag entfällt er ganz (das Schema verlangt dann kein Deutsch). */
export function optional(m: Mehrsprachig): Mehrsprachig | undefined {
  return m.de.trim() || m.tr?.trim() || m.en?.trim() ? bereinige(m) : undefined;
}

/** Laufende Nummer (Schema-Feld `reihenfolge`) nach jeder Änderung der Liste. */
export function nummeriert<T extends { reihenfolge: number }>(liste: readonly T[]): T[] {
  return liste.map((eintrag, index) => ({ ...eintrag, reihenfolge: index }));
}

/** Tauscht zwei Einträge einer Liste (Nach oben / Nach unten). */
export function tausche<T>(liste: readonly T[], a: number, b: number): T[] {
  return liste.map((eintrag, index) => (index === a ? liste[b] : index === b ? liste[a] : eintrag));
}

/**
 * Feldpfad in Klartext für die Fehler-Zusammenfassung, z. B. „meilensteine.0.titel.tr“ → „Meilenstein 1 › Titel › Türkisch“.
 * `t` und `hat` stammen aus den Texten des Namensraums `verwaltung.seiteninhalte`.
 */
export function beschreibePfad(
  pfad: string,
  t: (schluessel: string, werte?: Record<string, string | number>) => string,
  hat: (schluessel: string) => boolean,
): string {
  return pfad
    .split('.')
    .map((teil) => {
      if (/^\d+$/.test(teil)) return t('eintrag', { nr: Number(teil) + 1 });
      if (teil === 'de' || teil === 'tr' || teil === 'en') return t(`sprache.${teil}`);
      const schluessel = `feld.${teil}`;
      return hat(schluessel) ? t(schluessel) : teil;
    })
    .join(' › ');
}
