import { betriebsart, type UmgebungsWerte } from '@/lib/umgebung';
import type { FunktionenEinstellung } from '@/lib/validierung/einstellungen';

/**
 * Reine Regeln der Funktionsschalter (ADR 0035) ohne Datenbank und ohne `server-only`: Liste, Standard je Betriebsart
 * und Vorrang Umgebung → Einstellung → Standard. Genutzt von `funktionen.ts`, dem Startklar-Cockpit und `pnpm startklar`.
 */
export const FUNKTIONEN = [
  'konten',
  'lernplattform',
  'chat',
  'echtzeit',
  'push',
  'push_gebet',
  'hatim',
  'newsletter',
  'hadith_gesamt',
  'ramadan_vorschau',
] as const satisfies readonly (keyof FunktionenEinstellung)[];
export type Funktion = (typeof FUNKTIONEN)[number];

/** Standard: in Entwicklung und Vorschau an (Vorführung), in der Produktion aus. */
export function standardFuer(env: UmgebungsWerte): boolean {
  return betriebsart(env) !== 'produktion';
}

/** Wert aus der Umgebung (`FUNKTION_CHAT=an`), sonst undefined. */
export function umgebungsSchalter(f: Funktion, env: UmgebungsWerte): boolean | undefined {
  const wert = env[`FUNKTION_${f.toUpperCase()}`]?.trim().toLowerCase();
  if (wert === 'an' || wert === 'true' || wert === '1') return true;
  if (wert === 'aus' || wert === 'false' || wert === '0') return false;
  return undefined;
}

/** Reine Entscheidung (unit-testbar): Umgebung → Einstellung → Standard. */
export function entscheide(f: Funktion, env: UmgebungsWerte, einstellung: FunktionenEinstellung | null): boolean {
  const ausUmgebung = umgebungsSchalter(f, env);
  if (ausUmgebung !== undefined) return ausUmgebung;
  const ausEinstellung = einstellung?.[f];
  if (ausEinstellung !== undefined) return ausEinstellung;
  return standardFuer(env);
}

/** Funktionen mit Personendaten: in der Produktion erst nach Freigabe durch Menschen (MN-10, MN-11, MN-17). */
export const MIT_PERSONENDATEN = [
  'konten',
  'lernplattform',
  'chat',
  'echtzeit',
  'push',
  'push_gebet',
  'hatim',
  'newsletter',
] as const satisfies readonly Funktion[];
