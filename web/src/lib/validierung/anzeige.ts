import { TZDate } from '@date-fns/tz';
import { z } from 'zod';
import { FOLIEN_ARTEN, leseStelle, type FolienArt, type FolienInhalt } from '@/lib/anzeige/folien';
import type { Mehrsprachig } from '@/lib/db/schema/typen';
import { BUKHARI } from '@/lib/hadith/anzeige';
import { bereinige } from '@/lib/i18n/inhalt';
import { ZEITZONE } from '@/lib/termine';

/**
 * Formular „Folie“ der Verwaltung › Anzeige (AUFTRAG 3.10). Ein Schema für Client und Server Action; Fehler sind
 * Schlüssel unter `verwaltung.anzeige.fehler`. Text- und Bildfolien tragen mehrsprachige Texte (Deutsch Pflicht),
 * Vers- und Hadith-Folien nur einen Verweis (Stelle bzw. Nummer) – den Inhalt liefert die Datenbank.
 * Zeitplan: von/bis als Wanduhrzeit Europe/Berlin (`datetime-local`), Wochentage 0 = Sonntag; leer = immer.
 */
const LOKAL = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;
const frei = (max: number) => z.string().trim().max(max, 'zuLang').default('');
const mehrzeilig = (max: number) =>
  z
    .string()
    .max(max, 'zuLang')
    .default('')
    .transform((s) => s.replace(/\r\n?/g, '\n').trim());

/** Wanduhrzeit Europe/Berlin („2026-10-13T18:00“) → Zeitpunkt; ungültig → null. */
export function ausLokal(roh: string): Date | null {
  const m = LOKAL.exec(roh);
  if (!m) return null;
  const [j, mo, t, h, mi] = m.slice(1).map(Number);
  if (mo < 1 || mo > 12 || t < 1 || t > 31 || h > 23 || mi > 59) return null;
  const probe = new Date(Date.UTC(j, mo - 1, t));
  if (probe.getUTCMonth() !== mo - 1) return null;
  return new Date(new TZDate(j, mo - 1, t, h, mi, 0, ZEITZONE).getTime());
}

/** Zeitpunkt → Wanduhrzeit Europe/Berlin für `datetime-local`. */
export function alsLokal(d: Date | null): string {
  if (!d) return '';
  const z = new TZDate(d.getTime(), ZEITZONE);
  const zwei = (n: number) => String(n).padStart(2, '0');
  return `${z.getFullYear()}-${zwei(z.getMonth() + 1)}-${zwei(z.getDate())}T${zwei(z.getHours())}:${zwei(z.getMinutes())}`;
}

export const folienSchema = z
  .object({
    art: z.enum(FOLIEN_ARTEN, 'art'),
    titelDe: frei(80),
    titelTr: frei(80),
    titelEn: frei(80),
    textDe: mehrzeilig(400),
    textTr: mehrzeilig(400),
    textEn: mehrzeilig(400),
    bildId: z.string().trim().max(40).default(''),
    stelle: frei(20),
    nummer: frei(12),
    von: z.string().trim().max(20).default(''),
    bis: z.string().trim().max(20).default(''),
    wochentage: z
      .array(z.enum(['0', '1', '2', '3', '4', '5', '6'], 'ungueltig'))
      .max(7)
      .default([]),
  })
  .superRefine((w, ctx) => {
    const fehler = (path: string, message: string) => ctx.addIssue({ code: 'custom', path: [path], message });
    if (w.art === 'text') {
      if (!w.titelDe) fehler('titelDe', 'pflicht');
      if (!w.textDe && (w.textTr || w.textEn)) fehler('textDe', 'deFehlt');
    }
    if (w.art === 'text' || w.art === 'bild') {
      if (!w.titelDe && (w.titelTr || w.titelEn)) fehler('titelDe', 'deFehlt');
    }
    if (w.art === 'bild' && !/^[0-9a-f-]{36}$/i.test(w.bildId)) fehler('bildId', 'bildFehlt');
    if (w.art === 'vers' && !leseStelle(w.stelle)) fehler('stelle', 'stelle');
    if (w.art === 'hadith' && !/^\d{1,5}(\.\d{1,2})?$/.test(w.nummer)) fehler('nummer', 'nummer');
    const von = w.von ? ausLokal(w.von) : null;
    const bis = w.bis ? ausLokal(w.bis) : null;
    if (w.von && !von) fehler('von', 'zeitpunkt');
    if (w.bis && !bis) fehler('bis', 'zeitpunkt');
    if (von && bis && bis.getTime() <= von.getTime()) fehler('bis', 'bisVorVon');
  });
