import 'server-only';
import { and, eq, inArray, isNull, sql } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { funktionAn } from '@/lib/funktionen';
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

/** Empfänger: Leitung immer; Schüler der Gruppe (Gruppenkanal, Unterricht); Eltern der Mitglieder (Elternkanal, Unterricht). */
export async function empfaengerDerGruppe(
  gruppeId: string,
  kreis: { schueler: boolean; eltern: boolean },
): Promise<{ id: string; lernend: boolean }[]> {
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
  const empfaenger = (await empfaengerDerGruppe(gruppeId, kreis)).filter((e) => e.id !== ausser);
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
      if (!freigabe.has(wer)) freigabe.set(wer, await kindDarfPush(wer, new Date(jetzt)));
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
