import { SPRACHEN } from '../kurse';
import * as z from '../z';
import type { Ableitung } from '../ereignisse/ableiten';
import { EreignisSchema } from '../ereignisse/typen';
import { leiteNeuAb } from './ableitung';
import { ereignisse, uebernimm } from './ausgang';
import type { Profil, Speicher } from './db';
import { legeProfilAn } from './profile';

/**
 * Export und Import als JSON-Datei (ADR 0038 Nr. 8): Sicherung ohne Konto, Gerätewechsel und Datenübertragbarkeit nach
 * Art. 20 DSGVO. Die Datei enthält das Profil (Name, Sprachen) und das vollständige Ereignisprotokoll – alle abgeleiteten
 * Stände entstehen beim Import neu. Keine Konto-Kennung. Beim Import wird alles mit Zod geprüft; ein Import in ein neues
 * Profil bekommt eine eigene Geräte-UUID (das alte Gerät darf weiterzählen), ein Import in ein vorhandenes Profil
 * vereinigt idempotent.
 */

export const EXPORT_FORMAT = 'igmg-lernapp-export';
export const EXPORT_VERSION = 1;
/** Obergrenze der Datei beim Einlesen (Zeichen). */
export const EXPORT_HOECHSTENS = 25_000_000;

const Sprache = z.enum(SPRACHEN);
/** Name eines Profils (wie `pruefeProfilName` in profile.ts): getrimmt, 1–40 Zeichen. */
export const ProfilNameSchema = z.string().check(z.trim(), z.minLength(1), z.maxLength(40));

export const ExportSchema = z.strictObject({
  format: z.literal(EXPORT_FORMAT),
  version: z.literal(EXPORT_VERSION),
  erstellt: z.iso.datetime({ offset: true }),
  profil: z.strictObject({
    name: ProfilNameSchema,
    oberflaeche: Sprache,
    ausgangssprache: z.optional(Sprache),
    angelegt: z.iso.datetime({ offset: true }),
  }),
  ereignisse: z.array(EreignisSchema).check(z.maxLength(250_000)),
});
export type ExportDatei = z.infer<typeof ExportSchema>;

export async function exportiere(sp: Speicher, profilId: string, jetzt = new Date()): Promise<ExportDatei> {
  const p = await sp.lies('profile', profilId);
  if (!p) throw new Error('Profil nicht gefunden');
  return ExportSchema.parse({
    format: EXPORT_FORMAT,
    version: EXPORT_VERSION,
    erstellt: jetzt.toISOString(),
    profil: {
      name: p.name,
      oberflaeche: p.oberflaeche,
      ...(p.ausgangssprache ? { ausgangssprache: p.ausgangssprache } : {}),
      angelegt: p.angelegt,
    },
    ereignisse: await ereignisse(sp, profilId),
  });
}

/** Dateiname und Inhalt zum Speichern (`Blob` und Download macht die Oberfläche). */
export function alsDatei(daten: ExportDatei): { name: string; typ: 'application/json'; inhalt: string } {
  return { name: `igmg-lernapp-${daten.erstellt.slice(0, 10)}.json`, typ: 'application/json', inhalt: JSON.stringify(daten) };
}

export type Einlesen = { ok: true; daten: ExportDatei } | { ok: false; fehler: 'zuGross' | 'keinJson' | 'format' };

/** Datei einlesen und prüfen (ohne etwas zu speichern). */
export function liesExport(text: string): Einlesen {
  if (text.length > EXPORT_HOECHSTENS) return { ok: false, fehler: 'zuGross' };
  let roh: unknown;
  try {
    roh = JSON.parse(text);
  } catch {
    return { ok: false, fehler: 'keinJson' };
  }
  const p = ExportSchema.safeParse(roh);
  return p.success ? { ok: true, daten: p.data } : { ok: false, fehler: 'format' };
}

export type ImportZiel = { als: 'neu' } | { profil: string };

/** Geprüfte Datei übernehmen; danach sind die abgeleiteten Speicher neu berechnet. */
export async function importiere(
  sp: Speicher,
  daten: ExportDatei,
  ziel: ImportZiel,
  { heute, jetzt = new Date() }: { heute: string; jetzt?: Date },
): Promise<{ profil: Profil; neu: number; vorhanden: number; ableitung: Ableitung }> {
  const geprueft = ExportSchema.parse(daten);
  let profil: Profil;
  if ('als' in ziel) {
    profil = await legeProfilAn(
      sp,
      {
        name: geprueft.profil.name,
        oberflaeche: geprueft.profil.oberflaeche,
        ...(geprueft.profil.ausgangssprache ? { ausgangssprache: geprueft.profil.ausgangssprache } : {}),
      },
      { jetzt },
    );
  } else {
    const p = await sp.lies('profile', ziel.profil);
    if (!p) throw new Error('Profil nicht gefunden');
    profil = p;
  }
  const { neu, vorhanden } = await uebernimm(sp, profil.id, geprueft.ereignisse, { synchron: 0 });
  const ableitung = await leiteNeuAb(sp, profil.id, heute);
  return { profil: (await sp.lies('profile', profil.id)) ?? profil, neu, vorhanden, ableitung };
}
