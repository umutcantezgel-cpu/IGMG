import { naeherungRoh } from './berechnung';
import { berlinerDatum, berlinTeile } from './naechstes';
import { GEBETE, STANDARD_NAEHERUNG, type Gebet, type HoheBreite, type Naeherung, type Tageszeiten } from './typen';

/**
 * Kalibrierung der Näherung „IGMG (angenähert)“ an IGMG-Tabellen (ADR 0048), reine Funktion für das Skript
 * `pnpm gebetszeiten:kalibrieren` und den Vorschlag in der Verwaltung. Schreibt nie eine Einstellung.
 *
 * Verfahren: Rastersuche über den Winkel für İmsak und Yatsı (15° bis 19,5°, Schritt 0,1°) und den Temkin in ganzen
 * Sekunden (±30 Minuten) je Gebet. Ziel in dieser Rangfolge: meiste exakte Tage, kleinster Maximalfehler, kleinster
 * Mittelwert; bei Gleichstand die Mitte des gleichwertigen Temkin-Bereichs und der Winkel am nächsten an 18°.
 * Ab zwei Monaten zusätzlich eine Kreuzprobe: je ein Monat wird ausgelassen, angepasst und am ausgelassenen geprüft.
 */
export type KalibrierTag = Tageszeiten & { datum: string };
export type Guete = { tage: number; exakt: number; maxFehlerMin: number; mittelFehlerMin: number };
export type Kreuzprobe = { tage: number; fehltage: number; maxFehlerMin: number };
export type KalibrierWarnung = 'zuWenige' | 'einMonat' | 'ohneSommer';
export type Kalibrierung = {
  naeherung: Naeherung;
  guete: Record<Gebet, Guete>;
  monate: string[];
  kreuzprobe: Record<Gebet, Kreuzprobe> | null;
  warnungen: KalibrierWarnung[];
};

const WINKEL = Array.from({ length: 46 }, (_, i) => Math.round((15 + i * 0.1) * 10) / 10);
const BASIS_WINKEL = 18;
const TEMKIN_GRENZE_SEK = 1800;
const MIN_TAGE = 14;

/** Sekunden seit Mitternacht der Berliner Wanduhr am Kalendertag `datum` (nach Mitternacht: über 24 h). */
function wanduhrSek(ms: number, datum: string): number {
  const d = new Date(ms);
  const w = berlinTeile(d);
  const s = w.h * 3600 + w.min * 60 + w.s + (((ms % 1000) + 1000) % 1000) / 1000;
  return berlinerDatum(d) > datum ? s + 86_400 : s;
}

/** Sollwert in Sekunden; Yatsı nach Mitternacht (vor İmsak) zählt zum Folgetag. */
function sollSek(t: KalibrierTag, g: Gebet): number {
  const m = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));
  const wert = m(t[g]) * 60;
  return g === 'yatsi' && m(t.yatsi) < m(t.imsak) ? wert + 86_400 : wert;
}

type Bestwert = { temkinSek: number; exakt: number; maxFehlerMin: number; summeMin: number };

/** Bester Temkin für Rohwerte (Sekunden) gegen Sollwerte (Sekunden) – Zählung über ein Differenzfeld. */
function besterTemkin(roh: readonly number[], soll: readonly number[]): Bestwert {
  const breite = 2 * TEMKIN_GRENZE_SEK + 1;
  const zaehler = new Int32Array(breite + 1);
  roh.forEach((r, i) => {
    // exakt, wenn soll − 30 ≤ r + t < soll + 30
    const von = Math.max(-TEMKIN_GRENZE_SEK, Math.ceil(soll[i] - 30 - r));
    const bis = Math.min(TEMKIN_GRENZE_SEK, Math.ceil(soll[i] + 30 - r) - 1);
    if (von > bis) return;
    zaehler[von + TEMKIN_GRENZE_SEK]++;
    zaehler[bis + TEMKIN_GRENZE_SEK + 1]--;
  });
  let laufend = 0;
  let meiste = -1;
  const anzahl = new Int32Array(breite);
  for (let k = 0; k < breite; k++) {
    laufend += zaehler[k];
    anzahl[k] = laufend;
    meiste = Math.max(meiste, laufend);
  }
  const kandidaten: Bestwert[] = [];
  for (let k = 0; k < breite; k++) {
    if (anzahl[k] !== meiste) continue;
    const t = k - TEMKIN_GRENZE_SEK;
    let max = 0;
    let summe = 0;
    roh.forEach((r, i) => {
      const f = Math.abs(Math.floor((r + t) / 60 + 0.5) - soll[i] / 60);
      max = Math.max(max, f);
      summe += f;
    });
    kandidaten.push({ temkinSek: t, exakt: meiste, maxFehlerMin: max, summeMin: summe });
  }
  const bester = kandidaten.reduce((a, b) =>
    b.maxFehlerMin < a.maxFehlerMin || (b.maxFehlerMin === a.maxFehlerMin && b.summeMin < a.summeMin) ? b : a,
  );
  const gleich = kandidaten.filter((k) => k.maxFehlerMin === bester.maxFehlerMin && k.summeMin === bester.summeMin);
  return gleich[Math.floor((gleich.length - 1) / 2)];
}

