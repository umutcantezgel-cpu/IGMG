import 'server-only';
import { and, desc, inArray, isNotNull, isNull, like, lt, lte, ne, sql } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { protokolliereModeration } from '@/lib/chat/dienst';
import { inaktiveKontenLauf } from '@/lib/konto/inaktiv';
import { KINDER_DOMAIN } from '@/lib/konto/regeln';
import { MAX_VERSUCHE } from '@/lib/mail/ausgang';
import { nachweisFrist } from './fristen';

/**
 * Löschfristen der Gemeinde-Plattform (DSFA D-04, D-05, D-10, D-13, D-14, D-16; Löschkonzept). Läuft im täglichen
 * Löschlauf (`/api/wartung/loeschfristen`), idempotent. Die Fristen sind Vorschläge der DSFA, bis Vorstand und DSB
 * entscheiden (MENSCHEN MN-11); Änderung nur hier und im Löschkonzept.
 */
export const GEMEINDE_FRISTEN = {
  /** D-04: Moderationsprotokoll 3 Jahre ab Eintrag. */
  protokollTage: 3 * 365,
  /** D-05: Höchstfrist offener Chat-Meldungen, 12 Monate nach Eingang (davor Hinweis im Startklar-Cockpit). */
  meldungOffenTage: 365,
  /** D-13: nicht zustellbare Mails (alle Versuche verbraucht) nach 30 Tagen. */
  mailFehlTage: 30,
  /** D-16: Audit-Protokoll 12 Monate. */
  auditTage: 365,
  /** D-14: Einwilligungsnachweise ohne Lernende bis zum Ende der Verjährung (3 Jahre ab Jahresende, `nachweisFrist`). */
  nachweisJahre: 3,
  /** D-16: Gemeinde-Konten ohne Anmeldung 24 Monate, Vorwarnung 30 Tage vorher (`src/lib/konto/inaktiv.ts`). */
  inaktivMonate: 24,
} as const;

/** Einstellung mit dem Hash des zuletzt gelöschten Protokolleintrags: Anfang der Kette für die Prüfung (S-10). */
export const PROTOKOLL_ANKER = 'moderationsprotokoll_anker';

const vor = (jetzt: Date, tage: number) => new Date(jetzt.getTime() - tage * 86_400_000);

export type GemeindeLoeschErgebnis = {
  lernende: number;
  kinderkonten: number;
  offeneMeldungen: number;
  protokoll: number;
  mails: number;
  audit: number;
  /** D-14: abgelaufene Einwilligungsnachweise ohne Lernende */
  nachweise: number;
  /** D-16: Vorwarnungen an inaktive Konten bzw. gelöschte inaktive Konten */
  inaktivGewarnt: number;
  inaktivGeloescht: number;
};

