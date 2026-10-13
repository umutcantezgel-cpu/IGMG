import { z } from 'zod';

/**
 * Import lizenzierter Rezitationen (H-Q06, ADR 0029, MN-03b): Manifest und quran-align-Zeiten, reine Prüfung ohne
 * Datei- und Datenbankzugriff (`scripts/rezitation-import.ts` liest die Dateien). Fehlertexte sind deutsche Sätze für
 * die Kommandozeile.
 *
 * Manifest (JSON, Format 1) – alle Pfade relativ zum Manifest, jede Datei mit SHA-256 (hex):
 * {
 *   "format": 1,
 *   "rezitation": "kennung-2026",                          // [a-z0-9-], 2–40 Zeichen
 *   "name": { "de": "…", "tr": "…", "en": "…" },            // Deutsch Pflicht
 *   "rezitator": "[Name]", "lizenz": "[Kurzangabe für die Quellenzeile]",
 *   "lizenzdatei": { "datei": "LIZENZ.pdf", "sha256": "…" },  // Pflicht
 *   "dateien": [
 *     { "sure": 1, "vers": 1, "datei": "001001.mp3", "sha256": "…", "dauerMs": 6120 },  // je Vers (dauerMs optional)
 *     { "sure": 112, "datei": "112.m4a", "sha256": "…" }                                  // je Sure (vers fehlt oder 0)
 *   ],
 *   "verszeiten": [[112, 1, 0, 3200], …],                   // optional, nur für Dateien je Sure: [Sure, Vers, Start, Ende] ms
 *   "quranAlign": { "datei": "quran-align.json", "sha256": "…" }  // optional
 * }
 *
 * quran-align (cpfair/quran-align, Ausgabe je Vers-Datei): JSON-Liste mit
 *   { "surah": 1, "ayah": 1, "segments": [[w0, w1, startMs, endeMs], …], "stats": {…} }
 * `w0` ist der Index des ersten Wortes (ab 0), `w1` der Index nach dem letzten Wort; Zeiten in ms ab Beginn der
 * Vers-Datei. Wörter zählen wie `quran_wort` (Leerzeichen-Trennung des Tanzil-Texts ohne Pausenzeichen): Wort `w`
 * entspricht Position `w + 1`. Umfasst ein Segment mehrere Wörter, wird seine Zeit gleichmäßig geteilt.
 */
export const MANIFEST_FORMAT = 1;

const sha = z.string().regex(/^[0-9a-f]{64}$/, 'sha256');
const relativ = z
  .string()
  .min(1)
  .max(200)
  .refine((p) => !p.startsWith('/') && !p.includes('\\') && !p.split('/').includes('..'), 'pfad');
const datei = z.object({ datei: relativ, sha256: sha });

const manifestSchema = z.object({
  format: z.literal(MANIFEST_FORMAT),
  rezitation: z.string().regex(/^[a-z0-9-]{2,40}$/, 'kennung'),
  name: z.object({ de: z.string().trim().min(2).max(120), tr: z.string().trim().max(120).optional(), en: z.string().trim().max(120).optional() }),
  rezitator: z.string().trim().min(2).max(120),
  lizenz: z.string().trim().min(2).max(300),
  lizenzdatei: datei,
  dateien: z
    .array(
      z.object({
        sure: z.number().int().min(1).max(114),
        vers: z.number().int().min(0).max(286).default(0),
        datei: relativ,
        sha256: sha,
        dauerMs: z.number().int().positive().max(4 * 3_600_000).optional(),
      }),
    )
    .min(1),
  verszeiten: z
    .array(z.tuple([z.number().int().min(1).max(114), z.number().int().min(1).max(286), z.number().int().min(0), z.number().int().min(1)]))
    .optional(),
  quranAlign: datei.optional(),
});

export type Manifest = z.infer<typeof manifestSchema>;

const FELD: Record<string, string> = {
  sha256: 'muss eine SHA-256 (64 Hexzeichen, klein) sein',
  pfad: 'muss ein relativer Pfad ohne „..“ sein',
  kennung: 'nur a–z, 0–9 und Bindestrich, 2–40 Zeichen',
};

