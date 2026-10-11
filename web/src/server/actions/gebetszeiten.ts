'use server';

import { eq, sql } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { protokolliere } from '@/lib/audit';
import { inhaltGeaendert } from '@/lib/cache/aktualisieren';
import { TAG } from '@/lib/cache/tags';
import { db, schema } from '@/lib/db';
import { berechneTag } from '@/lib/gebetszeiten/berechnung';
import { leseTabelle, type ImportFehler } from '@/lib/gebetszeiten/import';
import { berlinerDatum } from '@/lib/gebetszeiten/naechstes';
import { GEBETE, type GebetszeitTag, type Tageszeiten } from '@/lib/gebetszeiten/typen';
import { KeinRecht, verlangeRecht } from '@/lib/rechte/pruefe';
import { gebetszeitenEinstellung, type GebetszeitenEinstellung } from '@/lib/validierung/einstellungen';
import { ladeGebetszeitenEinstellung } from '@/server/queries/verwaltung/gebetszeiten';

/**
 * Verwaltung „Gebetszeiten“ (C07, K-08, ADR 0008, G-06). Jede Action prüft zuerst `gebetszeiten.bearbeiten`.
 * Speichern wirkt öffentlich sofort (Tags gebetszeiten und einstellungen). Religiöse Inhalte werden nicht erzeugt:
 * Zeiten stammen aus der Tabelle der Gemeinde oder aus der Berechnung (adhan), „bestätigt“ setzt nur die Gemeinde.
 */
export type GebetszeitenZustand = {
  fehler?: string;
  feldFehler?: Record<string, string>;
  ok?: boolean;
  vorschau?: (Tageszeiten & { datum: string })[];
  /** Import-Prüfung */
  importFehler?: ImportFehler[];
  pruefung?: { anzahl: number; von: string; bis: string; erste: GebetszeitTag[]; tage: string; dateiname: string };
  uebernommen?: number;
};

const MAX_BYTES = 200 * 1024;

async function speichere(neu: GebetszeitenEinstellung, benutzerId: string, details: Record<string, string | number | boolean | null>) {
  await db.transaction(async (tx) => {
    await tx
      .insert(schema.einstellung)
      .values({ schluessel: 'gebetszeiten', wert: neu })
      .onConflictDoUpdate({ target: schema.einstellung.schluessel, set: { wert: neu } });
    await protokolliere({ benutzerId, aktion: 'gebetszeiten.einstellung', zielTyp: 'einstellung', zielId: 'gebetszeiten', details }, tx);
  });
  inhaltGeaendert(TAG.gebetszeiten, TAG.einstellungen);
}

/** Aktive Quelle und Bestätigung durch die Gemeinde. */
export async function speichereQuelle(_vorher: GebetszeitenZustand, fd: FormData): Promise<GebetszeitenZustand> {
  const a = await verlangeRecht('gebetszeiten.bearbeiten');
  const p = z.object({ aktiveQuelle: z.enum(['import', 'berechnung']), bestaetigt: z.boolean() }).safeParse({
    aktiveQuelle: fd.get('aktiveQuelle'),
    bestaetigt: fd.get('bestaetigt') === 'ja',
  });
  if (!p.success) return { fehler: 'pruefen', feldFehler: { aktiveQuelle: 'ungueltig' } };
  const neu = { ...(await ladeGebetszeitenEinstellung()), ...p.data };
  await speichere(neu, a.benutzerId, { aktiveQuelle: neu.aktiveQuelle, bestaetigt: neu.bestaetigt });
  return { ok: true };
}

const zahl = (fd: FormData, name: string) => {
  const w = String(fd.get(name) ?? '')
    .trim()
    .replace(',', '.');
  return w === '' ? undefined : Number(w);
};

/** Berechnungseinstellungen: „Vorschau“ rechnet 7 Tage ohne zu speichern, „Speichern“ übernimmt. */
export async function speichereBerechnung(_vorher: GebetszeitenZustand, fd: FormData): Promise<GebetszeitenZustand> {
  const a = await verlangeRecht('gebetszeiten.bearbeiten');
  const alt = await ladeGebetszeitenEinstellung();
  const anpassungen: Record<string, number> = {};
  for (const g of GEBETE) {
    const w = zahl(fd, `anpassung-${g}`);
    if (w !== undefined && w !== 0) anpassungen[g] = w;
  }
  const p = gebetszeitenEinstellung.safeParse({
    ...alt,
    methode: fd.get('methode'),
    madhab: fd.get('madhab'),
    hoheBreite: fd.get('hoheBreite'),
    anpassungen,
    breite: zahl(fd, 'breite'),
    laenge: zahl(fd, 'laenge'),
  });
  if (!p.success) {
    const feldFehler: Record<string, string> = {};
    for (const i of p.error.issues) {
      const feld = i.path[0] === 'anpassungen' ? `anpassung-${String(i.path[1] ?? '')}` : String(i.path[0] ?? 'formular');
      feldFehler[feld] ??= 'ungueltig';
    }
    return { fehler: 'pruefen', feldFehler };
  }
  if (fd.get('richtung') === 'vorschau') {
    const heute = berlinerDatum(new Date());
    const [j, m, t] = heute.split('-').map(Number);
    const vorschau = Array.from({ length: 7 }, (_, i) => {
      const datum = new Date(Date.UTC(j, m - 1, t + i)).toISOString().slice(0, 10);
      return { datum, ...berechneTag(datum, p.data) };
    });
    return { vorschau };
  }
  await speichere(p.data, a.benutzerId, { methode: p.data.methode, madhab: p.data.madhab, hoheBreite: p.data.hoheBreite });
  return { ok: true };
}

