import type { holeDb } from '../../../src/lib/db';

/** Datenbank für Seeds (PostgreSQL oder PGlite). */
export type SeedDb = ReturnType<typeof holeDb>;

/**
 * Seed eines Bereichs (E-027, ADR 0015): idempotent (onConflictDoNothing), Inhalte aus Bestand/Design mit
 * `quelle`, Beispielinhalte `istBeispiel: true`, keine echten Personendaten (G-04). Rückgabe: Anzahl neuer Zeilen.
 */
export type BereichsSeed = (db: SeedDb) => Promise<number>;
