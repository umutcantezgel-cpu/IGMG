'use server';

import { and, eq, inArray, isNull } from 'drizzle-orm';
import { refresh } from 'next/cache';
import { protokolliere } from '@/lib/audit';
import { inhaltGeaendert } from '@/lib/cache/aktualisieren';
import { TAG } from '@/lib/cache/tags';
import { schreibeRevision } from '@/lib/cms/revision';
import { seitenIdAusZiel } from '@/lib/cms/ziele';
import { db, schema } from '@/lib/db';
import type { Mehrsprachig } from '@/lib/db/schema/typen';
import { KeinRecht, verlangeRecht, type Angemeldet } from '@/lib/rechte/pruefe';
import { MENUE_SCHLUESSEL, pruefeMenue, zieleAus } from '@/lib/validierung/menue';

/**
 * Verwaltung „Menüs“ (ADR 0032, MUSTER 5): Kopf- und Fußmenü der Website. Recht `menue.bearbeiten` (nicht
 * organisationsgebunden). Jedes Speichern schreibt eine Revision; ohne gespeichertes Menü gilt der Bestand.
 * Fehler als Schlüssel unter `verwaltung.menues.fehler`.
 *
 * Gespeicherte Form (Spalte `menue.eintraege`): wie `MenueEintrag` aus dem Schema, zusätzlich die Kurzbeschreibung.
 */
type Gespeichert = { titel: Mehrsprachig; ziel: string; beschreibung?: Mehrsprachig; kinder?: Gespeichert[] };

export type MenueZustand = { fehler?: string; feldFehler?: Record<string, string>; gespeichert?: number };

export async function speichereMenue(_vorher: MenueZustand, fd: FormData): Promise<MenueZustand> {
  let a: Angemeldet;
  try {
    a = await verlangeRecht('menue.bearbeiten');
  } catch {
    return { fehler: 'keinRecht' };
  }
  const p = pruefeMenue(fd.get('schluessel'), fd.get('eintraege'));
  if (!p.ok) return { fehler: 'pruefen', feldFehler: p.feldFehler };
  // Freie Seiten als Ziel müssen existieren (außerhalb des Papierkorbs); Entwürfe erscheinen erst nach Veröffentlichung
  const ziele = zieleAus(p.eintraege);
  const seitenIds = [...new Set(ziele.map(seitenIdAusZiel).filter((id): id is string => id !== null))];
  if (seitenIds.length) {
    const vorhanden = new Set(
      (
        await db
          .select({ id: schema.seite.id })
          .from(schema.seite)
          .where(and(inArray(schema.seite.id, seitenIds), isNull(schema.seite.imPapierkorbSeit)))
      ).map((z) => z.id),
    );
    const fehlend = seitenIds.filter((id) => !vorhanden.has(id));
    if (fehlend.length) return { fehler: 'zielUnbekannt' };
  }
  const eintraege: Gespeichert[] =
    p.schluessel === 'kopf'
      ? p.eintraege.map((g) => ({ titel: g.titel, ziel: '', kinder: g.kinder.map((k) => ({ titel: k.titel, ziel: k.ziel, beschreibung: k.beschreibung })) }))
      : p.eintraege.map((k) => ({ titel: k.titel, ziel: k.ziel, beschreibung: k.beschreibung }));
  const schluessel = p.schluessel;
  await db.transaction(async (tx) => {
    await tx
      .insert(schema.menue)
      .values({ schluessel, eintraege, aktualisiertVon: a.benutzerId })
      .onConflictDoUpdate({ target: schema.menue.schluessel, set: { eintraege, aktualisiertVon: a.benutzerId, aktualisiertAm: new Date() } });
    await schreibeRevision(tx, { inhaltTyp: 'menue', inhaltId: schluessel, inhalt: eintraege, erstelltVon: a.benutzerId });
    await protokolliere({ benutzerId: a.benutzerId, aktion: 'inhalt.geaendert', zielTyp: 'menue', zielId: schluessel }, tx);
  });
  inhaltGeaendert(TAG.menue);
  refresh();
  return { gespeichert: Date.now() };
}

/** Gespeichertes Menü entfernen: Die Website zeigt wieder den Bestand. */
export async function menueZuruecksetzen(fd: FormData): Promise<void> {
  const a = await verlangeRecht('menue.bearbeiten');
  const schluessel = fd.get('schluessel');
  if (!MENUE_SCHLUESSEL.some((k) => k === schluessel)) throw new KeinRecht();
  await db.transaction(async (tx) => {
    const geloescht = await tx
      .delete(schema.menue)
      .where(eq(schema.menue.schluessel, String(schluessel)))
      .returning({ s: schema.menue.schluessel });
    if (geloescht.length)
      await protokolliere({ benutzerId: a.benutzerId, aktion: 'inhalt.geloescht', zielTyp: 'menue', zielId: String(schluessel) }, tx);
  });
  inhaltGeaendert(TAG.menue);
  refresh();
}
