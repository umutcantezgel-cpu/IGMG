'use server';

import { eq, sql } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { protokolliere } from '@/lib/audit';
import { db, schema } from '@/lib/db';
import { funktionAn } from '@/lib/funktionen';
import { KURSARTEN, naechsteReihenfolge, tauschPartner } from '@/lib/lernen/verwaltung';
import { KeinRecht, verlangeRecht } from '@/lib/rechte/pruefe';
import { stufeSchema } from '@/lib/validierung/lernen';
import { ladeStufenDerKursart } from '@/server/queries/verwaltung/lehrplan';

/**
 * Lehrplan (H-L03): Stufen je Kursart anlegen, umbenennen (Titel de/tr) und sortieren. Religiöse Inhalte verfassen
 * Lehrkräfte bzw. die religiöse Prüfung (ADR 0030); hier stehen nur Bezeichnungen der Stufen. Kein Löschen: Fortschritte
 * der Lernenden hängen an den Stufen.
 */
async function verlange() {
  const a = await verlangeRecht('lehrplan.bearbeiten');
  if (!(await funktionAn('lernplattform'))) throw new KeinRecht();
  return a;
}

const zurKursart = (kursart: string, query: string) => `/verwaltung/lehrplan?${query}#kursart-${kursart}`;

function titel(de: string, tr: string) {
  return tr ? { de, tr } : { de };
}

export async function stufeAnlegen(fd: FormData): Promise<void> {
  const a = await verlange();
  const p = stufeSchema.safeParse({ kursart: fd.get('kursart'), titelDe: fd.get('titelDe'), titelTr: fd.get('titelTr') ?? '' });
  const kursart = z.enum(KURSARTEN).safeParse(fd.get('kursart'));
  if (!kursart.success) throw new KeinRecht();
  if (!p.success) redirect(zurKursart(kursart.data, `fehler=titel&kursart=${kursart.data}`));
  const id = await db.transaction(async (tx) => {
    // Unter Sperre je Kursart: gleichzeitiges Anlegen darf keine Reihenfolge doppelt vergeben
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${`igmg:lehrplan:${p.data.kursart}`}))`);
    const vorhanden = await tx
      .select({ reihenfolge: schema.lehrplanStufe.reihenfolge })
      .from(schema.lehrplanStufe)
      .where(eq(schema.lehrplanStufe.kursart, p.data.kursart));
    const [neu] = await tx
      .insert(schema.lehrplanStufe)
      .values({ kursart: p.data.kursart, reihenfolge: naechsteReihenfolge(vorhanden), titel: titel(p.data.titelDe, p.data.titelTr) })
      .returning({ id: schema.lehrplanStufe.id });
    await protokolliere(
      { benutzerId: a.benutzerId, aktion: 'lehrplan.geaendert', zielTyp: 'lehrplan', zielId: neu.id, details: { aenderung: 'angelegt' } },
      tx,
    );
    return neu.id;
  });
  redirect(zurKursart(p.data.kursart, `meldung=angelegt&stufe=${id}`));
}

export async function stufeUmbenennen(fd: FormData): Promise<void> {
  const a = await verlange();
  const id = z.uuid().safeParse(fd.get('id'));
  if (!id.success) throw new KeinRecht();
  const [stufe] = await db
    .select({ kursart: schema.lehrplanStufe.kursart })
    .from(schema.lehrplanStufe)
    .where(eq(schema.lehrplanStufe.id, id.data));
  if (!stufe) throw new KeinRecht();
  const p = stufeSchema.safeParse({ kursart: stufe.kursart, titelDe: fd.get('titelDe'), titelTr: fd.get('titelTr') ?? '' });
  if (!p.success) redirect(zurKursart(stufe.kursart, `fehler=titel&stufe=${id.data}`));
  await db.transaction(async (tx) => {
    await tx
      .update(schema.lehrplanStufe)
      .set({ titel: titel(p.data.titelDe, p.data.titelTr) })
      .where(eq(schema.lehrplanStufe.id, id.data));
    await protokolliere(
      { benutzerId: a.benutzerId, aktion: 'lehrplan.geaendert', zielTyp: 'lehrplan', zielId: id.data, details: { aenderung: 'umbenannt' } },
      tx,
    );
  });
  redirect(zurKursart(stufe.kursart, `meldung=umbenannt&stufe=${id.data}`));
}

/** Eine Stufe mit ihrem Nachbarn tauschen (hoch/runter). Eindeutige Reihenfolge je Kursart bleibt gewahrt. */
export async function stufeVerschieben(fd: FormData): Promise<void> {
  const a = await verlange();
  const p = z.object({ id: z.uuid(), richtung: z.enum(['hoch', 'runter']) }).safeParse({ id: fd.get('id'), richtung: fd.get('richtung') });
  if (!p.success) throw new KeinRecht();
  const [stufe] = await db
    .select({ kursart: schema.lehrplanStufe.kursart })
    .from(schema.lehrplanStufe)
    .where(eq(schema.lehrplanStufe.id, p.data.id));
  if (!stufe) throw new KeinRecht();
  const tausch = tauschPartner(await ladeStufenDerKursart(stufe.kursart), p.data.id, p.data.richtung);
  if (tausch) {
    await db.transaction(async (tx) => {
      // Zwischenwert außerhalb des Bereichs, damit die Eindeutigkeit (kursart, reihenfolge) nie verletzt ist
      await tx.update(schema.lehrplanStufe).set({ reihenfolge: -1 }).where(eq(schema.lehrplanStufe.id, tausch.a.id));
      await tx.update(schema.lehrplanStufe).set({ reihenfolge: tausch.b.reihenfolge }).where(eq(schema.lehrplanStufe.id, tausch.b.id));
      await tx.update(schema.lehrplanStufe).set({ reihenfolge: tausch.a.reihenfolge }).where(eq(schema.lehrplanStufe.id, tausch.a.id));
      await protokolliere(
        {
          benutzerId: a.benutzerId,
          aktion: 'lehrplan.geaendert',
          zielTyp: 'lehrplan',
          zielId: p.data.id,
          details: { aenderung: 'verschoben', richtung: p.data.richtung },
        },
        tx,
      );
    });
  }
  redirect(zurKursart(stufe.kursart, `meldung=verschoben&stufe=${p.data.id}`));
}
