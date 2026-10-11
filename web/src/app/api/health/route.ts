import { sql } from 'drizzle-orm';
import { connection } from 'next/server';
import { db } from '@/lib/db';

/** Health-Check (K-19): App läuft und Datenbank antwortet – je Anfrage geprüft. Keine Details nach außen. */
export async function GET() {
  await connection();
  try {
    await db.execute(sql`select 1`);
    return Response.json({ status: 'ok' }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return Response.json({ status: 'fehler' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
