import { ladeAnzeige } from '@/server/queries/anzeige';

/**
 * Folien und Einstellung der Bildschirm-Anzeige als statische JSON-Datei (AUFTRAG 2.1, 3.10): Die Anzeige im
 * Gebetsraum fragt sie alle paar Minuten ab und übernimmt neue Folien ohne Neuladen; ohne Netz läuft sie mit dem
 * Stand weiter, den sie hat. Ohne Cookies und ohne Personendaten; erneuert über den Tag `anzeige`.
 * Beispielmodus ohne Datenbank: leere Folienliste mit Standard-Einstellung.
 */
export async function GET() {
  return Response.json(await ladeAnzeige());
}
