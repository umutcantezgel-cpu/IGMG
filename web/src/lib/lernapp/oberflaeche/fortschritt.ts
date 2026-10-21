import { ABZEICHEN, type ErhaltenesAbzeichen } from '../ereignisse/abzeichen';
import { profilBereich } from '../lokal/db';
import { frischAbgeleitet, heute, vorhandenesProfil } from './geraet';
import { type SerieAnzeige, serieVon } from './stand';

/**
 * Stand für die Seite „Fortschritt“ (PLAN §3.1, ADR 0043): Kennzahlen, Serie und Abzeichen aus den abgeleiteten Speichern
 * der lokalen Datenbank (ADR 0038) – ohne FSRS und ohne Zod; nur wenn sich die Ableitung geändert hat, rechnet
 * `frischAbgeleitet` neu. Nur für die Person auf diesem Gerät, ohne Vergleich mit anderen; Zahlen stehen statisch.
 */
export type FortschrittStand = {
  begonnen: boolean;
  /** Lerntage gesamt (nicht in Folge) */
  lerntage: number;
  xp: number;
  /** verschiedene geschaffte Lektionen */
  lektionen: number;
  /** geübte Karten (Wörter und Sätze) */
  karten: number;
  heute: { xp: number; lektionen: number };
  serie: SerieAnzeige | null;
  /** erhaltene Abzeichen in der Reihenfolge des Katalogs */
  abzeichen: ErhaltenesAbzeichen[];
};

export const LEERER_FORTSCHRITT: FortschrittStand = {
  begonnen: false,
  lerntage: 0,
  xp: 0,
  lektionen: 0,
  karten: 0,
  heute: { xp: 0, lektionen: 0 },
  serie: null,
  abzeichen: [],
};

export async function ladeFortschritt(jetzt = new Date()): Promise<FortschrittStand> {
  const { sp, profil } = await vorhandenesProfil();
  if (!profil) return LEERER_FORTSCHRITT;
  const p = await frischAbgeleitet(sp, profil);
  const lerntag = heute(jetzt);
  const bereich = profilBereich(p.id);
  const [tage, lektionen, karten, abzeichen, serie] = await Promise.all([
    sp.alle('tage', bereich),
    sp.alle('lektionen', bereich),
    sp.alle('karten', bereich),
    sp.alle('abzeichen', bereich),
    serieVon(sp, p.id, lerntag),
  ]);
  const tag = tage.find((t) => t.tag === lerntag);
  const erhalten = new Map(abzeichen.map((a) => [a.abzeichen, a.am]));
  return {
    begonnen: tage.length > 0 || lektionen.length > 0,
    lerntage: tage.length,
    xp: tage.reduce((s, t) => s + t.xp, 0),
    lektionen: lektionen.length,
    karten: karten.length,
    heute: { xp: tag?.xp ?? 0, lektionen: tag?.lektionen ?? 0 },
    serie,
    abzeichen: ABZEICHEN.flatMap((a) => (erhalten.has(a.id) ? [{ id: a.id, tag: erhalten.get(a.id)! }] : [])),
  };
}
