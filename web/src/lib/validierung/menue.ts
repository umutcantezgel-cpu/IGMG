import { z } from 'zod';
import { istGueltigesZiel } from '@/lib/cms/ziele';
import { mehr, mehrOptional } from './bloecke';

/**
 * Menüs der Website aus der Verwaltung (ADR 0032): Kopfmenü mit Gruppen (je Gruppe ein Aufklapp-Menü mit Einträgen)
 * und Fußmenü als flache Liste („Schnellzugriff“). Ohne gespeichertes Menü gilt der Bestand aus
 * `components/website/navigation.ts`. Ein Schema für Editor und Server Action; Fehler als Schlüssel unter
 * `verwaltung.menues.fehler`.
 */
export const MENUE_SCHLUESSEL = ['kopf', 'fuss'] as const;
export type MenueSchluessel = (typeof MENUE_SCHLUESSEL)[number];

const ziel = z.string('zielUngueltig').trim().max(300, 'zielUngueltig').refine(istGueltigesZiel, 'zielUngueltig');

export const menuePunkt = z.object({ titel: mehr(60), beschreibung: mehrOptional(160), ziel });
export const menueGruppe = z.object({ titel: mehr(40), kinder: z.array(menuePunkt).min(1, 'gruppeLeer').max(12, 'zuViele') });

export const kopfMenue = z.array(menueGruppe).min(1, 'menueLeer').max(6, 'zuViele');
export const fussMenue = z.array(menuePunkt).min(1, 'menueLeer').max(12, 'zuViele');

export type MenuePunktDaten = z.output<typeof menuePunkt>;
export type MenueGruppeDaten = z.output<typeof menueGruppe>;

export type MenuePruefung =
  | { ok: true; schluessel: 'kopf'; eintraege: MenueGruppeDaten[] }
  | { ok: true; schluessel: 'fuss'; eintraege: MenuePunktDaten[] }
  | { ok: false; feldFehler: Record<string, string> };

/** Pfad der Zod-Fehler als Schlüssel („0.kinder.2.titel.de“). */
function fehlerKarte(issues: z.ZodError['issues']): Record<string, string> {
  const aus: Record<string, string> = {};
  for (const f of issues) {
    const k = f.path.length ? f.path.join('.') : 'eintraege';
    aus[k] ??= /^[a-zA-Z]+$/.test(f.message) && f.message.length < 30 ? f.message : 'ungueltig';
  }
  return aus;
}

/** Prüft das Menü aus dem verborgenen JSON-Feld `eintraege`. */
export function pruefeMenue(schluessel: unknown, roh: unknown): MenuePruefung {
  let daten: unknown;
  try {
    daten = typeof roh === 'string' ? (JSON.parse(roh) as unknown) : undefined;
  } catch {
    daten = undefined;
  }
  if (daten === undefined || (typeof roh === 'string' && roh.length > 200_000)) return { ok: false, feldFehler: { eintraege: 'ungueltig' } };
  if (schluessel === 'kopf') {
    const p = kopfMenue.safeParse(daten);
    return p.success ? { ok: true, schluessel, eintraege: p.data } : { ok: false, feldFehler: fehlerKarte(p.error.issues) };
  }
  if (schluessel === 'fuss') {
    const p = fussMenue.safeParse(daten);
    return p.success ? { ok: true, schluessel, eintraege: p.data } : { ok: false, feldFehler: fehlerKarte(p.error.issues) };
  }
  return { ok: false, feldFehler: { schluessel: 'ungueltig' } };
}

/** Ziele aller Einträge (Prüfung: freie Seiten existieren). */
export function zieleAus(eintraege: readonly (MenueGruppeDaten | MenuePunktDaten)[]): string[] {
  return eintraege.flatMap((e) => ('kinder' in e ? e.kinder.map((k) => k.ziel) : [e.ziel]));
}
