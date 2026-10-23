import 'server-only';
import { and, count, eq, inArray, isNotNull, lt, type SQL } from 'drizzle-orm';
import { protokolliere } from '@/lib/audit';
import { db, schema, type Transaktion } from '@/lib/db';
import { lernappEinwilligungDetail } from '../sync/server';

/**
 * Folgen von Austritt und Widerruf für Schreibabgaben (S-L2 N-2; ADR 0042 Fortschreibung Nr. 17; Art. 5 Abs. 1 lit. b/c und
 * Art. 17 Abs. 1 lit. b DSGVO). Vorher waren Abgaben nach Austritt oder Widerruf nur verborgen; ein Wiedereintritt (gleiche
 * Mitgliedszeile) oder ein neues Erteilen machte sie samt Kommentar wieder lesbar.
 *
 * - **Austritt** (Mitgliedschaft endet, Lernende beendet, Gruppe archiviert): Die Abgaben dieser Person an diese Gruppe
 *   werden von der Gruppe gelöst (`gruppe_id = null`, `korrigiert_von = null`). Keine Lehrkraft liest sie danach je wieder –
 *   auch nicht nach einem Wiedereintritt oder mit einer neuen Lehrkraft; die Person selbst sieht und löscht sie weiter, bis
 *   die Frist (12 Monate) sie löscht.
 * - **Widerruf** der Einwilligung `lernapp`: Abgaben, die keine geltende Einwilligung mehr deckt, werden gelöscht.
 *   Zusätzlich liest die Lehrkraft nur Abgaben, deren Einwilligung schon vor der Abgabe galt (`lernappEinwilligungDetail`
 *   `seit`) – ein neues Erteilen deckt nie die Zeit davor, auch wenn der Widerruf auf einem Weg geschah, der diese Folgen
 *   nicht aufruft (z. B. Ende des Eltern-Kind-Bezugs).
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

/**
 * Nach dem Widerruf der Einwilligung `lernapp` (außerhalb der Transaktion des Widerrufs aufrufen, damit er schon gilt):
 * Abgaben der betroffenen Person löschen, die keine geltende Einwilligung mehr deckt – ohne geltende Einwilligung alle,
 * sonst die aus der Zeit vor ihrem Beginn. Audit nur mit Anzahl. Anzahl der gelöschten.
 */
export async function loescheAbgabenNachWiderruf(
  betroffen: { benutzerId: string } | { lernendeId: string },
  akteurId: string,
  jetzt = new Date(),
): Promise<number> {
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
  if (!benutzerId) return 0;
  const [profil] = await db
    .select({ istKind: schema.kontoProfil.istKind })
    .from(schema.kontoProfil)
    .where(eq(schema.kontoProfil.benutzerId, benutzerId))
    .limit(1);
  // Unbekannt gilt als Kind (wie beim Lesen): Dann zählt nur die Einwilligung der Eltern
  const e = await lernappEinwilligungDetail(benutzerId, { istKind: profil?.istKind ?? true }, jetzt);
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
          details: { anzahl: weg.length, anlass: 'widerruf' },
        },
        tx,
      );
    return weg.length;
  });
}

/**
 * Folgen eines Widerrufs je Art der Einwilligung, nach dem Speichern des Widerrufs. Heute nur `lernapp` (Schreibabgaben);
 * Erteilen und Widerrufen von `lernapp` in „Mein Bereich“ folgen mit S-L3 N-2 – die Wege rufen dies schon jetzt auf.
 */
export async function folgenDesWiderrufs(
  art: (typeof schema.einwilligungArtEnum.enumValues)[number],
  betroffen: { benutzerId: string } | { lernendeId: string },
  akteurId: string,
): Promise<void> {
  if (art === 'lernapp') await loescheAbgabenNachWiderruf(betroffen, akteurId);
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
