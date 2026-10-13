import { istKontoPfad } from '@/lib/sicherheit/header';

/**
 * Kleine Regeln der Gemeinde-Konten (ADR 0026). Reine Funktionen, unit-getestet (`tests/unit/konto-regeln.test.ts`).
 */

/** Domain der synthetischen Adressen von Kinderkonten (RFC 2606: nie zustellbar). */
export const KINDER_DOMAIN = 'konto.invalid';

/** Synthetische Adresse eines Kinderkontos aus einem Zufallswert (nur a–z, 0–9). */
export function synthetischeAdresse(zufall: string): string {
  const teil = zufall.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (teil.length < 16) throw new Error('Zufallswert zu kurz.');
  return `k-${teil}@${KINDER_DOMAIN}`;
}

/** true für die synthetischen Adressen der Kinderkonten. Sie melden sich nur mit Benutzernamen an. */
export function istKinderAdresse(email: string): boolean {
  return email.trim().toLowerCase().endsWith(`@${KINDER_DOMAIN}`);
}

/**
 * Anzeigename (S-14): Vorname und Initial des letzten Namensteils, z. B. „Testperson Eins“ → „Testperson E.“.
 * Ein einzelner Name bleibt, höchstens 40 Zeichen.
 */
export function anzeigenameAus(name: string): string {
  const teile = name.trim().split(/\s+/).filter(Boolean);
  if (teile.length === 0) return '';
  const vorname = teile[0];
  const initial = teile.length > 1 ? ` ${Array.from(teile[teile.length - 1])[0].toLocaleUpperCase('de')}.` : '';
  return `${vorname}${initial}`.slice(0, 40);
}

/** Vorname für die Begrüßung: erster Teil des Anzeigenamens. */
export function vornameAus(anzeigename: string): string {
  return anzeigename.trim().split(/\s+/)[0] ?? '';
}

/**
 * Rücksprung nach der Anmeldung (`?weiter=`): nur relative Pfade der eigenen Konto-Seiten (Einladung, Mein Bereich),
 * keine fremden Ziele (offene Weiterleitung). Ergebnis ist der geprüfte Pfad oder null.
 */
export function sichererRuecksprung(wert: unknown): string | null {
  if (typeof wert !== 'string' || wert.length > 300) return null;
  if (!/^\/[A-Za-z0-9\-._~/?=&%]*$/.test(wert) || wert.startsWith('//')) return null;
  const pfad = wert.split('?')[0];
  if (pfad.includes('..') || !istKontoPfad(pfad)) return null;
  return wert;
}
