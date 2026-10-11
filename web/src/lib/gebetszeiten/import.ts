import Papa from 'papaparse';
import { z } from 'zod';
import { GEBETE, ZEIT_MUSTER, type GebetszeitTag } from './typen';

/**
 * Tabellen-Import (K-08, ADR 0008): CSV (Trenner , oder ;) oder JSON mit Spalten
 * datum, imsak, gunes, ogle, ikindi, aksam, yatsi. Prüft Format, Reihenfolge und lückenlose Tage.
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

export type ImportFehler = { zeile: number; fehler: 'format' | 'reihenfolge' | 'doppelt' | 'luecke' | 'leer' | 'zuViele' | 'datum' };
export type ImportErgebnis = { ok: true; tage: GebetszeitTag[]; von: string; bis: string } | { ok: false; fehler: ImportFehler[] };

const MAX_ZEILEN = 800;

/** Normalisiert Zeiten wie „5:07“ oder „05.07“ zu „05:07“; Datum „31.12.2026“ zu „2026-12-31“. */
function normalisiere(roh: Record<string, unknown>): Record<string, string> {
  const aus: Record<string, string> = {};
  for (const [k, v] of Object.entries(roh)) {
    const schluessel = k.trim().toLowerCase().replace('ö', 'o').replace('ü', 'u').replace('ş', 's').replace('ğ', 'g').replace('ı', 'i');
    let wert = String(v ?? '').trim();
    if (schluessel === 'datum' && /^\d{1,2}\.\d{1,2}\.\d{4}$/.test(wert)) {
      const [t, m, j] = wert.split('.');
      wert = `${j}-${m.padStart(2, '0')}-${t.padStart(2, '0')}`;
    } else if (/^\d{1,2}[:.]\d{2}$/.test(wert)) {
      const [h, min] = wert.split(/[:.]/);
      wert = `${h.padStart(2, '0')}:${min}`;
    }
    aus[schluessel] = wert;
  }
  return aus;
}

function istGueltigesDatum(datum: string): boolean {
  const [j, m, t] = datum.split('-').map(Number);
  const d = new Date(Date.UTC(j, m - 1, t));
  return d.getUTCFullYear() === j && d.getUTCMonth() === m - 1 && d.getUTCDate() === t;
}

function naechsterTag(datum: string): string {
  const [j, m, t] = datum.split('-').map(Number);
  return new Date(Date.UTC(j, m - 1, t + 1)).toISOString().slice(0, 10);
}

export function leseTabelle(inhalt: string, art: 'csv' | 'json'): ImportErgebnis {
  let roh: Record<string, unknown>[];
  if (art === 'json') {
    try {
      const daten = JSON.parse(inhalt) as unknown;
      if (!Array.isArray(daten)) return { ok: false, fehler: [{ zeile: 0, fehler: 'format' }] };
      // Zeilen, die kein Objekt sind ([null], [1]), sind Formatfehler – nicht Absturz (Tor B/C SP-C2 B5)
      const keinObjekt = daten.findIndex((z) => typeof z !== 'object' || z === null || Array.isArray(z));
      if (keinObjekt >= 0) return { ok: false, fehler: [{ zeile: keinObjekt + 2, fehler: 'format' }] };
      roh = daten as Record<string, unknown>[];
    } catch {
      return { ok: false, fehler: [{ zeile: 0, fehler: 'format' }] };
    }
  } else {
    const p = Papa.parse<Record<string, unknown>>(inhalt.trim(), {
      header: true,
      skipEmptyLines: true,
      delimitersToGuess: [',', ';', '\t'],
    });
    roh = p.data;
  }
  if (roh.length === 0) return { ok: false, fehler: [{ zeile: 0, fehler: 'leer' }] };
  if (roh.length > MAX_ZEILEN) return { ok: false, fehler: [{ zeile: 0, fehler: 'zuViele' }] };

  const fehler: ImportFehler[] = [];
  const tage: GebetszeitTag[] = [];
  const gesehen = new Set<string>();
  roh.forEach((r, i) => {
    const nr = i + 2; // Kopfzeile = 1
    const p = zeile.safeParse(normalisiere(r));
    if (!p.success) return void fehler.push({ zeile: nr, fehler: 'format' });
    if (!istGueltigesDatum(p.data.datum)) return void fehler.push({ zeile: nr, fehler: 'datum' });
    if (gesehen.has(p.data.datum)) return void fehler.push({ zeile: nr, fehler: 'doppelt' });
    gesehen.add(p.data.datum);
    const folge = GEBETE.map((g) => p.data[g]);
    if (folge.some((v, k) => k > 0 && v <= folge[k - 1])) return void fehler.push({ zeile: nr, fehler: 'reihenfolge' });
    tage.push({ ...p.data, quelle: 'import' });
  });
  if (fehler.length) return { ok: false, fehler };
  tage.sort((a, b) => a.datum.localeCompare(b.datum));
  for (let k = 1; k < tage.length; k++) {
    if (tage[k].datum !== naechsterTag(tage[k - 1].datum)) fehler.push({ zeile: 0, fehler: 'luecke' });
  }
  if (fehler.length) return { ok: false, fehler: fehler.slice(0, 1) };
  return { ok: true, tage, von: tage[0].datum, bis: tage[tage.length - 1].datum };
}
