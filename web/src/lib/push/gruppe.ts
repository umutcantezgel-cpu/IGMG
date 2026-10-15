import 'server-only';
import { and, eq, inArray, isNull, sql } from 'drizzle-orm';
import { notfallpauseAktiv } from '@/lib/chat/dienst';
import { db, schema } from '@/lib/db';
import { funktionAn } from '@/lib/funktionen';
import { berlinerDatum } from '@/lib/gebetszeiten/naechstes';
import { einwilligungGilt, einwilligungsLage } from '@/lib/konto/sechzehn';
import { kindDarfPush, sendeAnAbo } from './abo';
import { gueltigePushVersionen } from './einwilligung';
import { vapidAusUmgebung } from './vapid';

/**
 * Push an eine Lerngruppe (ADR 0034, Themen „Chat und Elternkanal“ und „Unterricht“): nur an Personen der Gruppe mit
 * passendem Thema, Kinder (und Jugendliche ab 16, D-11) nur mit Einwilligung „Push für das Kind“. Die Nutzlast enthält
 * nur Art und Pfad – keine Namen, keine Inhalte (S-16). Höchstens eine Meldung je Abo, Gruppe und Art in 10 Minuten
 * (Einmal-Schlüssel in `push_versand`). Läuft nach der Antwort (`after`); Fehler bleiben folgenlos.
 */
export type GruppenPushArt = 'chat' | 'unterricht';
const FENSTER_MS = 10 * 60 * 1000;

/**
 * Empfänger: Leitung immer; Schüler der Gruppe (Gruppenkanal, Unterricht); Eltern der Mitglieder (Elternkanal,
 * Unterricht). Archivierte Gruppen bekommen keine Push-Meldungen mehr (S2/S3).
 */
export async function empfaengerDerGruppe(
  gruppeId: string,
  kreis: { schueler: boolean; eltern: boolean },
): Promise<{ id: string; lernend: boolean }[]> {
  const [g] = await db.select({ status: schema.gruppe.status }).from(schema.gruppe).where(eq(schema.gruppe.id, gruppeId));
  if (g?.status !== 'aktiv') return [];
  const [leitung, mitglieder] = await Promise.all([
    db.select({ id: schema.gruppenLeitung.benutzerId }).from(schema.gruppenLeitung).where(eq(schema.gruppenLeitung.gruppeId, gruppeId)),
    db
      .select({ lernendeId: schema.lernende.id, benutzerId: schema.lernende.benutzerId })
      .from(schema.gruppenMitglied)
      .innerJoin(schema.lernende, eq(schema.lernende.id, schema.gruppenMitglied.lernendeId))
      .where(and(eq(schema.gruppenMitglied.gruppeId, gruppeId), isNull(schema.gruppenMitglied.bis), eq(schema.lernende.status, 'aktiv'))),
  ]);
  const eltern =
    kreis.eltern && mitglieder.length
      ? await db
          .select({ id: schema.elternKind.elternId })
          .from(schema.elternKind)
          .where(
            inArray(
              schema.elternKind.lernendeId,
              mitglieder.map((m) => m.lernendeId),
            ),
          )
      : [];
  const nach = new Map<string, boolean>();
  for (const l of leitung) nach.set(l.id, false);
  for (const e of eltern) if (!nach.has(e.id)) nach.set(e.id, false);
  if (kreis.schueler) for (const m of mitglieder) if (m.benutzerId) nach.set(m.benutzerId, true);
  return [...nach].map(([id, lernend]) => ({ id, lernend }));
}

/**
 * Chat-Push an Lernende nur mit gültiger Einwilligung „Gruppenchat“ (S-03, D-11; S2/S3): Wer die Nachrichten nicht lesen
 * darf, erfährt auch nicht, dass es Neues gibt.
 */
async function kindDarfChat(benutzerId: string, jetzt: Date): Promise<boolean> {
  const z = await db
    .select({ erteiltVon: schema.kontoEinwilligung.erteiltVon, sechzehnAm: schema.lernende.sechzehnAm })
    .from(schema.kontoEinwilligung)
    .innerJoin(schema.lernende, eq(schema.lernende.id, schema.kontoEinwilligung.lernendeId))
    .where(
      and(
        eq(schema.lernende.benutzerId, benutzerId),
        eq(schema.kontoEinwilligung.art, 'gruppenchat'),
        isNull(schema.kontoEinwilligung.widerrufenAm),
      ),
    );
  return einwilligungGilt(einwilligungsLage(z[0]?.sechzehnAm ?? null, berlinerDatum(jetzt)), z, benutzerId);
}

export async function sendeGruppenPush(
  gruppeId: string,
  art: GruppenPushArt,
  kreis: { schueler: boolean; eltern: boolean },
  pfad: string,
  ausser: string | null = null,
  jetzt = Date.now(),
): Promise<number> {
  const vapid = vapidAusUmgebung();
  if (!vapid || !(await funktionAn('push'))) return 0;
  // S-17: In der Notfall-Pause erfahren nur die Leitungen von neuen Chat-Nachrichten
  const nurLeitung = art === 'chat' && (await notfallpauseAktiv());
  const empfaenger = (await empfaengerDerGruppe(gruppeId, nurLeitung ? { schueler: false, eltern: false } : kreis)).filter(
    (e) => e.id !== ausser,
  );
  if (!empfaenger.length) return 0;
  const abos = await db
    .select()
    .from(schema.pushAbo)
    .where(
      and(
        inArray(
          schema.pushAbo.benutzerId,
          empfaenger.map((e) => e.id),
        ),
        sql`${art} = any(${schema.pushAbo.themen})`,
        // D-17: nur mit Einwilligung zum aktuellen Wortlaut
        inArray(schema.pushAbo.einwilligungVersion, gueltigePushVersionen()),
      ),
    );
  const lernend = new Set(empfaenger.filter((e) => e.lernend).map((e) => e.id));
  const freigabe = new Map<string, boolean>();
  const fenster = Math.floor(jetzt / FENSTER_MS);
  let gesendet = 0;
  for (const abo of abos) {
    const wer = abo.benutzerId!;
    if (lernend.has(wer)) {
      if (!freigabe.has(wer))
        freigabe.set(wer, (await kindDarfPush(wer, new Date(jetzt))) && (art !== 'chat' || (await kindDarfChat(wer, new Date(jetzt)))));
      if (!freigabe.get(wer)) continue;
    }
    const neu = await db
      .insert(schema.pushVersand)
      .values({ schluessel: `${art}|${abo.id}|${gruppeId}|${fenster}` })
      .onConflictDoNothing()
      .returning({ schluessel: schema.pushVersand.schluessel });
    if (!neu.length) continue;
    if (await sendeAnAbo(abo, { art, pfad }, vapid, `${art}-${gruppeId}`).catch(() => false)) gesendet++;
  }
  return gesendet;
}
