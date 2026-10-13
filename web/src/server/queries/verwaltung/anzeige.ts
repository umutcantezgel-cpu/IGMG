import 'server-only';
import { and, asc, count, desc, eq, inArray, isNull, ne, or } from 'drizzle-orm';
import { ANZEIGE_EINSTELLUNG, leseAnzeigeEinstellung } from '@/lib/anzeige/einstellung';
import { RELIGIOESE_FOLIEN, versBezug, type FolienInhalt } from '@/lib/anzeige/folien';
import type { AnzeigeEinstellungen } from '@/lib/anzeige/plan';
import { db, schema } from '@/lib/db';
import type { Mehrsprachig } from '@/lib/db/schema/typen';
import type { FreigabeStatus } from '@/lib/religioes/freigabe';

/**
 * Verwaltung › Anzeige (AUFTRAG 3.10): Folienliste mit Bezeichnung, Zeitplan, Sichtbarkeit und religiöser Freigabe,
 * einzelne Folie, Einstellung, Freigabe-Verlauf und Zähler offener Freigaben. Ungecacht (Verwaltungsseiten sind
 * dynamisch); Aufrufer prüfen vorher das Recht (`anzeige.bearbeiten` oder `religioes.freigeben`).
 */
const f = schema.anzeigeFolie;

export type FolieVerwaltung = {
  id: string;
  art: string;
  inhalt: FolienInhalt;
  mediumId: string | null;
  von: Date | null;
  bis: Date | null;
  wochentage: number[];
  reihenfolge: number;
  status: 'entwurf' | 'veroeffentlicht';
  freigabe: FreigabeStatus;
  verfasstVon: string | null;
  verfasstVonName: string | null;
  geprueftVonName: string | null;
  geprueftAm: Date | null;
  aktualisiertAm: Date;
  /** Bezeichnung für Listen: Titel, Bild-Alt-Text, Stelle („Sure 2:255“) oder Hadith-Nummer – ohne religiösen Text. */
  bezeichnung: { art: 'text'; titel: string } | { art: 'vers'; sure: string; bezug: string } | { art: 'hadith'; nummer: string };
};

async function namen(ids: readonly (string | null)[]): Promise<Map<string, string>> {
  const eindeutig = [...new Set(ids.filter((id): id is string => Boolean(id)))];
  if (!eindeutig.length) return new Map();
  const zeilen = await db
    .select({ id: schema.user.id, name: schema.user.name })
    .from(schema.user)
    .where(inArray(schema.user.id, eindeutig));
  return new Map(zeilen.map((z) => [z.id, z.name]));
}

