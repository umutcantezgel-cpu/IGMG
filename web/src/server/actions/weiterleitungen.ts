'use server';

import { eq, isNull } from 'drizzle-orm';
import { refresh } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { protokolliere } from '@/lib/audit';
import { inhaltGeaendert } from '@/lib/cache/aktualisieren';
import { TAG } from '@/lib/cache/tags';
import { fuehrtZuSchleife, wirksamerSlug, zerlegePfad, type Regel } from '@/lib/cms/slugs';
import { routingZielFuer } from '@/lib/cms/ziele';
import { db, schema } from '@/lib/db';
import { KeinRecht, verlangeRecht, type Angemeldet } from '@/lib/rechte/pruefe';
import { weiterleitungSchema } from '@/lib/validierung/weiterleitung';

/**
 * Verwaltung „Weiterleitungen“ (ADR 0032, MUSTER 5): alte Adresse → neue Adresse. Recht `weiterleitung.bearbeiten`.
 * Prüft: Quelle trifft keine bestehende Seite, Ziel existiert (Route der Website, freie Seite oder weitere
 * Weiterleitung), keine Schleife. Fehler als Schlüssel unter `verwaltung.weiterleitungen.fehler`.
 */
export type WeiterleitungZustand = {
  fehler?: string;
  feldFehler?: Record<string, string>;
  werte?: Record<string, unknown>;
  gespeichert?: number;
};

const w = schema.weiterleitung;

/** Slugs der freien Seiten außerhalb des Papierkorbs. */
async function seitenSlugs() {
  return db
    .select({ de: schema.seite.slugDe, tr: schema.seite.slugTr, en: schema.seite.slugEn })
    .from(schema.seite)
    .where(isNull(schema.seite.imPapierkorbSeit));
}

/** Gibt es unter diesem öffentlichen Pfad eine Seite (Route der Website oder freie Seite)? */
function seiteUnter(pfad: string, slugs: Awaited<ReturnType<typeof seitenSlugs>>): boolean {
  const { sprache, rest } = zerlegePfad(pfad);
  if (routingZielFuer(rest, sprache)) return true;
  const treffer = /^\/([a-z0-9-]+)$/.exec(rest);
  return Boolean(treffer && slugs.some((s) => wirksamerSlug(s, sprache) === treffer[1]));
}

export async function speichereWeiterleitung(_vorher: WeiterleitungZustand, fd: FormData): Promise<WeiterleitungZustand> {
  let a: Angemeldet;
  try {
    a = await verlangeRecht('weiterleitung.bearbeiten');
  } catch {
    return { fehler: 'keinRecht' };
  }
  const roh = { id: fd.get('id') ?? '', von: fd.get('von') ?? '', nach: fd.get('nach') ?? '', code: fd.get('code') ?? '308' };
  const p = weiterleitungSchema.safeParse(roh);
  if (!p.success) {
    const feldFehler: Record<string, string> = {};
    for (const f of p.error.issues) {
      const feld = String(f.path[0] ?? 'formular');
      feldFehler[feld] ??= /^[a-zA-Z]+$/.test(f.message) && f.message.length < 30 ? f.message : 'ungueltig';
    }
    return { fehler: 'pruefen', feldFehler, werte: roh };
  }
  const e = p.data;
  const [regeln, slugs] = await Promise.all([db.select({ id: w.id, von: w.von, nach: w.nach }).from(w), seitenSlugs()]);
  if (e.id && !regeln.some((r) => r.id === e.id)) return { fehler: 'nichtGefunden', werte: roh };
  const andere: Regel[] = regeln.filter((r) => r.id !== e.id);
  const feldFehler: Record<string, string> = {};
  if (andere.some((r) => r.von === e.von)) feldFehler.von = 'vonVergeben';
  else if (seiteUnter(e.von, slugs)) feldFehler.von = 'seiteVorhanden';
  if (!seiteUnter(e.nach, slugs) && !andere.some((r) => r.von === e.nach)) feldFehler.nach = 'zielUnbekannt';
  else if (fuehrtZuSchleife(andere, { von: e.von, nach: e.nach })) feldFehler.nach = 'schleife';
  if (Object.keys(feldFehler).length) return { fehler: 'pruefen', feldFehler, werte: roh };

  await db.transaction(async (tx) => {
    if (e.id) {
      await tx.update(w).set({ von: e.von, nach: e.nach, code: e.code }).where(eq(w.id, e.id));
      await protokolliere({ benutzerId: a.benutzerId, aktion: 'inhalt.geaendert', zielTyp: 'weiterleitung', zielId: e.id }, tx);
    } else {
      const [neu] = await tx.insert(w).values({ von: e.von, nach: e.nach, code: e.code, erstelltVon: a.benutzerId }).returning({ id: w.id });
      await protokolliere({ benutzerId: a.benutzerId, aktion: 'inhalt.angelegt', zielTyp: 'weiterleitung', zielId: neu.id }, tx);
    }
  });
  inhaltGeaendert(TAG.weiterleitungen);
  if (e.id) redirect('/verwaltung/weiterleitungen?gespeichert=1');
  // Liste darunter neu laden; das Formular steht danach leer für die nächste Weiterleitung bereit
  refresh();
  return { gespeichert: Date.now() };
}

export async function loescheWeiterleitung(fd: FormData): Promise<void> {
  const a = await verlangeRecht('weiterleitung.bearbeiten');
  const p = z.object({ id: z.uuid() }).safeParse({ id: fd.get('id') });
  if (!p.success) throw new KeinRecht();
  await db.transaction(async (tx) => {
    const geloescht = await tx.delete(w).where(eq(w.id, p.data.id)).returning({ id: w.id });
    if (geloescht.length)
      await protokolliere({ benutzerId: a.benutzerId, aktion: 'inhalt.geloescht', zielTyp: 'weiterleitung', zielId: p.data.id }, tx);
  });
  inhaltGeaendert(TAG.weiterleitungen);
  refresh();
}
