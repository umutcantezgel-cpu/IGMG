'use server';

import { eq, sql } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { protokolliere } from '@/lib/audit';
import { inhaltGeaendert } from '@/lib/cache/aktualisieren';
import { TAG } from '@/lib/cache/tags';
import { db, schema } from '@/lib/db';
import { gebeLaufFrei, gleicheAb, uebernimmKonflikte, type AbgleichErgebnis } from '@/lib/gebetszeiten/abgleich';
import { berechneTag } from '@/lib/gebetszeiten/berechnung';
import { leseEingefuegt, leseTabelle, type ImportErgebnis, type ImportFehler } from '@/lib/gebetszeiten/import';
import { kalibriere, type Guete, type KalibrierWarnung } from '@/lib/gebetszeiten/kalibrierung';
import { berlinerDatum } from '@/lib/gebetszeiten/naechstes';
import { GEBETE, type Gebet, type GebetszeitTag, type Tageszeiten } from '@/lib/gebetszeiten/typen';
import { KeinRecht, verlangeRecht } from '@/lib/rechte/pruefe';
import {
  gebetszeitenAbgleich,
  gebetszeitenEinstellung,
  gebetszeitenNaeherung,
  type GebetszeitenEinstellung,
  type GebetszeitenNaeherung,
} from '@/lib/validierung/einstellungen';
import { pruefeRate, type Grenze } from '@/lib/validierung/ratenbegrenzung';
import { ladeGebetszeitenEinstellung, ladeIgmgTage } from '@/server/queries/verwaltung/gebetszeiten';

/**
 * Verwaltung „Gebetszeiten“ (C07, K-08, ADR 0008, ADR 0048, G-06). Jede Action prüft zuerst `gebetszeiten.bearbeiten`.
 * Speichern wirkt öffentlich sofort (Tags gebetszeiten und einstellungen). Religiöse Inhalte werden nicht erzeugt:
 * Zeiten stammen aus dem IGMG-Gebetskalender (Abgleich oder eingefügte Tabelle), aus der Tabelle der Gemeinde oder aus der
 * Berechnung (adhan), „bestätigt“ setzt nur die Gemeinde.
 */
export type GebetszeitenZustand = {
  fehler?: string;
  feldFehler?: Record<string, string>;
  ok?: boolean;
  vorschau?: (Tageszeiten & { datum: string })[];
  /** Import-Prüfung */
  importFehler?: ImportFehler[];
  pruefung?: {
    anzahl: number;
    von: string;
    bis: string;
    erste: GebetszeitTag[];
    tage: string;
    dateiname: string;
    /** „igmg“ = eingefügte Tabelle aus dem IGMG-Gebetskalender, „import“ = Tabelle der Gemeinde */
    herkunft: 'igmg' | 'import';
    ort: string | null;
  };
  uebernommen?: number;
  /** „Jetzt abgleichen“ */
  abgleich?: Pick<AbgleichErgebnis, 'status' | 'tageGeprueft' | 'tageNeu' | 'tageGeaendert' | 'konflikte' | 'auffaellig' | 'fehlerCode'>;
  /** Vorschlag der Kalibrierung (nicht gespeichert) */
  vorschlag?: { naeherung: string; guete: Record<Gebet, Guete>; warnungen: KalibrierWarnung[]; tage: number };
};

