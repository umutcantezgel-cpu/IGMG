'use server';

import { and, eq, sql } from 'drizzle-orm';
import { refresh } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { protokolliere } from '@/lib/audit';
import { db, schema } from '@/lib/db';
import { verlangeRecht, type Angemeldet } from '@/lib/rechte/pruefe';
import { antwortSchema, ausFormular, feldFehlerAus, neueUnterhaltungSchema } from '@/lib/validierung/postfach';
import { istTeilnehmer, ladeEmpfaenger, ungeleseneBedingung } from '@/server/queries/verwaltung/postfach';

/**
 * Internes Postfach der Verwaltung (C09, V09, ADR 0003/0005). Reihenfolge je Action: Recht (Sitzung, zweiter Faktor,
 * Rolle `postfach.nutzen`) → Teilnahme → Eingabe prüfen → Speichern → Audit. Keine öffentliche Wirkung, daher kein
 * Cache-Tag. Fehler sind Schlüssel unter `verwaltung.postfach.fehler`; fremde Unterhaltungen erscheinen als „nicht gefunden“.
 * Das Audit nennt nie Betreff oder Text (G-07): nur Zähler bzw. das Kennzeichen „antwort“.
 */
export type PostfachZustand = {
  fehler?: string;
  feldFehler?: Record<string, string>;
  werte?: Record<string, unknown>;
  gesendet?: number;
};

const u = schema.unterhaltung;
const t = schema.unterhaltungTeilnehmer;
const n = schema.postfachNachricht;

/** Neue Unterhaltung: Betreff, Empfänger (nur Konten mit Verwaltungszugang) und erste Nachricht. Leitet zur Unterhaltung weiter. */
export async function neueUnterhaltung(_vorher: PostfachZustand, fd: FormData): Promise<PostfachZustand> {
  let a: Angemeldet;
  try {
    a = await verlangeRecht('postfach.nutzen');
  } catch {
    return { fehler: 'keinRecht' };
  }
  const roh = ausFormular(fd);
  const geprueft = neueUnterhaltungSchema.safeParse(roh);
  if (!geprueft.success) return { fehler: 'pruefen', feldFehler: feldFehlerAus(geprueft.error), werte: roh };
  const e = geprueft.data;
  const ziele = [...new Set(e.empfaenger)];
  const erlaubt = new Set((await ladeEmpfaenger(a.benutzerId)).map((z) => z.id));
  if (ziele.some((z) => !erlaubt.has(z))) return { fehler: 'pruefen', feldFehler: { empfaenger: 'empfaengerUngueltig' }, werte: roh };

  const id = await db.transaction(async (tx) => {
    const [neu] = await tx.insert(u).values({ betreff: e.betreff, erstelltVon: a.benutzerId }).returning({ id: u.id });
    // Der Absender hat die eigene Nachricht gelesen: `gelesen_bis` und Nachrichtenzeit stammen aus derselben Transaktion.
    await tx
      .insert(t)
      .values([
        { unterhaltungId: neu.id, benutzerId: a.benutzerId, gelesenBis: sql`now()` },
        ...ziele.map((benutzerId) => ({ unterhaltungId: neu.id, benutzerId })),
      ]);
    await tx.insert(n).values({ unterhaltungId: neu.id, absenderId: a.benutzerId, text: e.text });
    await protokolliere(
      {
        benutzerId: a.benutzerId,
        aktion: 'postfach.gesendet',
        zielTyp: 'unterhaltung',
        zielId: neu.id,
        details: { anzahlEmpfaenger: ziele.length },
      },
      tx,
    );
    return neu.id;
  });
  redirect(`/verwaltung/postfach/${id}?gesendet=1`);
}

/** Antwort in einer bestehenden Unterhaltung. Nur Teilnehmende; fremde ID → „nicht gefunden“, nichts wird geschrieben. */
export async function antworten(_vorher: PostfachZustand, fd: FormData): Promise<PostfachZustand> {
  let a: Angemeldet;
  try {
    a = await verlangeRecht('postfach.nutzen');
  } catch {
    return { fehler: 'keinRecht' };
  }
  const kennung = z.uuid().safeParse(fd.get('unterhaltungId'));
  if (!kennung.success || !(await istTeilnehmer(kennung.data, a.benutzerId))) return { fehler: 'nichtGefunden' };
  const id = kennung.data;
  const roh = ausFormular(fd);
  const geprueft = antwortSchema.safeParse(roh);
  if (!geprueft.success) return { fehler: 'pruefen', feldFehler: feldFehlerAus(geprueft.error), werte: { text: roh.text ?? '' } };

  await db.transaction(async (tx) => {
    await tx.insert(n).values({ unterhaltungId: id, absenderId: a.benutzerId, text: geprueft.data.text });
    await tx
      .update(u)
      .set({ letzteNachrichtAm: sql`now()` })
      .where(eq(u.id, id));
    await tx
      .update(t)
      .set({ gelesenBis: sql`now()` })
      .where(and(eq(t.unterhaltungId, id), eq(t.benutzerId, a.benutzerId)));
    await protokolliere(
      { benutzerId: a.benutzerId, aktion: 'postfach.gesendet', zielTyp: 'unterhaltung', zielId: id, details: { antwort: true } },
      tx,
    );
  });
  refresh();
  return { gesendet: Date.now() };
}

/**
 * Markiert eine Unterhaltung als gelesen (beim Öffnen). Setzt nur das eigene `gelesen_bis` und nur, wenn es
 * ungelesene Nachrichten anderer Konten gibt; sonst geschieht nichts. Fremde Unterhaltungen bleiben unberührt.
 */
export async function markiereGelesen(id: string): Promise<void> {
  let a: Angemeldet;
  try {
    a = await verlangeRecht('postfach.nutzen');
  } catch {
    return;
  }
  if (!z.uuid().safeParse(id).success) return;
  const geaendert = await db
    .update(t)
    .set({ gelesenBis: sql`now()` })
    .where(
      and(
        eq(t.unterhaltungId, id),
        eq(t.benutzerId, a.benutzerId),
        sql`exists (select 1 from ${n} where ${n.unterhaltungId} = ${t.unterhaltungId} and ${ungeleseneBedingung(a.benutzerId)})`,
      ),
    )
    .returning({ unterhaltungId: t.unterhaltungId });
  if (geaendert.length > 0) refresh();
}
