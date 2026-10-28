import Papa from 'papaparse';
import { z } from 'zod';
import { buchstaben, normalisiereZeile, reihenfolgeOk, zerlegeEingefuegt } from './quellen/normalisieren';
import { GEBETE, ZEIT_MUSTER, type GebetszeitTag, type Tageszeiten, type Zeitquelle } from './typen';

/**
 * Tabellen-Import (K-08, ADR 0008, ADR 0048): CSV (Trenner , ; oder Tabulator) oder JSON mit Spalten datum, imsak, gunes,
 * ogle, ikindi, aksam, yatsi – oder den Köpfen des IGMG-Gebetskalenders (Tarih/Datum, İmsak/Morgen, Güneş/S.aufgang,
 * Öğle/Mittag, İkindi/N.mittag, Akşam/Abend, Yatsı/Nacht; `quellen/normalisieren.ts`). Dazu die eingefügte Tabelle aus dem
 * IGMG-Gebetskalender (`leseEingefuegt`). Prüft Format, Reihenfolge (Yatsı nach Mitternacht erlaubt) und lückenlose Tage.
 * Fehler werden als Schlüssel (messages) mit Zeilennummer zurückgegeben.
 */
const DATUM = /^\d{4}-\d{2}-\d{2}$/;
const zeile = z.object({
  datum: z.string().regex(DATUM),
  imsak: z.string().regex(ZEIT_MUSTER),
  gunes: z.string().regex(ZEIT_MUSTER),
  ogle: z.string().regex(ZEIT_MUSTER),
  ikindi: z.string().regex(ZEIT_MUSTER),
  aksam: z.string().regex(ZEIT_MUSTER),
  yatsi: z.string().regex(ZEIT_MUSTER),
});

export type ImportFehler = {
  zeile: number;
  fehler: 'format' | 'reihenfolge' | 'doppelt' | 'luecke' | 'leer' | 'zuViele' | 'datum' | 'stadt';
};
export type ImportErgebnis =
  { ok: true; tage: GebetszeitTag[]; von: string; bis: string; ort?: string | null } | { ok: false; fehler: ImportFehler[] };

const MAX_ZEILEN = 800;

function istGueltigesDatum(datum: string): boolean {
  const [j, m, t] = datum.split('-').map(Number);
  const d = new Date(Date.UTC(j, m - 1, t));
  return d.getUTCFullYear() === j && d.getUTCMonth() === m - 1 && d.getUTCDate() === t;
}

function naechsterTag(datum: string): string {
  const [j, m, t] = datum.split('-').map(Number);
  return new Date(Date.UTC(j, m - 1, t + 1)).toISOString().slice(0, 10);
}

/** Gemeinsame Prüfung normalisierter Zeilen: Format, Datum, Dubletten, Reihenfolge, Lücken. */
function pruefeZeilen(zeilen: { nr: number; werte: unknown }[], quelle: Zeitquelle): ImportErgebnis {
  if (zeilen.length === 0) return { ok: false, fehler: [{ zeile: 0, fehler: 'leer' }] };
  if (zeilen.length > MAX_ZEILEN) return { ok: false, fehler: [{ zeile: 0, fehler: 'zuViele' }] };
  const fehler: ImportFehler[] = [];
  const tage: GebetszeitTag[] = [];
  const gesehen = new Set<string>();
  for (const { nr, werte } of zeilen) {
    const p = zeile.safeParse(werte);
    if (!p.success) {
      fehler.push({ zeile: nr, fehler: 'format' });
      continue;
    }
    if (!istGueltigesDatum(p.data.datum)) {
      fehler.push({ zeile: nr, fehler: 'datum' });
      continue;
    }
    if (gesehen.has(p.data.datum)) {
      fehler.push({ zeile: nr, fehler: 'doppelt' });
      continue;
    }
    gesehen.add(p.data.datum);
    if (!reihenfolgeOk(p.data)) {
      fehler.push({ zeile: nr, fehler: 'reihenfolge' });
      continue;
    }
    tage.push({ ...p.data, quelle });
  }
  if (fehler.length) return { ok: false, fehler };
  tage.sort((a, b) => a.datum.localeCompare(b.datum));
  for (let k = 1; k < tage.length; k++) {
    if (tage[k].datum !== naechsterTag(tage[k - 1].datum)) return { ok: false, fehler: [{ zeile: 0, fehler: 'luecke' }] };
  }
  return { ok: true, tage, von: tage[0].datum, bis: tage[tage.length - 1].datum };
}

