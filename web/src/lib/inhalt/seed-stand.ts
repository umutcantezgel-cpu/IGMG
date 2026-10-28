import { and, eq } from 'drizzle-orm';
import { protokolliere } from '@/lib/audit';
import type { Datenbank, Transaktion } from '@/lib/db';
import * as schema from '@/lib/db/schema';
import { stabil } from './stand-2026';

/**
 * Generischer Helfer für Stand-Migrationen von Seiteninhalten (ADR 0019, Muster aus `stand-2026.ts`): bringt Bereiche,
 * die noch **Beispielinhalt** tragen (`ist_beispiel = true`), auf den Stand der Seeds. Je Bereich gilt:
 * - fehlt die Zeile → Seed-Zeile einfügen (`ist_beispiel = true`, mit Quelle),
 * - Beispielinhalt mit anderem Inhalt (Vergleich über `stabil()`, unabhängig von der Schlüsselfolge in jsonb) → Seed-Stand,
 * - redaktionell gespeichert (`ist_beispiel = false`) → unberührt.
 * Jede Änderung schreibt einen Audit-Eintrag `inhalt.geaendert` mit `details.migration` (ohne Personendaten).
 * Idempotent: Ein zweiter Lauf ändert nichts und protokolliert nichts.
 */

/** Zielstand eines Bereichs: Seed-Inhalt (bereits gegen das Schema des Bereichs geprüft) und Quellenvermerk. */
export type SeedStand = { bereich: string; inhalt: unknown; quelle: string };

export type StandAusgang = 'eingefuegt' | 'aktualisiert' | 'unveraendert' | 'redaktionell';

/** Audit-Eintrag einer Inhaltsmigration (ohne Benutzer, ohne Personendaten). */
export async function protokolliereMigration(tx: Transaktion, migration: string, bereich: string, ausgang: StandAusgang) {
  await protokolliere(
    {
      benutzerId: null,
      aktion: 'inhalt.geaendert',
      zielTyp: 'seiteninhalt',
      zielId: bereich,
      details: { migration, ausgang },
    },
    tx,
  );
}

/** Bringt einen Bereich in der offenen Transaktion auf den Seed-Stand und meldet, was geschehen ist. */
export async function bringeAufSeedStand(tx: Transaktion, migration: string, stand: SeedStand): Promise<StandAusgang> {
  const [alt] = await tx
    .select({ inhalt: schema.seiteninhalt.inhalt, istBeispiel: schema.seiteninhalt.istBeispiel })
    .from(schema.seiteninhalt)
    .where(eq(schema.seiteninhalt.bereich, stand.bereich))
    .limit(1);
  if (!alt) {
    const neu = await tx
      .insert(schema.seiteninhalt)
      .values({ bereich: stand.bereich, inhalt: stand.inhalt, istBeispiel: true, quelle: stand.quelle })
      // Gleichzeitig angelegt (Verwaltung): deren Stand gewinnt
      .onConflictDoNothing({ target: schema.seiteninhalt.bereich })
      .returning({ bereich: schema.seiteninhalt.bereich });
    if (!neu.length) return 'redaktionell';
    await protokolliereMigration(tx, migration, stand.bereich, 'eingefuegt');
    return 'eingefuegt';
  }
  if (!alt.istBeispiel) return 'redaktionell';
  if (stabil(alt.inhalt) === stabil(stand.inhalt)) return 'unveraendert';
  const r = await tx
    .update(schema.seiteninhalt)
    // Nur solange es Beispielinhalt ist (gleichzeitiges Speichern in der Verwaltung gewinnt)
    .set({ inhalt: stand.inhalt, quelle: stand.quelle, aktualisiertVon: null })
    .where(and(eq(schema.seiteninhalt.bereich, stand.bereich), eq(schema.seiteninhalt.istBeispiel, true)))
    .returning({ bereich: schema.seiteninhalt.bereich });
  if (!r.length) return 'redaktionell';
  await protokolliereMigration(tx, migration, stand.bereich, 'aktualisiert');
  return 'aktualisiert';
}

/** Wendet mehrere Zielstände in **einer** Transaktion an (in der gegebenen Reihenfolge). Ergebnis je Bereich. */
export async function wendeSeedStaendeAn(
  db: Datenbank,
  migration: string,
  staende: readonly SeedStand[],
): Promise<Record<string, StandAusgang>> {
  return db.transaction(async (tx) => {
    const ergebnis: Record<string, StandAusgang> = {};
    for (const s of staende) ergebnis[s.bereich] = await bringeAufSeedStand(tx, migration, s);
    return ergebnis;
  });
}
