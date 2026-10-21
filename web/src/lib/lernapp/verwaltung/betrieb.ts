import 'server-only';
import { and, eq, gte, like, sql } from 'drizzle-orm';
import { db, schema } from '@/lib/db';

/**
 * Betriebszähler der Lern-App ohne Personenbezug (S-L1 M-2 „Zählung im Cockpit“, L3-06): Tagessummen in
 * `lernapp_statistik_tag` mit Kurs `''` und Bereich `betrieb` – nur Kennzahl und Anzahl, weder Konto noch Gerät oder IP.
 * Kennzahlen: `sync_grenze_<gesamt|jeTag|geraete>` (Abgleich abgelehnt wegen der Grenzen je Konto), `meldung` (anonyme
 * Meldung angenommen).
 */
export const BETRIEB = 'betrieb';

const heute = (jetzt: Date) => jetzt.toISOString().slice(0, 10);

/** Zählt eine Kennzahl für den heutigen Tag (UTC) hoch. Fehler beim Zählen brechen die Anfrage nicht ab. */
export async function zaehleBetrieb(kennzahl: string, jetzt = new Date()): Promise<void> {
  const t = schema.lernappStatistikTag;
  await db
    .insert(t)
    .values({ tag: heute(jetzt), kursId: '', bereich: BETRIEB, kennzahl, wert: 1 })
    .onConflictDoUpdate({ target: [t.tag, t.kursId, t.bereich, t.kennzahl], set: { wert: sql`${t.wert} + 1` } })
    .catch(() => undefined);
}

/** Summe einer Kennzahl (Präfix) über die letzten `tage` Tage. */
export async function betriebsSumme(praefix: string, tage: number, jetzt = new Date()): Promise<number> {
  const t = schema.lernappStatistikTag;
  const ab = heute(new Date(jetzt.getTime() - (tage - 1) * 86_400_000));
  const [z] = await db
    .select({ n: sql<number>`coalesce(sum(${t.wert}), 0)`.mapWith(Number) })
    .from(t)
    .where(and(eq(t.kursId, ''), eq(t.bereich, BETRIEB), like(t.kennzahl, `${praefix}%`), gte(t.tag, ab)));
  return z?.n ?? 0;
}
