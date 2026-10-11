import 'server-only';
import { eq } from 'drizzle-orm';
import type { z } from 'zod';
import { db, schema } from '@/lib/db';
import { SEITENINHALT, type SeitenBereich } from '@/lib/validierung/seiteninhalte';

/**
 * Abfragen der Verwaltung „Seiteninhalte II“ (C05). Nicht gecacht – Verwaltungsseiten sind dynamisch (ADR 0016);
 * der öffentliche Lesepfad (`ladeSeiteninhalt`, gecacht) bleibt unverändert. Aufrufer prüfen vorher das Recht.
 */
export type VerwaltungsStand<B extends SeitenBereich> = {
  /** Inhalt mit Standardwerten für fehlende Felder (Platzhalter in eckigen Klammern, G-05). */
  inhalt: z.infer<(typeof SEITENINHALT)[B]>;
  /** Gibt es eine gespeicherte Zeile? */
  vorhanden: boolean;
  /** Beispielangaben (oder keine Zeile): Speichern ersetzt sie. */
  istBeispiel: boolean;
  /** Ließ sich die gespeicherte Zeile gegen das Schema lesen? */
  lesbar: boolean;
};

export async function ladeSeiteninhaltFuerVerwaltung<B extends SeitenBereich>(bereich: B): Promise<VerwaltungsStand<B>> {
  const [zeile] = await db.select().from(schema.seiteninhalt).where(eq(schema.seiteninhalt.bereich, bereich)).limit(1);
  const zod = SEITENINHALT[bereich];
  const geprueft = zod.safeParse(zeile?.inhalt ?? {});
  // Fehlt die Zeile oder ist sie unlesbar, zeigt die Verwaltung die Standardwerte (wie die öffentliche Seite)
  const inhalt = geprueft.success ? geprueft.data : zod.parse({});
  return {
    inhalt: inhalt as VerwaltungsStand<B>['inhalt'],
    vorhanden: Boolean(zeile),
    istBeispiel: zeile ? zeile.istBeispiel : true,
    lesbar: zeile ? geprueft.success : true,
  };
}
