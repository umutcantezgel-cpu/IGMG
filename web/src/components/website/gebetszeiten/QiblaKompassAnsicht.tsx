import type { ReactNode } from 'react';

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
  const drehung = kurs === null ? undefined : { transform: `rotate(${-kurs}deg)` };
  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div role="img" aria-label={texte.dialAria} className="relative size-60 rounded-full border-2 border-rand bg-papier">
        <div aria-hidden className="absolute inset-0 transition-transform duration-(--dauer-rueckmeldung)" style={drehung}>
          <span className="absolute top-2 left-1/2 -translate-x-1/2 font-bold text-tinte">{texte.dialNord}</span>
          <div className="absolute inset-0" style={{ transform: `rotate(${winkel}deg)` }}>
            <span className="absolute top-1/2 left-1/2 h-24 w-1 -translate-x-1/2 -translate-y-full rounded-sm bg-gruen-700" />
          </div>
        </div>
        <span aria-hidden className="absolute top-1/2 left-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-pill bg-gruen-950" />
        <span aria-hidden className="absolute bottom-5 left-1/2 -translate-x-1/2 text-20 font-bold text-gruen-800">
          {texte.winkelKurz}
        </span>
      </div>
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
