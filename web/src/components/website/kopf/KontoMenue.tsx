'use client';

import { ChevronDown } from 'lucide-react';
import { type MouseEvent, type ReactNode, useCallback, useId, useRef, useState } from 'react';
import { useAussenKlick } from './useAussenKlick';

/**
 * Kontoschaltfläche im Kopf der Konto-Seiten (ab 1240 px, Sichtabnahme X-1): Initiale und Vorname statt „Anmelden“,
 * darunter ein Aufklapp-Menü (Disclosure-Muster wie die Sprachwahl). Escape und Klick außerhalb schließen, Fokus zurück
 * auf den Knopf. Der Inhalt (Kopfzeile, „Mein Bereich“, Abmelden-Formular) kommt fertig vom Server; er bleibt beim
 * Schließen im DOM, damit das Formular nie mitten im Absenden verschwindet (MUSTER §4).
 */
export function KontoMenue({
  initiale,
  vorname,
  label,
  children,
}: {
  initiale: string;
  vorname: string;
  /** Zugänglicher Name nach dem sichtbaren Vornamen („Emre: Konto-Menü“, WCAG 2.5.3) */
  label: string;
  children: ReactNode;
}) {
  const [offen, setOffen] = useState(false);
  const wurzel = useRef<HTMLDivElement>(null);
  const knopf = useRef<HTMLButtonElement>(null);
  const id = useId();
  const schliessen = useCallback((fokus: boolean) => {
    setOffen(false);
    if (fokus) knopf.current?.focus();
  }, []);
  useAussenKlick(wurzel, offen, schliessen);
  // Ein Link im Menü führt weg: Menü zu (die Seite bleibt bei Next.js versteckt im DOM erhalten)
  const linkGeklickt = (e: MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('a')) setOffen(false);
  };
  return (
    <div ref={wurzel} className="relative">
      <button
        ref={knopf}
        type="button"
        aria-expanded={offen}
        aria-controls={id}
        aria-label={`${vorname}: ${label}`}
        onClick={() => setOffen((o) => !o)}
        className="inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-md border border-gruen-700 bg-weiss py-1 pr-3 pl-1.5 text-18 font-bold whitespace-nowrap text-gruen-800 transition duration-(--dauer-rueckmeldung) hover:bg-gruen-50 active:scale-98 motion-reduce:active:scale-100"
      >
        <span
          aria-hidden
          className="flex size-9 shrink-0 items-center justify-center rounded-pill bg-gruen-700 font-display text-18 leading-none text-weiss"
        >
          {initiale}
        </span>
        <span className="max-w-40 truncate">{vorname}</span>
        <ChevronDown
          aria-hidden
          className={`size-4 shrink-0 transition-transform duration-(--dauer-rueckmeldung) motion-reduce:transition-none ${offen ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        id={id}
        hidden={!offen}
        onClick={linkGeklickt}
        className="tritt-auf absolute top-full right-0 z-(--ebene-dialog) mt-3 w-75 rounded-lg border border-linie bg-weiss p-2 shadow-s2"
      >
        {children}
      </div>
    </div>
  );
}
