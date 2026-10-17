import 'server-only';
import { ladeEinstellung } from '@/server/queries/einstellungen';
import { datenbankVerfuegbar } from '@/lib/db/verfuegbar';
import { entscheideWirksam, type Funktion } from '@/lib/funktionen-regeln';

/**
 * Funktionsschalter (ADR 0035). Alles mit Personendaten (Konten, Lernplattform, Chat, Push, Hatim,
 * Newsletter) ist in der Produktion aus, bis Menschen es im Cockpit oder per Umgebung einschalten.
 * Vorrang: Umgebung `FUNKTION_<NAME>=an|aus` → Einstellung `funktionen` (Datenbank) → Standard der Betriebsart.
 * In der Produktion gewinnt immer die Umgebung, wenn sie gesetzt ist; ohne Datenbank (Beispielmodus) zählt nur sie.
 */
export {
  entscheide,
  entscheideWirksam,
  FUNKTIONEN,
  MIT_PERSONENDATEN,
  standardFuer,
  umgebungsSchalter,
  VORAUSSETZUNGEN,
  type Funktion,
} from '@/lib/funktionen-regeln';

/**
 * Ist die Funktion eingeschaltet und wirksam (alle Voraussetzungen, z. B. `lernapp` für jeden Schalter der Lern-App)?
 * Liest die (gecachte) Einstellung nur, wenn eine Datenbank verfügbar ist.
 */
export async function funktionAn(f: Funktion): Promise<boolean> {
  const einstellung = datenbankVerfuegbar() ? await ladeEinstellung('funktionen') : null;
  return entscheideWirksam(f, process.env, einstellung);
}
