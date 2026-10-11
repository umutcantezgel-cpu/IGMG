'use server';

import { and, eq, isNotNull, isNull, like, ne } from 'drizzle-orm';
import { refresh } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { protokolliere } from '@/lib/audit';
import { inhaltGeaendert } from '@/lib/cache/aktualisieren';
import { TAG } from '@/lib/cache/tags';
import { db, schema } from '@/lib/db';
import { darf, KeinRecht, verlangeRecht, type Angemeldet } from '@/lib/rechte/pruefe';
import type { OrganisationKuerzel } from '@/lib/rechte/matrix';
import { ausFormular, neuigkeitSchema, slugAus, zuDatensatz } from '@/lib/validierung/neuigkeit';
import { bildFehlerFuer } from '@/lib/medien/bild';

/**
 * Verwaltung „Neuigkeiten“ (V03, ADR 0003/0005/0006). Reihenfolge je Action: Recht (Sitzung, 2FA) → Eingabe prüfen →
 * Organisationsrecht am alten UND neuen Ziel → Speichern → Audit → `inhaltGeaendert` (sofort öffentlich).
 * Fehler sind Schlüssel unter `verwaltung.neuigkeiten.fehler`; Antworten nennen keine Interna (S4).
 * Audit-Einträge enthalten nur IDs und Aktionen, nie Titel, Text oder Namen (G-07).
 */
export type SpeicherZustand = {
  fehler?: string;
  feldFehler?: Record<string, string>;
  werte?: Record<string, unknown>;
  gespeichert?: number;
};

const n = schema.nachricht;

function darfBearbeiten(a: Angemeldet, organisation: OrganisationKuerzel | null) {
  return darf(a.rollen, 'nachricht.bearbeiten', { organisation });
}

/** Öffentliche Caches für diesen Beitrag und die Liste (ADR 0004). */
function aktualisiereCaches(id: string) {
  inhaltGeaendert(TAG.nachrichten, TAG.nachricht(id));
}

/** Eindeutiger Slug: Wunsch oder aus dem Titel, bei Kollision mit -2, -3 … */
async function eindeutigerSlug(wunsch: string, eigeneId?: string): Promise<string> {
  const basis = wunsch || 'nachricht';
  const belegt = await db
    .select({ slug: n.slug })
    .from(n)
    .where(and(like(n.slug, `${basis}%`), eigeneId ? ne(n.id, eigeneId) : undefined));
  const vergeben = new Set(belegt.map((b) => b.slug));
  if (!vergeben.has(basis)) return basis;
  for (let i = 2; ; i++) if (!vergeben.has(`${basis}-${i}`)) return `${basis}-${i}`;
}

/** Anlegen oder Ändern einer Neuigkeit. Anlegen leitet zur Bearbeitungsseite weiter, Ändern meldet den Erfolg zurück. */
export async function speichereNeuigkeit(_vorher: SpeicherZustand, fd: FormData): Promise<SpeicherZustand> {
  let a: Angemeldet;
  try {
    a = await verlangeRecht('nachricht.lesen');
  } catch {
    return { fehler: 'keinRecht' };
  }
  const roh = ausFormular(fd);
  const geprueft = neuigkeitSchema.safeParse(roh);
  if (!geprueft.success) {
    const feldFehler: Record<string, string> = {};
    for (const f of geprueft.error.issues) {
      const feld = String(f.path[0] ?? 'formular');
      feldFehler[feld] ??= /^[a-zA-Z]+$/.test(f.message) && f.message.length < 30 ? f.message : 'ungueltig';
    }
    return { fehler: 'pruefen', feldFehler, werte: roh };
  }
  const e = geprueft.data;

  let alt:
    | {
        id: string;
        organisation: OrganisationKuerzel | null;
        status: 'entwurf' | 'veroeffentlicht';
        imPapierkorbSeit: Date | null;
        veroeffentlichtAm: Date | null;
      }
    | undefined;
  if (e.id) {
    [alt] = await db
      .select({
        id: n.id,
        organisation: n.organisation,
        status: n.status,
        imPapierkorbSeit: n.imPapierkorbSeit,
        veroeffentlichtAm: n.veroeffentlichtAm,
      })
      .from(n)
      .where(eq(n.id, e.id))
      .limit(1);
    if (!alt) return { fehler: 'nichtGefunden', werte: roh };
    if (!darfBearbeiten(a, alt.organisation)) return { fehler: 'keinRecht', werte: roh };
    // Ein Beitrag im Papierkorb wird nur über „Wiederherstellen“ wieder bearbeitbar (kein Ändern am Papierkorb-Eintrag)
    if (alt.imPapierkorbSeit) return { fehler: 'imPapierkorb', werte: roh };
  }

  // Titelbild und Bildknoten: nur vorhandene Bilder außerhalb des Papierkorbs (C11b)
  const bildFehler = await bildFehlerFuer({ bildId: e.bildId }, { inhaltDe: e.inhaltDe, inhaltTr: e.inhaltTr, inhaltEn: e.inhaltEn });
  if (bildFehler) return { fehler: 'pruefen', feldFehler: bildFehler, werte: roh };

  const daten = zuDatensatz(e, { veroeffentlichtBisher: alt?.veroeffentlichtAm ?? null, jetzt: new Date() });
  if (!darfBearbeiten(a, daten.organisation)) return { fehler: 'pruefen', feldFehler: { organisation: 'organisation' }, werte: roh };

  const slug = await eindeutigerSlug(e.slug || slugAus(e.titelDe), e.id);
  let id: string;
  if (alt) {
    id = alt.id;
    const bisherStatus = alt.status;
    await db.transaction(async (tx) => {
      await tx
        .update(n)
        .set({ ...daten, slug, aktualisiertVon: a.benutzerId })
        // Nur außerhalb des Papierkorbs – auch wenn er gleichzeitig dorthin verschoben wird (SP-C2 H5)
        .where(and(eq(n.id, id), isNull(n.imPapierkorbSeit)));
      await protokolliere({ benutzerId: a.benutzerId, aktion: 'inhalt.geaendert', zielTyp: 'nachricht', zielId: id }, tx);
      if (bisherStatus !== 'veroeffentlicht' && daten.status === 'veroeffentlicht')
        await protokolliere({ benutzerId: a.benutzerId, aktion: 'inhalt.veroeffentlicht', zielTyp: 'nachricht', zielId: id }, tx);
    });
  } else {
    id = await db.transaction(async (tx) => {
      const [neu] = await tx
        .insert(n)
        .values({ ...daten, slug, erstelltVon: a.benutzerId, aktualisiertVon: a.benutzerId })
        .returning({ id: n.id });
      await protokolliere({ benutzerId: a.benutzerId, aktion: 'inhalt.angelegt', zielTyp: 'nachricht', zielId: neu.id }, tx);
      if (daten.status === 'veroeffentlicht')
        await protokolliere({ benutzerId: a.benutzerId, aktion: 'inhalt.veroeffentlicht', zielTyp: 'nachricht', zielId: neu.id }, tx);
      return neu.id;
    });
  }
  aktualisiereCaches(id);
  if (!alt) redirect(`/verwaltung/neuigkeiten/${id}?angelegt=1`);
  return { gespeichert: Date.now() };
}

