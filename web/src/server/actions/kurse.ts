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
import { ausFormular, kursSchema, kursSlugAus, zuDatensatz } from '@/lib/validierung/kurs';
import { bildFehlerFuer } from '@/lib/medien/bild';

/**
 * Verwaltung „Kurse“ (V06, ADR 0003/0005). Reihenfolge je Action: Recht (Sitzung, zweiter Faktor, Rolle) → Eingabe prüfen →
 * Speichern → Audit → `inhaltGeaendert` (sofort öffentlich). Fehler sind Schlüssel unter `verwaltung.kurse.fehler`;
 * Antworten nennen keine Interna.
 */
export type SpeicherZustand = {
  fehler?: string;
  feldFehler?: Record<string, string>;
  werte?: Record<string, unknown>;
  gespeichert?: number;
};

const k = schema.kurs;
const idSchema = z.object({ id: z.uuid() });
/** Fehlerschlüssel, die `verwaltung.kurse.fehler` kennt; alle anderen Prüfungen melden „ungueltig“. */
const BEKANNTE_FEHLER = new Set(['pflicht', 'zuLang', 'zahl', 'slug', 'deFehlt', 'uebersetzungZeilen', 'ungueltig']);

function aktualisiereCaches() {
  inhaltGeaendert(TAG.kurse);
}

/** Eindeutiger Slug: Wunsch, bei Kollision mit -2, -3 … (die eigene Zeile zählt nicht). */
async function eindeutigerSlug(wunsch: string, eigeneId?: string): Promise<string> {
  const belegt = await db
    .select({ slug: k.slug })
    .from(k)
    .where(and(like(k.slug, `${wunsch}%`), eigeneId ? ne(k.id, eigeneId) : undefined));
  const vergeben = new Set(belegt.map((b) => b.slug));
  if (!vergeben.has(wunsch)) return wunsch;
  for (let i = 2; ; i++) if (!vergeben.has(`${wunsch}-${i}`)) return `${wunsch}-${i}`;
}

/** Anlegen und Ändern. Ein Kurs im Papierkorb lässt sich nicht ändern (auch nicht über die Schnittstelle). */
export async function speichereKurs(_vorher: SpeicherZustand, fd: FormData): Promise<SpeicherZustand> {
  let a: Angemeldet;
  try {
    a = await verlangeRecht('kurs.lesen');
  } catch {
    return { fehler: 'keinRecht' };
  }
  if (!darf(a.rollen, 'kurs.bearbeiten')) return { fehler: 'keinRecht' };

  const roh = ausFormular(fd);
  const geprueft = kursSchema.safeParse(roh);
  if (!geprueft.success) {
    const feldFehler: Record<string, string> = {};
    for (const f of geprueft.error.issues) {
      const feld = String(f.path[0] ?? 'formular');
      feldFehler[feld] ??= BEKANNTE_FEHLER.has(f.message) ? f.message : 'ungueltig';
    }
    return { fehler: 'pruefen', feldFehler, werte: roh };
  }
  const e = geprueft.data;
  // Bild: nur vorhandene Bilder außerhalb des Papierkorbs (C11b)
  const bildFehler = await bildFehlerFuer({ bildId: e.bildId });
  if (bildFehler) return { fehler: 'pruefen', feldFehler: bildFehler, werte: roh };
  const daten = zuDatensatz(e);

  let alt: { id: string; slug: string; status: 'entwurf' | 'veroeffentlicht'; imPapierkorbSeit: Date | null } | undefined;
  if (e.id) {
    [alt] = await db
      .select({ id: k.id, slug: k.slug, status: k.status, imPapierkorbSeit: k.imPapierkorbSeit })
      .from(k)
      .where(eq(k.id, e.id))
      .limit(1);
    if (!alt) return { fehler: 'nichtGefunden', werte: roh };
    if (alt.imPapierkorbSeit) return { fehler: 'imPapierkorb', werte: roh };
  }
  // Die Adresse bleibt beim Bearbeiten erhalten; nur ein ausdrücklich geänderter Slug wird neu vergeben.
  const slug = await eindeutigerSlug(e.slug || alt?.slug || kursSlugAus(e.titelDe), alt?.id);

  let id: string;
  if (alt) {
    const bestand = alt;
    id = bestand.id;
    await db.transaction(async (tx) => {
      await tx
        .update(k)
        .set({ ...daten, slug, aktualisiertVon: a.benutzerId })
        .where(eq(k.id, bestand.id));
      await protokolliere({ benutzerId: a.benutzerId, aktion: 'inhalt.geaendert', zielTyp: 'kurs', zielId: bestand.id }, tx);
      if (bestand.status !== 'veroeffentlicht' && daten.status === 'veroeffentlicht')
        await protokolliere({ benutzerId: a.benutzerId, aktion: 'inhalt.veroeffentlicht', zielTyp: 'kurs', zielId: bestand.id }, tx);
    });
  } else {
    id = await db.transaction(async (tx) => {
      const [neu] = await tx
        .insert(k)
        .values({ ...daten, slug, erstelltVon: a.benutzerId, aktualisiertVon: a.benutzerId })
        .returning({ id: k.id });
      await protokolliere({ benutzerId: a.benutzerId, aktion: 'inhalt.angelegt', zielTyp: 'kurs', zielId: neu.id }, tx);
      if (daten.status === 'veroeffentlicht')
        await protokolliere({ benutzerId: a.benutzerId, aktion: 'inhalt.veroeffentlicht', zielTyp: 'kurs', zielId: neu.id }, tx);
      return neu.id;
    });
  }
  aktualisiereCaches();
  if (!alt) redirect(`/verwaltung/kurse/${id}?angelegt=1`);
  return { gespeichert: Date.now() };
}

