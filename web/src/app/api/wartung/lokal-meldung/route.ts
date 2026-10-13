import { sql } from 'drizzle-orm';
import { connection } from 'next/server';
import { z } from 'zod';
import { db, schema } from '@/lib/db';
import { wartungErlaubt } from '@/lib/wartung/zugang';

/**
 * Meldungen des lokalen Helfer-Servers ans Startklar-Cockpit (ADR 0036): Sicherung, Wiederherstellungsprobe und
 * Medienspiegel melden Erfolg oder Fehler und die Größe. Gespeichert in der Einstellung `lokaler_server`
 * (je Art der letzte Stand); keine Personendaten. Nur mit `Authorization: Bearer <WARTUNG_TOKEN>`.
 */
const meldung = z.object({ art: z.enum(['sicherung', 'probe', 'spiegel']), ok: z.boolean(), bytes: z.number().int().min(0).max(1e13) });

export async function POST(anfrage: Request) {
  await connection();
  if (!wartungErlaubt(anfrage)) return new Response(null, { status: 401 });
  const p = meldung.safeParse(await anfrage.json().catch(() => null));
  if (!p.success) return new Response(null, { status: 400 });
  const eintrag = { [p.data.art]: { ok: p.data.ok, bytes: p.data.bytes, zeit: new Date().toISOString() } };
  await db
    .insert(schema.einstellung)
    .values({ schluessel: 'lokaler_server', wert: eintrag })
    .onConflictDoUpdate({
      target: schema.einstellung.schluessel,
      set: { wert: sql`${schema.einstellung.wert} || ${JSON.stringify(eintrag)}::jsonb` },
    });
  return Response.json({ gespeichert: true }, { headers: { 'Cache-Control': 'no-store' } });
}
