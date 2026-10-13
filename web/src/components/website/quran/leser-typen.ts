import type quran from '../../../../messages/bereiche/quran.json';

/**
 * Gemeinsame Typen der Koran-Leser-Insel (Server baut die Props, der Browser nutzt sie). Texte kommen als rohe
 * Vorlagen aus `messages/bereiche/quran.json` (nur einfache Platzhalter wie `{nr}`); die Insel ersetzt sie selbst,
 * ohne next-intl im Browser (MUSTER 4).
 */
type Seite = (typeof quran)['de']['quranSeite'];

export type LeserTexte = {
  leser: Seite['leser'];
  familien: Seite['familien'];
  muster: Seite['muster'];
  wortkarte: Seite['wortkarte'];
  tajwidLeiste: Seite['tajwidLeiste'];
  player: Seite['player'];
  offline: Seite['offline'];
  quelleUebersetzung: string;
};

export type LeserAusgabe = { id: string; sprache: string; titel: string; uebersetzer: string; ausstehend: boolean };
export type LeserRezitation = { id: string; name: string; rezitator: string; lizenz: string };

/** Adressen mit Platzhaltern `__s__` (Sure), `__a__` (Ausgabe), `__r__` (Rezitation), `__v__` (Vers). */
export type LeserPfade = {
  woerter: string;
  uebersetzung: string;
  zeiten: string;
  tajwid: string;
};

export type LeserProps = {
  sprache: string;
  /** Sure der Seite; im Cüz null (die Sure steht am jeweiligen Abschnitt, `data-sure`) */
  sure: number | null;
  cuz: number | null;
  texte: LeserTexte;
  ausgaben: LeserAusgabe[];
  /** Ausgabe im HTML (null: keine Übersetzung im HTML) */
  ausgabe: string | null;
  rezitationen: LeserRezitation[];
  pfade: LeserPfade;
};

export type Modus = 'beide' | 'arabisch' | 'uebersetzung';
export const MODI: readonly Modus[] = ['beide', 'arabisch', 'uebersetzung'];
export const GROESSEN = [1, 2, 3, 4, 5] as const;

/** Lokaler Speicher (nur dieses Gerät): Einstellungen, Weiterlesen, Lesezeichen. */
export const SPEICHER = {
  einstellungen: 'igmg-quran-einstellungen',
  weiterlesen: 'igmg-quran-weiterlesen',
  lesezeichen: 'igmg-quran-lesezeichen',
  /** Verzeichnis der offline gespeicherten Seiten (Inhalte im Vorrat `igmg-koran-v1`, H-O01) */
  offline: 'igmg-quran-offline',
} as const;

export type Stelle = { sure: number; vers: number; cuz?: number | null; zeit?: number };

/** Platzhalter `{name}` einer Vorlage ersetzen. */
export function fuelle(vorlage: string, werte: Record<string, string | number>): string {
  return vorlage.replace(/\{(\w+)\}/g, (g, k: string) => (k in werte ? String(werte[k]) : g));
}

/** Adresse mit Platzhaltern füllen. */
export function adresse(muster: string, werte: { s?: number; a?: string; r?: string }): string {
  return muster
    .replace('__s__', String(werte.s ?? ''))
    .replace('__a__', encodeURIComponent(werte.a ?? ''))
    .replace('__r__', encodeURIComponent(werte.r ?? ''));
}

/** Gespeicherten JSON-Wert lesen; ohne Speicher (privates Fenster, gesperrt) null. */
export function lies<T>(schluessel: string): T | null {
  try {
    const roh = window.localStorage.getItem(schluessel);
    return roh ? (JSON.parse(roh) as T) : null;
  } catch {
    return null;
  }
}

export function schreibe(schluessel: string, wert: unknown): void {
  try {
    window.localStorage.setItem(schluessel, JSON.stringify(wert));
  } catch {
    // Kein Speicher verfügbar: die Einstellung gilt nur bis zum Neuladen.
  }
}
