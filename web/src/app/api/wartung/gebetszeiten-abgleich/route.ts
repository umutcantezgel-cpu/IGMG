import { revalidateTag } from 'next/cache';
import { connection } from 'next/server';
import { TAG } from '@/lib/cache/tags';
import { gleicheAb, type AbgleichErgebnis } from '@/lib/gebetszeiten/abgleich';
import { cronErlaubt, wartungErlaubt } from '@/lib/wartung/zugang';

/**
 * IGMG-Abgleich der Gebetszeiten (ADR 0048): holt die Zeiten aus dem offiziellen Zugang der IGMG (GEBETSZEITEN_IGMG_URL)
 * bzw. der Jahresdatei, prüft sie und schreibt neue und geänderte Tage (`lib/gebetszeiten/abgleich.ts`). Ohne eingerichtete
 * Quelle antwortet die Route mit `{ status: 'nicht_eingerichtet' }` und tut nichts.
 *
 * Aufruf: täglich per Vercel Cron als `GET` mit `Authorization: Bearer <CRON_SECRET>` (20 Uhr UTC, vor dem Neuladen der
 * Moschee-Anzeige nach Mitternacht) – nur, wenn der Abgleich in der Verwaltung eingeschaltet ist; von Hand als `POST` mit
 * `Authorization: Bearer <WARTUNG_TOKEN>`, mit `?trocken=1` als Probelauf ohne Schreiben. Die Sperre verhindert parallele
 * Läufe (`{ status: 'uebersprungen' }`). Cache-Tags nur bei Änderungen, je betroffenem Monat.
 */
export const maxDuration = 60;

async function laufe(o: { trocken: boolean; nurWennAktiv: boolean }): Promise<Response> {
  const ergebnis: AbgleichErgebnis = await gleicheAb(o);
  if (ergebnis.monate.length) {
    revalidateTag(TAG.gebetszeiten, { expire: 0 });
    for (const monat of ergebnis.monate) revalidateTag(TAG.gebetszeitenMonat(monat), { expire: 0 });
  }
  return Response.json(ergebnis, { headers: { 'Cache-Control': 'no-store' } });
}

/** Vercel Cron (CRON_SECRET). */
export async function GET(anfrage: Request) {
  await connection();
  if (!cronErlaubt(anfrage)) return new Response(null, { status: 401 });
  return laufe({ trocken: false, nurWennAktiv: true });
}

/**
 * Handaufruf (WARTUNG_TOKEN): `?trocken=1` schreibt nichts; `?nurAktiv=1` (lokaler Takt, betrieb/lokal/takt/takt.sh) läuft
 * wie der Cron nur bei eingeschaltetem Abgleich.
 */
export async function POST(anfrage: Request) {
  await connection();
  if (!wartungErlaubt(anfrage)) return new Response(null, { status: 401 });
  const parameter = new URL(anfrage.url).searchParams;
  return laufe({ trocken: parameter.get('trocken') === '1', nurWennAktiv: parameter.get('nurAktiv') === '1' });
}
