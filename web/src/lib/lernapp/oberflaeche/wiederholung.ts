import type { Aufgabe, Lektion } from '../aufgaben/schema';
import { uebungsStufe, WIEDERHOLUNG_ANZAHL } from '../engine/kartenwahl';
import type { KursSlug } from '../kurse';
import type { Paket } from '../paket/typen';
import type { Kartenstand } from '../bewertung';

/**
 * Wiederholungsrunde (PLAN §4 „Kartenwahl“, ADR 0038 Nr. 3): Aus den gewählten Karten (`waehleKarten`, fällige zuerst)
 * entsteht eine Lektion der Art `wiederholung` aus den Aufgaben der Einheitenpakete, die diese Karten bewerten. Die Übungsart
 * folgt der Stabilität: erkennen → Auswahl, Paare, Bild und Hören; Wortbank → Wortbank, Satzbau, Lücke; Produktion →
 * Freitext, Diktat, Lücke, Formen. Im Wissenskurs und im Koran-Pfad entsprechend: erst erkennen (koran_wort,
 * wahr_falsch, fallfrage), dann ordnen (zuordnen, reihenfolge). Rein.
 */

/** Einheit einer Karte (`tr-aus-de:tr.a1.e01.w001` → `tr.a1.e01`). */
export function einheitDerKarte(karte: string): string | null {
  const schluessel = karte.slice(karte.indexOf(':') + 1);
  const teile = schluessel.split('.');
  return karte.includes(':') && teile.length > 1 ? teile.slice(0, -1).join('.') : null;
}

/** Karten, die eine Aufgabe bewertet. */
export const kartenDer = (a: Aufgabe): string[] => [
  ...(a.karten ?? []),
  ...(a.typ === 'paare' ? a.paare.flatMap((p) => (p.karte ? [p.karte] : [])) : []),
];

const VORRANG: Record<ReturnType<typeof uebungsStufe>, Aufgabe['typ'][]> = {
  erkennen: [
    'auswahl',
    'paare',
    'bild_wort',
    'hoeren_waehlen',
    'minimalpaare',
    'wortbank',
    'harakat',
    'koran_wort',
    'wahr_falsch',
    'fallfrage',
    'zuordnen',
  ],
  wortbank: ['wortbank', 'satzbau', 'luecke', 'auswahl', 'paare', 'bild_wort', 'hoeren_waehlen', 'zuordnen', 'reihenfolge', 'wahr_falsch'],
  produktion: ['frei', 'hoeren_schreiben', 'luecke', 'formen', 'wortbank', 'satzbau', 'auswahl', 'paare', 'reihenfolge', 'fallfrage'],
};
/** Rang eines Typs in der Stufe; Typen ohne Eintrag kommen zuletzt. */
const rang = (liste: readonly Aufgabe['typ'][], typ: Aufgabe['typ']) => {
  const i = liste.indexOf(typ);
  return i < 0 ? liste.length : i;
};

/**
 * Lektion für die Wiederholung: je Karte (in der Reihenfolge der Kartenwahl) eine Aufgabe, die sie bewertet; eine Aufgabe
 * deckt alle ihre Karten ab. `null`, wenn keine Aufgabe gefunden wird (Paket nicht auf dem Gerät).
 */
export function baueWiederholung(
  kurs: KursSlug,
  karten: readonly Kartenstand[],
  pakete: readonly Paket[],
  anzahl = WIEDERHOLUNG_ANZAHL,
): Lektion | null {
  const kandidaten = new Map<string, Aufgabe[]>();
  for (const p of pakete)
    for (const l of p.lektionen)
      for (const a of l.aufgaben)
        for (const k of kartenDer(a)) {
          const liste = kandidaten.get(k) ?? [];
          if (!liste.some((x) => x.schluessel === a.schluessel)) liste.push(a);
          kandidaten.set(k, liste);
        }
  const gewaehlt: Aufgabe[] = [];
  const abgedeckt = new Set<string>();
  for (const stand of karten) {
    if (gewaehlt.length >= anzahl) break;
    if (abgedeckt.has(stand.karte)) continue;
    const vorrang = VORRANG[uebungsStufe(stand)];
    const passende = (kandidaten.get(stand.karte) ?? [])
      .filter((a) => !gewaehlt.some((g) => g.schluessel === a.schluessel))
      .sort((a, b) => rang(vorrang, a.typ) - rang(vorrang, b.typ));
    const a = passende[0];
    if (!a) continue;
    gewaehlt.push(a);
    for (const k of kartenDer(a)) abgedeckt.add(k);
  }
  const erstes = pakete[0];
  if (!gewaehlt.length || !erstes) return null;
  const lexikon = [...new Set(pakete.flatMap((p) => p.lektionen.flatMap((l) => l.lexikon ?? [])))].sort();
  return {
    schluessel: `${kurs}.wiederholung`,
    kurs,
    art: 'wiederholung',
    zielsprache: erstes.zielsprache,
    ausgangssprache: erstes.ausgangssprache,
    aufgaben: gewaehlt,
    ...(lexikon.length ? { lexikon } : {}),
  };
}
