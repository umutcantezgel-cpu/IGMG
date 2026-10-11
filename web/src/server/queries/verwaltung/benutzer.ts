import 'server-only';
import { and, asc, count, desc, eq, inArray, isNull, max, sql } from 'drizzle-orm';
import { protokolliere } from '@/lib/audit';
import { db, schema } from '@/lib/db';
import type { RollenZuweisung } from '@/lib/rechte/matrix';
import type { Angemeldet } from '@/lib/rechte/pruefe';

/**
 * Verwaltung „Benutzer und Rollen“ (C12, V12, K-06, ADR 0003). Ohne Cache (Verwaltung ist dynamisch).
 * Nur für die Administration (Recht `benutzer.lesen`); E-Mail-Adressen sind Daten der Mitarbeitenden.
 */
const u = schema.user;

export type BenutzerZeile = {
  id: string;
  name: string;
  email: string;
  rollen: RollenZuweisung[];
  zweiFaktor: boolean;
  gesperrtAm: Date | null;
  passkeys: number;
  letzteAnmeldung: Date | null;
  erstelltAm: Date;
};

async function rollenVon(ids: string[]): Promise<Map<string, RollenZuweisung[]>> {
  const karte = new Map<string, RollenZuweisung[]>();
  if (!ids.length) return karte;
  const zeilen = await db
    .select({
      benutzerId: schema.rolleZuweisung.benutzerId,
      rolle: schema.rolleZuweisung.rolle,
      organisation: schema.rolleZuweisung.organisation,
    })
    .from(schema.rolleZuweisung)
    .where(inArray(schema.rolleZuweisung.benutzerId, ids))
    .orderBy(asc(schema.rolleZuweisung.rolle), asc(schema.rolleZuweisung.organisation));
  for (const z of zeilen) karte.set(z.benutzerId, [...(karte.get(z.benutzerId) ?? []), { rolle: z.rolle, organisation: z.organisation }]);
  return karte;
}

async function anreichern(
  zeilen: { id: string; name: string; email: string; zweiFaktor: boolean | null; gesperrtAm: Date | null; erstelltAm: Date }[],
): Promise<BenutzerZeile[]> {
  const ids = zeilen.map((z) => z.id);
  if (!ids.length) return [];
  const [rollen, anmeldungen, passkeys] = await Promise.all([
    rollenVon(ids),
    db
      .select({ benutzerId: schema.auditEintrag.benutzerId, zuletzt: max(schema.auditEintrag.zeitpunkt) })
      .from(schema.auditEintrag)
      .where(and(eq(schema.auditEintrag.aktion, 'anmeldung.erfolg'), inArray(schema.auditEintrag.benutzerId, ids)))
      .groupBy(schema.auditEintrag.benutzerId),
    db
      .select({ benutzerId: schema.passkey.userId, anzahl: count() })
      .from(schema.passkey)
      .where(inArray(schema.passkey.userId, ids))
      .groupBy(schema.passkey.userId),
  ]);
  const letzte = new Map(anmeldungen.map((a) => [a.benutzerId, a.zuletzt]));
  const schluessel = new Map(passkeys.map((p) => [p.benutzerId, p.anzahl]));
  return zeilen.map((z) => ({
    id: z.id,
    name: z.name,
    email: z.email,
    rollen: rollen.get(z.id) ?? [],
    zweiFaktor: Boolean(z.zweiFaktor),
    gesperrtAm: z.gesperrtAm,
    passkeys: schluessel.get(z.id) ?? 0,
    letzteAnmeldung: letzte.get(z.id) ?? null,
    erstelltAm: z.erstelltAm,
  }));
}

const spalten = {
  id: u.id,
  name: u.name,
  email: u.email,
  zweiFaktor: u.twoFactorEnabled,
  gesperrtAm: u.gesperrtAm,
  erstelltAm: u.createdAt,
};

/**
 * Liste für die Verwaltung (Tor B/C M2, G-07): Namen und E-Mail-Adressen sind Personendaten – der Abruf wird vorher
 * protokolliert (ein Eintrag je Aufruf, deckt auch die offenen Einladungen ab). Ohne Personendaten im Eintrag.
 */
