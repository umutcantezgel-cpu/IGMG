/**
 * Upload der Rezitations-Audiodateien (ADR 0029): Vercel Functions nehmen höchstens 4,5 MB je Anfrage an, eine Sure
 * hat bis zu 60 MB. Der Browser legt die Datei deshalb erst unter einem Eingangsschlüssel ab – mit Vercel Blob direkt
 * (`@vercel/blob/client`, Token von {@link AUDIO_DIREKT_PFAD}), sonst über {@link AUDIO_EINGANG_PFAD} (Route ohne
 * Proxy-Puffer). Die Server Action `audioUebernehmen` prüft danach Magic Bytes, Größe und SHA-256, legt die Datei unter
 * ihrem Inhalts-Hash ab und entfernt den Eingang. Ohne Server-Abhängigkeiten: Browser, Routen und Action nutzen es.
 * Nicht übernommene Eingänge räumt der tägliche Löschlauf nach 24 Stunden auf (Präfix `eingang/`).
 */
export const AUDIO_DIREKT_PFAD = '/verwaltung/rezitationen/direkt';
export const AUDIO_EINGANG_PFAD = '/api/verwaltung/rezitationen/eingang';
/** Blob-Inhaltstyp beim Direkt-Upload: einheitlich, denn der Typ zählt erst nach der Prüfung der Bytes. */
export const AUDIO_EINGANG_TYP = 'application/octet-stream';

const EINGANG = /^eingang\/audio-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/** Nur `eingang/audio-<uuid>`: kein Pfadausbruch, kein Zugriff auf andere Speicherschlüssel. */
export function istAudioEingang(wert: unknown): wert is string {
  return typeof wert === 'string' && EINGANG.test(wert);
}

export function neuerAudioEingang(): string {
  return `eingang/audio-${crypto.randomUUID()}`;
}
