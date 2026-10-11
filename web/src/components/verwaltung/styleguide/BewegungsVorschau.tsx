'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Vorschau einer Bewegung: bewegt sich nur auf Knopfdruck, nie von selbst. Dauer und Kurve kommen aus der Klasse (Tokens).
 * Reduzierte Bewegung regelt globals.css (transition-duration 0,01 ms), die Komponente prüft sie nicht selbst.
 * Texte und Klassen kommen als Props; keine Funktionen aus der Server-Komponente.
 */
export function BewegungsVorschau({
  klasse,
  name,
  abspielen,
  zuruecksetzen,
}: {
  /** Tailwind-Klassen mit Dauer und Kurve, z. B. `duration-(--dauer-wechsel) ease-standard` */
  klasse: string;
  /** Token-Name, der in der Beschriftung des Knopfes für Hilfstechnik steht */
  name: string;
  abspielen: string;
  zuruecksetzen: string;
}) {
  const [amZiel, setAmZiel] = useState(false);
  const beschriftung = amZiel ? zuruecksetzen : abspielen;
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div aria-hidden="true" className="relative h-12 w-40 rounded-md bg-sand">
        <span
          className={cn(
            'absolute top-2 left-2 block size-8 rounded-sm bg-gruen-700 transition-transform',
            klasse,
            amZiel && 'translate-x-28',
          )}
        />
      </div>
      <button
        type="button"
        aria-label={`${beschriftung}: ${name}`}
        onClick={() => setAmZiel((an) => !an)}
        className="inline-flex min-h-12 items-center rounded-pill border border-rand bg-weiss px-5 font-bold text-tinte transition-colors duration-(--dauer-rueckmeldung) hover:border-gruen-700 hover:bg-gruen-50 active:scale-98"
      >
        {beschriftung}
      </button>
    </div>
  );
}
