import 'server-only';
import { and, eq, gt, isNull, lte, or } from 'drizzle-orm';
import { cacheLife, cacheTag } from 'next/cache';
import { TAG } from '@/lib/cache/tags';
import { db, schema } from '@/lib/db';
import type { Mehrsprachig } from '@/lib/db/schema/typen';

/** Öffentliche Ankündigung für den Block oberhalb der Nachrichten (E-033); serialisierbar für den Cache. */
export type AnkuendigungDaten = {
  id: string;
  titel: Mehrsprachig;
  inhalt: Mehrsprachig;
  prioritaet: 'niedrig' | 'mittel' | 'hoch';
  link: string | null;
};

const RANG: Record<AnkuendigungDaten['prioritaet'], number> = { hoch: 0, mittel: 1, niedrig: 2 };

/**
 * Sichtbar zum Zeitpunkt `jetzt` (E-033): veröffentlicht, nicht im Papierkorb, `sichtbarAb ≤ jetzt < laeuftAb`.
 * NULL bedeutet offen (ohne Beginn bzw. ohne Ende). Sortierung: Priorität hoch → niedrig, dann neueste zuerst
 * (Beginn der Sichtbarkeit, sonst Anlage).
 */
export async function sichtbareAnkuendigungen(jetzt: Date): Promise<AnkuendigungDaten[]> {
  const a = schema.ankuendigung;
  const zeilen = await db
    .select()
    .from(a)
    .where(
      and(
        eq(a.status, 'veroeffentlicht'),
        isNull(a.imPapierkorbSeit),
        or(isNull(a.sichtbarAb), lte(a.sichtbarAb, jetzt)),
        or(isNull(a.laeuftAb), gt(a.laeuftAb, jetzt)),
      ),
    );
  return zeilen
    .sort(
      (x, y) =>
        RANG[x.prioritaet] - RANG[y.prioritaet] || (y.sichtbarAb ?? y.erstelltAm).getTime() - (x.sichtbarAb ?? x.erstelltAm).getTime(),
    )
    .map((z) => ({ id: z.id, titel: z.titel, inhalt: z.inhalt, prioritaet: z.prioritaet, link: z.link }));
}

/**
 * Block „Ankündigungen“ der Nachrichtenseite: Cache-Tag `ankuendigungen`, Ablauf stündlich. Eine Änderung in der
 * Verwaltung verfällt den Cache sofort über `inhaltGeaendert`; ein späterer Beginn über den Minutentakt, einen Takt vor
 * dem Ankündigungs-Push (`sendeFaelligeAnkuendigungen`, nur mit Schalter `push`); sonst wirken Beginn und Ende einer
 * Laufzeit spätestens nach einer Stunde.
 */
export async function ladeAnkuendigungen(): Promise<AnkuendigungDaten[]> {
  'use cache: remote';
  cacheLife('hours');
  cacheTag(TAG.ankuendigungen);
  return sichtbareAnkuendigungen(new Date());
}
