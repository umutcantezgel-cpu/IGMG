import 'server-only';
import { sql } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { hmac } from '@/lib/krypto';

/**
 * Ratenbegrenzung öffentlicher Formulare (K-07, ADR 0005, S3). Festes Zeitfenster je Schlüssel;
 * der Schlüssel ist ein HMAC aus IP und Formular – die IP wird nie gespeichert.
 * Ein einziges atomares UPSERT, damit parallele Anfragen korrekt zählen.
 */
export type Grenze = { max: number; fensterSekunden: number };

export const STANDARD_GRENZE: Grenze = { max: 5, fensterSekunden: 600 };

export async function pruefeRate(
  formular: string,
  ip: string,
  grenze: Grenze = STANDARD_GRENZE,
  /** In einer Transaktion: deren `tx` (zählt dann nur, wenn sie gelingt). */
  ausfuehrer: Pick<typeof db, 'insert'> = db,
): Promise<{ erlaubt: boolean; zaehler: number }> {
  const schluessel = hmac(`${formular}|${ip}`, 'RATE_GEHEIMNIS');
  const intervall = `${grenze.fensterSekunden} seconds`;
  const [zeile] = await ausfuehrer
    .insert(schema.ratenbegrenzung)
    .values({ schluessel, fensterStart: sql`now()`, zaehler: 1 })
    .onConflictDoUpdate({
      target: schema.ratenbegrenzung.schluessel,
      set: {
        zaehler: sql`case when ${schema.ratenbegrenzung.fensterStart} < now() - ${intervall}::interval then 1 else ${schema.ratenbegrenzung.zaehler} + 1 end`,
        fensterStart: sql`case when ${schema.ratenbegrenzung.fensterStart} < now() - ${intervall}::interval then now() else ${schema.ratenbegrenzung.fensterStart} end`,
      },
    })
    .returning({ zaehler: schema.ratenbegrenzung.zaehler });
  const zaehler = zeile?.zaehler ?? 1;
  return { erlaubt: zaehler <= grenze.max, zaehler };
}

/** Alte Fenster entfernen (Wartungsroute). */
export async function raeumeRatenAuf(): Promise<void> {
  await db.delete(schema.ratenbegrenzung).where(sql`${schema.ratenbegrenzung.fensterStart} < now() - interval '1 day'`);
}
