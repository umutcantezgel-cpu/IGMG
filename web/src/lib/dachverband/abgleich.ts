import 'server-only';
import { eq } from 'drizzle-orm';
import { protokolliere } from '@/lib/audit';
import { db, schema } from '@/lib/db';
import { mitSperre } from '@/lib/wartung/sperre';
import { schema as dachverbandSchema, type DachverbandEintrag } from '@/lib/validierung/seiteninhalte/dachverband';
import { FeedFehler, holeFeed, type Abruf, type FeedEintrag } from './feed';
import { fuehreZusammen } from './zusammenfuehren';

/**
 * Abgleich „Aus dem Dachverband“ mit dem Hutba-Feed der IGMG (Plan Marktstart P3, ADR 0046). Läuft nur aus dem Cron bzw.
 * der Wartungsroute und aus der Verwaltung – nie beim Seitenaufruf (K-14). Ablauf:
 * 1. Feed holen und lesen (`feed.ts`: nur Titel, Link, Datum; außerhalb der Sperre).
 * 2. Unter `mitSperre('dachverband-abgleich')` in **einer** Transaktion den Seiteninhalt sperren und lesen, neue
 *    Freitagspredigten (Art `hutba`, Herkunft `feed`) vorn einfügen. Vorhandene Einträge – gleiche Kennung oder gleiche
 *    Adresse, auch von der Redaktion ausgeblendete – werden nie überschrieben und nie wieder sichtbar gemacht.
 * 3. Über der Obergrenze (`DACHVERBAND_MAX`) fallen zuerst die ältesten Feed-Einträge weg, die nicht mehr im Feed
 *    stehen (Einträge der Redaktion bleiben immer); reicht das nicht, werden die ältesten neuen Predigten nicht übernommen.
 * 4. Schreiben mit `istBeispiel = false`, Quelle `dachverband-feed` und Audit `dachverband.abgleich` (ohne Personendaten).
 * Die Cache-Tags erneuert der Aufrufer, nur bei `geaendert`: die Route mit `revalidateTag`, eine Action mit
 * `inhaltGeaendert`. Ein gespeicherter Inhalt, der nicht zum Schema passt, wird nie überschrieben (Status `fehler`).
 */
export const BEREICH = 'dachverband';
export const QUELLE = 'dachverband-feed';
const SPERRE = 'dachverband-abgleich';

export type DachverbandAbgleichStatus = 'ok' | 'unveraendert' | 'fehler' | 'uebersprungen';

export type DachverbandAbgleichErgebnis = {
  status: DachverbandAbgleichStatus;
  trocken: boolean;
  /** Gültige Einträge im Feed */
  geprueft: number;
  /** Neu übernommen (bzw. im Trockenlauf: würden übernommen) */
  neu: number;
  /** Schon vorhanden (gleiche Kennung oder Adresse), auch ausgeblendete */
  vorhanden: number;
  /** Im Feed, aber nicht übernommen (fremder Host, Versangabe, ohne Datum …) */
  abgewiesen: number;
  /** Ältere Feed-Einträge, die wegen der Obergrenze entfernt wurden */
  entfernt: number;
  fehlerCode: string | null;
  /** true, wenn geschrieben wurde: Der Aufrufer erneuert dann den Tag `seiteninhalt:dachverband` */
  geaendert: boolean;
  /** Die neuen Einträge (für die Verwaltung, die sie in ihren Bearbeitungsstand übernimmt) */
  neueEintraege: DachverbandEintrag[];
  /** Kennungen der entfernten Einträge (die Verwaltung nimmt sie aus ihrem Bearbeitungsstand, sonst scheitert das Speichern an der Obergrenze) */
  entfernteSchluessel: string[];
};

const leer = (o: Partial<DachverbandAbgleichErgebnis>): DachverbandAbgleichErgebnis => ({
  status: 'unveraendert',
  trocken: false,
  geprueft: 0,
  neu: 0,
  vorhanden: 0,
  abgewiesen: 0,
  entfernt: 0,
  fehlerCode: null,
  geaendert: false,
  neueEintraege: [],
  entfernteSchluessel: [],
  ...o,
});

type Bestand = { ok: true; eintraege: DachverbandEintrag[] } | { ok: false };

