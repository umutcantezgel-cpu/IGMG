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
  videoPlatzhalter: string;
  /** „Auf YouTube ansehen“: reiner Link für Videos mit YouTube-ID (Marktstart P7, keine Einbettung). */
  videoLink: string;
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
  autor: Anzeige;
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
   * Adresse „Auf YouTube ansehen“ (`youtubeLink`, vom Server berechnet), nur bei gepflegter YouTube-ID. Bewusst nur ein Link
   * und keine Einbettung nach Klick: /islamisches-wissen liegt beim JavaScript schon an der Grenze (K-12, Marktstart P7).
   */
  link?: string;
};

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
