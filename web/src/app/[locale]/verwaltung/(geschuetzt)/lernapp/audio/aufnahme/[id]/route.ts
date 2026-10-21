import { eq } from 'drizzle-orm';
import { connection } from 'next/server';
import { db, schema } from '@/lib/db';
import { datenbankVerfuegbar } from '@/lib/db/verfuegbar';
import { funktionAn } from '@/lib/funktionen';
import { KeinRecht, verlangeRecht } from '@/lib/rechte/pruefe';
import { speicher } from '@/lib/storage';

const NICHT_DA = { status: 404, headers: { 'Cache-Control': 'no-store' } };

/**
 * Rohaufnahme des Audio-Studios anhören (L3-06): nur mit Sitzung, zweitem Faktor und `lernapp.audio.bearbeiten`, Schalter
 * `lernapp`. Die Datei liegt im privaten Speicher (nicht über `/medien`); Typ aus der Datenbank (beim Speichern über die
 * Magic Bytes bestimmt). Nie zwischengespeichert, kein Audit (nur Lesen der eigenen Werkstatt, wie die Rezitationen).
 */
export async function GET(_anfrage: Request, { params }: RouteContext<'/[locale]/verwaltung/lernapp/audio/aufnahme/[id]'>) {
  await connection();
  if (!datenbankVerfuegbar()) return new Response(null, NICHT_DA);
  try {
    await verlangeRecht('lernapp.audio.bearbeiten');
  } catch (e) {
    if (e instanceof KeinRecht) return new Response(null, { status: 403, headers: { 'Cache-Control': 'no-store' } });
    throw e;
  }
  if (!(await funktionAn('lernapp'))) return new Response(null, NICHT_DA);
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) return new Response(null, NICHT_DA);
  const [z] = await db
    .select({
      pfad: schema.lernappAufnahme.pfad,
      mime: schema.lernappAufnahme.mime,
      bytes: schema.lernappAufnahme.bytes,
      status: schema.lernappAufnahme.status,
    })
    .from(schema.lernappAufnahme)
    .where(eq(schema.lernappAufnahme.id, id))
    .limit(1);
  if (!z || z.status === 'verworfen') return new Response(null, NICHT_DA);
  const strom = await speicher().lies(z.pfad);
  if (!strom) return new Response(null, NICHT_DA);
  return new Response(strom, {
    headers: {
      'Content-Type': z.mime,
      'Content-Length': String(z.bytes),
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
