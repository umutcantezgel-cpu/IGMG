import { z } from 'zod';
import { PROFIL_SPEICHER, type Profil, profilBereich, type Speicher, type Sprache } from './db';

/**
 * Lernprofile auf dem Gerät (ADR 0038 Nr. 1): mehrere je Familiengerät, ohne Passwort, ohne Konto. Jedes Profil hat
 * seine eigene Geräte-UUID für die Ereignisse. Das aktive Profil steht als Geräte-Einstellung (Profil '') im Speicher
 * `einstellungen`. Löschen entfernt alle Daten des Profils auf dem Gerät.
 */

export const ProfilNameSchema = z.string().trim().min(1).max(40);
const SpracheSchema = z.enum(['de', 'tr', 'ar']);

const GERAET = '';
const AKTIV = 'aktivesProfil';

/** UUID v4 (crypto.randomUUID, sonst aus getRandomValues). */
export function neueUuid(): string {
  const c = globalThis.crypto;
  if (typeof c?.randomUUID === 'function') return c.randomUUID();
  const b = c.getRandomValues(new Uint8Array(16));
  b[6] = ((b[6] ?? 0) & 0x0f) | 0x40;
  b[8] = ((b[8] ?? 0) & 0x3f) | 0x80;
  const h = Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

export type NeuesProfil = { name: string; oberflaeche: Sprache; ausgangssprache?: Sprache };

export async function legeProfilAn(
  sp: Speicher,
  angaben: NeuesProfil,
  {
    id = neueUuid(),
    geraet = neueUuid(),
    jetzt = new Date(),
    aktiv = true,
  }: { id?: string; geraet?: string; jetzt?: Date; aktiv?: boolean } = {},
): Promise<Profil> {
  const profil: Profil = {
    id,
    name: ProfilNameSchema.parse(angaben.name),
    oberflaeche: SpracheSchema.parse(angaben.oberflaeche),
    ...(angaben.ausgangssprache ? { ausgangssprache: SpracheSchema.parse(angaben.ausgangssprache) } : {}),
    geraet,
    angelegt: jetzt.toISOString(),
  };
  await sp.schreibe('profile', [profil]);
  if (aktiv) await setzeAktiv(sp, id, jetzt);
  return profil;
}

/** Alle Profile, älteste zuerst. */
export async function profile(sp: Speicher): Promise<Profil[]> {
  return (await sp.alle('profile')).sort((a, b) => (a.angelegt < b.angelegt ? -1 : a.angelegt > b.angelegt ? 1 : a.id < b.id ? -1 : 1));
}

export async function setzeAktiv(sp: Speicher, id: string, jetzt = new Date()): Promise<void> {
  await sp.schreibe('einstellungen', [{ profil: GERAET, schluessel: AKTIV, wert: id, am: jetzt.toISOString(), geraet: GERAET }]);
}

/** Das aktive Profil; fehlt es, das älteste; ohne Profile `null`. */
export async function aktivesProfil(sp: Speicher): Promise<Profil | null> {
  const eintrag = await sp.lies('einstellungen', [GERAET, AKTIV]);
  const id = typeof eintrag?.wert === 'string' ? eintrag.wert : null;
  const gewaehlt = id ? await sp.lies('profile', id) : undefined;
  return gewaehlt ?? (await profile(sp))[0] ?? null;
}

export async function aendereProfil(
  sp: Speicher,
  id: string,
  aenderung: Partial<Pick<Profil, 'name' | 'oberflaeche' | 'ausgangssprache' | 'benutzerId' | 'ableitungsVersion'>>,
): Promise<Profil> {
  const alt = await sp.lies('profile', id);
  if (!alt) throw new Error('Profil nicht gefunden');
  const neu: Profil = {
    ...alt,
    ...aenderung,
    ...(aenderung.name !== undefined ? { name: ProfilNameSchema.parse(aenderung.name) } : {}),
    ...(aenderung.oberflaeche !== undefined ? { oberflaeche: SpracheSchema.parse(aenderung.oberflaeche) } : {}),
  };
  await sp.schreibe('profile', [neu]);
  return neu;
}

/** Profil und alle seine Daten auf dem Gerät löschen (Ereignisse, abgeleitete Speicher, Abgleich). */
export async function loescheProfil(sp: Speicher, id: string): Promise<void> {
  for (const name of PROFIL_SPEICHER) await sp.loescheBereich(name, profilBereich(id));
  await sp.loesche('sync', id);
  await sp.loesche('profile', id);
  const eintrag = await sp.lies('einstellungen', [GERAET, AKTIV]);
  if (eintrag?.wert === id) await sp.loesche('einstellungen', [GERAET, AKTIV]);
}
