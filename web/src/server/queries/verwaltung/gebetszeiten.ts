import 'server-only';
import { and, count, desc, eq, gte, lte, max } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { berlinerDatum } from '@/lib/gebetszeiten/naechstes';
import { gebetszeitenEinstellung, type GebetszeitenEinstellung } from '@/lib/validierung/einstellungen';

/**
 * Verwaltung „Gebetszeiten“ (C07, V07, ADR 0008). Ohne Cache: Einstellung direkt aus der Tabelle, Importe mit Person,
 * Abdeckung der importierten Tage ab heute (Europe/Berlin).
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

/** Letzter importierter Tag ab heute (null = keiner) und ob die nächsten 30 Tage lückenlos importiert sind. */
export async function ladeAbdeckung(jetzt = new Date()): Promise<{ bis: string | null; naechste30: boolean }> {
  const heute = berlinerDatum(jetzt);
  const [j, m, t] = heute.split('-').map(Number);
  const in30 = new Date(Date.UTC(j, m - 1, t + 29)).toISOString().slice(0, 10);
  const tg = schema.gebetszeitTag;
  const [[{ bis }], [{ anzahl }]] = await Promise.all([
    db
      .select({ bis: max(tg.datum) })
      .from(tg)
      .where(and(gte(tg.datum, heute), eq(tg.quelle, 'import'))),
    db
      .select({ anzahl: count() })
      .from(tg)
      .where(and(gte(tg.datum, heute), lte(tg.datum, in30), eq(tg.quelle, 'import'))),
  ]);
  return { bis: bis ?? null, naechste30: anzahl >= 30 };
}
