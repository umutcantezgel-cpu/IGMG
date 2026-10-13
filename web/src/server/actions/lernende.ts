'use server';

import { and, eq, isNull } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { after } from 'next/server';
import { z } from 'zod';
import { protokolliere } from '@/lib/audit';
import { db, schema } from '@/lib/db';
import { funktionAn } from '@/lib/funktionen';
import { berlinerDatum } from '@/lib/gebetszeiten/naechstes';
import { nimmVoranmeldungAuf } from '@/lib/lernen/aufnahme';
import { versendeOffeneMails } from '@/lib/mail/ausgang';
import { darf, KeinRecht, verlangeRecht } from '@/lib/rechte/pruefe';
import { ladeEingangKopf } from '@/server/queries/verwaltung/eingaenge';

/**
 * Verwaltung „Lernende“ und Aufnahme aus der Voranmeldung (O-L01, H-L02). Reihenfolge: Recht (Sitzung, zweiter
 * Faktor, Rolle) → Funktionsschalter → Eingabe → Speichern mit Audit (ohne Personendaten).
 */

/** DSFA D-10: Nach dem Austritt bleiben die Daten 12 Monate, danach löscht der tägliche Löschlauf sie. */
const AUSTRITT_FRIST_MONATE = 12;

function loeschenNachAustritt(jetzt: Date): Date {
  const d = new Date(jetzt);
  d.setUTCMonth(d.getUTCMonth() + AUSTRITT_FRIST_MONATE);
  return d;
}

/**
 * „Aufnehmen“ in `/verwaltung/eingaenge/[id]` (nur Voranmeldungen): Lernende anlegen, optional einer Gruppe zuordnen,
 * Eltern einladen. Idempotent (zweimal klicken legt nichts doppelt an).
 */
export async function aufnehmen(fd: FormData): Promise<void> {
  const a = await verlangeRecht('lernende.aufnehmen');
  if (!darf(a.rollen, 'eingang.voranmeldung.bearbeiten') || !(await funktionAn('lernplattform'))) throw new KeinRecht();
  const p = z
    .object({ id: z.uuid(), gruppeId: z.union([z.literal(''), z.uuid()]).default('') })
    .safeParse({ id: fd.get('id'), gruppeId: fd.get('gruppeId') ?? '' });
  if (!p.success) throw new KeinRecht();
  // Sichtbarkeit des Eingangs wie in der Eingangsansicht
  const kopf = await ladeEingangKopf(p.data.id, a);
  if (!kopf) throw new KeinRecht();
  if (kopf.art !== 'voranmeldung') redirect(`/verwaltung/eingaenge/${kopf.id}?aufnahme=keineVoranmeldung`);
  // Eltern-Einladung nur mit eingeschalteten Konten (ADR 0035)
  const kontenAn = await funktionAn('konten');
  const eltern = kontenAn ? ([1, 2] as const).filter((n) => fd.get(`eltern${n}`) === 'ja') : [];
  const r = await nimmVoranmeldungAuf({ eingangId: kopf.id, akteurId: a.benutzerId, gruppeId: p.data.gruppeId || null, eltern });
  if (!r.ok) redirect(`/verwaltung/eingaenge/${kopf.id}?aufnahme=${r.fehler}#aufnahme`);
  if (r.einladungen) after(() => versendeOffeneMails());
  redirect(`/verwaltung/eingaenge/${kopf.id}?aufnahme=${r.status}&einladungen=${r.einladungen}#aufnahme`);
}

const statusSchema = z.object({ id: z.uuid(), status: z.enum(['aktiv', 'pausiert', 'beendet']) });

/**
 * Status ändern. Austritt („beendet“) beendet alle Gruppenmitgliedschaften und setzt die Löschfrist (12 Monate,
 * DSFA D-10); Wiederaufnahme hebt die Frist auf.
 */
export async function setzeLernendeStatus(fd: FormData): Promise<void> {
  const a = await verlangeRecht('lernende.bearbeiten');
  if (!(await funktionAn('lernplattform'))) throw new KeinRecht();
  const p = statusSchema.safeParse({ id: fd.get('id'), status: fd.get('status') });
  if (!p.success) throw new KeinRecht();
  const jetzt = new Date();
  const beendet = p.data.status === 'beendet';
  const gefunden = await db.transaction(async (tx) => {
    const z0 = await tx
      .update(schema.lernende)
      .set({ status: p.data.status, loeschenAb: beendet ? loeschenNachAustritt(jetzt) : null })
      .where(eq(schema.lernende.id, p.data.id))
      .returning({ id: schema.lernende.id });
    if (!z0.length) return false;
    if (beendet)
      await tx
        .update(schema.gruppenMitglied)
        .set({ bis: berlinerDatum(jetzt) })
        .where(and(eq(schema.gruppenMitglied.lernendeId, p.data.id), isNull(schema.gruppenMitglied.bis)));
    await protokolliere(
      {
        benutzerId: a.benutzerId,
        aktion: 'lernende.geaendert',
        zielTyp: 'lernende',
        zielId: p.data.id,
        details: { status: p.data.status },
      },
      tx,
    );
    return true;
  });
  if (!gefunden) throw new KeinRecht();
  redirect(`/verwaltung/lernende/${p.data.id}?meldung=status`);
}
