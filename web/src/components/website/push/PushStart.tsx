'use client';

import { lazy, Suspense, useState, type ReactNode } from 'react';
import type { PushTexte, PushThemaSchluessel } from './PushEinstellungen';

const PushEinstellungen = lazy(() => import('./PushEinstellungen').then((m) => ({ default: m.PushEinstellungen })));

/**
 * Einstieg „Erinnerung an die Gebetszeiten“ (ADR 0034): nur ein Knopf im ersten Code; die Einstellungen laden erst
 * nach dem Klick. Erscheint nur, wenn Push eingeschaltet und ein VAPID-Schlüssel gesetzt ist.
 */
export function PushStart({
  titel,
  einleitung,
  knopf,
  symbol,
  ...props
}: {
  titel: string;
  einleitung: string;
  knopf: string;
  symbol: ReactNode;
  texte: PushTexte;
  oeffentlich: string;
  themen: readonly PushThemaSchluessel[];
  gebete: Record<string, string>;
  sprache: 'de' | 'tr' | 'en';
}) {
  const [offen, setOffen] = useState(false);
  return (
    <section
      aria-labelledby="push-titel"
      className="flex flex-col gap-5 rounded-lg border border-linie bg-weiss p-5 shadow-s1 md:p-8 print:hidden"
    >
      <div className="flex max-w-text flex-col gap-2">
        <h2 id="push-titel" className="flex items-center gap-3 text-24">
          {symbol}
          {titel}
        </h2>
        <p className="text-18 leading-einleitung text-tinte-2">{einleitung}</p>
      </div>
      {offen ? (
        <Suspense fallback={<p className="min-h-12 text-tinte-2">{props.texte.laedt}</p>}>
          <PushEinstellungen {...props} />
        </Suspense>
      ) : (
        <button
          type="button"
          onClick={() => setOffen(true)}
          className="inline-flex min-h-12 cursor-pointer items-center self-start rounded-md border-2 border-gruen-700 bg-weiss px-5 font-bold text-gruen-800 transition duration-(--dauer-rueckmeldung) hover:bg-gruen-50 active:scale-98"
        >
          {knopf}
        </button>
      )}
    </section>
  );
}
