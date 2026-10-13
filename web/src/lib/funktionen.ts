import 'server-only';
import { ladeEinstellung } from '@/server/queries/einstellungen';
import { datenbankVerfuegbar } from '@/lib/db/verfuegbar';
import { betriebsart, type UmgebungsWerte } from '@/lib/umgebung';
import type { FunktionenEinstellung } from '@/lib/validierung/einstellungen';

/**
 * Funktionsschalter (ADR Funktionsschalter). Alles mit Personendaten (Konten, Lernplattform, Chat, Push, Hatim,
 * Newsletter) ist in der Produktion aus, bis Menschen es im Cockpit oder per Umgebung einschalten.
 * Vorrang: Umgebung `FUNKTION_<NAME>=an|aus` → Einstellung `funktionen` (Datenbank) → Standard der Betriebsart.
 * In der Produktion gewinnt immer die Umgebung, wenn sie gesetzt ist; ohne Datenbank (Beispielmodus) zählt nur sie.
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

/** Ist die Funktion eingeschaltet? Liest die (gecachte) Einstellung nur, wenn eine Datenbank verfügbar ist. */
export async function funktionAn(f: Funktion): Promise<boolean> {
  const einstellung = datenbankVerfuegbar() ? await ladeEinstellung('funktionen') : null;
  return entscheide(f, process.env, einstellung);
}
