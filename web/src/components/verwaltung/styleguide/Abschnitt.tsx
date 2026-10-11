import type { ReactNode } from 'react';

/**
 * Abschnitt der Styleguide-Seite: Anker mit Abstand unter der Kopfzeile, Überschrift der Ebene 2, Einleitung.
 */
export function Abschnitt({ id, titel, einleitung, children }: { id: string; titel: string; einleitung?: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-titel`} className="flex scroll-mt-24 flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 id={`${id}-titel`} className="text-30 md:text-36">
          {titel}
        </h2>
        {einleitung ? <p className="max-w-text text-tinte-2">{einleitung}</p> : null}
      </div>
      {children}
    </section>
  );
}
