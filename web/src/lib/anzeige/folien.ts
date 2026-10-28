import type { Mehrsprachig } from '@/lib/db/schema/typen';
import type { AnzeigeEinstellungen, FolieZeitplan } from './plan';

/**
 * Folien der Bildschirm-Anzeige, wie sie die öffentliche Anzeige bekommt (AUFTRAG 3.10, B-25). Vers- und Hadith-Folien
 * enthalten nur, was die Datenbank freigegeben liefert: Verstext aus dem Tanzil-Import, Übersetzung nur aus einer
 * freigegebenen Ausgabe, Hadith-Übersetzung nur „geprüft“. Kein eigener religiöser Text. Reine Typen und Funktionen
 * ohne Datenbank (auch im Browser nutzbar).
 */
export type AnzeigeSprache = 'de' | 'tr' | 'en';

/** Arten, die das Formular anbietet; `veranstaltung`, `spende`, `hinweis` bleiben im Enum für später. */
export const FOLIEN_ARTEN = ['text', 'bild', 'vers', 'hadith'] as const;
export type FolienArt = (typeof FOLIEN_ARTEN)[number];

/** Religiöse Arten brauchen die Freigabe `religioes.freigeben` mit Vier-Augen-Prinzip (ADR 0030). */
export const RELIGIOESE_FOLIEN: readonly FolienArt[] = ['vers', 'hadith'];
export const istReligioes = (art: string): boolean => (RELIGIOESE_FOLIEN as readonly string[]).includes(art);

/** Gespeicherter Inhalt je Art (Spalte `inhalt`); Vers und Hadith nur als Verweis. */
export type FolienInhalt =
  | { art: 'text'; titel: Mehrsprachig; text: Mehrsprachig | null }
  | { art: 'bild'; titel: Mehrsprachig | null }
  | { art: 'vers'; sure: number; von: number; bis: number }
  | { art: 'hadith'; sammlungId: string; nummer: string };

export type AnzeigeFolie = FolieZeitplan &
  (
    | { art: 'text'; titel: Mehrsprachig; text: Mehrsprachig | null }
    | { art: 'bild'; titel: Mehrsprachig | null; bild: { url: string; breite: number; hoehe: number; alt: Mehrsprachig } }
    | {
        art: 'vers';
        sure: number;
        sureName: string;
        verse: { nr: number; textAr: string }[];
        /** Übersetzung je Sprache aus der freigegebenen Standardausgabe, mit Quelle (Übersetzer). */
        uebersetzung: Partial<Record<AnzeigeSprache, { text: string; quelle: string }>>;
      }
    | {
        art: 'hadith';
        nummer: string;
        textAr: string;
        uebersetzung: Partial<Record<AnzeigeSprache, { text: string; quelle: string }>>;
      }
  );

/** `gebetszeitenStand`: Kennung der Gebetszeiten (ADR 0048) – ändert sie sich, lädt die Anzeige neu (Korrektur am selben Tag). */
export type AnzeigeDaten = { folien: AnzeigeFolie[]; einstellung: AnzeigeEinstellungen; gebetszeitenStand?: string };

/** Mehrsprachiger Text in der Anzeigesprache, sonst Deutsch (sichtbarer Rückfall, `lang` setzt der Aufrufer). */
export function textIn(m: Mehrsprachig | null | undefined, sprache: AnzeigeSprache): { text: string; sprache: AnzeigeSprache } | null {
  if (!m) return null;
  const eigen = m[sprache];
  if (eigen) return { text: eigen, sprache };
  return m.de ? { text: m.de, sprache: 'de' } : null;
}

/** Bezug einer Versfolie, z. B. „2:255“ oder „2:255–257“. */
export function versBezug(sure: number, von: number, bis: number): string {
  return von === bis ? `${sure}:${von}` : `${sure}:${von}–${bis}`;
}

/**
 * Stelle aus der Eingabe „Sure:Vers“ oder „Sure:Vers-Vers“ (höchstens fünf Verse am Stück). Ungültig → null.
 * Ob der Vers existiert, prüft die Server Action gegen den Import.
 */
export const MAX_VERSE_JE_FOLIE = 5;
export function leseStelle(roh: string): { sure: number; von: number; bis: number } | null {
  const m = /^\s*(\d{1,3})\s*:\s*(\d{1,3})(?:\s*[-–]\s*(\d{1,3}))?\s*$/.exec(roh);
  if (!m) return null;
  const sure = Number(m[1]);
  const von = Number(m[2]);
  const bis = m[3] ? Number(m[3]) : von;
  if (sure < 1 || sure > 114 || von < 1 || bis < von || bis - von + 1 > MAX_VERSE_JE_FOLIE) return null;
  return { sure, von, bis };
}
