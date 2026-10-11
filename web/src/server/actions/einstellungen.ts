'use server';

import { protokolliere } from '@/lib/audit';
import { db, schema } from '@/lib/db';
import { EINGANG_ARTEN } from '@/lib/eingaenge/arten';
import { FRISTEN_SCHLUESSEL, fristenSchema } from '@/lib/eingaenge/fristen';
import { verlangeRecht } from '@/lib/rechte/pruefe';

/** Einstellungen › Löschfristen (C16, M-050): Recht `einstellung.bearbeiten`, Audit `einstellung.geaendert` (nur der Schlüssel). */
export type FristenZustand = { fehler?: 'pruefen' | 'keinRecht'; gespeichert?: number; werte?: Record<string, string> };

export async function speichereLoeschfristen(_vorher: FristenZustand, fd: FormData): Promise<FristenZustand> {
  let a;
  try {
    a = await verlangeRecht('einstellung.bearbeiten');
  } catch {
    return { fehler: 'keinRecht' };
  }
  const roh = Object.fromEntries(EINGANG_ARTEN.map((art) => [art, String(fd.get(art) ?? '')]));
  const p = fristenSchema.safeParse(roh);
  if (!p.success) return { fehler: 'pruefen', werte: roh };
  await db.transaction(async (tx) => {
    await tx
      .insert(schema.einstellung)
      .values({ schluessel: FRISTEN_SCHLUESSEL, wert: p.data, geaendertVon: a.benutzerId })
      .onConflictDoUpdate({
        target: schema.einstellung.schluessel,
        set: { wert: p.data, geaendertAm: new Date(), geaendertVon: a.benutzerId },
      });
    await protokolliere(
      { benutzerId: a.benutzerId, aktion: 'einstellung.geaendert', zielTyp: 'einstellung', zielId: FRISTEN_SCHLUESSEL },
      tx,
    );
  });
  return { gespeichert: Date.now() };
}
