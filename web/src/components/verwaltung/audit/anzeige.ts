import { datumLang, uhrzeit } from '@/lib/i18n/format';

/**
 * Anzeige-Hilfen des Audit-Logs (C13). Rein und ohne Datenbank: Texte kommen als Zeichenketten herein, damit die
 * Funktionen ohne Sprachkontext prüfbar sind.
 */

/** Die ersten acht Zeichen einer ID mit Auslassungszeichen (Ziel-Spalte, „gekürzte ID“). */
export function kurzeId(id: string): string {
  return id.length > 8 ? `${id.slice(0, 8)}…` : id;
}

/** Zeitpunkt in Europe/Berlin, z. B. „Di., 28. Juli 2026, 18:30 Uhr“ (K-05, Formatierer aus lib/i18n/format). */
export function zeitpunktText(zeitpunkt: Date): string {
  return `${datumLang(zeitpunkt, 'de')}, ${uhrzeit(zeitpunkt, 'de')}`;
}

/** Benutzer: „System/Besucher“ ohne Konto, sonst Name und E-Mail; „Konto nicht mehr vorhanden“, wenn das Konto fehlt. */
export function benutzerAnzeige(
  eintrag: { benutzerId: string | null; benutzerName: string | null; benutzerEmail: string | null },
  texte: { system: string; kontoFehlt: string },
): { haupt: string; zweit: string | null } {
  if (eintrag.benutzerId === null) return { haupt: texte.system, zweit: null };
  if (eintrag.benutzerName === null) return { haupt: texte.kontoFehlt, zweit: null };
  return { haupt: eintrag.benutzerName, zweit: eintrag.benutzerEmail };
}

/** Ziel: Typ (übersetzt, sonst wie gespeichert) und gekürzte ID; `null`, wenn der Eintrag kein Ziel hat. */
export function zielAnzeige(
  zielTyp: string | null,
  zielId: string | null,
  typNamen: Readonly<Record<string, string>>,
  keinWert: string,
): { typ: string; kurz: string | null } | null {
  if (zielTyp === null && zielId === null) return null;
  let typ = keinWert;
  if (zielTyp !== null) typ = Object.hasOwn(typNamen, zielTyp) ? typNamen[zielTyp] : zielTyp;
  return { typ, kurz: zielId === null ? null : kurzeId(zielId) };
}

/** Gespeicherte Details als „Schlüssel=Wert“ in gespeicherter Reihenfolge; leer, wenn keine gespeichert sind. */
export function detailZeilen(details: Readonly<Record<string, string | number | boolean | null>> | null): string[] {
  if (details === null) return [];
  return Object.entries(details).map(([schluessel, wert]) => `${schluessel}=${String(wert)}`);
}