const MAX_BYTES = 200 * 1024;
/** „Jetzt abgleichen“: höchstens ein Lauf je 5 Minuten (die Quelle der IGMG nicht belasten). */
const ABGLEICH_GRENZE: Grenze = { max: 1, fensterSekunden: 300 };

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
  const p = z.object({ aktiveQuelle: z.enum(['igmg', 'import', 'berechnung']), bestaetigt: z.boolean() }).safeParse({
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

const naechsteTage = (n: number) => {
  const [j, m, t] = berlinerDatum(new Date()).split('-').map(Number);
  return Array.from({ length: n }, (_, i) => new Date(Date.UTC(j, m - 1, t + i)).toISOString().slice(0, 10));
};

/**
 * Berechnungseinstellungen: Rückfall (Näherung „IGMG (angenähert)“ oder Methode) und die Methode selbst. „Vorschau“ rechnet
 * 7 Tage ohne zu speichern, „Speichern“ übernimmt.
 */
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
    rueckfall: fd.get('rueckfall') ?? alt.rueckfall,
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
  if (fd.get('richtung') === 'vorschau') return { vorschau: naechsteTage(7).map((datum) => ({ datum, ...berechneTag(datum, p.data) })) };
  await speichere(p.data, a.benutzerId, {
    rueckfall: p.data.rueckfall,
    methode: p.data.methode,
    madhab: p.data.madhab,
    hoheBreite: p.data.hoheBreite,
  });
  return { ok: true };
}

/**
 * Import Schritt 1: Datei lesen bzw. eingefügte Tabelle aus dem IGMG-Gebetskalender lesen und prüfen (nichts gespeichert).
 * Die geprüften Tage gehen als JSON zurück. Eine eingefügte Tabelle muss zum Ort der Gemeinde gehören (Wetzlar).
 */
export async function pruefeImport(_vorher: GebetszeitenZustand, fd: FormData): Promise<GebetszeitenZustand> {
  await verlangeRecht('gebetszeiten.bearbeiten');
  let ergebnis: ImportErgebnis;
  let dateiname: string;
  let herkunft: 'igmg' | 'import';
  const eingefuegt = fd.get('tabelle');
  if (typeof eingefuegt === 'string') {
    if (!eingefuegt.trim() || eingefuegt.length > MAX_BYTES) return { fehler: 'tabelle' };
    const einstellung = await ladeGebetszeitenEinstellung();
    ergebnis = leseEingefuegt(eingefuegt, einstellung.abgleich.stadtName);
    dateiname = 'IGMG-Gebetskalender (eingefügt)';
    herkunft = 'igmg';
  } else {
    const datei = fd.get('datei');
    if (!(datei instanceof File) || datei.size === 0 || datei.size > MAX_BYTES) return { fehler: 'datei' };
    const name = datei.name.toLowerCase();
    const art = name.endsWith('.json') ? 'json' : name.endsWith('.csv') ? 'csv' : null;
    if (!art) return { fehler: 'datei' };
    ergebnis = leseTabelle(await datei.text(), art);
    dateiname = datei.name.slice(0, 200);
    herkunft = 'import';
  }
  if (!ergebnis.ok) return { importFehler: ergebnis.fehler.slice(0, 20) };
  return {
    pruefung: {
      anzahl: ergebnis.tage.length,
      von: ergebnis.von,
      bis: ergebnis.bis,
      erste: ergebnis.tage.slice(0, 7),
      tage: JSON.stringify(ergebnis.tage.map(({ quelle: _q, ...rest }) => rest)),
      dateiname,
      herkunft,
      ort: ergebnis.ort ?? null,
    },
  };
}

/**
 * Import Schritt 2: übernehmen. Die Tage werden erneut geprüft (nie der Vorschau vertrauen), vorhandene Tage ersetzt.
 * Eingefügte IGMG-Tabellen werden als `quelle 'igmg'` gespeichert (Stand = jetzt), Dateien der Gemeinde als `import`.
 */
export async function uebernehmeImport(_vorher: GebetszeitenZustand, fd: FormData): Promise<GebetszeitenZustand> {
  const a = await verlangeRecht('gebetszeiten.bearbeiten');
  const roh = String(fd.get('tage') ?? '');
  if (roh.length > MAX_BYTES * 2) return { fehler: 'datei' };
  const herkunft: 'igmg' | 'import' = fd.get('herkunft') === 'igmg' ? 'igmg' : 'import';
  const ergebnis = leseTabelle(roh, 'json', herkunft);
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
      .values(ergebnis.tage.map((t) => ({ ...t, quelle: herkunft, importId: imp.id })))
      .onConflictDoUpdate({
        target: schema.gebetszeitTag.datum,
        set: Object.fromEntries([
          ...GEBETE.map((g) => [g, sql.raw(`excluded."${g}"`)]),
          ['quelle', sql`excluded."quelle"`],
          ['importId', imp.id],
          ['abgleichId', null],
          ['aktualisiertAm', sql`now()`],
        ]),
      });
    await protokolliere(
      {
        benutzerId: a.benutzerId,
        aktion: 'gebetszeiten.importiert',
        zielTyp: 'gebetszeiten',
        zielId: imp.id,
        details: { tage: ergebnis.tage.length, von: ergebnis.von, bis: ergebnis.bis, ...(herkunft === 'igmg' ? { herkunft } : {}) },
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
      const neu = { ...(bisher.success ? bisher.data : gebetszeitenEinstellung.parse({})), aktiveQuelle: herkunft };
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

/** IGMG-Abgleich einstellen (ADR 0048): eingeschaltet, Stadt im IGMG-Kalender, Zeitraum und Freigabe. */
export async function speichereAbgleich(_vorher: GebetszeitenZustand, fd: FormData): Promise<GebetszeitenZustand> {
  const a = await verlangeRecht('gebetszeiten.bearbeiten');
  const p = gebetszeitenAbgleich.safeParse({
    aktiv: fd.get('aktiv') === 'ja',
    stadtId: String(fd.get('stadtId') ?? '').trim(),
    stadtName: String(fd.get('stadtName') ?? '').trim(),
    tageVoraus: zahl(fd, 'tageVoraus'),
    freigabe: fd.get('freigabe'),
  });
  if (!p.success) {
    const feldFehler: Record<string, string> = {};
    for (const i of p.error.issues) feldFehler[String(i.path[0] ?? 'formular')] ??= 'ungueltig';
    return { fehler: 'pruefen', feldFehler };
  }
  const alt = await ladeGebetszeitenEinstellung();
  await speichere({ ...alt, abgleich: p.data }, a.benutzerId, {
    abgleich: p.data.aktiv,
    freigabe: p.data.freigabe,
    stadtId: p.data.stadtId,
  });
  return { ok: true };
}

/** Cache-Tags nach geschriebenen Tagen: alle Gebetszeiten und je betroffenem Monat. */
function erneuere(monate: readonly string[]) {
  if (monate.length) inhaltGeaendert(TAG.gebetszeiten, ...monate.map((m) => TAG.gebetszeitenMonat(m)));
}

/** „Jetzt abgleichen“: ein Lauf wie der Cron, auch bei ausgeschaltetem Abgleich; höchstens alle 5 Minuten. */
export async function gleicheJetztAb(_vorher: GebetszeitenZustand, _fd: FormData): Promise<GebetszeitenZustand> {
  await verlangeRecht('gebetszeiten.bearbeiten');
  if (!(await pruefeRate('verwaltung-gebetszeiten-abgleich', 'gemeinde', ABGLEICH_GRENZE)).erlaubt) return { fehler: 'zuOft' };
  const e = await gleicheAb();
  erneuere(e.monate);
  return {
    abgleich: {
      status: e.status,
      tageGeprueft: e.tageGeprueft,
      tageNeu: e.tageNeu,
      tageGeaendert: e.tageGeaendert,
      konflikte: e.konflikte,
      auffaellig: e.auffaellig,
      fehlerCode: e.fehlerCode,
    },
  };
}

/** Auffällige Lieferung freigeben: die gelieferten Tage werden geschrieben (Importe der Gemeinde bleiben). */
export async function gebeAbgleichFrei(_vorher: GebetszeitenZustand, fd: FormData): Promise<GebetszeitenZustand> {
  const a = await verlangeRecht('gebetszeiten.bearbeiten');
  const id = z.uuid().safeParse(fd.get('lauf'));
  if (!id.success) return { fehler: 'pruefen' };
  const e = await gebeLaufFrei(id.data, a.benutzerId);
  if (!e) return { fehler: 'veraltet' };
  erneuere(e.monate);
  return { uebernommen: e.tage };
}

/** Konflikte auflösen: für die Konflikttage gelten die IGMG-Werte statt des Imports der Gemeinde. */
export async function uebernehmeKonflikte(_vorher: GebetszeitenZustand, _fd: FormData): Promise<GebetszeitenZustand> {
  const a = await verlangeRecht('gebetszeiten.bearbeiten');
  const e = await uebernimmKonflikte(a.benutzerId);
  erneuere(e.monate);
  return { uebernommen: e.tage };
}

const MIN_KALIBRIER_TAGE = 14;

/**
 * Näherung kalibrieren (ADR 0048): Vorschlag aus den IGMG-Tagen der Datenbank mit Güte je Gebet und 7-Tage-Vorschau –
 * gespeichert wird erst mit „Vorschlag übernehmen“ (`uebernehmeNaeherung`).
 */
export async function schlageNaeherungVor(_vorher: GebetszeitenZustand, _fd: FormData): Promise<GebetszeitenZustand> {
  await verlangeRecht('gebetszeiten.bearbeiten');
  const [einstellung, tage] = await Promise.all([ladeGebetszeitenEinstellung(), ladeIgmgTage()]);
  if (tage.length < MIN_KALIBRIER_TAGE) return { fehler: 'zuWenigeTage' };
  const k = kalibriere(tage, { breite: einstellung.breite, laenge: einstellung.laenge }, { kreuzprobe: false });
  const naeherung: GebetszeitenNaeherung = {
    ...k.naeherung,
    kalibriert: {
      am: berlinerDatum(new Date()),
      basis: `IGMG-Tage der Datenbank (${tage[0].datum} bis ${tage[tage.length - 1].datum})`,
      tage: tage.length,
      maxFehlerMin: Math.max(...GEBETE.map((g) => k.guete[g].maxFehlerMin)),
    },
  };
  return {
    vorschlag: { naeherung: JSON.stringify(naeherung), guete: k.guete, warnungen: k.warnungen, tage: tage.length },
    vorschau: naechsteTage(7).map((datum) => ({ datum, ...berechneTag(datum, { ...einstellung, rueckfall: 'naeherung', naeherung }) })),
  };
}

/** Vorschlag der Kalibrierung übernehmen: Näherung speichern (erneut geprüft) und als Rückfall setzen; Audit. */
export async function uebernehmeNaeherung(_vorher: GebetszeitenZustand, fd: FormData): Promise<GebetszeitenZustand> {
  const a = await verlangeRecht('gebetszeiten.bearbeiten');
  let roh: unknown;
  try {
    roh = JSON.parse(String(fd.get('naeherung') ?? ''));
  } catch {
    return { fehler: 'pruefen' };
  }
  const p = gebetszeitenNaeherung.safeParse(roh);
  if (!p.success) return { fehler: 'pruefen' };
  const alt = await ladeGebetszeitenEinstellung();
  await speichere({ ...alt, rueckfall: 'naeherung', naeherung: p.data }, a.benutzerId, {
    rueckfall: 'naeherung',
    fajrWinkel: p.data.fajrWinkel,
    ishaWinkel: p.data.ishaWinkel,
    kalibriert: p.data.kalibriert.am,
  });
  return { ok: true };
}
