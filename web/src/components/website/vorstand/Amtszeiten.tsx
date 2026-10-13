import type { CSSProperties } from 'react';
import { Achtstern } from '@/components/website/Icons';
import { cn } from '@/lib/utils';
import { type AmtszeitQuelle, amtszeitenLinie } from './amtszeiten';

/**
 * Verbindungslinie der Vorsitzenden (AUFTRAG 4, Arbeitsansicht Vorstand; Formsystem K-008): eine durchgehende Linie vom
 * ersten Amtsbeginn bis heute, geteilt in die Amtszeiten (Länge nach Jahren, schmale Fuge an jedem Wechsel). Sie beginnt
 * in einem kleinen Achtstern und endet im gefüllten Achtstern „Heute“; die laufende Amtszeit ist kräftiger gezogen.
 * Darunter Anfangsjahr, volle Jahrzehnte (ab md) und „Heute“. Statisch, ohne Bewegung und ohne
 * JavaScript; reines Bild (`aria-hidden`), denn jede Amtszeit steht mit Jahren als Karte darunter.
 */
export function Amtszeiten({ liste, heuteJahr, heute }: { liste: readonly AmtszeitQuelle[]; heuteJahr: number; heute: string }) {
  const linie = amtszeitenLinie(liste, heuteJahr);
  if (!linie) return null;
  const lage = (anteil: number) => ({ left: `${anteil * 100}%` }) as CSSProperties;
  return (
    <div aria-hidden className="flex flex-col gap-1 px-6">
      <div className="relative h-8">
        {linie.abschnitte.map((a) => (
          <span
            key={`${a.von}-${a.bis}`}
            className="absolute top-1/2 -translate-y-1/2 px-0.5"
            style={{ ...lage(a.anfang), width: `${a.laenge * 100}%` }}
          >
            <span className={cn('block rounded-pill bg-gruen-700', a.aktuell ? 'h-2' : 'h-1')} />
          </span>
        ))}
        <Achtstern viewBox="3.5 3.5 17 17" className="absolute top-1/2 left-0 size-4 -translate-1/2 text-gruen-700" />
        <Achtstern viewBox="3.5 3.5 17 17" className="absolute top-1/2 left-full size-7 -translate-1/2 text-gruen-700" />
      </div>
      <div className="relative h-7 text-16 text-tinte-2">
        <span className="absolute top-0 left-0 -translate-x-1/2 font-bold text-gruen-800">{linie.start}</span>
        {linie.jahrzehnte.map((j) => (
          <span key={j.jahr} className="absolute top-0 hidden -translate-x-1/2 flex-col items-center md:flex" style={lage(j.lage)}>
            {j.jahr}
          </span>
        ))}
        <span className="absolute top-0 right-0 translate-x-1/2 font-bold text-gruen-800">{heute}</span>
      </div>
    </div>
  );
}
