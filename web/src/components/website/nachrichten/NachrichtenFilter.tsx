'use client';

import { Check, Funnel, MessageSquare } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { klassen } from '@/lib/klassen';

/** Ein Filter-Chip. `schluessel` ist der Enum-Wert (wie data-kategorie und die CSS-Regeln); Anzahl und Zähltext kommen vom Server. */
export type NachrichtenFilterChip = { schluessel: string; label: string; anzahl: number; zaehl: string };

/**
 * Kategoriefilter der Nachrichtenliste (design/News.dc.html, Blatt S06): Chips mit aria-pressed. Karten anderer
 * Kategorien blendet die CSS-Regel per data-kategorie aus (globals.css). Ohne Treffer erscheint der Leerzustand
 * (state=leer) mit der Schaltfläche „Alle“. Texte und Zähler sind Props; die Liste bleibt statisch gerendert.
 */
export function NachrichtenFilter({
  kategorien,
  texte,
  kinder,
}: {
  kategorien: NachrichtenFilterChip[];
  texte: { gruppe: string; neueste: string; alle: string; leerTitel: string; leerText: string };
  kinder: ReactNode;
}) {
  const [filter, setFilter] = useState('alle');
  const treffer = kategorien.find((k) => k.schluessel === filter)?.anzahl ?? 0;
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div role="group" aria-label={texte.gruppe} className="flex flex-wrap gap-2">
          {kategorien.map((k) => {
            const an = filter === k.schluessel;
            return (
              <button
                key={k.schluessel}
                type="button"
                aria-pressed={an}
                onClick={() => setFilter(k.schluessel)}
                className={klassen(
                  'relative inline-flex min-h-12 cursor-pointer items-center gap-1.5 rounded-pill px-[18px] text-18 font-bold transition-colors',
                  an
                    ? 'border-2 border-gruen-700 bg-gruen-700 text-weiss'
                    : 'border border-rand bg-weiss text-tinte hover:border-gruen-700',
                )}
              >
                <span>{k.label}</span>
                <span className="sr-only">{` ${k.zaehl}`}</span>
                {an ? <Check aria-hidden className="size-4" /> : null}
              </button>
            );
          })}
        </div>
        <span className="inline-flex items-center gap-2 text-18 font-bold text-tinte-2">
          <Funnel aria-hidden className="size-5" />
          {texte.neueste}
        </span>
      </div>
      <div data-filter={filter}>
        {treffer > 0 ? (
          kinder
        ) : (
          <div
            role="status"
            className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-rand bg-weiss px-6 py-16 text-center"
          >
            <span className="flex size-16 items-center justify-center rounded-pill bg-sand text-tinte-2">
              <MessageSquare aria-hidden className="size-8" />
            </span>
            <h2 className="text-30">{texte.leerTitel}</h2>
            <p className="max-w-[52ch] text-tinte-2">{texte.leerText}</p>
            <button
              type="button"
              onClick={() => setFilter('alle')}
              className="inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-md border-2 border-gruen-700 bg-weiss px-[22px] font-bold text-gruen-800 hover:bg-gruen-50"
            >
              {texte.alle}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
