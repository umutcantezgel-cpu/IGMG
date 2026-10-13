import 'server-only';
import { and, asc, count, desc, eq, inArray, ne, type SQL } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { pruefeKette } from '@/lib/chat/hashkette';
import type { Mehrsprachig } from '@/lib/db/schema/typen';

/**
 * Verwaltung › Meldungen & Kinderschutz (S-08, S-10, S-11, S-17): Meldungen ohne Inhalt, Lage (Notfall-Pause,
 * Hash-Kette) und das Moderationsprotokoll. Der Kontext einer Meldung wird nur über `meldungsKontext` gelesen
 * (Einsicht im Protokoll). Nur für Rolle `kinderschutz` – nie über „Administration darf alles“ (ADR 0026).
 */
export type MeldungsStatus = (typeof schema.chatMeldungStatusEnum.enumValues)[number];
export type MeldungZeile = {
  id: string;
  grund: (typeof schema.chatMeldungGrundEnum.enumValues)[number];
  status: MeldungsStatus;
  erstelltAm: Date;
  bearbeitetAm: Date | null;
  kanalArt: 'gruppe' | 'eltern' | null;
  gruppe: string | null;
};

const gruppenName = (n: Mehrsprachig | null) => (n ? n.de || n.tr || n.en || null : null);

export async function ladeMeldungen(filter: { status?: MeldungsStatus | 'offen_alle' } = {}): Promise<MeldungZeile[]> {
  const bedingung: SQL | undefined =
    filter.status === 'offen_alle'
      ? ne(schema.chatMeldung.status, 'erledigt')
      : filter.status
        ? eq(schema.chatMeldung.status, filter.status)
        : undefined;
  const zeilen = await db
    .select({
      id: schema.chatMeldung.id,
      grund: schema.chatMeldung.grund,
      status: schema.chatMeldung.status,
      erstelltAm: schema.chatMeldung.erstelltAm,
      bearbeitetAm: schema.chatMeldung.bearbeitetAm,
      kanalArt: schema.chatKanal.art,
      gruppe: schema.gruppe.name,
    })
    .from(schema.chatMeldung)
    .leftJoin(schema.chatKanal, eq(schema.chatKanal.id, schema.chatMeldung.kanalId))
    .leftJoin(schema.gruppe, eq(schema.gruppe.id, schema.chatKanal.gruppeId))
    .where(bedingung)
    .orderBy(asc(schema.chatMeldung.status), desc(schema.chatMeldung.erstelltAm))
    .limit(200);
  return zeilen.map((z) => ({ ...z, gruppe: gruppenName(z.gruppe) }));
}

export type MeldungDetail = MeldungZeile & {
  kanalId: string | null;
  nachrichtId: number | null;
  kanalStatus: string | null;
  bearbeitetVon: string | null;
};

export async function ladeMeldung(id: string): Promise<MeldungDetail | null> {
  const [z] = await db
    .select({
      id: schema.chatMeldung.id,
      grund: schema.chatMeldung.grund,
      status: schema.chatMeldung.status,
      erstelltAm: schema.chatMeldung.erstelltAm,
      bearbeitetAm: schema.chatMeldung.bearbeitetAm,
      bearbeitetVon: schema.user.name,
      kanalId: schema.chatMeldung.kanalId,
      nachrichtId: schema.chatMeldung.nachrichtId,
      kanalArt: schema.chatKanal.art,
      kanalStatus: schema.chatKanal.status,
      gruppe: schema.gruppe.name,
    })
    .from(schema.chatMeldung)
    .leftJoin(schema.chatKanal, eq(schema.chatKanal.id, schema.chatMeldung.kanalId))
    .leftJoin(schema.gruppe, eq(schema.gruppe.id, schema.chatKanal.gruppeId))
    .leftJoin(schema.user, eq(schema.user.id, schema.chatMeldung.bearbeitetVon))
    .where(eq(schema.chatMeldung.id, id))
    .limit(1);
  return z ? { ...z, gruppe: gruppenName(z.gruppe) } : null;
}

export type KinderschutzLage = {
  notfallpause: boolean;
  offen: number;
  inBearbeitung: number;
  ketteIntakt: boolean;
  eintraege: number;
};

export async function ladeKinderschutzLage(): Promise<KinderschutzLage> {
  const [einstellungen, zaehler, zeilen] = await Promise.all([
    db
      .select({ schluessel: schema.einstellung.schluessel, wert: schema.einstellung.wert })
      .from(schema.einstellung)
      .where(inArray(schema.einstellung.schluessel, ['kinderschutz', 'moderationsprotokoll_anker'])),
    db
      .select({ status: schema.chatMeldung.status, anzahl: count() })
      .from(schema.chatMeldung)
      .where(ne(schema.chatMeldung.status, 'erledigt'))
      .groupBy(schema.chatMeldung.status),
    db.select().from(schema.moderationsprotokoll).orderBy(asc(schema.moderationsprotokoll.id)),
  ]);
  const wert = (s: string) => einstellungen.find((e) => e.schluessel === s)?.wert as Record<string, unknown> | undefined;
  const anker = wert('moderationsprotokoll_anker')?.hash;
  const bruch = pruefeKette(
    zeilen.map((z) => ({ ...z, zeitpunkt: z.zeitpunkt.toISOString() })),
    typeof anker === 'string' ? anker : undefined,
  );
  const anzahl = (s: MeldungsStatus) => Number(zaehler.find((z) => z.status === s)?.anzahl ?? 0);
  return {
    notfallpause: wert('kinderschutz')?.notfallpause === true,
    offen: anzahl('offen'),
    inBearbeitung: anzahl('in_bearbeitung'),
    ketteIntakt: bruch === null,
    eintraege: zeilen.length,
  };
}

export type ProtokollZeile = {
  id: number;
  zeitpunkt: Date;
  aktion: (typeof schema.moderationAktionEnum.enumValues)[number];
  grund: string;
  akteur: string | null;
  gruppe: string | null;
  kanalArt: 'gruppe' | 'eltern' | null;
};

/** Neueste Einträge des Moderationsprotokolls (ohne Chat-Inhalte; der Grund stammt von der handelnden Person). */
export async function ladeProtokoll(grenze = 200): Promise<ProtokollZeile[]> {
  const zeilen = await db
    .select({
      id: schema.moderationsprotokoll.id,
      zeitpunkt: schema.moderationsprotokoll.zeitpunkt,
      aktion: schema.moderationsprotokoll.aktion,
      grund: schema.moderationsprotokoll.grund,
      akteur: schema.user.name,
      gruppe: schema.gruppe.name,
      kanalArt: schema.chatKanal.art,
    })
    .from(schema.moderationsprotokoll)
    .leftJoin(schema.user, eq(schema.user.id, schema.moderationsprotokoll.akteurId))
    .leftJoin(schema.chatKanal, eq(schema.chatKanal.id, schema.moderationsprotokoll.kanalId))
    .leftJoin(schema.gruppe, eq(schema.gruppe.id, schema.chatKanal.gruppeId))
    .orderBy(desc(schema.moderationsprotokoll.id))
    .limit(grenze);
  return zeilen.map((z) => ({ ...z, gruppe: gruppenName(z.gruppe) }));
}

/** Für den Seitenleisten-Zähler: offene Meldungen. */
export async function zaehleOffeneMeldungen(): Promise<number> {
  const [z] = await db
    .select({ anzahl: count() })
    .from(schema.chatMeldung)
    .where(and(eq(schema.chatMeldung.status, 'offen')));
  return Number(z?.anzahl ?? 0);
}
