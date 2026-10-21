import 'server-only';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { asc } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { LERNAPP_DATENSAETZE, leseQuelleMd, type DatensatzZweck, type QuellenBeschreibung } from '@/lib/lernapp/verwaltung/quellen';

/**
 * Quellenregister der Lern-App-Verwaltung (L3-06): `QUELLE.md` der gepinnten Datensätze aus `web/daten/` (zur Laufzeit gelesen;
 * die Dateien nimmt `outputFileTracingIncludes` in den Funktionsbau mit) und die Werke des Wissenskurses aus der Datenbank.
 */
export type DatensatzZeile = { ordner: string; zweck: DatensatzZweck; beschreibung: QuellenBeschreibung | null };

export async function ladeDatensaetze(daten = join(process.cwd(), 'daten')): Promise<DatensatzZeile[]> {
  return Promise.all(
    LERNAPP_DATENSAETZE.map(async (d) => {
      try {
        const text = await readFile(/*turbopackIgnore: true*/ join(daten, d.ordner, 'QUELLE.md'), 'utf8');
        return { ordner: d.ordner, zweck: d.zweck, beschreibung: leseQuelleMd(text) };
      } catch {
        return { ordner: d.ordner, zweck: d.zweck, beschreibung: null };
      }
    }),
  );
}

/** Werke und Ausgaben des Quellenregisters (Wissen, L6; nur Metadaten). */
export async function ladeQuellenregister() {
  return db
    .select({
      kurz: schema.lernappQuelle.kurz,
      werk: schema.lernappQuelle.werk,
      autor: schema.lernappQuelle.autor,
      ausgabe: schema.lernappQuelle.ausgabe,
      art: schema.lernappQuelle.art,
      lizenz: schema.lernappQuelle.lizenz,
      sha256: schema.lernappQuelle.sha256,
      nurVerweis: schema.lernappQuelle.nurVerweis,
    })
    .from(schema.lernappQuelle)
    .orderBy(asc(schema.lernappQuelle.kurz));
}
