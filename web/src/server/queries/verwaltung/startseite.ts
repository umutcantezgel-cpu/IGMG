import 'server-only';
import { and, desc, eq } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { ordnungAus, STARTSEITE_EINSTELLUNG, type StartseitenOrdnung } from '@/lib/startseite/abschnitte';

/** Verwaltung „Startseite“ (F-40), ohne Cache. Aufrufer prüfen `startseite.bearbeiten`. */
export type StartseitenFassung = {
  id: string;
  erstelltAm: Date;
  von: string | null;
  kommentar: string | null;
  ordnung: StartseitenOrdnung;
};

export type StartseiteVerwaltung = {
  /** Gilt jetzt auf der Website (gespeichert oder Bestand). */
  ordnung: StartseitenOrdnung;
  /** Wann und von wem zuletzt gespeichert; null = es gilt der Bestand. */
  gespeichert: { am: Date; von: string | null } | null;
  /** Letzte Fassungen (neueste zuerst, höchstens 10). */
  verlauf: StartseitenFassung[];
};

export async function ladeStartseiteVerwaltung(): Promise<StartseiteVerwaltung> {
  const e = schema.einstellung;
  const r = schema.revision;
  const [[zeile], fassungen] = await Promise.all([
    db
      .select({ wert: e.wert, am: e.geaendertAm, von: schema.user.name })
      .from(e)
      .leftJoin(schema.user, eq(schema.user.id, e.geaendertVon))
      .where(eq(e.schluessel, STARTSEITE_EINSTELLUNG))
      .limit(1),
    db
      .select({ id: r.id, erstelltAm: r.erstelltAm, von: schema.user.name, kommentar: r.kommentar, inhalt: r.inhalt })
      .from(r)
      .leftJoin(schema.user, eq(schema.user.id, r.erstelltVon))
      .where(and(eq(r.inhaltTyp, 'startseite'), eq(r.inhaltId, STARTSEITE_EINSTELLUNG)))
      .orderBy(desc(r.erstelltAm), desc(r.id))
      .limit(10),
  ]);
  return {
    ordnung: ordnungAus(zeile?.wert ?? null),
    gespeichert: zeile ? { am: zeile.am, von: zeile.von } : null,
    verlauf: fassungen.map(({ inhalt, ...f }) => ({ ...f, ordnung: ordnungAus(inhalt) })),
  };
}
