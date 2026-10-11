import type { ReactNode } from 'react';
import { Zustandsgrafik } from '@/components/website/Zustandsgrafik';

/**
 * Leerzustand der Suche (REFERENZ §2): Zustandsgrafik „leer“, ein Satz, bei Treffermangel die nächsten Wege.
 * `status` macht den Satz zur Ansage (aria-live an der Überschrift, nicht an der Karte – sonst würden Grafik und Links
 * mit angesagt), wenn die Suche ohne Treffer endet. Der Satz ist eine Überschrift Ebene 2 (wie bisher;
 * tests/e2e/suche.spec.ts erwartet sie dort), mit Textschrift und normalem Gewicht statt Display-Schrift.
 */
export function SucheLeer({ text, kinder, status = false }: { text: string; kinder?: ReactNode; status?: boolean }) {
  return (
    <div className="flex w-full max-w-text flex-col items-center gap-4 rounded-lg border border-linie bg-weiss px-4 py-10 text-center sm:px-6 sm:py-12">
      <Zustandsgrafik art="leer" />
      <h2
        aria-live={status ? 'polite' : undefined}
        className="max-w-text font-text text-20 leading-einleitung font-normal tracking-normal text-pretty text-tinte-2"
      >
        {text}
      </h2>
      {kinder ? <div className="mt-2 w-full sm:w-auto">{kinder}</div> : null}
    </div>
  );
}
