/**
 * Regeln des moderierten Gruppenchats (Kinderschutz S-01…S-18, ADR 0026). Reine Funktionen ohne Datenbank –
 * vollständig unit-testbar; die Dienstfunktionen in `dienst.ts` setzen sie mit Daten zusammen.
 */

/** S-05: nur Text, höchstens 500 Zeichen (Graphem-Zählung wie im Eingabefeld). */
export const MAX_ZEICHEN = 500;
/** S-13: höchstens 10 Nachrichten je Minute und 200 je Tag und Person. */
export const RATE_MINUTE = 10;
export const RATE_TAG = 200;
/** S-12: Nachrichten 90 Tage, spätestens 30 Tage nach Gruppenende; Meldungen 1 Jahr nach Abschluss. */
export const FRIST_NACHRICHT_TAGE = 90;
export const FRIST_NACH_GRUPPENENDE_TAGE = 30;
export const FRIST_MELDUNG_TAGE = 365;
/** S-11: Kontext einer Meldung (±10 Nachrichten). */
export const MELDUNG_KONTEXT = 10;
/** S-02: Ein Kanal ist nur mit mindestens zwei Erwachsenen in der Gruppenleitung aktiv. */
export const MIN_ERWACHSENE = 2;
/** S-04: Mindestalter je Gruppe, nie unter 10. */
export const MINDESTALTER_UNTERGRENZE = 10;
/** S-15: Version der kindgerechten Chat-Regeln (neue Fassung → erneut bestätigen). */
export const REGELN_VERSION = 'chat-regeln-2026-10';

export type TextFehler = 'leer' | 'zuLang';

/** Steuerzeichen und unsichtbare Zeichen entfernen, Leerzeilen begrenzen, trimmen. Links bleiben reiner Text (S-05). */
export function bereinigeText(roh: string): string {
  return roh
    .normalize('NFC')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g, '')
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function zeichenZahl(text: string): number {
  return [...new Intl.Segmenter('de', { granularity: 'grapheme' }).segment(text)].length;
}

export function pruefeText(text: string): TextFehler | null {
  if (!text) return 'leer';
  if (zeichenZahl(text) > MAX_ZEICHEN) return 'zuLang';
  return null;
}

/** „HH:MM“ → Minuten seit Mitternacht. */
function minuten(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

/** S-06: Liegt die Uhrzeit (Europe/Berlin, „HH:MM“) im Öffnungsfenster [von, bis)? Fenster über Mitternacht erlaubt. */
export function imFenster(uhrzeit: string, von: string, bis: string): boolean {
  const u = minuten(uhrzeit);
  const a = minuten(von);
  const b = minuten(bis);
  return a <= b ? u >= a && u < b : u >= a || u < b;
}

/** Alter in vollen Jahren am Stichtag aus dem Tag des 16. Geburtstags (nur dieser liegt im Klartext vor). */
export function alterAus(sechzehnAm: string, heute: string): number {
  const [sj, sm, st] = sechzehnAm.split('-').map(Number);
  const [hj, hm, ht] = heute.split('-').map(Number);
  const geburtsjahr = sj - 16;
  let alter = hj - geburtsjahr;
  if (hm < sm || (hm === sm && ht < st)) alter--;
  return alter;
}

/** S-14: Anzeigename im Chat = Vorname + Initial des Nachnamens („Ayşe K.“). */
export function chatName(anzeigename: string): string {
  const teile = anzeigename.trim().split(/\s+/).filter(Boolean);
  if (teile.length <= 1) return teile[0] ?? '';
  const letzter = teile.at(-1)!;
  if (/^\p{L}\.$/u.test(letzter)) return `${teile[0]} ${letzter}`;
  return `${teile[0]} ${[...letzter][0].toLocaleUpperCase('de')}.`;
}

export type SchreibGrund =
  | 'ok'
  | 'keinRecht'
  | 'kanalAus'
  | 'notfallpause'
  | 'pausiert'
  | 'zuWenigeErwachsene'
  | 'geschlossen'
  | 'nurLehrkraft'
  | 'stumm'
  | 'einwilligungFehlt'
  | 'zuJung'
  | 'regelnFehlen';

export type SchreibLage = {
  darfLesen: boolean;
  /** Gruppenrecht „chat.<art>.schreiben“. */
  darfSchreibenRecht: boolean;
  istLeitung: boolean;
  kanalStatus: 'aktiv' | 'pausiert' | 'archiviert';
  chatModus: 'aus' | 'nur_lehrkraft' | 'offen';
  notfallpause: boolean;
  erwachsene: number;
  uhrzeit: string;
  chatVon: string;
  chatBis: string;
  stummBis: Date | null;
  jetzt: Date;
  /** Nur für Kinder/Jugendliche im Gruppenkanal: */
  istLernende: boolean;
  unter16: boolean;
  einwilligungGruppenchat: boolean;
  alter: number | null;
  mindestalter: number;
  regelnBestaetigt: boolean;
};

/** Entscheidet, ob jemand jetzt schreiben darf (S-01…S-06, S-09, S-15, S-17). Leitung darf außerhalb der Zeiten schreiben. */
export function schreibGrund(l: SchreibLage): SchreibGrund {
  if (!l.darfLesen || !l.darfSchreibenRecht) return 'keinRecht';
  if (l.notfallpause) return 'notfallpause';
  if (l.chatModus === 'aus' || l.kanalStatus === 'archiviert') return 'kanalAus';
  if (l.erwachsene < MIN_ERWACHSENE) return 'zuWenigeErwachsene';
  if (l.kanalStatus === 'pausiert') return 'pausiert';
  if (l.istLeitung) return 'ok';
  if (l.chatModus === 'nur_lehrkraft') return 'nurLehrkraft';
  if (!imFenster(l.uhrzeit, l.chatVon, l.chatBis)) return 'geschlossen';
  if (l.stummBis && l.stummBis.getTime() > l.jetzt.getTime()) return 'stumm';
  if (l.istLernende) {
    if (l.unter16 && !l.einwilligungGruppenchat) return 'einwilligungFehlt';
    if (l.alter !== null && l.alter < Math.max(l.mindestalter, MINDESTALTER_UNTERGRENZE)) return 'zuJung';
  }
  if (!l.regelnBestaetigt) return 'regelnFehlen';
  return 'ok';
}
