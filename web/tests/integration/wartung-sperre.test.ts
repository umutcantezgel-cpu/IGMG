import { sql } from 'drizzle-orm';
import { afterAll, describe, expect, it } from 'vitest';
import { db } from '@/lib/db';
import { mitSperre, sperrSchluessel } from '@/lib/wartung/sperre';
import { verwaltungsUmgebung } from './hilfen/verwaltung';

/**
 * V-06: Die Sperre für Wartungsläufe unter PGlite. PGlite hat nur eine Sitzung, und Advisory-Locks gelten je Sitzung,
 * deshalb ist jede Sperre für denselben Aufrufer wiedereintretend und kann nie „belegt“ sein. Der Test belegt das und
 * prüft den Rückfall „ohne Sperre“ (Kommentar in src/lib/wartung/sperre.ts). Die echte Belegung über zwei Sitzungen
 * läuft gegen PostgreSQL in `wartung-sperre-postgres.test.ts`.
 */
const { client } = await verwaltungsUmgebung();
afterAll(() => client.close());

type Zeile = { frei?: boolean };
const zeilen = async (abfrage: ReturnType<typeof sql>) => ((await db.execute(abfrage)) as unknown as { rows: Zeile[] }).rows;

describe('PGlite: Advisory-Locks gelten je Sitzung', () => {
  it('die Sperrfunktion läuft, und dieselbe Sitzung bekommt dieselbe Sperre immer wieder', async () => {
    const k = sperrSchluessel('pglite-probe').toString();
    const erster = await zeilen(sql`select pg_try_advisory_lock(${k}::bigint) as frei`);
    const zweiter = await zeilen(sql`select pg_try_advisory_lock(${k}::bigint) as frei`);
    expect(erster[0].frei).toBe(true);
    expect(zweiter[0].frei).toBe(true);
    await db.execute(sql`select pg_advisory_unlock_all()`);
  });

  it('der Schlüssel ist stabil je Name und verschieden für verschiedene Namen', () => {
    expect(sperrSchluessel('loeschfristen')).toBe(sperrSchluessel('loeschfristen'));
    expect(sperrSchluessel('loeschfristen')).not.toBe(sperrSchluessel('mail-ausgang'));
    expect(typeof sperrSchluessel('x')).toBe('bigint');
  });
});

describe('PGlite: mitSperre läuft ohne Sperre', () => {
  it('führt die Arbeit aus und meldet sie als ausgeführt', async () => {
    expect(await mitSperre('pglite-ohne-sperre', async () => 42)).toEqual({ uebersprungen: false, ergebnis: 42 });
  });

  it('ein verschachtelter Aufruf mit demselben Namen läuft ebenfalls (keine Sperre unter PGlite)', async () => {
    const aussen = await mitSperre('pglite-verschachtelt', () => mitSperre('pglite-verschachtelt', async () => 'innen'));
    expect(aussen).toEqual({ uebersprungen: false, ergebnis: { uebersprungen: false, ergebnis: 'innen' } });
  });

  it('gibt einen Fehler der Arbeit unverändert weiter', async () => {
    await expect(
      mitSperre('pglite-fehler', async () => {
        throw new Error('Testfehler');
      }),
    ).rejects.toThrow('Testfehler');
  });
});
