import 'server-only';
import { eq } from 'drizzle-orm';
import { db, schema } from '@/lib/db';

/**
 * Neue Sitzung (Better-Auth-Hook in `src/lib/auth/server.ts`): letzte Anmeldung eines Gemeinde-Kontos merken; eine
 * offene Vorwarnung wegen Inaktivität erledigt sich damit (DSFA D-16, `src/lib/konto/inaktiv.ts`). Eigenes kleines
 * Modul ohne weitere Abhängigkeiten, damit die Auth-Konfiguration keinen Kreis über Mail und Löschlauf zieht.
 * Fehler brechen die Anmeldung nie ab.
 */
export async function merkeAnmeldung(benutzerId: string, jetzt = new Date()): Promise<void> {
  try {
    await db
      .update(schema.kontoProfil)
      .set({ letzteAnmeldung: jetzt, inaktivGewarntAm: null })
      .where(eq(schema.kontoProfil.benutzerId, benutzerId));
  } catch {
    // Anmeldung geht vor; die Frist rechnet notfalls ab der vorigen Anmeldung
  }
}
