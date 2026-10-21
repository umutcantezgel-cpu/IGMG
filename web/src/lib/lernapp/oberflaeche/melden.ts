import { solveChallenge } from 'altcha-lib';
import { deriveKey } from 'altcha-lib/algorithms/web/pbkdf2';
import type { KursSlug } from '../kurse';
import type { MeldungKategorie } from '../meldung';

/**
 * „Fehler melden“ im Browser (ADR 0041 Nr. 9, KERN 4.0 §5/§6, L3-06b). Client-Modul des Melde-Dialogs, nur mit ihm geladen
 * (`import()` nach dem Klick, nicht im Spieler-Chunk):
 *
 * - ALTCHA: Aufgabe von `/api/altcha` (eigener Ursprung, erst nach dem Klick), im Browser gelöst mit `altcha-lib` und
 *   PBKDF2 über `crypto.subtle` (kein Worker, keine Dritten). Die Lösung ist einmalig; nach jedem Versuch braucht ein neuer
 *   Versuch eine neue.
 * - Beide Anfragen mit `credentials: 'omit'`: Auch angemeldete Personen schicken kein Sitzungscookie mit – die Meldung ist
 *   für alle wörtlich ohne Cookies und ohne Angaben zur Person.
 * - `POST /api/lernapp/meldung` mit nur Kurs, Aufgabe, Kategorie und ALTCHA – nie die eigene Antwort (die schicken nur
 *   angemeldete Personen ab 16 mit; der Dialog bietet das nicht an). Ohne Netz kein Puffer: ehrlicher Hinweis, nichts wird
 *   gespeichert.
 */

export type MeldeErgebnis = 'ok' | 'ohne_netz' | 'zu_viele' | 'nicht_moeglich' | 'fehler';

/** Holt und löst eine ALTCHA-Aufgabe; Ergebnis ist das Feld `altcha` der Meldung (Base64 von `{ challenge, solution }`). */
export async function loeseAltcha(signal?: AbortSignal): Promise<string> {
  const antwort = await fetch('/api/altcha', { cache: 'no-store', credentials: 'omit', signal });
  if (!antwort.ok) throw new MeldeFehler(antwort.status === 503 ? 'nicht_moeglich' : 'fehler');
  const challenge = (await antwort.json()) as Parameters<typeof solveChallenge>[0]['challenge'];
  const controller = new AbortController();
  signal?.addEventListener('abort', () => controller.abort(), { once: true });
  const solution = await solveChallenge({ challenge, deriveKey, controller });
  if (!solution) throw new MeldeFehler('fehler');
  return btoa(JSON.stringify({ challenge, solution }));
}

export class MeldeFehler extends Error {
  constructor(readonly ergebnis: MeldeErgebnis) {
    super(ergebnis);
  }
}

/** Ergebnis eines Fehlers beim Lösen oder Senden: Netzfehler (TypeError von `fetch`) heißt „ohne Netz“. */
export function alsErgebnis(e: unknown): MeldeErgebnis {
  if (e instanceof MeldeFehler) return e.ergebnis;
  if (e instanceof TypeError) return 'ohne_netz';
  return 'fehler';
}

/** Ergebnis nach HTTP-Status der Route (201 angenommen; 429 Grenze; 404/503 Schalter aus oder Aufgabe unbekannt). */
export function ergebnisVon(status: number): MeldeErgebnis {
  if (status === 201) return 'ok';
  if (status === 429) return 'zu_viele';
  if (status === 404 || status === 503) return 'nicht_moeglich';
  return 'fehler';
}

/** Sendet die Meldung (nur Kurs, Aufgabe, Kategorie, ALTCHA). */
export async function sendeMeldung(m: {
  kurs: KursSlug;
  aufgabe: string;
  kategorie: MeldungKategorie;
  altcha: string;
}): Promise<MeldeErgebnis> {
  try {
    const antwort = await fetch('/api/lernapp/meldung', {
      method: 'POST',
      cache: 'no-store',
      credentials: 'omit',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ kurs: m.kurs, aufgabe: m.aufgabe, kategorie: m.kategorie, altcha: m.altcha }),
    });
    return ergebnisVon(antwort.status);
  } catch (e) {
    return alsErgebnis(e);
  }
}
