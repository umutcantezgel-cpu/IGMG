import 'server-only';
import { and, desc, eq, inArray, isNotNull, isNull, sql } from 'drizzle-orm';
import { z as zod } from 'zod';
import { db, schema } from '@/lib/db';
import type { Prioritaet } from '@/lib/validierung/ankuendigung';

/**
 * Abfragen der Verwaltung „Ankündigungen“ (V04). Nicht gecacht – Verwaltungsseiten sind dynamisch (ADR 0016).
 * Aufrufer prüfen vorher `verlangeSeitenRecht('ankuendigung.lesen')`.
 */
const v = schema.ankuendigung;

type Organisation = 'at' | 'kt' | 'gt' | 'kgt';
export type Zustand = 'entwurf' | 'geplant' | 'aktiv' | 'abgelaufen';

/**
 * Zustand zum Zeitpunkt `jetzt` (V04): ein Entwurf ist immer Entwurf; veröffentlicht ist abgelaufen, sobald das Ende
 * erreicht ist, geplant, solange der Beginn noch bevorsteht, sonst aktiv.
 */
export function zustandAm(
  z: { status: 'entwurf' | 'veroeffentlicht'; sichtbarAb: Date | null; laeuftAb: Date | null },
  jetzt: Date,
): Zustand {
  if (z.status !== 'veroeffentlicht') return 'entwurf';
  if (z.laeuftAb && z.laeuftAb.getTime() <= jetzt.getTime()) return 'abgelaufen';
  if (z.sichtbarAb && z.sichtbarAb.getTime() > jetzt.getTime()) return 'geplant';
  return 'aktiv';
}

export type AnkuendigungZeile = {
  id: string;
  titel: string;
  prioritaet: Prioritaet;
  organisation: Organisation | null;
  status: 'entwurf' | 'veroeffentlicht';
  zustand: Zustand;
  sichtbarAb: Date | null;
  laeuftAb: Date | null;
  imPapierkorbSeit: Date | null;
  istBeispiel: boolean;
};

const RANG_ZUSTAND: Record<Zustand, number> = { aktiv: 0, geplant: 1, entwurf: 2, abgelaufen: 3 };
const RANG_PRIORITAET: Record<Prioritaet, number> = { hoch: 0, mittel: 1, niedrig: 2 };

/**
 * Liste: aktuelle Ankündigungen (ohne Papierkorb) oder der Papierkorb. Aktuelle zuerst nach Zustand, dann nach
 * Priorität, innerhalb gleicher Stufe neueste zuerst. `organisationen` (Organisationsredaktion, K-06): nur diese
 * Organisationen; null = alle.
 */
export async function ladeVerwaltungsListe(
  papierkorb: boolean,
  organisationen: readonly Organisation[] | null = null,
  jetzt = new Date(),
): Promise<AnkuendigungZeile[]> {
  const zeilen = await db
    .select({
      id: v.id,
      titel: v.titel,
      prioritaet: v.prioritaet,
      organisation: v.organisation,
      status: v.status,
      sichtbarAb: v.sichtbarAb,
      laeuftAb: v.laeuftAb,
      imPapierkorbSeit: v.imPapierkorbSeit,
      istBeispiel: v.istBeispiel,
    })
    .from(v)
    .where(
      and(
        papierkorb ? isNotNull(v.imPapierkorbSeit) : isNull(v.imPapierkorbSeit),
        organisationen ? (organisationen.length ? inArray(v.organisation, [...organisationen]) : sql`false`) : undefined,
      ),
    )
    .orderBy(papierkorb ? desc(v.imPapierkorbSeit) : desc(v.erstelltAm));
  const liste: AnkuendigungZeile[] = zeilen.map((z) => ({
    id: z.id,
    titel: z.titel.de,
    prioritaet: z.prioritaet,
    organisation: z.organisation,
    status: z.status,
    zustand: zustandAm(z, jetzt),
    sichtbarAb: z.sichtbarAb,
    laeuftAb: z.laeuftAb,
    imPapierkorbSeit: z.imPapierkorbSeit,
    istBeispiel: z.istBeispiel,
  }));
  if (papierkorb) return liste;
  // Array.sort ist stabil: Innerhalb gleicher Stufe bleibt die Reihenfolge „neueste zuerst“ aus der Abfrage erhalten.
  return liste.sort(
    (a, b) => RANG_ZUSTAND[a.zustand] - RANG_ZUSTAND[b.zustand] || RANG_PRIORITAET[a.prioritaet] - RANG_PRIORITAET[b.prioritaet],
  );
}

/** Ein Datensatz zum Bearbeiten (auch im Papierkorb), sonst null. */
export async function ladeAnkuendigungFuerVerwaltung(id: string) {
  if (!zod.uuid().safeParse(id).success) return null;
  const [z] = await db.select().from(v).where(eq(v.id, id)).limit(1);
  return z ?? null;
}
