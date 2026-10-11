'use client';

import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useRef, useState } from 'react';
import Link from 'next/link';
import type { Bereich, Menue } from '../navigation';
import { useAussenKlick } from './useAussenKlick';

/**
 * Hauptnavigation am Desktop (ab 1240 px, Laufbuch D-04) nach design/Header.dc.html:
 * Aufklapp-Menüs (Disclosure-Muster), Escape und Klick außerhalb schließen, aktueller Bereich unterstrichen.
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
            className="relative inline-flex min-h-12 items-center rounded-md px-3 text-18 font-bold whitespace-nowrap text-tinte no-underline transition-colors hover:bg-gruen-50 hover:text-gruen-800"
          >
            <span>{startseite}</span>
            {aktiv === 'startseite' ? (
              <span aria-hidden className="absolute right-3 bottom-1 left-3 h-[3px] rounded-sm bg-gruen-700" />
            ) : null}
          </Link>
        </li>
        {menues.map((m) => {
          const ist = offen === m.schluessel;
          return (
            <li key={m.schluessel} className="relative">
              <button
                id={`menue-knopf-${m.schluessel}`}
                type="button"
                aria-expanded={ist}
                aria-controls={`menue-${m.schluessel}`}
                onClick={() => setOffen(ist ? null : m.schluessel)}
                className="relative inline-flex min-h-12 cursor-pointer items-center gap-1 rounded-md px-3 text-18 font-bold whitespace-nowrap text-tinte transition-colors hover:bg-gruen-50 hover:text-gruen-800"
              >
                <span>{m.label}</span>
                {ist ? <ChevronUp aria-hidden className="size-4" /> : <ChevronDown aria-hidden className="size-4" />}
                {aktiv === m.schluessel ? (
                  <span aria-hidden className="absolute right-3 bottom-1 left-3 h-[3px] rounded-sm bg-gruen-700" />
                ) : null}
              </button>
              <div
                id={`menue-${m.schluessel}`}
                hidden={!ist}
                className="absolute top-[calc(100%+12px)] left-0 z-60 w-[392px] rounded-lg border border-linie bg-weiss shadow-s2"
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
                          className="flex min-h-14 items-center gap-3 rounded-md px-3 py-2.5 text-tinte no-underline hover:bg-gruen-50 hover:text-tinte"
                        >
                          {p.logo ? (
                            <Image src={p.logo} alt="" width={32} height={32} className="size-8 shrink-0 rounded-sm border border-linie" />
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
