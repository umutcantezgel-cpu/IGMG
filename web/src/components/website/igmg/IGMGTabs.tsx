'use client';

import { type KeyboardEvent, type ReactNode, useId, useRef, useState } from 'react';
import { klassen } from '@/lib/klassen';

/** Reiter mit fertig gerendertem Inhalt (serverseitig, damit alle Felder schon im HTML stehen). */
export type Reiter = { schluessel: string; label: string; inhalt: ReactNode };

/**
 * Themen-Reiter der IGMG-Seite (design/IGMGInfo.dc.html, Blatt S12): Tab-Leiste nach WAI-ARIA mit role=tablist,
 * tab und tabpanel, aria-selected und aria-controls; Pfeiltasten sowie Pos1 und Ende verschieben den Fokus und
 * wählen den Reiter aus (automatische Aktivierung). Inaktive Felder tragen nur das hidden-Attribut.
 * Keine URL-Änderung (Blatt INTERAKTIONEN 1). Die Client-Insel bekommt nur Texte und Inhalte als Props (K-12).
 */
export function IGMGTabs({ reiter, standard, beschriftung }: { reiter: Reiter[]; standard: string; beschriftung: string }) {
  const [aktiv, setAktiv] = useState(standard);
  const id = useId();
  const knoepfe = useRef<(HTMLButtonElement | null)[]>([]);

  function tastenDruck(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    const letzte = reiter.length - 1;
    let ziel: number;
    switch (e.key) {
      case 'ArrowRight':
        ziel = index >= letzte ? 0 : index + 1;
        break;
      case 'ArrowLeft':
        ziel = index <= 0 ? letzte : index - 1;
        break;
      case 'Home':
        ziel = 0;
        break;
      case 'End':
        ziel = letzte;
        break;
      default:
        return;
    }
    e.preventDefault();
    const neu = reiter[ziel];
    if (!neu) return;
    setAktiv(neu.schluessel);
    knoepfe.current[ziel]?.focus();
  }

  return (
    <div className="flex flex-col gap-6">
      <div
        role="tablist"
        aria-label={beschriftung}
        className="flex max-w-full flex-wrap gap-1 self-start rounded-lg border border-linie bg-sand p-1"
      >
        {reiter.map((r, i) => {
          const ist = r.schluessel === aktiv;
          return (
            <button
              key={r.schluessel}
              ref={(el) => {
                knoepfe.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`${id}-reiter-${r.schluessel}`}
              aria-selected={ist}
              aria-controls={`${id}-feld-${r.schluessel}`}
              tabIndex={ist ? 0 : -1}
              onClick={() => setAktiv(r.schluessel)}
              onKeyDown={(e) => tastenDruck(e, i)}
              className={klassen(
                'relative inline-flex min-h-12 items-center rounded-md px-[18px] text-18 font-bold transition-colors duration-150 motion-reduce:transition-none',
                ist ? 'bg-weiss text-gruen-800 shadow-s1' : 'text-tinte hover:text-gruen-800',
              )}
            >
              {r.label}
              {ist ? <span aria-hidden className="absolute inset-x-3.5 bottom-1 h-[3px] rounded-[2px] bg-gruen-700" /> : null}
            </button>
          );
        })}
      </div>
      {reiter.map((r) => (
        <div
          key={r.schluessel}
          id={`${id}-feld-${r.schluessel}`}
          role="tabpanel"
          aria-labelledby={`${id}-reiter-${r.schluessel}`}
          hidden={r.schluessel !== aktiv}
        >
          {r.inhalt}
        </div>
      ))}
    </div>
  );
}
