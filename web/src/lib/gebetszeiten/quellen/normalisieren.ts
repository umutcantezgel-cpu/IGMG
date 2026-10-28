import Papa from 'papaparse';
import { uhrzeitBerlin } from '../naechstes';
import { GEBETE, ZEIT_MUSTER, type Gebet, type Tageszeiten } from '../typen';

/**
 * Normalisierung von Gebetszeit-Tabellen (ADR 0048): gemeinsam für den Datei-Import, die eingefügte Tabelle aus dem
 * IGMG-Gebetskalender und den offiziellen Feed. Reine Funktionen ohne Abhängigkeit vom Server.
 *
 * Kopfzeilen: Unicode-Zerlegung (NFKD), Diakritika weg, „ı“ → „i“, nur Buchstaben; danach die Alias-Tabelle. So werden
 * „İmsak“, „İkindi“, „Öğle“, „Güneş“, „Akşam“, „Yatsı“, „Tarih“ und die deutschen Köpfe („Morgen“, „S.aufgang“,
 * „N.mittag“ …) erkannt – auch kombiniert („Tarih/Datum“, „TarihDatum“, „İmsak Morgen“), wie die IGMG sie zweisprachig führt.
 */
export type Spalte = 'datum' | Gebet;

const ALIASE: Record<Spalte, readonly string[]> = {
  datum: ['datum', 'tarih', 'date'],
  imsak: ['imsak', 'morgen', 'fajr', 'fadschr', 'fecr'],
  gunes: ['gunes', 'saufgang', 'sonnenaufgang', 'aufgang', 'sunrise', 'shuruq'],
  ogle: ['ogle', 'mittag', 'dhuhr', 'zuhr', 'mittagsgebet'],
  ikindi: ['ikindi', 'nmittag', 'nachmittag', 'nachmittagsgebet', 'asr'],
  aksam: ['aksam', 'abend', 'abendgebet', 'maghrib'],
  yatsi: ['yatsi', 'nacht', 'nachtgebet', 'isha', 'ischa'],
};
const ALIAS_LISTE: { alias: string; spalte: Spalte }[] = (Object.entries(ALIASE) as [Spalte, readonly string[]][])
  .flatMap(([spalte, liste]) => liste.map((alias) => ({ alias, spalte })))
  // längere zuerst: „nachmittag“ vor „nacht“, „mittagsgebet“ vor „mittag“
  .sort((a, b) => b.alias.length - a.alias.length);

/** Nur Kleinbuchstaben a–z: NFKD, Diakritika entfernt, „ı“ → „i“. */
export function buchstaben(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .replace(/ı/g, 'i')
    .toLowerCase()
    .replace(/[^a-z]/g, '');
}

/**
 * Folge der Spalten in einem Kopftext („TarihDatum İmsakMorgen …“ oder „**Tarih****Datum****İmsak**…“): zerlegt die
 * Buchstabenfolge vollständig in Aliase und fasst gleiche Nachbarn zusammen. `null`, wenn sie sich nicht zerlegen lässt.
 */
export function spaltenFolge(text: string): Spalte[] | null {
  const s = buchstaben(text);
  if (!s) return null;
  // Zerlegung über alle Präfixe (kurze Kopftexte, höchstens einige hundert Zeichen)
  const weg: (Spalte[] | null)[] = Array(s.length + 1).fill(null);
  weg[0] = [];
  for (let i = 0; i < s.length; i++) {
    const bisher = weg[i];
    if (!bisher) continue;
    for (const { alias, spalte } of ALIAS_LISTE) {
      if (weg[i + alias.length] || !s.startsWith(alias, i)) continue;
      weg[i + alias.length] = bisher[bisher.length - 1] === spalte ? bisher : [...bisher, spalte];
    }
  }
  return weg[s.length];
}

/** Spalte eines einzelnen Kopfes oder `null` (unbekannt; im Import ein Formatfehler, im Feed übergangen). */
export function spalteAus(kopf: string): Spalte | null {
  const folge = spaltenFolge(kopf);
  return folge && folge.length === 1 ? folge[0] : null;
}

const DATUM_DE = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/;
const DATUM_ISO = /^(\d{4})-(\d{2})-(\d{2})(?:T.*)?$/;
const ZEIT = /^(\d{1,2})[:.](\d{2})(?::\d{2})?$/;
const ZEITPUNKT_MIT_VERSATZ = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})$/;