/** Datensatz aus dem Formular. Wirft KeinRecht, wenn die ID fehlt oder den Kurs nicht gibt. */
async function zielKurs(fd: FormData) {
  const p = idSchema.safeParse({ id: fd.get('id') });
  if (!p.success) throw new KeinRecht();
  const [ziel] = await db.select({ id: k.id, imPapierkorbSeit: k.imPapierkorbSeit }).from(k).where(eq(k.id, p.data.id)).limit(1);
  if (!ziel) throw new KeinRecht();
  return ziel;
}

/** In den Papierkorb: sofort nicht mehr öffentlich. Wiederherstellbar, daher ohne Rückfrage. */
export async function inPapierkorb(fd: FormData): Promise<void> {
  const a = await verlangeRecht('kurs.lesen');
  if (!darf(a.rollen, 'kurs.loeschen')) throw new KeinRecht();
  const ziel = await zielKurs(fd);
  await db.transaction(async (tx) => {
    const geaendert = await tx
      .update(k)
      .set({ imPapierkorbSeit: new Date(), aktualisiertVon: a.benutzerId })
      .where(and(eq(k.id, ziel.id), isNull(k.imPapierkorbSeit)))
      .returning({ id: k.id });
    if (geaendert.length)
      await protokolliere({ benutzerId: a.benutzerId, aktion: 'inhalt.papierkorb', zielTyp: 'kurs', zielId: ziel.id }, tx);
  });
  aktualisiereCaches();
  refresh();
}

export async function wiederherstellen(fd: FormData): Promise<void> {
  const a = await verlangeRecht('kurs.lesen');
  if (!darf(a.rollen, 'kurs.bearbeiten')) throw new KeinRecht();
  const ziel = await zielKurs(fd);
  await db.transaction(async (tx) => {
    const geaendert = await tx
      .update(k)
      .set({ imPapierkorbSeit: null, aktualisiertVon: a.benutzerId })
      .where(and(eq(k.id, ziel.id), isNotNull(k.imPapierkorbSeit)))
      .returning({ id: k.id });
    if (geaendert.length)
      await protokolliere({ benutzerId: a.benutzerId, aktion: 'inhalt.wiederhergestellt', zielTyp: 'kurs', zielId: ziel.id }, tx);
  });
  aktualisiereCaches();
  refresh();
}

/** Endgültig löschen – nur aus dem Papierkorb. Kurse sind mit keinen anderen Datensätzen verknüpft. */
export async function endgueltigLoeschen(fd: FormData): Promise<void> {
  const a = await verlangeRecht('kurs.lesen');
  if (!darf(a.rollen, 'kurs.loeschen')) throw new KeinRecht();
  const ziel = await zielKurs(fd);
  if (!ziel.imPapierkorbSeit) throw new KeinRecht();
  await db.transaction(async (tx) => {
    await tx.delete(k).where(and(eq(k.id, ziel.id), isNotNull(k.imPapierkorbSeit)));
    await protokolliere({ benutzerId: a.benutzerId, aktion: 'inhalt.geloescht', zielTyp: 'kurs', zielId: ziel.id }, tx);
  });
  aktualisiereCaches();
  refresh();
}
