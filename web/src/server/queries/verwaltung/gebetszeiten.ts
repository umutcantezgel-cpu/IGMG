import 'server-only';
import { and, count, desc, eq, gt, gte, inArray, lte, max } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import type { AbgleichStatus } from '@/lib/db/schema/gebetszeiten';
import { berlinerDatum } from '@/lib/gebetszeiten/naechstes';
import { dateiQuelle } from '@/lib/gebetszeiten/quellen/datei';
import { feedQuelle } from '@/lib/gebetszeiten/quellen/igmg-feed';
import type { Auffaelligkeit } from '@/lib/gebetszeiten/quellen/pruefung';
import type { Gebet, Tageszeiten } from '@/lib/gebetszeiten/typen';
import { nurZeiten } from '@/lib/gebetszeiten/vorrang';
import { gebetszeitenEinstellung, type GebetszeitenEinstellung } from '@/lib/validierung/einstellungen';

/**
 * Verwaltung „Gebetszeiten“ (C07, V07, ADR 0008, ADR 0048). Ohne Cache: Einstellung direkt aus der Tabelle, Importe mit
 * Person, Abdeckung der Tabellen-Tage ab heute (Europe/Berlin), Stand des IGMG-Abgleichs.
 */
export async function ladeGebetszeitenEinstellung(): Promise<GebetszeitenEinstellung> {
  const [z] = await db
    .select({ wert: schema.einstellung.wert })
    .from(schema.einstellung)
    .where(eq(schema.einstellung.schluessel, 'gebetszeiten'))
    .limit(1);
  const p = gebetszeitenEinstellung.safeParse(z?.wert ?? {});
  return p.success ? p.data : gebetszeitenEinstellung.parse({});
}

export type ImportZeile = {
  id: string;
  dateiname: string | null;
  von: string;
  bis: string;
  zeilen: number;
  erstelltAm: Date;
  person: string | null;
  tage: number;
};

export async function ladeImporte(): Promise<ImportZeile[]> {
  const i = schema.gebetszeitImport;
  const [zeilen, tage] = await Promise.all([
    db
      .select({
        id: i.id,
        dateiname: i.dateiname,
        von: i.von,
        bis: i.bis,
        zeilen: i.zeilen,
        erstelltAm: i.erstelltAm,
        person: schema.user.name,
      })
      .from(i)
      .leftJoin(schema.user, eq(schema.user.id, i.erstelltVon))
      .orderBy(desc(i.erstelltAm))
      .limit(50),
    db
      .select({ importId: schema.gebetszeitTag.importId, anzahl: count() })
      .from(schema.gebetszeitTag)
      .groupBy(schema.gebetszeitTag.importId),
  ]);
  const je = new Map(tage.map((t) => [t.importId, t.anzahl]));
  return zeilen.map((z) => ({ ...z, tage: je.get(z.id) ?? 0 }));
}

/**
 * Letzter Tag aus einer Tabelle (Import der Gemeinde oder IGMG-Kalender) ab heute (null = keiner), ob die nächsten 30 Tage
 * lückenlos vorliegen und wie viele davon (ADR 0048).
 */
export async function ladeAbdeckung(jetzt = new Date()): Promise<{ bis: string | null; naechste30: boolean; tage30: number }> {
  const heute = berlinerDatum(jetzt);
  const [j, m, t] = heute.split('-').map(Number);
  const in30 = new Date(Date.UTC(j, m - 1, t + 29)).toISOString().slice(0, 10);
  const tg = schema.gebetszeitTag;
  const tabelle = inArray(tg.quelle, ['import', 'igmg']);
  const [[{ bis }], [{ anzahl }]] = await Promise.all([
    db
      .select({ bis: max(tg.datum) })
      .from(tg)
      .where(and(gte(tg.datum, heute), tabelle)),
    db
      .select({ anzahl: count() })
      .from(tg)
      .where(and(gte(tg.datum, heute), lte(tg.datum, in30), tabelle)),
  ]);
  return { bis: bis ?? null, naechste30: anzahl >= 30, tage30: anzahl };
}

