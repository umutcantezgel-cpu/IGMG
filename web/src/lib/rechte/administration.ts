import 'server-only';
import { sql } from 'drizzle-orm';
import { db, type Transaktion } from '@/lib/db';
import { zaehleAdministration } from '@/server/queries/verwaltung/benutzer';

/**
 * Letzte Administration (Tor B/C M3): Ändern und Zählen laufen in einer Transaktion unter einer gemeinsamen
 * Transaktionssperre. Gleichzeitige Änderungen (A entzieht B, B entzieht A) laufen so nacheinander; wer die Zahl der
 * nicht gesperrten Administrationskonten von ≥ 1 auf 0 bringen würde, wird zurückgerollt. Gezählt wird nach der
 * Änderung im selben `tx` – unabhängig von einem vorher geladenen Stand. Eigenes Modul (kein 'use server'), damit der
 * Schutz nie als Action aufrufbar ist.
 */
class LetzteAdministration extends Error {}
const SPERRE_ADMINISTRATION = 7_301_012;

/** true = gespeichert; false = abgelehnt, weil danach keine Administration mehr bliebe (nichts gespeichert). */
export async function mitAdministrationsSchutz(arbeit: (tx: Transaktion) => Promise<void>): Promise<boolean> {
  try {
    await db.transaction(async (tx) => {
      await tx.execute(sql`select pg_advisory_xact_lock(${SPERRE_ADMINISTRATION})`);
      const vorher = await zaehleAdministration(undefined, tx);
      await arbeit(tx);
      if (vorher > 0 && (await zaehleAdministration(undefined, tx)) === 0) throw new LetzteAdministration();
    });
    return true;
  } catch (e) {
    if (e instanceof LetzteAdministration) return false;
    throw e;
  }
}
