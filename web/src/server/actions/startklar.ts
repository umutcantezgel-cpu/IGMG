'use server';

import { refresh } from 'next/cache';
import { sql } from 'drizzle-orm';
import { z } from 'zod';
import { protokolliere } from '@/lib/audit';
import { inhaltGeaendert } from '@/lib/cache/aktualisieren';
import { TAG } from '@/lib/cache/tags';
import { db, schema } from '@/lib/db';
import { KeinRecht, verlangeRecht } from '@/lib/rechte/pruefe';

/**
 * Startklar-Cockpit (AUFTRAG V-11, MENSCHEN ML-03): Konzept-Hinweis ein- und ausschalten. Recht `einstellung.bearbeiten`
 * (wie die übrigen Einstellungen), Audit `einstellung.geaendert` mit Feldname und neuem Wert, aber ohne Personendaten.
 * Die Einstellung `allgemein` wird zusammengeführt (jsonb `||` in einer Anweisung), damit andere Felder bleiben.
 */
export type KonzepthinweisZustand = {
  fehler?: 'pruefen' | 'keinRecht';
  gespeichert?: number;
  /** Neuer Wert nach dem Speichern: `true` = Hinweis eingeschaltet. */
  wert?: boolean;
};

const eingabe = z.object({ konzepthinweis: z.enum(['true', 'false']) });

export async function setzeKonzepthinweis(_vorher: KonzepthinweisZustand, fd: FormData): Promise<KonzepthinweisZustand> {
  let a;
  try {
    a = await verlangeRecht('einstellung.bearbeiten');
  } catch (e) {
    // Nur die Rechteabweisung wird zur Rückmeldung; andere Fehler (z. B. Datenbank) bleiben Fehler.
    if (e instanceof KeinRecht) return { fehler: 'keinRecht' };
    throw e;
  }
  const p = eingabe.safeParse({ konzepthinweis: String(fd.get('konzepthinweis') ?? '') });
  if (!p.success) return { fehler: 'pruefen' };
  const wert = p.data.konzepthinweis === 'true';
  const teil = { konzepthinweis: wert };
  await db.transaction(async (tx) => {
    await tx
      .insert(schema.einstellung)
      .values({ schluessel: 'allgemein', wert: teil, geaendertVon: a.benutzerId })
      .onConflictDoUpdate({
        target: schema.einstellung.schluessel,
        set: {
          wert: sql`${schema.einstellung.wert} || ${JSON.stringify(teil)}::jsonb`,
          geaendertAm: new Date(),
          geaendertVon: a.benutzerId,
        },
      });
    await protokolliere(
      {
        benutzerId: a.benutzerId,
        aktion: 'einstellung.geaendert',
        zielTyp: 'einstellung',
        zielId: 'allgemein',
        details: { feld: 'konzepthinweis', wert },
      },
      tx,
    );
  });
  // Die öffentlichen Seiten lesen `allgemein` gecacht (Seitenrahmen); ihr Tag verfällt sofort und nach dem Nachlauf.
  inhaltGeaendert(TAG.einstellungen);
  // Das Cockpit selbst ist dynamisch: der Stand und die Schaltfläche werden neu gelesen.
  refresh();
  return { gespeichert: Date.now(), wert };
}
