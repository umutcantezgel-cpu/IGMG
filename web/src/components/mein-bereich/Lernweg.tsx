import { Check } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';
import type { FortschrittStatus } from '@/lib/lernen/ansicht';
import { cn } from '@/lib/utils';

export type LernwegStationAnsicht = {
  schluessel: string;
  nr: number;
  titel: string;
  /** Sprache des Titels, wenn er auf Deutsch zurückfällt. */
  titelLang?: string;
  status: FortschrittStatus | null;
  statusText: string;
};

/** Achtstern (24er-Raster, wie `Icons.tsx`), hier als Umriss mit Fläche je Zustand. */
const STERN = 'M12 3.5 14.5 6H18v3.5l2.5 2.5-2.5 2.5V18h-3.5L12 20.5 9.5 18H6v-3.5L3.5 12 6 9.5V6h3.5z';

function Marke({ s, i, aktuell, anzahl }: { s: LernwegStationAnsicht; i: number; aktuell: number; anzahl: number }) {
  const erreicht = i < aktuell || (i === aktuell && s.status === 'abgeschlossen');
  const hier = i === aktuell;
  return (
    <span
      aria-hidden
      className={cn('relative flex size-12 shrink-0 items-center justify-center', i <= aktuell && anzahl > 0 && 'lernweg-station')}
      style={{ '--i': i } as CSSProperties}
    >
      <svg viewBox="3 3 18 18" className="absolute inset-0 size-full overflow-visible">
        <path
          d={STERN}
          vectorEffect="non-scaling-stroke"
          strokeWidth={2}
          strokeLinejoin="round"
          className={cn(erreicht ? 'fill-gruen-700 stroke-gruen-700' : hier ? 'fill-gruen-50 stroke-gruen-700' : 'fill-weiss stroke-rand')}
        />
      </svg>
      {erreicht ? (
        <Check className="relative size-5 text-weiss" strokeWidth={2.5} />
      ) : (
        <span className={cn('relative text-18 font-bold tabular-nums', hier ? 'text-gruen-800' : 'text-tinte-2')}>{s.nr}</span>
      )}
    </span>
  );
}

/**
 * Lernweg (Bewegungsregister B-24): Achtstern-Stationen an einer Linie, die sich beim ersten Bild bis zur aktuellen
 * Station zeichnet; jede erreichte Station tritt hervor, wenn die Linie sie erreicht. Der Rest des Weges liegt ruhig
 * grau daneben. Nur CSS (`lernweg-*` in globals.css), bei reduzierter Bewegung steht der Endzustand sofort.
 * Telefon: senkrecht mit Titeln; ab md (bis 8 Stationen) waagerecht, der Titel der aktuellen Station darunter.
 */
export function Lernweg({
  stationen,
  aktuell,
  listenLabel,
  jetztText,
  stationText,
  zusatz,
}: {
  stationen: LernwegStationAnsicht[];
  aktuell: number;
  listenLabel: string;
  jetztText: string;
  /** „Station {nr}“ bzw. „Stufe {nr}“ – fertig gefüllt je Station. */
  stationText: (nr: number) => string;
  zusatz?: ReactNode;
}) {
  const anzahl = stationen.length;
  const n = Math.max(aktuell, 0);
  const waagerecht = anzahl <= 8;
  const breite = anzahl * 100;
  const hier = stationen[aktuell];
  return (
    <div className="flex flex-col gap-5" style={{ '--n': Math.max(n, 1) } as CSSProperties}>
      {/* Senkrecht (Telefon) */}
      <ol aria-label={listenLabel} className={cn('flex flex-col', waagerecht && 'md:hidden')}>
        {stationen.map((s, i) => (
          <li key={s.schluessel} aria-current={i === aktuell ? 'step' : undefined} className="flex gap-4">
            <div className="flex shrink-0 flex-col items-center">
              <Marke s={s} i={i} aktuell={aktuell} anzahl={n} />
              {i < anzahl - 1 ? (
                <span
                  aria-hidden
                  className={cn('-my-1 min-h-6 w-0.5 flex-1', i < aktuell ? 'lernweg-abschnitt bg-gruen-700' : 'bg-linie')}
                  style={{ '--i': i } as CSSProperties}
                />
              ) : null}
            </div>
            {i === aktuell ? (
              <div className={cn('flex min-w-0 flex-1 flex-col gap-0.5 pt-2.5', i < anzahl - 1 ? 'pb-5' : 'pb-0')}>
                <span className="text-16 font-bold text-gruen-800">{stationText(s.nr)}</span>
                <span lang={s.titelLang} className="text-18 font-bold text-pretty text-tinte">
                  {s.titel}
                </span>
                <span className="text-16 text-tinte-2">{s.statusText}</span>
                <span className="mt-1 self-start rounded-pill bg-gruen-50 px-3 py-0.5 text-16 font-bold text-gruen-800">{jetztText}</span>
              </div>
            ) : (
              // Übrige Stationen in einer Zeile (Telefon: kurzer Weg); der Titel bleibt für Screenreader
              <div className={cn('flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2 pt-3', i < anzahl - 1 ? 'pb-4' : 'pb-0')}>
                <span className={cn('text-16 font-bold', i < aktuell ? 'text-gruen-800' : 'text-tinte-2')}>{stationText(s.nr)}</span>
                <span className="text-16 text-tinte-2">{s.statusText}</span>
                <span lang={s.titelLang} className="sr-only">
                  {s.titel}
                </span>
              </div>
            )}
          </li>
        ))}
      </ol>

      {/* Waagerecht (ab md) */}
      {waagerecht ? (
        <div className="relative hidden md:block">
          <svg
            aria-hidden
            viewBox={`0 0 ${breite} 24`}
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-x-0 top-3 h-6 w-full"
          >
            <path d={`M50 12H${breite - 50}`} className="stroke-linie" strokeWidth={2} strokeLinecap="round" fill="none" />
            {aktuell > 0 ? (
              <path
                d={`M50 12H${aktuell * 100 + 50}`}
                pathLength={1}
                className="lernweg-welle stroke-gruen-700"
                strokeWidth={2}
                strokeLinecap="round"
                fill="none"
              />
            ) : null}
          </svg>
          <ol aria-label={listenLabel} className="relative grid" style={{ gridTemplateColumns: `repeat(${anzahl}, minmax(0, 1fr))` }}>
            {stationen.map((s, i) => (
              <li
                key={s.schluessel}
                aria-current={i === aktuell ? 'step' : undefined}
                className="flex flex-col items-center gap-2 px-1 text-center"
              >
                <Marke s={s} i={i} aktuell={aktuell} anzahl={n} />
                <span className={cn('text-16 font-bold', i <= aktuell ? 'text-gruen-800' : 'text-tinte-2')}>{stationText(s.nr)}</span>
                <span className="text-16 leading-snug text-tinte-2">{s.statusText}</span>
                <span className="sr-only" lang={s.titelLang}>
                  {s.titel}
                </span>
              </li>
            ))}
          </ol>
          {hier ? (
            <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md bg-gruen-50 px-4 py-3">
              <span className="rounded-pill bg-weiss px-3 py-0.5 text-16 font-bold text-gruen-800">{jetztText}</span>
              <span lang={hier.titelLang} className="font-bold text-tinte">
                {hier.titel}
              </span>
            </div>
          ) : null}
        </div>
      ) : null}
      {zusatz}
    </div>
  );
}
