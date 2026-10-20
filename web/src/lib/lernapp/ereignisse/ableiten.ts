import { type KartenBasis, type KartenBewertung, type Kartenstand, spieleNach } from '../srs';
import { berechneSerie, ruhetageAus, type SerienStand } from './serie';
import {
  EINSTELLUNG_WERTE,
  type Einstellungen,
  EINSTELLUNGEN_STANDARD,
  type Ereignis,
  type EreignisVon,
  istArt,
  TAGESZIEL_STANDARD,
  type Tagesziel,
} from './typen';
import { ABLEITUNGS_VERSION } from './version';
import { vereinige } from './zusammenfuehren';

/**
 * Abgeleitete Zustände (ADR 0038 Nr. 2 und 4): rein aus den Ereignissen. Ändert sich eine Regel hier, steigt
 * `ABLEITUNGS_VERSION`, und die lokalen Speicher werden aus dem Protokoll neu berechnet (lokal/ausgang.ts).
 *
 * | Zustand | Regel |
 * |---|---|
 * | Karten | Bewertungen nach (am, geraet, seq) durch FSRS nachspielen (srs.ts) |
 * | Lektion erledigt, beste Quote | Vereinigung bzw. Maximum |
 * | Einstellungen, Einstufung | letzter Schreiber gewinnt nach (am, geraet, seq) |
 * | XP, Tagesziel | Summe der `xp`-Ereignisse je Lerntag; Ziel des Tages = letztes Tagesziel mit `tag` ≤ Tag |
 * | Serie | Lerntage mit Pausen und Ruhetagen (serie.ts) |
 */
export { ABLEITUNGS_VERSION };

export type LektionsStand = {
  lektion: string;
  kurs: string;
  art: EreignisVon<'lektion'>['daten']['art'];
  erledigt: true;
  /** beste Quote richtig/gesamt (0…1) */
  besteQuote: number;
  anzahl: number;
  zuletzt: string;
};

export type TagesStand = {
  tag: string;
  xp: number;
  lektionen: number;
  bewertungen: number;
  ziel: Tagesziel;
  /** `null` bei „kein Ziel“ */
  erreicht: boolean | null;
};

export type Einstufung = { kurs: string; stufe: EreignisVon<'einstufung'>['daten']['stufe']; einheit?: string; quote: number; am: string };

export type Ableitung = {
  version: number;
  karten: Map<string, Kartenstand>;
  lektionen: Map<string, LektionsStand>;
  einstellungen: Einstellungen;
  einstufungen: Map<string, Einstufung>;
  /** aktuelles Tagesziel (letztes `tagesziel`-Ereignis, sonst Standard) */
  tagesziel: Tagesziel;
  tage: Map<string, TagesStand>;
  xpGesamt: number;
  lerntage: Set<string>;
  ruhetage: Set<string>;
  serie: SerienStand;
};

/** Arten, die einen Tag zum Lerntag machen. */
const LERNEN: ReadonlySet<Ereignis['art']> = new Set(['bewertung', 'lektion', 'xp', 'einstufung']);

export const kartenBewertungen = (ereignisse: readonly Ereignis[]): KartenBewertung[] =>
  ereignisse.filter(istArt('bewertung')).map((e) => ({ karte: e.daten.karte, note: e.daten.note, am: e.am, geraet: e.geraet, seq: e.seq }));

/** Einstellungen nach „letzter Schreiber gewinnt“; ungültige Werte und unbekannte Schlüssel wirken nicht. */
export function einstellungenAus(sortiert: readonly Ereignis[]): Einstellungen {
  const e: Record<string, unknown> = { ...EINSTELLUNGEN_STANDARD };
  for (const x of sortiert.filter(istArt('einstellung'))) {
    const schema = EINSTELLUNG_WERTE[x.daten.schluessel as keyof typeof EINSTELLUNG_WERTE];
    if (!schema) continue;
    const geprueft = schema.safeParse(x.daten.wert);
    if (geprueft.success) e[x.daten.schluessel] = geprueft.data;
  }
  return e as Einstellungen;
}

