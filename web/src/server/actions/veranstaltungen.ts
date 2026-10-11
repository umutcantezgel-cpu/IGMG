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
import { ausFormular, regelFehler, slugAus, veranstaltungSchema, zuDatensatz } from '@/lib/validierung/veranstaltung';
import { bildFehlerFuer } from '@/lib/medien/bild';

/**
 * Verwaltung „Veranstaltungen“ (D05, V02, ADR 0003/0005). Reihenfolge je Action: Recht (Sitzung, 2FA) →
 * Eingabe prüfen → Organisationsrecht am alten UND neuen Ziel → Speichern → Audit → `updateTag` (sofort öffentlich).
 * Fehler sind Schlüssel unter `verwaltung.veranstaltungen.fehler`; Antworten nennen keine Interna (S4).
 */
export type SpeicherZustand = {
  fehler?: string;
  feldFehler?: Record<string, string>;
  werte?: Record<string, unknown>;
  gespeichert?: number;
};

const v = schema.veranstaltung;
type Org = 'at' | 'kt' | 'gt' | 'kgt' | null;

function darfBearbeiten(a: Angemeldet, organisation: Org) {
  return darf(a.rollen, 'veranstaltung.bearbeiten', { organisation });
}

function aktualisiereCaches(id: string) {
  inhaltGeaendert(TAG.veranstaltungen, TAG.veranstaltung(id));
}

/** Eindeutiger Slug: Wunsch oder aus dem Titel, bei Kollision mit -2, -3 … */
async function eindeutigerSlug(wunsch: string, eigeneId?: string): Promise<string> {
  const basis = wunsch || 'veranstaltung';
  const belegt = await db
    .select({ slug: v.slug })
    .from(v)
    .where(and(like(v.slug, `${basis}%`), eigeneId ? ne(v.id, eigeneId) : undefined));
  const vergeben = new Set(belegt.map((b) => b.slug));
  if (!vergeben.has(basis)) return basis;
  for (let i = 2; ; i++) if (!vergeben.has(`${basis}-${i}`)) return `${basis}-${i}`;
}

export async function speichereVeranstaltung(_vorher: SpeicherZustand, fd: FormData): Promise<SpeicherZustand> {
  let a: Angemeldet;
  try {
    a = await verlangeRecht('veranstaltung.lesen');
  } catch {
    return { fehler: 'keinRecht' };
  }
  const roh = ausFormular(fd);
  const geprueft = veranstaltungSchema.safeParse(roh);
  if (!geprueft.success) {
    const feldFehler: Record<string, string> = {};
    for (const f of geprueft.error.issues) {
      const feld = String(f.path[0] ?? 'formular');
      feldFehler[feld] ??= /^[a-zA-Z]+$/.test(f.message) && f.message.length < 30 ? f.message : 'ungueltig';
    }
    return { fehler: 'pruefen', feldFehler, werte: roh };
  }
  const e = geprueft.data;
  const rf = regelFehler(e);
  if (rf) return { fehler: 'pruefen', feldFehler: { whRoh: rf, whArt: rf }, werte: roh };
  // Bild: nur vorhandene Bilder außerhalb des Papierkorbs (C11b)
  const bildFehler = await bildFehlerFuer({ bildId: e.bildId });
  if (bildFehler) return { fehler: 'pruefen', feldFehler: bildFehler, werte: roh };
  const daten = zuDatensatz(e);

  let alt: { id: string; organisation: Org; status: 'entwurf' | 'veroeffentlicht'; imPapierkorbSeit: Date | null } | undefined;
  if (e.id) {
    [alt] = await db
      .select({ id: v.id, organisation: v.organisation, status: v.status, imPapierkorbSeit: v.imPapierkorbSeit })
      .from(v)
      .where(eq(v.id, e.id))
      .limit(1);
    if (!alt) return { fehler: 'nichtGefunden', werte: roh };
    // Im Papierkorb nur wiederherstellen oder löschen – nicht bearbeiten (Befund C03/C06: vorher nur die Oberfläche gesperrt)
    if (alt.imPapierkorbSeit) return { fehler: 'imPapierkorb', werte: roh };
    if (!darfBearbeiten(a, alt.organisation)) return { fehler: 'keinRecht', werte: roh };
  }
  if (!darfBearbeiten(a, daten.organisation)) return { fehler: 'pruefen', feldFehler: { organisation: 'organisation' }, werte: roh };

  const slug = await eindeutigerSlug(e.slug || slugAus(e.titelDe), e.id);
  let id: string;
  if (alt) {
    id = alt.id;
    await db.transaction(async (tx) => {
      await tx
        .update(v)
        .set({ ...daten, slug, aktualisiertVon: a.benutzerId })
        .where(eq(v.id, id));
      await protokolliere({ benutzerId: a.benutzerId, aktion: 'inhalt.geaendert', zielTyp: 'veranstaltung', zielId: id }, tx);
      if (alt.status !== 'veroeffentlicht' && daten.status === 'veroeffentlicht')
        await protokolliere({ benutzerId: a.benutzerId, aktion: 'inhalt.veroeffentlicht', zielTyp: 'veranstaltung', zielId: id }, tx);
    });
  } else {
    id = await db.transaction(async (tx) => {
      const [neu] = await tx
        .insert(v)
        .values({ ...daten, slug, erstelltVon: a.benutzerId, aktualisiertVon: a.benutzerId })
        .returning({ id: v.id });
      await protokolliere({ benutzerId: a.benutzerId, aktion: 'inhalt.angelegt', zielTyp: 'veranstaltung', zielId: neu.id }, tx);
      if (daten.status === 'veroeffentlicht')
        await protokolliere({ benutzerId: a.benutzerId, aktion: 'inhalt.veroeffentlicht', zielTyp: 'veranstaltung', zielId: neu.id }, tx);
      return neu.id;
    });
  }
  aktualisiereCaches(id);
  if (!alt) redirect(`/verwaltung/veranstaltungen/${id}?angelegt=1`);
  return { gespeichert: Date.now() };
}

