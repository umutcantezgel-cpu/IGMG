import 'server-only';
import { and, count, eq, inArray, isNotNull, isNull, lt, sql, type SQL } from 'drizzle-orm';
import { protokolliere } from '@/lib/audit';
import { db, schema, type Transaktion } from '@/lib/db';
import { lernappEinwilligung, lernappEinwilligungDetail } from '../sync/server';

/**
 * Folgen von Austritt und Widerruf für Schreibabgaben (S-L2 N-2; ADR 0042 Fortschreibung Nr. 17; Art. 5 Abs. 1 lit. b/c und
 * Art. 17 Abs. 1 lit. b DSGVO). Vorher waren Abgaben nach Austritt oder Widerruf nur verborgen; ein Wiedereintritt (gleiche
 * Mitgliedszeile) oder ein neues Erteilen machte sie samt Kommentar wieder lesbar.
 *
 * - **Austritt** (Mitglied entfernt – in der Verwaltung oder durch die Leitung im Chat, S-09 –, Lernende beendet, Gruppe
 *   archiviert): Die Abgaben dieser Person an diese Gruppe werden von der Gruppe gelöst (`gruppe_id = null`,
 *   `korrigiert_von = null`). Keine Lehrkraft liest sie danach je wieder – auch nicht nach einem Wiedereintritt oder mit
 *   einer neuen Lehrkraft; die Person selbst sieht und löscht sie weiter, bis die Frist (12 Monate) sie löscht.
 * - **Widerruf** der Einwilligung `lernapp`: Abgaben, die keine geltende Einwilligung mehr deckt, werden gelöscht.
 *   Zusätzlich liest die Lehrkraft nur Abgaben, deren Einwilligung schon vor der Abgabe galt (`lernappEinwilligungDetail`
 *   `seit`) – ein neues Erteilen deckt nie die Zeit davor, auch wenn der Widerruf auf einem Weg geschah, der diese Folgen
 *   nicht aufruft. Gilt keine Einwilligung mehr, geht auch der Lernstand auf dem Server (S-L3 N-2,
 *   `loescheLernstandNachWiderruf`).
 * - **Ende des Eltern-Kind-Bezugs** (Vier-Augen-Entscheidung oder Löschen des Elternkontos, SL2-Rest): Die Einwilligung
 *   `lernapp`, die dieses Elternteil für das Kind gegeben hat, endet mit dem Bezug (`beendeLernappDerEltern`); danach
 *   dieselben Folgen wie beim Widerruf – gelöscht wird nur, was allein diese Einwilligung deckte.
 * - **Lehrkraftwechsel** bei laufender Mitgliedschaft: Abgaben bleiben an die Gruppe gebunden (Entscheidung S-L2-Auflagen,
 *   ADR 0042 Nr. 17) – die neue Lehrkraft der Gruppe übernimmt sie wie das Gruppenbuch; eine zweite erwachsene Person sieht
 *   so auch frühere Rückmeldungen.
 */

/** Ende der Mitgliedschaft: Abgaben einer Person (oder aller Mitglieder) an eine Gruppe lösen. Anzahl der gelösten. */
export async function loeseAbgabenVonGruppe(
  tx: Transaktion,
  ende: { gruppeId: string; lernendeId?: string } | { gruppeId?: undefined; lernendeId: string },
): Promise<number> {
  const A = schema.lernappSchreibabgabe;
  const bedingungen: SQL[] = [isNotNull(A.gruppeId)];
  if (ende.gruppeId) bedingungen.push(eq(A.gruppeId, ende.gruppeId));
  if (ende.lernendeId)
    bedingungen.push(
      inArray(
        A.benutzerId,
        tx
          .select({ id: schema.lernende.benutzerId })
          .from(schema.lernende)
          .where(and(eq(schema.lernende.id, ende.lernendeId), isNotNull(schema.lernende.benutzerId))),
      ),
    );
  const geloest = await tx
    .update(A)
    .set({ gruppeId: null, korrigiertVon: null })
    .where(and(...bedingungen))
    .returning({ id: A.id });
  return geloest.length;
}

type Betroffen = { benutzerId: string } | { lernendeId: string };

/**
 * Konto der betroffenen Person (bei Lernenden über den Lerndatensatz; ohne Konto null). Ohne Profil gilt das Konto als Kind
 * (wie beim Lesen): Dann zählt nur die Einwilligung der Eltern.
 */
