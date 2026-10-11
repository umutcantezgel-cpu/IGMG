import 'server-only';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db, schema } from '@/lib/db';
import { EINGANG_ARTEN, type EingangArt } from './arten';

/**
 * Löschfristen je Eingangsart in Tagen (C16, M-050, G-07): gespeichert in `einstellung` unter `loeschfristen`.
 * Vorgabe (M-050, bitte fachlich prüfen): 180 Tage nach Abschluss; Veranstaltungsanmeldungen 30 Tage nach dem Termin
 * (die Frist der Anmeldung setzt schon das Formular, hier nur Rückfall nach Abschluss).
 */
export const STANDARD_FRISTEN: Record<EingangArt, number> = {
  voranmeldung: 180,
  veranstaltungsanmeldung: 30,
  mitgliedsantrag: 180,
  kontakt: 180,
  moschee_anfrage: 180,
};

export const fristenSchema = z.object(
  Object.fromEntries(
    EINGANG_ARTEN.map((a) => [a, z.coerce.number('ungueltig').int('ungueltig').min(1, 'ungueltig').max(3650, 'ungueltig')]),
  ) as Record<EingangArt, z.ZodCoercedNumber<unknown>>,
);

export const FRISTEN_SCHLUESSEL = 'loeschfristen';

/**
 * Höchstfrist für nicht abgeschlossene Eingänge (Tor B/C SP-B B4, G-07): Was niemand bearbeitet, bleibt nicht
 * unbegrenzt liegen. Gilt ab Eingang bzw. ab Wiederöffnen; der Abschluss setzt die (kürzere) Frist nach Art.
 */
export const HOECHSTFRIST_OFFEN_TAGE = 365;

export function hoechstfristOffen(ab: Date): Date {
  return new Date(ab.getTime() + HOECHSTFRIST_OFFEN_TAGE * 86_400_000);
}

export async function ladeLoeschfristen(): Promise<Record<EingangArt, number>> {
  const [z0] = await db
    .select({ wert: schema.einstellung.wert })
    .from(schema.einstellung)
    .where(eq(schema.einstellung.schluessel, FRISTEN_SCHLUESSEL));
  const geprueft = fristenSchema.partial().safeParse(z0?.wert ?? {});
  return { ...STANDARD_FRISTEN, ...(geprueft.success ? geprueft.data : {}) } as Record<EingangArt, number>;
}

/** Löschzeitpunkt nach Abschluss; eine schon früher gesetzte Frist (z. B. Anmeldung nach Termin) bleibt. */
export function loeschenNachAbschluss(
  art: EingangArt,
  abgeschlossenAm: Date,
  fristen: Record<EingangArt, number>,
  bisher: Date | null,
): Date {
  const neu = new Date(abgeschlossenAm.getTime() + fristen[art] * 86_400_000);
  return bisher && bisher < neu ? bisher : neu;
}