const besser = (a: Bestwert, b: Bestwert) =>
  a.exakt !== b.exakt ? a.exakt > b.exakt : a.maxFehlerMin !== b.maxFehlerMin ? a.maxFehlerMin < b.maxFehlerMin : a.summeMin < b.summeMin;

/** Rohwerte je Gebet und Winkel (Sekunden der Wanduhr) – einmal gerechnet, für Anpassung und Kreuzprobe. */
function rohwerte(tage: readonly KalibrierTag[], breite: number, laenge: number, hoheBreite: HoheBreite) {
  const je = (fajrWinkel: number, ishaWinkel: number) =>
    tage.map((t) => {
      const r = naeherungRoh(t.datum, breite, laenge, { ...STANDARD_NAEHERUNG, fajrWinkel, ishaWinkel, hoheBreite });
      return Object.fromEntries(GEBETE.map((g) => [g, wanduhrSek(r[g], t.datum)])) as Record<Gebet, number>;
    });
  const basis = je(BASIS_WINKEL, BASIS_WINKEL);
  const winkel = WINKEL.map((w) => je(w, w));
  return { basis, winkel };
}

type Roh = ReturnType<typeof rohwerte>;

function passe(tage: readonly KalibrierTag[], roh: Roh, auswahl: readonly number[], hoheBreite: HoheBreite): Naeherung {
  const soll = (g: Gebet) => auswahl.map((i) => sollSek(tage[i], g));
  const temkinSek = {} as Record<Gebet, number>;
  let fajrWinkel = BASIS_WINKEL;
  let ishaWinkel = BASIS_WINKEL;
  for (const g of GEBETE) {
    if (g === 'imsak' || g === 'yatsi') {
      let bester = {
        winkel: WINKEL[0],
        wert: besterTemkin(
          auswahl.map((i) => roh.winkel[0][i][g]),
          soll(g),
        ),
      };
      for (let wi = 1; wi < WINKEL.length; wi++) {
        const wert = besterTemkin(
          auswahl.map((i) => roh.winkel[wi][i][g]),
          soll(g),
        );
        const naeher = Math.abs(WINKEL[wi] - BASIS_WINKEL) < Math.abs(bester.winkel - BASIS_WINKEL);
        if (besser(wert, bester.wert) || (!besser(bester.wert, wert) && naeher)) bester = { winkel: WINKEL[wi], wert };
      }
      temkinSek[g] = bester.wert.temkinSek;
      if (g === 'imsak') fajrWinkel = bester.winkel;
      else ishaWinkel = bester.winkel;
    } else {
      temkinSek[g] = besterTemkin(
        auswahl.map((i) => roh.basis[i][g]),
        soll(g),
      ).temkinSek;
    }
  }
  return { fajrWinkel, ishaWinkel, temkinSek, hoheBreite };
}

/** Rohwert eines Gebets an Tag `i` für die Winkel der Näherung `n` (aus dem Raster). */
function rohAusRaster(roh: Roh, n: Naeherung) {
  const wi = (w: number) => WINKEL.findIndex((x) => Math.abs(x - w) < 1e-9);
  const fajr = wi(n.fajrWinkel);
  const isha = wi(n.ishaWinkel);
  return (g: Gebet, i: number) => (g === 'imsak' ? roh.winkel[fajr][i][g] : g === 'yatsi' ? roh.winkel[isha][i][g] : roh.basis[i][g]);
}