function zielAm(tag: string, ziele: readonly EreignisVon<'tagesziel'>[]): Tagesziel {
  let ziel = TAGESZIEL_STANDARD;
  for (const z of ziele) if (z.tag <= tag) ziel = z.daten.ziel;
  return ziel;
}

function erreicht(ziel: Tagesziel, xp: number, lektionen: number): boolean | null {
  if (ziel.art === 'kein') return null;
  return ziel.art === 'xp' ? xp >= ziel.wert : lektionen >= ziel.wert;
}

/**
 * Alle Zustände aus den Ereignissen; `heute` ist der Lerntag des Geräts (serie.ts `lerntagVon`). `basen`: verdichtete
 * Kartenstände vom Server (ADR 0038 Nr. 10), auf die nur jüngere Bewertungen nachgespielt werden.
 */
export function leiteAb(
  ereignisse: readonly Ereignis[],
  heute: string,
  { basen }: { basen?: ReadonlyMap<string, KartenBasis> } = {},
): Ableitung {
  const sortiert = vereinige(ereignisse);

  const lektionen = new Map<string, LektionsStand>();
  for (const e of sortiert.filter(istArt('lektion'))) {
    const quote = e.daten.richtig / e.daten.gesamt;
    const alt = lektionen.get(e.daten.lektion);
    lektionen.set(e.daten.lektion, {
      lektion: e.daten.lektion,
      kurs: e.daten.kurs,
      art: e.daten.art,
      erledigt: true,
      besteQuote: Math.max(alt?.besteQuote ?? 0, quote),
      anzahl: (alt?.anzahl ?? 0) + 1,
      zuletzt: alt && alt.zuletzt > e.tag ? alt.zuletzt : e.tag,
    });
  }

  const einstufungen = new Map<string, Einstufung>();
  for (const e of sortiert.filter(istArt('einstufung')))
    einstufungen.set(e.daten.kurs, {
      kurs: e.daten.kurs,
      stufe: e.daten.stufe,
      ...(e.daten.einheit ? { einheit: e.daten.einheit } : {}),
      quote: e.daten.richtig / e.daten.gesamt,
      am: e.am,
    });

  const ziele = sortiert.filter(istArt('tagesziel'));
  const roh = new Map<string, { xp: number; lektionen: number; bewertungen: number }>();
  const lerntage = new Set<string>();
  let xpGesamt = 0;
  for (const e of sortiert) {
    if (!LERNEN.has(e.art)) continue;
    lerntage.add(e.tag);
    const t = roh.get(e.tag) ?? { xp: 0, lektionen: 0, bewertungen: 0 };
    if (e.art === 'xp') {
      t.xp += e.daten.menge;
      xpGesamt += e.daten.menge;
    } else if (e.art === 'lektion') t.lektionen++;
    else if (e.art === 'bewertung') t.bewertungen++;
    roh.set(e.tag, t);
  }
  const tage = new Map<string, TagesStand>();
  for (const tag of [...roh.keys()].sort()) {
    const t = roh.get(tag)!;
    const ziel = zielAm(tag, ziele);
    tage.set(tag, { tag, ...t, ziel, erreicht: erreicht(ziel, t.xp, t.lektionen) });
  }

  const einstellungen = einstellungenAus(sortiert);
  const ruhetage = ruhetageAus(sortiert.filter(istArt('pause')).map((e) => e.daten));

  return {
    version: ABLEITUNGS_VERSION,
    karten: spieleNach(kartenBewertungen(sortiert), basen),
    lektionen,
    einstellungen,
    einstufungen,
    tagesziel: ziele.at(-1)?.daten.ziel ?? TAGESZIEL_STANDARD,
    tage,
    xpGesamt,
    lerntage,
    ruhetage,
    serie: berechneSerie(lerntage, ruhetage, heute, { pausetage: einstellungen.pausetage }),
  };
}

/** Stand des heutigen Tages (auch ohne Ereignisse, mit dem gültigen Ziel). */
export function heuteStand(a: Pick<Ableitung, 'tage' | 'tagesziel'>, heute: string): TagesStand {
  return a.tage.get(heute) ?? { tag: heute, xp: 0, lektionen: 0, bewertungen: 0, ziel: a.tagesziel, erreicht: erreicht(a.tagesziel, 0, 0) };
}
