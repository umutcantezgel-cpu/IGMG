'use server';

import { and, eq, isNull, sql } from 'drizzle-orm';
import { refresh } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { protokolliere } from '@/lib/audit';
import { db, schema, type Transaktion } from '@/lib/db';
import { funktionAn } from '@/lib/funktionen';
import { berlinerDatum } from '@/lib/gebetszeiten/naechstes';
import { erzeugeTermine } from '@/lib/lernen/dienst';
import { KeinRecht, verlangeRecht, type Angemeldet } from '@/lib/rechte/pruefe';
import { gruppeAusFormular, gruppeDatensatz, gruppeSchema, leitungSchema, mitgliedSchema, termineSchema } from '@/lib/validierung/lernen';
import { istLehrkraft } from '@/server/queries/verwaltung/gruppen';

/**
 * Verwaltung „Gruppen“ (H-L01, ADR 0026). Reihenfolge je Action: Recht (Sitzung, zweiter Faktor, Rolle) →
 * Funktionsschalter `lernplattform` → Eingabe prüfen → Speichern mit Audit (ohne Personendaten). Der Gruppenchat ist nur
 * mit mindestens zwei Erwachsenen in der Leitung aktiv (S-02) – erzwungen im Chat-Dienst, hier nur Grundlage.
 * Kein Zugriff auf Chat-Inhalte (ADR 0026).
 */
export type GruppenZustand = {
  fehler?: string;
  feldFehler?: Record<string, string>;
  werte?: Record<string, unknown>;
  gespeichert?: number;
};

const BEKANNT = new Set([
  'pflicht',
  'zuLang',
  'ungueltig',
  'datum',
  'uhrzeit',
  'endeVorBeginn',
  'bisVorVon',
  'chatFenster',
  'mindestalter',
  'zeitraumZuLang',
]);

/** Recht + Schalter für ändernde Actions; wirft `KeinRecht` (Formular-Actions fangen es ab). */
async function verlange(): Promise<Angemeldet> {
  const a = await verlangeRecht('gruppe.bearbeiten');
  if (!(await funktionAn('lernplattform'))) throw new KeinRecht();
  return a;
}

function feldFehler(fehler: z.ZodError): Record<string, string> {
  const f: Record<string, string> = {};
  for (const i of fehler.issues) {
    const feld = String(i.path[0] ?? 'formular');
    f[feld] ??= BEKANNT.has(i.message) ? i.message : 'ungueltig';
  }
  return f;
}

/** Anlegen und Ändern einer Gruppe (Kurs/Kursart, Zeiten, Zeitraum, Raum, Chat-Einstellungen). */
export async function speichereGruppe(_vorher: GruppenZustand, fd: FormData): Promise<GruppenZustand> {
  let a: Angemeldet;
  try {
    a = await verlange();
  } catch {
    return { fehler: 'keinRecht' };
  }
  const roh = gruppeAusFormular(fd);
  const p = gruppeSchema.safeParse(roh);
  if (!p.success) return { fehler: 'pruefen', feldFehler: feldFehler(p.error), werte: roh };
  const e = p.data;
  if (e.kursId) {
    const [kurs] = await db.select({ id: schema.kurs.id }).from(schema.kurs).where(eq(schema.kurs.id, e.kursId));
    if (!kurs) return { fehler: 'pruefen', feldFehler: { kursId: 'ungueltig' }, werte: roh };
  }
  const daten = gruppeDatensatz(e);
  if (e.id) {
    const id = e.id;
    const geaendert = await db.transaction(async (tx) => {
      const z = await tx.update(schema.gruppe).set(daten).where(eq(schema.gruppe.id, id)).returning({ id: schema.gruppe.id });
      if (z.length) await archivFolgen(tx, id, daten.status);
      if (z.length)
        await protokolliere(
          {
            benutzerId: a.benutzerId,
            aktion: 'gruppe.geaendert',
            zielTyp: 'gruppe',
            zielId: id,
            details: { chatModus: daten.chatModus, status: daten.status },
          },
          tx,
        );
      return z.length > 0;
    });
    if (!geaendert) return { fehler: 'nichtGefunden', werte: roh };
    // Seite neu rendern (Chat-Lage, Termine); das Formular behält die gespeicherten Werte
    refresh();
    return { gespeichert: Date.now(), werte: roh };
  }
  const neu = await db.transaction(async (tx) => {
    const [g] = await tx
      .insert(schema.gruppe)
      .values({ ...daten, erstelltVon: a.benutzerId })
      .returning({ id: schema.gruppe.id });
    await protokolliere({ benutzerId: a.benutzerId, aktion: 'gruppe.angelegt', zielTyp: 'gruppe', zielId: g.id }, tx);
    return g.id;
  });
  redirect(`/verwaltung/gruppen/${neu}?meldung=angelegt`);
}