/** Güte einer Näherung an IGMG-Tagen; `rohVon` liefert die Wanduhr-Sekunden ohne Temkin. */
function guete(
  tage: readonly KalibrierTag[],
  auswahl: readonly number[],
  n: Naeherung,
  rohVon: (g: Gebet, i: number) => number,
): Record<Gebet, Guete> {
  return Object.fromEntries(
    GEBETE.map((g) => {
      const fehler = auswahl.map((i) => Math.abs(Math.floor((rohVon(g, i) + n.temkinSek[g]) / 60 + 0.5) - sollSek(tage[i], g) / 60));
      return [
        g,
        {
          tage: fehler.length,
          exakt: fehler.filter((f) => f === 0).length,
          maxFehlerMin: Math.max(0, ...fehler),
          mittelFehlerMin: fehler.length ? Math.round((fehler.reduce((a, b) => a + b, 0) / fehler.length) * 100) / 100 : 0,
        },
      ];
    }),
  ) as Record<Gebet, Guete>;
}

export function kalibriere(
  tage: readonly KalibrierTag[],
  ort: { breite: number; laenge: number },
  o: { hoheBreite?: HoheBreite; kreuzprobe?: boolean } = {},
): Kalibrierung {
  const hoheBreite = o.hoheBreite ?? STANDARD_NAEHERUNG.hoheBreite;
  const sortiert = [...tage].sort((a, b) => a.datum.localeCompare(b.datum));
  const roh = rohwerte(sortiert, ort.breite, ort.laenge, hoheBreite);
  const alle = sortiert.map((_, i) => i);
  const naeherung = passe(sortiert, roh, alle, hoheBreite);
  const monate = [...new Set(sortiert.map((t) => t.datum.slice(0, 7)))];
  const warnungen: KalibrierWarnung[] = [];
  if (sortiert.length < MIN_TAGE) warnungen.push('zuWenige');
  if (monate.length < 2) warnungen.push('einMonat');
  if (!monate.some((m) => ['05', '06', '07', '08'].includes(m.slice(5)))) warnungen.push('ohneSommer');

  let kreuzprobe: Record<Gebet, Kreuzprobe> | null = null;
  if (monate.length >= 2 && o.kreuzprobe !== false) {
    kreuzprobe = Object.fromEntries(GEBETE.map((g) => [g, { tage: 0, fehltage: 0, maxFehlerMin: 0 }])) as Record<Gebet, Kreuzprobe>;
    for (const monat of monate) {
      const rest = alle.filter((i) => !sortiert[i].datum.startsWith(monat));
      const probe = alle.filter((i) => sortiert[i].datum.startsWith(monat));
      const angepasst = passe(sortiert, roh, rest, hoheBreite);
      const g2 = guete(sortiert, probe, angepasst, rohAusRaster(roh, angepasst));
      for (const g of GEBETE) {
        kreuzprobe[g].tage += g2[g].tage;
        kreuzprobe[g].fehltage += g2[g].tage - g2[g].exakt;
        kreuzprobe[g].maxFehlerMin = Math.max(kreuzprobe[g].maxFehlerMin, g2[g].maxFehlerMin);
      }
    }
  }
  return { naeherung, guete: guete(sortiert, alle, naeherung, rohAusRaster(roh, naeherung)), monate, kreuzprobe, warnungen };
}

/** Güte einer gegebenen Näherung (z. B. der gespeicherten) an IGMG-Tagen – für den Drift-Bericht. */
export function bewerte(tage: readonly KalibrierTag[], ort: { breite: number; laenge: number }, n: Naeherung): Record<Gebet, Guete> {
  const sortiert = [...tage].sort((a, b) => a.datum.localeCompare(b.datum));
  const roh = sortiert.map((t) => {
    const r = naeherungRoh(t.datum, ort.breite, ort.laenge, n);
    return Object.fromEntries(GEBETE.map((g) => [g, wanduhrSek(r[g], t.datum)])) as Record<Gebet, number>;
  });
  return guete(
    sortiert,
    sortiert.map((_, i) => i),
    n,
    (g, i) => roh[i][g],
  );
}