export async function gemeindeLoeschlauf(jetzt = new Date()): Promise<GemeindeLoeschErgebnis> {
  // D-10: Lernende nach Ablauf ihrer Frist (gesetzt beim Austritt: 12 Monate); Anwesenheit, Fortschritt, Hifz,
  // Fehlmeldungen und Gruppenzuordnung folgen über die Fremdschlüssel.
  // D-14: Die Einwilligungsnachweise bleiben – ohne Bezug zu Lernenden und Konto, also ohne Namen – bis zum Ende der
  // Verjährung (3 Jahre ab Ende des Jahres) erhalten; der Fremdschlüssel setzt `lernende_id` auf null.
  const lernende = await db.transaction(async (tx) => {
    const faellig = await tx
      .select({ id: schema.lernende.id })
      .from(schema.lernende)
      .where(and(isNotNull(schema.lernende.loeschenAb), lte(schema.lernende.loeschenAb, jetzt)));
    if (!faellig.length) return [];
    const ids = faellig.map((l) => l.id);
    await tx
      .update(schema.kontoEinwilligung)
      .set({ aufbewahrenBis: nachweisFrist(jetzt), benutzerId: null })
      .where(inArray(schema.kontoEinwilligung.lernendeId, ids));
    return tx.delete(schema.lernende).where(inArray(schema.lernende.id, ids)).returning({ id: schema.lernende.id });
  });

  // D-14: Nachweise ohne Bezug, die noch keine Frist haben (Altbestand), bekommen sie jetzt; abgelaufene gehen
  const k = schema.kontoEinwilligung;
  await db
    .update(k)
    .set({ aufbewahrenBis: nachweisFrist(jetzt) })
    .where(and(isNull(k.lernendeId), isNull(k.benutzerId), isNull(k.aufbewahrenBis)));
  const nachweise = await db
    .delete(k)
    .where(and(isNull(k.lernendeId), isNull(k.benutzerId), isNotNull(k.aufbewahrenBis), lte(k.aufbewahrenBis, jetzt)))
    .returning({ id: k.id });

  // Kinderkonten (.invalid) ohne Lernende: Zugang endet mit dem Datensatz (N-6 der Sicherheitsprüfung S1)
  const kinderkonten = await db
    .delete(schema.user)
    .where(
      and(
        like(schema.user.email, `%@${KINDER_DOMAIN}`),
        sql`not exists (select 1 from lernende where lernende.benutzer_id = ${schema.user.id})`,
      ),
    )
    .returning({ id: schema.user.id });

  // D-13: Mails, die nie zugestellt werden konnten
  const mails = await db
    .delete(schema.mailAusgang)
    .where(
      and(
        isNull(schema.mailAusgang.gesendetAm),
        sql`${schema.mailAusgang.versuche} >= ${MAX_VERSUCHE}`,
        lt(schema.mailAusgang.erstelltAm, vor(jetzt, GEMEINDE_FRISTEN.mailFehlTage)),
      ),
    )
    .returning({ id: schema.mailAusgang.id });

  // D-16: Audit-Protokoll
  const audit = await db
    .delete(schema.auditEintrag)
    .where(lt(schema.auditEintrag.zeitpunkt, vor(jetzt, GEMEINDE_FRISTEN.auditTage)))
    .returning({ id: schema.auditEintrag.id });

  // D-05 und D-04 in einer Transaktion: Der Trigger erlaubt das Löschen im Protokoll nur im Löschlauf
  const { offeneMeldungen, protokoll } = await db.transaction(async (tx) => {
    const offen = await tx
      .delete(schema.chatMeldung)
      .where(
        and(ne(schema.chatMeldung.status, 'erledigt'), lt(schema.chatMeldung.erstelltAm, vor(jetzt, GEMEINDE_FRISTEN.meldungOffenTage))),
      )
      .returning({ id: schema.chatMeldung.id });
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext('igmg:moderationsprotokoll'))`);
    const [letzteAlte] = await tx
      .select({ id: schema.moderationsprotokoll.id, hash: schema.moderationsprotokoll.hash })
      .from(schema.moderationsprotokoll)
      .where(lt(schema.moderationsprotokoll.zeitpunkt, vor(jetzt, GEMEINDE_FRISTEN.protokollTage)))
      .orderBy(desc(schema.moderationsprotokoll.id))
      .limit(1);
    let geloescht = 0;
    if (letzteAlte) {
      await tx.execute(sql`set local igmg.loeschlauf = '1'`);
      const weg = await tx
        .delete(schema.moderationsprotokoll)
        .where(lte(schema.moderationsprotokoll.id, letzteAlte.id))
        .returning({ id: schema.moderationsprotokoll.id });
      geloescht = weg.length;
      // Der Hash des letzten gelöschten Eintrags ist der Vorgänger des ersten verbleibenden: neuer Kettenanfang
      const anker = JSON.stringify({ hash: letzteAlte.hash, bisId: letzteAlte.id, zeit: jetzt.toISOString() });
      await tx.execute(sql`insert into einstellung (schluessel, wert) values (${PROTOKOLL_ANKER}, ${anker}::jsonb)
        on conflict (schluessel) do update set wert = excluded.wert, geaendert_am = now()`);
    }
    if (offen.length || geloescht)
      await protokolliereModeration(tx, {
        kanalId: null,
        nachrichtId: null,
        akteurId: null,
        aktion: 'loeschlauf',
        grund: `Offene Meldungen nach Höchstfrist ${offen.length}, Protokolleinträge älter als 3 Jahre ${geloescht}`,
      });
    return { offeneMeldungen: offen.length, protokoll: geloescht };
  });

  // D-16: inaktive Gemeinde-Konten (24 Monate ohne Anmeldung, Vorwarnung 30 Tage vorher; Kinderkonten über die Eltern)
  const inaktiv = await inaktiveKontenLauf(jetzt);

  return {
    lernende: lernende.length,
    kinderkonten: kinderkonten.length,
    offeneMeldungen,
    protokoll,
    mails: mails.length,
    audit: audit.length,
    nachweise: nachweise.length,
    inaktivGewarnt: inaktiv.gewarnt,
    inaktivGeloescht: inaktiv.geloescht,
  };
}
