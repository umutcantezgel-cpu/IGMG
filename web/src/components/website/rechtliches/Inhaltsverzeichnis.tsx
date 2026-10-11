'use client';

import { useEffect, useState } from 'react';
import { klassen } from '@/lib/klassen';

/** Ein Sprungziel: Kennung des Abschnitts (id am `section`) und sein sichtbarer Titel. */
export type InhaltsPunkt = { id: string; titel: string };

/**
 * Inhaltsverzeichnis der Rechtsseiten (Kern K-003, K-009): Sprünge auf die Abschnitte. Mobil eine ruhige Liste oben (eine
 * Fläche mit Trennlinien, keine Einzelknöpfe), ab lg eine Seitenleiste mit Markierung am aktiven Abschnitt.
 * Ohne JavaScript ist die Liste voll nutzbar. Mit JavaScript trägt der gerade gelesene Abschnitt
 * `aria-current="location"` (IntersectionObserver, ohne Abhängigkeit). Titel kommen als Props vom Aufrufer (K-02).
 */
export function Inhaltsverzeichnis({ punkte, titel, className }: { punkte: InhaltsPunkt[]; titel?: string; className?: string }) {
  const [aktiv, setAktiv] = useState<string | null>(null);
  const kennungen = punkte.map((p) => p.id).join(' ');

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const ids = kennungen.split(' ').filter(Boolean);
    const sichtbar = new Set<string>();
    // Leseband: die oberen 40 % des Fensters (rootMargin). Aktiv ist der Abschnitt, der darin am spätesten beginnt; der vorige
    // Abschnitt reicht bei Sprüngen (scroll-mt) oft noch hinein und soll nicht gewinnen.
    const beobachter = new IntersectionObserver(
      (eintraege) => {
        for (const e of eintraege) {
          if (e.isIntersecting) sichtbar.add(e.target.id);
          else sichtbar.delete(e.target.id);
        }
        const letzter = [...ids].reverse().find((id) => sichtbar.has(id));
        if (letzter) setAktiv(letzter);
      },
      { rootMargin: '0px 0px -60% 0px' },
    );
    for (const id of ids) {
      const ziel = document.getElementById(id);
      if (ziel) beobachter.observe(ziel);
    }
    return () => beobachter.disconnect();
  }, [kennungen]);

  return (
    <nav
      aria-label={titel}
      className={klassen('flex flex-col gap-3 rounded-lg border border-linie bg-weiss p-2 lg:border-0 lg:bg-transparent lg:p-0', className)}
    >
      {titel ? <p className="px-3 text-16 font-bold text-gruen-800">{titel}</p> : null}
      <ul className="flex flex-col divide-y divide-linie lg:gap-0.5 lg:divide-y-0 lg:border-s lg:border-linie">
        {punkte.map((p) => {
          const ist = p.id === aktiv;
          return (
            <li key={p.id}>
              <a
                href={`#${p.id}`}
                aria-current={ist ? 'location' : undefined}
                className={klassen(
                  'flex min-h-12 items-center rounded-md px-3 font-bold no-underline transition duration-(--dauer-rueckmeldung) hover:bg-gruen-50 hover:text-gruen-800 active:scale-98 lg:-ms-px lg:min-h-11 lg:rounded-s-none lg:border-s-2 lg:border-transparent',
                  ist ? 'bg-gruen-50 text-gruen-800 lg:border-gruen-700' : 'text-tinte-2',
                )}
              >
                {p.titel}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
