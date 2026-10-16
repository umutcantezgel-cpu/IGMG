'use server';

import { eq } from 'drizzle-orm';
import { refresh } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import type { ReihenfolgeZustand } from '@/components/verwaltung/reihenfolge/typen';
import { protokolliere } from '@/lib/audit';
import { inhaltGeaendert } from '@/lib/cache/aktualisieren';
import { TAG } from '@/lib/cache/tags';
import { schreibeRevision } from '@/lib/cms/revision';
import { db, schema, type Transaktion } from '@/lib/db';
import { KeinRecht, verlangeRecht, type Angemeldet } from '@/lib/rechte/pruefe';
import {
  istStandard,
  ordnungAus,
  STARTSEITE_ABSCHNITTE,
  STARTSEITE_EINSTELLUNG,
  standardOrdnung,
  startseitenOrdnung,
  type StartseitenOrdnung,
} from '@/lib/startseite/abschnitte';

/**
 * Verwaltung „Startseite“ (F-40, Plan §3.7, ADR 0032 Nr. 6; MUSTER 5): Reihenfolge und Sichtbarkeit der Abschnitte unter
 * dem festen Kopf. Recht `startseite.bearbeiten` (Redaktion, Administration). Gespeichert als Einstellung `startseite`
 * (Tabelle `einstellung`); jedes Speichern schreibt eine Revision (`revision`, Typ `startseite`) und einen Audit-Eintrag
 * ohne Personendaten. Danach verfällt der Cache-Tag `startseite` – die statische Startseite liest die neue Ordnung.
 * Ohne gespeicherte Ordnung gilt die Reihenfolge des Bestands.
 */
const REVISION = { inhaltTyp: 'startseite', inhaltId: STARTSEITE_EINSTELLUNG } as const;
const e = schema.einstellung;

/** Gespeicherte Ordnung lesen (null = keine). */
async function gespeicherteOrdnung(tx: Transaktion | typeof db): Promise<unknown | null> {
  const [zeile] = await tx.select({ wert: e.wert }).from(e).where(eq(e.schluessel, STARTSEITE_EINSTELLUNG)).limit(1);
  return zeile ? zeile.wert : null;
}

/** Ordnung speichern: Einstellung, Revision, Audit – in einer Transaktion. */
async function schreibe(tx: Transaktion, a: Angemeldet, ordnung: StartseitenOrdnung, kommentar: string | null) {
  await tx
    .insert(e)
    .values({ schluessel: STARTSEITE_EINSTELLUNG, wert: ordnung, geaendertVon: a.benutzerId })
    .onConflictDoUpdate({ target: e.schluessel, set: { wert: ordnung, geaendertAm: new Date(), geaendertVon: a.benutzerId } });
  await schreibeRevision(tx, { ...REVISION, inhalt: ordnung, erstelltVon: a.benutzerId, kommentar });
}

/** Details für das Audit: Reihenfolge der Kennungen und Zahl der ausgeblendeten Abschnitte. */
function details(ordnung: StartseitenOrdnung) {
  return { reihenfolge: ordnung.map((x) => x.schluessel).join(','), ausgeblendet: ordnung.filter((x) => !x.sichtbar).length };
}

/** Vollständige Ordnung aus dem Formular (jeder Abschnitt genau einmal), sonst null. */
function ausFormular(roh: FormDataEntryValue | null): StartseitenOrdnung | null {
  if (typeof roh !== 'string' || roh.length > 2000) return null;
  let wert: unknown;
  try {
    wert = JSON.parse(roh);
  } catch {
    return null;
  }
  const p = startseitenOrdnung.safeParse(wert);
  if (!p.success || p.data.length !== STARTSEITE_ABSCHNITTE.length) return null;
  return p.data;
}

export async function speichereStartseite(_vorher: ReihenfolgeZustand, fd: FormData): Promise<ReihenfolgeZustand> {
  let a: Angemeldet;
  try {
    a = await verlangeRecht('startseite.bearbeiten');
  } catch {
    return { fehler: 'keinRecht' };
  }
  const ordnung = ausFormular(fd.get('ordnung'));
  if (!ordnung) return { fehler: 'pruefen' };
  const geaendert = await db.transaction(async (tx) => {
    const alt = await gespeicherteOrdnung(tx);
    // Unverändert gespeichert: keine neue Fassung, kein Audit
    if (alt !== null && JSON.stringify(ordnungAus(alt)) === JSON.stringify(ordnung)) return false;
    await schreibe(tx, a, ordnung, null);
    await protokolliere(
      {
        benutzerId: a.benutzerId,
        aktion: 'einstellung.geaendert',
        zielTyp: 'einstellung',
        zielId: STARTSEITE_EINSTELLUNG,
        details: details(ordnung),
      },
      tx,
    );
    return true;
  });
  if (geaendert) inhaltGeaendert(TAG.startseite);
  refresh();
  return { gespeichert: Date.now() };
}

/** Gespeicherte Ordnung entfernen: Die Startseite zeigt wieder den Bestand. Eine Revision hält den Schritt fest. */
export async function startseiteZuruecksetzen(): Promise<void> {
  const a = await verlangeRecht('startseite.bearbeiten');
  const entfernt = await db.transaction(async (tx) => {
    const r = await tx.delete(e).where(eq(e.schluessel, STARTSEITE_EINSTELLUNG)).returning({ s: e.schluessel });
    if (!r.length) return false;
    const standard = standardOrdnung();
    await schreibeRevision(tx, { ...REVISION, inhalt: standard, erstelltVon: a.benutzerId, kommentar: 'standard' });
    await protokolliere(
      {
        benutzerId: a.benutzerId,
        aktion: 'einstellung.geaendert',
        zielTyp: 'einstellung',
        zielId: STARTSEITE_EINSTELLUNG,
        details: { ...details(standard), standard: true },
      },
      tx,
    );
    return true;
  });
  if (entfernt) inhaltGeaendert(TAG.startseite);
  redirect(`/verwaltung/startseite?zurueckgesetzt=${Date.now()}`);
}

const revisionSchema = z.object({ revisionId: z.uuid() });

/** Frühere Fassung zurückholen (erzeugt eine neue Fassung mit Vermerk). */
export async function startseiteRevisionWiederherstellen(fd: FormData): Promise<void> {
  const a = await verlangeRecht('startseite.bearbeiten');
  const p = revisionSchema.safeParse({ revisionId: fd.get('revisionId') });
  if (!p.success) return;
  const [rev] = await db.select().from(schema.revision).where(eq(schema.revision.id, p.data.revisionId)).limit(1);
  if (!rev || rev.inhaltTyp !== REVISION.inhaltTyp) throw new KeinRecht();
  const gueltig = startseitenOrdnung.safeParse(rev.inhalt);
  if (!gueltig.success) return;
  const ordnung = ordnungAus(gueltig.data);
  await db.transaction(async (tx) => {
    await schreibe(tx, a, ordnung, istStandard(ordnung) ? 'standard' : 'wiederhergestellt');
    await protokolliere(
      {
        benutzerId: a.benutzerId,
        aktion: 'inhalt.revision_wiederhergestellt',
        zielTyp: 'einstellung',
        zielId: STARTSEITE_EINSTELLUNG,
        details: { ...details(ordnung), revision: rev.id },
      },
      tx,
    );
  });
  inhaltGeaendert(TAG.startseite);
  redirect(`/verwaltung/startseite?wiederhergestellt=${Date.now()}`);
}