async function kontoVon(betroffen: Betroffen): Promise<{ benutzerId: string; istKind: boolean } | null> {
  const benutzerId =
    'benutzerId' in betroffen
      ? betroffen.benutzerId
      : (
          await db
            .select({ id: schema.lernende.benutzerId })
            .from(schema.lernende)
            .where(eq(schema.lernende.id, betroffen.lernendeId))
            .limit(1)
        )[0]?.id;
  if (!benutzerId) return null;
  const [profil] = await db
    .select({ istKind: schema.kontoProfil.istKind })
    .from(schema.kontoProfil)
    .where(eq(schema.kontoProfil.benutzerId, benutzerId))
    .limit(1);
  return { benutzerId, istKind: profil?.istKind ?? true };
}

/**
 * Nach dem Widerruf der Einwilligung `lernapp` (außerhalb der Transaktion des Widerrufs aufrufen, damit er schon gilt):
 * Abgaben der betroffenen Person löschen, die keine geltende Einwilligung mehr deckt – ohne geltende Einwilligung alle,
 * sonst die aus der Zeit vor ihrem Beginn. Audit nur mit Anzahl. Anzahl der gelöschten.
 */
export async function loescheAbgabenNachWiderruf(
  betroffen: Betroffen,
  akteurId: string | null,
  jetzt = new Date(),
  anlass: 'widerruf' | 'bezug' = 'widerruf',
): Promise<number> {
  const konto = await kontoVon(betroffen);
  if (!konto) return 0;
  const { benutzerId } = konto;
  const e = await lernappEinwilligungDetail(benutzerId, konto, jetzt);
  const A = schema.lernappSchreibabgabe;
  return db.transaction(async (tx) => {
    const weg = await tx
      .delete(A)
      .where(and(eq(A.benutzerId, benutzerId), ...(e.seit ? [lt(A.eingereichtAm, e.seit)] : [])))
      .returning({ id: A.id });
    if (weg.length)
      await protokolliere(
        {
          benutzerId: akteurId,
          aktion: 'lernapp.schreibabgabe_geloescht',
          zielTyp: 'konto',
          zielId: benutzerId,
          details: { anzahl: weg.length, anlass },
        },
        tx,
      );
    return weg.length;
  });
}

/** Sperre des Abgleichs je Konto (wie `gleicheKontoAb`): Ein laufender Abgleich endet, bevor der Lernstand geht. */
const abgleichSperre = (benutzerId: string) => sql`select pg_advisory_xact_lock(hashtext(${`igmg:lernapp-sync:${benutzerId}`}))`;

/**
 * Nach dem Widerruf der Einwilligung `lernapp` (S-L3 N-2; Art. 7 Abs. 3 und Art. 17 Abs. 1 lit. b DSGVO): Deckt keine
 * geltende Einwilligung die Person mehr, gehen in einer Transaktion unter der Sperre des Abgleichs ihr Lernstand auf dem
 * Server (`lernapp_profil` mit Ereignissen, Kartenstand, Lerntagen je Tag und Kurs über die Kaskade), ihre Zustimmung zur
 * Bestenliste und ihre Einstellung der Familien-Bestenliste. Der Stand auf den Geräten bleibt; der nächste Abgleich
 * antwortet ohne Einwilligung 403. Gilt noch eine Einwilligung (etwa die des zweiten Elternteils oder im Übergang nach
 * dem 16. Geburtstag die eigene), bleibt alles. Audit nur mit Anlass. Rückgabe: ob etwas gelöscht wurde.
 */
export async function loescheLernstandNachWiderruf(
  betroffen: Betroffen,
  akteurId: string | null,
  anlass: 'widerruf' | 'bezug' = 'widerruf',
  jetzt = new Date(),
): Promise<boolean> {
  const konto = await kontoVon(betroffen);
  if (!konto) return false;
  const { benutzerId } = konto;
  if ((await lernappEinwilligung(benutzerId, konto, jetzt)) === 'erteilt') return false;
  return db.transaction(async (tx) => {
    await tx.execute(abgleichSperre(benutzerId));
    const [profil] = await tx
      .delete(schema.lernappProfil)
      .where(eq(schema.lernappProfil.benutzerId, benutzerId))
      .returning({ id: schema.lernappProfil.benutzerId });
    const [zustimmung] = await tx
      .delete(schema.lernappRanglisteZustimmung)
      .where(eq(schema.lernappRanglisteZustimmung.benutzerId, benutzerId))
      .returning({ id: schema.lernappRanglisteZustimmung.benutzerId });
    const [familie] = await tx
      .delete(schema.lernappFamilie)
      .where(eq(schema.lernappFamilie.elternId, benutzerId))
      .returning({ id: schema.lernappFamilie.elternId });
    const etwas = Boolean(profil || zustimmung || familie);
    if (etwas)
      await protokolliere(
        {
          benutzerId: akteurId,
          aktion: 'lernapp.lernstand_geloescht',
          zielTyp: 'konto',
          zielId: benutzerId,
          details: { anlass, lernstand: Boolean(profil), bestenliste: Boolean(zustimmung), familie: Boolean(familie) },
        },
        tx,
      );
    return etwas;
  });
}

