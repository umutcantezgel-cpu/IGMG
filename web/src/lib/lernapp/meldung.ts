import { istKursSlug, istSchluesselVon, type KursSlug, kursVonSlug } from './kurse';
import * as z from './z';

/**
 * „Fehler melden“ aus der Lern-App (ADR 0041 Nr. 9, KERN 4.0 §5, PLAN §11): nur Aufgabenschlüssel und Kategorie, ohne
 * Personenbezug. Die eigene Antwort („Meine Antwort hätte stimmen sollen“) schicken nur angemeldete Personen ab 16 mit,
 * höchstens 200 Zeichen (ADR 0045, Fortschreibung S3/S8 Nr. 8); ohne Konto und bei Kindern verwirft die Route sie.
 * Client-tauglich (`zod/mini`): dasselbe Schema prüft die Route `POST /api/lernapp/meldung`.
 */

/** Kategorien (= Enum `lernapp_meldung_kategorie`). */
export const MELDUNG_KATEGORIEN = [
  'antwort_richtig',
  'fehler_zieltext',
  'fehler_uebersetzung',
  'fehler_audio',
  'anstoessig',
  'sonstiges',
] as const;
export type MeldungKategorie = (typeof MELDUNG_KATEGORIEN)[number];

/** Höchstlänge der optionalen eigenen Antwort. */
export const ANTWORT_MAX = 200;

/** Körper der Meldung: Kurs (Richtung bzw. `islam`, `koran`), Aufgabe des Kurses, Kategorie, ALTCHA-Lösung, ggf. Antwort. */
export const MeldungSchema = z.strictObject({
  kurs: z.string().check(z.refine((w) => istKursSlug(w))),
  aufgabe: z.string().check(z.maxLength(120)),
  kategorie: z.enum(MELDUNG_KATEGORIEN),
  altcha: z.string().check(z.minLength(1), z.maxLength(10_000)),
  antwort: z.optional(z.string().check(z.trim(), z.minLength(1), z.maxLength(ANTWORT_MAX))),
});
export type MeldungEingabe = z.infer<typeof MeldungSchema>;

/** Prüft zusätzlich, ob die Aufgabe zum Kurs gehört (`tr.a1.e01.l01.a03` zu `tr-aus-de`). */
export function aufgabeGehoertZumKurs(kurs: string, aufgabe: string): boolean {
  return istKursSlug(kurs) && istSchluesselVon(kursVonSlug(kurs), aufgabe);
}

/**
 * Gespeicherter Aufgabenschlüssel: Kurs der Meldung und Aufgabe wie die Karten (`<richtung>:<schlüssel>`), damit die
 * Verwaltung weiß, in welcher Richtung (Ausgangssprache) die Antwort gemeint war.
 */
export function meldungsSchluessel(kurs: KursSlug, aufgabe: string): string {
  return `${kurs}:${aufgabe}`;
}

export function zerlegeMeldungsSchluessel(wert: string): { kurs: KursSlug; aufgabe: string } | null {
  const i = wert.indexOf(':');
  if (i < 0) return null;
  const kurs = wert.slice(0, i);
  const aufgabe = wert.slice(i + 1);
  return aufgabeGehoertZumKurs(kurs, aufgabe) ? { kurs: kurs as KursSlug, aufgabe } : null;
}

/** Wo eine angenommene Alternative hingehört (Verwaltung › Meldungen). */
export type AlternativeZiel =
  /** weitere Fassung in der Zielsprache in den Daten der Aufgabe (`alternativen`) */
  | { art: 'aufgabe'; max: number; laenge: number }
  /** weitere Fassung der Übersetzung des Eintrags in der Ausgangssprache der Richtung */
  | { art: 'uebersetzung'; bezug: string; max: number; laenge: number }
  /** Typ ohne Freitext-Antwort (Auswahl, Paare, …): nur sperren oder erledigen */
  | { art: 'keine' };

/**
 * Ziel einer Alternative nach Aufgabenvorlage (`inhalt/schema.ts`): Freitext und Wortbank „nach Ziel“, Diktat, Satzbau und
 * Lücke tragen eigene Alternativen; „nach Ausgang“ gehört sie zur Übersetzung des Satzes bzw. Eintrags.
 */
export function alternativeZiel(vorlage: { typ: string } & Record<string, unknown>): AlternativeZiel {
  const verweis = (feld: string) => (typeof vorlage[feld] === 'string' ? (vorlage[feld] as string) : null);
  switch (vorlage.typ) {
    case 'wortbank': {
      if (vorlage.nach === 'ziel') return { art: 'aufgabe', max: 20, laenge: 600 };
      const bezug = verweis('satz');
      return bezug ? { art: 'uebersetzung', bezug, max: 30, laenge: 600 } : { art: 'keine' };
    }
    case 'frei': {
      if (vorlage.nach === 'ziel') return { art: 'aufgabe', max: 20, laenge: 600 };
      const bezug = verweis('ziel');
      return bezug ? { art: 'uebersetzung', bezug, max: 30, laenge: 600 } : { art: 'keine' };
    }
    case 'hoeren_schreiben':
    case 'satzbau':
      return { art: 'aufgabe', max: 20, laenge: 600 };
    case 'luecke':
      return { art: 'aufgabe', max: 10, laenge: 60 };
    default:
      return { art: 'keine' };
  }
}

/** Alternativen ergänzen: ohne Dubletten (NFC, Groß/Klein egal), nicht die Hauptlösung, höchstens `max`. */
export function ergaenzeAlternative(
  vorhanden: readonly string[],
  neu: string,
  o: { haupt?: string; max: number; laenge: number },
): { ok: true; liste: string[] } | { ok: false; grund: 'leer' | 'zuLang' | 'doppelt' | 'voll' } {
  const text = neu.normalize('NFC').replace(/\s+/g, ' ').trim();
  if (!text) return { ok: false, grund: 'leer' };
  if (text.length > o.laenge) return { ok: false, grund: 'zuLang' };
  const form = (s: string) => s.normalize('NFC').trim().toLocaleLowerCase();
  if ([...vorhanden, ...(o.haupt ? [o.haupt] : [])].some((v) => form(v) === form(text))) return { ok: false, grund: 'doppelt' };
  if (vorhanden.length >= o.max) return { ok: false, grund: 'voll' };
  return { ok: true, liste: [...vorhanden, text] };
}
