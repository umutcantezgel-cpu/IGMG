import type { KursSlug } from '../kurse';

/**
 * Stand für die Startseite (Insel „Heute“, PLAN §3.1): Tagesziel, „Weiter lernen“ und fällige Wiederholungen aus der
 * lokalen Datenbank (ADR 0038). Die Bibliothek `lokal/*` und die Ableitung (`ereignisse/ableiten.ts`) kommen aus Paket
 * L1-04; bis zur Zusammenführung liefert `ladeStartStand` den leeren Stand eines neuen Geräts.
 */
export type StartStand = {
  /** Auf diesem Gerät schon gelernt? */
  begonnen: boolean;
  /** Am heutigen Lerntag (ADR 0038 `tag`) gesammelt */
  heute: { xp: number; lektionen: number };
  /** Zuletzt begonnene, nicht abgeschlossene Lektion (Schlüssel wie `tr.a1.e03.l02`) */
  weiter: { kurs: KursSlug; lektion: string; titel?: string } | null;
  /** Fällige Wiederholungskarten je Kurs */
  faellig: { kurs: KursSlug; anzahl: number }[];
};

export const LEERER_START_STAND: StartStand = { begonnen: false, heute: { xp: 0, lektionen: 0 }, weiter: null, faellig: [] };

/** Profil auf dem Gerät (ADR 0038: mehrere Profile je Gerät möglich); ohne Auswahl das Standardprofil. */
export type ProfilId = string;
export const STANDARD_PROFIL: ProfilId = 'standard';

/** Schnittstelle für die Zusammenführung: liest den Stand eines Profils aus der lokalen Datenbank. */
export async function ladeStartStand(profil: ProfilId): Promise<StartStand> {
  void profil;
  return LEERER_START_STAND;
}
