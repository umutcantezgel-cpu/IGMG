import 'server-only';
import { sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { datenbankVerfuegbar } from '@/lib/db/verfuegbar';

/**
 * Stand des lokalen Helfer-Servers (ADR 0036) in der Einstellung `lokaler_server`: je Art der letzte Lauf
 * (`{ ok, bytes, zeit }`). Sicherung, Wiederherstellungsprobe und Medienspiegel melden über `/api/wartung/lokal-meldung`,
 * der Minutentakt hinterlässt bei jedem Aufruf ein Lebenszeichen – höchstens alle 5 Minuten geschrieben.
 * Keine Personendaten. Das Startklar-Cockpit liest den Stand (src/lib/startklar/gemeinde.ts).
 */
export type LokalArt = 'sicherung' | 'probe' | 'spiegel' | 'takt';
export type LokalEintrag = { ok: boolean; bytes: number; zeit: string };

export async function meldeLokal(art: LokalArt, ok: boolean, bytes = 0, jetzt = new Date()): Promise<void> {
  const eintrag = JSON.stringify({ [art]: { ok, bytes, zeit: jetzt.toISOString() } satisfies LokalEintrag });
  await db.execute(sql`insert into einstellung (schluessel, wert) values ('lokaler_server', ${eintrag}::jsonb)
    on conflict (schluessel) do update set wert = einstellung.wert || ${eintrag}::jsonb, geaendert_am = now()`);
}

/** Lebenszeichen des Takts: nur, wenn das letzte älter als 5 Minuten ist (eine Schreibung statt 60 je Stunde). */
export async function meldeTakt(jetzt = new Date()): Promise<void> {
  if (!datenbankVerfuegbar()) return;
  const eintrag = JSON.stringify({ takt: { ok: true, bytes: 0, zeit: jetzt.toISOString() } satisfies LokalEintrag });
  await db.execute(sql`insert into einstellung (schluessel, wert) values ('lokaler_server', ${eintrag}::jsonb)
    on conflict (schluessel) do update set wert = einstellung.wert || ${eintrag}::jsonb, geaendert_am = now()
    where coalesce((einstellung.wert->'takt'->>'zeit')::timestamptz, 'epoch'::timestamptz)
      < ${jetzt.toISOString()}::timestamptz - interval '5 minutes'`);
}
