import 'server-only';
import { and, asc, count, desc, eq, exists, gt, inArray, isNotNull, isNull, or, sql, type SQL } from 'drizzle-orm';
import { z } from 'zod';
import { protokolliere } from '@/lib/audit';
import { db, schema } from '@/lib/db';
import { GEMEINDE_ROLLEN, type GemeindeRolleArt } from '@/lib/lernen/verwaltung';
import type { Angemeldet } from '@/lib/rechte/pruefe';

/**
 * Verwaltung „Gemeinde-Konten“ (H-L05, ADR 0026): Konten mit Gemeinde-Rollen oder Gemeinde-Profil (auch noch nicht
 * bestätigte Registrierungen). Namen und Adressen sind Personendaten – jeder Abruf der Liste und jedes Detail steht im
 * Audit-Log (`gemeindekonto.gelesen`). Kinderkonten zeigen den Benutzernamen statt der synthetischen Adresse.
 * Aufrufer prüfen vorher `verlangeSeitenRecht('gemeindekonto.lesen')`.
 */
const u = schema.user;

export const kontenFilterSchema = z.object({
  rolle: z
    .enum([...GEMEINDE_ROLLEN, 'alle'])
    .catch('alle')
    .default('alle'),
  zustand: z.enum(['alle', 'gesperrt', 'loeschantrag', 'unbestaetigt']).catch('alle').default('alle'),
});
export type KontenFilter = z.infer<typeof kontenFilterSchema>;

export type KontoZeile = {
  id: string;
  name: string;
  kennung: string;
  istKind: boolean;
  rollen: GemeindeRolleArt[];
  verwaltung: boolean;
  zweiFaktor: boolean;
  bestaetigt: boolean;
  gesperrtAm: Date | null;
  loeschenAb: Date | null;
  erstelltAm: Date;
};

/** Gemeinde-Konto: mindestens eine Gemeinde-Rolle oder ein Gemeinde-Profil. */
const istGemeindeKonto = () =>
  or(
    exists(
      db
        .select({ x: sql`1` })
        .from(schema.gemeindeRolle)
        .where(eq(schema.gemeindeRolle.benutzerId, u.id)),
    ),
    exists(
      db
        .select({ x: sql`1` })
        .from(schema.kontoProfil)
        .where(eq(schema.kontoProfil.benutzerId, u.id)),
    ),
  );

async function anreichern(
  zeilen: {
    id: string;
    name: string;
    email: string;
    benutzername: string | null;
    zweiFaktor: boolean | null;
    bestaetigt: boolean;
    gesperrtAm: Date | null;
    erstelltAm: Date;
    istKind: boolean | null;
    loeschenAb: Date | null;
  }[],
): Promise<KontoZeile[]> {
  const ids = zeilen.map((z) => z.id);
  if (!ids.length) return [];
  const [rollen, verwaltung] = await Promise.all([
    db
      .select({ benutzerId: schema.gemeindeRolle.benutzerId, rolle: schema.gemeindeRolle.rolle })
      .from(schema.gemeindeRolle)
      .where(inArray(schema.gemeindeRolle.benutzerId, ids)),
    db
      .selectDistinct({ benutzerId: schema.rolleZuweisung.benutzerId })
      .from(schema.rolleZuweisung)
      .where(inArray(schema.rolleZuweisung.benutzerId, ids)),
  ]);
  const r = new Map<string, GemeindeRolleArt[]>();
  for (const z of rollen) r.set(z.benutzerId, [...(r.get(z.benutzerId) ?? []), z.rolle]);
  const v = new Set(verwaltung.map((z) => z.benutzerId));
  return zeilen.map((z) => ({
    id: z.id,
    name: z.name,
    kennung: z.istKind && z.benutzername ? z.benutzername : z.email,
    istKind: Boolean(z.istKind),
    rollen: GEMEINDE_ROLLEN.filter((x) => r.get(z.id)?.includes(x)),
    verwaltung: v.has(z.id),
    zweiFaktor: Boolean(z.zweiFaktor),
    bestaetigt: z.bestaetigt,
    gesperrtAm: z.gesperrtAm,
    loeschenAb: z.loeschenAb,
    erstelltAm: z.erstelltAm,
  }));
}

const spalten = {
  id: u.id,
  name: u.name,
  email: u.email,
  benutzername: u.displayUsername,
  zweiFaktor: u.twoFactorEnabled,
  bestaetigt: u.emailVerified,
  gesperrtAm: u.gesperrtAm,
  erstelltAm: u.createdAt,
  istKind: schema.kontoProfil.istKind,
  loeschenAb: schema.kontoProfil.loeschenAb,
};

export async function ladeGemeindeKonten(filter: KontenFilter, leser: Angemeldet): Promise<KontoZeile[]> {
  const bedingungen: (SQL | undefined)[] = [istGemeindeKonto()];
  if (filter.rolle !== 'alle')
    bedingungen.push(
      exists(
        db
          .select({ x: sql`1` })
          .from(schema.gemeindeRolle)
          .where(and(eq(schema.gemeindeRolle.benutzerId, u.id), eq(schema.gemeindeRolle.rolle, filter.rolle))),
      ),
    );
  if (filter.zustand === 'gesperrt') bedingungen.push(isNotNull(u.gesperrtAm));
  if (filter.zustand === 'loeschantrag') bedingungen.push(isNotNull(schema.kontoProfil.loeschenAb));
  if (filter.zustand === 'unbestaetigt') bedingungen.push(and(eq(u.emailVerified, false), isNull(u.username)));
  await protokolliere({
    benutzerId: leser.benutzerId,
    aktion: 'gemeindekonto.gelesen',
    zielTyp: 'benutzer',
    details: { ansicht: 'liste' },
  });
  const zeilen = await db
    .select(spalten)
    .from(u)
    .leftJoin(schema.kontoProfil, eq(schema.kontoProfil.benutzerId, u.id))
    .where(and(...bedingungen))
    .orderBy(asc(u.name))
    .limit(500);
  return anreichern(zeilen);
}

