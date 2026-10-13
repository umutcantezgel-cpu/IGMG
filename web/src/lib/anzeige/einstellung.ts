import { z } from 'zod';
import type { AnzeigeEinstellungen } from './plan';

/**
 * Einstellung der Bildschirm-Anzeige (AUFTRAG 3.10, MN-14): Iqama-Abstand je Gebet, Ruhephase und Freitagsmodus.
 * Gespeichert in `einstellung` unter dem Schlüssel `anzeige`. Bis der Imam die Iqama- und Freitagszeiten nennt (MN-14),
 * bleiben die Iqama-Felder leer – die Anzeige zeigt dann keine Iqama und ruht 20 Minuten ab dem Ezan.
 * Reine Funktionen ohne Datenbank (Unit-Test `anzeige-folien.test.ts`).
 */
export const ANZEIGE_EINSTELLUNG = 'anzeige';

/** Gebete mit Ezan im Gebetsraum (Güneş ist kein Gebet). */
export const IQAMA_GEBETE = ['imsak', 'ogle', 'ikindi', 'aksam', 'yatsi'] as const;
export type IqamaGebet = (typeof IQAMA_GEBETE)[number];

export const anzeigeEinstellungSchema = z.object({
  iqama: z.partialRecord(z.enum(IQAMA_GEBETE), z.number().int().min(0).max(60)).default({}),
  /** Ruhe nach der Iqama (B-25: Ezan → Iqama + 15 Minuten). */
  ruheNachIqamaMin: z.number().int().min(5).max(30).default(15),
  /** Ruhe ab dem Ezan, solange keine Iqama-Zeit bekannt ist. */
  ruheOhneIqamaMin: z.number().int().min(5).max(45).default(20),
  freitag: z
    .object({
      aktiv: z.boolean().default(true),
      vorMin: z.number().int().min(0).max(120).default(45),
      nachMin: z.number().int().min(0).max(120).default(60),
    })
    .default({ aktiv: true, vorMin: 45, nachMin: 60 }),
  folienDauerSek: z.number().int().min(5).max(60).default(12),
});

/** Gespeicherten Wert lesen; ungültig oder fehlend → Standard (nie ein Absturz der Anzeige). */
export function leseAnzeigeEinstellung(wert: unknown): AnzeigeEinstellungen {
  const p = anzeigeEinstellungSchema.safeParse(wert ?? {});
  return p.success ? p.data : anzeigeEinstellungSchema.parse({});
}

/** Feldnamen des Formulars (Verwaltung › Anzeige › Einstellungen). */
export const EINSTELLUNG_FELDER = [
  ...IQAMA_GEBETE.map((g) => `iqama_${g}` as const),
  'ruheNachIqamaMin',
  'ruheOhneIqamaMin',
  'freitagAktiv',
  'freitagVorMin',
  'freitagNachMin',
  'folienDauerSek',
] as const;

const ZAHL = /^\d{1,3}$/;

/**
 * Formular → Einstellung. Leere Iqama-Felder bedeuten „keine Iqama-Anzeige“ (MN-14). Fehler je Feld als Schlüssel
 * unter `verwaltung.anzeige.fehler` (`zahl`, `bereich`).
 */
export function anzeigeEinstellungAusFormular(
  roh: Record<string, string>,
): { ok: true; wert: AnzeigeEinstellungen } | { ok: false; feldFehler: Record<string, string> } {
  const fehler: Record<string, string> = {};
  const zahl = (feld: string, min: number, max: number, leerErlaubt: boolean): number | undefined => {
    const w = (roh[feld] ?? '').trim();
    if (!w) {
      if (!leerErlaubt) fehler[feld] = 'zahl';
      return undefined;
    }
    if (!ZAHL.test(w)) {
      fehler[feld] = 'zahl';
      return undefined;
    }
    const n = Number(w);
    if (n < min || n > max) fehler[feld] = 'bereich';
    return n;
  };
  const iqama: Partial<Record<IqamaGebet, number>> = {};
  for (const g of IQAMA_GEBETE) {
    const n = zahl(`iqama_${g}`, 0, 60, true);
    if (n !== undefined) iqama[g] = n;
  }
  const wert = {
    iqama,
    ruheNachIqamaMin: zahl('ruheNachIqamaMin', 5, 30, false),
    ruheOhneIqamaMin: zahl('ruheOhneIqamaMin', 5, 45, false),
    freitag: {
      aktiv: roh.freitagAktiv === 'on' || roh.freitagAktiv === '1',
      vorMin: zahl('freitagVorMin', 0, 120, false),
      nachMin: zahl('freitagNachMin', 0, 120, false),
    },
    folienDauerSek: zahl('folienDauerSek', 5, 60, false),
  };
  if (Object.keys(fehler).length) return { ok: false, feldFehler: fehler };
  return { ok: true, wert: anzeigeEinstellungSchema.parse(wert) };
}

/** Einstellung → Startwerte des Formulars. */
export function anzeigeEinstellungWerte(e: AnzeigeEinstellungen): Record<string, string> {
  const werte: Record<string, string> = {
    ruheNachIqamaMin: String(e.ruheNachIqamaMin),
    ruheOhneIqamaMin: String(e.ruheOhneIqamaMin),
    freitagAktiv: e.freitag.aktiv ? 'on' : '',
    freitagVorMin: String(e.freitag.vorMin),
    freitagNachMin: String(e.freitag.nachMin),
    folienDauerSek: String(e.folienDauerSek),
  };
  for (const g of IQAMA_GEBETE) werte[`iqama_${g}`] = e.iqama[g] === undefined ? '' : String(e.iqama[g]);
  return werte;
}
