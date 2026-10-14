/**
 * Welcher Bogen steht auf der Startseite (Vorführpfad Station 1, B-06/B-20)? Reine Funktion ohne Kalenderrechnung, damit
 * sie im Browser läuft, ohne den islamischen Kalender zu laden (H-L01): Die Ramadan-Tage des Fensters rechnet der Server
 * (`ramadanImFenster`), der Browser vergleicht nur das heutige Datum (Europe/Berlin) mit der Liste.
 *
 * - `fasten`: heute ist ein Ramadan-Tag → Fastenbogen statt Tagesbogen.
 * - `fasten-vorschau`: außerhalb des Ramadan nur, wenn der Schalter `ramadan_vorschau` an ist **und** die Vorführung den
 *   Fastenbogen gewählt hat (Knopf unter dem Bogen); sonst bleibt der Tagesbogen der große Moment der Startseite.
 * - `tag`: Tagesbogen.
 */
export type BogenArt = 'tag' | 'fasten' | 'fasten-vorschau';

export function bogenArt({
  heute,
  ramadan,
  vorschau,
  gewaehlt,
}: {
  /** Kalendertag „JJJJ-MM-TT“ (Browser: `berlinerDatum(jetzt)`, vor der Hydrierung der Referenztag des Servers) */
  heute: string;
  /** Ramadan-Tage im Fenster der Gebetszeiten, vom Server berechnet */
  ramadan: readonly string[];
  /** Funktionsschalter `ramadan_vorschau` */
  vorschau: boolean;
  /** Vorführung hat den Fastenbogen gewählt */
  gewaehlt: boolean;
}): BogenArt {
  if (ramadan.includes(heute)) return 'fasten';
  return vorschau && gewaehlt ? 'fasten-vorschau' : 'tag';
}

/**
 * Lagen der sechs Beschriftungen unter dem Tagesbogen auf **einer** Grundlinie (Sichtabnahme Z-04, ST-3; vorher standen
 * Imsak und Yatsı in einer zweiten, versetzten Reihe). Jede Beschriftung steht möglichst genau unter ihrem Punkt; wären
 * zwei Beschriftungen einander im Weg, rücken sie als Gruppe um den Mittelwert ihrer Wunschlagen auseinander, und keine
 * ragt über den Rand. Reine Funktion (läuft im Browser).
 *
 * @param lagen Mittelpunkte der Punkte als Anteil der Breite (0 … 1), aufsteigend
 * @param breiten Platzbedarf je Beschriftung als Anteil der Breite (samt Abstand); zusammen mehr als 1 wird verkleinert
 * @returns Mittelpunkte der Beschriftungen in derselben Reihenfolge
 */
export function beschriftungsLagen(lagen: readonly number[], breiten: readonly number[]): number[] {
  if (lagen.length === 0) return [];
  const gesamt = breiten.reduce((s, x) => s + x, 0);
  const b = breiten.map((x) => (gesamt > 1 ? x / gesamt : x));
  /** Abstand der Mittelpunkte von i und i + 1 */
  const abstand = (i: number) => (b[i] + b[i + 1]) / 2;
  /** Gruppe von `start` bis `ende`; `summe` = Σ (Wunschlage − Versatz in der Gruppe), `spanne` = Versatz des letzten */
  type Gruppe = { start: number; ende: number; summe: number; spanne: number; lage: number };
  const setze = (g: Omit<Gruppe, 'lage'>): Gruppe => ({
    ...g,
    lage: Math.min(1 - b[g.ende] / 2 - g.spanne, Math.max(b[g.start] / 2, g.summe / (g.ende - g.start + 1))),
  });
  const gruppen: Gruppe[] = [];
  lagen.forEach((x, i) => {
    let neu = setze({ start: i, ende: i, summe: x, spanne: 0 });
    for (let vor = gruppen.at(-1); vor && vor.lage + vor.spanne + abstand(vor.ende) > neu.lage + 1e-9; vor = gruppen.at(-1)) {
      gruppen.pop();
      const versatz = vor.spanne + abstand(vor.ende);
      neu = setze({
        start: vor.start,
        ende: neu.ende,
        summe: vor.summe + neu.summe - (neu.ende - neu.start + 1) * versatz,
        spanne: versatz + neu.spanne,
      });
    }
    gruppen.push(neu);
  });
  const raus: number[] = [];
  for (const g of gruppen) {
    let x = g.lage;
    for (let i = g.start; i <= g.ende; i++) {
      raus.push(x);
      if (i < g.ende) x += abstand(i);
    }
  }
  return raus;
}

/** Kleinste Breite des Bogens, ab der die Beschriftungen in einer Reihe stehen (Container-Stufe @xl = 36 rem). */
export const BESCHRIFTUNG_REIHE_REM = 36;

/**
 * Geschätzter Platzbedarf einer Beschriftung in rem: Name in 16 px fett (≈ 0,58 rem je Zeichen), mindestens die Breite
 * der Zeit in 18 px fett, dazu 0,75 rem Abstand; das nächste Gebet trägt links den Achtstern (1,25 rem). Bewusst ohne
 * Messung im Browser, damit HTML vom Server und erstes Bild übereinstimmen.
 */
export function beschriftungsBreite(name: string, stern: boolean): number {
  return Math.max(name.length * 0.58, 3.4) + (stern ? 1.25 : 0) + 0.75;
}