/**
 * Folgen des Archivierens (S2/S3): Beide Kanäle der Gruppe werden archiviert und laufende Mitgliedschaften enden heute –
 * kein unbeaufsichtigter Kanal, nachdem die Leitung mit dem Archivieren ihren Zugang verliert. Wird die Gruppe wieder
 * aktiv, öffnen sich die Kanäle wieder (eine Pause der Rolle kinderschutz bleibt bestehen); Mitglieder ordnet die
 * Verwaltung neu zu.
 */
async function archivFolgen(tx: Transaktion, gruppeId: string, status: 'aktiv' | 'archiviert'): Promise<void> {
  if (status === 'archiviert') {
    await tx.update(schema.chatKanal).set({ status: 'archiviert' }).where(eq(schema.chatKanal.gruppeId, gruppeId));
    await tx
      .update(schema.gruppenMitglied)
      .set({ bis: berlinerDatum(new Date()) })
      .where(and(eq(schema.gruppenMitglied.gruppeId, gruppeId), isNull(schema.gruppenMitglied.bis)));
    return;
  }
  await tx
    .update(schema.chatKanal)
    .set({
      status: sql`case when ${schema.chatKanal.kinderschutzPause} then 'pausiert'::chat_kanal_status else 'aktiv'::chat_kanal_status end`,
    })
    .where(and(eq(schema.chatKanal.gruppeId, gruppeId), eq(schema.chatKanal.status, 'archiviert')));
}

async function gruppeVorhanden(id: string): Promise<boolean> {
  const [g] = await db.select({ id: schema.gruppe.id }).from(schema.gruppe).where(eq(schema.gruppe.id, id));
  return Boolean(g);
}

const zurGruppe = (id: string, query: string) => `/verwaltung/gruppen/${id}?${query}`;

/** Leitung zuweisen (Lehrkraft oder Aufsicht); nur Konten mit der Gemeinde-Rolle `lehrkraft`. */
export async function leitungZuweisen(fd: FormData): Promise<void> {
  const a = await verlange();
  const p = leitungSchema.safeParse({ gruppeId: fd.get('gruppeId'), benutzerId: fd.get('benutzerId'), rolle: fd.get('rolle') });
  if (!p.success) throw new KeinRecht();
  if (!(await gruppeVorhanden(p.data.gruppeId))) throw new KeinRecht();
  if (!(await istLehrkraft(p.data.benutzerId))) redirect(zurGruppe(p.data.gruppeId, 'fehler=keineLehrkraft#leitung'));
  await db.transaction(async (tx) => {
    await tx
      .insert(schema.gruppenLeitung)
      .values(p.data)
      .onConflictDoUpdate({
        target: [schema.gruppenLeitung.gruppeId, schema.gruppenLeitung.benutzerId],
        set: { rolle: p.data.rolle },
      });
    await protokolliere(
      {
        benutzerId: a.benutzerId,
        aktion: 'gruppe.leitung',
        zielTyp: 'gruppe',
        zielId: p.data.gruppeId,
        details: { aenderung: 'zugewiesen', rolle: p.data.rolle, konto: p.data.benutzerId },
      },
      tx,
    );
  });
  redirect(zurGruppe(p.data.gruppeId, 'meldung=leitung#leitung'));
}

export async function leitungEntfernen(fd: FormData): Promise<void> {
  const a = await verlange();
  const p = leitungSchema.omit({ rolle: true }).safeParse({ gruppeId: fd.get('gruppeId'), benutzerId: fd.get('benutzerId') });
  if (!p.success) throw new KeinRecht();
  await db.transaction(async (tx) => {
    const weg = await tx
      .delete(schema.gruppenLeitung)
      .where(and(eq(schema.gruppenLeitung.gruppeId, p.data.gruppeId), eq(schema.gruppenLeitung.benutzerId, p.data.benutzerId)))
      .returning({ id: schema.gruppenLeitung.benutzerId });
    if (weg.length)
      await protokolliere(
        {
          benutzerId: a.benutzerId,
          aktion: 'gruppe.leitung',
          zielTyp: 'gruppe',
          zielId: p.data.gruppeId,
          details: { aenderung: 'entfernt', konto: p.data.benutzerId },
        },
        tx,
      );
  });
  redirect(zurGruppe(p.data.gruppeId, 'meldung=leitungEntfernt#leitung'));
}

