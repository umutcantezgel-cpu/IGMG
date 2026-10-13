/**
 * Abgleich der Rezitations-Werkstatt (ADR 0029, AUFTRAG 2.5): Versgrenzen aus Stillephasen und Einrasten der
 * mitgeklopften Wortanfänge. Reine Funktionen über Lautstärke-Rahmen (RMS); der Browser liefert die Samples aus
 * `decodeAudioData`. Ergebnis sind nur Vorschläge – ein Mensch bestätigt jede Grenze.
 */
export type Rahmen = { rms: Float32Array; rahmenMs: number };

/** RMS je Rahmen (Standard 20 ms) eines Mono-Signals. */
export function lautstaerke(samples: Float32Array, abtastrate: number, rahmenMs = 20): Rahmen {
  const groesse = Math.max(1, Math.round((abtastrate * rahmenMs) / 1000));
  const anzahl = Math.ceil(samples.length / groesse);
  const rms = new Float32Array(anzahl);
  for (let r = 0; r < anzahl; r++) {
    let summe = 0;
    const ende = Math.min(samples.length, (r + 1) * groesse);
    for (let i = r * groesse; i < ende; i++) summe += samples[i] * samples[i];
    rms[r] = Math.sqrt(summe / Math.max(1, ende - r * groesse));
  }
  return { rms, rahmenMs };
}

/** Schwelle für „still“: Anteil zwischen Grundrauschen (10. Perzentil) und typischer Lautstärke (90. Perzentil). */
export function stilleSchwelle(r: Rahmen, anteil = 0.12): number {
  const sortiert = Array.from(r.rms).sort((a, b) => a - b);
  if (!sortiert.length) return 0;
  const p = (q: number) => sortiert[Math.min(sortiert.length - 1, Math.floor(q * sortiert.length))];
  return p(0.1) + (p(0.9) - p(0.1)) * anteil;
}

export type Stille = { startMs: number; endeMs: number };

/** Zusammenhängende Stillephasen von mindestens `minMs`. */
export function stillephasen(r: Rahmen, minMs = 350, schwelle = stilleSchwelle(r)): Stille[] {
  const phasen: Stille[] = [];
  let beginn = -1;
  for (let i = 0; i <= r.rms.length; i++) {
    const still = i < r.rms.length && r.rms[i] <= schwelle;
    if (still && beginn < 0) beginn = i;
    if (!still && beginn >= 0) {
      if ((i - beginn) * r.rahmenMs >= minMs) phasen.push({ startMs: beginn * r.rahmenMs, endeMs: i * r.rahmenMs });
      beginn = -1;
    }
  }
  return phasen;
}

export type VersZeit = { vers: number; startMs: number; endeMs: number };

/**
 * Versgrenzen für `verse` Verse: die `verse − 1` längsten inneren Stillephasen (ohne Anfang/Ende der Aufnahme),
 * zeitlich geordnet; Grenze in der Mitte der Stille. Gibt es zu wenige Phasen, werden die Grenzen gleichmäßig ergänzt.
 */
export function versgrenzen(r: Rahmen, verse: number, dauerMs = r.rms.length * r.rahmenMs): VersZeit[] {
  if (verse < 1) return [];
  const phasen = stillephasen(r);
  const anfang = phasen[0]?.startMs === 0 ? phasen[0].endeMs : 0;
  const ende = phasen.at(-1) && phasen.at(-1)!.endeMs >= dauerMs - r.rahmenMs ? phasen.at(-1)!.startMs : dauerMs;
  const innen = phasen.filter((p) => p.startMs > anfang && p.endeMs < ende);
  const gewaehlt = [...innen]
    .sort((a, b) => b.endeMs - b.startMs - (a.endeMs - a.startMs))
    .slice(0, verse - 1)
    .map((p) => Math.round((p.startMs + p.endeMs) / 2))
    .sort((a, b) => a - b);
  while (gewaehlt.length < verse - 1) {
    // gleichmäßig in die längste Lücke einfügen
    const punkte = [anfang, ...gewaehlt, ende];
    let besterIndex = 0;
    for (let i = 1; i < punkte.length - 1; i++)
      if (punkte[i + 1] - punkte[i] > punkte[besterIndex + 1] - punkte[besterIndex]) besterIndex = i;
    gewaehlt.push(Math.round((punkte[besterIndex] + punkte[besterIndex + 1]) / 2));
    gewaehlt.sort((a, b) => a - b);
  }
  const grenzen = [anfang, ...gewaehlt, ende];
  return Array.from({ length: verse }, (_, i) => ({ vers: i + 1, startMs: grenzen[i], endeMs: grenzen[i + 1] }));
}

/** Einsätze (Anstieg der Lautstärke über die Schwelle) in ms. */
export function einsaetze(r: Rahmen, schwelle = stilleSchwelle(r, 0.25)): number[] {
  const t: number[] = [];
  for (let i = 1; i < r.rms.length; i++) if (r.rms[i - 1] <= schwelle && r.rms[i] > schwelle) t.push(i * r.rahmenMs);
  return t;
}

/**
 * Mitklopfen (0,6–0,8-fache Geschwindigkeit): Die Klopfzeiten werden auf Originalzeit umgerechnet und auf einen Einsatz
 * innerhalb von ±`fangMs` eingerastet; ohne Einsatz in der Nähe bleibt die Klopfzeit. Zeiten sind streng steigend.
 */
export function rasteEin(klopfMs: readonly number[], tempo: number, einsatzMs: readonly number[], fangMs = 150): number[] {
  const ergebnis: number[] = [];
  for (const k of klopfMs) {
    const original = Math.round(k * tempo);
    let bester = original;
    let abstand = fangMs + 1;
    for (const e of einsatzMs) {
      const d = Math.abs(e - original);
      if (d < abstand) {
        abstand = d;
        bester = e;
      }
    }
    const vorher = ergebnis.at(-1) ?? -1;
    ergebnis.push(Math.max(bester, vorher + 1));
  }
  return ergebnis;
}
