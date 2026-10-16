import { berlinerDatum } from '@/lib/gebetszeiten/naechstes';

/**
 * Rückfall für Benachrichtigungen (ADR 0034 Nr. 6, F-38): tägliche Mail-Zusammenfassung ohne Inhalte und der Hinweis in
 * „Mein Bereich“. Reine Funktionen ohne Serverabhängigkeit (Server, Browser und Unit-Tests): Themen, Tagesgrenze,
 * Zeilen der Zusammenfassung und der Zählbeginn des Abrufs. Nur Bereich und Anzahl – nie Namen, Titel oder Inhalte.
 */

/** Themen der Zusammenfassung: dieselben wie beim Push, aber ohne Gebet (eine Erinnerung am nächsten Tag hilft nicht). */
export const ZUSAMMENFASSUNG_THEMEN = ['ankuendigung', 'chat', 'unterricht'] as const;
export type ZusammenfassungThema = (typeof ZUSAMMENFASSUNG_THEMEN)[number];

/** Anzahl je Bereich: Ankündigungen, Gruppen mit neuen Nachrichten, Gruppen mit Neuigkeiten aus dem Unterricht. */
export type NeuesZaehlung = Record<ZusammenfassungThema, number>;
export const KEIN_NEUES: NeuesZaehlung = { ankuendigung: 0, chat: 0, unterricht: 0 };

/** Zeilenreihenfolge in Mail und Hinweis: erst die Gruppen, dann die Moschee. */
const REIHENFOLGE: readonly ZusammenfassungThema[] = ['chat', 'unterricht', 'ankuendigung'];

const istThema = (w: unknown): w is ZusammenfassungThema => (ZUSAMMENFASSUNG_THEMEN as readonly unknown[]).includes(w);

/** Auswahl aus dem Formular: nur bekannte und für das Konto erlaubte Themen, ohne Doppelte, in fester Reihenfolge. */
export function waehleThemen(eingabe: readonly unknown[], erlaubt: readonly ZusammenfassungThema[]): ZusammenfassungThema[] {
  const gewaehlt = new Set(eingabe.filter(istThema));
  return ZUSAMMENFASSUNG_THEMEN.filter((t) => gewaehlt.has(t) && erlaubt.includes(t));
}

/** Gespeicherte Themen lesen (unbekannte Werte aus älteren Ständen fallen weg). */
export function themenAus(werte: readonly string[]): ZusammenfassungThema[] {
  return ZUSAMMENFASSUNG_THEMEN.filter((t) => werte.includes(t));
}

/** Schon am selben Berliner Kalendertag gesendet? Höchstens eine Zusammenfassung je Tag. */
export function heuteGesendet(letzterVersand: Date | null, jetzt: Date): boolean {
  return letzterVersand !== null && berlinerDatum(letzterVersand) >= berlinerDatum(jetzt);
}

/** Zeilen der Zusammenfassung: nur gewählte Themen mit Neuem, in fester Reihenfolge. */
export function zeilenDerZusammenfassung(
  zahl: NeuesZaehlung,
  themen: readonly ZusammenfassungThema[] = ZUSAMMENFASSUNG_THEMEN,
): { thema: ZusammenfassungThema; anzahl: number }[] {
  return REIHENFOLGE.filter((t) => themen.includes(t) && Number.isInteger(zahl[t]) && zahl[t] > 0).map((t) => ({
    thema: t,
    anzahl: zahl[t],
  }));
}

/** Lohnt eine Zusammenfassung? Nur mit gewählten Themen, nicht schon heute gesendet und nur, wenn seither etwas Neues da ist. */
export function zusammenfassungFaellig(o: {
  themen: readonly ZusammenfassungThema[];
  zahl: NeuesZaehlung;
  letzterVersand: Date | null;
  jetzt: Date;
}): boolean {
  if (!o.themen.length || heuteGesendet(o.letzterVersand, o.jetzt)) return false;
  return zeilenDerZusammenfassung(o.zahl, o.themen).length > 0;
}

/** Text einer Zeile: „eins“ für genau eins, sonst „mehr“ mit `{anzahl}` (keine Namen, keine Inhalte). */
export function zeilenText(vorlage: { eins: string; mehr: string }, anzahl: number): string {
  return anzahl === 1 ? vorlage.eins : vorlage.mehr.replaceAll('{anzahl}', String(anzahl));
}

/** Höchster Rückblick des Abrufs in „Mein Bereich“: einen Tag (ältere Stände zählen als „seit eben“). */
export const ABRUF_RUECKBLICK_MS = 24 * 60 * 60 * 1000;

/**
 * Zählbeginn des Abrufs aus dem Parameter `seit` (Millisekunden, vom Server im vorigen Abruf geliefert): nie in der
 * Zukunft, höchstens {@link ABRUF_RUECKBLICK_MS} zurück. Ohne gültigen Wert `null` – dann liefert der Abruf nur den Stand.
 */
export function seitAusAbruf(roh: string | null, jetztMs: number): number | null {
  if (!roh || !/^\d{1,15}$/.test(roh)) return null;
  const wert = Number(roh);
  return Math.min(Math.max(wert, jetztMs - ABRUF_RUECKBLICK_MS), jetztMs);
}

/** Summe aller Bereiche (für „gibt es überhaupt Neues?“ und den Vergleich zweier Abrufe). */
export function summe(zahl: NeuesZaehlung): number {
  return ZUSAMMENFASSUNG_THEMEN.reduce((s, t) => s + (Number.isInteger(zahl[t]) && zahl[t] > 0 ? zahl[t] : 0), 0);
}