export type AbgleichLauf = {
  id: string;
  quelle: string;
  status: AbgleichStatus;
  gestartet: Date;
  von: string | null;
  bis: string | null;
  tageGeprueft: number;
  tageNeu: number;
  tageGeaendert: number;
  konflikte: number;
  maxAbweichungMin: number;
  fehlerCode: string | null;
  quellStand: string | null;
};

export type AbgleichStand = {
  /** Offizieller Zugang (GEBETSZEITEN_IGMG_URL) bzw. Jahresdatei eingerichtet? Ohne beides gleicht nichts ab. */
  feed: boolean;
  datei: boolean;
  laeufe: AbgleichLauf[];
  /** Letzter erfolgreicher Lauf */
  letzterErfolg: AbgleichLauf | null;
  /** Wartet auf Freigabe: auffälliger Lauf mit Abweichungen je Gebet */
  ausstehend: (AbgleichLauf & { auffaellig: { datum: string; gebet: Gebet; abweichungMin: number }[]; tage: number }) | null;
  /** Offene Konflikte mit dem Import der Gemeinde (letzter Lauf mit Konflikten) */
  konflikte: { datum: string; abweichungMin: Partial<Record<Gebet, number>> }[];
};

/** Stand des IGMG-Abgleichs für die Verwaltungskarte (ADR 0048). Ohne Cache. */
export async function ladeAbgleichStand(stadtId: string): Promise<AbgleichStand> {
  const a = schema.gebetszeitAbgleich;
  const spalten = {
    id: a.id,
    quelle: a.quelle,
    status: a.status,
    gestartet: a.gestartet,
    von: a.von,
    bis: a.bis,
    tageGeprueft: a.tageGeprueft,
    tageNeu: a.tageNeu,
    tageGeaendert: a.tageGeaendert,
    konflikte: a.konflikte,
    maxAbweichungMin: a.maxAbweichungMin,
    fehlerCode: a.fehlerCode,
    quellStand: a.quellStand,
    details: a.details,
  };
  const [laeufe, [erfolg], [offen], [konflikt]] = await Promise.all([
    db.select(spalten).from(a).orderBy(desc(a.gestartet)).limit(10),
    db
      .select(spalten)
      .from(a)
      .where(inArray(a.status, ['ok', 'unveraendert', 'freigegeben']))
      .orderBy(desc(a.gestartet))
      .limit(1),
    db.select(spalten).from(a).where(eq(a.status, 'auffaellig')).orderBy(desc(a.gestartet)).limit(1),
    db.select(spalten).from(a).where(gt(a.konflikte, 0)).orderBy(desc(a.gestartet)).limit(1),
  ]);
  const ohneDetails = <T extends { details: unknown }>({ details: _d, ...rest }: T) => rest;
  const offenDetails = (offen?.details ?? {}) as { auffaellig?: Auffaelligkeit[]; ausstehend?: unknown[] };
  // Ein auffälliger Lauf gilt nur, solange kein späterer Lauf erfolgreich war
  const ausstehend = offen && (!erfolg || offen.gestartet > erfolg.gestartet) ? offen : null;
  return {
    feed: feedQuelle().bereit(),
    datei: dateiQuelle({ stadtId }).bereit(),
    laeufe: laeufe.map(ohneDetails),
    letzterErfolg: erfolg ? ohneDetails(erfolg) : null,
    ausstehend: ausstehend
      ? { ...ohneDetails(ausstehend), auffaellig: offenDetails.auffaellig ?? [], tage: offenDetails.ausstehend?.length ?? 0 }
      : null,
    konflikte: ((konflikt?.details ?? {}) as { konflikte?: AbgleichStand['konflikte'] }).konflikte ?? [],
  };
}

/** IGMG-Tage aus der Datenbank (Kalibrierung, Drift-Bericht): höchstens die letzten 400 Tage. */
export async function ladeIgmgTage(): Promise<(Tageszeiten & { datum: string })[]> {
  const tg = schema.gebetszeitTag;
  const zeilen = await db.select().from(tg).where(eq(tg.quelle, 'igmg')).orderBy(desc(tg.datum)).limit(400);
  return zeilen.map((z) => ({ datum: z.datum, ...nurZeiten(z) })).reverse();
}
