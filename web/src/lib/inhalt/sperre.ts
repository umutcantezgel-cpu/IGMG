import { sql } from 'drizzle-orm';
import type { Transaktion } from '@/lib/db';

/**
 * Sperre der Inhaltsstände (Nachtrag ADR 0019 vom 28.10.2026): Die Stand-Migrationen (`inhalte-2026`, `inhalte-marktstart`)
 * und der Seed der KI-Entwürfe laufen je in einer Transaktion, die zuerst diese Transaktionssperre nimmt. Zwei Bauläufe
 * gegen dieselbe Datenbank laufen so nacheinander: Der zweite wartet und findet danach nichts mehr zu tun – ohne Sperre
 * lasen beide denselben Stand und meldeten bzw. protokollierten Änderungen doppelt. Die Sperre endet mit Commit oder
 * Rollback, auch bei einem Absturz. Fester Schlüssel wie die Migrationssperre (`scripts/migriere-mit-sperre.mjs`,
 * 4 242 017, dort eine Sitzungssperre), aber ein eigener: Eine Transaktionssperre hält auch hinter einem Pooler im
 * Transaktionsmodus. Unter PGlite (eine Sitzung) läuft sie immer durch.
 */
export const INHALTSSTAND_SPERRE = 4_242_018;

/** Nimmt die Sperre in der offenen Transaktion (wartet, bis ein anderer Lauf fertig ist). */
export async function sperreInhaltsstaende(tx: Pick<Transaktion, 'execute'>): Promise<void> {
  await tx.execute(sql`select pg_advisory_xact_lock(${INHALTSSTAND_SPERRE}::bigint)`);
}
