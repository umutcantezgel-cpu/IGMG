'use server';

import { and, eq, isNotNull, isNull } from 'drizzle-orm';
import { refresh } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { protokolliere } from '@/lib/audit';
import { inhaltGeaendert } from '@/lib/cache/aktualisieren';
import { TAG } from '@/lib/cache/tags';
import { db, schema } from '@/lib/db';
import { darf, KeinRecht, verlangeRecht, type Angemeldet } from '@/lib/rechte/pruefe';
import { ankuendigungSchema, ausFormular, zuDatensatz } from '@/lib/validierung/ankuendigung';

/**
 * Verwaltung „Ankündigungen“ (V04, E-033). Reihenfolge je Action: Recht (Sitzung, 2FA) → Eingabe prüfen →
 * Organisationsrecht am alten UND neuen Ziel → Speichern → Audit → `inhaltGeaendert` (sofort öffentlich).
 * Fehler sind Schlüssel unter `verwaltung.ankuendigungen.fehler`; Antworten nennen keine Interna (S4).
 */
export type SpeicherZustand = {
  fehler?: string;
  feldFehler?: Record<string, string>;
  werte?: Record<string, unknown>;
  gespeichert?: number;
};

const v = schema.ankuendigung;
type Org = 'at' | 'kt' | 'gt' | 'kgt' | null;

function darfBearbeiten(a: Angemeldet, organisation: Org) {
  return darf(a.rollen, 'ankuendigung.bearbeiten', { organisation });
}

export async function speichereAnkuendigung(_vorher: SpeicherZustand, fd: FormData): Promise<SpeicherZustand> {
  let a: Angemeldet;
  try {
    a = await verlangeRecht('ankuendigung.lesen');
  } catch {
    return { fehler: 'keinRecht' };
  }
  const roh = ausFormular(fd);
  const geprueft = ankuendigungSchema.safeParse(roh);
  if (!geprueft.success) {
    const feldFehler: Record<string, string> = {};
    for (const f of geprueft.error.issues) {
      const feld = String(f.path[0] ?? 'formular');
      feldFehler[feld] ??= /^[a-zA-Z]+$/.test(f.message) && f.message.length < 30 ? f.message : 'ungueltig';
    }
    return { fehler: 'pruefen', feldFehler, werte: roh };
  }
  const e = geprueft.data;
  const daten = zuDatensatz(e);

  let bisher: { id: string; organisation: Org; status: 'entwurf' | 'veroeffentlicht'; imPapierkorbSeit: Date | null } | undefined;
  if (e.id) {
    [bisher] = await db
      .select({ id: v.id, organisation: v.organisation, status: v.status, imPapierkorbSeit: v.imPapierkorbSeit })
      .from(v)
      .where(eq(v.id, e.id))
      .limit(1);
    if (!bisher) return { fehler: 'nichtGefunden', werte: roh };
    if (!darfBearbeiten(a, bisher.organisation)) return { fehler: 'keinRecht', werte: roh };
    // Im Papierkorb nur lesen: wiederherstellen, dann bearbeiten (verhindert Änderungen über eine direkte Anfrage)
    if (bisher.imPapierkorbSeit) return { fehler: 'imPapierkorb', werte: roh };
  }
  // Organisationsrecht auch am neuen Ziel: Eine Organisationsredaktion kann nicht in eine fremde Organisation verschieben
  if (!darfBearbeiten(a, daten.organisation)) return { fehler: 'pruefen', feldFehler: { organisation: 'organisation' }, werte: roh };

  const vorher = bisher;
  const zielId = await db.transaction(async (tx) => {
    if (vorher) {
      await tx
        .update(v)
        .set({ ...daten, aktualisiertVon: a.benutzerId })
        .where(eq(v.id, vorher.id));
      await protokolliere({ benutzerId: a.benutzerId, aktion: 'inhalt.geaendert', zielTyp: 'ankuendigung', zielId: vorher.id }, tx);
      if (vorher.status !== 'veroeffentlicht' && daten.status === 'veroeffentlicht')
        await protokolliere({ benutzerId: a.benutzerId, aktion: 'inhalt.veroeffentlicht', zielTyp: 'ankuendigung', zielId: vorher.id }, tx);
      return vorher.id;
    }
    const [neu] = await tx
      .insert(v)
      .values({ ...daten, erstelltVon: a.benutzerId, aktualisiertVon: a.benutzerId })
      .returning({ id: v.id });
    await protokolliere({ benutzerId: a.benutzerId, aktion: 'inhalt.angelegt', zielTyp: 'ankuendigung', zielId: neu.id }, tx);
    if (daten.status === 'veroeffentlicht')
      await protokolliere({ benutzerId: a.benutzerId, aktion: 'inhalt.veroeffentlicht', zielTyp: 'ankuendigung', zielId: neu.id }, tx);
    return neu.id;
  });
  inhaltGeaendert(TAG.ankuendigungen);
  if (!vorher) redirect(`/verwaltung/ankuendigungen/${zielId}?angelegt=1`);
  return { gespeichert: Date.now() };
}

