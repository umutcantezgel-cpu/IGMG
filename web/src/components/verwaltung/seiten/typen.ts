import type { BildWahl } from '@/server/queries/verwaltung/medien';
import type { DateiWahl, SureWahl } from '@/server/queries/verwaltung/seiten';

/** Auswahl eines Ziels (Menü, Knopf): Wert `seite:<uuid>` oder ein Pfad der Website. */
export type ZielOption = { wert: string; label: string };
export type ZielGruppen = { seiten: ZielOption[]; bereiche: ZielOption[] };

/** Auswahllisten und Rechte für den Seiten-Editor (auf dem Server geladen). */
export type EditorOptionen = {
  bilder: BildWahl[];
  dateien: DateiWahl[];
  suren: SureWahl[];
  ziele: ZielGruppen;
  organisationen: { wert: string; label: string }[];
  darfVeroeffentlichen: boolean;
  darfReligioes: boolean;
  /** Basis der öffentlichen Adresse für die Vorschau der Slugs (ohne Schrägstrich am Ende). */
  basisUrl: string;
};

export type Sprache = 'de' | 'tr' | 'en';
