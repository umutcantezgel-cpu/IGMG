import type { TicketPrioritaet, TicketStatus } from '@/lib/validierung/ticket';

/**
 * Anzeige-Hilfen der Tickets (V10): Pillen wie in den übrigen Verwaltungslisten, Farben nur aus den Tokens.
 * Rein – ohne Datenbank und ohne Serverimporte.
 */
export const PILLE = 'inline-flex items-center rounded-pill px-3 py-0.5 text-16 font-bold whitespace-nowrap';

export const PRIORITAET_TON: Record<TicketPrioritaet, string> = {
  niedrig: 'bg-sand text-tinte-2',
  mittel: 'bg-warnung-toenung text-warnung',
  hoch: 'bg-fehler-toenung text-fehler',
  dringend: 'bg-fehler text-weiss',
};

export const STATUS_TON: Record<TicketStatus, string> = {
  offen: 'bg-info-toenung text-info',
  in_bearbeitung: 'bg-warnung-toenung text-warnung',
  geloest: 'bg-gruen-50 text-gruen-800',
  geschlossen: 'bg-sand text-tinte-2',
};

/** Ticketnummer wie auf dem Blatt: „T-001“. */
export function ticketNummer(nummer: number): string {
  return `T-${String(nummer).padStart(3, '0')}`;
}
