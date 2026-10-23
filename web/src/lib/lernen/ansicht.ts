/**
 * Reine Hilfen für die Oberflächen der Lernplattform in „Mein Bereich“ (AUFTRAG 3.5): Lehrkraft, Eltern, Schüler.
 * Ohne Datenbank und ohne Serverabhängigkeit – unit-getestet (`tests/unit/lernen-ansicht.test.ts`) und auch im
 * Browser nutzbar (Passwortvorschlag, nächste Fortschrittsstufe).
 */
import { darfInGruppe, type GruppenKontext } from '@/lib/rechte/gruppen';
import { tagPlus, type AnwesenheitsStatus } from './termine';

export type FortschrittStatus = 'begonnen' | 'sicher' | 'abgeschlossen';
export type KanalArt = 'gruppe' | 'eltern';
export type Sprache = 'de' | 'tr' | 'en';

/**
 * Einwilligungen, die Eltern für ihr Kind einzeln erteilen und widerrufen (ADR 0026, S-03). `lernapp` (S-L3 N-2) erscheint
 * nur, solange ein Schalter mit Personendaten der Lern-App an ist (`lernapp_sync` oder `lernapp_gruppen`) oder sie gilt –
 * der Widerruf bleibt immer möglich.
 */
export const KIND_EINWILLIGUNGEN = ['lernplattform', 'kinderkonto', 'gruppenchat', 'push_kind', 'lernapp'] as const;
export type KindEinwilligung = (typeof KIND_EINWILLIGUNGEN)[number];

/** Maßnahmen der Lehrkraft auf eine Chat-Meldung (S-09); „abschließen“ setzt die Meldung danach auf „erledigt“. */
export const MASSNAHMEN = ['entfernen', 'stumm30', 'stummTag', 'mitglied', 'in_bearbeitung', 'erledigt'] as const;
export type Massnahme = (typeof MASSNAHMEN)[number];

/** Kursarten der Lehrpläne in fester Reihenfolge (wie das Schema). */
export const KURSARTEN = ['elifbe', 'kuran', 'tecvid', 'ilmihal', 'hifz'] as const;
export type KursartSchluessel = (typeof KURSARTEN)[number];

const LOCALE: Record<Sprache, string> = { de: 'de-DE', tr: 'tr-TR', en: 'en-GB' };

export function localeFuer(sprache: string): string {
  return LOCALE[(sprache in LOCALE ? sprache : 'de') as Sprache];
}

/** „Heute“ und die folgenden sechs Tage (Kalendertage „JJJJ-MM-TT“, beide eingeschlossen). */
export function wochenFenster(heute: string): { von: string; bis: string } {
  return { von: heute, bis: tagPlus(heute, 6) };
}

/** Kalendertag als Text, z. B. „Sa., 17.10.“ (kurz) oder „Samstag, 17. Oktober 2026“ (lang). Zeitzonenfest (UTC-Mittag). */
export function datumText(datum: string, sprache: string, art: 'kurz' | 'lang' | 'tag' = 'kurz'): string {
  const d = new Date(`${datum}T12:00:00Z`);
  const optionen: Intl.DateTimeFormatOptions =
    art === 'lang'
      ? { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }
      : art === 'tag'
        ? { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }
        : { weekday: 'short', day: '2-digit', month: '2-digit', timeZone: 'UTC' };
  return new Intl.DateTimeFormat(localeFuer(sprache), optionen).format(d);
}

/** Kurzer Wochentag eines Kalendertags („Sa.“, „Cmt“, „Sat“). */
export function wochentagKurz(datum: string, sprache: string): string {
  return new Intl.DateTimeFormat(localeFuer(sprache), { weekday: 'short', timeZone: 'UTC' }).format(new Date(`${datum}T12:00:00Z`));
}

/** Zeitspanne „10:00–12:00“; fehlt das Ende, nur der Beginn; ohne Beginn leer. */
export function zeitspanne(beginn: string | null, ende: string | null): string {
  if (!beginn) return '';
  return ende ? `${beginn}–${ende}` : beginn;
}

/** Wochentage einer Terminserie als kurze Namen (0 = Sonntag), sortiert ab Montag. */
export function wochentageText(tage: readonly number[], sprache: string): string {
  const format = new Intl.DateTimeFormat(localeFuer(sprache), { weekday: 'short', timeZone: 'UTC' });
  // 2026-10-11 ist ein Sonntag
  const sortiert = [...new Set(tage)].filter((t) => t >= 0 && t <= 6).sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7));
  return sortiert.map((t) => format.format(new Date(Date.UTC(2026, 9, 11 + t, 12)))).join(', ');
}

/**
 * Stand auf dem Lernweg (B-24): Die aktuelle Station ist die erste nicht abgeschlossene Stufe; sind alle
 * abgeschlossen, die letzte (`geschafft`). `erreicht` zählt die abgeschlossenen Stufen. Ohne Stufen: null.
 */
