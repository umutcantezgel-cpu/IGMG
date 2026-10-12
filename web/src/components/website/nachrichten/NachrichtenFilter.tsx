'use client';

import { Check } from 'lucide-react';
import { useState, type CSSProperties, type ReactNode } from 'react';
import { Zustandsgrafik } from '@/components/website/Zustandsgrafik';
import { klassen } from '@/lib/klassen';

/** Ein Filter-Chip. `schluessel` ist der Enum-Wert (wie data-kategorie und die CSS-Regeln); Anzahl und Zähltext kommen vom Server. */
export type NachrichtenFilterChip = { schluessel: string; label: string; anzahl: number; zaehl: string };

/**
 * Kategoriefilter der Nachrichtenliste (design/News.dc.html, Blatt S06): Chips mit aria-pressed. Karten anderer
 * Kategorien blendet die CSS-Regel per data-kategorie aus (globals.css). Ohne Treffer erscheint der Leerzustand
 * mit Zustandsgrafik, einem Satz und einem nächsten Schritt: „Alle“ im Filter, sonst der Weg zur Startseite (`leerSchritt`).
 * Texte und Zähler sind Props; die Liste bleibt statisch gerendert. Rechts der Chips steht die Trefferzahl des
 * aktiven Filters als Live-Region (aria-live): Sie wechselt beim Filtern und wird vorgelesen.
 * Unter „Alle“ zeigt `kinder` die Startform mit Aufmacher, für eine Kategorie `kinderGefiltert` (einheitliches Raster).
 */
export function NachrichtenFilter({
  kategorien,
  texte,
  leerSchritt,
  kinder,
  kinderGefiltert,
}: {
  kategorien: NachrichtenFilterChip[];
  texte: { gruppe: string; alle: string; leerTitel: string };
  /** Nächster Schritt, wenn ohne Filter gar keine Nachricht da ist (Server-Link, K-12). */
  leerSchritt: ReactNode;
  /** Liste unter „Alle“: Aufmacher, Begleitspalte und Rest. */
  kinder: ReactNode;
  /** Liste für eine einzelne Kategorie; fehlt sie, gilt `kinder`. */
  kinderGefiltert?: ReactNode;
}) {
  const [filter, setFilter] = useState('alle');
  /** Die neue Liste blendet erst nach einem Wechsel ein (B-04); beim ersten Laden steht sie sofort da. */
  const [gewechselt, setGewechselt] = useState(false);
  const aktiv = kategorien.find((k) => k.schluessel === filter);
  const treffer = aktiv?.anzahl ?? 0;

  function waehle(schluessel: string) {
    if (schluessel === filter) return;
    setGewechselt(true);
    setFilter(schluessel);
  }

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
                onClick={() => waehle(k.schluessel)}
                className={klassen(
                  'relative inline-flex min-h-12 cursor-pointer items-center gap-1.5 rounded-pill px-4.5 text-18 font-bold transition duration-(--dauer-rueckmeldung) active:scale-98',
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
        <p aria-live="polite" className="text-16 text-tinte-2">
          {aktiv?.zaehl ?? ''}
        </p>
      </div>
      {/* key: bei jedem Wechsel ein neues Element, damit die Überblendung erneut läuft */}
      <div
        key={filter}
        data-filter={filter}
        className={gewechselt ? 'blendet-ein' : undefined}
        style={{ '--dauer': 'var(--dauer-wechsel)' } as CSSProperties}
      >
        {treffer > 0 ? (
          filter === 'alle' ? (
            kinder
          ) : (
            (kinderGefiltert ?? kinder)
          )
        ) : (
          <div role="status" className="flex flex-col items-center gap-4 rounded-lg border border-linie bg-weiss px-6 py-12 text-center">
            <Zustandsgrafik art="leer" />
            <p className="max-w-text text-20 font-bold text-pretty">{texte.leerTitel}</p>
            {filter === 'alle' ? (
              leerSchritt
            ) : (
              <button
                type="button"
                onClick={() => waehle('alle')}
                className="inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-md border-2 border-gruen-700 bg-weiss px-5.5 font-bold text-gruen-800 transition duration-(--dauer-rueckmeldung) hover:bg-gruen-50 active:scale-98"
              >
                {texte.alle}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
