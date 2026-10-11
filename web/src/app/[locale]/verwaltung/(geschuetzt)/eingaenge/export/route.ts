import { connection } from 'next/server';
import { z } from 'zod';
import { protokolliere } from '@/lib/audit';
import { alsCsv, alsJson } from '@/lib/eingaenge/export';
import { KeinRecht, verlangeRecht } from '@/lib/rechte/pruefe';
import { ladeFuerExport, listenFilterSchema, sichtbarkeit } from '@/server/queries/verwaltung/eingaenge';

/**
 * Export der Eingänge (C08, V08, G-07): GET mit denselben Filtern wie die Liste (?art=&status=) und ?format=csv|json.
 * Nur mit Sitzung, zweitem Faktor und Leserecht der jeweiligen Arten; jeder Export schreibt `eingang.exportiert`
 * (Anzahl, Art, Format – keine Personendaten). Antwort nie zwischenspeichern.
 */
export async function GET(anfrage: Request) {
  await connection();
  let a;
  try {
    a = await verlangeRecht('verwaltung.betreten');
  } catch (f) {
    if (f instanceof KeinRecht) return new Response(null, { status: 403 });
    throw f;
  }
  if (!sichtbarkeit(a).arten.length) return new Response(null, { status: 403 });
  const url = new URL(anfrage.url);
  const filter = listenFilterSchema.parse(Object.fromEntries(url.searchParams));
  const id = z.uuid().safeParse(url.searchParams.get('id')).data;
  const format = url.searchParams.get('format') === 'json' ? 'json' : 'csv';
  const zeilen = await ladeFuerExport({ ...filter, id }, a);
  await protokolliere({
    benutzerId: a.benutzerId,
    aktion: 'eingang.exportiert',
    zielTyp: 'eingang',
    details: { anzahl: zeilen.length, art: filter.art ?? 'alle', status: filter.status ?? 'alle', format, einzeln: Boolean(id) },
  });
  const datum = new Date().toISOString().slice(0, 10);
  return new Response(format === 'json' ? alsJson(zeilen) : alsCsv(zeilen), {
    headers: {
      'Content-Type': format === 'json' ? 'application/json; charset=utf-8' : 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="eingaenge-${datum}.${format}"`,
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
