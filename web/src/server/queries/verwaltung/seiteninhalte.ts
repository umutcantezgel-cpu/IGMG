import 'server-only';
import { eq } from 'drizzle-orm';
import { type StandFuer, type VerwaltungBereich, type VerwaltungsStand } from '@/components/verwaltung/seiteninhalte/bereiche';
import { db, schema } from '@/lib/db';
import { SEITENINHALT } from '@/lib/validierung/seiteninhalte';

/** Zustand je Bereich für die Übersicht (ohne Cache: die Seite ist dynamisch, Aufrufer prüfen das Recht vorher). */
export type Zustand = { istBeispiel: boolean; aktualisiertAm: Date };

export async function ladeZustaende(): Promise<Map<string, Zustand>> {
  const zeilen = await db
    .select({
      bereich: schema.seiteninhalt.bereich,
      istBeispiel: schema.seiteninhalt.istBeispiel,
      aktualisiertAm: schema.seiteninhalt.aktualisiertAm,
    })
    .from(schema.seiteninhalt);
  return new Map(zeilen.map((z) => [z.bereich, { istBeispiel: z.istBeispiel, aktualisiertAm: z.aktualisiertAm }]));
}

/**
 * Stand eines Bereichs für die Bearbeitung. Fehlt die Zeile, gelten die Standardwerte des Schemas (`schema.parse({})`).
 * Passt die gespeicherte Fassung nicht mehr zum Schema, zeigt die Seite die Standardwerte und meldet `unlesbar`.
 */
export async function ladeSeiteninhaltFuerVerwaltung(bereich: VerwaltungBereich): Promise<VerwaltungsStand> {
  const [zeile] = await db
    .select({
      inhalt: schema.seiteninhalt.inhalt,
      istBeispiel: schema.seiteninhalt.istBeispiel,
      aktualisiertAm: schema.seiteninhalt.aktualisiertAm,
    })
    .from(schema.seiteninhalt)
    .where(eq(schema.seiteninhalt.bereich, bereich))
    .limit(1);
  const zod = SEITENINHALT[bereich];
  const geprueft = zeile ? zod.safeParse(zeile.inhalt) : null;
  const stand: StandFuer<VerwaltungBereich> = {
    bereich,
    inhalt: geprueft?.success ? geprueft.data : zod.parse({}),
    istBeispiel: zeile ? zeile.istBeispiel : true,
    aktualisiertAm: zeile ? zeile.aktualisiertAm : null,
    unlesbar: geprueft !== null && !geprueft.success,
  };
  // Die Zuordnung Bereich → Schema stimmt per Konstruktion; TypeScript sieht sie für die Union nicht.
  return stand as unknown as VerwaltungsStand;
}