/** Import Schritt 1: Datei lesen und prüfen (nichts gespeichert). Die geprüften Tage gehen als JSON zurück. */
export async function pruefeImport(_vorher: GebetszeitenZustand, fd: FormData): Promise<GebetszeitenZustand> {
  await verlangeRecht('gebetszeiten.bearbeiten');
  const datei = fd.get('datei');
  if (!(datei instanceof File) || datei.size === 0 || datei.size > MAX_BYTES) return { fehler: 'datei' };
  const name = datei.name.toLowerCase();
  const art = name.endsWith('.json') ? 'json' : name.endsWith('.csv') ? 'csv' : null;
  if (!art) return { fehler: 'datei' };
  const ergebnis = leseTabelle(await datei.text(), art);
  if (!ergebnis.ok) return { importFehler: ergebnis.fehler.slice(0, 20) };
  return {
    pruefung: {
      anzahl: ergebnis.tage.length,
      von: ergebnis.von,
      bis: ergebnis.bis,
      erste: ergebnis.tage.slice(0, 7),
      tage: JSON.stringify(ergebnis.tage.map(({ quelle: _q, ...rest }) => rest)),
      dateiname: datei.name.slice(0, 200),
    },
  };
}

/** Import Schritt 2: übernehmen. Die Tage werden erneut geprüft (nie der Vorschau vertrauen), vorhandene Tage ersetzt. */
export async function uebernehmeImport(_vorher: GebetszeitenZustand, fd: FormData): Promise<GebetszeitenZustand> {
  const a = await verlangeRecht('gebetszeiten.bearbeiten');
  const roh = String(fd.get('tage') ?? '');
  if (roh.length > MAX_BYTES * 2) return { fehler: 'datei' };
  const ergebnis = leseTabelle(roh, 'json');
  if (!ergebnis.ok) return { importFehler: ergebnis.fehler.slice(0, 20) };
  const dateiname = String(fd.get('dateiname') ?? '').slice(0, 200) || null;
  const alsQuelle = fd.get('alsQuelle') === 'ja';
  await db.transaction(async (tx) => {
    const [imp] = await tx
      .insert(schema.gebetszeitImport)
      .values({ dateiname, von: ergebnis.von, bis: ergebnis.bis, zeilen: ergebnis.tage.length, erstelltVon: a.benutzerId })
      .returning({ id: schema.gebetszeitImport.id });
    await tx
      .insert(schema.gebetszeitTag)
      .values(ergebnis.tage.map((t) => ({ ...t, quelle: 'import' as const, importId: imp.id })))
      .onConflictDoUpdate({
        target: schema.gebetszeitTag.datum,
        set: Object.fromEntries([...GEBETE.map((g) => [g, sql.raw(`excluded."${g}"`)]), ['quelle', sql`'import'`], ['importId', imp.id]]),
      });
    await protokolliere(
      {
        benutzerId: a.benutzerId,
        aktion: 'gebetszeiten.importiert',
        zielTyp: 'gebetszeiten',
        zielId: imp.id,
        details: { tage: ergebnis.tage.length, von: ergebnis.von, bis: ergebnis.bis },
      },
      tx,
    );
    if (alsQuelle) {
      const [z] = await tx
        .select({ wert: schema.einstellung.wert })
        .from(schema.einstellung)
        .where(eq(schema.einstellung.schluessel, 'gebetszeiten'))
        .limit(1);
      const bisher = gebetszeitenEinstellung.safeParse(z?.wert ?? {});
      const neu = { ...(bisher.success ? bisher.data : gebetszeitenEinstellung.parse({})), aktiveQuelle: 'import' as const };
      await tx
        .insert(schema.einstellung)
        .values({ schluessel: 'gebetszeiten', wert: neu })
        .onConflictDoUpdate({ target: schema.einstellung.schluessel, set: { wert: neu } });
    }
  });
  inhaltGeaendert(TAG.gebetszeiten, TAG.einstellungen);
  return { uebernommen: ergebnis.tage.length };
}

/** Tage eines Imports entfernen (für sie gilt danach die Berechnung); das Import-Protokoll bleibt. */
export async function entferneImport(fd: FormData): Promise<void> {
  const a = await verlangeRecht('gebetszeiten.bearbeiten');
  const id = z.uuid().safeParse(fd.get('id'));
  if (!id.success) throw new KeinRecht();
  await db.transaction(async (tx) => {
    const weg = await tx
      .delete(schema.gebetszeitTag)
      .where(eq(schema.gebetszeitTag.importId, id.data))
      .returning({ datum: schema.gebetszeitTag.datum });
    await protokolliere(
      {
        benutzerId: a.benutzerId,
        aktion: 'gebetszeiten.import_entfernt',
        zielTyp: 'gebetszeiten',
        zielId: id.data,
        details: { tage: weg.length },
      },
      tx,
    );
  });
  inhaltGeaendert(TAG.gebetszeiten);
  redirect('/verwaltung/gebetszeiten?entfernt=1');
}