export function lernwegStand(
  stufen: readonly { id: string }[],
  stand: Readonly<Record<string, FortschrittStatus | null | undefined>>,
): { aktuell: number; erreicht: number; geschafft: boolean } | null {
  if (!stufen.length) return null;
  const erste = stufen.findIndex((s) => stand[s.id] !== 'abgeschlossen');
  const erreicht = stufen.filter((s) => stand[s.id] === 'abgeschlossen').length;
  return erste === -1 ? { aktuell: stufen.length - 1, erreicht, geschafft: true } : { aktuell: erste, erreicht, geschafft: false };
}

/**
 * Kursart für den Lernweg eines Kindes: die der aktuellen Gruppe, wenn die Verwaltung sie festgelegt hat; sonst die mit
 * dem jüngsten Eintrag (bei Gleichstand die frühere im Lehrplan), ohne Einträge Elifbe (der Anfang des Weges).
 */
export function lernwegKursart(
  eintraege: readonly { kursart: KursartSchluessel; datum: string }[],
  gruppenKursart: KursartSchluessel | null = null,
): KursartSchluessel {
  if (gruppenKursart) return gruppenKursart;
  let beste: { kursart: KursartSchluessel; datum: string } | null = null;
  for (const e of eintraege) {
    if (!beste || e.datum > beste.datum || (e.datum === beste.datum && KURSARTEN.indexOf(e.kursart) < KURSARTEN.indexOf(beste.kursart)))
      beste = e;
  }
  return beste?.kursart ?? 'elifbe';
}

/** Nächster Status beim Antippen einer Zelle im Fortschrittsraster: leer → begonnen → sicher → abgeschlossen → leer. */
export function naechsterFortschritt(status: FortschrittStatus | null): FortschrittStatus | null {
  return status === null ? 'begonnen' : status === 'begonnen' ? 'sicher' : status === 'sicher' ? 'abgeschlossen' : null;
}

/** Zählt erfasste Anwesenheiten je Status (Elternansicht: ruhiger Satz statt Rangliste oder Quote in Prozent). */
export function anwesenheitsZaehlung(stati: readonly AnwesenheitsStatus[]): Record<AnwesenheitsStatus, number> {
  const z: Record<AnwesenheitsStatus, number> = { anwesend: 0, verspaetet: 0, entschuldigt: 0, fehlt: 0 };
  for (const s of stati) z[s]++;
  return z;
}

/**
 * Kanäle, die ein Konto in einer Gruppe öffnen darf (S-01): Gruppenkanal für Leitung und Schüler, Elternkanal für
 * Leitung und Eltern. Reihenfolge: zuerst der Gruppenkanal.
 */
export function kanaeleFuer(kontext: GruppenKontext, gruppeId: string): KanalArt[] {
  const arten: KanalArt[] = [];
  if (darfInGruppe(kontext, 'chat.gruppe.lesen', gruppeId)) arten.push('gruppe');
  if (darfInGruppe(kontext, 'chat.eltern.lesen', gruppeId)) arten.push('eltern');
  return arten;
}

/** Gewählter Kanal aus der Adresse (`?kanal=`), sonst der erste erlaubte; null ohne Zugang. */
export function kanalWahl(erlaubt: readonly KanalArt[], wunsch: unknown): KanalArt | null {
  if (typeof wunsch === 'string' && (erlaubt as readonly string[]).includes(wunsch)) return wunsch as KanalArt;
  return erlaubt[0] ?? null;
}

/** Zeichen für Passwortvorschläge: ohne leicht verwechselbare (0/o, 1/l/i). */
const PASSWORT_ZEICHEN = 'abcdefghjkmnpqrstuvwxyz23456789';

/**
 * Vorschlag für das Passwort eines Kinderzugangs: drei Vierergruppen mit Bindestrich („k7pm-3hxa-9qrt“, 14 Zeichen,
 * ≥ 12 wie verlangt), gut abzuschreiben. Zufall von außen (im Browser `crypto.getRandomValues`), damit testbar.
 */
export function passwortVorschlag(zufall: Uint8Array): string {
  if (zufall.length < 12) throw new Error('Zu wenig Zufall.');
  const zeichen = Array.from(zufall.slice(0, 12), (b) => PASSWORT_ZEICHEN[b % PASSWORT_ZEICHEN.length]);
  return [zeichen.slice(0, 4), zeichen.slice(4, 8), zeichen.slice(8, 12)].map((g) => g.join('')).join('-');
}

/** Platzhalter `{name}` in einem fertig übersetzten Text füllen (Inseln ohne next-intl). */
export function fuelle(vorlage: string, werte: Record<string, string | number>): string {
  return vorlage.replace(/\{(\w+)\}/g, (_, k: string) => (k in werte ? String(werte[k]) : `{${k}}`));
}
