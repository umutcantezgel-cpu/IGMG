import 'server-only';
import { and, eq, gt, isNotNull, isNull, or } from 'drizzle-orm';
import { connection } from 'next/server';
import { db, schema } from '@/lib/db';
import { sha256 } from '@/lib/krypto';

/**
 * Lädt eine gültige (nicht abgelaufene, nicht angenommene, nicht widerrufene) Einladung. Wartet sie auf die Freigabe
 * durch eine zweite Person (Eltern-Einladung außerhalb der Voranmeldung, Nacharbeit N4), gilt sie noch nicht.
 * Bewusst KEINE Server Action (nicht vom Client aufrufbar). Liest die aktuelle Zeit → je Anfrage.
 */
export async function ladeGueltigeEinladung(token: string) {
  await connection();
  if (!token || token.length > 100) return null;
  const [e] = await db
    .select({
      id: schema.einladung.id,
      email: schema.einladung.email,
      name: schema.einladung.name,
      rollen: schema.einladung.rollen,
      gemeindeRollen: schema.einladung.gemeindeRollen,
      lernendeId: schema.einladung.lernendeId,
      laeuftAb: schema.einladung.laeuftAb,
      erstelltVon: schema.einladung.erstelltVon,
      freigegebenAm: schema.einladung.freigegebenAm,
    })
    .from(schema.einladung)
    .where(
      and(
        eq(schema.einladung.tokenHash, sha256(token)),
        isNull(schema.einladung.angenommenAm),
        isNull(schema.einladung.widerrufenAm),
        gt(schema.einladung.laeuftAb, new Date()),
        or(eq(schema.einladung.freigabeNoetig, false), isNotNull(schema.einladung.freigegebenAm)),
      ),
    )
    .limit(1);
  return e ?? null;
}
