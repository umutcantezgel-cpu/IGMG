import { and, eq } from 'drizzle-orm';
import { DACHVERBAND_BEISPIEL, DACHVERBAND_QUELLE } from '../../../drizzle/seeds/bereiche/dachverband';
import { HADSCH_UMRA_BEISPIEL, HADSCH_UMRA_QUELLE } from '../../../drizzle/seeds/bereiche/hadsch-umra';
import { IGMG_BEISPIEL, IGMG_QUELLE } from '../../../drizzle/seeds/bereiche/igmg';
import { ORGANISATIONEN_BEISPIEL } from '../../../drizzle/seeds/bereiche/organisationen';
import { UEBER_UNS_BEISPIEL, UEBER_UNS_QUELLE } from '../../../drizzle/seeds/bereiche/ueber-uns';
import { VORSTAND_BEISPIEL, VORSTAND_QUELLE } from '../../../drizzle/seeds/bereiche/vorstand';
import { VIDEOS_IGMG_REISEN } from '../../../drizzle/seeds/bereiche/wissen';
import { legeFehlendeEntwuerfeAn } from '../../../drizzle/seeds/bereiche/wissen-entwuerfe';
import { wissenInhalt, type WissenInhalt } from '@/components/website/wissen/inhalt';
import { protokolliere } from '@/lib/audit';
import type { Datenbank, Transaktion } from '@/lib/db';
import * as schema from '@/lib/db/schema';
import { schema as dachverbandSchema } from '@/lib/validierung/seiteninhalte/dachverband';
import { schema as hadschUmraSchema } from '@/lib/validierung/seiteninhalte/hadsch-umra';
import { schema as igmgSchema } from '@/lib/validierung/seiteninhalte/igmg';
import { schema as organisationSchema } from '@/lib/validierung/seiteninhalte/organisation';
import { schema as ueberUnsSchema } from '@/lib/validierung/seiteninhalte/ueber-uns';
import { schema as vorstandSchema } from '@/lib/validierung/seiteninhalte/vorstand';
import { bringeAufSeedStand, protokolliereMigration, type SeedStand, type StandAusgang } from './seed-stand';
import { sperreInhaltsstaende } from './sperre';
import { stabil } from './stand-2026';

/**
 * Inhaltsstand „Marktstart IGMG“ (Welle 3, E-044, Nachtrag ADR 0019): Die Pakete P1–P8 haben die Seeds von „igmg“,
 * „ueber-uns“, „vorstand“, den vier Organisationen sowie die neuen Bereiche „dachverband“ und „hadsch-umra“ auf belegte
 * Fakten gebracht (Gründungsjahr 1978, Broschüre Juni 2026; ohne die unbelegten Werte 518 und 350.000). Seeds laufen
 * idempotent mit `onConflictDoNothing` – bestehende Datenbanken behielten den alten Beispielstand. Diese Migration bringt
 * **nur Beispielinhalte** (`ist_beispiel = true`) auf den Seed-Stand und legt fehlende Bereiche an (`seed-stand.ts`).
 * Redaktionell Gespeichertes bleibt unberührt; das gilt auch für „dachverband“, sobald der Hutba-Abgleich geschrieben hat
 * (er setzt `ist_beispiel = false`). Dazu:
 * - Seiteninhalt „wissen“: nur die zwei Videos von IGMG Reisen ergänzen (`VIDEOS_IGMG_REISEN`), solange Beispielinhalt;
 * - KI-Entwürfe der Wissensthemen (ADR 0047): nur Slugs anlegen, die fehlen und die diese Datenbank nie bekommen hat
 *   (Merker in `einstellung`, `legeFehlendeEntwuerfeAn` im Seed `wissen-entwuerfe`, mit Freigabe-Antrag) – endgültig
 *   Gelöschtes legt kein Bau neu an.
 * Eine Transaktion unter der Sperre der Inhaltsstände (`sperre.ts`): Zwei Bauläufe gegen dieselbe Datenbank laufen nacheinander.
 * Reihenfolge mit `inhalte-2026`: egal – der Seed „ueber-uns“ endet mit der Station „Eröffnung“, `ueberUnsNeu()` hat
 * danach nichts zu tun (Tests: tests/unit und tests/integration „inhalte-marktstart“). Aufruf: `pnpm inhalte:marktstart`.
 */
export const MIGRATION = 'inhalte-marktstart';

