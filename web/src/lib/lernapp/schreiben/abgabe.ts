import type { Note } from '../bewertung';
import type { Pruefliste } from '../aufgaben/schreiben';
import * as z from '../z';

const Stufe = z.optional(z.int().check(z.minimum(0), z.maximum(3)));

/**
 * Schnittstelle der Schreibabgabe an die Lehrkraft (ADR 0042 Nr. 11, PLAN §4.3, KERN 4.0 §5) – vorbereitet in L2-02,
 * angebunden in L7: `POST /api/lernapp/schreiben` nur mit Konto, Gruppe, Einwilligung `lernapp` und Schalter
 * `lernapp_gruppen`; der Server prüft Sitzung, Schalter, Einwilligung und Rechte selbst und speichert den Text verschlüsselt
 * in `lernapp_schreibabgabe` (`textVerschluesselt`, `loeschenAb` = Abgabe + 12 Monate). Nur die Lehrkraft der eigenen
 * Gruppe sieht die Abgabe. Bis dahin bleibt der Text auf dem Gerät: Die Übung ruft `bereiteAbgabe` nicht auf, es gibt
 * keinen Knopf und keine Anfrage (`ABGABE_AKTIV = false`).
 */

export const ABGABE_AKTIV = false;

/** Höchstlänge eines abgegebenen Texts (Zeichen). */
export const ABGABE_MAX_ZEICHEN = 8_000;

export const SchreibAbgabeSchema = z.strictObject({
  /** Kurs (Richtung) und Aufgabe aus dem Paket */
  kurs: z.string().check(z.minLength(1), z.maxLength(40)),
  aufgabe: z.string().check(z.minLength(1), z.maxLength(160)),
  text: z.string().check(z.trim(), z.minLength(1), z.maxLength(ABGABE_MAX_ZEICHEN)),
  woerter: z.int().check(z.minimum(0), z.maximum(5_000)),
  /** Selbsteinschätzung nach der Prüfliste (0–3 je Kriterium) und als Note */
  pruefliste: z.strictObject({ aufgabe: Stufe, zusammenhang: Stufe, wortschatz: Stufe, grammatik: Stufe }),
  selbst: z.enum(['nochmal', 'schwer', 'gut']),
});
export type SchreibAbgabe = z.infer<typeof SchreibAbgabeSchema>;

/** Nutzlast einer Abgabe (L7) aus dem Stand der Übung; `null`, wenn sie ungültig wäre. */
export function bereiteAbgabe(e: {
  kurs: string;
  aufgabe: string;
  text: string;
  woerter: number;
  pruefliste: Pruefliste;
  selbst: Note;
}): SchreibAbgabe | null {
  const r = SchreibAbgabeSchema.safeParse(e);
  return r.success ? r.data : null;
}
