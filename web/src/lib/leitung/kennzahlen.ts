import 'server-only';
import { and, eq, gte, isNotNull, isNull, sql } from 'drizzle-orm';
import { db, schema } from '@/lib/db';

/**
 * „Gemeinde im Blick“ (AUFTRAG 3.10, H-K06): Kennzahlen für die Leitung ohne Personendaten. Kleine Werte (1–4)
 * erscheinen als „< 5“, damit niemand aus einer Zahl auf eine Person schließen kann. Keine Seitenaufrufe (keine Tracker).
 */
export type Kennzahl = number | '< 5';

/** Werte unter 5 (außer 0) als „< 5“. */
export function schwelle(n: number): Kennzahl {
  return n > 0 && n < 5 ? '< 5' : n;
}

const zahl = (z: { n: number }[]) => z[0]?.n ?? 0;
const zaehle = sql<number>`count(*)::int`;

export type Kennzahlen = {
  zeitraumTage: number;
  eingaenge: Record<string, Kennzahl>;
  lernende: Kennzahl;
  gruppen: Kennzahl;
  anwesenheitsquote: number | null;
  unterrichtstermine: Kennzahl;
  pushAbos: Kennzahl;
  newsletter: Kennzahl;
  hatimGelesen: Kennzahl;
  konten: Kennzahl;
  veroeffentlichteNachrichten: Kennzahl;
};

/** Kennzahlen der letzten `tage` Tage (Standard 30). */
export async function ladeKennzahlen(tage = 30): Promise<Kennzahlen> {
  const seit = sql`now() - (${tage} || ' days')::interval`;
  const [eingaenge, lernende, gruppen, anwesend, termine, push, newsletter, hatim, konten, nachrichten] = await Promise.all([
    db
      .select({ art: schema.eingang.art, n: zaehle })
      .from(schema.eingang)
      .where(gte(schema.eingang.erstelltAm, seit))
      .groupBy(schema.eingang.art),
    db.select({ n: zaehle }).from(schema.lernende).where(eq(schema.lernende.status, 'aktiv')),
    db.select({ n: zaehle }).from(schema.gruppe).where(eq(schema.gruppe.status, 'aktiv')),
    db
      .select({ status: schema.anwesenheit.status, n: zaehle })
      .from(schema.anwesenheit)
      .where(gte(schema.anwesenheit.erfasstAm, seit))
      .groupBy(schema.anwesenheit.status),
    db
      .select({ n: zaehle })
      .from(schema.unterrichtstermin)
      .where(and(gte(schema.unterrichtstermin.datum, sql`(${seit})::date`), eq(schema.unterrichtstermin.ausgefallen, false))),
    db.select({ n: zaehle }).from(schema.pushAbo),
    db
      .select({ n: zaehle })
      .from(schema.newsletterAbo)
      .where(and(isNotNull(schema.newsletterAbo.bestaetigtAm), isNull(schema.newsletterAbo.abgemeldetAm))),
    db.select({ n: zaehle }).from(schema.hatimTeil).where(gte(schema.hatimTeil.gelesenAm, seit)),
    db.select({ n: zaehle }).from(schema.gemeindeRolle),
    db
      .select({ n: zaehle })
      .from(schema.nachricht)
      .where(and(eq(schema.nachricht.status, 'veroeffentlicht'), gte(schema.nachricht.veroeffentlichtAm, seit))),
  ]);
  const gesamtAnwesenheit = anwesend.reduce((s, z) => s + z.n, 0);
  const da = anwesend.filter((z) => z.status === 'anwesend' || z.status === 'verspaetet').reduce((s, z) => s + z.n, 0);
  return {
    zeitraumTage: tage,
    eingaenge: Object.fromEntries(eingaenge.map((z) => [z.art, schwelle(z.n)])),
    lernende: schwelle(zahl(lernende)),
    gruppen: schwelle(zahl(gruppen)),
    // Quote erst ab 20 Einträgen, sonst ließe sie auf Einzelne schließen
    anwesenheitsquote: gesamtAnwesenheit >= 20 ? Math.round((da / gesamtAnwesenheit) * 100) : null,
    unterrichtstermine: schwelle(zahl(termine)),
    pushAbos: schwelle(zahl(push)),
    newsletter: schwelle(zahl(newsletter)),
    hatimGelesen: schwelle(zahl(hatim)),
    konten: schwelle(zahl(konten)),
    veroeffentlichteNachrichten: schwelle(zahl(nachrichten)),
  };
}