/** Datum „TT.MM.JJJJ“, „JJJJ-MM-TT“ oder ISO-Zeitpunkt → „JJJJ-MM-TT“; sonst unverändert (die Prüfung meldet es). */
export function normalisiereDatum(wert: string): string {
  const w = wert.trim();
  const de = DATUM_DE.exec(w);
  if (de) return `${de[3]}-${de[2].padStart(2, '0')}-${de[1].padStart(2, '0')}`;
  const iso = DATUM_ISO.exec(w);
  return iso ? `${iso[1]}-${iso[2]}-${iso[3]}` : w;
}

/**
 * Zeit „H:MM“, „HH.MM“ oder „HH:MM:SS“ → „HH:MM“. ISO-Zeitpunkte mit Versatz („…T05:18:00+01:00“, „…Z“) werden in die
 * Wanduhr Europe/Berlin umgerechnet (Feeds, die UTC liefern). Sonst unverändert.
 */
export function normalisiereZeit(wert: string): string {
  const w = wert.trim();
  if (ZEITPUNKT_MIT_VERSATZ.test(w)) {
    const d = new Date(w);
    return Number.isNaN(d.getTime()) ? w : uhrzeitBerlin(d);
  }
  const z = ZEIT.exec(w);
  return z ? `${z[1].padStart(2, '0')}:${z[2]}` : w;
}

/**
 * Eine Zeile mit beliebigen Köpfen → `{ datum, imsak … yatsi }` (Werte normalisiert). Unbekannte Köpfe landen unter
 * `unbekannt` (der Datei-Import meldet sie als Formatfehler).
 */
export function normalisiereZeile(roh: Record<string, unknown>): { werte: Partial<Record<Spalte, string>>; unbekannt: string[] } {
  const werte: Partial<Record<Spalte, string>> = {};
  const unbekannt: string[] = [];
  for (const [kopf, wert] of Object.entries(roh)) {
    const spalte = spalteAus(kopf);
    if (!spalte) {
      unbekannt.push(kopf);
      continue;
    }
    const text = String(wert ?? '').trim();
    werte[spalte] = spalte === 'datum' ? normalisiereDatum(text) : normalisiereZeit(text);
  }
  return { werte, unbekannt };
}

const minuten = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));

/**
 * Reihenfolge der sechs Zeiten: İmsak < Güneş < Öğle < İkindi < Akşam; Yatsı nach Akşam oder – im Hochsommer – nach
 * Mitternacht (dann vor İmsak des Tages, wie `bogen.ts` es darstellt).
 */
export function reihenfolgeOk(z: Tageszeiten): boolean {
  const folge = GEBETE.slice(0, 5).map((g) => minuten(z[g]));
  if (folge.some((v, k) => k > 0 && v <= folge[k - 1])) return false;
  const yatsi = minuten(z.yatsi);
  return yatsi > folge[4] || yatsi < folge[0];
}

/** Ort aus einer Überschrift wie „Aachen (DE)“ bzw. „Wetzlar (DE)“ (IGMG-Gebetskalender). */
const ORT_ZEILE = /^\s*#*\s*([^\d()]{2,60}?)\s*\(([A-Z]{2})\)\s*$/u;
const ZEILE_DATUM = /(\d{1,2})\.(\d{1,2})\.(\d{4})|(\d{4})-(\d{2})-(\d{2})/;
const ZEILE_ZEIT = /(\d{1,2})[:.](\d{2})/g;

export type EingefuegteZeile = { zeile: number; datum: string; zeiten: string[] };

/**
 * Tabelle, die ein Mensch aus dem IGMG-Gebetskalender kopiert und einfügt (Tabulatoren, Leerzeichen oder gar keine Trenner,
 * wie „01.10.2026 05:45 07:28 13:30 16:37 19:22 20:52“). Zeilen ohne Datum (Überschrift, Ortsname, Hinweise der Seite)
 * werden übergangen; ein erkannter Kopf legt die Spaltenfolge fest, sonst gilt die Folge des IGMG-Kalenders.
 */
