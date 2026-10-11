import { GEBETE, type Gebet, type Tageszeiten } from './typen';

/**
 * Geometrie des Tagesbogens (Startseite, Kern K-007 B-06): Die Sonne steigt zwischen Güneş und Akşam über den
 * Horizont, Imsak und Yatsı liegen darunter. Waagerecht verläuft die Uhrzeit von Imsak bis Yatsı, senkrecht eine
 * Kosinuskurve mit Nullstellen bei Güneş und Akşam. Reine Funktionen; die Zeiten bleiben unverändert (UNANTASTBAR),
 * sie werden nur abgebildet.
 */
export const BOGEN = { breite: 640, hoehe: 280, rand: 32, horizont: 188, hoch: 148, tief: 64 } as const;

export type BogenPunkt = { gebet: Gebet; x: number; y: number; minuten: number };

/** „HH:MM“ → Minuten seit Mitternacht. */
export function minutenAus(zeit: string): number {
  const [h, m] = zeit.split(':').map(Number);
  return h * 60 + m;
}

/** Höhe über dem Horizont (−1 … 1) zur Minute `t`; unter dem Horizont auf −1 begrenzt. */
function hoehe(t: number, aufgang: number, untergang: number): number {
  const mitte = (aufgang + untergang) / 2;
  const halbtag = Math.max(1, (untergang - aufgang) / 2);
  return Math.max(-1, Math.cos((Math.PI * (t - mitte)) / (2 * halbtag)));
}

export type Bogen = {
  /** SVG-Pfad des ganzen Tages (Imsak bis Yatsı). */
  pfad: string;
  punkte: BogenPunkt[];
  /** Punkt auf der Kurve zur Minute `t` seit Mitternacht des Tages (auf den Tag begrenzt). */
  punktZu: (t: number) => { x: number; y: number };
  /** SVG-Pfad von Imsak bis zur Minute `t` (leer vor Imsak). */
  pfadBis: (t: number) => string;
  /** Anteil des Tages bis zur Minute `t` (0 … 1). */
  anteil: (t: number) => number;
};

/** Bogen eines Tages aus seinen sechs Zeiten. `schritte` bestimmt die Glätte der Linie. */
export function tagesbogen(zeiten: Tageszeiten, schritte = 72): Bogen {
  const { breite, rand, horizont, hoch, tief } = BOGEN;
  const beginn = minutenAus(zeiten.imsak);
  const aufgang = minutenAus(zeiten.gunes);
  const untergang = minutenAus(zeiten.aksam);
  // Yatsı kann im Hochsommer nach Mitternacht liegen: dann zählt sie zum selben Bogen (+24 h)
  const nachMitternacht = (t: number) => (t < beginn ? t + 24 * 60 : t);
  const ende = Math.max(beginn + 1, nachMitternacht(minutenAus(zeiten.yatsi)));
  const begrenzt = (t: number) => Math.min(ende, Math.max(beginn, t));
  const anteil = (t: number) => (begrenzt(t) - beginn) / (ende - beginn);
  const punktZu = (t: number) => {
    const e = hoehe(begrenzt(t), aufgang, untergang);
    const x = rand + anteil(t) * (breite - 2 * rand);
    const y = horizont - (e >= 0 ? e * hoch : e * tief);
    return { x: runde(x), y: runde(y) };
  };
  const pfadZwischen = (von: number, bis: number) => {
    const n = Math.max(1, Math.round((schritte * (bis - von)) / (ende - beginn)));
    const teile: string[] = [];
    for (let i = 0; i <= n; i++) {
      const p = punktZu(von + ((bis - von) * i) / n);
      teile.push(`${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`);
    }
    return teile.join(' ');
  };
  const punkte = GEBETE.map((gebet) => {
    const minuten = nachMitternacht(minutenAus(zeiten[gebet]));
    return { gebet, minuten, ...punktZu(minuten) };
  });
  return {
    pfad: pfadZwischen(beginn, ende),
    punkte,
    punktZu,
    pfadBis: (t: number) => (t <= beginn ? '' : pfadZwischen(beginn, begrenzt(t))),
    anteil,
  };
}

function runde(n: number): number {
  return Math.round(n * 10) / 10;
}
