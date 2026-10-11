import 'server-only';
import { createHash } from 'node:crypto';
import { sql } from 'drizzle-orm';
import { Pool } from 'pg';
import { db, type Datenbank } from '@/lib/db';

/**
 * Sperre für Wartungsläufe (Vercel kann einen Cron-Lauf auslassen oder doppelt auslösen, Tor V-06).
 *
 * PostgreSQL: `pg_try_advisory_xact_lock` mit einem stabilen Schlüssel aus dem Namen, gehalten von einer
 * Transaktion. Ist die Sperre schon belegt, wartet der zweite Lauf nicht, sondern meldet `uebersprungen`.
 * Die Sperre endet mit dem Commit oder Rollback der Transaktion, auch bei einem Absturz; es bleibt nichts hängen.
 *
 * PGlite (Entwicklung, Tests, Bau): Eine Sperre gilt je Datenbanksitzung, und PGlite hat nur eine Sitzung. Dort ist
 * jede Sperre für denselben Aufrufer wiedereintretend (Integrationstest `wartung-sperre.test.ts`), sie könnte also nie
 * belegt sein. Deshalb läuft die Aufgabe unter PGlite ohne Sperre. Das ist nur für Entwicklung und Tests so; im Betrieb
 * ist `DATABASE_URL` gesetzt und die Sperre wirkt.
 */
export type SperreErgebnis<T> = { uebersprungen: true } | { uebersprungen: false; ergebnis: T };

/** Stabiler 64-Bit-Schlüssel aus dem Namen (SHA-256, Präfix „igmg:wartung:“ grenzt von anderen Sperren ab). */
export function sperrSchluessel(name: string): bigint {
  return createHash('sha256').update(`igmg:wartung:${name}`, 'utf8').digest().readBigInt64BE(0);
}

/** Nur der Pool des Betriebs (`pg`) kann Sperren über mehrere Sitzungen hinweg sicher halten. */
function sperreMoeglich(datenbank: Datenbank): boolean {
  // drizzle setzt `$client` zur Laufzeit; der Typ von `Datenbank` weist es nicht aus.
  return (datenbank as unknown as { $client?: unknown }).$client instanceof Pool;
}

/**
 * Führt `fn` nur aus, wenn die Sperre `name` frei ist. Die Transaktion hält die Sperre während der Arbeit; die Arbeit
 * selbst läuft auf eigenen Verbindungen des Pools. Gibt `uebersprungen: true` zurück, wenn ein anderer Lauf die Sperre hält.
 */
export async function mitSperre<T>(name: string, fn: () => Promise<T>, datenbank: Datenbank = db): Promise<SperreErgebnis<T>> {
  if (!sperreMoeglich(datenbank)) return { uebersprungen: false, ergebnis: await fn() };
  return datenbank.transaction(async (tx) => {
    const { rows } = await tx.execute(sql`select pg_try_advisory_xact_lock(${sperrSchluessel(name).toString()}::bigint) as frei`);
    if (!(rows[0] as { frei?: boolean } | undefined)?.frei) return { uebersprungen: true as const };
    return { uebersprungen: false as const, ergebnis: await fn() };
  });
}
