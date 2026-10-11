import { cacheLife } from 'next/cache';

/**
 * Heutiges Datum in Europe/Berlin für statische Seiten: gecacht (stündlich neu), damit das Prerendern
 * keine „unstabile“ Uhrzeit liest. Feiner (Uhrzeit, nächstes Gebet) rechnet der Browser.
 */
export async function heuteBerlin(): Promise<{ datum: string; jahr: number }> {
  'use cache';
  cacheLife('hours');
  const datum = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit' }).format(
    new Date(),
  );
  return { datum, jahr: Number(datum.slice(0, 4)) };
}