/** Rohzeilen aus CSV oder JSON (Objekte mit Köpfen); bei einem Formatfehler der Fehler mit Zeilennummer. */
function rohzeilen(inhalt: string, art: 'csv' | 'json'): Record<string, unknown>[] | ImportFehler {
  if (art === 'csv') {
    const p = Papa.parse<Record<string, unknown>>(inhalt.trim(), {
      header: true,
      skipEmptyLines: true,
      delimitersToGuess: [',', ';', '\t'],
    });
    return p.data;
  }
  try {
    const daten = JSON.parse(inhalt) as unknown;
    if (!Array.isArray(daten)) return { zeile: 0, fehler: 'format' };
    // Zeilen, die kein Objekt sind ([null], [1]), sind Formatfehler – nicht Absturz (Tor B/C SP-C2 B5)
    const keinObjekt = daten.findIndex((z) => typeof z !== 'object' || z === null || Array.isArray(z));
    if (keinObjekt >= 0) return { zeile: keinObjekt + 2, fehler: 'format' };
    return daten as Record<string, unknown>[];
  } catch {
    return { zeile: 0, fehler: 'format' };
  }
}

/** Datei-Import (CSV oder JSON). `quelle` legt fest, als was die Tage gespeichert werden (Standard: Tabelle der Gemeinde). */
export function leseTabelle(inhalt: string, art: 'csv' | 'json', quelle: Zeitquelle = 'import'): ImportErgebnis {
  const roh = rohzeilen(inhalt, art);
  if (!Array.isArray(roh)) return { ok: false, fehler: [roh] };
  if (roh.length > MAX_ZEILEN) return { ok: false, fehler: [{ zeile: 0, fehler: 'zuViele' }] };
  // Kopfzeile = 1; unbekannte Spalten (Bemerkungen, Hidschri-Datum) bleiben außen vor
  return pruefeZeilen(
    roh.map((r, i) => ({ nr: i + 2, werte: normalisiereZeile(r).werte })),
    quelle,
  );
}

/**
 * Eingefügte Tabelle aus dem IGMG-Gebetskalender (Verwaltung „Tabelle einfügen“, ADR 0048): Zeilen mit Datum und sechs
 * Zeiten; Kopf und Ortsname sind optional. Ist `erwarteterOrt` gesetzt und nennt die Tabelle einen anderen Ort
 * (z. B. „Aachen (DE)“ statt „Wetzlar (DE)“), ist das ein Fehler `stadt` – nichts wird übernommen.
 */
export function leseEingefuegt(text: string, erwarteterOrt?: string): ImportErgebnis {
  const { ort, folge, zeilen } = zerlegeEingefuegt(text);
  if (ort && erwarteterOrt && buchstaben(ort) !== buchstaben(erwarteterOrt)) return { ok: false, fehler: [{ zeile: 0, fehler: 'stadt' }] };
  const ergebnis = pruefeZeilen(
    zeilen.map((z) => ({
      nr: z.zeile,
      werte:
        z.zeiten.length === GEBETE.length
          ? ({ datum: z.datum, ...Object.fromEntries(folge.map((g, i) => [g, z.zeiten[i]])) } as Tageszeiten & { datum: string })
          : null,
    })),
    'igmg',
  );
  return ergebnis.ok ? { ...ergebnis, ort } : ergebnis;
}
