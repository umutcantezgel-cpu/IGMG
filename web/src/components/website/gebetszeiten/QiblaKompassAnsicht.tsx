import type { ReactNode } from 'react';
import { Achtstern } from '@/components/website/Icons';
import { klassen } from '@/lib/klassen';

/** Texte kommen als Props aus der Server-Komponente QiblaPanel (K-12: kein next-intl im Browser). */
export type QiblaKompassTexte = {
  dialAria: string;
  dialNord: string;
  winkelKurz: string;
  aktivieren: string;
  beenden: string;
  hinweis: string;
  startet: string;
  aktiv: string;
  verweigert: string;
  fehlt: string;
};

/** Teilstriche: Himmelsrichtungen (N, O, S, W) im 2-px-Strich, Zwischenrichtungen kürzer und heller. */
const HAUPT = [0, 90, 180, 270];
const NEBEN = [45, 135, 225, 315];

/**
 * Zifferblatt der Qibla-Richtung (Sichtabnahme Z-04, G-2; gemeinsam für Tab „Qibla“ und „Mein Ort“): Kreis mit
 * Teilstrichen der vier Himmelsrichtungen im 2-px-Strich, „N“ oben, die Nadel endet in einem Achtstern als Zielmarke,
 * die Gradzahl steht im Kreis. `kurs` dreht das Blatt nach Norden (Kompass aktiv); `nadelWinkel` ist die gezeigte
 * Richtung der Nadel (Mein Ort lässt sie einmal von Norden zur Richtung drehen, B-21). Ohne Zustand, Server und Browser.
 */
export function QiblaZifferblatt({
  nadelWinkel,
  nord,
  grad,
  aria,
  kurs = null,
  nadelDreht = false,
  klein = false,
}: {
  nadelWinkel: number;
  /** Beschriftung oben („N“, tr „K“) */
  nord: string;
  /** Gradzahl im Kreis, fertig formatiert („128°“) */
  grad: string;
  aria: string;
  kurs?: number | null;
  /** Nadel dreht sanft zum neuen Winkel (Mein Ort, B-21) */
  nadelDreht?: boolean;
  /** 224 statt 240 px (Mein Ort neben der Tabelle) */
  klein?: boolean;
}) {
  const drehung = kurs === null ? undefined : { transform: `rotate(${-kurs}deg)` };
  return (
    <div
      role="img"
      aria-label={aria}
      className={klassen('relative shrink-0 overflow-hidden rounded-full border-2 border-rand bg-papier', klein ? 'size-56' : 'size-60')}
    >
      <div aria-hidden className="absolute inset-0 transition-transform duration-(--dauer-rueckmeldung)" style={drehung}>
        <svg viewBox="0 0 240 240" className="absolute inset-0 size-full overflow-visible">
          {HAUPT.map((w) => (
            <line
              key={w}
              x1="120"
              y1="6"
              x2="120"
              y2="20"
              transform={`rotate(${w} 120 120)`}
              vectorEffect="non-scaling-stroke"
              strokeWidth="2"
              strokeLinecap="round"
              className="stroke-tinte-2"
            />
          ))}
          {NEBEN.map((w) => (
            <line
              key={w}
              x1="120"
              y1="8"
              x2="120"
              y2="14"
              transform={`rotate(${w} 120 120)`}
              vectorEffect="non-scaling-stroke"
              strokeWidth="2"
              strokeLinecap="round"
              className="stroke-rand"
            />
          ))}
        </svg>
        <span className="absolute top-6 left-1/2 -translate-x-1/2 text-16 leading-none font-bold text-tinte">{nord}</span>
        <div
          className={klassen(
            'absolute inset-0',
            nadelDreht && 'transition-transform duration-(--dauer-moment) ease-(--ease-eintritt) motion-reduce:transition-none',
          )}
          style={{ transform: `rotate(${nadelWinkel}deg)` }}
        >
          <span className="absolute top-14 bottom-1/2 left-1/2 w-0.5 -translate-x-1/2 bg-gruen-700" />
          <Achtstern viewBox="3.5 3.5 17 17" className="absolute top-6 left-1/2 size-8 -translate-x-1/2 text-gruen-700" />
        </div>
      </div>
      <span aria-hidden className="absolute top-1/2 left-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-pill bg-gruen-950" />
      <span aria-hidden className="absolute bottom-7 left-1/2 -translate-x-1/2 text-20 leading-none font-bold text-gruen-800 tabular-nums">
        {grad}
      </span>
    </div>
  );
}

/**
 * Darstellung des Qibla-Kompasses ohne eigenen Zustand: Zifferblatt mit fester Richtung, Knopf, Hinweis und Status.
 * Der Server zeigt sie als Vorschau im Zustand „aus“ (ohne Browser-Code), der Kompass im Browser mit Zustand
 * (QiblaKompass). Beide nutzen dieselbe Darstellung, deshalb springt beim Wechsel nichts.
 */
export function QiblaKompassAnsicht({
  winkel,
  texte,
  symbol,
  kurs = null,
  knopfText,
  knopfZeigen = true,
  knopfGesperrt = false,
  onKnopf,
  hinweisZeigen,
  statusText,
  fehler,
}: {
  winkel: number;
  texte: QiblaKompassTexte;
  /** Symbol im Knopf, auf dem Server gerendert (lucide `Compass`). */
  symbol: ReactNode;
  /** Kurs des Geräts in Grad; dreht das Zifferblatt nach Norden. */
  kurs?: number | null;
  knopfText: string;
  knopfZeigen?: boolean;
  knopfGesperrt?: boolean;
  onKnopf?: () => void;
  hinweisZeigen: boolean;
  statusText: string;
  /** Zustandsgrafik im Fehlerfall. */
  fehler?: ReactNode;
}) {
  return (
    <div className="flex w-full flex-col items-center gap-4">
      <QiblaZifferblatt nadelWinkel={winkel} kurs={kurs} nord={texte.dialNord} grad={texte.winkelKurz} aria={texte.dialAria} />
      {knopfZeigen ? (
        <button
          type="button"
          onClick={onKnopf}
          disabled={knopfGesperrt}
          className="inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-md border-2 border-gruen-700 bg-weiss px-5 font-bold text-gruen-800 transition duration-(--dauer-rueckmeldung) hover:bg-gruen-50 active:scale-98 disabled:cursor-wait disabled:opacity-60"
        >
          {symbol}
          <span>{knopfText}</span>
        </button>
      ) : null}
      {hinweisZeigen ? <p className="max-w-text text-16 leading-normal text-tinte-2">{texte.hinweis}</p> : null}
      {fehler}
      <p role="status" className="min-h-12 max-w-text text-16 leading-normal text-tinte">
        {statusText}
      </p>
    </div>
  );
}
