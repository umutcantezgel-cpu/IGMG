/**
 * Direkt-Upload großer PDF-Dateien in Vercel Blob (ADR 0020, AUFTRAG V-05). Vercel Functions nehmen höchstens 4,5 MB
 * je Anfrage an. Größere PDF-Dateien lädt deshalb der Browser direkt unter einem Eingangsschlüssel in den Speicher; die
 * Server Action `hochladen` übernimmt die Datei von dort, prüft sie wie jeden Upload (`verarbeiteDatei`) und entfernt
 * den Eingang. Ohne Server-Abhängigkeiten: wird von Formular, Route und Action gemeinsam genutzt.
 */
export const DIREKT_PFAD = '/verwaltung/medien/direkt';
export const EINGANG_PRAEFIX = 'eingang/';
/** Gleich `MAX_BYTES` aus `verarbeiten.ts` (dort mit sharp, hier ohne; ein Test hält beide gleich). */
export const DIREKT_MAX_BYTES = 10 * 1024 * 1024;

const EINGANG = /^eingang\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.pdf$/;

/** Nur `eingang/<uuid>.pdf` (klein geschrieben): kein Pfadausbruch, kein Zugriff auf fremde Speicherschlüssel. */
export function istEingangsSchluessel(wert: unknown): wert is string {
  return typeof wert === 'string' && EINGANG.test(wert);
}

export function neuerEingangsSchluessel(): string {
  return `${EINGANG_PRAEFIX}${crypto.randomUUID()}.pdf`;
}
