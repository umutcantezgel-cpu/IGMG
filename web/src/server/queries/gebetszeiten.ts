import 'server-only';
import { createHash } from 'node:crypto';
import { and, count, gte, lte, max } from 'drizzle-orm';
import { cacheLife, cacheTag } from 'next/cache';
import { TAG } from '@/lib/cache/tags';
import { db, schema } from '@/lib/db';
import { datenbankVerfuegbar } from '@/lib/db/verfuegbar';
import { berechneTag } from '@/lib/gebetszeiten/berechnung';
import { istRamadan } from '@/lib/gebetszeiten/hijri';
import { berlinerDatum } from '@/lib/gebetszeiten/naechstes';
import { jahresdateiTage } from '@/lib/gebetszeiten/quellen/datei';
import type { GebetszeitTag, Tageszeiten, Zeitquelle } from '@/lib/gebetszeiten/typen';
import { quelleVon, waehleTag } from '@/lib/gebetszeiten/vorrang';
import type { GebetszeitenEinstellung } from '@/lib/validierung/einstellungen';
import { ladeEinstellung } from './einstellungen';

export type GebetszeitenFenster = {
  /** Tag, für den der Server gerendert hat (Kalenderdatum Europe/Berlin) – der Browser wählt dann „heute“. */
  referenz: string;
  tage: GebetszeitTag[];
  /** „berechnet“, sobald ein Tag gerechnet ist; sonst „igmg“ (mindestens ein Tag aus dem IGMG-Kalender) oder „import“ */
  quelle: Zeitquelle;
  bestaetigt: boolean;
  /** Stand der IGMG-Zeiten im Fenster (JJJJ-MM-TT, letzte Änderung) oder null */
  stand: string | null;
};

function tagPlus(datum: string, n: number): string {
  const [j, m, t] = datum.split('-').map(Number);
  return new Date(Date.UTC(j, m - 1, t + n)).toISOString().slice(0, 10);
}

/**
 * Tabellen für einen Zeitraum nach Ebenen (ADR 0048): Import der Gemeinde, IGMG aus der Datenbank, IGMG-Jahresdatei. Bei
 * aktiver Quelle „berechnung“ keine Tabellen; im Beispielmodus ohne Datenbank nur die Jahresdatei.
 */
async function tabellen(einstellung: GebetszeitenEinstellung, von: string, bis: string) {
  const importe = new Map<string, Tageszeiten>();
  const igmg = new Map<string, Tageszeiten & { stand: string }>();
  if (einstellung.aktiveQuelle === 'berechnung') return { importe, igmg, datei: new Map<string, Tageszeiten>(), dateiStand: null };
  if (datenbankVerfuegbar()) {
    const zeilen = await db
      .select()
      .from(schema.gebetszeitTag)
      .where(and(gte(schema.gebetszeitTag.datum, von), lte(schema.gebetszeitTag.datum, bis)));
    for (const z of zeilen) {
      if (z.quelle === 'import') importe.set(z.datum, z);
      else if (z.quelle === 'igmg') igmg.set(z.datum, { ...z, stand: berlinerDatum(z.aktualisiertAm) });
    }
  }
  const datei = jahresdateiTage(einstellung.abgleich.stadtId, von, bis);
  return { importe, igmg, datei: datei.tage, dateiStand: datei.stand };
}

/** Tage eines Zeitraums nach Vorrang; Stand = jüngste Änderung der genutzten IGMG-Tage (bzw. Stand der Jahresdatei). */
async function tageFuer(einstellung: GebetszeitenEinstellung, daten: string[]): Promise<{ tage: GebetszeitTag[]; stand: string | null }> {
  const t = await tabellen(einstellung, daten[0], daten[daten.length - 1]);
  let stand: string | null = null;
  const tage = daten.map((datum) => {
    const tag = waehleTag(datum, { import: t.importe.get(datum), igmg: t.igmg.get(datum), datei: t.datei.get(datum) }, (d) =>
      berechneTag(d, einstellung),
    );
    const s = tag.ebene === 'igmg' ? t.igmg.get(datum)!.stand : tag.ebene === 'datei' ? t.dateiStand : null;
    if (s && (!stand || s > stand)) stand = s;
    const { ebene: _e, ...ohneEbene } = tag;
    return ohneEbene;
  });
  return { tage, stand };
}