export function zerlegeEingefuegt(text: string): { ort: string | null; folge: Gebet[]; zeilen: EingefuegteZeile[] } {
  let ort: string | null = null;
  let folge: Gebet[] | null = null;
  const zeilen: EingefuegteZeile[] = [];
  text.split(/\r?\n/).forEach((roh, i) => {
    const z = roh.replace(/\*/g, '').trim();
    if (!z) return;
    const d = ZEILE_DATUM.exec(z);
    if (!d) {
      const o = ORT_ZEILE.exec(z);
      if (o && !ort) ort = o[1].trim();
      const kopf = spaltenFolge(z);
      if (!folge && kopf && kopf[0] === 'datum' && kopf.length === 7) folge = kopf.slice(1) as Gebet[];
      return;
    }
    const datum = d[1] ? `${d[3]}-${d[2].padStart(2, '0')}-${d[1].padStart(2, '0')}` : `${d[4]}-${d[5]}-${d[6]}`;
    const rest = z.slice(d.index + d[0].length);
    const zeiten = [...rest.matchAll(ZEILE_ZEIT)].map((m) => `${m[1].padStart(2, '0')}:${m[2]}`);
    zeilen.push({ zeile: i + 1, datum, zeiten });
  });
  return { ort, folge: folge ?? [...GEBETE], zeilen };
}

const DATUM_FERTIG = /^\d{4}-\d{2}-\d{2}$/;
/** Listen in einem JSON-Objekt, die Tage enthalten können (Formate offizieller Feeds sind noch nicht festgelegt). */
const LISTEN = ['tage', 'days', 'data', 'zeiten', 'vakitler', 'items'];
const STAND = ['stand', 'aktualisiert', 'updated', 'updatedAt', 'stand_am'];
const ORT_ID = ['stadtId', 'stadt_id', 'cityId', 'city_id', 'id'];
const ORT_NAME = ['stadt', 'ort', 'city', 'name'];

export type NormalisierteLieferung =
  | { ok: true; tage: (Tageszeiten & { datum: string })[]; stand: string | null; ort: { id: string | null; name: string | null } }
  | { ok: false; fehler: 'format' | 'leer' };

const ersterText = (o: Record<string, unknown>, schluessel: readonly string[]) => {
  for (const s of schluessel) {
    const w = o[s];
    if ((typeof w === 'string' && w.trim()) || typeof w === 'number') return String(w).trim().slice(0, 120);
  }
  return null;
};

/**
 * Lieferung des offiziellen Zugangs (ADR 0048) → Tage. JSON: Liste von Tagen oder Objekt mit einer Liste (`tage`, `days`,
 * `data` …) und optional Stand und Ort; CSV mit den Köpfen des IGMG-Kalenders. Jede Zeile braucht Datum und alle sechs
 * Zeiten, sonst ist die ganze Lieferung ein Formatfehler (Plausibilität prüft danach `pruefung.ts`).
 */
export function lieferungAus(text: string, art: 'json' | 'csv'): NormalisierteLieferung {
  let zeilen: unknown[];
  let kopf: Record<string, unknown> = {};
  if (art === 'json') {
    let daten: unknown;
    try {
      daten = JSON.parse(text);
    } catch {
      return { ok: false, fehler: 'format' };
    }
    if (Array.isArray(daten)) zeilen = daten;
    else if (daten && typeof daten === 'object') {
      kopf = daten as Record<string, unknown>;
      const liste = LISTEN.map((s) => kopf[s]).find(Array.isArray);
      if (!liste) return { ok: false, fehler: 'format' };
      zeilen = liste;
    } else return { ok: false, fehler: 'format' };
  } else {
    zeilen = Papa.parse<Record<string, unknown>>(text.trim(), {
      header: true,
      skipEmptyLines: true,
      delimitersToGuess: [',', ';', '\t'],
    }).data;
  }
  if (zeilen.length === 0) return { ok: false, fehler: 'leer' };
  const tage: (Tageszeiten & { datum: string })[] = [];
  for (const z of zeilen) {
    if (!z || typeof z !== 'object' || Array.isArray(z)) return { ok: false, fehler: 'format' };
    const { werte } = normalisiereZeile(z as Record<string, unknown>);
    if (!werte.datum || !DATUM_FERTIG.test(werte.datum) || GEBETE.some((g) => !ZEIT_MUSTER.test(werte[g] ?? '')))
      return { ok: false, fehler: 'format' };
    tage.push(werte as Tageszeiten & { datum: string });
  }
  return { ok: true, tage, stand: ersterText(kopf, STAND), ort: { id: ersterText(kopf, ORT_ID), name: ersterText(kopf, ORT_NAME) } };
}
