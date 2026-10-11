import 'server-only';
import { asc, desc, eq, isNotNull, isNull } from 'drizzle-orm';
import { z as zod } from 'zod';
import { db, schema } from '@/lib/db';

/**
 * Abfragen der Verwaltung „Kurse“ (V06). Nicht gecacht – Verwaltungsseiten sind dynamisch (ADR 0016).
 * Aufrufer prüfen vorher `verlangeSeitenRecht('kurs.lesen')`. Die Reihenfolge entspricht der öffentlichen Seite.
 */
const k = schema.kurs;

export type KursListenZeile = {
  id: string;
  titel: string;
  zielgruppe: string | null;
  zeiten: string | null;
  status: 'entwurf' | 'veroeffentlicht';
  verfuegbarkeit: 'voranmeldung' | 'ohne_anmeldung' | 'geschlossen';
  imPapierkorbSeit: Date | null;
  istBeispiel: boolean;
};

/**
 * Liste: aktive Kurse (Entwürfe und veröffentlichte) nach Reihenfolge und Adresse, oder der Papierkorb mit dem Datum des
 * Verschiebens (neueste zuerst).
 */
export async function ladeKursListe(papierkorb: boolean): Promise<KursListenZeile[]> {
  const sortierung = papierkorb ? [desc(k.imPapierkorbSeit), asc(k.slug)] : [asc(k.sortierung), asc(k.slug)];
  const zeilen = await db
    .select({
      id: k.id,
      titel: k.titel,
      zielgruppe: k.zielgruppe,
      zeiten: k.zeiten,
      status: k.status,
      verfuegbarkeit: k.verfuegbarkeit,
      imPapierkorbSeit: k.imPapierkorbSeit,
      istBeispiel: k.istBeispiel,
    })
    .from(k)
    .where(papierkorb ? isNotNull(k.imPapierkorbSeit) : isNull(k.imPapierkorbSeit))
    .orderBy(...sortierung);
  return zeilen.map((z) => ({
    id: z.id,
    titel: z.titel.de,
    zielgruppe: z.zielgruppe?.de ?? null,
    zeiten: z.zeiten?.de ?? null,
    status: z.status,
    verfuegbarkeit: z.verfuegbarkeit,
    imPapierkorbSeit: z.imPapierkorbSeit,
    istBeispiel: z.istBeispiel,
  }));
}

/** Ein Kurs zum Bearbeiten (auch im Papierkorb), sonst null. Ungültige IDs ergeben null, ohne die Datenbank zu fragen. */
export async function ladeKursFuerVerwaltung(id: string): Promise<typeof k.$inferSelect | null> {
  if (!zod.uuid().safeParse(id).success) return null;
  const [z] = await db.select().from(k).where(eq(k.id, id)).limit(1);
  return z ?? null;
}
