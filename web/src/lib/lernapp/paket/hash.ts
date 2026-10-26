import { hash } from 'node:crypto';
import { kanonisch } from '../ereignisse/zusammenfuehren';

/**
 * Inhalts-Hashes der Lern-App (ADR 0039 Nr. 1, KERN 4.0 §2.3). Server und Werkzeuge (Import, Paketbau, Seed); der Client
 * prüft Pakete mit `crypto.subtle` gegen dieselbe Adresse (lokal/pakete.ts).
 *
 * - **kanonisches JSON**: Schlüssel sortiert, `undefined` entfällt, Listen behalten ihre Reihenfolge (dieselbe Funktion wie
 *   bei der Vereinigung der Ereignisse, `ereignisse/zusammenfuehren.ts`). Zahlen müssen endlich sein.
 * - **inhaltHash** eines Bausteins = SHA-256 (hex) seines kanonischen JSON. Prüfungen und Freigaben gelten genau einem Hash;
 *   jede Änderung ergibt einen neuen Hash und setzt sie damit zurück.
 * - **Paketadresse** = SHA-256 der ausgelieferten Bytes, also des kanonischen JSON des Einheitenpakets (UTF-8).
 * - **textHash** (Audio) = SHA-256 des Texts in NFC; je Sprache und Text ein Clip (`lernapp_audio`, Audio-Manifest).
 */

export { kanonisch };

const HEX64 = /^[0-9a-f]{64}$/;

export function istHash(wert: unknown): wert is string {
  return typeof wert === 'string' && HEX64.test(wert);
}

function pruefeEndlich(wert: unknown, pfad: string): void {
  if (typeof wert === 'number' && !Number.isFinite(wert)) throw new Error(`Zahl nicht endlich: ${pfad}`);
  if (wert && typeof wert === 'object')
    for (const [k, v] of Object.entries(wert as Record<string, unknown>)) pruefeEndlich(v, `${pfad}.${k}`);
}

/**
 * SHA-256 (hex) von Text (UTF-8) oder Bytes. Einmal-Aufruf `crypto.hash` (Node ≥ 20.12) statt `createHash().update().digest()`:
 * gleiches Ergebnis ohne Hash-Objekt je Aufruf – der Paketbau braucht viele kleine Hashes (Stufe C N6).
 */
export function sha256Hex(daten: string | Uint8Array): string {
  return hash('sha256', daten, 'hex');
}

/** Kanonisches JSON mit Prüfung auf endliche Zahlen (NaN und Infinity wären in JSON `null`). */
export function kanonischGeprueft(wert: unknown): string {
  pruefeEndlich(wert, '$');
  return kanonisch(wert);
}

/** Inhalts-Hash eines Bausteins (Spalte `inhaltHash`). */
export function inhaltHash(baustein: unknown): string {
  return sha256Hex(kanonischGeprueft(baustein));
}

/** Text-Hash für Audio (NFC, sonst unverändert – Groß/Klein und Satzzeichen zählen). */
export function textHash(text: string): string {
  return sha256Hex(text.normalize('NFC'));
}
