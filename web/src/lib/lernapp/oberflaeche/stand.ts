import { berechneSerie, type WochenTag } from '../ereignisse/serie';
import { istKursSlug, type KursSlug } from '../kurse';
import { profilBereich, type Speicher } from '../lokal/db';
import { frischAbgeleitet, heute, liesWeiter, vorhandenesProfil, type Weiter } from './geraet';

/**
 * Stand für die Startseite (Insel „Heute“, PLAN §3.1): Tagesziel, „Weiter lernen“ und fällige Wiederholungen aus der
 * lokalen Datenbank (ADR 0038). Gelesen werden nur die abgeleiteten Speicher (Tage, Lektionen, Karten), ohne FSRS und ohne
 * Zod; nur wenn sich die Ableitung geändert hat, rechnet `frischAbgeleitet` neu. Auf einem neuen Gerät der leere Stand.
 */
export type StartStand = {
  /** Auf diesem Gerät schon gelernt? */
  begonnen: boolean;
  /** Am heutigen Lerntag (ADR 0038 `tag`) gesammelt */
  heute: { xp: number; lektionen: number };
  /** Wo es weitergeht (Schlüssel wie `tr-aus-de.a1.e01.l02`) */
  weiter: Weiter | null;
  /** Fällige Wiederholungskarten je Kurs */
  faellig: { kurs: KursSlug; anzahl: number }[];
  /** Serie und Wochenband (B-33), sobald es einen Lerntag gibt */
  serie: { laenge: number; woche: WochenTag[]; heute: string } | null;
};

export const LEERER_START_STAND: StartStand = {
  begonnen: false,
  heute: { xp: 0, lektionen: 0 },
  weiter: null,
  faellig: [],
  serie: null,
};

/** Lerntage, Ruhetage (abgeleitet, `ruhetage` in `einstellungen`) und Pausetage je Woche → Serie für heute (ADR 0043 Nr. 3). */
async function serieVon(sp: Speicher, profil: string, tag: string): Promise<StartStand['serie']> {
  const [tage, ruhe, pausetage] = await Promise.all([
    sp.alle('tage', profilBereich(profil)),
    sp.lies('einstellungen', [profil, 'ruhetage']),
    sp.lies('einstellungen', [profil, 'pausetage']),
  ]);
  if (!tage.length) return null;
  const ruhetage = new Set(Array.isArray(ruhe?.wert) ? ruhe.wert.filter((t): t is string => typeof t === 'string') : []);
  const s = berechneSerie(new Set(tage.map((t) => t.tag)), ruhetage, tag, {
    ...(typeof pausetage?.wert === 'number' ? { pausetage: pausetage.wert } : {}),
  });
  return { laenge: s.laenge, woche: s.woche, heute: tag };
}

/** Fällige Karten je Kurs (Kartenschlüssel `<richtung>:<schlüssel>`, ADR 0039; Index [profil, faellig]). */
export async function faelligJeKurs(sp: Speicher, profil: string, jetzt = new Date()): Promise<StartStand['faellig']> {
  const faellige = await sp.alleIndex('karten', 'profil-faellig', [
    [profil, ''],
    [profil, jetzt.toISOString()],
  ]);
  const je = new Map<KursSlug, number>();
  for (const k of faellige) {
    const kurs = k.karte.slice(0, k.karte.indexOf(':'));
    if (istKursSlug(kurs)) je.set(kurs, (je.get(kurs) ?? 0) + 1);
  }
  return [...je].map(([kurs, anzahl]) => ({ kurs, anzahl }));
}

/** Liest den Stand des aktiven Profils aus der lokalen Datenbank. */
export async function ladeStartStand(jetzt = new Date()): Promise<StartStand> {
  const { sp, profil } = await vorhandenesProfil();
  if (!profil) return LEERER_START_STAND;
  const p = await frischAbgeleitet(sp, profil);
  const lerntag = heute(jetzt);
  const [tag, lektionen, faellig, weiter, serie] = await Promise.all([
    sp.lies('tage', [p.id, lerntag]),
    sp.alle('lektionen', profilBereich(p.id)),
    faelligJeKurs(sp, p.id, jetzt),
    liesWeiter(sp, p.id),
    serieVon(sp, p.id, lerntag),
  ]);
  return {
    begonnen: lektionen.length > 0 || faellig.length > 0 || Boolean(tag),
    heute: { xp: tag?.xp ?? 0, lektionen: tag?.lektionen ?? 0 },
    weiter,
    faellig,
    serie,
  };
}