export type FolienEingabe = z.infer<typeof folienSchema>;

/** Einfache Feldnamen des Formulars (Wochentage kommen als Mehrfachfeld). */
export const FOLIEN_FELDER = [
  'art',
  'titelDe',
  'titelTr',
  'titelEn',
  'textDe',
  'textTr',
  'textEn',
  'bildId',
  'stelle',
  'nummer',
  'von',
  'bis',
] as const;

/** FormData → Rohobjekt (Wochentage als Liste). */
export function folienRoh(fd: FormData): Record<string, string | string[]> {
  const roh: Record<string, string | string[]> = Object.fromEntries(FOLIEN_FELDER.map((f) => [f, String(fd.get(f) ?? '')]));
  roh.wochentage = fd.getAll('wochentage').map(String);
  return roh;
}

const mehr = (de: string, tr: string, en: string): Mehrsprachig | null => (de ? bereinige({ de, tr, en }) : null);

/** Geprüfte Eingabe → Spalten der Tabelle `anzeige_folie` (ohne Status, Freigabe und Reihenfolge). */
export function folienDatensatz(e: FolienEingabe): {
  art: FolienArt;
  inhalt: FolienInhalt;
  mediumId: string | null;
  von: Date | null;
  bis: Date | null;
  wochentage: number[];
} {
  const zeit = {
    von: e.von ? ausLokal(e.von) : null,
    bis: e.bis ? ausLokal(e.bis) : null,
    wochentage: [...new Set(e.wochentage.map(Number))].sort((a, b) => a - b),
  };
  switch (e.art) {
    case 'text':
      return {
        art: 'text',
        inhalt: { art: 'text', titel: mehr(e.titelDe, e.titelTr, e.titelEn)!, text: mehr(e.textDe, e.textTr, e.textEn) },
        mediumId: null,
        ...zeit,
      };
    case 'bild':
      return { art: 'bild', inhalt: { art: 'bild', titel: mehr(e.titelDe, e.titelTr, e.titelEn) }, mediumId: e.bildId, ...zeit };
    case 'vers': {
      const s = leseStelle(e.stelle)!;
      return { art: 'vers', inhalt: { art: 'vers', ...s }, mediumId: null, ...zeit };
    }
    case 'hadith':
      return { art: 'hadith', inhalt: { art: 'hadith', sammlungId: BUKHARI, nummer: e.nummer }, mediumId: null, ...zeit };
  }
}

/** Gespeicherte Folie → Startwerte des Formulars. */
export function folienWerte(f: {
  art: string;
  inhalt: unknown;
  mediumId: string | null;
  von: Date | null;
  bis: Date | null;
  wochentage: number[];
}): Record<string, string | string[]> {
  const i = (f.inhalt ?? {}) as Partial<{
    titel: Mehrsprachig | null;
    text: Mehrsprachig | null;
    sure: number;
    von: number;
    bis: number;
    nummer: string;
  }>;
  return {
    art: f.art,
    titelDe: i.titel?.de ?? '',
    titelTr: i.titel?.tr ?? '',
    titelEn: i.titel?.en ?? '',
    textDe: i.text?.de ?? '',
    textTr: i.text?.tr ?? '',
    textEn: i.text?.en ?? '',
    bildId: f.mediumId ?? '',
    stelle: i.sure ? (i.von === i.bis ? `${i.sure}:${i.von}` : `${i.sure}:${i.von}-${i.bis}`) : '',
    nummer: i.nummer ?? '',
    von: alsLokal(f.von),
    bis: alsLokal(f.bis),
    wochentage: f.wochentage.map(String),
  };
}
