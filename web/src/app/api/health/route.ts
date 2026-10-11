import { sql } from 'drizzle-orm';
import { db } from '@/lib/db';

/** Health-Check (K-19): App läuft und Datenbank antwortet. Keine Details nach außen. */
export async function GET() {
  try {
    await db.execute(sql`select 1`);
    return Response.json({ status: 'ok' }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return Response.json({ status: 'fehler' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