/** Prüft ein eingelesenes Manifest (JSON). Ergebnis: geprüftes Manifest oder die Liste aller Fehler. */
export function pruefeManifest(roh: unknown): { ok: true; manifest: Manifest } | { ok: false; fehler: string[] } {
  const p = manifestSchema.safeParse(roh);
  if (!p.success)
    return {
      ok: false,
      fehler: p.error.issues.map((i) => `${i.path.join('.') || 'manifest'}: ${FELD[i.message] ?? i.message}`),
    };
  const m = p.data;
  const fehler: string[] = [];
  const gesehen = new Set<string>();
  const jeSure = new Map<number, { sure: boolean; verse: boolean }>();
  for (const d of m.dateien) {
    const schluessel = `${d.sure}:${d.vers}`;
    if (gesehen.has(schluessel)) fehler.push(`dateien: Sure ${d.sure}, Vers ${d.vers} doppelt`);
    gesehen.add(schluessel);
    const art = jeSure.get(d.sure) ?? { sure: false, verse: false };
    if (d.vers === 0) art.sure = true;
    else art.verse = true;
    jeSure.set(d.sure, art);
  }
  for (const [sure, art] of jeSure)
    if (art.sure && art.verse) fehler.push(`dateien: Sure ${sure} mischt eine Datei je Sure mit Dateien je Vers`);
  const zeitSchluessel = new Set<string>();
  for (const [sure, vers, start, ende] of m.verszeiten ?? []) {
    if (!jeSure.get(sure)?.sure) fehler.push(`verszeiten: Sure ${sure} hat keine Datei je Sure`);
    if (ende <= start) fehler.push(`verszeiten: Sure ${sure}, Vers ${vers} endet nicht nach dem Start`);
    if (zeitSchluessel.has(`${sure}:${vers}`)) fehler.push(`verszeiten: Sure ${sure}, Vers ${vers} doppelt`);
    zeitSchluessel.add(`${sure}:${vers}`);
  }
  return fehler.length ? { ok: false, fehler } : { ok: true, manifest: m };
}

export type ImportWortzeit = { sure: number; vers: number; pos: number; startMs: number; endeMs: number };

const alignSchema = z.array(
  z.object({
    surah: z.number().int().min(1).max(114),
    ayah: z.number().int().min(1).max(286),
    segments: z.array(z.tuple([z.number().int().min(0), z.number().int().min(1), z.number().min(0), z.number().min(0)], z.unknown())),
  }),
);

/**
 * Wortzeiten aus quran-align: nur Verse, deren Wörter (`woerter(sure, vers)` = Anzahl laut `quran_wort`) vollständig und
 * aufsteigend abgedeckt sind; alle anderen Verse stehen mit Grund in `fehler` und werden nicht übernommen.
 */
export function leseQuranAlign(
  roh: unknown,
  woerter: (sure: number, vers: number) => number | undefined,
): { zeiten: ImportWortzeit[]; fehler: string[] } {
  const p = alignSchema.safeParse(roh);
  if (!p.success) return { zeiten: [], fehler: [`quran-align: unbekanntes Format (${p.error.issues[0]?.path.join('.') ?? '?'})`] };
  const zeiten: ImportWortzeit[] = [];
  const fehler: string[] = [];
  for (const eintrag of p.data) {
    const stelle = `quran-align ${eintrag.surah}:${eintrag.ayah}`;
    const anzahl = woerter(eintrag.surah, eintrag.ayah);
    if (!anzahl) {
      fehler.push(`${stelle}: Vers unbekannt`);
      continue;
    }
    const start = new Array<number | undefined>(anzahl);
    const ende = new Array<number | undefined>(anzahl);
    let gueltig = true;
    for (const [w0, w1, a, b] of eintrag.segments) {
      if (w1 <= w0 || w1 > anzahl || b < a) {
        gueltig = false;
        break;
      }
      const teil = (b - a) / (w1 - w0);
      for (let w = w0; w < w1; w++) {
        start[w] = Math.round(a + (w - w0) * teil);
        ende[w] = Math.round(a + (w - w0 + 1) * teil);
      }
    }
    if (!gueltig) {
      fehler.push(`${stelle}: Segment außerhalb der ${anzahl} Wörter`);
      continue;
    }
    const fehlt = start.findIndex((s) => s === undefined);
    if (fehlt >= 0) {
      fehler.push(`${stelle}: Wort ${fehlt + 1} ohne Zeit`);
      continue;
    }
    let steigend = true;
    for (let w = 1; w < anzahl; w++) if ((start[w] as number) < (start[w - 1] as number)) steigend = false;
    if (!steigend) {
      fehler.push(`${stelle}: Zeiten nicht aufsteigend`);
      continue;
    }
    for (let w = 0; w < anzahl; w++)
      zeiten.push({ sure: eintrag.surah, vers: eintrag.ayah, pos: w + 1, startMs: start[w] as number, endeMs: ende[w] as number });
  }
  return { zeiten, fehler };
}
