import type { ReactNode } from 'react';
/** Text aus den Daten. `lang="de"` markiert den sichtbaren Rückfall, wenn die gewählte Sprache fehlt (K-02). */
export type Anzeige = { text: string; lang?: string };

/** Oberflächentexte (Schlüssel `wissen.*`, messages/bereiche/wissen.json), vom Server übergeben (K-12). */
export type WissenTexte = {
  suchLabel: string;
  suchPlatzhalter: string;
  themenTitel: string;
  gefiltertNach: string;
  filterEntfernen: string;
  reiterGruppe: string;
  reiterArtikel: string;
  reiterVideos: string;
  reiterExperten: string;
  artikelTitel: string;
  artikelLeer: string;
  weiterlesen: string;
  artikelBeispiel: string;
  videosLeer: string;
  videoAnsehen: string;
  videoHinweis: string;
  expertenTitel: string;
  expertenBadge: string;
  mehrErfahren: string;
  zahlArtikel: string;
  dialogAehnlich: string;
  dialogKeine: string;
  dialogBeschreibung: string;
  dialogUeber: string;
  dialogArtikelAnzeigen: string;
  schliessen: string;
};

/**
 * Thema in Filter und Themenleiste. `marke`: Text der Marke „Entwurf“, wenn das Thema noch nicht religiös geprüft ist
 * (nur mit dem Schalter `website_wissen_vorschau` sichtbar, ADR 0047).
 */
export type ThemaAnzeige = { schluessel: string; label: Anzeige; marke?: string };

export type ArtikelAnzeige = {
  schluessel: string;
  thema: string;
  titel: Anzeige;
  /** `null`, solange der Name ein Platzhalter der Gemeinde „[…]“ ist: Dann entfällt die Autorzeile. */
  autor: Anzeige | null;
  lesezeit: string;
  /** Bereits formatiert („Mo., 15. Jan. 2024“). */
  datum: string;
  /** Leer, solange kein Textkörper gepflegt ist; dann erscheint der Beispieltext aus `texte.artikelBeispiel`. */
  text: Anzeige | null;
};

export type VideoAnzeige = {
  schluessel: string;
  thema: string;
  titel: Anzeige;
  dauer: string;
  beschreibung: Anzeige;
  /** Fertiger Text für das Vorschaubild („Vorschaubild: Titel“). */
  vorschau: string;
  /**
   * Link „Auf YouTube ansehen“ (Server-Komponente `VideoLink`, fertig gerendert). Bewusst nur ein Link und keine
   * Einbettung nach Klick; vom Server, damit Markup und Zeichen nicht ins Client-Bundle gehen – die Wissensseiten liegen
   * beim JavaScript an der Grenze (K-12, Marktstart P7, Welle 3). Videos ohne YouTube-ID stehen nicht auf der Seite
   * (`anzeige.tsx`): Ohne Quelle gäbe es nichts anzusehen.
   */
  link: ReactNode;
};

/** Fachgebiet, Institution, Bio und Artikelzahl sind leer, solange sie Platzhalter sind: Die Zeile entfällt dann. */
export type ExpertenAnzeige = {
  schluessel: string;
  name: Anzeige;
  fachgebiet: Anzeige;
  institution: Anzeige;
  bio: Anzeige;
  anzahlArtikel: Anzeige;
};

export type Reiter = 'artikel' | 'videos' | 'experten';

/** Reiter in Designreihenfolge (Blatt INTERAKTIONEN 4); die Pfeiltasten folgen dieser Reihenfolge. */
export const REITER: readonly Reiter[] = ['artikel', 'videos', 'experten'];