async function anreichern(zeilen: (typeof f.$inferSelect)[]): Promise<FolieVerwaltung[]> {
  const inhalt = (z: typeof f.$inferSelect) => z.inhalt as FolienInhalt;
  const mediumIds = zeilen.filter((z) => z.art === 'bild' && z.mediumId).map((z) => z.mediumId!);
  const suren = [...new Set(zeilen.filter((z) => z.art === 'vers').map((z) => (inhalt(z) as { sure: number }).sure))];
  const [medien, surenNamen, personen] = await Promise.all([
    mediumIds.length
      ? db
          .select({ id: schema.medium.id, alt: schema.medium.alt, dateiname: schema.medium.dateiname })
          .from(schema.medium)
          .where(inArray(schema.medium.id, mediumIds))
      : Promise.resolve([]),
    suren.length
      ? db
          .select({ nr: schema.quranSure.nr, umschrift: schema.quranSure.nameUmschrift })
          .from(schema.quranSure)
          .where(inArray(schema.quranSure.nr, suren))
      : Promise.resolve([]),
    namen(zeilen.flatMap((z) => [z.verfasstVon, z.geprueftVon])),
  ]);
  return zeilen.map((z) => {
    const i = inhalt(z);
    let bezeichnung: FolieVerwaltung['bezeichnung'];
    if (i.art === 'vers') {
      const name = surenNamen.find((s) => s.nr === i.sure)?.umschrift;
      bezeichnung = { art: 'vers', sure: name ?? String(i.sure), bezug: versBezug(i.sure, i.von, i.bis) };
    } else if (i.art === 'hadith') bezeichnung = { art: 'hadith', nummer: i.nummer };
    else if (i.art === 'bild') {
      const m = medien.find((x) => x.id === z.mediumId);
      bezeichnung = { art: 'text', titel: i.titel?.de || m?.alt.de || m?.dateiname || '–' };
    } else bezeichnung = { art: 'text', titel: (i as { titel?: Mehrsprachig }).titel?.de ?? '–' };
    return {
      id: z.id,
      art: z.art,
      inhalt: i,
      mediumId: z.mediumId,
      von: z.von,
      bis: z.bis,
      wochentage: z.wochentage,
      reihenfolge: z.reihenfolge,
      status: z.status,
      freigabe: z.freigabe,
      verfasstVon: z.verfasstVon,
      verfasstVonName: z.verfasstVon ? (personen.get(z.verfasstVon) ?? null) : null,
      geprueftVonName: z.geprueftVon ? (personen.get(z.geprueftVon) ?? null) : null,
      geprueftAm: z.geprueftAm,
      aktualisiertAm: z.aktualisiertAm,
      bezeichnung,
    };
  });
}

/** Alle Folien in der Reihenfolge der Anzeige. */
export async function ladeFolienListe(): Promise<FolieVerwaltung[]> {
  const zeilen = await db.select().from(f).orderBy(asc(f.reihenfolge), asc(f.erstelltAm));
  return anreichern(zeilen);
}

export async function ladeFolie(id: string): Promise<FolieVerwaltung | null> {
  const [z] = await db.select().from(f).where(eq(f.id, id)).limit(1);
  return z ? (await anreichern([z]))[0] : null;
}

/** Einstellung der Anzeige (ungecacht, für das Formular). */
export async function ladeAnzeigeEinstellungVerwaltung(): Promise<AnzeigeEinstellungen> {
  const [z] = await db
    .select({ wert: schema.einstellung.wert })
    .from(schema.einstellung)
    .where(eq(schema.einstellung.schluessel, ANZEIGE_EINSTELLUNG))
    .limit(1);
  return leseAnzeigeEinstellung(z?.wert);
}

/** Zähler der Seitenleiste: religiöse Folien „zur Prüfung“, die diese Person prüfen darf (nicht selbst verfasst). */
export async function zaehleOffeneFolien(benutzerId: string): Promise<number> {
  const [z] = await db
    .select({ n: count() })
    .from(f)
    .where(
      and(
        inArray(f.art, [...RELIGIOESE_FOLIEN] as ('vers' | 'hadith')[]),
        eq(f.freigabe, 'zur_pruefung'),
        or(isNull(f.verfasstVon), ne(f.verfasstVon, benutzerId)),
      ),
    );
  return Number(z?.n ?? 0);
}

export type FolienVerlauf = { status: FreigabeStatus; am: Date; von: string | null; kommentar: string | null };

/** Freigabe-Verlauf einer religiösen Folie (neueste zuerst). */
export async function ladeFolienVerlauf(id: string, grenze = 10): Promise<FolienVerlauf[]> {
  const v = schema.freigabe;
  const zeilen = await db
    .select({ status: v.status, am: v.am, von: v.von, kommentar: v.kommentar })
    .from(v)
    .where(and(eq(v.inhaltTyp, 'anzeige_folie'), eq(v.inhaltId, id)))
    .orderBy(desc(v.am), desc(v.id))
    .limit(grenze);
  const wer = await namen(zeilen.map((z) => z.von));
  return zeilen.map((z) => ({ ...z, von: z.von ? (wer.get(z.von) ?? null) : null }));
}