function bestandAus(zeile: { inhalt: unknown } | undefined): Bestand {
  if (!zeile) return { ok: true, eintraege: [] };
  const p = dachverbandSchema.safeParse(zeile.inhalt);
  return p.success ? { ok: true, eintraege: p.data.eintraege } : { ok: false };
}

export async function gleicheDachverbandAb(
  o: {
    jetzt?: Date;
    trocken?: boolean;
    /** Tests: eingesetzter Abruf statt `fetch` */
    abruf?: Abruf;
    warte?: (ms: number) => Promise<void>;
    signal?: AbortSignal;
    /** Verwaltung: wer den Abgleich ausgelöst hat (Audit); Cron und Wartung: null */
    benutzerId?: string | null;
  } = {},
): Promise<DachverbandAbgleichErgebnis> {
  const trocken = o.trocken === true;
  const jetzt = o.jetzt ?? new Date();
  let feed: FeedEintrag[];
  let abgewiesen: number;
  try {
    const gelesen = await holeFeed({ abruf: o.abruf, warte: o.warte, signal: o.signal });
    feed = gelesen.eintraege;
    abgewiesen = gelesen.abgewiesen;
  } catch (fehler) {
    return leer({ status: 'fehler', trocken, fehlerCode: fehler instanceof FeedFehler ? fehler.code : 'unbekannt' });
  }
  const basis = { trocken, geprueft: feed.length, abgewiesen };
  const s = schema.seiteninhalt;

  if (trocken) {
    const [zeile] = await db.select({ inhalt: s.inhalt }).from(s).where(eq(s.bereich, BEREICH)).limit(1);
    const bestand = bestandAus(zeile);
    if (!bestand.ok) return leer({ ...basis, status: 'fehler', fehlerCode: 'unlesbar' });
    const z = fuehreZusammen(bestand.eintraege, feed);
    return leer({
      ...basis,
      status: z.neu.length || z.entfernt ? 'ok' : 'unveraendert',
      neu: z.neu.length,
      vorhanden: z.vorhanden,
      entfernt: z.entfernt,
      neueEintraege: z.neu,
      entfernteSchluessel: z.entfernteSchluessel,
    });
  }

  const lauf = await mitSperre(SPERRE, async () =>
    db.transaction(async (tx) => {
      // Zeile sperren: Ein gleichzeitiges Speichern in der Verwaltung wartet, statt still überschrieben zu werden
      const [zeile] = await tx.select({ inhalt: s.inhalt }).from(s).where(eq(s.bereich, BEREICH)).limit(1).for('update');
      const bestand = bestandAus(zeile);
      if (!bestand.ok) return leer({ ...basis, status: 'fehler', fehlerCode: 'unlesbar' });
      const z = fuehreZusammen(bestand.eintraege, feed);
      if (!z.neu.length && !z.entfernt) return leer({ ...basis, status: 'unveraendert', vorhanden: z.vorhanden });
      const geprueft = dachverbandSchema.safeParse({ eintraege: z.eintraege });
      if (!geprueft.success) return leer({ ...basis, status: 'fehler', fehlerCode: 'schema', vorhanden: z.vorhanden });
      const inhalt = geprueft.data;
      await tx
        .insert(s)
        .values({
          bereich: BEREICH,
          inhalt,
          istBeispiel: false,
          quelle: QUELLE,
          aktualisiertVon: o.benutzerId ?? null,
          aktualisiertAm: jetzt,
        })
        .onConflictDoUpdate({
          target: s.bereich,
          set: { inhalt, istBeispiel: false, quelle: QUELLE, aktualisiertVon: o.benutzerId ?? null, aktualisiertAm: jetzt },
        });
      await protokolliere(
        {
          benutzerId: o.benutzerId ?? null,
          aktion: 'dachverband.abgleich',
          zielTyp: 'seiteninhalt',
          zielId: BEREICH,
          details: { neu: z.neu.length, vorhanden: z.vorhanden, entfernt: z.entfernt, abgewiesen, geprueft: feed.length },
        },
        tx,
      );
      return leer({
        ...basis,
        status: 'ok',
        neu: z.neu.length,
        vorhanden: z.vorhanden,
        entfernt: z.entfernt,
        geaendert: true,
        neueEintraege: z.neu,
        entfernteSchluessel: z.entfernteSchluessel,
      });
    }),
  );
  return lauf.uebersprungen ? leer({ ...basis, status: 'uebersprungen' }) : lauf.ergebnis;
}
