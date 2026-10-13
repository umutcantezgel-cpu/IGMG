import { normalisiereArabisch } from './import';

/**
 * Reine Hilfen der Hadith-Seiten (AUFTRAG 3.3, ADR 0030): Anker, Buchnummer aus der Adresse, Sichtbarkeit der
 * Gesamtsammlung (Schalter `hadith_gesamt`, MN-06), geprüfte Übersetzung je Sprache und Suchausschnitt.
 * Ohne Datenbank und ohne `server-only`, damit Unit-Tests sie direkt prüfen.
 */

/** Kennung der importierten Sammlung (scripts/inhalte-import.ts). */
export const BUKHARI = 'bukhari';

/** Anker eines Hadith auf der Buchseite, z. B. `h-402.2` (Nummer der Quelle unverändert). */
export function hadithAnker(nummer: string): string {
  return `h-${nummer}`;
}

/** Buchnummer aus dem Adressteil: nur die kanonische Schreibweise 1–999 („2“ ja, „02“, „2a“, „0“ nein). */
export function buchNummer(roh: string): number | null {
  return /^[1-9]\d{0,2}$/.test(roh) ? Number(roh) : null;
}

/**
 * Was öffentlich sichtbar ist: Die Gesamtsammlung (Bücher und Buchseiten) nur mit eingeschaltetem Schalter und
 * importierten Büchern; die Auswahl immer (sie ist kuratiert und kann leer sein).
 */
export type HadithSicht = { gesamt: boolean; buecherVerlinken: boolean; auswahl: true };

export function hadithSicht(schalterAn: boolean, buecherAnzahl: number): HadithSicht {
  const gesamt = schalterAn;
  return { gesamt, buecherVerlinken: gesamt && buecherAnzahl > 0, auswahl: true };
}

/** Bezug ohne Sammlungsnamen: „Buch b, Hadith h“ oder nur „Buch b“, wenn die Quelle keine Stelle im Buch nennt. */
export type Stelle = { buch: number; hadith: number | null };

export function stelle(buchNr: number, imBuchNr: number | null): Stelle {
  return { buch: buchNr, hadith: imBuchNr && imBuchNr > 0 ? imBuchNr : null };
}

/** Freigabestand einer Übersetzung (ADR 0030): öffentlich nur „geprueft“. */
export type FreigabeUebersetzung = { sprache: string; freigabe: string };

/** Die geprüfte Übersetzung in der Sprache der Seite oder null – nie ein Entwurf und nie eine andere Sprache. */
export function gepruefteUebersetzung<T extends FreigabeUebersetzung>(liste: readonly T[], sprache: string): T | null {
  return liste.find((u) => u.sprache === sprache && u.freigabe === 'geprueft') ?? null;
}

/** Arabischer Buchstabe (Grundbereich U+0621–U+064A und Erweiterungen); entscheidet, ob die Hadith-Suche läuft. */
const ARABISCH = /[\u0621-\u064a\u0671-\u06d3\u06fa-\u06ff]/;

export function enthaeltArabisch(text: string): boolean {
  return ARABISCH.test(text);
}

/** Nummer der Sammlung aus der Eingabe („1“, „402.2“, „Bukhari 7“, „Buhari 7“), sonst null. */
export function hadithNummerAus(eingabe: string): string | null {
  const m = /^(?:(?:sahih\s+)?(?:al[-\s])?bu[kh]{1,2}[aâ]r[iî]\s+)?(\d{1,4}(?:\.\d)?)$/i.exec(eingabe.trim());
  return m ? m[1] : null;
}

/** Wort für den Abgleich: ohne Harakat und Tatweel (wie die Suchspalte), ohne Satzzeichen. */
function vergleichsform(wort: string): string {
  return normalisiereArabisch(wort).replace(/[^\p{L}\p{N}]/gu, '');
}

export type AusschnittTeil = { text: string; treffer: boolean };
export type Ausschnitt = { teile: AusschnittTeil[]; vorn: boolean; hinten: boolean };

/**
 * Ausschnitt um den ersten Treffer im **unveränderten** arabischen Text (mit Harakat): Wörter werden nur für den
 * Vergleich normalisiert. Trefferwörter sind markiert; ohne Treffer der Anfang des Textes. `umfeld` Wörter je Seite.
 */
export function suchAusschnitt(textAr: string, begriff: string, umfeld = 12): Ausschnitt {
  const woerter = textAr.split(/\s+/).filter(Boolean);
  const gesucht = new Set(normalisiereArabisch(begriff).split(' ').map(vergleichsform).filter(Boolean));
  const markiert = woerter.map((w) => gesucht.has(vergleichsform(w)));
  const erster = markiert.indexOf(true);
  const start = erster < 0 ? 0 : Math.max(0, erster - umfeld);
  const ende = Math.min(woerter.length, erster < 0 ? 2 * umfeld + 1 : erster + umfeld + 1);
  const teile: AusschnittTeil[] = [];
  // Benachbarte Teile gleicher Art zusammenfassen; Leerzeichen gehören nie in eine Markierung
  const anfuegen = (text: string, treffer: boolean) => {
    const letzter = teile.at(-1);
    if (letzter && letzter.treffer === treffer) letzter.text += text;
    else teile.push({ text, treffer });
  };
  for (let i = start; i < ende; i++) {
    if (i > start) anfuegen(' ', false);
    anfuegen(woerter[i], markiert[i]);
  }
  return { teile, vorn: start > 0, hinten: ende < woerter.length };
}
