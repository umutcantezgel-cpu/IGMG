import { lerntagVon } from '../ereignisse/serie';
import { ABLEITUNGS_VERSION } from '../ereignisse/version';
import type { KursSlug, Oberflaeche } from '../kurse';
import { oeffneSpeicher, type Profil, profilBereich, type Speicher } from '../lokal/db';
import { aktivesProfil, legeProfilAn } from '../lokal/profile';

/**
 * Das Gerät aus Sicht der Oberfläche (ADR 0038 Nr. 1): lokale Datenbank `igmg-lernapp` und aktives Lernprofil, einmal je
 * Seite geöffnet. Client-Modul, klein gehalten (nur `idb`, ohne Zod und FSRS), damit Start und Lernpfad im Budget bleiben
 * (KERN 4.0 §9); die Ableitung (`lokal/ausgang.ts`) kommt erst bei Bedarf per `import()`.
 *
 * - Ein Profil entsteht erst, wenn etwas zu speichern ist (Lektion, Einstellung, Abgleich) – ein bloßer Besuch schreibt
 *   nichts. Name des ersten Profils: `STANDARD_PROFIL_NAME` (wird nicht angezeigt; mehrere Profile folgen später).
 * - Nach jeder Änderung am lokalen Stand (Lektion, Einstellung, Abgleich) meldet das Fenster-Ereignis `STAND_GEAENDERT`
 *   allen Inseln der Seite, dass sie neu lesen sollen.
 */

export const STANDARD_PROFIL_NAME = 'standard';
export const STAND_GEAENDERT = 'igmg-lernapp-stand';

let verbindung: Promise<Speicher> | null = null;

/** Lokale Datenbank (einmal je Seite); ohne IndexedDB der Arbeitsspeicher mit Hinweis. */
export function speicher(): Promise<Speicher> {
  verbindung ??= oeffneSpeicher();
  return verbindung;
}

/** Aktives Profil, ohne eines anzulegen (`null` auf einem neuen Gerät). */
export async function vorhandenesProfil(): Promise<{ sp: Speicher; profil: Profil | null }> {
  const sp = await speicher();
  return { sp, profil: await aktivesProfil(sp) };
}

let anlage: Promise<Profil> | null = null;

/** Aktives Profil; auf einem neuen Gerät wird das erste angelegt (Oberfläche wie die Seite). */
export async function geraet(ui: Oberflaeche): Promise<{ sp: Speicher; profil: Profil }> {
  const sp = await speicher();
  const da = await aktivesProfil(sp);
  if (da) return { sp, profil: da };
  anlage ??= legeProfilAn(sp, { name: STANDARD_PROFIL_NAME, oberflaeche: ui });
  return { sp, profil: await anlage };
}

/** Lerntag des Geräts (Ortszeit). */
export const heute = (jetzt = new Date()): string => lerntagVon(jetzt);

/**
 * Abgeleitete Speicher frisch halten: Hat sich die Ableitung seit dem letzten Lauf geändert (`ABLEITUNGS_VERSION`), wird
 * das Profil aus seinem Protokoll neu berechnet. Ein Profil ohne Ereignisse braucht nichts.
 */
export async function frischAbgeleitet(sp: Speicher, profil: Profil): Promise<Profil> {
  if (profil.ableitungsVersion === ABLEITUNGS_VERSION) return profil;
  if (!(await sp.alle('ereignisse', profilBereich(profil.id))).length) return profil;
  const { leiteNeuAb } = await import('../lokal/ableitung');
  await leiteNeuAb(sp, profil.id, heute());
  return (await sp.lies('profile', profil.id)) ?? profil;
}

/** Allen Inseln der Seite melden, dass sich der lokale Stand geändert hat. */
export function meldeStand(): void {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(STAND_GEAENDERT));
}

// ——— „Weiter lernen“ (nur auf diesem Gerät) ———

/** Wo es weitergeht: zuletzt geöffnete bzw. nach einer geschafften Lektion die nächste Lektion. */
export type Weiter = { kurs: KursSlug; lektion: string; titel?: string };

const GERAET = '';
const weiterSchluessel = (profil: string) => `weiter.${profil}`;

/** Gerätebezogen im Speicher `einstellungen` (Profil '' = Gerät, wie das aktive Profil); nie abgeglichen. */
export async function merkeWeiter(sp: Speicher, profil: string, weiter: Weiter | null, jetzt = new Date()): Promise<void> {
  if (!weiter) {
    await sp.loesche('einstellungen', [GERAET, weiterSchluessel(profil)]);
    return;
  }
  await sp.schreibe('einstellungen', [
    { profil: GERAET, schluessel: weiterSchluessel(profil), wert: weiter, am: jetzt.toISOString(), geraet: GERAET },
  ]);
}

export async function liesWeiter(sp: Speicher, profil: string): Promise<Weiter | null> {
  const e = await sp.lies('einstellungen', [GERAET, weiterSchluessel(profil)]);
  const w = e?.wert as Partial<Weiter> | undefined;
  return w && typeof w.kurs === 'string' && typeof w.lektion === 'string'
    ? { kurs: w.kurs as KursSlug, lektion: w.lektion, ...(typeof w.titel === 'string' ? { titel: w.titel } : {}) }
    : null;
}
