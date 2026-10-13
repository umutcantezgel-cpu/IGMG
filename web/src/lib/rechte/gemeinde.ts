import 'server-only';
import { and, eq, isNull } from 'drizzle-orm';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { auth } from '@/lib/auth/server';
import { db, schema } from '@/lib/db';
import { pfadFuer } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { darfInGruppe, type GruppenAktion, type GruppenKontext, type GruppenZiel, type LeitungsRolle } from './gruppen';
import type { RollenZuweisung } from './matrix';
import { KeinRecht } from './pruefe';
import { sitzungAbgelaufen } from './sitzung';

/** Kontoarten in „Mein Bereich“ (ADR 0026). */
export type GemeindeRolle = (typeof schema.gemeindeRolleEnum.enumValues)[number];

export type Konto = {
  benutzerId: string;
  name: string;
  anzeigename: string;
  email: string;
  istKind: boolean;
  sprache: string;
  gemeindeRollen: GemeindeRolle[];
  verwaltungsRollen: RollenZuweisung[];
  zweiFaktorErfuellt: boolean;
};

/** Lehrkräfte brauchen den zweiten Faktor (TOTP), wie die Verwaltung. */
const ZWEI_FAKTOR_PFLICHT: ReadonlySet<GemeindeRolle> = new Set<GemeindeRolle>(['lehrkraft']);

/**
 * Aktuelles Gemeinde-Konto (je Anfrage einmal geladen). null = nicht angemeldet, gesperrt oder Sitzung über der
 * Grenze ihrer Kontoart (die Sitzung wird dann widerrufen).
 */
export const ladeKonto = cache(async (): Promise<Konto | null> => {
  const sitzung = await auth.api.getSession({ headers: await headers() });
  if (!sitzung || sitzung.user.gesperrtAm) return null;
  const benutzerId = sitzung.user.id;
  const [gemeinde, verwaltung, profil] = await Promise.all([
    db.select({ rolle: schema.gemeindeRolle.rolle }).from(schema.gemeindeRolle).where(eq(schema.gemeindeRolle.benutzerId, benutzerId)),
    db
      .select({ rolle: schema.rolleZuweisung.rolle, organisation: schema.rolleZuweisung.organisation })
      .from(schema.rolleZuweisung)
      .where(eq(schema.rolleZuweisung.benutzerId, benutzerId)),
    db.select().from(schema.kontoProfil).where(eq(schema.kontoProfil.benutzerId, benutzerId)).limit(1),
  ]);
  const gemeindeRollen = gemeinde.map((z) => z.rolle);
  const istKind = profil[0]?.istKind ?? false;
  if (sitzungAbgelaufen(new Date(sitzung.session.createdAt), { verwaltung: verwaltung.length > 0, gemeindeRollen, istKind })) {
    await db.delete(schema.session).where(eq(schema.session.id, sitzung.session.id));
    return null;
  }
  return {
    benutzerId,
    name: sitzung.user.name,
    anzeigename: profil[0]?.anzeigename ?? sitzung.user.name,
    email: sitzung.user.email,
    istKind,
    sprache: profil[0]?.sprache ?? 'de',
    gemeindeRollen,
    verwaltungsRollen: verwaltung,
    zweiFaktorErfuellt: Boolean(sitzung.user.twoFactorEnabled),
  };
});

function faktorFehlt(k: Konto): boolean {
  return !k.zweiFaktorErfuellt && k.gemeindeRollen.some((r) => ZWEI_FAKTOR_PFLICHT.has(r));
}

/**
 * Für Seiten in „Mein Bereich“: verlangt Anmeldung (sonst → Anmeldung mit Rücksprung), bei Lehrkräften den zweiten
 * Faktor und – falls angegeben – eine der Kontoarten (sonst → Startseite von Mein Bereich).
 */
