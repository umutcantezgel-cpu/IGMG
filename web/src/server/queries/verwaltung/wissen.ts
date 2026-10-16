import 'server-only';
import { and, asc, desc, eq, inArray, isNotNull, isNull } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { wissenUebersetzungsstand, type Uebersetzungsstand } from '@/lib/validierung/wissen';

/**
 * Verwaltung „Islamisches Wissen“ (F-40), ohne Cache. Aufrufer prüfen `wissen.bearbeiten`. Die Inhalte stammen von
 * Menschen und werden hier nur angezeigt.
 */
export type WissenThemaZeile = typeof schema.wissenThema.$inferSelect;

export type WissenListenZeile = {
  id: string;
  slug: string;
  titel: string;
  status: WissenThemaZeile['status'];
  freigabe: WissenThemaZeile['freigabe'];
  /** Bestand vor der Freigabepflicht: „geprüft“ ohne prüfende Person (Migration 0015). */
  bestand: boolean;
  /** Auf der Website sichtbar (veröffentlicht, geprüft, nicht im Papierkorb). */
  oeffentlich: boolean;
  sortierung: number;
  uebersetzung: Uebersetzungsstand;
  aktualisiertAm: Date;
  imPapierkorbSeit: Date | null;
};

const t = schema.wissenThema;

function zuListe(z: WissenThemaZeile): WissenListenZeile {
  return {
    id: z.id,
    slug: z.slug,
    titel: z.titel.de,
    status: z.status,
    freigabe: z.freigabe,
    bestand: z.freigabe === 'geprueft' && z.geprueftVon === null,
    oeffentlich: z.status === 'veroeffentlicht' && z.freigabe === 'geprueft' && z.imPapierkorbSeit === null,
    sortierung: z.sortierung,
    uebersetzung: wissenUebersetzungsstand(z),
    aktualisiertAm: z.aktualisiertAm,
    imPapierkorbSeit: z.imPapierkorbSeit,
  };
}

/** Themen in der Reihenfolge der Website; `papierkorb` = nur Themen im Papierkorb (neueste zuerst). */
export async function ladeWissensListe(papierkorb = false): Promise<WissenListenZeile[]> {
  const zeilen = papierkorb
    ? await db.select().from(t).where(isNotNull(t.imPapierkorbSeit)).orderBy(desc(t.imPapierkorbSeit))
    : await db.select().from(t).where(isNull(t.imPapierkorbSeit)).orderBy(asc(t.sortierung), asc(t.slug));
  return zeilen.map(zuListe);
}

export type WissenThemaVerwaltung = WissenThemaZeile & { verfasstVonName: string | null; geprueftVonName: string | null };

/** Ein Thema mit den Namen der verfassenden und der prüfenden Person; null, wenn es fehlt. */
export async function ladeWissensThemaVerwaltung(id: string): Promise<WissenThemaVerwaltung | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const [z] = await db.select().from(t).where(eq(t.id, id)).limit(1);
  if (!z) return null;
  const ids = [z.verfasstVon, z.geprueftVon].filter((x): x is string => Boolean(x));
  const namen = ids.length
    ? new Map(
        (await db.select({ id: schema.user.id, name: schema.user.name }).from(schema.user).where(inArray(schema.user.id, ids))).map((u) => [
          u.id,
          u.name,
        ]),
      )
    : new Map<string, string>();
  return {
    ...z,
    verfasstVonName: z.verfasstVon ? (namen.get(z.verfasstVon) ?? null) : null,
    geprueftVonName: z.geprueftVon ? (namen.get(z.geprueftVon) ?? null) : null,
  };
}

export type WissenPruefSchritt = {
  id: string;
  status: 'entwurf' | 'zur_pruefung' | 'geprueft';
  am: Date;
  von: string | null;
  kommentar: string | null;
};

/** Letzte Schritte der religiösen Prüfung eines Themas (neueste zuerst), z. B. der Kommentar beim Zurückweisen. */
export async function ladeWissensPruefVerlauf(id: string, grenze = 5): Promise<WissenPruefSchritt[]> {
  const f = schema.freigabe;
  return db
    .select({ id: f.id, status: f.status, am: f.am, von: schema.user.name, kommentar: f.kommentar })
    .from(f)
    .leftJoin(schema.user, eq(schema.user.id, f.von))
    .where(and(eq(f.inhaltTyp, 'wissen_thema'), eq(f.inhaltId, id)))
    .orderBy(desc(f.am), desc(f.id))
    .limit(grenze);
}
