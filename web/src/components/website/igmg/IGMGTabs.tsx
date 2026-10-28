'use client';

import { type CSSProperties, type KeyboardEvent, type ReactNode, useId, useRef, useState, useSyncExternalStore } from 'react';
import { klassen } from '@/lib/klassen';

/** Reiter mit fertig gerendertem Inhalt (serverseitig, damit alle Felder schon im HTML stehen). */
export type Reiter = { schluessel: string; label: string; inhalt: ReactNode };

/** Anker der Adresse ohne „#“ (Reiter per Link wählbar, z. B. /igmg#geschichte). */
function abonniereAnker(melden: () => void) {
  window.addEventListener('hashchange', melden);
  return () => window.removeEventListener('hashchange', melden);
}
const liesAnker = () => window.location.hash.slice(1);
/** Auf dem Server und beim Hydrieren gibt es keinen Anker: das HTML zeigt immer den Standardreiter. */
const keinAnker = () => '';

/**
 * Themen-Reiter der IGMG-Seite (design/IGMGInfo.dc.html, Blatt S12): Tab-Leiste nach WAI-ARIA mit role=tablist,
 * tab und tabpanel, aria-selected und aria-controls; Pfeiltasten sowie Pos1 und Ende verschieben den Fokus und
 * wählen den Reiter aus (automatische Aktivierung). Inaktive Felder tragen nur das hidden-Attribut.
 * Abweichung von Blatt INTERAKTIONEN 1 (Plan Marktstart P1, docs/ABWEICHUNGEN.md): Jeder Reiter ist per Anker
 * verlinkbar (#ueberblick, #bedeutung, …). Ein gültiger Anker in der Adresse wählt den Reiter; ein Wechsel ersetzt den
 * Anker per `history.replaceState` (kein neuer Verlaufseintrag, kein Sprung). Die Client-Insel bekommt nur Texte und
 * Inhalte als Props (K-12). Darstellung wie die Tab-Leiste der Gebetszeiten; der neue Inhalt blendet nach einem Wechsel
 * ein (B-04).
 */
export function IGMGTabs({ reiter, standard, beschriftung }: { reiter: Reiter[]; standard: string; beschriftung: string }) {
  const anker = useSyncExternalStore(abonniereAnker, liesAnker, keinAnker);
  const [gewaehlt, setGewaehlt] = useState(standard);
  // Ein gültiger Anker hat Vorrang; nach einem Klick stimmen Anker und Auswahl ohnehin überein
  const aktiv = reiter.some((r) => r.schluessel === anker) ? anker : gewaehlt;
  /** Der neue Inhalt blendet erst nach einem Wechsel ein (B-04); beim ersten Laden steht er sofort da. */
  const [gewechselt, setGewechselt] = useState(false);
  const id = useId();
  const knoepfe = useRef<(HTMLButtonElement | null)[]>([]);

  function zeige(ziel: string) {
    if (ziel === aktiv) return;
    setGewechselt(true);
    setGewaehlt(ziel);
    // Next.js übernimmt replaceState in seinen Router (node_modules/next/dist/docs, „Native History API“)
    window.history.replaceState(window.history.state, '', `#${ziel}`);
  }

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
    zeige(neu.schluessel);
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
              onClick={() => zeige(r.schluessel)}
              onKeyDown={(e) => tastenDruck(e, i)}
              className={klassen(
                'relative inline-flex min-h-12 druck cursor-pointer items-center rounded-md px-4.5 text-18 font-bold transition duration-(--dauer-rueckmeldung)',
                ist ? 'bg-weiss text-gruen-800 shadow-s1' : 'text-tinte hover:text-gruen-800',
              )}
            >
              {r.label}
              {ist ? <span aria-hidden className="absolute inset-x-3.5 bottom-1 h-0.75 rounded-sm bg-gruen-700" /> : null}
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
          className={r.schluessel === aktiv && gewechselt ? 'blendet-ein' : undefined}
          style={{ '--dauer': 'var(--dauer-wechsel)' } as CSSProperties}
        >
          {r.inhalt}
        </div>
      ))}
    </div>
  );
}