/**
 * Gebetszeiten von gestern bis in 45 Tagen (K-08, ADR 0008, ADR 0048): je Tag nach Vorrang aus Import, IGMG-Kalender
 * oder Jahresdatei, sonst gerechnet (Näherung oder Methode). Täglich neu (cacheLife 'days'), sofort nach Import, Abgleich
 * oder Einstellung (Tag gebetszeiten).
 */
export async function ladeGebetszeitenFenster(): Promise<GebetszeitenFenster> {
  'use cache: remote';
  cacheLife('days');
  cacheTag(TAG.gebetszeiten);
  const einstellung = await ladeEinstellung('gebetszeiten');
  const referenz = berlinerDatum(new Date());
  const daten = Array.from({ length: 47 }, (_, i) => tagPlus(referenz, i - 1));
  const { tage, stand } = await tageFuer(einstellung, daten);
  const art = quelleVon(tage);
  const quelle: Zeitquelle = art === 'gemischt' ? 'berechnet' : art;
  return { referenz, tage, quelle, bestaetigt: einstellung.bestaetigt, stand };
}

export type GebetszeitenMonat = {
  /** „JJJJ-MM“ */
  monat: string;
  tage: (GebetszeitTag & { ramadan: boolean })[];
  quelle: 'import' | 'igmg' | 'berechnet' | 'gemischt';
  bestaetigt: boolean;
  /** Stand der IGMG-Zeiten im Monat (JJJJ-MM-TT) oder null */
  stand: string | null;
};

/**
 * Alle Tage eines Monats (Monatsansicht, druckbar, Lese-API, K-08): nach Vorrang wie das Fenster; Ramadan-Tage markiert
 * (Hidschri-Kalender berechnet, `src/lib/gebetszeiten/hijri.ts`). Gecacht je Monat, Tag gebetszeiten.
 */
export async function ladeGebetszeitenMonat(monat: string): Promise<GebetszeitenMonat> {
  'use cache: remote';
  cacheLife('days');
  cacheTag(TAG.gebetszeiten, TAG.gebetszeitenMonat(monat));
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(monat)) throw new Error('Ungültiger Monat');
  const einstellung = await ladeEinstellung('gebetszeiten');
  const [j, m] = monat.split('-').map(Number);
  const tageImMonat = new Date(Date.UTC(j, m, 0)).getUTCDate();
  const daten = Array.from({ length: tageImMonat }, (_, i) => `${monat}-${String(i + 1).padStart(2, '0')}`);
  const { tage, stand } = await tageFuer(einstellung, daten);
  return {
    monat,
    tage: tage.map((t) => ({ ...t, ramadan: istRamadan(t.datum) })),
    quelle: quelleVon(tage),
    bestaetigt: einstellung.bestaetigt,
    stand,
  };
}

/**
 * Kennung des Gebetszeiten-Stands für die Moschee-Anzeige (ADR 0048): ändert sich mit jeder Änderung der Tabelle (Import,
 * Abgleich) und der Einstellung, nicht mit dem Tageswechsel. Die Anzeige lädt neu, sobald sie sich ändert.
 */
export async function ladeGebetszeitenKennung(): Promise<string> {
  'use cache: remote';
  cacheLife('days');
  cacheTag(TAG.gebetszeiten, TAG.einstellungen);
  const einstellung = await ladeEinstellung('gebetszeiten');
  let tabelle = '';
  if (datenbankVerfuegbar()) {
    const [z] = await db.select({ zuletzt: max(schema.gebetszeitTag.aktualisiertAm), anzahl: count() }).from(schema.gebetszeitTag);
    tabelle = `${z?.zuletzt?.toISOString() ?? '-'}|${z?.anzahl ?? 0}`;
  }
  return createHash('sha256')
    .update(`${tabelle}|${JSON.stringify(einstellung)}`)
    .digest('hex')
    .slice(0, 16);
}
