import { revalidateTag } from 'next/cache';
import { connection } from 'next/server';
import { TAG } from '@/lib/cache/tags';
import { gleicheDachverbandAb, type DachverbandAbgleichErgebnis } from '@/lib/dachverband/abgleich';
import { cronErlaubt, wartungErlaubt } from '@/lib/wartung/zugang';

/**
 * Abgleich „Aus dem Dachverband“ (Plan Marktstart P3, ADR 0046): holt den Hutba-Feed der IGMG und übernimmt neue
 * Freitagspredigten in den Seiteninhalt `dachverband` (`lib/dachverband/abgleich.ts`). Vorhandene und von der Redaktion
 * ausgeblendete Einträge bleiben unberührt. Nur Titel, Datum und Link – kein Text der Predigt (G-06).
 *
 * Aufruf: täglich per Vercel Cron als `GET` mit `Authorization: Bearer <CRON_SECRET>` (4 Uhr UTC: Die IGMG veröffentlicht
 * meist donnerstags, die Predigt steht damit vor dem Freitagsgebet auf der Seite); von Hand und aus dem lokalen Takt
 * (betrieb/lokal/takt/takt.sh) als `POST` mit `Authorization: Bearer <WARTUNG_TOKEN>`, mit `?trocken=1` als Probelauf ohne
 * Schreiben. Die Sperre verhindert parallele Läufe (`{ status: 'uebersprungen' }`). Der Cache-Tag des Seiteninhalts
 * verfällt nur, wenn geschrieben wurde.
 */
export const maxDuration = 30;

async function laufe(trocken: boolean): Promise<Response> {
  const ergebnis: DachverbandAbgleichErgebnis = await gleicheDachverbandAb({ trocken });
  if (ergebnis.geaendert) revalidateTag(TAG.seiteninhalt('dachverband'), { expire: 0 });
  // Für das Protokoll genügen Zähler und Kennungen; die Einträge selbst gehören nicht in die Antwort
  const { neueEintraege, ...zaehler } = ergebnis;
  return Response.json(
    { ...zaehler, neueSchluessel: neueEintraege.map((e) => e.schluessel) },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}

/** Vercel Cron (CRON_SECRET). */
export async function GET(anfrage: Request) {
  await connection();
  if (!cronErlaubt(anfrage)) return new Response(null, { status: 401 });
  return laufe(false);
}

/** Handaufruf (WARTUNG_TOKEN): `?trocken=1` schreibt nichts. */
export async function POST(anfrage: Request) {
  await connection();
  if (!wartungErlaubt(anfrage)) return new Response(null, { status: 401 });
  return laufe(new URL(anfrage.url).searchParams.get('trocken') === '1');
}
