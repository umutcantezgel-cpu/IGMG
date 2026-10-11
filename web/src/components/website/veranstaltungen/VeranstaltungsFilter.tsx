'use client';

import { Check, Funnel } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { klassen } from '@/lib/klassen';
import { Leerzustand } from './Leerzustand';

/**
 * Kategorie-Filter der Veranstaltungsliste (Events.dc.html): blendet Karten per data-Attribut aus –
 * die Liste bleibt statisch gerendert, nur die Auswahl läuft im Browser. Leerzustand bei 0 Treffern.
 */
export function VeranstaltungsFilter({
  kategorien,
  zaehler,
  texte,
  kinder,
}: {
  kategorien: { schluessel: string; label: string }[];
  zaehler: Record<string, number>;
  texte: { gruppe: string; alle: string; kommend: string; leerTitel: string; leerText: string };
  kinder: ReactNode;
}) {
  const [filter, setFilter] = useState('alle');
  const treffer = filter === 'alle' ? zaehler.alle : (zaehler[filter] ?? 0);
  const chip = (schluessel: string, label: string) => {
    const an = filter === schluessel;
    return (
      <button
        key={schluessel}
        type="button"
        aria-pressed={an}
        onClick={() => setFilter(schluessel)}
        className={klassen(
          'inline-flex min-h-12 cursor-pointer items-center gap-1.5 rounded-pill px-4 text-18 font-bold transition-colors',
          an ? 'border-2 border-gruen-700 bg-gruen-700 text-weiss' : 'border border-rand bg-weiss text-tinte hover:bg-gruen-50',
        )}
      >
        <span>{label}</span>
        {an ? <Check aria-hidden className="size-4" /> : null}
      </button>
    );
  };
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div role="group" aria-label={texte.gruppe} className="flex flex-wrap gap-2">
          {chip('alle', texte.alle)}
          {kategorien.map((k) => chip(k.schluessel, k.label))}
        </div>
        <span className="inline-flex items-center gap-2 text-18 font-bold text-tinte-2">
          <Funnel aria-hidden className="size-5" />
          {texte.kommend}
        </span>
      </div>
      <div data-filter={filter}>
        {treffer > 0 ? (
          kinder
        ) : (
          <Leerzustand
            titel={texte.leerTitel}
            text={texte.leerText}
            aktion={
              <button
                type="button"
                onClick={() => setFilter('alle')}
                className="inline-flex min-h-12 cursor-pointer items-center rounded-md bg-gruen-700 px-6 font-bold text-weiss hover:bg-gruen-800"
              >
                {texte.alle}
              </button>
            }
          />
        )}
      </div>
    </div>
  );
}