/** Rücksprung nach Mitglieds-Aktionen: Gruppe (Standard) oder Detailseite der Lernenden. */
function mitgliedZiel(fd: FormData, gruppeId: string, lernendeId: string, meldung: string): string {
  return fd.get('zurueck') === 'lernende'
    ? `/verwaltung/lernende/${lernendeId}?meldung=${meldung}#gruppen`
    : zurGruppe(gruppeId, `meldung=${meldung}#mitglieder`);
}

/** Lernende der Gruppe zuordnen (ab heute). Eine beendete Mitgliedschaft lebt wieder auf. */
export async function mitgliedHinzufuegen(fd: FormData): Promise<void> {
  const a = await verlange();
  const p = mitgliedSchema.safeParse({ gruppeId: fd.get('gruppeId'), lernendeId: fd.get('lernendeId') });
  if (!p.success) throw new KeinRecht();
  const [g] = await db
    .select({ id: schema.gruppe.id })
    .from(schema.gruppe)
    .where(and(eq(schema.gruppe.id, p.data.gruppeId), eq(schema.gruppe.status, 'aktiv')));
  const [l] = await db
    .select({ id: schema.lernende.id })
    .from(schema.lernende)
    .where(and(eq(schema.lernende.id, p.data.lernendeId), eq(schema.lernende.status, 'aktiv')));
  if (!g || !l) throw new KeinRecht();
  await db.transaction(async (tx) => {
    await tx
      .insert(schema.gruppenMitglied)
      .values({ ...p.data, seit: berlinerDatum(new Date()) })
      .onConflictDoUpdate({ target: [schema.gruppenMitglied.gruppeId, schema.gruppenMitglied.lernendeId], set: { bis: null } });
    await protokolliere(
      {
        benutzerId: a.benutzerId,
        aktion: 'gruppe.mitglieder',
        zielTyp: 'gruppe',
        zielId: p.data.gruppeId,
        details: { aenderung: 'zugeordnet', lernende: p.data.lernendeId },
      },
      tx,
    );
  });
  redirect(mitgliedZiel(fd, p.data.gruppeId, p.data.lernendeId, 'mitglied'));
}

/** Mitgliedschaft beenden (heute); Anwesenheit und Fortschritt bleiben erhalten. */
export async function mitgliedEntfernen(fd: FormData): Promise<void> {
  const a = await verlange();
  const p = mitgliedSchema.safeParse({ gruppeId: fd.get('gruppeId'), lernendeId: fd.get('lernendeId') });
  if (!p.success) throw new KeinRecht();
  await db.transaction(async (tx) => {
    const z = await tx
      .update(schema.gruppenMitglied)
      .set({ bis: berlinerDatum(new Date()) })
      .where(
        and(
          eq(schema.gruppenMitglied.gruppeId, p.data.gruppeId),
          eq(schema.gruppenMitglied.lernendeId, p.data.lernendeId),
          isNull(schema.gruppenMitglied.bis),
        ),
      )
      .returning({ id: schema.gruppenMitglied.lernendeId });
    if (z.length)
      await protokolliere(
        {
          benutzerId: a.benutzerId,
          aktion: 'gruppe.mitglieder',
          zielTyp: 'gruppe',
          zielId: p.data.gruppeId,
          details: { aenderung: 'beendet', lernende: p.data.lernendeId },
        },
        tx,
      );
  });
  redirect(mitgliedZiel(fd, p.data.gruppeId, p.data.lernendeId, 'mitgliedEntfernt'));
}

/** Terminserie bis zu einem Datum erzeugen (idempotent: vorhandene Termine bleiben unverändert). */
export async function termineAnlegen(fd: FormData): Promise<void> {
  const a = await verlange();
  const p = termineSchema.safeParse({ gruppeId: fd.get('gruppeId'), von: fd.get('von'), bis: fd.get('bis') });
  const gruppeId = z.uuid().safeParse(fd.get('gruppeId'));
  if (!gruppeId.success) throw new KeinRecht();
  if (!p.success)
    redirect(zurGruppe(gruppeId.data, `fehler=${p.error.issues[0]?.message === 'zeitraumZuLang' ? 'zeitraumZuLang' : 'zeitraum'}#termine`));
  if (!(await gruppeVorhanden(p.data.gruppeId))) throw new KeinRecht();
  const anzahl = await erzeugeTermine(p.data.gruppeId, p.data.von, p.data.bis);
  await protokolliere({
    benutzerId: a.benutzerId,
    aktion: 'gruppe.termine',
    zielTyp: 'gruppe',
    zielId: p.data.gruppeId,
    details: { anzahl, von: p.data.von, bis: p.data.bis },
  });
  redirect(zurGruppe(p.data.gruppeId, `meldung=termine&anzahl=${anzahl}#termine`));
}
