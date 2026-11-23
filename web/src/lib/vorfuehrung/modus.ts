/**
 * Vorführung mit Testzugang (ADR 0052): die Testadresse auf Vercel ohne `DATABASE_URL`. Der Bau legt die
 * Bau-Datenbank mit Beispielinhalten und Beispielkonten als Schnappschuss neben die Funktionen (`.vorfuehrung/`); zur
 * Laufzeit lädt jede Instanz ihn in eine eigene PGlite-Datenbank, und die Anmeldung ist ein einfacher Testzugang
 * (Benutzername und Passwort stehen auf der Anmeldeseite). Änderungen bleiben in der Instanz und gehen mit ihr verloren.
 *
 * Das Kennzeichen `VORFUEHRUNG` setzt allein `scripts/vercel-bau.mjs` im Bau ohne Datenbank; `next.config.ts` schreibt es
 * fest in den Bau (`env`). Mit `DATABASE_URL` zur Laufzeit gilt die Vorführung nie – eine echte Datenbank bekommt nie den
 * Testzugang. Ohne `server-only`: auch Proxy, Funktionsschalter und Skripte lesen es.
 */
export function vorfuehrung(): boolean {
  return process.env.VORFUEHRUNG === '1' && !process.env.DATABASE_URL;
}

/** Ordner des Schnappschusses, relativ zum Projektordner (`outputFileTracingIncludes` in next.config.ts). */
export const VORFUEHRUNG_ORDNER = '.vorfuehrung';

/**
 * Schlüssel für verschlüsselte Felder (`EINGANG_SCHLUESSEL`) in der Vorführung, wenn die Umgebung keinen trägt: fest und
 * öffentlich – er schützt nichts und soll nichts schützen. Die Vorführung enthält nur Beispieldaten; Bau (Beispielkonten)
 * und Laufzeit brauchen denselben Schlüssel. 32 Byte als Base64.
 */
export const VORFUEHRUNG_SCHLUESSEL = 'aWdtZy12b3JmdWVocnVuZy1udXItYmVpc3BpZWxlISE=';