export async function verlangeKonto(locale: Locale, rollen?: readonly GemeindeRolle[]): Promise<Konto> {
  const k = await ladeKonto();
  if (!k) redirect(pfadFuer('/anmelden', locale));
  if (faktorFehlt(k)) redirect(pfadFuer({ pathname: '/mein-bereich/konto', query: { faktor: 'pflicht' } }, locale));
  if (rollen && !rollen.some((r) => k.gemeindeRollen.includes(r))) redirect(pfadFuer('/mein-bereich', locale));
  return k;
}

/** Für Server Actions und Route Handler: wirft `KeinRecht` statt umzuleiten. Erste Anweisung jeder Konto-Action. */
export async function verlangeKontoRecht(rollen?: readonly GemeindeRolle[]): Promise<Konto> {
  const k = await ladeKonto();
  if (!k || faktorFehlt(k)) throw new KeinRecht();
  if (rollen && !rollen.some((r) => k.gemeindeRollen.includes(r))) throw new KeinRecht();
  return k;
}

/** Lädt die Gruppenbezüge eines Kontos (nur aktive Gruppen und laufende Mitgliedschaften). */
export const ladeGruppenKontext = cache(async (benutzerId: string): Promise<GruppenKontext> => {
  const [leitung, eigen, kinder] = await Promise.all([
    db
      .select({ gruppeId: schema.gruppenLeitung.gruppeId, rolle: schema.gruppenLeitung.rolle })
      .from(schema.gruppenLeitung)
      .innerJoin(schema.gruppe, eq(schema.gruppe.id, schema.gruppenLeitung.gruppeId))
      .where(and(eq(schema.gruppenLeitung.benutzerId, benutzerId), eq(schema.gruppe.status, 'aktiv'))),
    db
      .select({ lernendeId: schema.lernende.id, gruppeId: schema.gruppenMitglied.gruppeId })
      .from(schema.lernende)
      .leftJoin(schema.gruppenMitglied, and(eq(schema.gruppenMitglied.lernendeId, schema.lernende.id), isNull(schema.gruppenMitglied.bis)))
      .where(and(eq(schema.lernende.benutzerId, benutzerId), eq(schema.lernende.status, 'aktiv'))),
    db
      .select({ lernendeId: schema.elternKind.lernendeId, gruppeId: schema.gruppenMitglied.gruppeId })
      .from(schema.elternKind)
      .innerJoin(schema.lernende, eq(schema.lernende.id, schema.elternKind.lernendeId))
      .leftJoin(
        schema.gruppenMitglied,
        and(eq(schema.gruppenMitglied.lernendeId, schema.elternKind.lernendeId), isNull(schema.gruppenMitglied.bis)),
      )
      .where(eq(schema.elternKind.elternId, benutzerId)),
  ]);
  const kinderMap = new Map<string, Set<string>>();
  for (const z of kinder) {
    const s = kinderMap.get(z.lernendeId) ?? new Set<string>();
    if (z.gruppeId) s.add(z.gruppeId);
    kinderMap.set(z.lernendeId, s);
  }
  return {
    benutzerId,
    leitung: new Map(leitung.map((z) => [z.gruppeId, z.rolle as LeitungsRolle])),
    eigeneLernendeId: eigen[0]?.lernendeId ?? null,
    eigeneGruppen: new Set(eigen.flatMap((z) => (z.gruppeId ? [z.gruppeId] : []))),
    kinder: kinderMap,
  };
});

/** Für Actions: Konto + Gruppenrecht, sonst `KeinRecht`. Gibt Konto und Kontext zurück. */
export async function verlangeGruppenRecht(
  aktion: GruppenAktion,
  gruppeId: string,
  ziel?: GruppenZiel,
): Promise<{ konto: Konto; kontext: GruppenKontext }> {
  const konto = await verlangeKontoRecht();
  const kontext = await ladeGruppenKontext(konto.benutzerId);
  if (!darfInGruppe(kontext, aktion, gruppeId, ziel)) throw new KeinRecht();
  return { konto, kontext };
}
