/**
 * Bildauswahl aus der Mediathek (C11, folgt). Der Editor übernimmt nur die Medien-ID; der Alt-Text kommt aus dem
 * Medium (K-10). Ohne diese Funktion gibt es im Editor keinen Bild-Knopf.
 */
export type BildAuswahl = () => Promise<{ mediumId: string } | null>;