/** Zielstände in Anwendungsreihenfolge; jeder Seed wird gegen das Schema seines Bereichs geprüft. */
export function marktstartStaende(): SeedStand[] {
  return [
    { bereich: 'igmg', inhalt: igmgSchema.parse(IGMG_BEISPIEL), quelle: IGMG_QUELLE },
    { bereich: 'ueber-uns', inhalt: ueberUnsSchema.parse(UEBER_UNS_BEISPIEL), quelle: UEBER_UNS_QUELLE },
    { bereich: 'vorstand', inhalt: vorstandSchema.parse(VORSTAND_BEISPIEL), quelle: VORSTAND_QUELLE },
    ...ORGANISATIONEN_BEISPIEL.map((o) => ({
      bereich: `organisation-${o.slug}`,
      inhalt: organisationSchema.parse(o.inhalt),
      quelle: o.quelle,
    })),
    { bereich: 'dachverband', inhalt: dachverbandSchema.parse(DACHVERBAND_BEISPIEL), quelle: DACHVERBAND_QUELLE },
    { bereich: 'hadsch-umra', inhalt: hadschUmraSchema.parse(HADSCH_UMRA_BEISPIEL), quelle: HADSCH_UMRA_QUELLE },
  ];
}

/**
 * Seiteninhalt „wissen“ mit den Videos von IGMG Reisen: fehlende (nach `schluessel`) werden angehängt, abweichende auf den
 * Seed-Stand gesetzt; alle übrigen Artikel, Videos und Experten bleiben. null, wenn nichts zu tun ist oder der gespeicherte
 * Inhalt nicht gültig ist (dann bleibt er, wie er ist).
 */
export function wissenVideosNeu(alt: unknown): WissenInhalt | null {
  const gelesen = wissenInhalt.safeParse(alt);
  if (!gelesen.success) return null;
  const ziel = wissenInhalt.parse({ videos: VIDEOS_IGMG_REISEN }).videos;
  const videos = gelesen.data.videos.map((v) => ziel.find((z) => z.schluessel === v.schluessel) ?? v);
  for (const z of ziel) if (!videos.some((v) => v.schluessel === z.schluessel)) videos.push(z);
  const neu = wissenInhalt.parse({ ...gelesen.data, videos });
  return stabil(neu) === stabil(gelesen.data) ? null : neu;
}

export type MarktstartErgebnis = {
  /** Ergebnis je Seiteninhalt-Bereich (Reihenfolge wie `marktstartStaende()`). */
  bereiche: Record<string, StandAusgang>;
  /** Videos im Seiteninhalt „wissen“ („fehlt“: kein Seiteninhalt „wissen“ vorhanden – der Seed legt ihn an). */
  wissenVideos: StandAusgang | 'fehlt';
  /** Neu angelegte KI-Entwürfe (Slugs; nie einer, den diese Datenbank schon einmal hatte). */
  wissenEntwuerfe: string[];
};

async function wissenVideos(tx: Transaktion): Promise<StandAusgang | 'fehlt'> {
  const [z] = await tx
    .select({ inhalt: schema.seiteninhalt.inhalt, istBeispiel: schema.seiteninhalt.istBeispiel })
    .from(schema.seiteninhalt)
    .where(eq(schema.seiteninhalt.bereich, 'wissen'))
    .limit(1);
  if (!z) return 'fehlt';
  if (!z.istBeispiel) return 'redaktionell';
  const neu = wissenVideosNeu(z.inhalt);
  if (!neu) return 'unveraendert';
  const r = await tx
    .update(schema.seiteninhalt)
    .set({ inhalt: neu, aktualisiertVon: null })
    .where(and(eq(schema.seiteninhalt.bereich, 'wissen'), eq(schema.seiteninhalt.istBeispiel, true)))
    .returning({ bereich: schema.seiteninhalt.bereich });
  if (!r.length) return 'redaktionell';
  await protokolliereMigration(tx, MIGRATION, 'wissen', 'aktualisiert');
  return 'aktualisiert';
}

async function wissenEntwuerfe(tx: Transaktion): Promise<string[]> {
  // Nur Slugs, die fehlen und nicht im Merker stehen; Audit nur für wirklich eingefügte Zeilen (`returning`)
  const neu = await legeFehlendeEntwuerfeAn(tx);
  for (const t of neu)
    await protokolliere(
      {
        benutzerId: null,
        aktion: 'inhalt.angelegt',
        zielTyp: 'wissen_thema',
        zielId: t.id,
        details: { migration: MIGRATION, slug: t.slug },
      },
      tx,
    );
  return neu.map((t) => t.slug);
}

/** Führt die Migration in einer Transaktion aus und meldet je Bereich, was geschehen ist. */
export async function wendeStandMarktstartAn(db: Datenbank): Promise<MarktstartErgebnis> {
  const staende = marktstartStaende();
  return db.transaction(async (tx) => {
    await sperreInhaltsstaende(tx);
    const bereiche: Record<string, StandAusgang> = {};
    for (const s of staende) bereiche[s.bereich] = await bringeAufSeedStand(tx, MIGRATION, s);
    return { bereiche, wissenVideos: await wissenVideos(tx), wissenEntwuerfe: await wissenEntwuerfe(tx) };
  });
}