/** Offene Löschanträge (Art. 17), älteste Frist zuerst. */
export async function ladeLoeschantraege(): Promise<KontoZeile[]> {
  const zeilen = await db
    .select(spalten)
    .from(u)
    .innerJoin(schema.kontoProfil, eq(schema.kontoProfil.benutzerId, u.id))
    .where(isNotNull(schema.kontoProfil.loeschenAb))
    .orderBy(asc(schema.kontoProfil.loeschenAb));
  return anreichern(zeilen);
}

export type KontoDetail = KontoZeile & {
  email: string;
  sitzungen: number;
  kinder: { id: string; anzeigename: string }[];
  leitung: { id: string; name: string; rolle: 'lehrkraft' | 'aufsicht' }[];
  eigeneLernende: { id: string; anzeigename: string } | null;
};

const KONTO_ID = /^[A-Za-z0-9_-]{1,64}$/;

/** Ein Gemeinde-Konto (ohne Audit; für Actions). null = unbekannt oder kein Gemeinde-Konto. */
export async function ladeGemeindeKonto(id: string): Promise<KontoDetail | null> {
  if (!KONTO_ID.test(id)) return null;
  const [z] = await db
    .select(spalten)
    .from(u)
    .leftJoin(schema.kontoProfil, eq(schema.kontoProfil.benutzerId, u.id))
    .where(and(eq(u.id, id), istGemeindeKonto()));
  if (!z) return null;
  const [[zeile], [{ anzahl }], kinder, leitung, [eigen]] = await Promise.all([
    anreichern([z]),
    db
      .select({ anzahl: count() })
      .from(schema.session)
      .where(and(eq(schema.session.userId, id), gt(schema.session.expiresAt, new Date()))),
    db
      .select({ id: schema.lernende.id, anzeigename: schema.lernende.anzeigename })
      .from(schema.elternKind)
      .innerJoin(schema.lernende, eq(schema.lernende.id, schema.elternKind.lernendeId))
      .where(eq(schema.elternKind.elternId, id))
      .orderBy(asc(schema.lernende.anzeigename)),
    db
      .select({ id: schema.gruppe.id, name: schema.gruppe.name, rolle: schema.gruppenLeitung.rolle })
      .from(schema.gruppenLeitung)
      .innerJoin(schema.gruppe, eq(schema.gruppe.id, schema.gruppenLeitung.gruppeId))
      .where(eq(schema.gruppenLeitung.benutzerId, id)),
    db
      .select({ id: schema.lernende.id, anzeigename: schema.lernende.anzeigename })
      .from(schema.lernende)
      .where(eq(schema.lernende.benutzerId, id)),
  ]);
  return {
    ...zeile,
    email: z.email,
    sitzungen: anzahl,
    kinder,
    leitung: leitung.map((g) => ({ id: g.id, name: g.name.de, rolle: g.rolle })),
    eigeneLernende: eigen ?? null,
  };
}

/** Detailansicht: wie `ladeGemeindeKonto`, mit Audit-Eintrag. */
export async function ladeGemeindeKontoAnsicht(id: string, leser: Angemeldet): Promise<KontoDetail | null> {
  const k = await ladeGemeindeKonto(id);
  if (k)
    await protokolliere({
      benutzerId: leser.benutzerId,
      aktion: 'gemeindekonto.gelesen',
      zielTyp: 'benutzer',
      zielId: k.id,
      details: { ansicht: 'detail' },
    });
  return k;
}

export type GemeindeEinladungZeile = {
  id: string;
  name: string;
  email: string;
  art: string;
  lernende: string | null;
  laeuftAb: Date;
  abgelaufen: boolean;
};

/** Offene Einladungen in Gemeinde-Konten (nur Gemeinde-Rollen, ohne Verwaltungsrollen). */
export async function ladeOffeneGemeindeEinladungen(): Promise<GemeindeEinladungZeile[]> {
  const e = schema.einladung;
  const zeilen = await db
    .select({
      id: e.id,
      name: e.name,
      email: e.email,
      gemeindeRollen: e.gemeindeRollen,
      lernende: schema.lernende.anzeigename,
      laeuftAb: e.laeuftAb,
    })
    .from(e)
    .leftJoin(schema.lernende, eq(schema.lernende.id, e.lernendeId))
    .where(
      and(
        isNull(e.angenommenAm),
        isNull(e.widerrufenAm),
        sql`jsonb_array_length(${e.rollen}) = 0`,
        sql`jsonb_array_length(${e.gemeindeRollen}) > 0`,
      ),
    )
    .orderBy(desc(e.erstelltAm));
  const jetzt = Date.now();
  return zeilen.map((z) => ({
    id: z.id,
    name: z.name,
    email: z.email,
    art: z.gemeindeRollen.find((r) => r !== 'gemeinde') ?? 'gemeinde',
    lernende: z.lernende,
    laeuftAb: z.laeuftAb,
    abgelaufen: z.laeuftAb.getTime() <= jetzt,
  }));
}