/**
 * Folgen eines Widerrufs je Art der Einwilligung, nach dem Speichern des Widerrufs (außerhalb seiner Transaktion). Heute
 * nur `lernapp`: nicht mehr gedeckte Schreibabgaben und – ohne geltende Einwilligung – der Lernstand auf dem Server.
 */
export async function folgenDesWiderrufs(
  art: (typeof schema.einwilligungArtEnum.enumValues)[number],
  betroffen: Betroffen,
  akteurId: string | null,
  anlass: 'widerruf' | 'bezug' = 'widerruf',
): Promise<void> {
  if (art !== 'lernapp') return;
  await loescheAbgabenNachWiderruf(betroffen, akteurId, undefined, anlass);
  await loescheLernstandNachWiderruf(betroffen, akteurId, anlass);
}

/**
 * Ende des Eltern-Kind-Bezugs (in der Transaktion, die den Bezug löscht – Vier-Augen-Entscheidung oder Löschen des
 * Elternkontos): Die Einwilligung `lernapp`, die dieses Elternteil für das Kind (bzw. für alle seine Kinder) gegeben hat,
 * endet mit dem Bezug – ohne Bezug zählt sie ohnehin nicht mehr (`lernappEinwilligungDetail`), und als beendet versperrt
 * sie dem anderen Elternteil nicht das Erteilen. Rückgabe: die betroffenen Lerndatensätze; danach (nach der Transaktion)
 * `folgenNachBezugsende` aufrufen.
 */
export async function beendeLernappDerEltern(tx: Transaktion, elternId: string, lernendeId?: string): Promise<string[]> {
  const k = schema.kontoEinwilligung;
  const beendet = await tx
    .update(k)
    .set({ widerrufenAm: new Date() })
    .where(
      and(
        eq(k.art, 'lernapp'),
        eq(k.erteiltVon, elternId),
        isNull(k.widerrufenAm),
        isNotNull(k.lernendeId),
        // die eigene Einwilligung eines Elternteils als lernende Person bleibt
        isNull(k.benutzerId),
        ...(lernendeId ? [eq(k.lernendeId, lernendeId)] : []),
      ),
    )
    .returning({ lernendeId: k.lernendeId });
  return [...new Set(beendet.flatMap((z) => (z.lernendeId ? [z.lernendeId] : [])))];
}

/**
 * Nach dem Ende des Eltern-Kind-Bezugs: Abgaben des Kindes, die nur die Einwilligung dieses Elternteils deckte, und – ohne
 * weitere geltende Einwilligung – sein Lernstand auf dem Server gehen (wie beim Widerruf, Anlass „bezug“).
 */
export async function folgenNachBezugsende(lernendeIds: readonly string[], akteurId: string | null): Promise<void> {
  for (const lernendeId of lernendeIds) await folgenDesWiderrufs('lernapp', { lernendeId }, akteurId, 'bezug');
}

/** Alle eigenen Abgaben löschen („Mein Bereich › Konto“, jederzeit, auch ohne Schalter). Anzahl der gelöschten. */
export async function loescheAlleEigenenAbgaben(benutzerId: string): Promise<number> {
  const A = schema.lernappSchreibabgabe;
  return db.transaction(async (tx) => {
    const weg = await tx.delete(A).where(eq(A.benutzerId, benutzerId)).returning({ id: A.id });
    if (weg.length)
      await protokolliere(
        {
          benutzerId,
          aktion: 'lernapp.schreibabgabe_geloescht',
          zielTyp: 'konto',
          zielId: benutzerId,
          details: { anzahl: weg.length, anlass: 'konto' },
        },
        tx,
      );
    return weg.length;
  });
}

/** Anzahl der eigenen Abgaben (auch abgelaufene, die der Löschlauf noch nicht entfernt hat) – für „Mein Bereich › Konto“. */
export async function anzahlEigenerAbgaben(benutzerId: string): Promise<number> {
  const A = schema.lernappSchreibabgabe;
  const [z] = await db.select({ n: count() }).from(A).where(eq(A.benutzerId, benutzerId));
  return z?.n ?? 0;
}
