import { zeitspanne } from '@/lib/i18n/format';
import type { Sprache } from '@/lib/i18n/inhalt';

/**
 * Öffnungszeit als Text in der Sprache der Seite (DP-B-15). Deutsch bleibt der gepflegte Text („09:00–22:00 Uhr“).
 * Türkisch und Englisch setzen Beginn und Ende mit dem Formatierer aus `lib/i18n/format.ts`: „09:00–22:00“ (24-Stunden-Format,
 * ohne „Uhr“). Fehlt Beginn oder Ende, entfällt nur das „Uhr“ aus dem gepflegten Text.
 */
export function oeffnungszeitText(z: { zeiten: string; start: string; ende: string }, sprache: Sprache): string {
  if (sprache === 'de') return z.zeiten;
  const von = uhrzeitAus(z.start);
  const bis = uhrzeitAus(z.ende);
  if (von && bis) return zeitspanne(von, bis, sprache);
  return z.zeiten.replace(/\s*Uhr\s*$/u, '');
}

/** „09:00“ → Zeitpunkt, der in Europe/Berlin genau 09:00 zeigt. Am 1. Januar gilt Winterzeit (UTC+1), daher ist der Versatz fest. */
function uhrzeitAus(hm: string): Date | null {
  const treffer = /^([01]\d|2[0-3]):([0-5]\d)$/u.exec(hm.trim());
  if (!treffer) return null;
  return new Date(Date.UTC(2000, 0, 1, Number(treffer[1]) - 1, Number(treffer[2])));
}
