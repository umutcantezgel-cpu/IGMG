import { DACHVERBAND_MAX, type DachverbandEintrag } from '@/lib/validierung/seiteninhalte/dachverband';
import type { FeedEintrag } from './feed';

/**
 * Zusammenführung von Bestand und Hutba-Feed für den Abgleich „Aus dem Dachverband“ (Plan Marktstart P3): reine Funktionen
 * ohne Datenbank (`abgleich.ts` ruft sie unter Sperre auf, Unit-Test `dachverband-abgleich.test.ts`).
 */
/** Vergleichsform einer Adresse: Host und Pfad mit Schrägstrich am Ende, ohne Abfrage und Anker, klein geschrieben. */
export function adressKern(adresse: string): string {
  try {
    const u = new URL(adresse);
    const pfad = u.pathname.endsWith('/') ? u.pathname : `${u.pathname}/`;
    return `${u.hostname}${pfad}`.toLowerCase();
  } catch {
    return adresse.toLowerCase();
  }
}

export type Zusammenfuehrung = {
  eintraege: DachverbandEintrag[];
  neu: DachverbandEintrag[];
  vorhanden: number;
  entfernt: number;
  /** Kennungen der wegen der Obergrenze entfernten Feed-Einträge (der Editor nimmt sie aus seinem Stand) */
  entfernteSchluessel: string[];
};

/**
 * Reine Zusammenführung von Bestand und Feed (unit-testbar): neue Predigten vorn (neueste zuerst), Bestand unverändert
 * dahinter; Obergrenze wie oben beschrieben.
 */
export function fuehreZusammen(
  bestand: readonly DachverbandEintrag[],
  feed: readonly FeedEintrag[],
  max = DACHVERBAND_MAX,
): Zusammenfuehrung {
  const schluessel = new Set(bestand.map((e) => e.schluessel));
  const adressen = new Set(bestand.flatMap((e) => [e.url, e.urlTr, e.urlEn].filter((u): u is string => Boolean(u)).map(adressKern)));
  const imFeed = new Set(feed.flatMap((f) => [f.schluessel, adressKern(f.url)]));
  let vorhanden = 0;
  let neu: DachverbandEintrag[] = [];
  for (const f of feed) {
    if (schluessel.has(f.schluessel) || adressen.has(adressKern(f.url))) {
      vorhanden++;
      continue;
    }
    schluessel.add(f.schluessel);
    adressen.add(adressKern(f.url));
    neu.push({
      schluessel: f.schluessel,
      art: 'hutba',
      datum: f.datum,
      titel: { de: f.titel },
      url: f.url,
      sichtbar: true,
      herkunft: 'feed',
    });
  }
  neu.sort((a, b) => (a.datum < b.datum ? 1 : a.datum > b.datum ? -1 : 0));

  let behalten = [...bestand];
  let ueber = behalten.length + neu.length - max;
  let entfernt = 0;
  let entfernteSchluessel: string[] = [];
  if (ueber > 0) {
    // Zuerst die ältesten Feed-Einträge, die nicht mehr im Feed stehen (sie kämen nie zurück)
    const entbehrlich = behalten
      .filter((e) => e.herkunft === 'feed' && !imFeed.has(e.schluessel) && !imFeed.has(adressKern(e.url)))
      .sort((a, b) => (a.datum < b.datum ? -1 : a.datum > b.datum ? 1 : 0))
      .slice(0, ueber);
    const weg = new Set(entbehrlich.map((e) => e.schluessel));
    behalten = behalten.filter((e) => !weg.has(e.schluessel));
    entfernt = weg.size;
    entfernteSchluessel = [...weg];
    ueber -= weg.size;
  }
  // Reicht das nicht, bleiben die ältesten neuen Predigten draußen (der Bestand hat höchstens `max` Einträge)
  if (ueber > 0) neu = neu.slice(0, Math.max(0, neu.length - ueber));
  return { eintraege: [...neu, ...behalten], neu, vorhanden, entfernt, entfernteSchluessel };
}
