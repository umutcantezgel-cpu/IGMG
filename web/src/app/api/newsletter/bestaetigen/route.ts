import { connection } from 'next/server';
import { bestaetige } from '@/lib/newsletter/dienst';
import { newsletterZiel } from '@/lib/newsletter/ziel';

/**
 * Bestätigungslink aus der Mail „Anmeldung bestätigen“ (Double-Opt-in, AUFTRAG 3.10): bestätigt die Anmeldung und
 * leitet auf /newsletter#bestaetigt (bzw. #ungueltig für abgelaufene oder unbekannte Links). Die statische Seite zeigt
 * die Meldung über eine kleine Insel aus dem Anker. Je Anfrage (`connection`), nie zwischengespeichert.
 */
export async function GET(anfrage: Request) {
  await connection();
  const url = new URL(anfrage.url);
  const ok = await bestaetige(url.searchParams.get('token') ?? '');
  return newsletterZiel(url.searchParams.get('sprache'), ok ? 'bestaetigt' : 'ungueltig');
}
