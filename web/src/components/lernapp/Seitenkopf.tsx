import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';

/**
 * Kopf einer Lern-App-Seite: optional ein Rückweg (Pfeil spiegelt sich in `rtl`), Titel, Einleitung. Der Titel ist die
 * einzige Überschrift erster Ordnung der Seite.
 */
export function Seitenkopf({
  titel,
  einleitung,
  zurueck,
  zusatz,
}: {
  titel: ReactNode;
  einleitung?: ReactNode;
  zurueck?: { adresse: string; text: string };
  zusatz?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-start gap-3 pb-8">
      {zurueck ? (
        <a href={zurueck.adresse} className="inline-flex min-h-11 items-center gap-2 font-bold underline-offset-4 hover:underline">
          <ArrowLeft aria-hidden className="size-5 shrink-0 rtl:rotate-180" />
          {zurueck.text}
        </a>
      ) : null}
      <h1 className="text-display-1 text-pretty">{titel}</h1>
      {einleitung ? <p className="max-w-einleitung text-20 leading-einleitung text-pretty text-tinte-2">{einleitung}</p> : null}
      {zusatz}
    </div>
  );
}