const idSchema = z.object({ id: z.uuid() });

/** Gemeinsamer Rahmen für Papierkorb-Aktionen: Recht, Datensatz, Organisationsrecht. Wirft KeinRecht. */
async function mitDatensatz(fd: FormData, aktion: 'veranstaltung.loeschen' | 'veranstaltung.bearbeiten') {
  const a = await verlangeRecht('veranstaltung.lesen');
  const p = idSchema.safeParse({ id: fd.get('id') });
  if (!p.success) throw new KeinRecht();
  const [z] = await db
    .select({ id: v.id, organisation: v.organisation, imPapierkorbSeit: v.imPapierkorbSeit })
    .from(v)
    .where(eq(v.id, p.data.id))
    .limit(1);
  if (!z || !darf(a.rollen, aktion, { organisation: z.organisation })) throw new KeinRecht();
  return { a, z };
}

/** In den Papierkorb (30 Tage, K-05): sofort nicht mehr öffentlich. */
export async function inPapierkorb(fd: FormData): Promise<void> {
  const { a, z } = await mitDatensatz(fd, 'veranstaltung.loeschen');
  await db.transaction(async (tx) => {
    await tx
      .update(v)
      .set({ imPapierkorbSeit: new Date(), aktualisiertVon: a.benutzerId })
      .where(and(eq(v.id, z.id), isNull(v.imPapierkorbSeit)));
    await protokolliere({ benutzerId: a.benutzerId, aktion: 'inhalt.papierkorb', zielTyp: 'veranstaltung', zielId: z.id }, tx);
  });
  aktualisiereCaches(z.id);
  refresh();
}

export async function wiederherstellen(fd: FormData): Promise<void> {
  const { a, z } = await mitDatensatz(fd, 'veranstaltung.bearbeiten');
  await db.transaction(async (tx) => {
    const geaendert = await tx
      .update(v)
      .set({ imPapierkorbSeit: null, aktualisiertVon: a.benutzerId })
      .where(and(eq(v.id, z.id), isNotNull(v.imPapierkorbSeit)))
      .returning({ id: v.id });
    if (geaendert.length)
      await protokolliere({ benutzerId: a.benutzerId, aktion: 'inhalt.wiederhergestellt', zielTyp: 'veranstaltung', zielId: z.id }, tx);
  });
  aktualisiereCaches(z.id);
  refresh();
}

/** Endgültig löschen – nur aus dem Papierkorb. Anmeldungen (Eingänge) bleiben bis zu ihrer Löschfrist. */
export async function endgueltigLoeschen(fd: FormData): Promise<void> {
  const { a, z } = await mitDatensatz(fd, 'veranstaltung.loeschen');
  if (!z.imPapierkorbSeit) throw new KeinRecht();
  await db.transaction(async (tx) => {
    await tx.delete(v).where(and(eq(v.id, z.id), isNotNull(v.imPapierkorbSeit)));
    await protokolliere({ benutzerId: a.benutzerId, aktion: 'inhalt.geloescht', zielTyp: 'veranstaltung', zielId: z.id }, tx);
  });
  aktualisiereCaches(z.id);
  refresh();
}