export async function ladeBenutzerListe(leser: Angemeldet): Promise<BenutzerZeile[]> {
  await protokolliere({ benutzerId: leser.benutzerId, aktion: 'benutzer.gelesen', zielTyp: 'benutzer', details: { ansicht: 'liste' } });
  return anreichern(await db.select(spalten).from(u).orderBy(asc(u.name)));
}

/** Ein Konto für die Detailseite – Abruf protokolliert (Tor B/C M2). Actions nutzen `ladeBenutzer` (sie protokollieren ihre Änderung). */
export async function ladeBenutzerAnsicht(id: string, leser: Angemeldet): Promise<BenutzerZeile | null> {
  const konto = await ladeBenutzer(id);
  if (konto)
    await protokolliere({
      benutzerId: leser.benutzerId,
      aktion: 'benutzer.gelesen',
      zielTyp: 'benutzer',
      zielId: konto.id,
      details: { ansicht: 'detail' },
    });
  return konto;
}

/** Konto-IDs von Better Auth: Buchstaben, Ziffern, „-“ und „_“ (Tor B/C N2: Format statt nur Länge prüfen). */
const KONTO_ID = /^[A-Za-z0-9_-]{1,64}$/;

export async function ladeBenutzer(id: string): Promise<BenutzerZeile | null> {
  if (!KONTO_ID.test(id)) return null;
  const [z] = await anreichern(await db.select(spalten).from(u).where(eq(u.id, id)).limit(1));
  return z ?? null;
}

export type EinladungZeile = {
  id: string;
  email: string;
  name: string;
  rollen: RollenZuweisung[];
  laeuftAb: Date;
  abgelaufen: boolean;
  erstelltAm: Date;
};

/** Noch nicht angenommene und nicht widerrufene Einladungen (abgelaufene gekennzeichnet). */
export async function ladeOffeneEinladungen(): Promise<EinladungZeile[]> {
  const e = schema.einladung;
  const zeilen = await db
    .select({ id: e.id, email: e.email, name: e.name, rollen: e.rollen, laeuftAb: e.laeuftAb, erstelltAm: e.erstelltAm })
    .from(e)
    .where(and(isNull(e.angenommenAm), isNull(e.widerrufenAm)))
    .orderBy(desc(e.erstelltAm));
  const jetzt = Date.now();
  return zeilen.map((z) => ({
    ...z,
    rollen: z.rollen.map((r) => ({ rolle: r.rolle, organisation: r.organisation ?? null })),
    abgelaufen: z.laeuftAb.getTime() <= jetzt,
  }));
}

/** Gibt es schon ein Konto oder eine gültige Einladung für diese Adresse? */
export async function emailBelegt(email: string): Promise<'konto' | 'einladung' | null> {
  const [konto] = await db
    .select({ id: u.id })
    .from(u)
    .where(sql`lower(${u.email}) = ${email.toLowerCase()}`)
    .limit(1);
  if (konto) return 'konto';
  const e = schema.einladung;
  const [offen] = await db
    .select({ id: e.id })
    .from(e)
    .where(and(sql`lower(${e.email}) = ${email.toLowerCase()}`, isNull(e.angenommenAm), isNull(e.widerrufenAm), sql`${e.laeuftAb} > now()`))
    .limit(1);
  return offen ? 'einladung' : null;
}

/**
 * Nicht gesperrte Konten mit der Rolle Administration (ohne `ohne`) – nie die letzte entfernen, sperren oder löschen.
 * In Actions innerhalb der Transaktion unter der Sperre aufrufen (`ausfuehrer = tx`, Tor B/C M3).
 */
export async function zaehleAdministration(ohne?: string, ausfuehrer: Pick<typeof db, 'select'> = db): Promise<number> {
  const r = schema.rolleZuweisung;
  const [{ anzahl }] = await ausfuehrer
    .select({ anzahl: count() })
    .from(r)
    .innerJoin(u, eq(u.id, r.benutzerId))
    .where(and(eq(r.rolle, 'administration'), isNull(u.gesperrtAm), ohne ? sql`${r.benutzerId} <> ${ohne}` : undefined));
  return anzahl;
}
