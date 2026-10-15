'use client';

import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import Link from 'next/link';
import type { Bereich, Menue } from '../navigation';
import { useAussenKlick } from './useAussenKlick';

/**
 * Hauptnavigation am Desktop (ab 1240 px, Laufbuch D-04) nach design/Header.dc.html:
 * Aufklapp-Menüs (Disclosure-Muster), Escape und Klick außerhalb schließen (Fokus zurück auf den Auslöser),
 * aktueller Bereich mit Farbe und Leiste. Öffnen mit `tritt-auf` (B-03), Schließen sofort.
 */
export function KopfMenues({
  menues,
  startHref,
  startseite,
  aktiv,
  aktuell,
  label,
  aktuelleSeiteText,
}: {
  menues: Menue[];
  startHref: string;
  startseite: string;
  aktiv: Bereich;
  aktuell: string;
  label: string;
  aktuelleSeiteText: string;
}) {
  const [offen, setOffen] = useState<string | null>(null);
  const wurzel = useRef<HTMLElement>(null);
  const schliessen = useCallback(
    (fokusZurueck: boolean) => {
      if (fokusZurueck && offen) document.getElementById(`menue-knopf-${offen}`)?.focus();
      setOffen(null);
    },
    [offen],
  );
  useAussenKlick(wurzel, offen !== null, schliessen);

  return (
    <nav ref={wurzel} aria-label={label} className="hidden min-w-0 flex-1 justify-center menu:flex">
      <ul className="flex items-center gap-1">
        <li className="relative">
          <Link
            href={startHref}
            aria-current={aktuell === 'startseite' ? 'page' : undefined}
            className={`relative inline-flex min-h-12 items-center rounded-md px-3 text-18 font-bold whitespace-nowrap no-underline transition duration-(--dauer-rueckmeldung) hover:bg-gruen-50 hover:text-gruen-800 ${aktiv === 'startseite' ? 'text-gruen-800' : 'text-tinte'}`}
          >
            <span>{startseite}</span>
            {aktiv === 'startseite' ? <span aria-hidden className="absolute inset-x-3 bottom-1 h-0.75 rounded-sm bg-gruen-700" /> : null}
          </Link>
        </li>
        {menues.map((m) => {
          const ist = offen === m.schluessel;
          const markiert = ist || aktiv === m.schluessel;
          return (
            <li key={m.schluessel} className="relative">
              <button
                id={`menue-knopf-${m.schluessel}`}
                type="button"
                aria-expanded={ist}
                aria-controls={`menue-${m.schluessel}`}
                onClick={() => setOffen(ist ? null : m.schluessel)}
                className={`relative inline-flex min-h-12 cursor-pointer items-center gap-1 rounded-md px-3 text-18 font-bold whitespace-nowrap transition duration-(--dauer-rueckmeldung) hover:bg-gruen-50 hover:text-gruen-800 active:scale-98 motion-reduce:active:scale-100 ${ist ? 'bg-gruen-50 text-gruen-800' : markiert ? 'text-gruen-800' : 'text-tinte'}`}
              >
                <span>{m.label}</span>
                {ist ? <ChevronUp aria-hidden className="size-4" /> : <ChevronDown aria-hidden className="size-4" />}
                {aktiv === m.schluessel ? (
                  <span aria-hidden className="absolute inset-x-3 bottom-1 h-0.75 rounded-sm bg-gruen-700" />
                ) : null}
              </button>
              <div
                id={`menue-${m.schluessel}`}
                hidden={!ist}
                className="tritt-auf absolute top-full left-0 z-(--ebene-dialog) mt-3 w-100 rounded-lg border border-linie bg-weiss shadow-s2"
              >
                <ul className="flex flex-col gap-0.5 p-2">
                  {m.punkte.map((p) => {
                    const istAktuell = aktuell === p.schluessel;
                    return (
                      <li key={p.schluessel}>
                        <Link
                          href={p.href}
                          aria-current={istAktuell ? 'page' : undefined}
                          onClick={() => setOffen(null)}
                          className={`flex min-h-14 items-center gap-3 rounded-md px-3 py-2.5 no-underline transition duration-(--dauer-rueckmeldung) ${istAktuell ? 'bg-gruen-100 text-gruen-800' : 'text-tinte hover:bg-gruen-50 hover:text-tinte'}`}
                        >
                          {p.logoBild ? (
                            // Attribute wie next/image, auf dem Server berechnet (Header.tsx): kein Bild-JavaScript im Browser
                            // eslint-disable-next-line @next/next/no-img-element
                            <img {...p.logoBild} alt="" className="size-8 shrink-0 rounded-sm border border-linie" />
                          ) : null}
                          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                            <span className="text-18 leading-snug font-bold">{p.label}</span>
                            <span className="text-16 leading-normal text-tinte-2">{p.beschreibung}</span>
                          </span>
                          {istAktuell ? (
                            <span className="flex text-gruen-700">
                              <Check aria-hidden className="size-5" />
                              <span className="sr-only">{aktuelleSeiteText}</span>
                            </span>
                          ) : null}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
