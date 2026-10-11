import { sql } from 'drizzle-orm';
import { connection } from 'next/server';
import { db } from '@/lib/db';

/** Hängt die Datenbank, antwortet die Route nach dieser Zeit mit 503 statt bis zum Funktionslimit zu warten. */
const ZEITLIMIT_MS = 5_000;

/** Health-Check (K-19): App läuft und Datenbank antwortet – je Anfrage geprüft. Keine Details nach außen. */
export async function GET() {
  await connection();
  let uhr: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      db.execute(sql`select 1`),
      new Promise((_, abbruch) => {
        uhr = setTimeout(() => abbruch(new Error('Zeitlimit')), ZEITLIMIT_MS);
      }),
    ]);
    return Response.json({ status: 'ok' }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return Response.json({ status: 'fehler' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  } finally {
    clearTimeout(uhr);
  }
}
