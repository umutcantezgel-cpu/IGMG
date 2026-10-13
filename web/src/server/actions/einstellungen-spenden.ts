'use server';

import { protokolliere } from '@/lib/audit';
import { inhaltGeaendert } from '@/lib/cache/aktualisieren';
import { TAG } from '@/lib/cache/tags';
import { db, schema } from '@/lib/db';
import { verlangeRecht, type Angemeldet } from '@/lib/rechte/pruefe';
import { EINSTELLUNG } from '@/lib/validierung/einstellungen';
import { spendenAusFormular, ZWECK_PLAETZE } from '@/lib/validierung/spenden';

/**
 * Einstellungen › Spenden (AUFTRAG 3.10, MN-13): Bankverbindung und Spendenzwecke für /spenden. Recht wie die übrigen
 * Einstellungen (`einstellung.bearbeiten`), Audit `einstellung.geaendert` (nur der Schlüssel, keine Bankdaten),
 * danach öffentlich sofort (Tag `einstellungen`). Ohne gültige IBAN zeigt /spenden den Platzhalter.
 */
export type SpendenZustand = {
  fehler?: 'pruefen' | 'keinRecht';
  feldFehler?: Record<string, string>;
  werte?: Record<string, string>;
  gespeichert?: number;
};

const FELDER = [
  'empfaenger',
  'iban',
  'bic',
  ...Array.from({ length: ZWECK_PLAETZE }, (_, i) =>
    ['TitelDe', 'TitelTr', 'TitelEn', 'BeschreibungDe', 'BeschreibungTr', 'BeschreibungEn', 'Verwendungszweck'].map((f) => `zweck${i}${f}`),
  ).flat(),
];

export async function speichereSpenden(_vorher: SpendenZustand, fd: FormData): Promise<SpendenZustand> {
  let a: Angemeldet;
  try {
    a = await verlangeRecht('einstellung.bearbeiten');
  } catch {
    return { fehler: 'keinRecht' };
  }
  const roh = Object.fromEntries(FELDER.map((f) => [f, String(fd.get(f) ?? '')]));
  const ergebnis = spendenAusFormular(roh);
  if (!ergebnis.ok) return { fehler: 'pruefen', feldFehler: ergebnis.feldFehler, werte: roh };
  const schluessel = EINSTELLUNG.spenden.schluessel;
  await db.transaction(async (tx) => {
    await tx
      .insert(schema.einstellung)
      .values({ schluessel, wert: ergebnis.wert, geaendertVon: a.benutzerId })
      .onConflictDoUpdate({
        target: schema.einstellung.schluessel,
        set: { wert: ergebnis.wert, geaendertAm: new Date(), geaendertVon: a.benutzerId },
      });
    await protokolliere({ benutzerId: a.benutzerId, aktion: 'einstellung.geaendert', zielTyp: 'einstellung', zielId: schluessel }, tx);
  });
  inhaltGeaendert(TAG.einstellungen);
  return { gespeichert: Date.now() };
}
