import { GEBETE, type Gebet, type Tageszeiten, type Zeitquelle } from './typen';
import { nurZeiten } from './vorrang';

/**
 * Diff des IGMG-Abgleichs (ADR 0048), reine Funktion: ordnet jeden gelieferten Tag gegenüber dem Bestand ein.
 * - neu: kein Bestand → wird mit `quelle 'igmg'` geschrieben,
 * - geändert: Bestand aus der IGMG weicht ab → wird ersetzt,
 * - gleich: nichts zu tun (kein Schreiben, keine Cache-Tags),
 * - Konflikt: Bestand aus dem manuellen Import der Gemeinde weicht ab → wird **nie** überschrieben, nur gemeldet.
 */
export type LieferTag = Tageszeiten & { datum: string };
export type BestandTag = Tageszeiten & { datum: string; quelle: Zeitquelle };
export type Konflikt = { datum: string; abweichungMin: Partial<Record<Gebet, number>> };

export type Diff = {
  neu: LieferTag[];
  geaendert: LieferTag[];
  gleich: number;
  konflikte: Konflikt[];
  /** größte Abweichung in Minuten unter den geänderten Tagen (0 ohne Änderung) */
  maxAbweichungMin: number;
};

const minuten = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));

/** Abweichung je Gebet in Minuten (geliefert minus Bestand); nur Gebete mit Unterschied. */
export function abweichung(neu: Tageszeiten, alt: Tageszeiten): Partial<Record<Gebet, number>> {
  const a = nurZeiten(alt);
  const n = nurZeiten(neu);
  const aus: Partial<Record<Gebet, number>> = {};
  for (const g of GEBETE) {
    if (a[g] === n[g]) continue;
    // Yatsı um Mitternacht: kürzerer Weg über die Tagesgrenze
    let d = minuten(n[g]) - minuten(a[g]);
    if (d > 720) d -= 1440;
    if (d < -720) d += 1440;
    aus[g] = d;
  }
  return aus;
}

export function vergleiche(bestand: ReadonlyMap<string, BestandTag>, geliefert: readonly LieferTag[]): Diff {
  const diff: Diff = { neu: [], geaendert: [], gleich: 0, konflikte: [], maxAbweichungMin: 0 };
  for (const tag of geliefert) {
    const alt = bestand.get(tag.datum);
    const zeiten = { datum: tag.datum, ...nurZeiten(tag) };
    if (!alt || alt.quelle === 'berechnet') {
      diff.neu.push(zeiten);
      continue;
    }
    const d = abweichung(tag, alt);
    if (Object.keys(d).length === 0) {
      diff.gleich++;
      continue;
    }
    if (alt.quelle === 'import') {
      diff.konflikte.push({ datum: tag.datum, abweichungMin: d });
      continue;
    }
    diff.geaendert.push(zeiten);
    diff.maxAbweichungMin = Math.max(diff.maxAbweichungMin, ...Object.values(d).map((v) => Math.abs(v)));
  }
  return diff;
}

/** Betroffene Monate „JJJJ-MM“ (für die Cache-Tags je Monat). */
export function monateVon(tage: readonly { datum: string }[]): string[] {
  return [...new Set(tage.map((t) => t.datum.slice(0, 7)))].sort();
}
