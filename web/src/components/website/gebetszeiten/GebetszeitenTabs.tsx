'use client';

import { useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react';
import { klassen } from '@/lib/klassen';

export type TabSchluessel = 'heute' | 'monat' | 'qibla' | 'einstellungen';

const REIHENFOLGE: TabSchluessel[] = ['heute', 'monat', 'qibla', 'einstellungen'];

/**
 * Tab-Leiste der Gebetszeiten (design/PrayerTimes.dc.html, Blatt S02). Nach dem WAI-ARIA-Muster „Tabs“:
 * Pfeiltasten wechseln den Tab, Pos1 und Ende springen an Anfang und Ende. Alle Panels sind bereits im
 * HTML; die inaktiven tragen `hidden`. Texte, Symbole und Panels kommen als Props (K-12); die Symbole rendert der
 * Server, damit lucide nicht im Browser-Code liegt (H-L01, JS ≤ 180 kB gz).
 */
export function GebetszeitenTabs({
  ansichtAria,
  labels,
  symbole,
  panels,
}: {
  ansichtAria: string;
  labels: Record<TabSchluessel, string>;
  symbole: Record<TabSchluessel, ReactNode>;
  panels: Record<TabSchluessel, ReactNode>;
}) {
  const [aktiv, setAktiv] = useState<TabSchluessel>('heute');
  /** Der neue Inhalt blendet erst nach einem Wechsel ein (B-04); beim ersten Laden steht er sofort da. */
  const [gewechselt, setGewechselt] = useState(false);
  const knoepfe = useRef<Partial<Record<TabSchluessel, HTMLButtonElement | null>>>({});

  function zeige(ziel: TabSchluessel) {
    if (ziel === aktiv) return;
    setGewechselt(true);
    setAktiv(ziel);
  }

  function wechsle(ziel: TabSchluessel) {
    zeige(ziel);
    knoepfe.current[ziel]?.focus();
  }

  function tastatur(e: KeyboardEvent<HTMLDivElement>) {
    const position = REIHENFOLGE.indexOf(aktiv);
    const letzte = REIHENFOLGE.length - 1;
    let neu: number | null = null;
    if (e.key === 'ArrowRight') neu = position === letzte ? 0 : position + 1;
    else if (e.key === 'ArrowLeft') neu = position === 0 ? letzte : position - 1;
    else if (e.key === 'Home') neu = 0;
    else if (e.key === 'End') neu = letzte;
    if (neu === null) return;
    e.preventDefault();
    wechsle(REIHENFOLGE[neu]);
  }

  return (
    <div className="flex flex-col gap-6">
      <div
        role="tablist"
        aria-label={ansichtAria}
        onKeyDown={tastatur}
        className="flex max-w-full flex-wrap gap-1 self-start rounded-lg border border-linie bg-sand p-1"
      >
        {REIHENFOLGE.map((s) => {
          const on = s === aktiv;
          return (
            <button
              key={s}
              ref={(el) => {
                knoepfe.current[s] = el;
              }}
              type="button"
              role="tab"
              id={`gz-tab-${s}`}
              aria-selected={on}
              aria-controls={`gz-panel-${s}`}
              tabIndex={on ? 0 : -1}
              onClick={() => zeige(s)}
              className={klassen(
                'relative inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-md px-4.5 text-18 font-bold transition duration-(--dauer-rueckmeldung) active:scale-98',
                on ? 'bg-weiss text-gruen-800 shadow-s1' : 'text-tinte hover:text-gruen-800',
              )}
            >
              {symbole[s]}
              <span>{labels[s]}</span>
              {on ? <span aria-hidden className="absolute inset-x-3.5 bottom-1 h-0.75 rounded-sm bg-gruen-700" /> : null}
            </button>
          );
        })}
      </div>
      {REIHENFOLGE.map((s) => (
        <div
          key={s}
          role="tabpanel"
          id={`gz-panel-${s}`}
          aria-labelledby={`gz-tab-${s}`}
          hidden={s !== aktiv}
          className={s === aktiv && gewechselt ? 'blendet-ein' : undefined}
          style={{ '--dauer': 'var(--dauer-wechsel)' } as CSSProperties}
        >
          {panels[s]}
        </div>
      ))}
    </div>
  );
}