const idSchema = z.object({ id: z.uuid() });

/** Gemeinsamer Rahmen für Papierkorb-Aktionen: Recht, Datensatz, Organisationsrecht. Wirft KeinRecht. */
async function mitDatensatz(fd: FormData, aktion: 'nachricht.loeschen' | 'nachricht.bearbeiten') {
  const a = await verlangeRecht('nachricht.lesen');
  const p = idSchema.safeParse({ id: fd.get('id') });
  if (!p.success) throw new KeinRecht();
  const [zeile] = await db
    .select({ id: n.id, organisation: n.organisation, imPapierkorbSeit: n.imPapierkorbSeit })
    .from(n)
    .where(eq(n.id, p.data.id))
    .limit(1);
  if (!zeile || !darf(a.rollen, aktion, { organisation: zeile.organisation })) throw new KeinRecht();
  return { a, zeile };
}

/** In den Papierkorb (30 Tage, K-05): sofort nicht mehr öffentlich. */
export async function inPapierkorb(fd: FormData): Promise<void> {
  const { a, zeile } = await mitDatensatz(fd, 'nachricht.loeschen');
  await db.transaction(async (tx) => {
    const geaendert = await tx
      .update(n)
      .set({ imPapierkorbSeit: new Date(), aktualisiertVon: a.benutzerId })
      .where(and(eq(n.id, zeile.id), isNull(n.imPapierkorbSeit)))
      .returning({ id: n.id });
    if (geaendert.length)
      await protokolliere({ benutzerId: a.benutzerId, aktion: 'inhalt.papierkorb', zielTyp: 'nachricht', zielId: zeile.id }, tx);
  });
  aktualisiereCaches(zeile.id);
  refresh();
}

/** Aus dem Papierkorb zurück; war der Beitrag veröffentlicht, ist er es danach wieder. */
export async function wiederherstellen(fd: FormData): Promise<void> {
  const { a, zeile } = await mitDatensatz(fd, 'nachricht.bearbeiten');
  await db.transaction(async (tx) => {
    const geaendert = await tx
      .update(n)
      .set({ imPapierkorbSeit: null, aktualisiertVon: a.benutzerId })
      .where(and(eq(n.id, zeile.id), isNotNull(n.imPapierkorbSeit)))
      .returning({ id: n.id });
    if (geaendert.length)
      await protokolliere({ benutzerId: a.benutzerId, aktion: 'inhalt.wiederhergestellt', zielTyp: 'nachricht', zielId: zeile.id }, tx);
  });
  aktualisiereCaches(zeile.id);
  refresh();
}

/** Endgültig löschen – nur aus dem Papierkorb (K-05). */
export async function endgueltigLoeschen(fd: FormData): Promise<void> {
  const { a, zeile } = await mitDatensatz(fd, 'nachricht.loeschen');
  if (!zeile.imPapierkorbSeit) throw new KeinRecht();
  await db.transaction(async (tx) => {
    await tx.delete(n).where(and(eq(n.id, zeile.id), isNotNull(n.imPapierkorbSeit)));
    await protokolliere({ benutzerId: a.benutzerId, aktion: 'inhalt.geloescht', zielTyp: 'nachricht', zielId: zeile.id }, tx);
  });
  aktualisiereCaches(zeile.id);
  refresh();
}