const idSchema = z.object({ id: z.uuid() });

/** Datensatz für Papierkorb-Aktionen: Eingabe prüfen und das Organisationsrecht am Datensatz. Wirft KeinRecht. */
async function datensatzFuer(fd: FormData, a: Angemeldet, aktion: 'ankuendigung.bearbeiten' | 'ankuendigung.loeschen') {
  const p = idSchema.safeParse({ id: fd.get('id') });
  if (!p.success) throw new KeinRecht();
  const [zeile] = await db
    .select({ id: v.id, organisation: v.organisation, imPapierkorbSeit: v.imPapierkorbSeit })
    .from(v)
    .where(eq(v.id, p.data.id))
    .limit(1);
  if (!zeile || !darf(a.rollen, aktion, { organisation: zeile.organisation })) throw new KeinRecht();
  return zeile;
}

/** In den Papierkorb (K-05): sofort nicht mehr öffentlich, wiederherstellbar. */
export async function inPapierkorb(fd: FormData): Promise<void> {
  const a = await verlangeRecht('ankuendigung.lesen');
  const zeile = await datensatzFuer(fd, a, 'ankuendigung.loeschen');
  await db.transaction(async (tx) => {
    const geaendert = await tx
      .update(v)
      .set({ imPapierkorbSeit: new Date(), aktualisiertVon: a.benutzerId })
      .where(and(eq(v.id, zeile.id), isNull(v.imPapierkorbSeit)))
      .returning({ id: v.id });
    if (geaendert.length)
      await protokolliere({ benutzerId: a.benutzerId, aktion: 'inhalt.papierkorb', zielTyp: 'ankuendigung', zielId: zeile.id }, tx);
  });
  inhaltGeaendert(TAG.ankuendigungen);
  refresh();
}

/** Aus dem Papierkorb zurück; danach wieder nach Veröffentlichungsstand und Laufzeit sichtbar. */
export async function wiederherstellen(fd: FormData): Promise<void> {
  const a = await verlangeRecht('ankuendigung.lesen');
  const zeile = await datensatzFuer(fd, a, 'ankuendigung.bearbeiten');
  await db.transaction(async (tx) => {
    const geaendert = await tx
      .update(v)
      .set({ imPapierkorbSeit: null, aktualisiertVon: a.benutzerId })
      .where(and(eq(v.id, zeile.id), isNotNull(v.imPapierkorbSeit)))
      .returning({ id: v.id });
    if (geaendert.length)
      await protokolliere({ benutzerId: a.benutzerId, aktion: 'inhalt.wiederhergestellt', zielTyp: 'ankuendigung', zielId: zeile.id }, tx);
  });
  inhaltGeaendert(TAG.ankuendigungen);
  refresh();
}

/** Endgültig löschen – nur aus dem Papierkorb (K-05). */
export async function endgueltigLoeschen(fd: FormData): Promise<void> {
  const a = await verlangeRecht('ankuendigung.lesen');
  const zeile = await datensatzFuer(fd, a, 'ankuendigung.loeschen');
  if (!zeile.imPapierkorbSeit) throw new KeinRecht();
  await db.transaction(async (tx) => {
    await tx.delete(v).where(and(eq(v.id, zeile.id), isNotNull(v.imPapierkorbSeit)));
    await protokolliere({ benutzerId: a.benutzerId, aktion: 'inhalt.geloescht', zielTyp: 'ankuendigung', zielId: zeile.id }, tx);
  });
  inhaltGeaendert(TAG.ankuendigungen);
  refresh();
}
