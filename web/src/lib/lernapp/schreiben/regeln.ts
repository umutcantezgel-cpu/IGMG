import { KRITERIEN, type Kriterium, type Pruefliste } from '../aufgaben/auswertung/schreiben';
import { istRichtung, type RichtungId, zerlegeRichtung } from '../kurse';

/**
 * Reine Regeln des Korrekturwegs (L5-03; ADR 0042 Nr. 11; KERN 4.0 §5): Zustände einer Schreibabgabe, Prüfliste und
 * Einstufung der Lehrkraft, wer eine Abgabe lesen darf und wo die Aufgabe im Kurs liegt. Ohne Datenbank, unit-getestet
 * (`tests/unit/lernapp/schreibabgabe.test.ts`); den Weg über die Datenbank geht `schreiben/dienst.ts`.
 */

/** Stufen der Prüfliste (0–3 je Kriterium, wie in der Übung). */
export const STUFEN = [0, 1, 2, 3] as const;
export type Stufe = (typeof STUFEN)[number];

/**
 * Einstufung der Lehrkraft – ohne Note und ohne Zahl (KERN 4.0 §1 „ohne Druck“): gut gelöst, auf einem guten Weg, lohnt
 * sich noch einmal. Freiwillig.
 */
export const EINSTUFUNGEN = ['erreicht', 'unterwegs', 'nochmal'] as const;
export type Einstufung = (typeof EINSTUFUNGEN)[number];

/** Höchstlänge des Kommentars der Lehrkraft (Zeichen). */
export const KOMMENTAR_MAX_ZEICHEN = 4_000;

/** Höchstens so viele Abgaben je Person, Aufgabe und Gruppe (neu geschriebene Fassungen) bzw. je Person insgesamt. */
export const ABGABEN_JE_AUFGABE = 3;
export const ABGABEN_JE_KONTO = 200;

/** Zustände: gesendet und offen; mit Rückmeldung zurückgegeben (die Lehrkraft darf die Rückmeldung danach ändern). */
export type AbgabeZustand = 'offen' | 'zurueckgegeben';

export function zustandVon(a: { korrigiertAm: Date | string | null }): AbgabeZustand {
  return a.korrigiertAm ? 'zurueckgegeben' : 'offen';
}

/** Abgelaufen (12 Monate nach der Abgabe, `loeschenAb`): für niemanden mehr lesbar, auch bevor der Löschlauf läuft. */
export function abgelaufen(loeschenAb: Date, jetzt: Date): boolean {
  return loeschenAb.getTime() <= jetzt.getTime();
}

/** Löschdatum einer Abgabe: `monate` Kalendermonate nach der Abgabe (UTC, wie `loeschen/fristen.ts` `plusMonate`). */
export function loeschenAbFuer(eingereichtAm: Date, monate: number): Date {
  const z = new Date(eingereichtAm.getTime());
  z.setUTCMonth(z.getUTCMonth() + monate);
  return z;
}

/**
 * Darf die Lehrkraft diese Abgabe lesen und korrigieren? Nur wenn alles zugleich gilt:
 * - sie ist Lehrkraft (nicht Aufsicht) dieser aktiven Gruppe (`aufgabe.bearbeiten`);
 * - die Abgabe ging an diese Gruppe;
 * - die lernende Person ist **laufendes** Mitglied der Gruppe (Austritt → sofort nicht mehr lesbar);
 * - deren Einwilligung `lernapp` gilt – bei Kindern die der Eltern (Widerruf → sofort nicht mehr lesbar);
 * - die Abgabe ist nicht abgelaufen.
 * Administration, Eltern, andere Lernende und fremde Lehrkräfte lesen nie (sie sind nie Lehrkraft dieser Gruppe).
 */
export function lehrkraftLiest(l: {
  lehrkraftDerGruppe: boolean;
  abgabeInGruppe: boolean;
  laufendesMitglied: boolean;
  einwilligung: boolean;
  abgelaufen: boolean;
}): boolean {
  return l.lehrkraftDerGruppe && l.abgabeInGruppe && l.laufendesMitglied && l.einwilligung && !l.abgelaufen;
}

/**
 * Prüfliste aus einer Eingabe: nur bekannte Kriterien mit ganzen Stufen 0–3; leere Werte fallen weg. `null`, wenn ein
 * Wert ungültig ist (unbekanntes Kriterium oder Stufe außerhalb 0–3).
 */
export function lesePruefliste(roh: Readonly<Record<string, unknown>>): Pruefliste | null {
  const aus: Pruefliste = {};
  for (const [k, w] of Object.entries(roh)) {
    if (!(KRITERIEN as readonly string[]).includes(k)) return null;
    if (w === undefined || w === null || w === '') continue;
    const n = typeof w === 'string' ? Number(w) : w;
    if (typeof n !== 'number' || !Number.isInteger(n) || n < 0 || n > 3) return null;
    aus[k as Kriterium] = n as Stufe;
  }
  return aus;
}

export function istEinstufung(w: unknown): w is Einstufung {
  return typeof w === 'string' && (EINSTUFUNGEN as readonly string[]).includes(w);
}

/** Eine Rückmeldung braucht mindestens einen Kommentar, eine Stufe der Prüfliste oder eine Einstufung. */
export function rueckmeldungLeer(r: { kommentar: string | null; pruefliste: Pruefliste; einstufung: Einstufung | null }): boolean {
  return !r.kommentar?.trim() && Object.keys(r.pruefliste).length === 0 && r.einstufung === null;
}

/**
 * Ort einer Aufgabe im Kurs aus ihrem Schlüssel (`kurse.ts`: Einheit `<sprache>.<stufe>.eNN`, Lektion `<einheit>.lNN`,
 * Aufgabe `<lektion>.aNN`) – nur, wenn die Aufgabe zur Zielsprache der Richtung gehört. Ob es die Aufgabe gibt und ob sie
 * eine Schreibaufgabe ist, prüft der Dienst am Kurspaket.
 */
export function aufgabenOrt(kurs: string, aufgabe: string): { kurs: RichtungId; einheit: string; lektion: string } | null {
  if (!istRichtung(kurs) || aufgabe.length > 120) return null;
  const teile = aufgabe.split('.');
  if (teile.length !== 5 || teile.some((t) => !/^[a-z0-9]+$/.test(t))) return null;
  if (teile[0] !== zerlegeRichtung(kurs).ziel) return null;
  return { kurs, einheit: teile.slice(0, 3).join('.'), lektion: teile.slice(0, 4).join('.') };
}

/**
 * Schlüssel der Abgabe in der Datenbank (`lernapp_schreibabgabe.aufgabe_schluessel`): Richtung und Aufgabe wie die
 * Kartenschlüssel (`paket/bauen.ts` `kartenSchluessel`), damit die Lehrkraft die Aufgabe im richtigen Kurspaket findet.
 */
export const abgabeSchluessel = (kurs: RichtungId, aufgabe: string): string => `${kurs}:${aufgabe}`;

export function zerlegeAbgabeSchluessel(s: string): { kurs: RichtungId; aufgabe: string } | null {
  const i = s.indexOf(':');
  const kurs = s.slice(0, i);
  return i > 0 && istRichtung(kurs) ? { kurs, aufgabe: s.slice(i + 1) } : null;
}
